import React, { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import CreateAccountFormView from './create-account-presentation.component';
import {
  passwordFieldSubmitted,
  createUser,
  resetErrorValues
} from '../../actions/authentication.action';
import Spinner from '../spinner/spinner';

class PasswordCaptureForm extends Component {
  constructor(props) {
    super(props);
    this.state = { password: '', validatorHint: '' };
  }

  alertWithError = errorMessage => {
    Alert.alert('Error', errorMessage, [
      {
        text: 'OK',
        onPress: () => {
          this.props.resetErrorValues();
        }
      }
    ]);
  };

  navigateToNextScene = scene => {
    Actions[scene]();
  };

  // TODO - We need to validate password before moving forward to create account
  nextButtonPressed = () => {
    const { isValid, hint } = this.inputValidator();
    const { nextScene } = this.props;

    if (!isValid) {
      this.setState({ validatorHint: hint });
      return;
    }

    const { email, firstName, lastName } = this.props;
    const { password } = this.state;

    this.props.passwordFieldSubmitted(password);
    this.props
      .createUser({ email, password, firstName, lastName })
      .then(() => {
        this.navigateToNextScene(nextScene);
      })
      .catch(error => {
        this.alertWithError(error.message);
      });
  };

  //Password must be at least 6 characters long
  //Password must contain at least one letter and one number
  inputValidator = () => {
    let validatorResponse = { isValid: true, hint: '' };
    const { password } = this.state;

    if (password.length < 6) {
      validatorResponse = {
        isValid: false,
        hint: 'Password should be at least 6 characters long'
      };
      return validatorResponse;
    }

    const re = /[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/;
    if (!re.test(password)) {
      validatorResponse = {
        isValid: false,
        hint: 'Password should include both letters and numbers'
      };
    }
    return validatorResponse;
  };

  enableLoginButton = () => {
    const { password } = this.state;
    return password.length >= 1;
  };

  logInPressed = () => {
    const { footerScene } = this.props;
    this.navigateToNextScene(footerScene);
  };

  renderButtonTitle = () => {
    if (this.props.loading) {
      return <Spinner marginTop={5} height={20} size="small" />;
    }

    return 'Sign up';
  };

  render() {
    return (
      <CreateAccountFormView
        displayHeader="Almost done!"
        displayText="Choose a password"
        displayPlaceholder="Password"
        formData={this.state.password}
        formDataFieldChanged={password => {
          this.setState({ password });
          this.setState({ validatorHint: '' });
        }}
        validatorHint={this.state.validatorHint}
        buttonEnabled={this.enableLoginButton}
        buttonTitle={this.renderButtonTitle()}
        onButtonPressedAction={this.nextButtonPressed}
        logInPressed={this.logInPressed}
        capitalize="none"
        secureText
      />
    );
  }
}

const mapStateToProps = state => {
  const { email, firstName, lastName } = state.user;
  const { error, loading } = state.ui;

  return { email, firstName, lastName, error, loading };
};

function mapDispatchToProps(dispatch) {
  return {
    createUser: ({ email, password, firstName, lastName }) =>
      dispatch(createUser({ email, password, firstName, lastName })),
    passwordFieldSubmitted: password => dispatch(passwordFieldSubmitted(password)),
    resetErrorValues: () => dispatch(resetErrorValues())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PasswordCaptureForm);
