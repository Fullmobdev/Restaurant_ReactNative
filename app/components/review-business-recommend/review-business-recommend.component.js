import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';

// Components
import ReviewBusinessRecommendView from './review-business-recommend-presentation.component';

// Actions
import { fetchBusinessRecommendByUser } from '../../actions/business.action';
import { momentSelected } from '../../actions/moment.action';

// Styles
import Colors from '../../styles/colors.styles';

class ReviewBusinessRecommend extends Component {
  state = {};

  componentDidMount() {
    const { business, onFetchUserRecommendation, moment } = this.props;
    onFetchUserRecommendation(business.id, moment);
  }

  toggleRecommendation = recommendation => {
    this.setState({ selectedRecommendation: recommendation });
  };

  selectMoment = moment => {
    this.props.momentSelected(moment);
  };
  render() {
    const {
      business,
      buttonTitle,
      onPost,
      disabled,
      loading,
      moment,
      recommendation,
      recommendationLoaded
    } = this.props;
    const { selectedRecommendation } = this.state;

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <MaterialIndicator 
            style={styles.loader}
            color={Colors.ViewsBlue}
            animating 
          />
        </View>
      );
    }

    return (
      <ReviewBusinessRecommendView
        buttonTitle={buttonTitle}
        moment={moment}
        name={business.name}
        recommendation={selectedRecommendation == null ? recommendation : selectedRecommendation}
        onPost={onPost}
        onToggle={this.toggleRecommendation}
        disabled={disabled}
        recommendationLoaded={recommendationLoaded}
        selectMoment={this.selectMoment}
      />
    );
  }
}

ReviewBusinessRecommend.propTypes = {
  business: PropTypes.object.isRequired,
  recommendation: PropTypes.bool,
  onPost: PropTypes.func
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loader: {
    fontSize: 20
  }
});

const mapStateToProps = state => {
  const { moment } = state;
  const { 
    business, 
    recommendation, 
    recommendationLoaded, 
    name,
    placeDetailsLoading 
  } = moment;

  return {
    business,
    recommendation,
    recommendationLoaded,
    moment: name,
    loading: placeDetailsLoading || false,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onFetchUserRecommendation: (businessId, moment) => {
      dispatch(fetchBusinessRecommendByUser(businessId, moment));
    },
    momentSelected: moment => dispatch(momentSelected(moment))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewBusinessRecommend);
