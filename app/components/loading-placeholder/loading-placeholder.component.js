import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Colors from '../../styles/colors.styles';
import Shimmer from '../shimmer/shimmer.component';
    
const LoadingPlaceholder = (props) => {
    const {
        children,
        loading,
        style
    } = props;

    return (
        loading ? renderPlaceholder(style) : children 
    );
};

const renderPlaceholder = (style) => {
    return (
        <Shimmer>
            <View style={[style, styles.placeholder]} />            
        </Shimmer>
    );
};

LoadingPlaceholder.propTypes = {
    style: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
    loading: PropTypes.bool
};

const styles = StyleSheet.create({
    placeholder: {
        backgroundColor: Colors.ViewsGray2
    }
});

export default LoadingPlaceholder;
