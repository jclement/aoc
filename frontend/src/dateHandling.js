const toUtc = dateStr => (new Date(dateStr)).toISOString();

const pad10 = num => num < 10 ? `0${num}` : num.toString();

// controls take the format YYYY-MM-ddTHH:mm
const fromUtc = dateStr => {
  const dt = new Date(Date.parse(dateStr));
  return (
    `${dt.getFullYear()}-${pad10(dt.getMonth() + 1)}-${pad10(dt.getDate())}T` +
    `${pad10(dt.getHours())}:${pad10(dt.getMinutes())}`
  );
};

export { fromUtc, toUtc };
