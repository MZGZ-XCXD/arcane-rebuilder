/* 成就检测 */
(function () {
    let pending = [];

    function check(state) {
        for (const cfg of ACHIEVEMENTS_CONFIG) {
            if (state.achievements[cfg.id]) continue;
            let ok = false;
            try { ok = cfg.cond(state); } catch (e) { ok = false; }
            if (!ok) continue;
            state.achievements[cfg.id] = true;
            pending.push(cfg);
            EventEngine.addLog(state, '🏆 解锁成就「' + cfg.name + '」' + (cfg.effectText ? '：' + cfg.effectText : ''));
        }
        if (pending.length) {
            ProductionEngine.computeProductionAndCaps(state);
            if (window.UI && UI.toast) {
                for (const c of pending) UI.toast('🏆 成就解锁：' + c.name + (c.effectText ? '（' + c.effectText + '）' : ''), 'gold');
            }
            pending = [];
        }
    }

    window.AchievementEngine = { check };
})();
