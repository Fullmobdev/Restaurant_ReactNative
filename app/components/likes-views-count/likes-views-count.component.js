import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../styles/colors.styles';
import { Typography } from '../../styles/typography.styles';
import { formatReviewStats } from '../helpers/review-stats-helpers';
import UserThumbnailGroup from '../user-thumbnail-group/user-thumbnail-group.component';


class LikesViewsCount extends Component {
    renderText(numLikes, numViews) {
        return (
            <View style={styles.countTextContainer}>
                <Text style={styles.countText}>{ `${formatReviewStats(numLikes)} likes` }</Text>
                <Text style={styles.middleDot}>&#183;</Text>
                <Text style={styles.countText}>{ `${formatReviewStats(numViews)} views` }</Text>
            </View>
        );        
    }

    render() {
        const { 
            disabled,
            numLikes,
            numViews, 
            onPress,
            showUsers,
            userIds
        } = this.props;

        return (
            <TouchableOpacity
                disabled={disabled}
                style={styles.container}
                onPress={onPress}
            >
                { showUsers && 
                    <UserThumbnailGroup 
                        maxNumThumbnails={3}
                        userIds={userIds}
                    />
                }
                { this.renderText(numLikes, numViews) }
            </TouchableOpacity>
        );
    }
}

LikesViewsCount.propTypes = {
    disabled: PropTypes.bool,
    numLikes: PropTypes.number,
    numViews: PropTypes.number, 
    onPress: PropTypes.func,
    showUsers: PropTypes.func,
    userIds: PropTypes.arrayOf(PropTypes.string)
};

LikesViewsCount.defaultProps = {
    disabled: false,
    numLikes: 0,
    numViews: 0,
    onPress: () => {},
    showUsers: false,
    userIds: []
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    countTextContainer: {
        flexDirection: 'row', 
        alignItems: 'center', 
        position: 'relative',
    },
    countText: {
        ...Typography.bodySmall,
        color: Colors.ViewsGray2,
        fontWeight: '800',
        letterSpacing: 0.5
    },
    middleDot: {
        fontSize: 24,
        color: Colors.ViewsGray2,
        marginHorizontal: 5
    }
});

export default LikesViewsCount;
