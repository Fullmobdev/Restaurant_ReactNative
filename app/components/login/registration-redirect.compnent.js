import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import SafeAreaView from 'react-native-safe-area-view';

import LoginButton from '../login/login-button.component';
import Colors from '../../styles/colors.styles';
import { Typography } from '../../styles/typography.styles';
import { defaultRegistrationRedirectText } from './login.constants';

const RegistrationRedirect = (props) => {
    const {
        showContinue,
        text
    } = props;

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text style={styles.heading}>{ text }</Text>
                <LoginButton 
                    label='Create Account'
                    onPress={onCreateAccountPress}
                />
                <View style={styles.secondaryButton}>
                    <LoginButton 
                        label='Log In'
                        secondary
                        onPress={onLogInPress}
                    />
                </View>
            </View>
            {
                showContinue &&
                <LoginButton 
                    label='Continue'
                    onPress={onContinuePress}
                    tertiary
                />
            }
        </SafeAreaView>
    );
};

RegistrationRedirect.PropTypes = {
    text: PropTypes.string,
    showContinue: PropTypes.bool
};

RegistrationRedirect.defaultProps = {
    showContinue: true,
    text: defaultRegistrationRedirectText
};

const onCreateAccountPress = () => {
    Actions.pop();
    Actions.root();
    Actions.name();
};

const onLogInPress = () => {
    Actions.pop();
    Actions.root();
    Actions.login();
};

const onContinuePress = () => {
    Actions.pop();
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.ViewsGray2,
        justifyContent: 'space-between',
        paddingBottom: 50
    },
    heading: {
        ...Typography.bodySmall,
        color: Colors.ViewsGray4,
        marginTop: 20,
        marginBottom: 40,
        marginHorizontal: 20
    },
    secondaryButton: {
        marginTop: 10
    }
});

export default RegistrationRedirect;
