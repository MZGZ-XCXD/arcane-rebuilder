/* =========================================================
   试炼（可随时开启，效果立即生效；在符合条件的重置中坚持到底即可完成）
   star：难度星级，完成重置时每点星级让本次收获 +5%
   完成后永久获得 reward 效果
   ========================================================= */
(function () {
    const LIST = [];

    function C(name, o) {
        LIST.push({
            id: name,
            name: name,
            star: o.star,
            effect: o.eff || {},
            requireReset: o.require || 'any',
            reward: o.reward || {},
            rewardText: o.rewardText || '',
            desc: o.desc || '',
        });
    }

    C('灰烬余烬', {
        star: 1, eff: { globalCost: 0.25 }, require: 'any',
        reward: { globalCost: -0.02 }, rewardText: '所有建筑成本增长率永久 -2%',
        desc: '一切都要从废墟里重新搬运。所有建筑的成本增长率 +25%。',
    });
    C('枯萎魔网', {
        star: 1, eff: { resourceProd: { 魔力: -0.7 } }, require: 'any',
        reward: { resourceProd: { 魔力: 0.15 } }, rewardText: '魔力产出永久 +15%',
        desc: '魔网的裂口比你以为的更大。魔力产出 -70%。',
    });
    C('饥荒之年', {
        star: 2, eff: { resourceProd: { 食物: -0.8 }, happiness: -30 }, require: 'any',
        reward: { happiness: 30, resourceProd: { 食物: 0.1 } }, rewardText: '民望 +30，食物产出 +10%',
        desc: '连续三年颗粒无收。食物产出 -80%，民望 -30。',
    });
    C('知识封锁', {
        star: 2, eff: { knowledgeProd: -0.85 }, require: 'star',
        reward: { knowledgeProd: 0.25 }, rewardText: '魔法知识产出永久 +25%',
        desc: '所有典籍都被封存。魔法知识产出 -85%。完成「星辰升华」才能解除。',
    });
    C('孤独的学徒', {
        star: 3, eff: { populationCap: -0.5 }, require: 'star',
        reward: { populationCap: 0.2 }, rewardText: '人口上限永久 +20%',
        desc: '愿意留在这片废土上的人少了一半。人口上限 -50%。',
    });
    C('无尽长夜', {
        star: 3, eff: { speed: -0.3 }, require: 'core',
        reward: { speed: 0.05 }, rewardText: '世界流速永久 +5%',
        desc: '太阳不再升起。世界流速 -30%。完成「原初归寂」才能解除。',
    });
    C('赤色虚空', {
        star: 5, eff: { globalProd: -0.5, globalCost: 0.5 }, require: 'core',
        reward: { globalProd: 0.5 }, rewardText: '所有建筑产出永久 +50%',
        desc: '虚空正在吞掉你的世界。所有建筑产出 -50%，成本增长率 +50%。',
    });

    window.CHALLENGES_CONFIG = LIST;
})();
