import Icon from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, TouchableHighlight } from 'react-native';

import Colors from '../../styles/colors.styles';
import SlideInOut from '../slide-in-out/slide-in-out.component';


class ScrollToTopButton extends Component {
    render() {
        return (
            <SlideInOut 
                slideDistance={70}
                styles={styles.buttonContainer}
                visible={this.props.visible}
            >
                <TouchableHighlight 
                    style={styles.touchableHighlight}
                    onPress={this.props.onPress}
                    underlayColor={Colors.ViewsBlue2}
                >         
                    <Icon 
                        name="ios-arrow-dropup" 
                        style={styles.icon} 
                    />
                </TouchableHighlight>
            </SlideInOut>
        );
    }
}

ScrollToTopButton.propTypes = {
    onPress: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired
};

ScrollToTopButton.defaultProps = {
    onPress: () => {},
    visible: false
};

const styles = StyleSheet.create({
    buttonContainer: {
        backgroundColor: Colors.ViewsBlue,
        borderColor: Colors.ViewsGray2,
        borderWidth: StyleSheet.hairlineWidth,
        borderRightWidth: 0,
        height: 44,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        position: 'absolute',
        top: 50, 
        right: 0, 
        shadowColor: Colors.ViewsGray3,
        shadowRadius: 3,
        shadowOffset: {
            height: 4,
            width: 6
        },
        shadowOpacity: 0.5,    
        width: 50
    },
    icon: {
        fontSize: 30,
        color: 'white'
    },
    touchableHighlight: {
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        height: '100%',
        width: '100%'
    }
});


export default ScrollToTopButton;

