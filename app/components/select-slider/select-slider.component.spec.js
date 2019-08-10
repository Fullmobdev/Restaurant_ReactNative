import Adapter from 'enzyme-adapter-react-16';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';

import SelectSlider from '../select-slider/select-slider.component';

Enzyme.configure({ adapter: new Adapter() });

describe('<SelectSlider />', () => {
    // test('displays a list of <SelectSliderItem> from options passed in', () => {
    //     const options = ['option1', 'option2'];
    //     const wrapper = shallow(<SelectSlider options={options} />);

    //     expect(wrapper).toMatchSnapshot();
    // });
});
