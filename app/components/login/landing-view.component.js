import React from 'react';
import { Text, View } from 'react-native';
import Video from 'react-native-video';
import ViewsIcon from '../../fonts/icon-font';
import bgVideo from '../../images/background_video.mp4';
import Colors from '../../styles/colors.styles';
import Footer from '../Footer';
import Press from '../Press';
import LoginBackground from './login-background';

const LandingView = props => {
  const {
    loginPressed,
    createAccountPressed,
    loginFacebookPressed,
    renderButtonContent,
    fbLoginLoading,
    guestLoginPressed
  } = props;
  const {
    container,
    image,
    videoStyle,
    overlayStyle,
    buttonTextStyle,
    buttonStyle,
    bottomButtonStyle,
    guestBottomButtonStyle,
    footerContainerStyle
  } = styles;

  return (
    <View style={container}>
      <View style={styles.videoContainer}>
        <Video repeat source={bgVideo} resizeMode="cover" style={videoStyle} />
      </View>
      <LoginBackground transparent>
        <View style={styles.logoContainer}>
          <ViewsIcon name='views_logo_icon' style={[styles.logo, styles.logoLeft]} />
          <ViewsIcon name='views_logo_word' style={styles.logo} />
        </View>

        <Press
          buttonStyle={bottomButtonStyle}
          buttonTextStyle={buttonTextStyle}
          onPress={createAccountPressed}
          disabled={fbLoginLoading}
          enabled
        >
          <Text>Create Account</Text>
        </Press>

        <View style={styles.orText}>
          <Text>Or</Text>
        </View>

        <Footer
          primaryLabel='Already have an account?'
          primaryLink='Log In'
          onPrimaryLinkPress={loginPressed}
          secondaryLink='Continue as guest'
          onSecondaryLinkPress={guestLoginPressed}
          containerStyle={footerContainerStyle}
        />
      </LoginBackground>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    marginTop: -80
  },
  backgroundImage: {
    position: 'absolute',
    height: 570,
    // width: 390,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    resizeMode: 'stretch'
  },
  image: {
    height: 80,
    width: 130,
    resizeMode: 'contain'
  },
  logo: {
    color: Colors.ViewsWhite,
    fontSize: 41
  },
  logoContainer: {
    position: 'absolute',
    top: '15%',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row'
  },
  logoLeft: {
    marginRight: 10
  },
  videoStyle: {
    position: 'absolute',
    height: '100%',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
    // opacity: 0.2
  },
  videoContainer: {
    position: 'absolute',
    height: '83%',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  overlayStyle: {
    position: 'absolute',
    height: '83%',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  overlayContainer: {
    height: '83%',
    paddingHorizontal: 10,
    paddingBottom: 10,
    justifyContent: 'flex-end'
  },
  buttonStyle: {
    alignSelf: 'center',
    width: 260,
    height: 45,
    backgroundColor: '#E54B4B',
    borderRadius: 20,
    alignItems: 'center',
    paddingTop: 10
  },
  bottomButtonStyle: {
    height: 57,
    width: '94.5%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.viewsRed2,
    borderRadius: 12,
    position: 'absolute',
    bottom: 130,
    marginLeft: 10
  },
  guestBottomButtonStyle: {
    height: 57,
    width: '94.5%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.viewsRed2,
    borderRadius: 12,
    position: 'absolute',
    bottom: 130,
    marginLeft: 10
  },
  buttonTextStyle: {
    fontFamily: 'Avenir',
    alignSelf: 'center',
    letterSpacing: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  orText: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerContainerStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 30
  }
};

export default LandingView;
