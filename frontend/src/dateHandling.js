// true if running local/dev
// false in prod
const isSqlite = true;

const toUtc = dateStr => (
  isSqlite ?
    `${dateStr} 00:00:00` :       // date format: 2020-01-01 00:00:00
    `${dateStr}T00:00:00Z-7:00`   // This is so dumb. Assuming MST midnight.
);

const fromUtc = dateStr => dateStr.substring(0, 10);

export { fromUtc, toUtc };
