import dateFns from 'date-fns';
import _ from 'lodash';
import {
  calcMaxScale,
  calcViewport,
  createOptions,
  getEndOfScale,
  getMaxDate,
  getMinDate,
  getViewportInMilliseconds,
  mGetMonthsInYear,
  mGetMonthsInQuarter,
  mGetDaysInYear,
  mGetDaysInMonth,
  mGetHoursInDay,
  mGetMinutesInHour,
  mGetSecondsInMinute,
  normalizeDate,
  transformInputValues,
  transformRow,
} from '@/hellpers';

describe('hellpers.js', () => {
  describe('createOptions', () => {
    it('Является функцией', () => {
      expect(createOptions).to.be.a('function');
    });

    describe('Возвращает ошибку типа, если аргумент не является массивом', () => {
      const args = ['str', 5, { arr: [] }, true];
      args.forEach((arg) => {
        it(`Вызов функции с аргументом ${arg} вернул ошибку типа`, () => {
          expect(() => createOptions(arg)).to.throw(TypeError);
        });
      });
    });

    describe('Возвращает ошибку типа, если ключ steps не является массивом', () => {
      const args = [
        { scale: 'months', steps: '' },
        { scale: 'days', steps: {} },
        { scale: 'days', steps: 1 },
        { scale: 'days', steps: true },
      ];
      args.forEach((arg) => {
        it(`Вызов функции с ключом steps: ${arg.steps} вернул ошибку типа`, () => {
          expect(() => createOptions(arg)).to.throw(TypeError);
        });
      });
    });

    it('Объединяет массив объектов в массив по ключам scale и steps (делаем сочетания)', () => {
      const initialData = [
        { scale: 'months', steps: [1] },
        { scale: 'days', steps: [1, 2, 3] },
      ];
      const expectedData = ['months 1', 'days 1', 'days 2', 'days 3'];
      expect(createOptions(initialData)).to.eql(expectedData);
    });
  });

  describe('transformInputValues', () => {
    it('Явялется фнукцией', () => {
      expect(transformInputValues).to.be.a('function');
    });

    it(`Превращает массив задач в объект, содержащий ключи:
        startDate: @type Date,
        endDate: @type Date,
        values: @type Array of objects
        tasks: @type Array of objects
    `, () => {
        const initialData = [{
          name: 'Шаг 23',
          link: '',
          values: [
            {
              desc: 'Шаг 23',
              from: 1334837045000,
              to: 1334837183000,
              color: '#D0E4FD',
            },
          ],
        },
        {
          name: 'Шаг 1',
          link: '',
          values: [
            {
              desc: '',
              from: 1334923578000,
              to: 1334929209000,
              color: '#F9C4E1',
            },
            {
              desc: 'Шаг 1',
              from: 1334837183000,
              to: 1334923578000,
              color: '#D0E4FD',
            },
          ],
        }];
        expect(transformInputValues(initialData)).to.have.all.keys('startDate', 'endDate', 'values', 'tasks');
      });
  });

  describe('getMinDate', () => {
    it('Является функцией', () => {
      expect(getMinDate).to.be.a('function');
    });

    describe('Возвращает начало заданного периода', () => {
      const args = {
        seconds: dateFns.startOfMinute,
        minutes: dateFns.startOfHour,
        months: dateFns.startOfYear,
      };
      Object.entries(args).forEach(([key, val]) => {
        it(`Вызов функции со вторым аргументом: ${key} вернул корректную дату`, () => {
          const date = new Date();
          expect(getMinDate(date, key)).to.equal(dateFns.getTime(val(date)));
        });
      });
    });
  });

  describe('getViewportInMilliseconds', () => {
    it('Является функцией', () => {
      expect(getViewportInMilliseconds).to.be.a('function');
    });

    describe('Возвращает корректную продолжительность вьюпорта в милисекундах', () => {
      const date = new Date();
      const args = [
        { scale: 'seconds', step: 1, cellsCount: 24 },
        { scale: 'seconds', step: 0, cellsCount: 24 },
        { scale: 'minutes', step: 10, cellsCount: 0 },
        { scale: 'hours', step: 12, cellsCount: 12 },
        { scale: 'months', step: 1, cellsCount: 42 },
      ];
      const result = (start, scale, step, cellsCount) => dateFns.differenceInMilliseconds(
        dateFns[`add${_.capitalize(scale)}`](start, step * cellsCount),
        dateFns.parse(start),
      );

      args.forEach(({ scale, step, cellsCount }) => {
        it(`С аргументами ${scale} ${step} ${cellsCount} функция сработала верно`, () => {
          expect(getViewportInMilliseconds(date, scale, step, cellsCount)).to
            .equal(result(date, scale, step, cellsCount));
        });
      });
    });
  });

  describe('getEndOfScale', () => {
    it('Является функцией', () => {
      expect(getEndOfScale).to.be.a('function');
    });

    describe('Возвращает конец заданного периода', () => {
      const date = new Date();
      const args = {
        minutes: dateFns.endOfHour(date),
        hours: dateFns.endOfDay(date),
        days: dateFns.endOfMonth(date),
      };
      Object.entries(args).forEach(([scale, result]) => {
        it(`Для периода ${scale} функция вернула верный результат`, () => {
          expect(getEndOfScale(scale, date)).to.equal(dateFns.getTime(result));
        });
      });
    });
  });

  describe('getMaxDate', () => {
    it('Является функцией', () => {
      expect(getMaxDate).to.be.a('function');
    });

    describe(`Возвращает максимальную из двух дат, так,
    что их разность становится кратной количеству миллисекунд в ячейке`, () => {
        // Количество милисекунд должно быть меньше или равно разности дат
        // Для ускорения вычислений проверка отлючена
        const date = new Date();
        const args = [
          {
            min: dateFns.getTime(date),
            max: dateFns.getTime(dateFns.addDays(date, 1)),
            cells: 8.64e7,
          },
          {
            min: dateFns.getTime(date),
            max: dateFns.getTime(dateFns.addHours(date, 1)),
            cells: 5 * 1000,
          },
        ];
        args.forEach(({ min, max, cells }) => {
          it(`С аргументами ${min} ${max} ${cells} функция вернула корректный результат`, () => {
            expect((getMaxDate(min, max, cells) - min) % cells).to.equal(0);
            expect(getMaxDate(max, min, cells)).to.be.at.least(min);
          });
        });
      });
  });

  describe('calcViewport', () => {
    it('Является функцией', () => {
      expect(calcViewport).to.be.a('function');
    });

    describe('Возвращает длину вьюпорта в миллисекундах', () => {
      const args = [
        { start: new Date(), scale: 'minutes', step: 30, cellsCount: 30, f: dateFns.addMinutes },
        { start: new Date(), scale: 'hours', step: 6, cellsCount: 50, f: dateFns.addHours },
      ];
      args.forEach(({ start, scale, step, cellsCount, f }) => {
        it(`С аргументами ${start} ${scale} ${step} ${cellsCount} функция вернула корректный результат`, () => {
          expect(calcViewport(start, scale, step, cellsCount))
            .to.eql({ startDate: start, endDate: f(start, step * cellsCount) });
        });
      });
    });
  });

  describe('transformRow', () => {
    it('Является функцией', () => {
      expect(transformRow).to.be.a('function');
    });

    it('Возвращает функцию', () => {
      // fake data
      expect(transformRow({ startDate: new Date(), endDate: new Date() })).to.be.a('function');
    });
  });

  describe('mGetMonthsInYear', () => {
    it('Является функцией', () => {
      expect(mGetMonthsInYear).to.be.a('function');
    });

    it('Возвращает количество месяцев между датами (но не больше 12)', () => {
      expect(mGetMonthsInYear(new Date(2017, 0, 1), new Date(2017, 0, 1))).to.equal(0);
      expect(mGetMonthsInYear(new Date(2017, 0, 1), new Date(2017, 5, 1))).to.equal(5);
      expect(mGetMonthsInYear(new Date(2017, 0, 1), new Date(2018, 5, 1))).to.equal(12);
    });
  });

  describe('mGetMonthsInQuarter', () => {
    it('Явяляется функцией', () => {
      expect(mGetMonthsInQuarter).to.be.a('function');
    });

    it('Возвращает количество месяцев между датами (но не больше 3)', () => {
      expect(mGetMonthsInQuarter(new Date(2017, 0, 1), new Date(2017, 0, 1))).to.equal(0);
      expect(mGetMonthsInQuarter(new Date(2017, 0, 1), new Date(2017, 2, 1))).to.equal(2);
      expect(mGetMonthsInQuarter(new Date(2017, 0, 1), new Date(2018, 5, 1))).to.equal(3);
    });
  });

  describe('mGetDaysInYear', () => {
    it('Является функцией', () => {
      expect(mGetDaysInYear).to.be.a('function');
    });

    it('Возвращает количество дней между датами, но не меньше одного и не больше 365', () => {
      expect(mGetDaysInYear(new Date(2017, 0, 1), new Date(2017, 0, 1))).to.equal(1);
      expect(mGetDaysInYear(new Date(2017, 0, 1), new Date(2017, 2, 31))).to.equal(90);
      expect(mGetDaysInYear(new Date(2017, 0, 1), new Date(2018, 5, 1))).to.equal(365);
    });
  });

  describe('mGetDaysInMonth', () => {
    it('Является функцией', () => {
      expect(mGetDaysInMonth).to.be.a('function');
    });

    it('Возвращает количество дней между датами, но не больше количества дней в месяце', () => {
      expect(mGetDaysInMonth(new Date(2017, 0, 1), new Date(2017, 0, 1))).to.equal(0);
      expect(mGetDaysInMonth(new Date(2017, 0, 5), new Date(2017, 0, 30))).to.equal(25);
      expect(mGetDaysInMonth(new Date(2017, 0, 1), new Date(2018, 5, 1))).to.equal(31);
    });
  });

  describe('mGetHoursInDay', () => {
    it('Является функцией', () => {
      expect(mGetHoursInDay).to.be.a('function');
    });

    it('Возвращает количество часов между датами, но не больше 24', () => {
      expect(mGetHoursInDay(
        new Date(2017, 0, 1, 1),
        new Date(2017, 0, 1, 1),
        1)).to.equal(0);
      expect(mGetHoursInDay(
        new Date(2017, 0, 1, 0, 0),
        new Date(2017, 0, 1, 12, 30),
        1)).to.equal(12.5);
      expect(mGetHoursInDay(
        new Date(2017, 0, 1, 0),
        new Date(2017, 0, 1, 12),
        6)).to.equal(2);
      expect(mGetHoursInDay(
        new Date(2017, 0, 1, 0),
        new Date(2017, 1, 1, 12),
        12)).to.equal(2);
    });
  });

  describe('mGetMinutesInHour', () => {
    it('Явялется функцией', () => {
      expect(mGetMinutesInHour).to.be.a('function');
    });

    it('Возвращает колчиество минут между двумя датами, но не больше 60', () => {
      expect(mGetMinutesInHour(
        new Date(2017, 0, 1, 0),
        new Date(2017, 0, 1, 0),
        1)).to.equal(0);
      expect(mGetMinutesInHour(
        new Date(2017, 0, 1, 1),
        new Date(2017, 0, 1, 1, 30),
        1)).to.equal(30);
      expect(mGetMinutesInHour(
        new Date(2017, 0, 1, 0, 0),
        new Date(2017, 0, 1, 0, 30),
        15)).to.equal(2);
      expect(mGetMinutesInHour(
        new Date(2017, 0, 1, 0, 0, 0),
        new Date(2017, 0, 1, 0, 30, 30),
        1)).to.equal(30.5);
      expect(mGetMinutesInHour(
        new Date(2017, 0, 1, 0),
        new Date(2017, 0, 2, 0),
        1)).to.equal(60);
    });
  });

  describe('mGetSecondsInMinute', () => {
    it('Является функцией', () => {
      expect(mGetSecondsInMinute).to.be.a('function');
    });

    it('Возвращает количество секунд между двумя датами, но не больше 60', () => {
      expect(mGetSecondsInMinute(
        new Date(2017, 0, 1, 0, 0, 0),
        new Date(2017, 0, 1, 0, 0, 0),
        1)).to.equal(0);
      expect(mGetSecondsInMinute(
        new Date(2017, 0, 1, 0, 0, 0),
        new Date(2017, 0, 1, 0, 0, 30),
        1)).to.equal(30);
      expect(mGetSecondsInMinute(
        new Date(2017, 0, 1, 0, 0, 0),
        new Date(2017, 0, 1, 0, 0, 30),
        15)).to.equal(2);
      expect(mGetSecondsInMinute(
        new Date(2017, 0, 1, 0, 0, 0),
        new Date(2017, 0, 1, 0, 5, 0),
        1)).to.equal(60);
    });
  });

  describe('normalizeDate', () => {
    it('Явялется функцией', () => {
      expect(normalizeDate).to.be.a('function');
    });

    it('Делает остаток от деления даты на шаг равным нулю', () => {
      expect(normalizeDate(new Date(2017, 0, 1), 'months', 1)).to.equal(new Date(2017, 0, 1).getTime());
      expect(normalizeDate(new Date(2017, 0, 1, 13), 'hours', 12)).to.equal(new Date(2017, 0, 1, 12).getTime());
    });
  });

  describe('calcMaxScale', () => {
    it('Является функцией', () => {
      expect(calcMaxScale).to.be.a('function');
    });

    describe('Возвращает индекс максимального подходящего масштаба', () => {
      const scales = createOptions([
        { scale: 'months', steps: [1] },
        { scale: 'days', steps: [1] },
        { scale: 'hours', steps: [12, 8, 6, 3, 1] },
        { scale: 'minutes', steps: [30, 15, 5, 1] },
        { scale: 'seconds', steps: [30, 15, 5, 1] },
      ]);
      const date = new Date();
      const args = [
        { start: date, end: dateFns.addDays(date, 1), cells: 5, result: 4 },
        { start: date, end: dateFns.addDays(date, 1), cells: 100, result: 8 },
        { start: date, end: dateFns.addDays(date, 1), cells: 2, result: 1 },
        { start: date, end: dateFns.addDays(date, 1), cells: 1, result: 0 },
      ];
      args.forEach(({ start, end, cells, result }) => {
        it(`С аргументами ${start} ${end} ${cells} ${result} функция сработала верно`, () => {
          expect(calcMaxScale(start, end, cells, scales)).to.equal(result);
        });
      });
    });
  });
});
