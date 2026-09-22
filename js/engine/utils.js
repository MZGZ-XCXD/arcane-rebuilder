/* 通用工具：数字格式化、随机、时间 */
(function () {
    const UNITS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg'];

    function fmtNum(n, digits) {
        if (n === undefined || n === null || isNaN(n)) return '0';
        if (digits === undefined) digits = 2;
        const neg = n < 0;
        n = Math.abs(n);
        if (n < 1000) {
            let s;
            if (n >= 100) s = n.toFixed(0);
            else if (n >= 10) s = n.toFixed(Math.min(1, digits));
            else s = n.toFixed(digits);
            if (s.indexOf('.') >= 0) s = s.replace(/\.?0+$/, '');
            return (neg ? '-' : '') + s;
        }
        let tier = Math.floor(Math.log10(n) / 3);
        if (tier >= UNITS.length) return (neg ? '-' : '') + n.toExponential(2).replace('e+', 'e');
        const scaled = n / Math.pow(1000, tier);
        let s = scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0);
        return (neg ? '-' : '') + s + UNITS[tier];
    }

    function fmtRate(n, digits) {
        if (n === undefined || isNaN(n)) return '0';
        const v = fmtNum(Math.abs(n), digits === undefined ? 2 : digits);
        return (n < 0 ? '-' : '+') + v;
    }

    function fmtInt(n) { return Math.round(n).toLocaleString('zh-CN'); }

    function fmtPct(x, digits) {
        if (isNaN(x)) return '0%';
        const d = digits === undefined ? 1 : digits;
        return (x * 100).toFixed(d).replace(/\.0+$/, '') + '%';
    }

    /* 游戏内时间：1 秒 = 1 日，360 日 = 1 年 */
    function fmtDate(days) {
        const y = Math.floor(days / 360) + 1;
        const d = Math.floor(days % 360) + 1;
        return '第 ' + y + ' 年 ' + d + ' 日';
    }

    function fmtDuration(seconds) {
        seconds = Math.max(0, Math.floor(seconds));
        if (seconds < 60) return seconds + ' 秒';
        const m = Math.floor(seconds / 60), s = seconds % 60;
        if (m < 60) return m + ' 分 ' + (s > 0 ? s + ' 秒' : '');
        const h = Math.floor(m / 60), mm = m % 60;
        if (h < 24) return h + ' 时 ' + (mm > 0 ? mm + ' 分' : '');
        const d = Math.floor(h / 24), hh = h % 24;
        return d + ' 天 ' + (hh > 0 ? hh + ' 时' : '');
    }

    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

    function rnd(a, b) {
        if (a === undefined) return Math.random();
        if (b === undefined) return Math.random() * a;
        return a + Math.random() * (b - a);
    }

    function rndInt(a, b) { return Math.floor(rnd(a, b + 1)); }

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function weightedPick(items, weightFn) {
        let total = 0;
        for (const it of items) total += Math.max(0, weightFn(it));
        if (total <= 0) return null;
        let r = Math.random() * total;
        for (const it of items) {
            r -= Math.max(0, weightFn(it));
            if (r <= 0) return it;
        }
        return items[items.length - 1];
    }

    function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

    window.Utils = {
        fmtNum, fmtRate, fmtInt, fmtPct, fmtDate, fmtDuration,
        clamp, rnd, rndInt, pick, weightedPick, deepClone,
    };
})();
