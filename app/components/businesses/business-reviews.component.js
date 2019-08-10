import React, { Component } from 'react';
import { Dimensions, View, Image, TouchableOpacity, Text } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Typography } from '../../styles/typography.styles';
import Colors from '../../styles/colors.styles';

class BusinessReviews extends Component {
  navigateToGallery = () => {
    const { galleryScene } = this.props;
    Actions[galleryScene]();
  };

  keyExtractor = (item, index) => {
    return item.reviewId;
  };

  render() {
    const { reviewsList } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Explore restaurant</Text>
          {reviewsList.length > 3 && (
            <TouchableOpacity onPress={this.navigateToGallery}>
              <Text style={styles.seeAll}>see all</Text>
            </TouchableOpacity>
          )}
        </View>
        {reviewsList.length > 0 && (
          <View style={styles.reviewsContainer}>
            <TouchableOpacity
              onPress={() => this.props.itemPressed({ item: reviewsList[0], index: 0 })}
              style={styles.largeReview}
            >
              <Image
                style={styles.image}
                source={{ uri: reviewsList[0].thumbnail }}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View>
              {reviewsList[1] && (
                <TouchableOpacity
                  onPress={() => this.props.itemPressed({ item: reviewsList[1], index: 1 })}
                  style={styles.review}
                >
                  <Image
                    style={styles.image}
                    source={{ uri: reviewsList[1].thumbnail }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              {reviewsList[2] && (
                <TouchableOpacity
                  onPress={() => this.props.itemPressed({ item: reviewsList[2], index: 2 })}
                  style={styles.smallReview}
                >
                  <Image
                    style={styles.image}
                    source={{ uri: reviewsList[2].thumbnail }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }
}

const styles = {
  container: {
    marginTop: 8,
    height: 382,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    shadowColor: '#e5eced',
    shadowOffset: {
      width: 0,
      height: 11
    },
    shadowRadius: 14,
    shadowOpacity: 1,
    paddingVertical: 12,
    paddingHorizontal: 16
  },

  reviewsContainer: {
    flexDirection: 'row'
  },
  largeReview: {
    width: 200,
    height: 309,
    backgroundColor: 'gray',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  },
  review: {
    marginLeft: 8,
    width: 134,
    height: 185,
    backgroundColor: 'gray',
    borderRadius: 10,
    overflow: 'hidden'
  },
  smallReview: {
    marginTop: 8,
    marginLeft: 8,
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
    height: undefined,
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageStyle: {
    aspectRatio: 1,
    width: '100%',
    height: null,
    resizeMode: 'cover'
  },
  cardStyle: {
    maxWidth: Dimensions.get('window').width / 2,
    flex: 0,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#fff',
    borderBottomWidth: 0
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 24
  },
  heading: {
    ...Typography.headline
  },
  seeAll: {
    ...Typography.headline,
    color: Colors.ViewsRed
  }
};

export default BusinessReviews;
