import React, { Component } from 'react';
import { View, Image, TouchableOpacity, Text, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';

import Icon from 'react-native-vector-icons/Ionicons';
import { Actions } from 'react-native-router-flux';
import Colors from '../../styles/colors.styles';

import { filterBusinessReviews, reviewSelected } from '../../actions/review.action';

// Constants
import { Moments } from '../../services/moments/moments.constants';
import { FilterTypes, FilterOrderTypes } from '../../types/filter.types';

const MomentTab = props => {
  const { moment, selected, onPress } = props;
  const momentStyle = styles.momentStyle;

  return (
    <TouchableOpacity onPress={() => onPress(moment)} style={styles.moment}>
      <Text style={selected && momentStyle}>{moment}</Text>
      {selected && <View style={styles.selected} />}
    </TouchableOpacity>
  );
};

const Radio = props => {
  const { filter, selected, text, onPress } = props;
  let filterStyle = styles.filterStyle;
  if (selected) {
    filterStyle = [styles.filterStyle, styles.selectedFilter];
  }
  return (
    <TouchableOpacity onPress={() => onPress(filter)} style={styles.filter}>
      <View style={styles.circle}>{selected && <View style={styles.selectedCircle} />}</View>
      <Text style={filterStyle}>{text}</Text>
    </TouchableOpacity>
  );
};

class BusinessGallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: Moments.Food,
      modalVisible: false
    };
  }

  getReviewsList = (selectedMoment) => {
    return this.props.reviewsByMoment[selectedMoment];
  }

  reviewPressed = (index) => {
    const { businessId, onReviewSelected, reviewIdsByMoment, reviewScene } = this.props;
    const reviewIds = reviewIdsByMoment[this.state.selected];
    onReviewSelected(index, reviewIds, businessId);
    Actions[reviewScene]();
  };

  navigateToPreviousScene = () => {
    Actions.pop();
  };

  showFilters = () => {
    this.setState({ modalVisible: true });
  };

  selectFilter = (filter) => {
    this.props.onFilter(filter, FilterOrderTypes.descending);
    this.setState({ modalVisible: false });
  };

  selectMoment = moment => {
    this.setState({ selected: moment });
  };

  renderRows = () => {
    const rows = [];
    const reviewsList = this.getReviewsList(this.state.selected);

    for (let i = 0; i < reviewsList.length; i += 3) {
      if ((i + 1) % 2 !== 0) {
        rows.push(
          <View style={styles.reviewsContainer}>
            <TouchableOpacity
              onPress={() => this.reviewPressed(i)}
              style={styles.largeReview}
            >
              <Image
                style={styles.image}
                source={{ uri: reviewsList[i].thumbnail }}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={{ marginLeft: 8 }}>
              {i + 1 < reviewsList.length && (
                <TouchableOpacity
                  onPress={() => this.reviewPressed(i + 1)}
                  style={styles.review}
                >
                  <Image
                    style={styles.image}
                    source={{ uri: reviewsList[i + 1].thumbnail }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              {i + 2 < reviewsList.length && (
                <TouchableOpacity
                  onPress={() => this.reviewPressed(i + 2)}
                  style={styles.smallReview}
                >
                  <Image
                    style={styles.image}
                    source={{ uri: reviewsList[i + 2].thumbnail }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      } else {
        rows.push(
          <View style={styles.reviewsContainer}>
            <View style={{ marginRight: 8 }}>
              <TouchableOpacity
                onPress={() => this.reviewPressed(i)}
                style={styles.review}
              >
                <Image
                  style={styles.image}
                  source={{ uri: reviewsList[i].thumbnail }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              {i + 1 < reviewsList.length && (
                <TouchableOpacity
                  onPress={() => this.reviewPressed(i + 1)}
                  style={styles.smallReview}
                >
                  <Image
                    style={styles.image}
                    source={{ uri: reviewsList[i + 1].thumbnail }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            </View>
            {i + 2 < reviewsList.length && (
              <TouchableOpacity
                onPress={() => this.reviewPressed(i + 2)}
                style={styles.largeReview}
              >
                <Image
                  style={styles.image}
                  source={{ uri: reviewsList[i + 2].thumbnail }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          </View>
        );
      }
    }
    return rows;
  };

  render() {
    const momentStyle = styles.momentStyle;
    return (
      <ScrollView style={styles.container} showsHorizontalScrollIndicator={false}>
        <Modal
          isVisible={this.state.modalVisible}
          onBackdropPress={() => this.setState({ modalVisible: false })}
          style={styles.modal}
          animationIn="slideInDown"
          animationOut="slideOutUp"
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Filter Reviews</Text>
            <Radio
              filter={FilterTypes.createdDate}
              text="Latest"
              selected={this.props.filterBy === FilterTypes.createdDate}
              onPress={this.selectFilter}
            />
            <Radio
              filter={FilterTypes.likes}
              text="Most Liked"
              selected={this.props.filterBy === FilterTypes.likes}
              onPress={this.selectFilter}
            />
          </View>
        </Modal>
        <View style={styles.topButtonRow}>
          <TouchableOpacity onPress={this.navigateToPreviousScene}>
            <Icon
              style={styles.controlOption}
              name="ios-arrow-back"
              size={35}
              color={Colors.viewsRed2}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.showFilters}>
            <Icon name="ios-options" size={35} color={Colors.viewsRed2} />
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <Text style={styles.heading}>Explore restaurant</Text>
        </View>
        <View style={styles.moments}>
          <MomentTab
            moment="Food"
            selected={this.state.selected === 'Food'}
            onPress={this.selectMoment}
          />
          <MomentTab
            moment="Customer Service"
            selected={this.state.selected === 'Customer Service'}
            onPress={this.selectMoment}
          />
          <MomentTab
            moment="Ambiance"
            selected={this.state.selected === 'Ambiance'}
            onPress={this.selectMoment}
          />
        </View>
        {this.renderRows()}
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
    paddingHorizontal: 16
  },

  reviewsContainer: {
    marginTop: 8,
    flexDirection: 'row'
  },
  largeReview: {
    width: 200,
    height: 309,
    backgroundColor: 'gray',
    borderRadius: 10,
    overflow: 'hidden'
  },
  review: {
    width: 134,
    height: 185,
    backgroundColor: 'gray',
    borderRadius: 10,
    overflow: 'hidden'
  },
  smallReview: {
    marginTop: 8,
    width: 134,
    height: 116,
    backgroundColor: 'gray',
    borderRadius: 10,
    overflow: 'hidden'
  },
  image: {
    flex: 1,
    alignSelf: 'stretch',
    width: undefined,
    height: undefined
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 24,
    marginTop: 28
  },
  heading: {
    fontSize: 17,
    color: '#4c4c4c'
  },
  topButtonRow: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  moments: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: -16
  },
  moment: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selected: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#ff3366'
  },
  momentStyle: {
    color: Colors.viewsRed2
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
  selectedFilter: {
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
  }
};

const mapStateToProps = state => {
  const { businesses, businessReviews } = state;
  const { businessId: selectedBusinessId } = businesses.selectedBusiness;
  const business = businesses[selectedBusinessId];
  const { businessId, businessName, photoUri, reviewIdsByMoment } = business;
  
  const reviewsByMoment = {
    [Moments.Food]: getReviewsList(reviewIdsByMoment[Moments.Food], businessReviews),
    [Moments.CustomerService]: getReviewsList(reviewIdsByMoment[Moments.CustomerService], businessReviews),
    [Moments.Ambiance]: getReviewsList(reviewIdsByMoment[Moments.Ambiance], businessReviews),
  };

  return {
    businessId,
    businessName,
    businessImage: photoUri,
    filterBy: businessReviews.filterBy,
    reviewsByMoment,
    reviewIdsByMoment,
    business
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onReviewSelected: (index, reviewIds, businessId) => { dispatch(reviewSelected({ index, reviewIds, businessId })); },
    onFilter: (filter, filterOrder) => { dispatch(filterBusinessReviews({ filter, filterOrder })); }
  };
};

const getReviewsList = (reviewIds = [], reviews) => {
  return reviewIds.map(reviewId => {
    const review = reviews[reviewId];
    
    return {
      reviewId,
      thumbnail: review.thumbnail,
      moment: review.moment,
      numLikes: review.numLikes,
      createdTime: review.createdTime
    };
  });
}

export default connect(mapStateToProps, mapDispatchToProps)(BusinessGallery);
