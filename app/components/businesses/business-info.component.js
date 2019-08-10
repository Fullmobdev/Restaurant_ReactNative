import React, { Component } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import StarRating from 'react-native-star-rating';
import Icon from 'react-native-vector-icons/Ionicons';
import imgIcons from '../img-icons/img-icons';
import BookmarkButton from '../bookmark-button/bookmark-button.component';
import Recommendation from '../recommendation/recommendation.component';
import { Moments } from '../../services/moments/moments.constants';
import MomentRecommendation from '../moment-recommendation/moment-recommendation.component';

import Colors from '../../styles/colors.styles';
import Clock from '../../images/clock.png';
import { arrowDown } from '../icons/icons';
import { Typography } from '../../styles/typography.styles';

class BusinessInfo extends Component {
  state = {
    showHours: false
  }

  getHours = hours => {
    const d = new Date();
    const weekday = new Array(7);
    weekday[0] = 'Sunday';
    weekday[1] = 'Monday';
    weekday[2] = 'Tuesday';
    weekday[3] = 'Wednesday';
    weekday[4] = 'Thursday';
    weekday[5] = 'Friday';
    weekday[6] = 'Saturday';
    const day = weekday[d.getDay()];
    return hours[day];
  };

  renderPrice = () => {
    this.rows = [];
    for (let i = 0; i < this.props.priceLevel; i++) {
      this.rows.push(<Text style={{ color: Colors.viewsRed2 }}>$</Text>);
    }
    return (
      <View style={styles.priceContainer}>{ this.rows }</View>
    );
  };

  renderPercentages = moment => {
    const { recommendations } = this.props;

    return (recommendations && recommendations[moment]) ? recommendations[moment].percentRecommend : 0;
  }

  render() {
    const {
      businessNameContainer,
      lowerRowStyle
    } = styles;

    const {
      numOfRecommendations,
      percentRecommend,
      businessName,
      bookmarked,
      bookmarkPressed,
      hours,
      openNow,
      rating
    } = this.props;
    const openNowLabelStyle = openNow ? styles.openHoursTextOpen : styles.openHoursTextClosed;

    return (
      <View style={styles.container}>
        <View style={styles.businessLabelContainer}>
          <View>
            <Text style={styles.nameText}>{ businessName }</Text>
          </View>
          <View>
            <BookmarkButton selected={bookmarked} onPress={() => bookmarkPressed({ bookmarked })} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingBottom: 10 }}>
          <View style={{ paddingRight: 10 }}>
            <Recommendation
              percentRecommend={percentRecommend}
              numOfRecommendations={numOfRecommendations}
            />
          </View>
          {this.renderPrice()}
        </View>

        {/* <View style={styles.ratingPriceContainer}>
          <View style={styles.priceContainer}>{this.renderPrice()}</View>
        </View>
        <View style={businessNameContainer}>
          <View>
            <BookmarkButton selected={bookmarked} onPress={() => bookmarkPressed({ bookmarked })} />
          </View>
        </View>
        <View style={lowerRowStyle}>
          <Recommendation
            percentRecommend={percentRecommend}
            numOfRecommendations={numOfRecommendations}
          />
        </View> */}
        <View style={styles.momentRecommendationsContainer}>
          <MomentRecommendation
            moment={Moments.Food}
            recommendPercent={this.renderPercentages(Moments.Food)}
          />
          <MomentRecommendation
            moment={Moments.CustomerService}
            recommendPercent={this.renderPercentages('CustomerService')}
          />
          <MomentRecommendation
            moment={Moments.Ambiance}
            recommendPercent={this.renderPercentages(Moments.Ambiance)}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Image source={Clock} style={{ top: 2 }} />
          <View style={{ flex: 1, paddingLeft: 20 }}>
            <TouchableOpacity
              onPress={() => this.setState({ showHours: !this.state.showHours })}
              style={styles.openingHoursContainer}
            >
              <Text>
                <Text style={openNowLabelStyle}>
                  {openNow ? 'Open Now: ' : 'Closed: '}
                </Text>
                <Text>{ (hours) && this.getHours(hours)}</Text>
              </Text>
              { hours && <Icon name={arrowDown} color={Colors.viewsRed2} size={16} /> }
            </TouchableOpacity>
            {this.state.showHours && hours && (
              <View style={styles.hoursContainer}>
                {Object.keys(hours).map(key => {
                  return (
                    <View style={styles.openingHour}>
                      <Text style={[styles.openHoursText, { flex: 1 }]}>{key} </Text>
                      <Text style={[styles.openHoursText, { flex: 1 }]}>{hours[key]}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

      </View>
    );
  }
}

const styles = {
  ratingPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  businessLabelContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  businessNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingTop: 40,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    borderBottomWidth: 1,
    borderColor: '#d3d1d1'
  },
  lowerRowStyle: {
    flex: 0,
    flexDirection: 'row',
    marginTop: 5,
    paddingTop: 5
  },
  lowerLeftColumn: {
    width: '50%',
    alignItems: 'flex-start'
  },
  lowerRightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: '50%'
  },
  nameText: {
    ...Typography.title1,
    fontWeight: '800'
  },
  moreText: {
    color: '#2EC2F2',
    fontFamily: 'Avenir',
    fontWeight: '500'
  },
  googleImage: {
    width: 10,
    height: 12,
    marginRight: 7
  },
  tagsContainer: {
    marginTop: 15
  },
  momentRecommendationsContainer: {
    marginTop: 10
  },
  businessDescriptionContainer: {
    marginTop: 20
  },
  businessDescription: {
    color: '#4c4c4c'
  },
  openHoursTextOpen: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.ViewsGreen
  },
  openHoursTextClosed: {
    ...Typography.body,
    color: Colors.ViewsRed,
    fontWeight: '700',
  },
  openingHoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop: 16
  },
  openHoursToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  hours: {
    marginLeft: 8
  },
  hoursContainer: {
    paddingTop: 5
  },
  openingHour: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5
  },
  priceContainer: {
    flexDirection: 'row'
  },
  ratingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
};

export default BusinessInfo;
