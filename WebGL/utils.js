"use strict";

class ColorUtils {
    static hsvToRgb(h, s, v) {
        const f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
        return [f(5), f(3), f(1)];
    }
}

class RandomUtils {
    static get(max) {
        return Math.random() * max;
    }

    static getBetween(min, max) {
        return min + RandomUtils.get(max - min);
    }
}