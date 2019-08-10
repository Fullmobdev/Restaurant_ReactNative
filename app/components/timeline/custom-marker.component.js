import React, { Component } from 'react';
import { Marker } from 'react-native-maps';
import { connect } from 'react-redux';
import { fetchBusinessRecommendationsByPlaceId } from '../../actions/business.action';

class CustomMarker extends Component {
  componentDidMount() {
    this.props.onLoadRecommendation(this.props.result.id);
  }
  render() {
    const { latitude, longitude, onPress, image } = this.props;
    return (
      <Marker
        coordinate={{
          latitude,
          longitude
        }}
        onPress={onPress}
        image={image}
      />
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLoadRecommendation: placeId => {
      dispatch(fetchBusinessRecommendationsByPlaceId(placeId));
    }
  };
};
export default connect(
  null,
  mapDispatchToProps
)(CustomMarker);
