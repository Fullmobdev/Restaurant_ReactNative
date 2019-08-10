import React, { Component } from 'react';
import { connect } from 'react-redux';
import { loadUser } from '../../actions/users/users.action';

export const withUser = (WrappedComponent, fromProp, toProp) => {
    const component = class extends Component {
        componentDidMount() {
            const { userId, onLoadUser, user } = this.props;
            if (!user || !user[fromProp]) {
                onLoadUser(userId);
            }
        }

        render() {
            let { user } = this.props;
            user = user || {};

            const props = {
                ...this.props,
                [toProp]: user[fromProp]
            };
            return (
                <WrappedComponent {...props} />
            );
        }
    };

    const mapStateToProps = (state, ownProps) => {
        const { user: stateUser, users } = state;
        const { userId } = ownProps;

        const user = userId === stateUser.uid ? stateUser : users.byId[userId];

        return {
            user
        };
    };

    const mapDispatchToProps = (dispatch) => {
        return {
            onLoadUser: (userId) => {
                dispatch(loadUser({ userId }));
            }
        };
    };

    return connect(mapStateToProps, mapDispatchToProps)(component);
};
