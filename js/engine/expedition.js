/* =========================================================
   遗迹远征：派出队伍 → 等待若干游戏日 → 按军力判定成败
   ========================================================= */
(function () {
    function findRegion(name) { return EXPEDITIONS_CONFIG.find(r => r.name === name); }

    function successChance(state, region) {
        const power = state.localResources.power.amount * (1 + EffectsManager.additive(state, 'expeditionPower'));
        const ratio = power / Math.max(1, region.power);
        return Utils.clamp(0.25 + 0.45 * Math.log10(1 + ratio * 3), 0.05, 0.98);
    }

    function canStart(state, region) {
        if (state.expedition.active) return { ok: false, msg: '远征队仍在外面。' };
        if (!ResourcesManager.canAfford(region.cost)) return { ok: false, msg: '物资不足。', lack: ResourcesManager.missing(region.cost) };
        return { ok: true };
    }

    function start(state, name) {
        const region = findRegion(name);
        if (!region) return { ok: false, msg: '未知区域。' };
        const check = canStart(state, region);
        if (!check.ok) return check;
        ResourcesManager.spend(region.cost);
        state.expedition.active = {
            region: name,
            startDay: state.gameDays,
            endDay: state.gameDays + region.days,
            duration: region.days,
        };
        return { ok: true, msg: '远征队已出发前往「' + name + '」。' };
    }

    function progress(state) {
        const a = state.expedition.active;
        if (!a) return 0;
        return Utils.clamp((state.gameDays - a.startDay) / Math.max(1e-6, a.endDay - a.startDay), 0, 1);
    }

    function remaining(state) {
        const a = state.expedition.active;
        if (!a) return 0;
        return Math.max(0, a.endDay - state.gameDays);
    }

    function rollLoot(state, region, factor) {
        const gained = {};
        for (const res in region.loot) {
            const range = region.loot[res];
            let amount = Utils.rnd(range[0], range[1]) * factor;
            if (amount > 0) gained[res] = Math.floor(amount * 100) / 100;
        }
        if (region.relics && region.relics[1] > 0) {
            const relics = region.relics[0] + Utils.rnd(0, region.relics[1] - region.relics[0]);
            gained['奥术遗物'] = (gained['奥术遗物'] || 0) + Math.floor(relics * factor);
        }
        return gained;
    }

    /* 结算（由主循环在到点时调用） */
    function finish(state) {
        const a = state.expedition.active;
        if (!a) return null;
        const region = findRegion(a.region);
        if (!region) { state.expedition.active = null; return null; }

        const rewardMult = (1 + EffectsManager.additive(state, 'expeditionReward'));
        const chance = successChance(state, region);
        const success = Math.random() < chance;
        const factor = (success ? 1 : 0.25) * rewardMult;
        const loot = rollLoot(state, region, factor);

        let artifact = null;
        if (success && Math.random() < region.artifact * Utils.clamp(1 + EffectsManager.additive(state, 'artifactQuality'), 0.5, 3)) {
            artifact = window.Artifacts ? Artifacts.generate(state, region.tier) : null;
        }

        for (const res in loot) ResourcesManager.add({ [res]: loot[res] });

        state.stats.expeditions++;
        if (!success) state.stats.expeditionsFailed++;

        const record = {
            region: region.name,
            day: state.gameDays,
            success: success,
            chance: chance,
            loot: loot,
            artifact: artifact ? artifact.name : null,
        };
        state.expedition.history.unshift(record);
        if (state.expedition.history.length > 30) state.expedition.history.pop();

        const name = region.name;
        state.expedition.active = null;

        return Object.assign(record, { regionName: name, artifactObj: artifact });
    }

    window.ExpeditionEngine = {
        findRegion, successChance, canStart, start, progress, remaining, finish,
    };
})();
