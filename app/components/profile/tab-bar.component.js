import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';

const Tab = props => {
  const { value, text, selected } = props;
  return (
    <View style={styles.tab}>
      <Text>{value}</Text>
      <Text>{text}</Text>
    </View>
  );
};

class FacebookTabBar extends React.Component {
  icons = [];

  constructor(props) {
    super(props);
    this.icons = [];
  }

  componentDidMount() {
    this._listener = this.props.scrollValue.addListener(this.setAnimationValue.bind(this));
  }

  setAnimationValue({ value }) {
    this.icons.forEach((icon, i) => {
      const progress = value - i >= 0 && value - i <= 1 ? value - i : 1;
      icon.setNativeProps({
        style: {
          color: this.iconColor(progress)
        }
      });
    });
  }

  //color between rgb(59,89,152) and rgb(204,204,204)
  iconColor(progress) {
    const red = 59 + (204 - 59) * progress;
    const green = 89 + (204 - 89) * progress;
    const blue = 152 + (204 - 152) * progress;
    return `rgb(${red}, ${green}, ${blue})`;
  }

  renderTab = (name, page, isTabActive, onPressHandler, onLayoutHandler) => {
    return (
      <TouchableHighlight
        key={`${name}_${page}`}
        onPress={() => onPressHandler(page)}
        onLayout={onLayoutHandler}
        style={{ flex: 1, width: 100 }}
        underlayColor="#aaaaaa"
      >
        <Tab />
      </TouchableHighlight>
    );
  };

  render() {
    return (
      <View style={[styles.tabs, this.props.style]}>
        <ScrollableTabBar renderTab={this.renderTab} />
        {/* {this.props.tabs.map((tab, i) => {
          return (
            <TouchableOpacity key={i} onPress={() => this.props.goToPage(i)} style={styles.tab}>
              <Tab value={tab.value} text={tab.text} selected={this.props.activeTab === i} />
            </TouchableOpacity>
          );
        })} */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
    width: 100,
    marginRight: 10
  },
  tabs: {
    height: 45,
    flexDirection: 'row',
    paddingTop: 5,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  }
});

export default FacebookTabBar;
