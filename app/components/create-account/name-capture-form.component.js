import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import * as EmailValidator from 'email-validator';
import CreateAccountFormView from './create-account-presentation.component';
import LoginBackground from '../login/login-background';
import * as types from '../../types/authentication.types';
import { retreiveUserProviders, createUser } from '../../actions/authentication.action';

class NameCaptureForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullName: '',
      nameHint: '',
      email: '',
      emailHint: '',
      password: '',
      passwordHint: '',
      isValid: false,
      checked: false
    };
  }

  navigateToNextScene = scene => {
    Actions[scene]();
  };

  navigateToPrivacyPolicy = () => {
    const { privacyPolicyScene } = this.props;
    this.navigateToNextScene(privacyPolicyScene);
  }

  navigateToTermsOfService = () => {
    const { termsOfServiceScene } = this.props;
    this.navigateToNextScene(termsOfServiceScene);
  }

  navigateToPreviousScene = () => {
    Actions.pop();
  };

  parseName = fullName => {
    let firstName = fullName.split(' ')[0];
    let lastName = fullName.split(' ')[1];

    firstName = firstName == null ? '' : firstName;
    lastName = lastName == null ? '' : lastName;
    return { firstName, lastName };
  };

  nextButtonPressed = () => {
    this.nameValidator();
    this.passwordValidator();
    this.emailValidator();
  };

  nameValidator = () => {
    this.setState({
      isValid: true,
      nameHint: ''
    });
    const { fullName } = this.state;

    //Name must contain at least one character
    if (fullName.trim().length === 0) {
      this.setState({
        isValid: false,
        nameHint: ''
      });
    }

    //Name must not contain any numbers
    const re = /\d/;
    if (re.test(fullName)) {
      this.setState({
        isValid: false,
        nameHint: 'Name cannot contain a number'
      });
    }
  };

  emailValidator = () => {
    this.setState({
      isValid: true,
      emailHint: ''
    });
    const { email } = this.state;
    if (!EmailValidator.validate(email)) {
      this.setState({
        isValid: false,
        emailHint: 'Please enter a valid email address'
      });
    } else {
      //Validate e-mail format on server side
      this.props
        .retreiveUserProviders(email)
        .then(provider => {
          if (provider === types.ACCOUNT_NOT_AVAILABLE) {
            this.setState(
              {
                isValid: true,
                emailHint: ''
              },
              this.createAccount()
            );
          } else {
            //TODO - check if it's related to facebook or email provider
            this.setState({
              isValid: false,
              emailHint: `Email already linked to account with ${provider}`
            });
          }
        })
        .catch(error => {
          this.setState({
            isValid: false,
            emailHint: error
          });
        });
    }
  };

  passwordValidator = () => {
    this.setState({
      isValid: false,
      passwordHint: ''
    });
    const { password } = this.state;

    if (password.length < 6) {
      this.setState({
        isValid: false,
        passwordHint: 'Password should be at least 6 characters long'
      });
    } else {
      const re = /[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/;
      if (!re.test(password)) {
        this.setState({
          isValid: false,
          passwordHint: 'Password should include both letters and numbers'
        });
      }
    }
  };

  createAccount = () => {
    const { nextScene } = this.props;

    const { fullName, email, password, isValid } = this.state;
    const { firstName, lastName } = this.parseName(fullName.trim());
    if (isValid) {
      this.props
        .createUser({ email, password, firstName, lastName })
        .then(() => {
          this.navigateToNextScene(nextScene);
        })
        .catch(() => {});
    }
  };

  enableSignUpButton = () => {
    const { fullName, email, password } = this.state;
    return fullName.length > 0 && email.length > 0 && password.length > 0 && this.state.checked;
  };

  logInPressed = () => {
    const { footerScene } = this.props;
    this.navigateToNextScene(footerScene);
  };

  handleTermsCheck = () => {
    this.setState({
      checked: !this.state.checked
    });
  };

  render() {
    const { nameHint, emailHint, passwordHint } = this.state;
    return (
      <LoginBackground>
        <CreateAccountFormView
          formData={this.state.fullName}
          formDataFieldChanged={(field, value) => this.setState({ [field]: value })}
          // validatorHint={this.inputValidator().hint}
          // buttonEnabled={this.enableLoginButton.bind()}
          emailHint={emailHint}
          nameHint={nameHint}
          passwordHint={passwordHint}
          buttonTitle="Next"
          onSignUpPress={this.nextButtonPressed}
          loading={this.props.createUserLoading}
          logInPressed={this.logInPressed}
          enableSignUpButton={this.enableSignUpButton()}
          capitalize="words"
          // secureText={false}
          onPrivacyPolicyPress={this.navigateToPrivacyPolicy}
          onTermsOfServicePress={this.navigateToTermsOfService}
          navigateToPreviousScene={this.navigateToPreviousScene}
          handleTermsCheck={this.handleTermsCheck}
          checked={this.state.checked}
        />
      </LoginBackground>
    );
  }
}

function mapStateToProps(state) {
  const { ui } = state;
  const { createUserLoading } = ui;

  return {
    createUserLoading
  };
}

function mapDispatchToProps(dispatch) {
  return {
    retreiveUserProviders: email => dispatch(retreiveUserProviders(email)),
    createUser: ({ email, password, firstName, lastName }) =>
      dispatch(createUser({ email, password, firstName, lastName })),
    passwordFieldSubmitted: password => dispatch(passwordFieldSubmitted(password)),
    resetErrorValues: () => dispatch(resetErrorValues())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NameCaptureForm);
