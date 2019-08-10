import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

class ReviewRows extends Component {
  renderRows = () => {
    const rows = [];
    const { reviewsList } = this.props;

    for (let i = 0; i < reviewsList.length; i += 3) {
      if ((i + 1) % 2 !== 0) {
        rows.push(
          <View style={styles.reviewsContainer} key={reviewsList[i].reviewId}>
            <TouchableOpacity
              onPress={() => this.props.itemPressed(reviewsList[i])}
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
                  onPress={() => this.props.itemPressed(reviewsList[i + 1])}
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
                  onPress={() => this.props.itemPressed(reviewsList[i + 2])}
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
          <View style={styles.reviewsContainer} key={reviewsList[i].reviewId}>
            <View style={{ marginRight: 8 }}>
              <TouchableOpacity
                onPress={() => this.props.itemPressed(reviewsList[i])}
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
                  onPress={() => this.props.itemPressed(reviewsList[i + 1])}
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
                onPress={() => this.props.itemPressed(reviewsList[i + 2])}
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
    return <View>{this.renderRows()}</View>;
  }
}

const styles = StyleSheet.create({
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
  }
});
export default ReviewRows;
