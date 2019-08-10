import React, { Component, PropTypes } from 'react';
import { View, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview';
import {
  MaterialIndicator
} from 'react-native-indicators';

class TimelinePresentation extends Component {
  constructor(props) {
    super(props);

    this.currentCoords = null;

    this.dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    });

    this.layoutProvider = new LayoutProvider(
      () => {
        return 0;
      },
      (type, dim) => {
        const { width } = Dimensions.get('window');
        dim.width = width;
        dim.height = props.itemHeight;
      }
    );
    this.state = {
      dataProvider: this.dataProvider.cloneWithRows(this.props.items),
      listYOffset: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.items === nextProps.items) {
      return;
    }
    this.setState({
      dataProvider: this.dataProvider.cloneWithRows(nextProps.items)
    });
  }

  rowRenderer = (type, data, index) => {
    return this.props.renderListItem(data, index);
  };

  renderFooter = () => {
    return (
      this.props.showLoadingFooter && (
        <MaterialIndicator style={{ padding: 10 }} color='gray' size={20} animating />
      )
    );
  };

  renderPullToRefresh = () => {
    return (
      <View style={styles.pullToRefreshContainer}>
        {this.props.showTopLoadingIndicator && (
          <MaterialIndicator style={{ padding: 10 }} color='gray' size={20} animating />
        )}
      </View>
    );
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.renderPullToRefresh()}
        <RecyclerListView
          style={this.props.style}
          ref={this.props.listRef}
          layoutProvider={this.layoutProvider}
          dataProvider={this.state.dataProvider}
          rowRenderer={this.rowRenderer}
          onEndReached={this.props.onEndReached}
          onEndReachedThreshold={100}
          renderFooter={() => (this.props.showLoadingFooter ? this.renderFooter() : <View />)}
          onMomentumScrollEnd={this.props.onMomentumScrollEnd}
          onScroll={this.props.onScroll}
          onScrollBeginDrag={this.props.onScrollBeginDrag}
        />
      </View>
    );
  }
}

TimelinePresentation.propTypes = {
  renderListItem: PropTypes.func.isRequired,
  onMomentumScrollEnd: PropTypes.func,
  onScroll: PropTypes.func,
  onScrollBeginDrag: PropTypes.func,
  onEndReached: PropTypes.func,
  listRef: PropTypes.func,
  items: PropTypes.array.isRequired,
  itemHeight: PropTypes.number,
  showLoadingFooter: PropTypes.bool,
  showTopLoadingIndicator: PropTypes.bool
};

TimelinePresentation.defaultProps = {
  onMomentumScrollEnd: () => {},
  onScroll: () => {},
  onScrollBeginDrag: () => {},
  onEndReached: () => {},
  listRef: null,
  itemHeight: 500,
  showFooter: false,
  showTopLoadingIndicator: false
};

const styles = StyleSheet.create({
  pullToRefreshContainer: {
    position: 'absolute',
    width: '100%'
  }
});

export default TimelinePresentation;
