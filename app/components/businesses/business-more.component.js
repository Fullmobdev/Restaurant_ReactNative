import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import getDirections from 'react-native-google-maps-directions';
import { fetchBusinessDetail } from '../../actions/business.action';
import BusinessMoreView from './business-more-presentation.component';

class BusinessMore extends Component {
  constructor(props) {
    super(props);
  }

  handleGetDirections = () => {
    const data = {
      source: {
        latitude: undefined,
        longitude: undefined
      },
      destination: {
        latitude: this.props.location.lat,
        longitude: this.props.location.lng
      },
      params: [
        {
          key: 'dirflg',
          value: 'w'
        }
      ]
    };

    getDirections(data);
  };

  render() {
    let { location } = this.props;
    if (location == null) {
      location = {};
      location.lat = 0;
      location.long = 0;
    }
    return (
      <BusinessMoreView
        businessName={this.props.businessName}
        telephone={this.props.telephone}
        address={this.props.address}
        website={this.props.website}
        hours={this.props.hours}
        location={location}
        openGoogleMap={this.handleGetDirections}
      />
    );
  }
}

const mapStateToProps = state => {
  const { businesses } = state;
  const { businessId: selectedBusinessId, apiId } = businesses.selectedBusiness;
  const business = businesses[selectedBusinessId] 
    || businesses.byPlaceId[apiId] || {};

  const {
    businessName,
    businessCategory,
    telephone,
    address,
    website,
    hours,
    location
  } = business;

  return {
    businessName,
    businessCategory,
    telephone,
    address,
    website,
    hours,
    location
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchBusinessDetail: businessId => dispatch(fetchBusinessDetail(businessId, businessCategory))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BusinessMore);
