import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, TouchableOpacity } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../styles/colors.styles';

const RecommendButton = ({
    selected,
    onPress,
}) => {
    const buttonColor = selected ? '#E54B4B' : '#a8a8a8';
    return (
        <TouchableOpacity onPress={onPress}>
            <Icon style={styles.button} color={buttonColor} name='ios-heart' size={80} />
        </TouchableOpacity>
    );
};

RecommendButton.propTypes = {
    selected: PropTypes.bool,
    onPress: PropTypes.func.isRequired
};

RecommendButton.defaultProps = {
    selected: false
};

const styles = StyleSheet.create({
    button: {
        fontSize: 80
    }
});

export default RecommendButton;
