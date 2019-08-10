import React, { Component } from 'react';
import { Image, Text, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import { 
  createAccountPressed, 
  emailFieldChanged, 
  forgotPasswordPressed, 
  loginAsGuest, 
  loginUser, 
  loginUserFacebook, 
  passwordFieldChanged 
} from '../../actions/authentication.action';
import imgIcons from '../img-icons/img-icons';
import Spinner from '../spinner/spinner';
import LoginFormView from './login-form-presentation.component';
import { facebookLoginErrorMsg, loginErrorMsg } from './login-form.constants';

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      validatorHint: ''
    };
  }

  alertWithError = errorMessage => {
    this.setState({ validatorHint: errorMessage });
  };

  navigateToNextScene = scene => {
    Actions[scene]();
  };

  loginFacebookPressed = () => {
    const { nextScene } = this.props;

    if (!this.props.loginLoading && !this.props.fbLoginLoading) {
      this.props
        .loginUserFacebook()
        .then(() => this.navigateToNextScene(nextScene))
        .catch(error => {
          this.alertWithError(facebookLoginErrorMsg);
        });
    }
  };

  loginPressed = () => {
    const { email, password } = this.state;
    const { nextScene } = this.props;

    this.props
      .loginUser({ email, password })
      .then(user => {
        this.setState({ email: '', password: '' });
        this.navigateToNextScene(nextScene);
      })
      .catch(error => {
        this.alertWithError(loginErrorMsg);
      });
  };

  forgotPasswordPressed = () => {
    const { forgotPassScene } = this.props;
    if (!this.props.loginLoading && !this.props.fbLoginLoading) {
      this.navigateToNextScene(forgotPassScene);
    }
  };

  createAccountPressed = () => {
    const { footerScene } = this.props;
    if (!this.props.loginLoading && !this.props.fbLoginLoading) {
      this.navigateToNextScene(footerScene);
    }
  };

  loginAsGuestPressed = () => {
    const { loginScene } = this.props;
    this.props.loginAsGuest();
    this.navigateToNextScene(loginScene);
  };

  enableLoginButton = () => {
    const { email, password } = this.state;
    return email.length >= 1 && password.length >= 1;
  };

  renderContent = () => {
    return (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <Image source={imgIcons.fbLogo} style={{ width: 41, height: 41 }} />
        <Text>Log In with Facebook</Text>
      </View>
    );
  };

  renderButtonTitle = () => {
    if (this.props.loginLoading) {
      return <Spinner height={20} marginTop={5} size="small" />;
    }

    return <Text>Log In</Text>;
  };

  render() {
    return (
      <LoginFormView
        loginFacebookPressed={this.loginFacebookPressed}
        loginPressed={this.loginPressed}
        forgotPasswordPressed={this.forgotPasswordPressed}
        createAccountPressed={this.createAccountPressed}
        email={this.state.email}
        password={this.state.password}
        emailFieldChanged={email => {
          this.setState({ email });
          this.setState({ validatorHint: '' });
        }}
        passwordFieldChanged={password => {
          this.setState({ password });
          this.setState({ validatorHint: '' });
        }}
        buttonEnabled={this.enableLoginButton()}
        validatorHint={this.state.validatorHint}
        renderContent={this.renderContent}
        buttonTitle={this.renderButtonTitle()}
        fbLoginLoading={this.props.fbLoginLoading}
        loginLoading={this.props.loginLoading}
      />
    );
  }
}

/**
 * Redux state connectors
 */

const mapStateToProps = state => {
  const { id } = state.user;
  const { error, fbLoginLoading, loginLoading } = state.ui;

  return { id, error, fbLoginLoading, loginLoading };
};

function mapDispatchToProps(dispatch) {
  return {
    emailFieldChanged,
    passwordFieldChanged,
    loginUser: ({ email, password }) => dispatch(loginUser({ email, password })),
    loginAsGuest: deviceDetails => dispatch(loginAsGuest(deviceDetails)),
    loginUserFacebook: () => dispatch(loginUserFacebook()),
    createAccountPressed: () => dispatch(createAccountPressed()),
    forgotPasswordPressed: () => dispatch(forgotPasswordPressed())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginForm);
