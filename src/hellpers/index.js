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
import startOfYear from 'date-fns/start_of_year';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';
import getYear from 'date-fns/get_year';
import getMonth from 'date-fns/get_month';
import getDate from 'date-fns/get_date';
import getHours from 'date-fns/get_hours';
import getMinutes from 'date-fns/get_minutes';
import getSeconds from 'date-fns/get_seconds';
import getDaysInMonth from 'date-fns/get_days_in_month';
import isSameMonth from 'date-fns/is_same_month';
import isSameDay from 'date-fns/is_same_day';
import isSameHour from 'date-fns/is_same_hour';
import addYears from 'date-fns/add_years';
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
  days: 'months',
  hours: 'days',
  minutes: 'hours',
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
    case 'days':
      return 86400000;
    case 'hours':
      return 3600000;
    case 'minutes':
      return 60000;
    default:
      return new Error('Invalid format');
  }
});

export const calcViewport = (start, scale, step, cellsCount) => {
  const startDate = parse(start);
  const endDate = addDateFunctions[scale](parse(start), cellsCount * parseInt(step, 10));
  return { startDate, endDate };
};

export const calcBody = memoize(({ startDate, endDate }, rows, msInCell, cellWidth) =>
  rows.map(row =>
    row.map(({ from, to, desc, color }, idx) => {
      const offset = idx === 0 && (isAfter(from, startDate) && isBefore(from, endDate))
        ? Math.ceil(((from - startDate) / msInCell) * cellWidth)
        : 0;
      const intervalStart = (isBefore(from, startDate) && isAfter(to, startDate))
        ? startDate
        : from;
      const intervalEnd = (isBefore(from, endDate) && isAfter(to, endDate)) ? endDate : to;
      const display = !(isAfter(from, endDate) || isBefore(to, startDate));
      const width = Math.ceil(
        ((intervalEnd - intervalStart) / msInCell) * cellWidth,
      );
      return {
        width,
        offset,
        desc,
        color,
        display,
      };
    }),
  ));

// For header
const mGetDaysInMonth = memoize((start, end) => {
  if (isSameMonth(start, end)) {
    return (getDate(end) - getDate(start)) + 1;
  }
  return (getDaysInMonth(start) - getDate(start)) + 1;
});

const mGetHoursInDay = memoize((start, end, step) => {
  if (isSameDay(start, end)) {
    return ((getHours(end) - getHours(start)) + 1) / step;
  }
  return (24 - getHours(start)) / step;
});

const mGetMinutesInHour = memoize((start, end, step) => {
  if (isSameHour(start, end)) {
    return ((getMinutes(end) - getMinutes(start)) + 1) / step;
  }
  return (60 - getMinutes(start)) / step;
});

const switchScale = (scale, step) => {
  switch (scale) {
    case 'days':
      return [
        {
          method: date => capitalize(format(date, 'YYYY', { locale: ruLocale })),
          key: 'years',
          addType: addYears,
          start: startOfYear,
          add: 1,
          factor: 1,
          scale: 'days',
          get: (start, end) => differenceInDays(end, start) + 1,
        },
        {
          method: date => capitalize(format(date, 'MMM', { locale: ruLocale })),
          key: 'months',
          addType: addMonths,
          start: startOfMonth,
          add: 1,
          factor: 1,
          scale: 'days',
          get: mGetDaysInMonth,
        },
        {
          method: date => capitalize(format(date, 'D', { locale: ruLocale })),
          key: 'days',
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
          key: 'months',
          addType: addMonths,
          start: startOfMonth,
          add: 1,
          factor: 24 / step,
          scale: 'days',
          get: mGetDaysInMonth,
        },
        {
          method: date => capitalize(format(date, 'D', { locale: ruLocale })),
          key: 'days',
          addType: addDays,
          start: startOfDay,
          add: 1,
          factor: 1,
          scale: 'hours',
          get: mGetHoursInDay,
        },
        {
          method: date => capitalize(format(date, 'H', { locale: ruLocale })),
          key: 'hours',
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
          key: 'days',
          addType: addDays,
          start: startOfDay,
          add: 1,
          factor: 60,
          scale: 'hours',
          get: mGetHoursInDay,
        },
        {
          method: date => capitalize(format(date, 'H', { locale: ruLocale })),
          key: 'hours',
          addType: addHours,
          start: startOfHour,
          add: 1,
          factor: 1,
          scale: 'minutes',
          get: mGetMinutesInHour,
        },
        {
          method: date => capitalize(format(date, 'm', { locale: ruLocale })),
          key: 'months',
          addType: addMinutes,
          start: startOfMinute,
          add: parseInt(step, 10),
          factor: 1,
          scale: 'minutes',
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
