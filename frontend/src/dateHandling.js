const toUtc = dateStr => (new Date(dateStr)).toISOString();

const pad10 = num => num < 10 ? `0${num}` : num.toString();

// controls take the format YYYY-MM-ddTHH:mm
const fromUtc = dateStr => {
  const dayUtc = new Date(Date.parse(dateStr));
  const dt = new Date(Date.UTC(
    dayUtc.getFullYear(),
    dayUtc.getMonth(),
    dayUtc.getDate(),
    dayUtc.getHours(),
    dayUtc.getMinutes()
  ));
  return (
    `${dt.getFullYear()}-${pad10(dt.getMonth() + 1)}-${pad10(dt.getDate())}T` +
    `${pad10(dt.getHours())}:${pad10(dt.getMinutes())}`
  );
};

const parseToLocal = dateStr => {
  const dayUtc = new Date(Date.parse(dateStr));
  const dt = new Date(Date.UTC(
    dayUtc.getFullYear(),
    dayUtc.getMonth(),
    dayUtc.getDate(),
    dayUtc.getHours(),
    dayUtc.getMinutes()
  ));
  return dt;
};

const timeRemaining = dateStr => {
    var rem = parseInt((parseToLocal(dateStr)-Date.now())/1000);
    var output = ""

    var days = parseInt(rem/(24*60*60));
    rem -= days * 24*60*60;
    if (days !== 0) 
      output = `${output}${days.toString()} ${days>1?"days":"day"} `;

    var hours = parseInt(rem/(60*60));
    rem -= hours * 60*60;
    if (hours !== 0) 
      output = `${output}${hours.toString()} ${hours>1?"hours":"hour"} `;

    var minutes = parseInt(rem/(60));
    rem -= minutes * 60;
    if (minutes !== 0) 
      output = `${output}${minutes.toString()} ${minutes>1?"minutes":"minute"} `;

    output = `${output}${rem.toString()} ${rem>1?"seconds":"second"} `;
    return output.trim();
}

export { fromUtc, toUtc, parseToLocal, timeRemaining };
