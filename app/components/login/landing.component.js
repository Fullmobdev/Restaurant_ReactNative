import React, { Component } from 'react';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LandingView from './landing-view.component';
import * as SceneType from '../../types/scene.types';

import {
  loginUserFacebook,
  loginUserAnonymously
 } from '../../actions/authentication.action';
import Spinner from '../spinner/spinner';

class Landing extends Component {
  constructor(props) {
    super(props);
  }

  navigateToNextScene = (scene) => {
    Actions[scene]();
  }

  loginPressed = () => {
    const { loginScene } = this.props;
    if (!this.props.fbLoginLoading) {
      this.navigateToNextScene(loginScene);
    }
  }

  createAccountPressed = () => {
    const { createAccountScene } = this.props;
    this.navigateToNextScene(createAccountScene);
  }

  loginFacebookPressed = () => {
    const { nextScene } = this.props;
    this.props.loginUserFacebook()
    .then(() => {
      this.navigateToNextScene(nextScene)
    })
    .catch((error) => {
      this.alertWithError(error.message);
    });
  }

  renderButtonContent = () => {
    if (this.props.fbLoginLoading) {
      return (
        <Spinner
          marginTop={7}
          height={20}
          size='small'
        />
      );
    }

    return (
      <Text>
       <Icon name="facebook" size={18} />
        Connect with Facebook
      </Text>
    );
  }

  guestLoginPressed = () => {
    this.props.loginUserAnonymously()
    .then(() => {
      this.navigateToNextScene(SceneType.APP);
    });
  }

  render() {
    return (
      <LandingView
        loginPressed={this.loginPressed}
        createAccountPressed={this.createAccountPressed}
        loginFacebookPressed={this.loginFacebookPressed}
        renderButtonContent={this.renderButtonContent}
        fbLoginLoading={this.props.fbLoginLoading}
        guestLoginPressed={this.guestLoginPressed}
      />
    );
  }
}

const mapStateToProps = (state) => {
  const { id } = state.user;
  const { error, fbLoginLoading } = state.ui;

  return { id, error, fbLoginLoading };
};

function mapDispatchToProps(dispatch) {
  return ({
    loginUserFacebook: () => dispatch(loginUserFacebook()),
    loginUserAnonymously: () => dispatch(loginUserAnonymously())
  });
}

export default connect(mapStateToProps, mapDispatchToProps)(Landing);
