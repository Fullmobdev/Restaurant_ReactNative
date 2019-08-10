import PropTypes from 'prop-types';
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Colors from '../../styles/colors.styles';
import { Typography } from '../../styles/typography.styles';

const ProgressBar = (props) => {
    const { showLabel } = props;

    const percent = Math.min(props.percent, 1);
    const percentStr = `${parseInt(percent * 100, 10)}%`;
    const textStyleProperty = percent < 0.5 ? 'left' : 'right';
    const textStyleValue = percent < 0.5 ? percentStr : `${parseInt((1 - percent) * 100, 10)}%`;

    return (
        <View>
            <View style={styles.container}>
                <View 
                    style={[styles.track, {
                        width: percentStr
                    }]}
                />            
            </View>
            { showLabel && <View style={styles.labelContainer}>
                <Text 
                    style={[styles.label, { 
                        [textStyleProperty]: textStyleValue
                    }]}
                >{percentStr}</Text>
            </View> }
            
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: 5,
        backgroundColor: Colors.ViewsGray2,
        borderRadius: 20
    },
    track: {
        height: '100%',
        backgroundColor: Colors.ViewsRed,
        borderRadius: 20

    },
    labelContainer: {
        height: 15 
    },
    label: {
        ...Typography.bodySmall,
        position: 'absolute',
        top: 2
    }
});

ProgressBar.proptypes = {
    percent: PropTypes.number,
    showLabel: PropTypes.bool
};

ProgressBar.defaultProps = {
    percent: 0.5,
    showLabel: true
};

export default ProgressBar;
