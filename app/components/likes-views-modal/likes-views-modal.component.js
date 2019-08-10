import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import SafeAreaView from 'react-native-safe-area-view';
import { connect } from 'react-redux';
import TitleBarBackButton from '../title-bar-back-button/title-bar-back-button.component';
import TitlebarTitle from '../title-bar/title-bar-title.component';
import TitleBar from '../title-bar/title-bar.component';
import { 
    closeLikesViewsModal, 
    showLikesViewsModal 
} from '../../actions/likes-views-modal/likes-views-modal.action';
import ViewsColors from '../../styles/colors.styles';
import { Typography } from '../../styles/typography.styles';
import UserList from '../user-list/user-list.component';


class LikesViewsModal extends Component {
    state = {
        likesUsersShowing: true
    };

    componentDidMount() {
        this.props.onShow();
    }

    onBackPress = () => {
        this.props.onClose();
        Actions.pop();
    }

    onSwitchUsersList = () => {
        const { likesUsersShowing } = this.state;
        this.setState({ likesUsersShowing: !likesUsersShowing });
    }

    renderUsersHeader = () => {
        const { likesUsersShowing } = this.state;
        const headerTitle = likesUsersShowing ? 'Liked by' : 'Viewed by';
        const headerLink = likesUsersShowing ? 'Show Views' : 'Show Likes';

        return (
            <View style={styles.usersListHeader}>
                <Text style={styles.usersListHeaderText}>{ headerTitle }</Text>
                <TouchableOpacity
                    style={styles.viewsLikesLabel}
                    onPress={this.onSwitchUsersList}
                >
                    <Text style={styles.viewsLikesLabelText}>{ headerLink }</Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderUsers = () => {
        const { 
            likesUsers,
            viewsUsers
        } = this.props;
        const {
            likesUsersShowing
        } = this.state;

        const user = likesUsersShowing ? likesUsers : viewsUsers;
        
        return (            
            <UserList 
                users={user} 
                userScene={this.props.userScene}
            />
        );
    }

    render() {
        const { title } = this.props;

        return (
            <SafeAreaView>
                <TitleBar>
                    <TitleBarBackButton
                        buttonStyle={styles.backButton}
                        onPress={this.onBackPress} 
                    />
                    <TitlebarTitle 
                        containerStyle={styles.title}
                        title={title} 
                    />
                </TitleBar>
                { this.renderUsersHeader() }
                { this.renderUsers() }
            </SafeAreaView>
        );
    }
}

LikesViewsModal.propTypes = {
    title: PropTypes.string,
    numLikes: PropTypes.number,
    numViews: PropTypes.number,
    likesUsers: PropTypes.arrayOf(PropTypes.object),
    viewsUsers: PropTypes.arrayOf(PropTypes.object),
};

LikesViewsModal.defaultProps = {
    title: 'Likes and Views',
    numLikes: 0,
    numViews: 0,
    likesUsers: [],
    viewsUsers: []
};

const styles = StyleSheet.create({
    title: {
        paddingRight: 15
    },
    backButton: {
        fontSize: 34
    },
    viewsLikesLabelText: {
        ...Typography.body,
        color: ViewsColors.ViewsBlue,
        fontWeight: '800'
    },
    usersListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 15
    },
    usersListHeaderText: {
        ...Typography.body,
        fontWeight: '800'
    }
});

const mapDispatchToProps = (dispatch) => {
    return {
        onClose: () => {
            dispatch(closeLikesViewsModal());
        },
        onShow: () => {
            dispatch(showLikesViewsModal());
        }
    };
};

export default connect(null, mapDispatchToProps)(LikesViewsModal);
