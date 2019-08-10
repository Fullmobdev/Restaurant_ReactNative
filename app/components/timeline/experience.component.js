import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import StarRating from 'react-native-star-rating';
import moment from 'moment';
import SearchItem from '../discover/search-item.component';
import Tags from '../tags';

class Experience extends Component {
  constructor(props) {
    super(props);
    this.tags = [
      { id: '1', name: 'Good for dates' },
      { id: '2', name: 'Romantic' },
      { id: '5', name: 'Family dinner' },
      { id: '3', name: 'French' },
      { id: '4', name: 'Ambiance' },
      { id: '6', name: 'Mediteranean' },
      { id: '7', name: 'Indian' },
      { id: '8', name: 'Noisy' }
    ];
    this.state = {
      selectedTags: [],
      rating: 4,
      businessId: this.props.businessId,
      visitId: this.props.visitId
    };
  }

  handleSubmitExperience = () => {
    const { businessId, visitId, rating, selectedTags } = this.state;
    this.props.onSubmitExperience(businessId, visitId, rating, selectedTags);
  }

  handleTagPress = tag => {
    const temparray = this.state.selectedTags;
    if (temparray.indexOf(tag) > -1) {
      temparray.splice(temparray.indexOf(tag), 1);
    } else {
      temparray.push(tag);
    }
    this.setState({ selectedTags: temparray });
  };

  onStarRatingPress = rating => {
    this.setState({ rating });
  };

  render() {
    const { experienceModalVisible, onCancelExperience, businessName, reviewCreated } = this.props;
    const formattedTime = moment.utc(reviewCreated).calendar();
    return (
      <Modal
        isVisible={experienceModalVisible}
        onBackdropPress={onCancelExperience}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContent}>
          <ScrollView>
            <View style={styles.header}>
              <Text style={styles.experienceText}>How was your experience?</Text>
              <Text style={styles.timeText}>{formattedTime}</Text>
            </View>
            <View style={styles.bodyContainer}>
              {/* BUSINESS INFORMATION HERE */}
              <SearchItem
                name={businessName}
                hideRating
                style={{ backgroundColor: 'transparent' }}
              />
              <View style={styles.tagsContainer}>
                <Text style={styles.tagsText}>Select your tags</Text>
                <View style={styles.tags}>
                  {this.tags.map(tag => (
                    <Tags
                      onTagPress={this.handleTagPress}
                      key={tag.id}
                      tag={tag}
                      checked={this.state.selectedTags.indexOf(tag.name) >= 0}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.ratingContainer}>
                <Text style={styles.rateRestaurantText}>Rate Restaurant</Text>
                <StarRating
                  disabled={false}
                  maxStars={5}
                  rating={this.state.rating}
                  halfStar="star-half-o"
                  selectedStar={rating => this.onStarRatingPress(rating)}
                  fullStarColor={Colors.viewsRed2}
                  halfStarColor={Colors.viewsRed2}
                  emptyStar="star"
                  emptyStarColor="#e7e7e7"
                  starSize={36}
                  starStyle={{ marginRight: 20 }}
                />
              </View>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={this.handleSubmitExperience} style={styles.submitButton}>
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCancelExperience} style={styles.notNowButton}>
                  <Text style={styles.notNowButtonText}>Not now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderRadius: 13,

    backgroundColor: '#F9FAFC'
  },
  header: {
    width: '100%',
    height: 76,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#e5eced',
    shadowOffset: {
      width: 0,
      height: 11
    },
    shadowRadius: 14,
    shadowOpacity: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  experienceText: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: -0.41,
    textAlign: 'center',
    color: '#000000'
  },
  timeText: {
    marginTop: 2,
    fontSize: 15,
    letterSpacing: 0.56,
    textAlign: 'center',
    color: '#aaaaaa'
  },
  bodyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  tagsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  tags: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  tagsText: {
    fontSize: 15,
    letterSpacing: 0.56,
    textAlign: 'center',
    color: '#aaaaaa'
  },
  ratingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20
  },
  rateRestaurantText: {
    marginBottom: 20,
    fontSize: 15,
    letterSpacing: 0.56,
    textAlign: 'center',
    color: '#aaaaaa'
  },
  buttonsContainer: {
    width: '100%'
  },
  submitButton: {
    marginTop: 35,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 10,
    width: '100%',
    backgroundColor: Colors.viewsRed2,
    height: 57,
    borderRadius: 13
  },
  notNowButton: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 10,
    width: '100%',
    height: 57
  },
  submitButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  notNowButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000'
  }
});

export default Experience;
