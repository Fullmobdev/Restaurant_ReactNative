import React from 'react';
import { View, Text, Keyboard, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FormInput, Button, FormValidationMessage } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import FloatingLabel from 'react-native-floating-labels';
import Colors from '../../styles/colors.styles';

import Footer from '../Footer';
import Press from '../Press';

const CreateAccountFormView = props => {
  const {
    formDataFieldChanged,
    validatorHint,
    navigateToPreviousScene,
    enableSignUpButton,
    loading,
    onSignUpPress,
    nameHint,
    emailHint,
    passwordHint,
    logInPressed,
    checked,
    handleTermsCheck,
    onPrivacyPolicyPress,
    onTermsOfServicePress
  } = props;

  const {
    labelHeaderStyle,
    componentContainerStyle,
    validationMessageStyle,
    footerTextStyle,
    footerContainerStyle,
    footerTextAccentStyle
  } = styles;

  return (
    <View style={componentContainerStyle}>
      <View style={styles.container}>
        <View style={[styles.topButtonRow, styles.topButtonRowContainer]}>
          <TouchableOpacity onPress={navigateToPreviousScene}>
            <Icon style={styles.controlOption} name="ios-arrow-back" size={35} color="#fff" />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={labelHeaderStyle}> Sign Up</Text>
        </View>
        <View>
          <FloatingLabel
            labelStyle={styles.labelInput}
            inputStyle={styles.input}
            style={styles.formInput}
            onBlur={this.onBlur}
            onChangeText={value => formDataFieldChanged('fullName', value)}
            onSubmitEditing={Keyboard.dismiss}
          >
            Name
          </FloatingLabel>
          {nameHint.length > 0 && (
            <View>
              {
                <FormValidationMessage labelStyle={validationMessageStyle}>
                  {nameHint}
                </FormValidationMessage>
              }
            </View>
          )}

          <FloatingLabel
            labelStyle={styles.labelInput}
            inputStyle={styles.input}
            style={styles.formInput}
            onChangeText={value => formDataFieldChanged('email', value)}
            onSubmitEditing={Keyboard.dismiss}
          >
            Email
          </FloatingLabel>
          {emailHint.length > 0 && (
            <View>
              {
                <FormValidationMessage labelStyle={validationMessageStyle}>
                  {emailHint}
                </FormValidationMessage>
              }
            </View>
          )}

          <FloatingLabel
            labelStyle={styles.labelInput}
            inputStyle={styles.input}
            style={styles.formInput}
            secureTextEntry
            onChangeText={value => formDataFieldChanged('password', value)}
            onSubmitEditing={Keyboard.dismiss}
          >
            Password
          </FloatingLabel>

          {passwordHint.length > 0 && (
            <View>
              {
                <FormValidationMessage labelStyle={validationMessageStyle}>
                  {passwordHint}
                </FormValidationMessage>
              }
            </View>
          )}
        </View>
        <View>
          {
            <FormValidationMessage labelStyle={validationMessageStyle}>
              {validatorHint}
            </FormValidationMessage>
          }
        </View>

        <View style={styles.termsContainer}>
          <TouchableOpacity onPress={handleTermsCheck} style={{ marginRight: 10 }}>
            {checked ? (
              <Icon name="ios-checkbox-outline" style={styles.checkmark} color={Colors.viewsRed2} />
            ) : (
              <Icon name="ios-square-outline" style={styles.checkmark} color={Colors.viewsRed2} />
            )}
          </TouchableOpacity>
          <Text>
            <Text style={styles.termsText}>By checking this, you acknowledge that you have read the</Text>
            <TouchableOpacity style={{ paddingLeft: 10, height: 14, width: 102 }} onPress={onPrivacyPolicyPress}>
              <Text style={styles.termsTextLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}>and agree to the</Text>
            <TouchableOpacity style={{ height: 14, width: 108 }} onPress={onTermsOfServicePress}>
              <Text style={styles.termsTextLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}>.</Text>
          </Text>
        </View>
        <Button 
          buttonStyle={styles.bottomButtonStyle}
          buttonTextStyle={styles.buttonTextStyle}
          disabled={!enableSignUpButton}
          disabledStyle={styles.bottomButtonStyleDisabled}
          loading={loading}
          onPress={onSignUpPress}
          title={loading ? '' : 'Sign Up'}
        />
        <Footer
          onPrimaryLinkPress={logInPressed}
          primaryLabel={'Already registered?'}
          primaryLink={'Log In'}
          containerStyle={footerContainerStyle}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topButtonRowContainer: {
    marginTop: 20
  },
  topButtonRow: {
    paddingTop: 30,
    paddingRight: 20,
    flexDirection: 'row',
    backgroundColor: 'transparent'
  },

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
  },

  /**
   * Text input
   */

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
    color: '#fff'
  },

  /**
   * Labels
   */
  labelHeaderStyle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Avenir',
    fontWeight: 'bold',
    marginTop: 15,
    marginLeft: -8
  },

  /**
   * Buttons
   */

  bottomButtonStyle: {
    height: 57,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.ViewsRed,
    borderRadius: 12,
    position: 'absolute',
    marginTop: 60
  },
  bottomButtonStyleDisabled: {
    backgroundColor: '#E9E9E9'
  },
  buttonTextStyle: {
    alignSelf: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    paddingTop: 10,
    paddingBottom: 10
  },

  lowerButtonsContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: -4,
    marginLeft: -4
  },

  /*
  Login & Create Account Footer
*/

  footerTextStyle: {
    fontFamily: 'Avenir',
    fontSize: 16,
    color: '#444',
    letterSpacing: 0.7,
    paddingTop: 10,
    paddingBottom: 10
  },

  footerContainerStyle: {
    marginBottom: 20,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
    zIndex: -10
  },

  footerTextAccentStyle: {
    fontFamily: 'Avenir',
    fontSize: 16,
    letterSpacing: 0.7,
    paddingTop: 10,
    paddingBottom: 10,
    color: '#ff3366'
  },

  /*
Validation Message
*/

  validationMessageStyle: {
    fontFamily: 'Avenir',
    fontSize: 13,
    fontWeight: '400'
  },

  validationMessageContainer: {
    alignItems: 'flex-start'
  },

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  termsText: {
    fontFamily: 'Avenir',
    color: 'white',
    paddingRight: 10
  },
  termsTextLink: {
    fontFamily: 'Avenir',
    color: Colors.ViewsRed
  },
  checkmark: {
    fontSize: 24,
    fontWeight: 'bold'
  }
});

export default CreateAccountFormView;
