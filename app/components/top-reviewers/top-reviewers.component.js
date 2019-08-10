import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import { followUser, unfollowUser } from '../../actions/follow-status/follow-status.action';
import { topReviewerClick, topReviewerFollow, topReviewerUnfollow } from '../../actions/top-reviewers/top-reviewers.action';
import { selectUser } from '../../actions/users/users.action';
import TopReviewersView from './top-reviewers-presentation.component';

class TopReviewers extends Component {
    onFollowReviewer = (reviewerData) => {        
        const { onFollowUser } = this.props;
        onFollowUser(reviewerData);
    }

    onUnfollowReviewer = (reviewerData) => {
        this.props.onUnfollowUser(reviewerData);
    }

    onUserPress = (user) => {
        const { uid: userId } = user;
        const { 
            isAnonymous, 
            registrationRedirectScene, 
            onSelectUser, 
            onTopReviewerClick, 
            userScene 
        } = this.props;

        onTopReviewerClick(user);
        
        if (isAnonymous) {
            Actions[registrationRedirectScene]();
        } else {
            onSelectUser(userId);
            Actions[userScene]();
        }        
    }

    render() {
        const { isAnonymous, reviewers, userId } = this.props;

        return (
            <TopReviewersView
                userId={userId}
                reviewers={reviewers}
                onFollow={this.onFollowReviewer}
                onUnfollow={this.onUnfollowReviewer}
                onUserPress={this.onUserPress}
                showFollowButtons={!isAnonymous}
            />
        );
    }
}

TopReviewers.propTypes = {
    reviewers: PropTypes.arrayOf(PropTypes.object),
    userScene: PropTypes.string
};

TopReviewers.defaultProps = {
    reviewers: [],
    userScene: PropTypes.string
};

const mapStateToProps = (state, props) => {
    const { followStatuses, user } = state;
    const { isAnonymous, uid } = user;
    let { reviewers } = props;

    if (followStatuses[uid]) {
        const following = followStatuses[uid].following;
        reviewers = reviewers.map(reviewer => {
            const { uid: reviewerId } = reviewer;
            const reviewerFollowingStatus = following[reviewerId] || {};
            reviewer.isFollowing = !!reviewerFollowingStatus.status;
            reviewer.isFollowingLoading = !!reviewerFollowingStatus.loading;
            return reviewer;
        });
    }

    return {
        isAnonymous, 
        reviewers, 
        userId: uid 
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onFollowUser: (reviewerData) => {
            const user = getReviewer(reviewerData); 
            dispatch(followUser(user.uid, user));
            dispatch(topReviewerFollow(reviewerData));
        },
        onUnfollowUser: (reviewerData) => { 
            const { uid } = reviewerData;
            dispatch(unfollowUser(uid));
            dispatch(topReviewerUnfollow(reviewerData));
        },
        onSelectUser: (userId) => { dispatch(selectUser({ userId })); },
        onTopReviewerClick: (user) => { dispatch(topReviewerClick(user)); }
    };
};

const getReviewer = (reviewerData) => {
    // Note: reviewerData has more info than needed
    const { firstName, lastName, photoUrl, uid } = reviewerData;
    return { firstName, lastName, photoUrl, uid };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TopReviewers);
