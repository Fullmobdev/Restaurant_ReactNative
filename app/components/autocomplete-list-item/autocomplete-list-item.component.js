import React from 'react';
import { StyleSheet } from 'react-native';
import { PropTypes } from 'prop-types';

// Components
import BusinessListItem from '../../components/business-list-item/business-list-item.component';

const AutocompleteListItem = ({
    name,
    address,
    photoUri,
    onPressItem
}) => {
    return (
        <BusinessListItem
            addressStyle={styles.addressStyle}
            containerStyle={styles.container}
            iconSize={40}
            nameStyle={styles.nameStyle}
            thumbnailContainerStyle={styles.thumbnailContainerStyle}
            name={name}
            address={address}
            photoUri={photoUri}
            onPressItem={onPressItem}
        />
    );
};

AutocompleteListItem.propTypes = {
    address: PropTypes.string,
    name: PropTypes.string.isRequired,
    photoUri: PropTypes.string
};

const styles = StyleSheet.create({
    addressStyle: {
        fontSize: 12,
        fontFamily: 'Avenir',
    },
    container: {
        borderTopWidth: 0,
        paddingLeft: 55
    },
    nameStyle: {
        marginBottom: 0,
        fontSize: 12,
        fontFamily: 'Avenir',
    },
    thumbnailContainerStyle: {
        borderRadius: 0,
        height: 30,
        width: 30
    }
});

export default AutocompleteListItem;
