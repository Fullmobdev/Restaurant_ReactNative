import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { FlatList, Text, View } from 'react-native';

import * as locationService from '../../services/location/location.service';
import SearchItem from '../discover/search-item.component';

class BusinessSearchResultsList extends Component {
    renderResultItem = (data) => {
        const { item } = data;
        const { currentLocation, loading, onPressItem } = this.props;

        const distanceInMiles =
            locationService.distFromLocation(item.location, currentLocation) || null;

        return (
            <SearchItem
                id={item.id}
                name={item.name}
                address={item.address}
                loading={loading}
                location={item.location}
                onPressItem={() => onPressItem(item)}
                photoReference={item.photoReference}
                photoUri={item.photoUri}
                percentRecommend={item.percentRecommend}
                recommendations={item.recommendations}
                neighborhood={item.neighborhood}
                numOfRecommendations={item.numOfRecommendations}
                rating={item.rating}
                distance={distanceInMiles}
            />
        );
    };

    render() {
        const { results } = this.props;

        return (
            <View>
                <FlatList
                    keyboardShouldPersistTaps="always"
                    data={results}
                    renderItem={this.renderResultItem}
                    keyExtractor={item => item.id}
                />
            </View>
        );
    }
}

BusinessSearchResultsList.PropTypes = {
    currentLocation: PropTypes.objectOf({
        latitude: PropTypes.number,
        longitude: PropTypes.number
    }),
    loading: PropTypes.bool,
    onPressItem: PropTypes.func,
    results: PropTypes.arrayOf(PropTypes.object)
};

BusinessSearchResultsList.PropTypes = {
    loading: false,
    onPressItem: () => {},
    results: []
};

export default BusinessSearchResultsList;
