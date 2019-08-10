import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Colors from '../../styles/colors.styles';
import { Typography } from '../../styles/typography.styles';

const LoginButton = (props) => {
    const {
        label,
        onPress,
        secondary,
        tertiary
    } = props;

    const containerStyle = [styles.container]; 
    if (secondary) {
        containerStyle.push(styles.containerSecondary);
    } else if (tertiary) {
        containerStyle.push(styles.containerTertiary);
    }

    return (
        <TouchableOpacity 
            style={containerStyle}
            onPress={onPress}
        >
            <Text style={styles.label}>{ label }</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: Colors.ViewsRed,
        borderRadius: 10,
        justifyContent: 'center',
        marginHorizontal: 20,
        height: 50
    },
    containerSecondary: {
        backgroundColor: Colors.ViewsBlue2
    },
    containerTertiary: {
        backgroundColor: Colors.ViewsGray1
    },
    label: {
        ...Typography.headline,
        color: Colors.ViewsWhite,
        letterSpacing: 0.5
    }
});

export default LoginButton;

