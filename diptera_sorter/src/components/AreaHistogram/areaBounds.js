// Unknown bounds must not become plausible-looking default thresholds.
export function areaBoundaryMarkers(bounds = []) {
    const groups = new Map();
    for (const bound of bounds) {
        if (!bound || !Number.isFinite(bound.min) || !Number.isFinite(bound.max) || bound.min > bound.max) continue;
        const key = JSON.stringify([bound.min, bound.max]);
        const group = groups.get(key) || {min: bound.min, max: bound.max, labels: []};
        if (bound.label && !group.labels.includes(bound.label)) group.labels.push(bound.label);
        groups.set(key, group);
    }
    return [...groups.values()].flatMap(group => [group.min, group.max].map(value => ({
        value,
        text: [groups.size > 1 ? group.labels.join(", ") : "", value].filter(part => part !== "").join(": "),
    })));
}
