import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import { followUser, unfollowUser } from '../../actions/follow-status/follow-status.action';
import { selectUser } from '../../actions/users/users.action';
import UserItem from '../profile/userItem.component';

class UserList extends Component {
    followUser = (userId, followedUser) => {
        this.props.onFollowUser(userId, followedUser);
    };

    unfollowUser = (userId) => {
        this.props.onUnfollowUser(userId);
    }

    onUserPress = userId => {
        const { onSelectUser, userScene } = this.props;
        
        onSelectUser(userId);
        Actions[userScene]();
    }

    renderUserItem = (data) => {
        const { item } = data;
        return (
            <UserItem 
                item={item}
                follow={this.followUser}
                unFollow={this.unfollowUser}
                onPress={this.onUserPress}
            />
        );
    }

    render() {
        const { users } = this.props;

        return (
            <FlatList
                keyboardShouldPersistTaps="always"
                data={users}
                renderItem={this.renderUserItem}
                keyExtractor={item => item.userId}
            />
        );
    }
}

UserList.propTypes = {
    users: PropTypes.arrayOf(PropTypes.object)
};

UserList.defaultProps = {
    users: []
};


const mapDispatchToProps = (dispatch) => {
    return {
        onFollowUser: (followedId, followedUser) => {
            dispatch(followUser(followedId, followedUser));
        },
        onSelectUser: (userId) => {
            dispatch(selectUser({ userId }));
        },
        onUnfollowUser: followedId => {
            dispatch(unfollowUser(followedId));
        }
    };
};

export default connect(null, mapDispatchToProps)(UserList);
