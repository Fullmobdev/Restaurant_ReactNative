import PropTypes from 'prop-types';
import React from 'react';
import { 
    ScrollView, 
    StyleSheet, 
    Text,
    TouchableOpacity,
    View 
} from 'react-native';

import UserThumbnail from '../user-thumbnail/user-thumbnail.component';
import FollowButton from '../follow-button/follow-button.component';
import UnfollowButton from '../unfollow-button/unfollow-button.component';
import { Typography } from '../../styles/typography.styles';
import Colors from '../../styles/colors.styles';

const TopReviewersView = (props) => {
    const { reviewers } = props;

    return (
        <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
        >
            { reviewers.map(reviewer => renderReviewer(reviewer, props)) }
        </ScrollView>
    );
};

const renderReviewer = (reviewer, props) => {
    const {
        onFollow, 
        onUnfollow, 
        onUserPress,
        showFollowButtons,
        userId
    } = props;

    const { 
        firstName, 
        lastName, 
        isFollowing,
        isFollowingLoading,
        photoUrl, 
        uid 
    } = reviewer || {};
    const isUser = userId === uid;

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.thumbnailContainer}
                onPress={() => onUserPress({ uid, firstName, lastName })}
            >
                <UserThumbnail 
                    key={uid}
                    disabled
                    profilePicUrl={photoUrl}
                    size='Md' 
                />
                <Text 
                    style={styles.fullName}
                    ellipsizeMode='tail'
                    numberOfLines={!isUser ? 1 : 2}
                >
                    {`${firstName} ${lastName}`}
                </Text>
            </TouchableOpacity>
            { !isUser && showFollowButtons && renderFollowButtons(reviewer, isFollowing, isFollowingLoading, onFollow, onUnfollow) } 
        </View>
    );
};

const renderFollowButtons = (reviewer, isFollowing, loading, onFollow, onUnfollow) => {
    return isFollowing ? 
        <UnfollowButton 
            loading={loading}
            onUnfollow={() => onUnfollow(reviewer)} 
        /> : 
        <FollowButton 
            loading={loading}
            onFollow={() => onFollow(reviewer)} 
        />;
};

TopReviewersView.propTypes = {
    reviewers: PropTypes.arrayOf(PropTypes.object),
    onFollow: () => {},
    onUnfollow: PropTypes.func,
    onUserPress: PropTypes.func,
    showFollowButtons: PropTypes.bool
};

TopReviewersView.defaultProps = {
    reviewers: [],
    onFollow: () => {},
    onUnfollow: () => {},
    onUserPress: () => {},
    showFollowButtons: true
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        alignItems: 'center',
        marginRight: 10,
        borderColor: Colors.ViewsGray2,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 20,
        width: 130
    },
    thumbnailContainer: {
        alignItems: 'center'
    },
    fullName: {
        textAlign: 'center',
        marginVertical: 10,
        width: 80,
        ...Typography.body
    }
});

export default TopReviewersView;
