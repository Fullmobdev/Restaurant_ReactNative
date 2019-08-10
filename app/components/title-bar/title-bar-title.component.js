import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Typography } from '../../styles/typography.styles';

class TitlebarTitle extends Component {
    render() {
        const { containerStyle } = this.props;
        let { title } = this.props;
        title = title[0].toUpperCase() + title.substring(1);

        return (
            <View style={[styles.container, containerStyle]}>
                <Text style={styles.title}>{ title }</Text>
            </View>
        );
    }
}

TitlebarTitle.propTypes = {
    containerStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    title: PropTypes.string
};

TitlebarTitle.defaultProps = {
    containerStyle: {},
    title: ''
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', 
        justifyContent: 'center', 
        flex: 1        
    },
    title: {
        ...Typography.headline
    }
});

export default TitlebarTitle;
