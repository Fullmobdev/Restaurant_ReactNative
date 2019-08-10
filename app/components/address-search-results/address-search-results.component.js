import PropTypes from 'prop-types';
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

import ViewsIcon from '../../fonts/icon-font';
// Styles
import Colors from '../../styles/colors.styles';
import Spacing from '../../styles/spacing.styles';
import { Typography } from '../../styles/typography.styles';


const AddressSearchResults = (props) => {
    const { currentLocation, results, onSelectAddress } = props;

    return (
        <View style={styles.container}>
            { renderCurrentLocation(currentLocation, onSelectAddress) }
            { results.map((result) => renderResult(result, onSelectAddress)) }
        </View>
    );
};

const renderCurrentLocation = (currentLocation, onSelectAddress) => {
    const {
        currentLocationContainer,
        currentLocationIcon,
        currentLocationText,
        resultItemContainer,
        resultText
    } = styles;

    return (
        <TouchableOpacity
            onPress={() => { onSelectAddress(currentLocation); }}
            style={[currentLocationContainer, resultItemContainer]}
        >
            <ViewsIcon name='capture' style={currentLocationIcon} />
            <Text style={[resultText, currentLocationText]}>{currentLocation.description }</Text>
        </TouchableOpacity>
    );
};

const renderResult = (result, onSelectAddress) => {
    const { description, placeId } = result;

    return (
        <TouchableOpacity
            key={placeId}
            style={styles.resultItemContainer}
            onPress={() => { onSelectAddress(result); }}
        >
            <Text
                style={styles.resultText}
                numberOfLines={1}
                ellipsizeMode={'tail'}
            >
                { description }
            </Text>
        </TouchableOpacity>
    );
};

AddressSearchResults.PropTypes = {
    onSelectAddress: PropTypes.func,
    results: PropTypes.arrayOf(PropTypes.objectOf({
        description: PropTypes.string,
        placeId: PropTypes.string
    }))
};

AddressSearchResults.defaultProps = {
    onSelectAddress: () => {},
    results: []
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 15
    },
    currentLocationContainer: {
        alignItems: 'center',
        flexDirection: 'row'
    },
    currentLocationIcon: {
        fontSize: 24,
        marginRight: Spacing.marginSmall,
        color: Colors.ViewsBlue
    },
    currentLocationText: {
        color: Colors.ViewsBlue
    },
    resultItemContainer: {
        paddingVertical: Spacing.paddingLarge,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.ViewsGray2,
        maxHeight: 60
    },
    resultText: {
        ...Typography.body
    }

});

export default AddressSearchResults;
