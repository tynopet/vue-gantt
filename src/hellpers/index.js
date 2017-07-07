import parse from 'date-fns/parse';
import min from 'date-fns/min';
import max from 'date-fns/max';
import isAfter from 'date-fns/is_after';
import isBefore from 'date-fns/is_before';
import memoize from 'lodash/memoize';
import dateFns from 'date-fns';

export const createOptions = scales => scales.reduce((acc, { scale, steps }) =>
  acc.concat(steps.map(step => `${scale} ${step}`)), []);

export const transformInputvalues = rows => rows.reduce((acc, row) => {
  const dates = row.values.reduce((r, { from, to }) => ({
    startDate: r.from ? min(r.from, parse(from)) : parse(from),
    endDate: r.to ? max(r.to, parse(to)) : parse(to),
  }), {});
  return {
    startDate: acc.startDate ? min(acc.startDate, dates.startDate) : dates.startDate,
    endDate: acc.endDate ? max(acc.endDate, dates.endDate) : dates.endDate,
    values: [...acc.values, row.values],
  };
}, { values: [] });

export const calcBody = memoize(({ startDate, endDate }, rows, msInCell, cellWidth) =>
  rows.map(row => row
    .map(({ from, to, desc, color }, idx) => {
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
    })));

export const intervals = {
  days: 'Month',
  hours: 'Day',
  minutes: 'Hour',
};

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

export const calcViewport = (start, scale, step, cellsCount) => {
  const method = `add${capitalize(scale)}`;

  const startDate = parse(start);
  const endDate = dateFns[method](parse(start), cellsCount * parseInt(step, 10));
  return { startDate, endDate };
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

// For header
const getDaysInMonth = memoize((start, end) => {
  if (dateFns.isSameMonth(start, end)) {
    return (dateFns.getDate(end) - dateFns.getDate(start)) + 1;
  }
  return (dateFns.getDaysInMonth(start) - dateFns.getDate(start)) + 1;
});

const getHoursInDay = memoize((start, end, step) => {
  if (dateFns.isSameDay(start, end)) {
    return ((dateFns.getHours(end) - dateFns.getHours(start)) + 1) / step;
  }
  return (24 - dateFns.getHours(start)) / step;
});

const getMinutesInHour = memoize((start, end, step) => {
  if (dateFns.isSameHour(start, end)) {
    return ((dateFns.getMinutes(end) - dateFns.getMinutes(start)) + 1) / step;
  }
  return (60 - dateFns.getMinutes(start)) / step;
});

const switchScale = memoize((scale, step) => {
  switch (scale) {
    case 'days':
      return [
        {
          method: dateFns.getYear,
          addType: dateFns.addYears,
          start: dateFns.startOfYear,
          add: 1,
          factor: 1,
          get: (start, end) => dateFns.differenceInDays(end, start) + 1,
        },
        {
          method: dateFns.getMonth,
          addType: dateFns.addMonths,
          start: dateFns.startOfMonth,
          add: 1,
          factor: 1,
          get: getDaysInMonth,
        },
        {
          method: dateFns.getDate,
          addType: dateFns.addDays,
          start: dateFns.startOfDay,
          add: step,
          factor: 1,
          get: () => 1,
        },
      ];
    case 'hours':
      return [
        {
          method: dateFns.getMonth,
          addType: dateFns.addMonths,
          start: dateFns.startOfMonth,
          add: 1,
          factor: 24 / step,
          get: getDaysInMonth,
        },
        {
          method: dateFns.getDate,
          addType: dateFns.addDays,
          start: dateFns.startOfDay,
          add: 1,
          factor: 1,
          get: getHoursInDay,
        },
        {
          method: dateFns.getHours,
          addType: dateFns.addHours,
          start: dateFns.startOfHour,
          add: step,
          factor: 1,
          get: () => 1,
        },
      ];
    case 'minutes':
      return [
        {
          method: dateFns.getDate,
          addType: dateFns.addDays,
          start: dateFns.startOfDay,
          add: 1,
          factor: 60,
          get: getHoursInDay,
        },
        {
          method: dateFns.getHours,
          addType: dateFns.addHours,
          start: dateFns.startOfHour,
          add: 1,
          factor: 1,
          get: getMinutesInHour,
        },
        {
          method: dateFns.getMinutes,
          addType: dateFns.addMinutes,
          start: dateFns.startOfMinute,
          add: step,
          factor: 1,
          get: () => 1,
        },
      ];
    default:
      return new Error('Invalid format');
  }
});

export const calcHeader = memoize(({ startDate, endDate }, scale, step, cellWidth) =>
  switchScale(scale, step).map((sc) => {
    const tmp = [];
    for (let date = new Date(dateFns.getTime(startDate));
      dateFns.isBefore(date, endDate);
      date = sc.start(sc.addType(date, sc.add))) {
      tmp.push({
        label: sc.method(date),
        width: cellWidth * sc.get(date, endDate, step) * sc.factor,
      });
    }
    // console.log(tmp);
    return tmp;
  }));
