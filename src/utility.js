import settings from "./settings";

export function distance(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    var c = Math.sqrt( a*a + b*b );
    return c;
}

export function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export function getRandom(min, max) {
    return Math.random() * (max - min + 1) + min;
}

export function minmax(lst) {
    let min = lst[0];
    let max = lst[0];
    for (let i = 1; i < lst.length; i++) {
        if (lst[i] > max) {
            max = lst[i];
        } else if (lst[i] < min) {
            min = lst[i];
        }
    }

    return {min: min, max: max};
}