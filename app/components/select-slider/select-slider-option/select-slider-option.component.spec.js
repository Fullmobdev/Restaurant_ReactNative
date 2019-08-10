import Adapter from 'enzyme-adapter-react-16';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';

import SelectSliderOption from './select-slider-option.component';

Enzyme.configure({ adapter: new Adapter() });

describe('<SelectSliderOption>', () => {
    // test('displays option as label', () => {
    //     const wrapper = shallow(
    //         <SelectSliderOption
    //             option={'option1'} 
    //             selectPositionX={0}
    //         />
    //     );
    //     expect(wrapper).toMatchSnapshot();
    // });
});
