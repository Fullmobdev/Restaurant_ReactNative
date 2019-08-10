import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import imgIcons from '../img-icons/img-icons';

const ShareButton = (props) => {
    const { onPress } = props;

    return (
        <TouchableOpacity onPress={onPress}>
            <Image
                style={styles.icon}
                source={imgIcons.shareIcon}
            />
        </TouchableOpacity>
    );
};

ShareButton.propTypes = {
    onPress: PropTypes.func
};

ShareButton.defaultProps = {
    onPress: () => {}
};

const styles = StyleSheet.create({
    icon: {
        width: 24,
        height: 20
    }
});

export default ShareButton;
