import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
import SafeAreaView from 'react-native-safe-area-view';

import ViewsIcon from '../../fonts/icon-font';
import Colors from '../../styles/colors.styles';
import { Typography } from '../../styles/typography.styles';
import TimelineHeader from '../timeline/timeline-header.component';
import TitleBarBackButton from '../title-bar-back-button/title-bar-back-button.component';
import RegistrationRedirect from '../login/registration-redirect.compnent';

import confetti from '../../images/confetti.png';

import { loadUserRewards } from '../../actions/users/users.action';

class Rewards extends Component {
    componentDidMount() {
        this.props.onLoadUserRewards();
    }

    render() {
        const { isAnonymous } = this.props; 
        if (isAnonymous) {
            return (
                <View style={styles.registrationRedirectContainer}>
                    <RegistrationRedirect showContinue={false} />
                </View>
            );
        }

        return (
            <View style={{ flex: 1 }}>
                <SafeAreaView style={styles.header}>        
                    <ViewsIcon name={'views_logo_word'} style={{ fontSize: 24, color: Colors.ViewsRed }} />        
                </SafeAreaView>
                <View style={styles.container}>                
                    <Text style={styles.title}>Wohoo! You're in.</Text>

                    <View style={styles.bodyContainer}>
                        <Text style={styles.bodyText}>
                            <Text>You've earned </Text> 
                            <Text style={styles.emphasize}>5 bucks </Text>
                            <Text>for coming onboard.</Text>
                        </Text>
                        
                        <Text style={styles.bodyText}>Stick with us, and you'll be on your way to making some cool cash, which you can apply as credit towards your meal at participating restaurants.</Text>
                        
                        <Text style={styles.bodyText}>It's easy. Recommend great food and restaurants to others and watch your money pile up!! Every $20 earned is free money towards your next meal.</Text>

                        <Text style={styles.bodyText}>It's finally time to get paid for doing what you love.</Text>
                    </View>

                    <Text style={styles.title}>Watch out for it! </Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40
    },
    header: {
        alignItems: 'center',
        paddingBottom: 20
    },
    heading: {
        ...Typography.title1,
        fontWeight: '700',
        marginBottom: 20
    },
    title: {
        ...Typography.body,
        fontWeight: '800'
    },
    bodyContainer: {
        marginTop: 20
    },
    bodyText: {
        ...Typography.body,
        marginBottom: 20,
        fontWeight: '600'
    },
    emphasize: {
        ...Typography.title3, 
        fontWeight: '800'
    },
    backgroundImage: { 
        position: 'absolute', 
        width: '100%' 
    },
    balanceContainer: {
        backgroundColor: Colors.ViewsWhite,
        height: 200,
        justifyContent: 'center',
        shadowColor: '#9a9a9a',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowRadius: 1,
        shadowOpacity: 0.3,
    },
    balanceContent: {
        alignItems: 'center'
    },
    balanceTitle: {
        ...Typography.bodySmall,
        letterSpacing: 1,
        color: Colors.ViewsBlack
    },
    balanceAmount: {
        fontFamily: 'System',
        fontSize: 31,
        marginRight: 5,
        fontWeight: '800',
        color: Colors.ViewsBlack
    },
    balanceLabel: {
        fontFamily: 'System',
        fontSize: 24,
        letterSpacing: 1,
        color: Colors.ViewsBlack
    },
    registrationRedirectContainer: {
        flex: 1,
        paddingBottom: 50
    }
});

const mapStateToProps = (state) => {
    const { user } = state;
    const { rewards } = user;

    const total = rewards ? rewards.total : 0;

    return {
        total,
        isAnonymous: user.isAnonymous
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onLoadUserRewards: () => { dispatch(loadUserRewards()); }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Rewards);
