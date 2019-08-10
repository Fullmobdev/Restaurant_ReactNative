import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as EmailValidator from 'email-validator';
import { Actions } from 'react-native-router-flux';
import * as types from '../../types/authentication.types';
import { emailFieldSubmitted, retreiveUserProviders } from '../../actions/authentication.action';

import CreateAccountFormView from './create-account-presentation.component';

class EmailCaptureForm extends Component {
  constructor(props) {
    super(props);
    this.state = { email: '', validatorHint: '' };
  }

  alertWithError = errorMessage => {
    this.setState({ isValid: false });
    this.setState({ validatorHint: errorMessage });
  };

  navigateToNextScene = scene => {
    Actions[scene]();
  };

  nextButtonPressed = () => {
    const { isValid, hint } = this.inputValidator();
    const { nextScene } = this.props;

    if (!isValid) {
      //Validate e-mail format on client side
      this.setState({ validatorHint: hint });
    } else {
      //Validate e-mail format on server side
      const { email } = this.state;
      this.props
        .retreiveUserProviders(email)
        .then(provider => {
          if (provider === types.ACCOUNT_NOT_AVAILABLE) {
            this.props.emailFieldSubmitted(email);
            this.navigateToNextScene(nextScene);
          } else {
            //TODO - check if it's related to facebook or email provider
            this.alertWithError(`Email already linked to account with ${provider}`);
          }
        })
        .catch(error => {
          this.alertWithError(error);
        });
    }
  };

  isInputValid = () => {
    const { email } = this.state;
    return email.length >= 1;
  };

  inputValidator = () => {
    let validatorResponse = { isValid: true, hint: '' };
    const { email } = this.state;

    if (!EmailValidator.validate(email)) {
      validatorResponse = {
        isValid: false,
        hint: 'Please enter a valid email address'
      };
    }
    return validatorResponse;
  };

  enableLoginButton = () => {
    const { email } = this.state;
    return email.length >= 1;
  };

  logInPressed = () => {
    const { footerScene } = this.props;
    this.navigateToNextScene(footerScene);
  };

  render() {
    const header = `Hello ${this.props.firstName}!`;
    return (
      <CreateAccountFormView
        displayHeader={header}
        displayText="What is your email?"
        displayPlaceholder="email@domain.com"
        formData={this.state.email}
        formDataFieldChanged={email => {
          this.setState({ email });
          this.setState({ validatorHint: '' });
        }}
        validatorHint={this.state.validatorHint}
        buttonEnabled={this.enableLoginButton}
        buttonTitle="Next"
        onButtonPressedAction={this.nextButtonPressed}
        logInPressed={this.logInPressed}
        capitalize="none"
        secureText={false}
      />
    );
  }
}

const mapStateToProps = state => {
  const { firstName, lastName } = state.user;
  return { firstName, lastName };
};

export default connect(
  mapStateToProps,
  {
    emailFieldSubmitted,
    retreiveUserProviders
  }
)(EmailCaptureForm);
