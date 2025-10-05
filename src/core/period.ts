export type Period = {
    start: Date;   // inclusive
    end: Date;     // inclusive 23:59:59.999 in TZ, but stored as Date (UTC)
    key: string;   // canonical period key
};
