import parse from 'date-fns/parse';
import min from 'date-fns/min';
import max from 'date-fns/max';
import getTime from 'date-fns/get_time';
import endOfSecond from 'date-fns/end_of_second';
import endOfMinute from 'date-fns/end_of_minute';
import endOfHour from 'date-fns/end_of_hour';
import endOfDay from 'date-fns/end_of_day';
import endOfMonth from 'date-fns/end_of_month';
import endOfYear from 'date-fns/end_of_year';
import startOfSecond from 'date-fns/start_of_second';
import startOfMinute from 'date-fns/start_of_minute';
import startOfHour from 'date-fns/start_of_hour';
import startOfDay from 'date-fns/start_of_day';
import startOfMonth from 'date-fns/start_of_month';
import startOfQuarter from 'date-fns/start_of_quarter';
import startOfYear from 'date-fns/start_of_year';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';
import getYear from 'date-fns/get_year';
import getMonth from 'date-fns/get_month';
import getDate from 'date-fns/get_date';
import getdayOfYear from 'date-fns/get_day_of_year';
import getHours from 'date-fns/get_hours';
import getMinutes from 'date-fns/get_minutes';
import getSeconds from 'date-fns/get_seconds';
import getDaysInMonth from 'date-fns/get_days_in_month';
import getDaysInYear from 'date-fns/get_days_in_year';
import isSameYear from 'date-fns/is_same_year';
import isSameQuarter from 'date-fns/is_same_quarter';
import isSameMonth from 'date-fns/is_same_month';
import isSameDay from 'date-fns/is_same_day';
import isSameHour from 'date-fns/is_same_hour';
import isSameMinute from 'date-fns/is_same_minute';
import addYears from 'date-fns/add_years';
import addQuarters from 'date-fns/add_quarters';
import addMonths from 'date-fns/add_months';
import addDays from 'date-fns/add_days';
import addHours from 'date-fns/add_hours';
import addMinutes from 'date-fns/add_minutes';
import addSeconds from 'date-fns/add_seconds';
import differenceInDays from 'date-fns/difference_in_days';
import isAfter from 'date-fns/is_after';
import isBefore from 'date-fns/is_before';
import format from 'date-fns/format';
import ruLocale from 'date-fns/locale/ru';
import compareAsc from 'date-fns/compare_asc';
import memoize from 'lodash/memoize';
import capitalize from 'lodash/capitalize';

const endDateFunctions = {
  seconds: endOfSecond,
  minutes: endOfMinute,
  hours: endOfHour,
  days: endOfDay,
  months: endOfMonth,
  years: endOfYear,
};

const startDateFunctions = {
  seconds: startOfSecond,
  minutes: startOfMinute,
  hours: startOfHour,
  days: startOfDay,
  months: startOfMonth,
  years: startOfYear,
};

const addDateFunctions = {
  seconds: addSeconds,
  minutes: addMinutes,
  hours: addHours,
  days: addDays,
  months: addMonths,
  years: addYears,
};

const getDateFunctions = {
  seconds: getSeconds,
  minutes: getMinutes,
  hours: getHours,
  days: getDate,
  months: getMonth,
  years: getYear,
};

const intervals = {
  months: 'years',
  days: 'months',
  hours: 'days',
  minutes: 'hours',
  seconds: 'minutes',
};

export const createOptions = scales => scales.reduce((acc, { scale, steps }) =>
  acc.concat(steps.map(step => `${scale} ${step}`)), []);

export const transformInputvalues = rows => rows.reduce((acc, { link, name, values }) => {
  const dates = values.reduce((r, { from, to }) => ({
    startDate: r.startDate ? min(r.startDate, parse(from)) : parse(from),
    endDate: r.endDate ? max(r.endDate, parse(to)) : parse(to),
  }), {});
  const task = {
    link,
    from: format(dates.startDate, 'DD-MM-YYYY HH:mm:ss'),
    to: format(dates.endDate, 'DD-MM-YYYY HH:mm:ss'),
    name,
    start: getTime(dates.startDate),
  };
  return {
    startDate: acc.startDate ? min(acc.startDate, dates.startDate) : dates.startDate,
    endDate: acc.endDate ? max(acc.endDate, dates.endDate) : dates.endDate,
    values: [...acc.values, values],
    tasks: [...acc.tasks, task],
  };
}, { values: [], tasks: [] });

export const getMinDate = (startDate, scale) => {
  const method = startDateFunctions[intervals[scale]];
  return getTime(method(startDate));
};

const getViewportInMilliseconds = (start, scale, step, cellsCount) => {
  const startDate = parse(start);
  const endDate = addDateFunctions[scale](parse(start), cellsCount * parseInt(step, 10));
  return differenceInMilliseconds(endDate, startDate);
};

export const getMaxDate = (endDate, scale, step, minDate, msInCell, cellsCount) => {
  const method = endDateFunctions[intervals[scale]];
  const tmpMax = getTime(method(endDate))
    - getViewportInMilliseconds(endDate, scale, step, cellsCount);
  const maxDate = tmpMax < minDate ? minDate : tmpMax;
  return maxDate + (msInCell - ((maxDate - minDate) % msInCell));
};

export const getMsInScale = memoize((scale) => {
  switch (scale) {
    case 'months':
      return 2678400000;
    case 'days':
      return 86400000;
    case 'hours':
      return 3600000;
    case 'minutes':
      return 60000;
    case 'seconds':
      return 1000;
    default:
      return new Error('Invalid format');
  }
});

export const calcViewport = (start, scale, step, cellsCount) => {
  const startDate = parse(start);
  const endDate = addDateFunctions[scale](parse(start), cellsCount * parseInt(step, 10));
  return { startDate, endDate };
};

export const calcBody = ({ startDate, endDate }, rows, msInCell, cellWidth) =>
  rows.map(row =>
    row.map(({ from, to, desc, color }, idx) => {
      // hardcode msInCell for month scale
      const msInCellWithTolerance = msInCell === 2678400000 ? (365 / 12) * 8.64e7 : msInCell;
      const offset = idx === 0 && (isAfter(from, startDate) && isBefore(from, endDate))
        ? Math.ceil(((from - startDate) / msInCellWithTolerance) * cellWidth)
        : 0;
      const intervalStart = (isBefore(from, startDate) && isAfter(to, startDate))
        ? startDate
        : from;
      const intervalEnd = (isBefore(from, endDate) && isAfter(to, endDate)) ? endDate : to;
      const display = !(compareAsc(from, endDate) >= 0 || compareAsc(to, startDate) <= 0);
      const width = Math.ceil(
        ((intervalEnd - intervalStart) / msInCellWithTolerance) * cellWidth,
      );
      return {
        width,
        offset: (width < 8 && offset > 0) ? offset - (8 - width) : offset,
        desc,
        color,
        display,
        from: format(from, 'DD-MM-YYYY HH:mm:ss'),
        to: format(to, 'DD-MM-YYYY HH:mm:ss'),
      };
    }),
  );

// For header
const mGetMonthsInYear = memoize((start, end) => {
  if (isSameYear(start, end)) {
    return (getMonth(end) - getMonth(start));
  }
  return (12 - getMonth(start));
});

const mGetMonthsInQuarter = memoize((start, end) => {
  if (isSameQuarter(start, end)) {
    return (getMonth(end) - getMonth(start));
  }
  return (3 - (getMonth(start) % 3));
});

const mGetDaysInYear = memoize((start, end) => {
  if (isSameYear(start, end)) {
    return differenceInDays(end, start) + 1;
  }
  return (getDaysInYear(start) - getdayOfYear(start)) + 1;
});

const mGetDaysInMonth = memoize((start, end) => {
  if (isSameMonth(start, end)) {
    const maxDays = (getTime(end) - getTime(start)) / 86400000;
    const days = (getDate(end) - getDate(start)) + 1;
    return days > maxDays ? maxDays : days;
  }
  return (getDaysInMonth(start) - getDate(start) - (getHours(start) / 24)) + 1;
});

const mGetHoursInDay = memoize((start, end, step) => {
  if (isSameDay(start, end)) {
    const maxHours = (getTime(end) - getTime(start)) / 3600000 / step;
    const hours = ((getHours(end) - getHours(start)) + 1) / step;
    return hours > maxHours ? maxHours : hours;
  }
  return (24 - getHours(start) - (getMinutes(start) / 60)) / step;
});

const mGetMinutesInHour = memoize((start, end, step) => {
  if (isSameHour(start, end)) {
    const maxMinutes = (getTime(end) - getTime(start)) / 60000 / step;
    const minutes = ((getMinutes(end) - getMinutes(start) - (getSeconds(start) / 60)) + 1) / step;
    return minutes > maxMinutes ? maxMinutes : minutes;
  }
  return (60 - getMinutes(start) - (getSeconds(start) / 60)) / step;
});

const mGetSecondsInMinute = memoize((start, end, step) => {
  if (isSameMinute(start, end)) {
    return ((getSeconds(end) - getSeconds(start)) + 1) / step;
  }
  return (60 - getSeconds(start)) / step;
});

const switchScale = (scale, step) => {
  switch (scale) {
    case 'months':
      return [
        {
          method: date => capitalize(format(date, 'YYYY', { locale: ruLocale })),
          addType: addYears,
          start: startOfYear,
          add: 1,
          factor: 1,
          scale: 'months',
          get: mGetMonthsInYear,
        },
        {
          method: date => capitalize(format(date, 'Q', { locale: ruLocale })),
          addType: addQuarters,
          start: startOfQuarter,
          add: 1,
          factor: 1,
          scale: 'months',
          get: mGetMonthsInQuarter,
        },
        {
          method: date => capitalize(format(date, 'M', { locale: ruLocale })),
          addType: addMonths,
          start: startOfMonth,
          add: 1,
          factor: 1,
          scale: 'days',
          get: () => 1,
        },
      ];
    case 'days':
      return [
        {
          method: date => capitalize(format(date, 'YYYY', { locale: ruLocale })),
          addType: addYears,
          start: startOfYear,
          add: 1,
          factor: 1,
          scale: 'months',
          get: mGetDaysInYear,
        },
        {
          method: date => capitalize(format(date, 'MMM', { locale: ruLocale })),
          addType: addMonths,
          start: startOfMonth,
          add: 1,
          factor: 1,
          scale: 'months',
          get: mGetDaysInMonth,
        },
        {
          method: date => capitalize(format(date, 'D', { locale: ruLocale })),
          addType: addDays,
          start: startOfDay,
          add: parseInt(step, 10),
          factor: 1,
          scale: 'hours',
          get: () => 1,
        },
      ];
    case 'hours':
      return [
        {
          method: date => capitalize(format(date, 'MMM', { locale: ruLocale })),
          addType: addMonths,
          start: startOfMonth,
          add: 1,
          factor: 24 / step,
          scale: 'days',
          get: mGetDaysInMonth,
        },
        {
          method: date => capitalize(format(date, 'D', { locale: ruLocale })),
          addType: addDays,
          start: startOfDay,
          add: 1,
          factor: 1,
          scale: 'hours',
          get: mGetHoursInDay,
        },
        {
          method: date => capitalize(format(date, 'H', { locale: ruLocale })),
          addType: addHours,
          start: startOfHour,
          add: parseInt(step, 10),
          factor: 1,
          scale: 'minutes',
          get: () => 1,
        },
      ];
    case 'minutes':
      return [
        {
          method: date => capitalize(format(date, 'D', { locale: ruLocale })),
          addType: addDays,
          start: startOfDay,
          add: 1,
          factor: 60,
          scale: 'hours',
          get: mGetHoursInDay,
        },
        {
          method: date => capitalize(format(date, 'H', { locale: ruLocale })),
          addType: addHours,
          start: startOfHour,
          add: 1,
          factor: 1,
          scale: 'minutes',
          get: mGetMinutesInHour,
        },
        {
          method: date => capitalize(format(date, 'm', { locale: ruLocale })),
          addType: addMinutes,
          start: startOfMinute,
          add: parseInt(step, 10),
          factor: 1,
          scale: 'seconds',
          get: () => 1,
        },
      ];
    case 'seconds':
      return [
        {
          method: date => capitalize(format(date, 'H', { locale: ruLocale })),
          addType: addHours,
          start: startOfHour,
          add: 1,
          factor: 60,
          scale: 'minutes',
          get: mGetMinutesInHour,
        },
        {
          method: date => capitalize(format(date, 'm', { locale: ruLocale })),
          addType: addMinutes,
          start: startOfMinute,
          add: 1,
          factor: 1,
          scale: 'seconds',
          get: mGetSecondsInMinute,
        },
        {
          method: date => capitalize(format(date, 's', { locale: ruLocale })),
          addType: addSeconds,
          start: startOfSecond,
          add: parseInt(step, 10),
          factor: 1,
          scale: 'seconds',
          get: () => 1,
        },
      ];
    default:
      return new Error('Invalid format');
  }
};

export const calcHeader = memoize(({ startDate, endDate }, scale, step, cellWidth) =>
  switchScale(scale, step).map((sc) => {
    const tmp = [];
    for (let date = new Date(getTime(startDate));
      isBefore(date, endDate);
      date = sc.start(sc.addType(date, sc.add))) {
      tmp.push({
        scale: sc.scale,
        date: getTime(date),
        label: sc.method(date),
        title: format(date, 'DD-MM-YYYY HH:mm:ss'),
        width: cellWidth * sc.get(date, endDate, step) * sc.factor,
      });
    }
    return tmp;
  }));

export const normalizeDate = (date, scale, step) => {
  const startOfPeriod = getTime(startDateFunctions[scale](date));
  const rest = getDateFunctions[scale](startOfPeriod) % step;
  return rest
    ? getTime(addDateFunctions[scale](startOfPeriod, -rest))
    : startOfPeriod;
};

export const calcMaxScale = (start, end, cellsCount, scales) => {
  const realDiff = getTime(end) - getTime(start);
  return scales.reduceRight((acc, s, idx) => {
    const [scale, step] = s.split(' ');
    const { startDate, endDate } = calcViewport(getMinDate(start, scale), scale, step, cellsCount);
    return (getTime(endDate) - getTime(startDate) > realDiff) && idx > acc ? idx : acc;
  }, 0);
};
