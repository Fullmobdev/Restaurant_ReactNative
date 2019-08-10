import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import UserThumbnail from '../user-thumbnail/user-thumbnail.component';
import { withUser } from '../with-user/with-user.component';

class UserThumbnailGroup extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        const { maxNumThumbnails, userIds } = this.props;

        if (maxNumThumbnails !== nextProps.maxNumThumbnails ||
            userIds != nextProps.userIds) {
                return true;
            }

        return false;
    }

    getUserThumbnails = () => {
        const { userIds, maxNumThumbnails } = this.props;
        const bound = maxNumThumbnails ? 
            Math.min(userIds.length, maxNumThumbnails) : userIds.length;

        const thumbnails = [];
        for (let i = 0; i < bound; i++) {
            const ProfilePic = withUser(UserThumbnail, 'photoUrl', 'profilePicUrl');
            const right = i * 10;
            const zIndex = (bound * 10) - right;

            thumbnails.push(
                <ProfilePic
                    key={userIds[i]}
                    disabled 
                    userId={userIds[i]}
                    containerStyle={[styles.profilePic, { right, zIndex }]}
                    size='Sm'
                />          
            );
        }
        return thumbnails;
    }

    render() {
        const thumbnails = this.getUserThumbnails();
        const thumbnailsLength = thumbnails.length;
        const marginRight = thumbnailsLength ? 20 - (thumbnailsLength * 10) : 0; // Magic
        return (
          <View 
            style={{ 
              flexDirection: 'row', 
              marginRight
            }}
          >
            { thumbnails }
          </View>
        );
    }
}

UserThumbnailGroup.propTypes = {
    maxNumThumbnails: PropTypes.number,
    userIds: PropTypes.arrayOf(PropTypes.string)
};

UserThumbnailGroup.defaultProps = {
    userIds: []
};

const styles = StyleSheet.create({
    profilePic: {
        borderColor: 'white',
        borderRadius: 20,
        borderWidth: 1,
        position: 'relative'
    }
});

export default UserThumbnailGroup;
