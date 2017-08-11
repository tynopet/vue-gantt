import Vue from 'vue';
import Gantt from '@/components/Gantt';
import data from './test-data.json';

const createComponent = (Component, props, element = null) => {
  const Constructor = Vue.extend(Component);
  const component = new Constructor({ propsData: props });
  return element ? component.$mount(element) : component.$mount();
};

describe('Gantt', () => {
  it('Гант имеет mounted хук', () => {
    expect(Gantt.mounted).to.be.a('function');
  });

  it('Гант примонтировался без ошибок', () => {
    const vm = createComponent(Gantt, { data });
    // eslint-disable-next-line no-unused-expressions
    expect(vm.$el.childElementCount).to.be.ok;
  });

  it('Гант примонтировался  элементу без ошибок', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const vm = createComponent(Gantt, { data }, el);
    expect(vm.$el.clientWidth).to.be.at.least(0);
  });

  describe('Функционал', () => {
    beforeEach(() => {
      const el = document.createElement('div');
      el.setAttribute('id', 'app');
      document.body.appendChild(el);
    });

    afterEach(() => {
      document.querySelector('.vue-gantt').remove();
    });

    it('Изменение ползунка вызывает пересчет Ганта', (done) => {
      const vm = createComponent(Gantt, { data }, '#app');
      const viewportStart = vm.viewportStart;
      vm.handlePeriodChange({ target: { value: vm.max } });
      Vue.nextTick()
        .then(() => expect(vm.viewportStart).to.not.equal(viewportStart))
        .then(() => done())
        .catch(done);
    });

    it('Изменение периода вызывает пересчет Ганта', (done) => {
      const vm = createComponent(Gantt, { data }, '#app');
      const viewportStart = vm.viewportStart;
      vm.handleScaleChange({ target: { value: 'seconds 1' } });
      Vue.nextTick()
        .then(() => expect(vm.viewportStart).to.not.equal(viewportStart))
        .then(() => done())
        .catch(done);
    });

    it('Прокрутка мышью вызывает пересчет Ганта', (done) => {
      const vm = createComponent(Gantt, { data }, '#app');
      const viewportStart = vm.viewportStart;
      vm.handleWheel({ deltaY: 1 });
      Vue.nextTick()
        .then(() => expect(vm.viewportStart).to.not.equal(viewportStart))
        .then(() => done())
        .catch(done);
    });

    it('Клик по шапке меняет масштаб', (done) => {
      const vm = createComponent(Gantt, { data }, '#app');
      vm.handleHeaderClick({ date: vm.min, scale: 'seconds' });
      Vue.nextTick()
        .then(() => {
          expect(vm.scale).to.equal('seconds');
          expect(vm.step).to.equal(1);
        })
        .then(() => done())
        .catch(done);
    });

    it('Клик по задаче перематывает график', (done) => {
      const vm = createComponent(Gantt, { data }, '#app');
      vm.handleTaskClick(vm.min + vm.msInCell);
      Vue.nextTick()
        .then(() => expect(vm.viewportStart).to.equal(vm.min + vm.msInCell))
        .then(() => done())
        .catch(done);
    });
  });
});
