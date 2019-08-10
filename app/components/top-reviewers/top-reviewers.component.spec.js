import Adapter from 'enzyme-adapter-react-16';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';

import TopReviewers from './top-reviewers-presentation.component';
import UserThumbnail from '../user-thumbnail/user-thumbnail.component';

import { reviewers } from './top-reviewers.mock';

Enzyme.configure({ adapter: new Adapter() });

// [ ] should add whether user is following top reviewer in mapStateToProps
describe('<TopReviews />');


// [ x] should display the list of top reviewers
// [ ] should handle list of null reviewers
// [ ] should handle null properties
// [ ] should navigate to the user's page when clicked
// [ ] should follow the user when clicked

// [ ] should handle an empty list of reviewers
// [ ] should call callback when unfollow/follow is clicked

describe('<TopReviewersView />', () => {
    test('component exists', () => {
        const wrapper = shallow(<TopReviewers />);
        expect(wrapper).not.toBeNull();
    });

    test('displays a list of top reviewers', () => {
        const wrapper = 
        shallow(
            <TopReviewers 
                reviewers={reviewers} 
            />
        );

        const userThumbnails = wrapper.find(UserThumbnail);
        expect(userThumbnails).toHaveLength(reviewers.length);
    });

    test('displays a <FollowButton /> by default', () => {
        
    });
});
