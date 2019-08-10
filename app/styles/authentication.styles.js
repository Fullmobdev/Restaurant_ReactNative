import { Dimensions } from 'react-native';

/**
 * Shared
 */
export const styles = {
  topButtonRowContainer: {
    backgroundColor: 'red',
    position: 'absolute',
    left: 0,
    right: 0
  },
  topButtonRow: {
    paddingLeft: 20,
    paddingTop: 30,
    paddingRight: 20,
    flexDirection: 'row'
  },

  componentContainerStyle: {
    // paddingTop: 60,
    // paddingLeft: 50,
    // paddingRight: 50,
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },

  /**
   * Text input
   */
  textInputStyle: {
    color: '#424242',
    fontSize: 16,
    fontFamily: 'Avenir',
    borderBottomColor: '#dddbdb',
    borderBottomWidth: 0.3
  },

  /**
   * Labels
   */
  labelHeaderStyle: {
    fontSize: 16,
    color: '#2EC2F2',
    fontFamily: 'Avenir',
    fontWeight: '500'
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
  buttonStyle: {
    alignSelf: 'center',
    width: 140,
    height: 45,
    backgroundColor: '#E54B4B',
    borderRadius: 6,
    marginTop: 20
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
    fontSize: 14,
    color: '#908B89',
    letterSpacing: 0.7,
    fontWeight: '300',
    paddingTop: 10,
    paddingBottom: 10
  },

  footerContainerStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
    borderTopWidth: 0.5,
    borderTopColor: '#D9D7D5',
    zIndex: -10
  },

  footerTextAccentStyle: {
    fontFamily: 'Avenir',
    fontSize: 14,
    letterSpacing: 0.7,
    paddingTop: 10,
    paddingBottom: 10,
    color: '#E54B4B',
    fontWeight: '800'
  },

  /**
   * Login form
   */
  loginFormStyle: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 40
  },

  loginFormLabelStyle: {
    fontSize: 16,
    fontFamily: 'Avenir',
    letterSpacing: 0.7,
    color: '#424242',
    fontWeight: '500',
    borderBottomWidth: 1,
    borderBottomColor: '#f2efed'
  },

  loginFormLogoImageStyle: {
    width: Dimensions.get('window').width,
    height: 240
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
};
