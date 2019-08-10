import React, { Component } from 'react';
import { View, ScrollView, TouchableWithoutFeedback } from 'react-native';
import BusinessHeader from './business-header.component';
import BusinessInfo from './business-info.component';
import BusinessMore from './business-more.component';
import BusinessReviews from './business-reviews.component';
import Colors from '../../styles/colors.styles';
import DragUpDrawer from '../drag-up-drawer/drag-up-drawer.component';
import ReviewStoryProgressBar from 
'../review-story-progress-bar/review-story-progress-bar-view.component';

class BusinessView extends Component {
  state = {    
    scrollEnabled: false,
    drawerActive: true
  }

  enableScroll = () => {
    if (!this.state.scrollEnabled) {
      this.setState({ scrollEnabled: true });
    }
  }

  disableScroll = () => {
    if (this.state.scrollEnabled) {
      this.setState({ scrollEnabled: false });
    }
  }

  handleScroll = ({ nativeEvent }) => {
    let newState = this.state.drawerActive;

    if (nativeEvent.contentOffset.y <= 10) {
      newState = true;
    } else {
      newState = false;
    }

    if (newState !== this.state.drawerActive) {
      this.setState({ drawerActive: newState });
    }
  };

  renderProgressBar = (scrollIntoView) => {
    const { progressBarDetails } = this.props;
    if (!progressBarDetails) return null;
    
    const { currentIndex, duration, numberOfReviews } = progressBarDetails;
    return (
       <TouchableWithoutFeedback onPress={() => { scrollIntoView(); }}>              
        <View style={styles.progressBarContainer}>
          <ReviewStoryProgressBar 
            currentIndex={currentIndex}
            duration={duration}
            numberOfReviews={numberOfReviews}
          />
        </View>
       </TouchableWithoutFeedback>
    );
  };

  render() {
    const {
      morePressed,
      businessName,
      businessImage,
      headerReviews,
      numOfRecommendations,
      percentRecommend,
      itemPressed,
      reviewsList,
      bookmarked,
      bookmarkPressed,
      businessId,
      galleryScene,
      playReviews,
      hours,
      openNow,
      photos,
      rating,
      priceLevel,
      recommendations
    } = this.props;

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <BusinessHeader
            businessId={businessId}
            businessImage={businessImage}
            playReviews={playReviews}
            photos={photos}
            reviews={headerReviews}
            // height={headerHeight}
          />
        </View>
      

        <DragUpDrawer 
          canAcceptResponder={this.state.drawerActive}
          initialPosition={0.6}
          onIntermediatePositionReached={this.disableScroll}
          onFinalTopPositionReached={this.enableScroll}
          renderOnTopOfContainer={this.renderProgressBar}
          stoppingPositions={[0, 0.3, 0.8, 1]}
        >
          <ScrollView 
            style={{ flex: 1 }} 
            scrollEnabled={this.state.scrollEnabled}
            onMomentumScrollEnd={this.handleScroll}
            overScrollMode='never'
          >
            <View style={styles.content}>
              <BusinessInfo
                morePressed={morePressed}
                businessName={businessName}
                percentRecommend={percentRecommend}
                numOfRecommendations={numOfRecommendations}
                bookmarked={bookmarked}
                bookmarkPressed={bookmarkPressed}
                hours={hours}
                openNow={openNow}
                rating={rating}
                priceLevel={priceLevel}
                recommendations={recommendations}
              />
              {reviewsList && reviewsList.length > 0 && (
                <BusinessReviews
                  itemPressed={itemPressed}
                  galleryScene={galleryScene}
                  reviewsList={reviewsList}
                />
              )}
              <BusinessMore />
            </View>
          </ScrollView>
        </DragUpDrawer>        
      </View>
    );
  }
}

const styles = {
  header: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden'
  },
  container: {
    flex: 1
  },
  content: {
    // marginTop: HEADER_MAX_HEIGHT,
    backgroundColor: '#f9fafc',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bookTableContainer: {
    width: '100%',
    backgroundColor: '#fff',
    height: 73,
    position: 'absolute',
    bottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  bookTable: {
    height: 57,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.viewsRed2,
    borderRadius: 12
  },
  bookTableText: {
    color: '#fff',
    fontSize: 20
  },
  progressBarContainer: { 
    position: 'absolute', 
    top: -30, 
    width: '100%', 
    height: 30, 
    paddingHorizontal: 20
  }
};

export default BusinessView;
