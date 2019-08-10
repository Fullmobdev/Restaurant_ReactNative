import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import RecommendationPill from '../recommendation-pill/recommendation-pill.component';

// Actions
import { fetchBusinessPhoto } from '../../actions/search-business/search-business.action';
import { fetchBusinessRecommendationsByPlaceId } from '../../actions/business.action';

// Styles
import Colors from '../../styles/colors.styles';

const BusinessListItem = class extends React.Component {
  componentDidMount() {
    const { id, onLoadPhoto, onLoadRecommendation, photoReference, photoUri } = this.props;

    if (!photoUri && photoReference) {
      onLoadPhoto(id, photoReference);
    }

    //Always Load recommendations from Database
    onLoadRecommendation(id);
  }

  renderThumbnail = photoUri => {
    return <Image style={styles.thumbnail} source={{ uri: photoUri }} resizeMode="cover" />;
  };

  renderDefaultThumbnail = iconSize => {
    return (
      <View style={styles.defaultThumbnailContainer}>
        <Icon name="ios-image" color={Colors.ViewsGray1} size={iconSize || 60} />
      </View>
    );
  };

  renderNameWithoutHighlight = name => {
    return (
      <Text style={styles.name} numberOfLines={1}>
        {!name ? name : name.toUpperCase()}
      </Text>
    );
  };

  renderNameWithHighlight = (name, highlightText) => {
    const startingIndex = name.toLowerCase().indexOf(highlightText.toLowerCase());

    if (startingIndex === -1) return this.renderNameWithoutHighlight(name);

    const endingIndex = startingIndex + highlightText.length;

    const textParts = {
      preHighlight: name.slice(0, startingIndex),
      highlight: name.slice(startingIndex, endingIndex),
      postHighlight: name.slice(endingIndex)
    };

    return (
      <View style={styles.highlightTextContainer}>
        <Text style={styles.name}>{textParts.preHighlight.toUpperCase()}</Text>
        <Text style={[styles.name, styles.nameHighlight]}>{textParts.highlight.toUpperCase()}</Text>
        <Text style={styles.name}>{textParts.postHighlight.toUpperCase()}</Text>
      </View>
    );
  };

  render() {
    const { props } = this;

    const {
      name,
      address,
      highlightText,
      iconSize,
      loading,
      photoUri,
      numOfRecommendations,
      percentRecommend,
      addressStyle,
      containerStyle,
      nameStyle,
      onPressItem,
      thumbnailContainerStyle
    } = props;

    return loading ? null : (
      <TouchableOpacity onPress={onPressItem}>
        <View style={[styles.container, containerStyle]}>
          <View style={[styles.thumbnailContainer, thumbnailContainerStyle]}>
            {photoUri ? this.renderThumbnail(photoUri) : this.renderDefaultThumbnail(iconSize)}
          </View>

          <View style={styles.detailsContainer}>
            {highlightText
              ? this.renderNameWithHighlight(name, highlightText)
              : this.renderNameWithoutHighlight(name)}
            <Text style={[styles.address, addressStyle]} numberOfLines={1}>
              {address.toUpperCase()}
            </Text>

            <RecommendationPill percentRecommend={percentRecommend} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
};

BusinessListItem.propTypes = {
  address: PropTypes.string,
  iconSize: PropTypes.number,
  loading: PropTypes.bool,
  name: PropTypes.string.isRequired,
  numOfRecommendations: PropTypes.number,
  percentRecommend: PropTypes.number,
  photoReference: PropTypes.string,
  photoUri: PropTypes.string,
  addressStyle: PropTypes.object,
  containerStyle: PropTypes.object,
  nameStyle: PropTypes.object,
  onPressItem: PropTypes.func,
  thumbnailContainerStyle: PropTypes.object
};

const styles = StyleSheet.create({
  address: {
    color: Colors.ViewsGray1,
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Avenir',
    marginBottom: 2,
    paddingRight: 20
  },
  container: {
    flexDirection: 'row',
    paddingLeft: 20,
    marginBottom: 5
  },
  defaultThumbnailContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailsContainer: {
    borderBottomColor: Colors.ViewsGray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10,
    paddingBottom: 10,
    paddingRight: 10,
    height: 80
  },
  highlightTextContainer: {
    flexDirection: 'row'
  },
  name: {
    color: Colors.ViewsGray4,
    fontWeight: '300',
    fontFamily: 'Avenir',
    fontSize: 12,
    marginBottom: 2
  },
  nameHighlight: {
    color: '#161616',
    fontWeight: '800'
  },
  thumbnail: {
    flex: 1,
    height: undefined,
    width: undefined
  },
  thumbnailContainer: {
    borderRadius: 5,
    height: 70,
    overflow: 'hidden',
    width: 70
  }
});

const mapDispatchToProps = dispatch => {
  return {
    onLoadPhoto: (id, photoReference) => {
      dispatch(fetchBusinessPhoto(id, photoReference));
    },
    onLoadRecommendation: placeId => {
      dispatch(fetchBusinessRecommendationsByPlaceId(placeId));
    }
  };
};

export default connect(
  null,
  mapDispatchToProps
)(BusinessListItem);
