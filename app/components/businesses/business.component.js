import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { fetchBusinessDetail, fetchBusinessRecommendationsByBusinessId, bookmarkBusiness } from '../../actions/business.action';
import { fetchReviewsForBusiness, reviewSelected, selectVisit } from '../../actions/review.action';
import BusinessView from './business-presentation.component';


class Business extends Component {
  state = {
    playHeaderReviews: true
  };

  componentWillMount() {
    const {
      shouldLoadBusinessDetails,
      shouldLoadRecommendations,
      businessId,
      businessCategory
    } = this.props;

    if (shouldLoadRecommendations) {
      this.props.fetchRecommendations(businessId, businessCategory);
    }
  }

  componentDidMount() {
    const { 
      businessId, 
      businessCategory, 
      shouldLoadBusinessDetails,
      shouldLoadReviews 
    } = this.props;

    if (shouldLoadBusinessDetails) {
      this.props.fetchBusinessDetail(businessId, businessCategory);
    }

    if (shouldLoadReviews) {
      this.props.fetchReviewsForBusiness(businessId, businessCategory);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { 
      returningFromPlayingReview, 
      businessId, 
      businessCategory,
      shouldLoadBusinessDetails,
      shouldLoadReviews
    } = nextProps;

    if (!this.state.playHeaderReviews && returningFromPlayingReview) {
      this.setState({ playHeaderReviews: true });
    }

    if (!this.props.shouldLoadBusinessDetails && shouldLoadBusinessDetails) {
      this.props.fetchBusinessDetail(businessId, businessCategory);
    }

    if (!this.props.shouldLoadReviews && shouldLoadReviews) {
      this.props.fetchReviewsForBusiness(businessId, businessCategory);
    }
  }

  navigateToNextScene = scene => {
    Actions[scene]();
  };

  morePressed = () => {
    const { moreInfoScene } = this.props;
    this.navigateToNextScene(moreInfoScene);
  };

  bookmarkPressed = ({ bookmarked }) => {
    const { isAnonymous, registrationRedirectScene } = this.props;
    if (isAnonymous) { 
      Actions[registrationRedirectScene]();
      return; 
    }
    const newBookmarkValue = !bookmarked;
    this.props.bookmarkBusiness(newBookmarkValue);
  };

  itemPressed = reviewObject => {
    const { onSelectVisit, reviewScene, visitIds } = this.props;

    this.setState({ playHeaderReviews: false });
    onSelectVisit(reviewObject.index, visitIds);
    this.navigateToNextScene(reviewScene);
  };

  render() {
    return (
      <BusinessView
        morePressed={this.morePressed}
        businessName={this.props.businessName}
        businessImage={this.props.businessImage}
        headerReviews={this.props.headerReviews}
        percentRecommend={this.props.percentRecommend}
        numOfRecommendations={this.props.numOfRecommendations}
        mainImage={this.props.mainImage}
        telephone={this.props.telephone}
        reviewsList={this.props.reviewList}
        itemPressed={this.itemPressed}
        playReviews={this.state.playHeaderReviews}
        bookmarked={this.props.bookmarked}
        bookmarkPressed={this.bookmarkPressed}
        businessId={this.props.businessId}
        galleryScene={this.props.galleryScene}
        hours={this.props.hours}
        openNow={this.props.openNow}
        photos={this.props.photos}
        rating={this.props.rating}
        priceLevel={this.props.priceLevel}
        progressBarDetails={this.props.progressBarDetails}
        recommendations={this.props.recommendations}
      />
    );
  }
}

const mapStateToProps = state => {
  const { businesses, businessReviews, user, visits, ui } = state;
  const { byPlaceId, selectedBusiness } = businesses;
  const { previousSceneKey } = ui;
  const {
    apiId,
    businessId: selectedBusinessId, 
    businessCategory: selectedBusinessCategory,
    loadingPlaceDetails 
   } = selectedBusiness;

  let business = businesses[selectedBusinessId] ||
    byPlaceId[apiId] || {};
  
  business = {
    ...business,
    businessId: selectedBusinessId,
    businessCategory: business.businessCategory || selectedBusinessCategory
  };

  let shouldLoadRecommendations = false;
  const shouldLoadBusinessDetails = selectedBusinessId && !loadingPlaceDetails && !business.loaded;
  const shouldLoadReviews = selectedBusinessId && business.loaded;

  if (!business.recommendations) {
    shouldLoadRecommendations = true;
  }

  const {
    businessId,
    businessCategory,
    businessName,
    headerReviewIds,
    numOfRecommendations,
    numOfRecommends,
    percentRecommend,
    photoUri,
    telephone,
    hours,
    openNow,
    photos,
    rating,
    priceLevel,
    recommendations
  } = business;

  const reviewList = (business.visitIds || []).map(visitId => {
    const visit = visits[visitId];
    const { reviewIds } = visit;

    const businessReview = businessReviews[reviewIds[0]] || {};

    return {
      thumbnail: businessReview.thumbnail,
      moment: businessReview.moment,
      visitId
    };
  });

  //TODO - should bookmarks be in businesses store instead?
  let bookmarked = false;
  if (user.bookmarks[businessId]) {
    bookmarked = user.bookmarks[businessId].bookmarked;
  }

  const headerReviews = (headerReviewIds || []).map(reviewId => businessReviews[reviewId]);

  return {
    businessId,
    businessCategory,
    businessName,
    headerReviews,
    numOfRecommendations,
    numOfRecommends,
    percentRecommend,
    businessImage: photoUri,
    telephone,
    // reviewIds: business.reviews,
    reviewList,
    bookmarked,
    business,
    hours,
    openNow,
    photos,
    rating,
    priceLevel,
    progressBarDetails: ui.progressBarDetails,
    recommendations,
    returningFromPlayingReview: previousSceneKey === 'media_executor',
    shouldLoadBusinessDetails,
    shouldLoadRecommendations,
    isAnonymous: user.isAnonymous,
    shouldLoadReviews,
    visitIds: business.visitIds
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchBusinessDetail: (businessId, businessCategory) =>
      dispatch(fetchBusinessDetail(businessId, businessCategory)),
    fetchRecommendations: (businessId, businessCategory) => {
      dispatch(fetchBusinessRecommendationsByBusinessId(businessId, businessCategory));
    },
    fetchReviewsForBusiness: (businessId, businessCategory) =>
      dispatch(fetchReviewsForBusiness(businessId, businessCategory)),
    reviewSelected: reviewItem => dispatch(reviewSelected(reviewItem)),
    bookmarkBusiness: bookmarked => dispatch(bookmarkBusiness(bookmarked)),
    onSelectVisit: (selectedVisitIndex, selectedVisitsIds) => {
      dispatch(selectVisit({ selectedVisitIndex, selectedVisitsIds }));
    },
 };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Business);
