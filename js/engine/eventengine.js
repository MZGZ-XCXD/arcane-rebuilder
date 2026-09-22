/* 随机事件引擎 + 临时效果（增益/减益）管理 */
(function () {
    let effectSeq = 1;

    function buff(state, name, days, effect, desc, opts) {
        opts = opts || {};
        state.activeEffects = state.activeEffects.filter(x => x.name !== name);
        state.activeEffects.push({
            id: 'eff' + (effectSeq++),
            name: name,
            desc: desc || '',
            effect: effect,
            remain: days,
            total: days,
            mood: !!opts.mood,
        });
    }

    function tickEffects(state, dt) {
        if (!state.activeEffects.length) return;
        const expired = [];
        state.activeEffects = state.activeEffects.filter(ae => {
            ae.remain -= dt;
            if (ae.remain <= 0) { expired.push(ae); return false; }
            return true;
        });
        for (const ae of expired) {
            if (!ae.mood) addLog(state, '「' + ae.name + '」的效果已经结束。');
        }
    }

    function addLog(state, text) {
        state.eventLogs.unshift({ day: state.gameDays, text: text });
        if (state.eventLogs.length > 60) state.eventLogs.pop();
    }

    /* 事件中可用的操作接口 */
    function makeApi(state) {
        return {
            state: state,
            rnd: () => Math.random(),
            log: t => addLog(state, t),
            has: (res, amount) => ResourcesManager.amount(res) >= (amount === undefined ? 1 : amount),
            give: map => { ResourcesManager.add(map); },
            take: map => {
                for (const k in map) {
                    const r = state.resources[k];
                    if (!r) continue;
                    r.amount = Math.max(0, r.amount - map[k]);
                }
            },
            happy: (v, days) => buff(state, v >= 0 ? '民心振奋' : '民心低落', days || 720, { happiness: v }, '事件带来的民望变化', { mood: true }),
            buff: (name, label, days, effect, desc) => buff(state, label, days, effect, desc),
            artifact: tier => {
                const a = Artifacts.generate(state, tier || 3);
                Artifacts.addToInventory(state, a);
                return a;
            },
        };
    }

    function availableEvents(state) {
        const out = [];
        for (const ev of EVENTS_CONFIG) {
            if (state.gameDays < ev.minDay) continue;
            if (ev.once && state.stats['ev_' + ev.id]) continue;
            let ok = true;
            try { ok = ev.require(state); } catch (e) { ok = false; }
            if (ok) out.push(ev);
        }
        return out;
    }

    function scheduleNext(state) {
        state.nextEventDay = state.gameDays + Utils.rnd(200, 460);
    }

    function tick(state, dt) {
        tickEffects(state, dt);
        if (state.pendingEvent) return;
        if (state.gameDays < state.nextEventDay) return;
        const pool = availableEvents(state);
        if (!pool.length) { scheduleNext(state); return; }
        const ev = Utils.weightedPick(pool, e => e.weight);
        if (!ev) { scheduleNext(state); return; }
        state.pendingEvent = ev.id;
        state.stats.events++;
        scheduleNext(state);
    }

    function current(state) {
        if (!state.pendingEvent) return null;
        return EVENTS_CONFIG.find(e => e.id === state.pendingEvent) || null;
    }

    function resolve(state, index) {
        const ev = current(state);
        if (!ev) return null;
        const choice = ev.choices[index];
        if (!choice) return null;
        const api = makeApi(state);
        try { choice.run(api); } catch (err) { console.error('事件执行出错', err); }
        state.stats['ev_' + ev.id] = true;
        state.pendingEvent = null;
        addLog(state, '【' + ev.title + '】你选择了：' + choice.text);
        ProductionEngine.computeProductionAndCaps(state);
        ProductionEngine.updatePrices(state);
        return choice;
    }

    window.EventEngine = { tick, tickEffects, buff, addLog, current, resolve, availableEvents, scheduleNext };
})();
