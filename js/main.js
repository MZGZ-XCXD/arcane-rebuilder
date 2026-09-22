/* 入口：初始化或读档 → 应用主题 → 渲染 → 启动主循环 */
(function () {
    const s = GameState;

    initState();
    const hadSave = SaveEngine.hasSave();
    let loaded = false;
    if (hadSave) {
        try { loaded = SaveEngine.load(s); } catch (e) { console.error(e); loaded = false; }
    }
    if (!loaded) {
        ProductionEngine.updatePrices(s);
        ProductionEngine.computeProductionAndCaps(s);
    }

    App.applyTheme();
    App.render();
    GameLoop.start();

    /* 首次进入：引导 */
    if (!hadSave && !s.settings.hideWelcome && location.hash !== '#skipintro') {
        setTimeout(() => App.welcomeModal(), 400);
    } else if (s.offlineReport && s.offlineReport.seconds >= 60) {
        setTimeout(() => Panels.offlineModal(), 350);
    }

    /* 离开页面时保存 */
    window.addEventListener('beforeunload', () => {
        if (s.settings.autosave) SaveEngine.save(s);
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && s.settings.autosave) SaveEngine.save(s);
    });
    window.addEventListener('error', e => {
        console.error('运行时错误', e.error || e.message);
    });
})();
