import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import Colors from '../../../styles/colors.styles';

class SelectSliderOption extends Component {
    render() {
        const { option, selected } = this.props;
        const textStyle = selected ? [styles.text, styles.selectedText] : [styles.text];
        const label = option || '';

        return (
            <View 
                onLayout={this.props.onLayout}
                style={styles.container}
            >
                <Text style={textStyle}>{ label.toUpperCase() }</Text>
            </View>
        );
    }
}

SelectSliderOption.propTypes = {
    onLayout: PropTypes.func,
    option: PropTypes.string,
    selected: PropTypes.bool,
};

SelectSliderOption.defaultProps = {
    selected: false
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent', 
        paddingHorizontal: 10
    },
    text: {
        color: Colors.ViewsGray1,
        letterSpacing: 1,
        fontSize: 14,
        fontWeight: '800',
        textShadowColor: '#4f5051',
        textShadowRadius: 1.5,
        textShadowOffset: {
        width: 0.5,
        height: 0.5,
        }
    },
    selectedText: {
        color: Colors.ViewsWhite
    }
});

export default SelectSliderOption;