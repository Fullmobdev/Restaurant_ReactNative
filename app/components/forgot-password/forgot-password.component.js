import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, FormInput, FormValidationMessage } from 'react-native-elements';
import { View, Text, Keyboard, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import * as EmailValidator from 'email-validator';
import { Actions } from 'react-native-router-flux';
import FloatingLabel from 'react-native-floating-labels';
import Icon from 'react-native-vector-icons/Ionicons';
import LoginBackground from '../login/login-background';
import * as types from '../../types/authentication.types';
import Press from '../Press';

// import * as styles from '../../styles/authentication.styles';
import {
  sendPasswordResetEmail,
  resetPasswordSuccess,
  resetPasswordFailure,
  retreiveUserProviders
} from '../../actions/authentication.action';

class ForgotPasswordForm extends Component {
  constructor(props) {
    super(props);
    this.state = { email: '', validatorHint: '' };
  }

  alertWithError = errorMessage => {
    this.setState({ isValid: false });
    this.setState({ validatorHint: errorMessage });
  };

  navigateToNextScene = () => {
    const { nextScene } = this.props;
    Actions[nextScene]();
  };

  navigateToPreviousScene = () => {
    Actions.pop();
  };

  sendPasswordResetEmail = email => {
    this.props
      .sendPasswordResetEmail(email)
      .then(() => {
        const msg = `Password reset email sent to ${this.state.email}`;
        Alert.alert('Success', msg, [{ text: 'OK', onPress: () => this.navigateToNextScene() }]);
      })
      .catch(error => {
        this.alertWithError(error);
        Alert.alert('Error', error);
        this.props.resetPasswordFailure();
      });
  };

  nextButtonPressed = () => {
    const { isValid, hint } = this.inputValidator();
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
            //TODO - dont send for facebook account
            this.alertWithError(`Account with email ${email} does not exist`);
          } else {
            this.sendPasswordResetEmail(email);
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

  render() {
    const {
      componentContainerStyle,
      labelHeaderStyle,
      labelBodyStyle,
      textInputStyle,
      buttonStyle,
      validationMessageStyle
    } = styles;

    return (
      <LoginBackground>
        <View style={componentContainerStyle}>
          <View style={styles.container}>
            <View style={[styles.topButtonRow, styles.topButtonRowContainer]}>
              <TouchableOpacity onPress={this.navigateToPreviousScene}>
                <Icon style={styles.controlOption} name="ios-arrow-back" size={35} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: 30 }}>
              <Text style={labelHeaderStyle}>
                Please enter the email address associated with your Views account{' '}
              </Text>
            </View>
            <View style={{ width: '100%' }}>
              <FloatingLabel
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                onBlur={this.onBlur}
                onChangeText={email => {
                  this.setState({ email });
                  this.setState({ validatorHint: '' });
                }}
                onSubmitEditing={Keyboard.dismiss}
              >
                Email
              </FloatingLabel>
              {/* <FormInput
                style={textInputStyle}
                placeholder="Email"
                onChangeText={email => {
                  this.setState({ email });
                  this.setState({ validatorHint: '' });
                }}
                value={this.state.email}
                onSubmitEditing={Keyboard.dismiss}
                secureText={false}
                autoCorrect={false}
                autoCapitalize={'none'}
              /> */}
            </View>
            <View>
              {
                <FormValidationMessage labelStyle={validationMessageStyle}>
                  {this.state.validatorHint}
                </FormValidationMessage>
              }
            </View>
            <Press
              buttonStyle={styles.bottomButtonStyle}
              buttonTextStyle={styles.buttonTextStyle}
              enabled={this.enableLoginButton()}
              onPress={this.nextButtonPressed.bind(this)}
              // disabled={fbLoginLoading}
            >
              <Text>Continue</Text>
            </Press>
            {/* <Button
                buttonStyle={buttonStyle}
                title="Continue"
                onPress={this.nextButtonPressed.bind(this)}
                disabled={!this.enableLoginButton()}
              /> */}
          </View>
        </View>
      </LoginBackground>
    );
  }
}

const styles = StyleSheet.create({
  componentContainerStyle: {
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  container: {
    position: 'relative',
    backgroundColor: 'transparent',
    flex: 1,
    paddingHorizontal: 20
    // alignItems: 'center',
    // justifyContent: 'center'
  },
  topButtonRowContainer: {
    marginTop: 20
  },
  topButtonRow: {
    paddingTop: 30,
    paddingRight: 20,
    flexDirection: 'row',
    backgroundColor: 'transparent'
  },
  labelHeaderStyle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Avenir',
    fontWeight: '500'
  },
  labelInput: {
    color: '#fff'
  },
  formInput: {
    borderBottomWidth: 1.5,
    borderColor: '#fff',
    marginTop: 10
  },
  input: {
    borderWidth: 0,
    color: '#fff',
    width: '100%'
  },
  bottomButtonStyle: {
    height: 57,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E9E9E9',
    borderRadius: 12,
    marginTop: 30
    // position: 'absolute',
    // bottom: 80,
    // marginLeft: 20
  },
  buttonTextStyle: {
    alignSelf: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    paddingTop: 10,
    paddingBottom: 10
  }
});

const mapStateToProps = state => {
  const { email } = state.user;
  return { email };
};

export default connect(
  mapStateToProps,
  {
    sendPasswordResetEmail,
    resetPasswordSuccess,
    resetPasswordFailure,
    retreiveUserProviders
  }
)(ForgotPasswordForm);
