import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet, TextInput, View } from 'react-native';

import Colors from '../../styles/colors.styles';
import ViewsIcon from '../../fonts/icon-font';
import { Typography } from '../../styles/typography.styles';

class Searchbar extends Component {
    state = { text: '' }

    clearText = () => {
        this.setState({ text: '' });
        this.props.onChangeText('');
    }

    onChangeText = (text) => {
        this.setState({ text });
        this.props.onChangeText(text);
    }

    render() {
        const {
            clearIcon,
            containerStyle,
            iconName,
            viewsIconName, 
            placeholder,
        } = this.props;
    
        return (
            <View style={[styles.searchBar, containerStyle]}>
              { iconName && <Icon name={iconName} style={styles.icon} /> }
              { viewsIconName && <ViewsIcon name={viewsIconName} style={styles.icon} /> }
              <TextInput
                autoFocus
                style={styles.input}
                placeholder={placeholder || 'Search'}
                onChangeText={this.onChangeText}
                value={this.state.text}
                autoCorrect={false}
              />
              {clearIcon && (
                <Icon
                  style={styles.clearIcon}
                  name="ios-close"
                  onPress={this.clearText}
                />
              )}
            </View>
        );
    }
}

Searchbar.defaultProps = {
    containerStyle: {},
    onChangeText: () => {}
};

const styles = StyleSheet.create({
    searchBar: {
        height: 50,
        borderRadius: 10,
        backgroundColor: Colors.ViewsWhite,
        shadowColor: '#9a9a9a',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowRadius: 1,
        shadowOpacity: 0.8,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 20
    },
    clearIcon: {
        color: Colors.ViewsBlack,
        fontSize: 24
    },
    icon: {
        color: Colors.ViewsRed,
        fontSize: 24
    },
    input: {
        ...Typography.body,
        marginLeft: 20
    }
});

export default Searchbar;
