import React, { Component } from 'react';
import firebase from 'react-native-firebase';
import { connect } from 'react-redux';
import haversine from 'haversine';
import { View, Image, StyleSheet, Text } from 'react-native';
import { Scene, Router, ActionConst, Actions } from 'react-native-router-flux';
import * as SceneType from '../types/scene.types';
import ForcedUpgrade from '../components/forced-upgrade/forced-upgrade.component';
import LoginForm from '../components/login/login-form.component';
import NameCaptureForm from '../components/create-account/name-capture-form.component';
import EmailCaptureForm from '../components/create-account/email-capture-form.component';
import PasswordCaptureForm from '../components/create-account/password-capture-form.component';
import ForgotPasswordForm from '../components/forgot-password/forgot-password.component';
import Landing from '../components/login/landing.component';
import Business from '../components/businesses/business.component';
import BusinessMore from '../components/businesses/business-more.component';
import BusinessGallery from '../components/businesses/business-gallery.component';
import HeaderLogo from '../components/HeaderLogo';
import HeaderText from '../components/HeaderText';
import MediaCaptureForm from '../components/capture/camera-capture.component';
import MediaEditor from '../components/media-viewers/media-editor.component';
import BusinessSearch from '../components/business-search/business-search.component';
import MediaExecutor from '../components/media-viewers/media-executor.component';
import Timeline from '../components/timeline/timeline.component';
import Profile from '../components/profile.component';
import Discover from '../components/discover/discover.component';
import DiscoverSearch from '../components/discover/discover-search.component';
import Restaurants from '../components/discover/restaurants.component';
import HeatMap from '../components/timeline/heatmap.component';
import PrivacyPolicy from '../components/agreements/privacy-policy.component';
import TermsOfService from '../components/agreements/terms-of-service.component';
import RegistrationRedirect from '../components/login/registration-redirect.compnent';
import { ifIphoneX, getBottomSpace } from 'react-native-iphone-x-helper';

// Actions
import { getGlobalSettings } from '../actions/global-settings/global-settings.action';
import { loadUserDefaults } from '../actions/authentication.action';
import { selectUser, loadUserLocationAddress } from '../actions/users/users.action';
import { addInitialLink } from '../actions/review.action';

// Services
import { isForcedUpgradeRequired } from '../services/global-settings/global-settings.service';
import * as locationService from '../services/location/location.service';

// Types
import { AppRunningState } from '../types/app-state.types';

import ViewsIcon from '../fonts/icon-font';
import Colors from '../styles/colors.styles';
import { Typography } from '../styles/typography.styles';
import Rewards from '../components/rewards/rewards.component';

// Assets
import TicketIcon from '../images/ticket_icon.png';
import TicketIconRed from '../images/ticket_icon_red.png';
import LikesViewsModal from '../components/likes-views-modal/likes-views-modal.component';

const ConnectedRouter = connect()(Router);

/**
 * The router component that handles screen navigation throughout the app
 */
class RouterComponent extends Component {

  constructor(props) {
  super(props);
  this.unsubscriber = null;
  }

   componentDidMount() {
    this.props.getSettings();

    const { user, loggedIn } = this.props;
    if (user && loggedIn) {
      this.props.loadUserDefaults(user);
    }
    this.unsubscriber = firebase.auth().onAuthStateChanged((usr) => {
    }, (err) => {
      console.log(`login error ${err}`);
    });
  }
  componentWillUnmount() {
    if (this.unsubscriber) {
      this.unsubscriber();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.handleAppRunningStateChange(nextProps.appState.runningState);
  }

  handleAppRunningStateChange = nextRunningState => {
    const { runningState } = this.props.appState;

    if (nextRunningState !== runningState && nextRunningState === AppRunningState.active) {
      this.props.getSettings();
      locationService.getCurrentLocation()
      .then(currentLocation => {
        if (!this.props.user.address.coordinates || this.calculateDistance(currentLocation) > 100) {
          this.props.loadUserLocationAddress(currentLocation);
        }
      });
    }
  };

  /* Returns distance (in meters) between previous and new location */
  calculateDistance = (newLocation) => {
    const { coordinates: prevLocation } = this.props.user.address;
    return haversine(prevLocation, newLocation, { unit: 'meter' }) || 0;
  }

  handleProfilePress = () => {
    const { user } = this.props;
    this.props.selectUser(user.uid);
    Actions.popTo(SceneType.PROFILE_TAB);
  };

  render() {
    const { defaultBackgroundStyle, backButtonStyle } = styles;
    const { forcedUpgradeRequired, loggedIn, initialLink } = this.props;
    if (forcedUpgradeRequired) {
      return (
        <ForcedUpgrade />
      );
    }

    return (
      <ConnectedRouter>
        <Scene
          key={SceneType.ROOT}
          initial={!forcedUpgradeRequired && !loggedIn}
          type={ActionConst.RESET}
        >
          <Scene
            key={SceneType.LANDING}
            component={Landing}
            loginScene={SceneType.LOGIN}
            nextScene={SceneType.APP}
            hideNavBar
            createAccountScene={SceneType.NAME}
            sceneStyle={defaultBackgroundStyle}
          />
          <Scene
            key={SceneType.LOGIN}
            component={LoginForm}
            hideNavBar={false}
            footerScene={SceneType.NAME}
            forgotPassScene={SceneType.FORGOT_PASSWORD}
            nextScene={SceneType.APP}
            leftButtonIconStyle={backButtonStyle}
            hideNavBar
            // renderTitle={() => <HeaderText children={'Log In'} />}
            // sceneStyle={defaultBackgroundStyle}
          />
          <Scene
            key={SceneType.PRIVACY_POLICY}
            component={PrivacyPolicy}
          />
          <Scene
            key={SceneType.TERMS_OF_SERVICE}
            component={TermsOfService}
          />
          <Scene
            key={SceneType.NAME}
            component={NameCaptureForm}
            nextScene={SceneType.APP}
            footerScene={SceneType.LOGIN}
            privacyPolicyScene={SceneType.PRIVACY_POLICY}
            termsOfServiceScene={SceneType.TERMS_OF_SERVICE}
            hideNavBar
            leftButtonIconStyle={backButtonStyle}
            // renderTitle={() => <HeaderText children={'Create Account'} />}
          />
          <Scene
            key={SceneType.EMAIL}
            component={EmailCaptureForm}
            nextScene={SceneType.PASSWORD}
            footerScene={SceneType.LOGIN}
            leftButtonIconStyle={backButtonStyle}
            renderTitle={() => <HeaderText children={'Create Account'} />}
            sceneStyle={defaultBackgroundStyle}
          />
          <Scene
            key={SceneType.PASSWORD}
            component={PasswordCaptureForm}
            nextScene={SceneType.APP}
            footerScene={SceneType.LOGIN}
            leftButtonIconStyle={backButtonStyle}
            renderTitle={() => <HeaderText children={'Create Account'} />}
            sceneStyle={defaultBackgroundStyle}
          />
          <Scene
            key={SceneType.FORGOT_PASSWORD}
            component={ForgotPasswordForm}
            nextScene={SceneType.LOGIN}
            leftButtonIconStyle={backButtonStyle}
            hideNavBar
            // sceneStyle={defaultBackgroundStyle}
          />
        </Scene>

        <Scene
          key={SceneType.APP}
          initial={!forcedUpgradeRequired && this.props.loggedIn}
          type={ActionConst.RESET}
          tabs
          tabBarStyle={{
            backgroundColor: '#fff',
            borderTopColor: '#dedfe0',
            borderTopWidth: StyleSheet.hairlineWidth,
            ...ifIphoneX({
              height: 80,
              paddingTop: 10,
              paddingBottom: getBottomSpace()
            }, {
              height: 50
            })
          }}
        >
          <Scene
            initial={initialLink !== ''}
            key={SceneType.TIMELINE_TAB}
            title={SceneType.TIMELINE_TAB}
            icon={TabIcon}
            onPress={() => {
              Actions.popTo(SceneType.TIMELINE_TAB);
            }}
          >
            <Scene
              key={SceneType.TIMELINE}
              component={Timeline}
              leftButtonIconStyle={backButtonStyle}
              mediaExecutorScene={SceneType.MEDIA_EXECUTOR}
              userScene={SceneType.USER_PROFILE}
              businessScene={SceneType.TIMELINE_BUSINESS}
              likesViewsScene={SceneType.LIKES_AND_VIEWS}
              nextScene={SceneType.CAPTURE_TAB}
              heatMapScene={SceneType.HEATMAP}
              registrationRedirectScene={SceneType.REGISTRATION_REDIRECT}
              initialLink={initialLink}
              sceneStyle={{
                // paddingTop: 65,
                paddingBottom: 50
              }}
              renderTitle={() => <HeaderLogo />}
              hideNavBar
            />
            <Scene
              key={SceneType.HEATMAP}
              component={HeatMap}
              leftButtonIconStyle={backButtonStyle}
              reviewScene={SceneType.MEDIA_EXECUTOR}
              hideNavBar
              hideTabBar
            />
            <Scene
              key={SceneType.TIMELINE_BUSINESS}
              component={Business}
              moreInfoScene={SceneType.BUSINESS_INFO}
              reviewScene={SceneType.MEDIA_EXECUTOR}
              galleryScene={SceneType.BUSINESS_GALLERY}
              registrationRedirectScene={SceneType.REGISTRATION_REDIRECT}
              leftButtonIconStyle={backButtonStyle}
              hideNavBar
              hideTabBar
              renderTitle={() => <HeaderLogo />}
            />
          </Scene>

          <Scene initial={initialLink === ''} key={SceneType.SEARCH_TAB} title={SceneType.SEARCH_TAB} icon={TabIcon}>
            <Scene
              key={SceneType.DISCOVER}
              component={Discover}
              leftButtonIconStyle={backButtonStyle}
              nextScene={SceneType.DISCOVER_SEARCH}
              recommendedNearYouScene={SceneType.DISCOVER_LIST_NEAR_YOU}
              topRecommendedScene={SceneType.DISCOVER_LIST_TOP_RECOMMENDED}
              myBookmarksScene={SceneType.DISCOVER_LIST_MY_BOOKMARKS}
              newOnViewsScene={SceneType.DISCOVER_LIST_NEW_ON_VIEWS}
              businessScene={SceneType.BUSINESS}
              userScene={SceneType.USER_PROFILE}
              registrationRedirectScene={SceneType.REGISTRATION_REDIRECT}
              hideNavBar
            />
            <Scene
              key={SceneType.DISCOVER_SEARCH}
              component={DiscoverSearch}
              direction='vertical'
              leftButtonIconStyle={backButtonStyle}
              nextScene={SceneType.BUSINESS}
              previousScene={SceneType.DISCOVER}
              hideNavBar
              hideTabBar
            />
            <Scene
              key={SceneType.DISCOVER_LIST_NEAR_YOU}
              component={Restaurants}
              leftButtonIconStyle={backButtonStyle}
              businessScene={SceneType.BUSINESS}
              hideNavBar
              hideTabBar
            />
            <Scene
              key={SceneType.DISCOVER_LIST_TOP_RECOMMENDED}
              component={Restaurants}
              leftButtonIconStyle={backButtonStyle}
              businessScene={SceneType.BUSINESS}
              hideNavBar
              hideTabBar
            />
            <Scene
              key={SceneType.DISCOVER_LIST_MY_BOOKMARKS}
              component={Restaurants}
              leftButtonIconStyle={backButtonStyle}
              businessScene={SceneType.BUSINESS}
              hideNavBar
              hideTabBar
            />
            <Scene
              key={SceneType.DISCOVER_LIST_NEW_ON_VIEWS}
              component={Restaurants}
              leftButtonIconStyle={backButtonStyle}
              businessScene={SceneType.BUSINESS}
              hideNavBar
              hideTabBar
            />
            <Scene
              key={SceneType.RESTAURANTS}
              component={Restaurants}
              leftButtonIconStyle={backButtonStyle}
              businessScene={SceneType.BUSINESS}
              hideNavBar
              hideTabBar
            />
            <Scene
              key={SceneType.BUSINESS_SEARCH}
              component={BusinessSearch}
              leftButtonIconStyle={backButtonStyle}
              nextScene={SceneType.BUSINESS}
              hideNavBar
            />
            <Scene
              key={SceneType.BUSINESS}
              component={Business}
              moreInfoScene={SceneType.BUSINESS_INFO}
              reviewScene={SceneType.MEDIA_EXECUTOR}
              galleryScene={SceneType.BUSINESS_GALLERY}
              registrationRedirectScene={SceneType.REGISTRATION_REDIRECT}
              leftButtonIconStyle={backButtonStyle}
              hideNavBar
              hideTabBar
              renderTitle={() => <HeaderLogo />}
            />
            <Scene
              key={SceneType.BUSINESS_INFO}
              component={BusinessMore}
              leftButtonIconStyle={backButtonStyle}
              renderTitle={() => <HeaderLogo />}
              sceneStyle={{ paddingTop: 65 }}
            />
          </Scene>

          <Scene
            key={SceneType.CAPTURE_TAB}
            title={SceneType.CAPTURE_TAB}
            icon={TabIcon}
            onPress={() => {
              Actions.popTo(SceneType.CAPTURE_TAB);
            }}
          >
            <Scene
              initial
              key={SceneType.CAPTURE}
              component={MediaCaptureForm}
              nextScene={SceneType.MEDIA_VIEWER}
              registrationRedirectScene={SceneType.REGISTRATION_REDIRECT}
              leftButtonIconStyle={backButtonStyle}
              hideNavBar
              hideTabBar
            />
            <Scene
              key={SceneType.MEDIA_VIEWER}
              animationStyle={false}
              component={MediaEditor}
              leftButtonIconStyle={backButtonStyle}
              timelineScene={SceneType.TIMELINE_TAB}
              hideNavBar
            />
          </Scene>

          <Scene
            key={SceneType.REWARDS_TAB}
            title={SceneType.REWARDS_TAB}
            icon={TabIcon}
          >
            <Scene
              key={SceneType.REWARDS}
              component={Rewards}
              hideNavBar
            />
          </Scene>

          <Scene
            key={SceneType.PROFILE_TAB}
            title={SceneType.PROFILE_TAB}
            icon={TabIcon}
            onPress={this.handleProfilePress}
          >
            <Scene
              key={SceneType.PROFILE}
              component={Profile}
              mediaExecutorScene={SceneType.MEDIA_EXECUTOR}
              hideNavBar
              businessScene={SceneType.PROFILE_BUSINESS}
              sceneStyle={{ paddingBottom: 50 }}
            />
          </Scene>
        </Scene>

        {/* Scenes rendered as modals */}
        <Scene
          key={SceneType.MEDIA_EXECUTOR}
          animation="fade"
          component={MediaExecutor}
          userScene={SceneType.USER_PROFILE}
          likesViewsScene={SceneType.LIKES_AND_VIEWS}
          hideNavBar
          hideTabBar
        />
        <Scene
          key={SceneType.USER_PROFILE}
          component={Profile}
          mediaExecutorScene={SceneType.MEDIA_EXECUTOR}
          businessScene={SceneType.PROFILE_BUSINESS}
          hideNavBar
        />
        <Scene
          key={SceneType.PROFILE_BUSINESS}
          component={Business}
          moreInfoScene={SceneType.BUSINESS_INFO}
          reviewScene={SceneType.MEDIA_EXECUTOR}
          galleryScene={SceneType.BUSINESS_GALLERY}
          registrationRedirectScene={SceneType.REGISTRATION_REDIRECT}
          leftButtonIconStyle={backButtonStyle}
          hideNavBar
          hideTabBar
          renderTitle={() => <HeaderLogo />}
        />
        <Scene
          key={SceneType.BUSINESS_GALLERY}
          component={BusinessGallery}
          reviewScene={SceneType.MEDIA_EXECUTOR}
          leftButtonIconStyle={backButtonStyle}
          renderTitle={() => <HeaderLogo />}
          hideNavBar
        />
        <Scene 
          key={SceneType.REGISTRATION_REDIRECT}
          component={RegistrationRedirect}
          hideNavBar
        />
        <Scene 
          key={SceneType.LIKES_AND_VIEWS}
          component={LikesViewsModal}
          userScene={SceneType.USER_PROFILE}
          hideNavBar
        />
      </ConnectedRouter>
    );
  }
}

/**
 * Icons
 */
const TabIcon = ({ selected, title }) => {
  let iconName;
  const color = selected ? Colors.ViewsRed : Colors.ViewsBlack;

  switch (title) {
    case SceneType.TIMELINE_TAB:
      iconName = 'home';
      text = 'Home';
      break;
    case SceneType.SEARCH_TAB:
      iconName = 'search';
      text = 'Discover';
      break;
    case SceneType.CAPTURE_TAB:
      iconName = 'views_logo_icon';
      text = 'Review';
      break;
    case SceneType.PROFILE_TAB:
      iconName = 'person';
      text = 'Account';
      break;
    case SceneType.REWARDS_TAB:
      //TODO: Remove to match the other cases. Experiencing an issue
      // add the new icon to the icon font

      iconName = 'ticket';
      text = 'Rewards';

      return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Image source={selected ? TicketIconRed : TicketIcon} style={{ height: 24, width: 24 }} />
          <Text style={{ ...styles.tabText, color: selected ? '#ff3366' : '#949191' }}>{text}</Text>
        </View>
      );

    default:
      break;
  }

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <ViewsIcon name={iconName} size={21} color={color} />
      <Text style={{ ...styles.tabText, color: selected ? '#ff3366' : '#949191' }}>{text}</Text>
    </View>
  );
};

const styles = {
  defaultBackgroundStyle: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingTop: 55
  },
  backButtonStyle: {
    tintColor: '#2EC2F2'
  },
  tabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 14,
    // backgroundColor: '#ff3366',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabIcon: {
    height: 16,
    width: 16
  },
  tabText: {
    marginTop: 2,
    fontFamily: 'System',
    fontSize: 11
  }
};

const mapStateToProps = state => {
  const { appState, settings } = state;
  let forcedUpgradeRequired = false;

  if (settings.loaded && settings.forcedUpgrade) {
    forcedUpgradeRequired = isForcedUpgradeRequired(settings.forcedUpgrade.minimumVersion);
  }

  return {
    appState,
    forcedUpgradeRequired,
    loggedIn: !!state.user.uid,
    settingsLoaded: settings.loaded,
    user: state.user
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getSettings: () => {
      dispatch(getGlobalSettings());
    },
    addInitialLink: (link) => {
      dispatch(addInitialLink(link));
    },
    loadUserDefaults: user => {
      loadUserDefaults(dispatch, user);
    },
    selectUser: userId => {
      dispatch(selectUser({ userId }));
    },
    loadUserLocationAddress: (location) => {
      dispatch(loadUserLocationAddress(location));
    }
  };
};

// : '8Z8sZWejAkXs2hTyeEkuTvauL0b2'

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RouterComponent);
