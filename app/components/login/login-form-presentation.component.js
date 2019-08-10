import React from 'react';
import { Image, Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, FormValidationMessage } from 'react-native-elements';
import FloatingLabel from 'react-native-floating-labels';
import Icon from 'react-native-vector-icons/Ionicons';
import ViewsIcon from '../../fonts/icon-font';
import Colors from '../../styles/colors.styles';
import Footer from '../Footer';
import imgIcons from '../img-icons/img-icons';
import Press from '../Press';
import LoginBackground from './login-background';

const LoginFormView = props => {
  const {
    emailFieldChanged,
    email,
    passwordFieldChanged,
    password,
    loginFacebookPressed,
    loginPressed,
    forgotPasswordPressed,
    createAccountPressed,
    buttonEnabled,
    validatorHint,
    buttonTitle,
    loading,
    loginLoading,
    fbLoginLoading
  } = props;
  const {
    lowerButtonsContainerStyle,
    buttonTextStyle,
    disabledButtonStyle,
    validationMessageStyle,
    validationMessageContainer,
    footerContainerStyle
  } = styles;

  const renderContent = () => {
    return (
      <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
        <Image source={imgIcons.fbLogo} style={{ width: 41, height: 41, marginLeft: 25 }} />
        <Text style={styles.fbButtonText}>Log In with Facebook</Text>
      </View>
    );
  };

  return (
    <LoginBackground>
      <View style={styles.componentContainerStyle}>
        <View style={styles.container}>
          <View style={[styles.topButtonRow, styles.topButtonRowContainer]}>            
            <ViewsIcon name='views_logo_icon' style={[styles.logo, styles.logoLeft]} />
            <ViewsIcon name='views_logo_word' style={styles.logo} />
          </View>

          <TouchableOpacity
            style={styles.fbButtonStyle}
            onPress={loginFacebookPressed}
            disabled={loginLoading}
          >
            {renderContent()}
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20
            }}
          >
            <Text style={{ color: 'white' }}>Or</Text>
          </View>

          <FloatingLabel
            labelStyle={styles.labelInput}
            inputStyle={styles.input}
            style={styles.formInput}
            onBlur={this.onBlur}
            onChangeText={emailFieldChanged}
            onSubmitEditing={Keyboard.dismiss}
          >
            Email
          </FloatingLabel>

          <FloatingLabel
            labelStyle={styles.labelInput}
            inputStyle={styles.input}
            style={styles.formInput}
            onBlur={this.onBlur}
            onChangeText={passwordFieldChanged}
            onSubmitEditing={Keyboard.dismiss}
            secureTextEntry
          >
            Password
          </FloatingLabel>

          <View style={validationMessageContainer}>
            {
              <FormValidationMessage labelStyle={validationMessageStyle}>
                {validatorHint}
              </FormValidationMessage>
            }
          </View>

          {/* <FormInput
            style={loginFormLabelStyle}
            marginTop={30}
            onChangeText={emailFieldChanged}
            value={email}
            placeholder={'Email'}
            onSubmitEditing={Keyboard.dismiss}
            editable={!loading}
          />

          <FormInput
            style={loginFormLabelStyle}
            marginTop={60}
            onChangeText={passwordFieldChanged}
            value={password}
            placeholder={'Password'}
            secureTextEntry
            onSubmitEditing={Keyboard.dismiss}
            editable={!loading}
          /> */}

          <View style={lowerButtonsContainerStyle}>
            <Button
              title="Forgotten your password?"
              backgroundColor="rgba(0,0,0,0)"
              color="white"
              fontFamily="Avenir"
              fontWeight="400"
              lineSpacing=".7"
              onPress={forgotPasswordPressed}
            />
          </View>
          <Button 
            buttonStyle={styles.bottomButtonStyle}
            disabled={!buttonEnabled}
            disabledStyle={styles.bottomButtonStyleDisabled}
            loading={loginLoading}
            onPress={loginPressed}
            title={loginLoading ? '' : 'Log In'}
            titleStyle={styles.buttonTextStyle}
          />
          <Footer
            onPrimaryLinkPress={createAccountPressed}
            primaryLabel={"Haven't registered yet?"}
            primaryLink={'Join now'}
            containerStyle={footerContainerStyle}
          />
        </View>
      </View>
    </LoginBackground>
  );
};

const styles = StyleSheet.create({
  topButtonRowContainer: {
    paddingTop: 84,
    paddingBottom: 40
  },
  topButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  logo: {
    color: Colors.ViewsWhite,
    fontSize: 41
  },
  logoLeft: {
    marginRight: 10
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
  textInputStyle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Avenir',
    borderBottomColor: '#fff',
    borderBottomWidth: 0.3
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

  labelBodyStyle: {
    fontSize: 16,
    color: '#E54B4B',
    fontFamily: 'Avenir',
    fontWeight: '500',
    marginTop: -10
  },

  /**
   * Buttons
   */

  fbButtonStyle: {
    height: 57,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#42548f',
    borderRadius: 12,
    flexDirection: 'row',
    marginTop: 25
  },

  fbButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Avenir',
    marginLeft: 25
  },

  bottomButtonStyle: {
    height: 57,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.ViewsRed,
    borderRadius: 12,
    position: 'absolute'
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

  disabledButtonStyle: {
    backgroundColor: '#000'
  },

  lowerButtonsContainerStyle: {
    // marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center'
  },

  /*
  Login & Create Account Footer
*/
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
  }
});

export default LoginFormView;
