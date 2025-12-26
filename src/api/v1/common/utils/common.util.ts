
export const generateShortId = (prefix = "cat"): string => {
    const now = Date.now().toString(36); // compact time
    const rand = Math.random().toString(36).substring(2, 6); // 4 random chars
    return `${prefix}_${now}${rand}`;
};

export const parseExpiry = (expiry: string): number => {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid expiry format: ${expiry}`);

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case "s": return value;            // seconds
        case "m": return value * 60;       // minutes
        case "h": return value * 60 * 60;  // hours
        case "d": return value * 60 * 60 * 24; // days
        default: throw new Error(`Unknown time unit: ${unit}`);
    }
}
