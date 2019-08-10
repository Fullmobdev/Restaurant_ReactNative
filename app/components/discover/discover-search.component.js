import { Subject } from 'rxjs/Rx';
import { debounceTime } from 'rxjs/operators';
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAutocompleteForAddress } from '../../services/search/search.service';

import ViewsIcon from '../../fonts/icon-font';
import Colors from '../../styles/colors.styles';
import { Typography } from '../../styles/typography.styles';
import * as locationService from '../../services/location/location.service';

// Action creators
import { searchBusiness, loadPlaceDetails } from '../../actions/search-business/search-business.action';
import { selectBusiness } from '../../actions/business.action';

// Selectors
import { getBusinessSearchResults } from '../../selectors/business-search-selectors';
import { detatchRecommendationsListner } from '../../services/recommendation/recommendation.service';
import Searchbar from '../searchbar/searchbar.component';
import TitleBarBackButton from '../title-bar-back-button/title-bar-back-button.component';
import AddressSearchResults from '../address-search-results/address-search-results.component';
import BusinessSearchResultsList from '../business-search/business-search-results-list.component';

const onAddressTextChanged$ = new Subject().pipe(debounceTime(200));

class DiscoverSearch extends Component {
  constructor(props) {
    super(props);

    this.currentLocationCoords = null;
    this.currentLocation = {
      description: 'Current Location',
      placeId: '',
      location: null
    };
    this.selectedLocation = this.currentLocation;
    this.state = {
      editLocation: false,
      text: '',
      searchResults: false,
      clearIcon: false,
      searchText: '',
      locationText: '',
      locationClearIcon: false,
      locationResults: [],
      locationCoords: null
    };
  }

  componentDidMount() {
    locationService.getCurrentLocation()
    .then(location => {
      this.currentLocationCoords = location;
      this.currentLocation.location = location;
      this.props.onSearchBusiness('', this.currentLocationCoords);
    });

    this.setState({ searchText: this.props.businessSearchText });
    onAddressTextChanged$.subscribe(this.handleAddressAutocomplete);
  }

  componentWillUnmount = () => {
    this.cleanupResources();
  };

  cleanupResources = () => {
    const searchResults = this.props.searchResults;
    const businessKeys = [];

    searchResults.map(searchResult => {
      const { businessId, businessCategory } = searchResult;
      const businessKey = { businessId, businessCategory };
      businessKeys.push(businessKey);
      return businessKeys;
    });

    detatchRecommendationsListner(businessKeys);
  };

  getRecentSearches = () => {
    let recentSearches = [];
    let businessSearchResultIds;
    const { businessSearchResults, businessSearches } = this.props;
    const { searchText } = this.state;
    if (searchText) {
      businessSearchResultIds = businessSearches[searchText];
    }
    if (businessSearchResultIds && businessSearchResultIds.length > 0) {
      recentSearches = businessSearchResultIds.map(id => {
        return businessSearchResults[id];
      });
    }
    return recentSearches.slice(0, 2) || [];
  };

  navigateToPreviousScene = () => {
    Actions.pop();
  };

  handleSearchBusiness = (text = this.state.text) => {
    if (text !== this.state.text) {
      this.searchText = text;
      this.setState({ text });
    }

    const { location, placeId } = this.selectedLocation;
    this.props.onSearchBusiness(text, location, placeId);
  };

  handleAddressAutocomplete = (text) => {
    getAutocompleteForAddress(text)
    .then(locations => {
      this.setState({ locationResults: locations });
    });
  }

  handleSelectAddress = (region) => {
    this.setState({ editLocation: false });
    this.selectedLocation = {
      location: null,
      ...region
    };
    this.handleSearchBusiness();
  }

  onAddressTextChange = (text) => {
    if (!text) { return; }
    onAddressTextChanged$.next(text);
  }

  onLocationPress = item => {
    this.setState(
      {
        selectedLocation: item,
        locationText: '',
        locationCoords: { latitude: item.location.lat, longitude: item.location.lng }
      },
      () => {
        this.handleSearchBusiness(this.state.text);
      }
    );
  };

  changeLocation = () => {
    this.setState({ editLocation: true });
  };

  // clearText = () => {
  //   this.setState({ text: '', searchResults: false, clearIcon: false });
  //   this.props.onSearchBusiness('', this.state.locationCoords);
  // };

  selectBusiness = business => {
    this.props.onSelectBusiness(business);
    this.props.onLoadPlaceDetails(business);
    this.navigateToNextScene(this.props.nextScene);
  };

  navigateToNextScene = scene => {
    Actions[scene]();
  };

  onPressItem = item => {
    if (this.props.tagBusiness) {
      this.props.onPressBusiness(item);
    } else {
      this.selectBusiness(item);
    }
  };

  renderSearchHeader = () => {
    return (
      <View style={styles.searchHeader}>
        <TitleBarBackButton containerStyle={styles.backButtonContainer} onPress={this.navigateToPreviousScene} />
        <View style={{ flex: 1 }}>
          <Searchbar
            clearIcon
            containerStyle={{ marginBottom: 5 }}
            iconName="ios-search"
            onChangeText={this.handleSearchBusiness}
            placeholder="Search restaurant, cuisines..."
          />
          {
            this.state.editLocation ?
            <Searchbar
              clearIcon
              viewsIconName="location_pin_outline"
              placeholder="Neighborhood, city, or state"
              onChangeText={this.onAddressTextChange}
            /> :
            this.renderSelectedLocation()
          }
        </View>
      </View>
    );
  };

  renderSelectedLocation = () => {
    const { selectedLocation } = this;
    locationText = selectedLocation.description;
    iconStyle = styles.icon;
    locationTextStyle = styles.locationText;

    return (
      <View style={styles.selectedLocationContainer}>
        <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', paddingRight: 10 }}>
          <ViewsIcon name="location_pin_outline" style={iconStyle} />
          <Text numberOfLines={1} ellipsizeMode={'tail'} style={locationTextStyle}>{locationText}</Text>
        </View>
        <View>
          <TouchableOpacity onPress={this.changeLocation}>
            <Text style={styles.changeText}>change</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderAddressSearchResults = () => {
    return (
      <AddressSearchResults
        onSelectAddress={this.handleSelectAddress}
        currentLocation={this.currentLocation}
        results={this.state.locationResults}
      />
    );
  }

  renderRecentSearches = (recentSearches) => {
    const heading = 'recent searches';
    return (
      <View>
        { this.renderSearchResultsHeading(heading) }
        <BusinessSearchResultsList
          currentLocation={this.currentLocationCoords}
          loading={this.props.loadingRecommendations}
          onPressItem={this.onPressItem}
          results={recentSearches}
        />
      </View>
    );
  }

  renderNearbyResults = (results) => {
    const heading = 'Near You';
    return (
      <View>
        { this.renderSearchResultsHeading(heading) }
        <BusinessSearchResultsList
          currentLocation={this.currentLocationCoords}
          loading={this.props.loadingRecommendations}
          onPressItem={this.onPressItem}
          results={results}
        />
      </View>
    );
  }

  renderSearchResultsHeading(heading) {
    return (
      <Text style={styles.searchResultsHeading}>{heading.toUpperCase()}</Text>
    );
  }

  render() {
    const recentSearches = this.getRecentSearches();
    const { searchResults } = this.props;
    const { editLocation } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          { this.renderSearchHeader() }
          { editLocation && this.renderAddressSearchResults() }
          { !editLocation &&
            <ScrollView
            keyboardDismissMode='on-drag'
            keyboardShouldPersistTaps='always'
            style={{ flex: 1, paddingHorizontal: 15 }}>
              { recentSearches && recentSearches.length > 0 && this.renderRecentSearches(recentSearches) }
              { searchResults && searchResults.length > 0 && this.renderNearbyResults(searchResults) }
            </ScrollView>
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  backButtonContainer: {
    paddingVertical: 15,
    paddingRight: 20
  },
  container: {
    flex: 1,
    backgroundColor: Colors.ViewsWhite
  },
  searchContainer: {
    flex: 1,
    paddingTop: 30
  },
  searchHeader: {
    flexDirection: 'row',
    paddingHorizontal: 15
  },
  searchResultsHeading: {
    ...Typography.bodySmall,
    color: Colors.ViewsGray1
  },
  selectedLocationContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  locationText: {
    ...Typography.body,
    paddingLeft: 20,
    paddingRight: 10
  },
  icon: {
    color: Colors.ViewsRed,
    fontSize: 24
  }
});

const mapStateToProps = state => {
  const { businessSearch } = state;
  const { businessSearchResults, businessSearchText, businessSearches } = businessSearch;

  return {
    loadingRecommendations: state.businessSearch.businessSearchResults.isFetchingRecommendations,
    searchResults: getBusinessSearchResults(state),
    businessSearchText,
    businessSearchResults,
    businessSearches
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadPlaceDetails: business => {
      const { id } = business;
      dispatch(loadPlaceDetails(id));
    },
    onSearchBusiness: (searchText, locationCoords, placeId) => {
      dispatch(searchBusiness(searchText, locationCoords, placeId));
    },
    onSelectBusiness: business => {
      dispatch(selectBusiness(business));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DiscoverSearch);
