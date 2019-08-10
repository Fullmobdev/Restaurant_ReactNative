import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity } from 'react-native';

import Colors from '../../styles/colors.styles';

const TitleBarBackButton = (props) => {
    const {
        buttonStyle,
        containerStyle,
        color,
        onPress
    } = props;

    const iconStyle = [styles.icon, buttonStyle, { color }];
    return (
        <TouchableOpacity style={containerStyle} onPress={onPress}>
            <Icon style={iconStyle} name="ios-arrow-back" />
        </TouchableOpacity>
    );
};

TitleBarBackButton.PropTypes = {
    color: PropTypes.string,
    buttonStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    onPress: PropTypes.func
};

TitleBarBackButton.defaultProps = {
    buttonStyle: {},
    color: Colors.ViewsRed,
    containerStyle: {},
    onPress: () => {}
};

const styles = StyleSheet.create({
    icon: {
        color: Colors.ViewsRed,
        fontSize: 24, 
        
    }
});

export default TitleBarBackButton;
