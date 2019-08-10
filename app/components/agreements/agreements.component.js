import React from 'react';
import { StyleSheet, Text, View, WebView } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Colors from '../../styles/colors.styles';
import { Typography } from '../../styles/typography.styles';
import TitleBarBackButton from '../title-bar-back-button/title-bar-back-button.component';

const Agreements = (props) => {
    const {
        title,
        source
    } = props;

    return (
        <View style={styles.flex1}>
            <View style={styles.titleBar}>             
                <TitleBarBackButton 
                    containerStyle={styles.buttonContainer}
                    onPress={goBack} 
                />
                <Text style={styles.title}>{ `${title} - Views Technologies Inc.` }</Text>
                <View style={styles.buttonContainer} />

                
            </View>
            <View style={styles.webViewContainer}>
                <WebView style={styles.flex1} source={{ html: source }} />
            </View>
        </View>
    );
};

const goBack = () => {
    Actions.pop();
};

const styles = StyleSheet.create({
    flex1: {
        flex: 1
    },
    webViewContainer: {
        flex: 1,
        paddingHorizontal: 10
    },
    titleBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20,
        borderBottomColor: Colors.ViewsGray2,
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    title: {
        ...Typography.body,
        flex: 1,
        alignItems: 'center',
        textAlign: 'center',
        fontWeight: '700'
    },
    buttonContainer: {
        width: 44,
        alignItems: 'center'
    }
});

export default Agreements;
