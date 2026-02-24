/**
 * Calculates the real/actual training duration accounting for simultaneous activities.
 *
 * Activities with the same `CombinedGroupId` were performed at the same time,
 * so their duration is counted only once (using the max duration of the group).
 *
 * @param {Array} activities - Array of activity objects with DurationMinutes and CombinedGroupId
 * @returns {number} Total real duration in minutes
 */
export function calcRealDuration(activities) {
    if (!activities || activities.length === 0) return 0;

    const groups = {};
    let total = 0;

    for (const a of activities) {
        const dur = a.DurationMinutes || 0;
        if (a.CombinedGroupId) {
            if (groups[a.CombinedGroupId] === undefined) {
                groups[a.CombinedGroupId] = dur;
            } else {
                groups[a.CombinedGroupId] = Math.max(groups[a.CombinedGroupId], dur);
            }
        } else {
            total += dur;
        }
    }

    for (const duration of Object.values(groups)) {
        total += duration;
    }

    return total;
}

/**
 * Builds category duration data for charts, correctly handling combined groups.
 * For combined activities, their time contribution is proportional to their share
 * within the group (so total duration per category sums to the real session duration).
 *
 * @param {Array} activities
 * @returns {Array} [{name: string, value: number}]
 */
export function buildCategoryChartData(activities) {
    if (!activities || activities.length === 0) return [];

    // Separate standalone and grouped activities
    const standalone = activities.filter((a) => !a.CombinedGroupId);
    const grouped = activities.filter((a) => a.CombinedGroupId);

    const acc = {};

    // Standalone: count full duration per category
    for (const a of standalone) {
        const cat = a.Category?.Name || "Unknown";
        acc[cat] = (acc[cat] || 0) + (a.DurationMinutes || 0);
    }

    // Grouped: for each group, count the max duration, split proportionally across categories
    const groupMap = {};
    for (const a of grouped) {
        if (!groupMap[a.CombinedGroupId]) groupMap[a.CombinedGroupId] = [];
        groupMap[a.CombinedGroupId].push(a);
    }

    for (const groupActivities of Object.values(groupMap)) {
        const groupDuration = Math.max(...groupActivities.map((a) => a.DurationMinutes || 0));
        const totalGroupMins = groupActivities.reduce((s, a) => s + (a.DurationMinutes || 0), 0);

        for (const a of groupActivities) {
            const cat = a.Category?.Name || "Unknown";
            // Proportional share of the real group duration
            const share = totalGroupMins > 0
                ? ((a.DurationMinutes || 0) / totalGroupMins) * groupDuration
                : groupDuration / groupActivities.length;
            acc[cat] = (acc[cat] || 0) + share;
        }
    }

    return Object.entries(acc).map(([name, value]) => ({
        name,
        value: Math.round(value),
    }));
}
