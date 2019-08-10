import React, { Component } from 'react';
import { View, Image, TouchableOpacity, Text, ScrollView, StatusBar, Platform } from 'react-native';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';

import Icon from 'react-native-vector-icons/Ionicons';
import { Actions } from 'react-native-router-flux';
import * as locationService from '../../services/location/location.service';
import Colors from '../../styles/colors.styles';
import BusinessItem from './business-item.component';
import FilterItem from './filter-item.component';
import imgIcons from '../img-icons/img-icons';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;

const Radio = props => {
  const { selected, text, onPress } = props;
  let filterStyle = styles.filterStyle;
  if (selected) {
    filterStyle = [styles.filterStyle, styles.selectedSort];
  }
  return (
    <TouchableOpacity onPress={() => onPress(text)} style={styles.filter}>
      <View style={styles.circle}>{selected && <View style={styles.selectedCircle} />}</View>
      <Text style={filterStyle}>{text}</Text>
    </TouchableOpacity>
  );
};

class Restaurants extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 'Food',
      reviewsList: [],
      sortModalVisible: false,
      filterModalVisible: false,
      selectedSort: 'Latest',
      selectedFilters: [],
      currentCoords: null
    };
    this.quickFilters = [
      { id: 1, filter: 'Open Now' },
      { id: 2, filter: 'Rated 3.5+' },
      { id: 3, filter: 'Bookmarked' }
    ];
    this.averageCost = [{ id: 1, filter: '$' }, { id: 2, filter: '$$' }, { id: 3, filter: '$$$' }];
    this.tags = [
      { id: 1, filter: 'Fast Food' },
      { id: 2, filter: 'Romantic' },
      { id: 3, filter: 'Good for Dates' }
    ];
    this.currentCoords = null;
  }

  //WARNING! To be deprecated in React v17. Use componentDidMount instead.
  componentWillMount() {
    locationService.getCurrentLocation().then(loc => {
      this.setState({ currentCoords: loc });
    });
  }

  navigateToPreviousScene = () => {
    Actions.pop();
  };

  showSort = () => {
    this.setState({ sortModalVisible: true });
  };

  showFilters = () => {
    this.setState({ filterModalVisible: true });
  };

  selectSort = term => {
    this.setState({ selectedSort: term });
  };

  sortReviews = () => {
    this.setState({ sortModalVisible: false });
  };

  clearFilters = () => {
    this.setState({ selectedFilters: [] });
  };

  selectFilter = term => {
    const temparray = this.state.selectedFilters;
    if (temparray.indexOf(term) > -1) {
      temparray.splice(temparray.indexOf(term), 1);
    } else {
      temparray.push(term);
    }
    this.setState({ selectedFilters: temparray });
  };

  renderRestaurants = item => {
    if (!this.state.currentCoords) {
      return null;
    }

    const { location } = item;
    distanceInMiles = locationService.distFromLocation(location, this.state.currentCoords) || '';
    const distanceLabel = distanceInMiles ? `${distanceInMiles} mi` : '';
    return (
      <View key={item.businessId} style={styles.businessItemContainer}>
        <BusinessItem
          item={item}
          distanceLabel={distanceLabel}
          userLocation={this.state.currentCoords}
          businessScene={this.props.businessScene}
        />
      </View>
    );
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <StatusBar barStyle="dark-content" translucent />
        <View style={[styles.topButtonRow, { marginTop: 50 }]}>
          <TouchableOpacity onPress={this.navigateToPreviousScene}>
            <Icon
              style={styles.controlOption}
              name="ios-arrow-back"
              size={35}
              color={Colors.viewsRed2}
            />
          </TouchableOpacity>
          {/* <View style={styles.row}>
            <TouchableOpacity onPress={this.showSort}>
              <Image style={{ marginRight: 24 }} source={imgIcons.sort} />
            </TouchableOpacity>
            <TouchableOpacity onPress={this.showFilters}>
              <Icon name="ios-options" size={35} color={Colors.viewsRed2} />
            </TouchableOpacity>
          </View> */}
        </View>
        <Text style={styles.heading}>{this.props.heading}</Text>
        <View style={{ marginTop: 24 }}>
          {this.props.data && this.props.data.map(item => this.renderRestaurants(item))}
        </View>

        {/* SORTING MODAL */}
        <Modal
          isVisible={this.state.sortModalVisible}
          onBackdropPress={() => this.setState({ sortModalVisible: false })}
          style={styles.modal}
          animationIn="slideInDown"
          animationOut="slideOutUp"
        >
          <View style={styles.modalContent}>
            <View style={styles.topButtonRow}>
              <TouchableOpacity onPress={() => this.setState({ sortModalVisible: false })}>
                <Icon
                  style={styles.controlOption}
                  name="ios-arrow-back"
                  size={35}
                  color={Colors.viewsRed2}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={this.sortReviews}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalHeading}>Sort restaurants</Text>
            <Radio
              text="Latest"
              selected={this.state.selectedSort === 'Latest'}
              onPress={this.selectSort}
            />
            <Radio
              text="Recommended"
              selected={this.state.selectedSort === 'Recommended'}
              onPress={this.selectSort}
            />
            <Radio
              text="Most Liked"
              selected={this.state.selectedSort === 'Most Liked'}
              onPress={this.selectSort}
            />
          </View>
        </Modal>

        {/* FILTERS MODAL */}

        <Modal
          isVisible={this.state.filterModalVisible}
          onBackdropPress={() => this.setState({ filterModalVisible: false })}
          style={styles.modal}
          animationIn="slideInDown"
          animationOut="slideOutUp"
        >
          <ScrollView style={styles.modalContent} showsHorizontalScrollIndicator={false}>
            <View style={styles.topButtonRow}>
              <TouchableOpacity onPress={() => this.setState({ filterModalVisible: false })}>
                <Icon
                  style={styles.controlOption}
                  name="ios-arrow-back"
                  size={35}
                  color={Colors.viewsRed2}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={this.clearFilters}>
                <Text style={styles.doneText}>Clear all</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalHeading}>Filter restaurants</Text>
            {/* QUICK FILTER */}
            <View style={styles.filterContainer}>
              <Text style={styles.filterHeading}>Quick filters</Text>
              {this.quickFilters.map(item => {
                return (
                  <FilterItem
                    key={item.id}
                    text={item.filter}
                    checked={this.state.selectedFilters.indexOf(item.filter) >= 0}
                    onPress={() => this.selectFilter(item.filter)}
                  />
                );
              })}
            </View>

            {/* AVERAGE COST FILTERS */}
            <View style={styles.filterContainer}>
              <Text style={styles.filterHeading}>Average Cost</Text>
              {this.averageCost.map(item => {
                return (
                  <FilterItem
                    key={item.id}
                    text={item.filter}
                    checked={this.state.selectedFilters.indexOf(item.filter) >= 0}
                    onPress={() => this.selectFilter(item.filter)}
                  />
                );
              })}
            </View>
            {/* TAGS */}
            <View style={styles.filterContainer}>
              <Text style={styles.filterHeading}>Tags</Text>
              {this.tags.map(item => {
                return (
                  <FilterItem
                    key={item.id}
                    text={item.filter}
                    checked={this.state.selectedFilters.indexOf(item.filter) >= 0}
                    onPress={() => this.selectFilter(item.filter)}
                  />
                );
              })}
            </View>
          </ScrollView>
        </Modal>
      </ScrollView>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    shadowColor: '#e5eced',
    shadowOffset: {
      width: 0,
      height: 11
    },
    shadowRadius: 14,
    shadowOpacity: 1,
    paddingHorizontal: 16,
    marginTop: -STATUSBAR_HEIGHT
  },
  topButtonRow: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)'
  },
  modalHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4c4c4c',
    marginTop: 28
  },
  modal: {
    justifyContent: 'flex-start',
    margin: 0
  },
  filter: {
    flexDirection: 'row',
    marginTop: 34
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#ff3366',
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterStyle: {
    fontSize: 17,
    marginLeft: 16
  },
  selectedSort: {
    color: Colors.viewsRed2
  },
  selectedCircle: {
    width: 12,
    height: 12,
    borderRadius: 11,
    backgroundColor: '#ff3366'
  },
  doneText: {
    fontSize: 20,
    color: '#ff3366'
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4c4c4c',
    marginTop: 27
  },
  businessItemContainer: {
    width: '100%',
    marginTop: 8
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  filterContainer: {
    marginTop: 20
  },
  filterHeading: {
    fontSize: 17,
    // fontWeight: 'bold',
    color: '#4c4c4c',
    marginBottom: 8
  }
};

export default Restaurants;
