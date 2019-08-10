import React, { Component } from 'react';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import { SearchBar } from 'react-native-elements';
import PropTypes from 'prop-types';
import { Keyboard } from 'react-native';

// Components
import BusinessListItem from '../../components/business-list-item/business-list-item.component';

// Action creators
import { searchBusiness } from '../../actions/search-business/search-business.action';
import { selectBusiness } from '../../actions/business.action';

// Selectors
import { getBusinessSearchResults } from '../../selectors/business-search-selectors';

// services
import { detatchRecommendationsListner } from '../../services/recommendation/recommendation.service';
import { getAssociatedMedia } from '../../services/media/media-helper.service.js';

// Styles
import Colors from '../../styles/colors.styles';

class BusinessSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
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

  navigateToNextScene = scene => {
    Actions[scene]();
  };

  handleSearchBusiness = text => {
    this.searchText = text;
    this.setState({ text });
    this.props.onSearchBusiness(text);
  };

  selectBusiness = business => {
    this.props.onSelectBusiness(business);
    this.navigateToNextScene(this.props.nextScene);
  };

  showClearIcon = () => {
    if (this.state.text.length > 0) return true;
  };

  dismissKeyboard() {
    Keyboard.dismiss();
  }
  renderHeader = () => {
    return (
      <View style={styles.searchbarHeader}>
        <SearchBar
          textInputRef="text"
          placeholder="Search..."
          containerStyle={styles.searchbarContainer}
          icon={{ style: styles.searchbarIcon }}
          inputStyle={styles.searchbarInput}
          onChangeText={this.handleSearchBusiness}
          autoCorrect={false}
          clearIcon={this.showClearIcon()}
          onSubmitEditing={this.dismissKeyboard}
        />
      </View>
    );
  };

  renderFlatListItem = ({ item }) => {
    return this.renderBusinessListItem(item);
  };

  renderBusinessListItem = item => {
    return (
      <BusinessListItem
        id={item.id}
        name={item.name}
        address={item.address}
        highlightText={this.searchText}
        loading={this.props.loadingRecommendations}
        onPressItem={() => this.selectBusiness(item)}
        photoReference={item.photoReference}
        photoUri={item.photoUri}
        percentRecommend={item.percentRecommend}
        numOfRecommendations={item.numOfRecommendations}
      />
    );
  };

  render() {
    return (
      <View style={styles.container}>
        {this.renderHeader()}
        <FlatList
          keyboardShouldPersistTaps="always"
          data={this.props.searchResults}
          renderItem={this.renderFlatListItem}
          keyExtractor={item => item.id}
        />
      </View>
    );
  }
}

BusinessSearch.propTypes = {
  loadingRecommendations: PropTypes.bool,
  onSearchBusiness: PropTypes.func,
  onSelectBusiness: PropTypes.func,
  searchResults: PropTypes.array
};

const styles = StyleSheet.create({
  backIconContainer: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44
  },
  backIcon: {
    color: Colors.ViewsGray4
  },
  container: {
    flex: 1
  },
  searchbarContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 0,
    borderTopWidth: 0,
    flex: 1
  },
  searchbarHeader: {
    borderBottomColor: Colors.ViewsGray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20
  },
  searchbarIcon: {
    fontSize: 20,
    top: 12,
    left: 10
  },
  searchbarInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 0,
    color: Colors.ViewsGray4,
    fontSize: 16,
    borderRadius: 2,
    marginVertical: 0,
    marginHorizontal: 0,
    height: 44,
    paddingLeft: 40
  }
});

const mapStateToProps = state => {
  return {
    loadingRecommendations: state.businessSearch.businessSearchResults.isFetchingRecommendations,
    searchResults: getBusinessSearchResults(state)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSearchBusiness: searchText => {
      dispatch(searchBusiness(searchText));
    },
    onSelectBusiness: business => {
      dispatch(selectBusiness(business));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BusinessSearch);
