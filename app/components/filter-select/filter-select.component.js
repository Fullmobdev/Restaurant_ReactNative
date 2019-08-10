import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FilterViewer from '../media-viewers/filter-viewer';

import Colors from '../../styles/colors.styles';

class FilterSelect extends Component {
  renderCheckmark = () => {
    return (
      <View style={styles.checkmarkContainer}>
        <Icon name="ios-checkmark-circle" color={Colors.ViewsGray2} size={25} />
      </View>
    );
  };

  renderOptions = (filters, selection, mediaType, uri) => {
    return filters.map(filter => {
      const selected = filter === selection;
      const optionsStyle = [styles.option];
      if (selected) {
        optionsStyle.push(styles.selectedOption);
      }

      return (
        <TouchableWithoutFeedback
          key={filter}
          onPress={() => {
            this.props.onSelectFilter(filter);
          }}
        >
          <View style={optionsStyle}>
            <FilterViewer
              filterName={filter}
              hideExit
              mediaType={mediaType}
              uri={uri}
              thumbnail={'yes'}
            />
            {/* {selected && this.renderCheckmark()} */}
          </View>
        </TouchableWithoutFeedback>
      );
    });
  };

  render() {
    const { filters, selectedFilter, mediaType, mediaUri } = this.props;
    const selection = selectedFilter || filters[0];
    return (
      <ScrollView
        contentContainerStyle={styles.container}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {this.renderOptions(filters, selection, mediaType, mediaUri)}
      </ScrollView>
    );
  }
}

FilterSelect.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.string).isRequired,
  mediaType: PropTypes.string.isRequired,
  mediaUri: PropTypes.string.isRequired,
  onSelectFilter: PropTypes.func.isRequired,
  selectedFilter: PropTypes.string
};

const styles = StyleSheet.create({
  checkmarkContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 5,
    right: 10
  },
  container: {
    alignItems: 'center',
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 10
  },
  option: {
    position: 'relative',
    borderRadius: 40,
    height: 80,
    overflow: 'hidden',
    width: 80,
    marginRight: 10
  },
  selectedOption: {
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#ff3366'
  }
});

export default FilterSelect;
