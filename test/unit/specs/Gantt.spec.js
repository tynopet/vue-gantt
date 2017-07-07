import Vue from 'vue';
import Gantt from '@/components/Gantt';
import data from './test-data.json';


describe('Gantt.vue', () => {
  it('should render correct childrens', () => {
    const Constructor = Vue.extend(Gantt);
    const vm = new Constructor({ propsData: { data } }).$mount();
    expect(vm.$el.childElementCount)
      .to.equal(2);
  });
});
