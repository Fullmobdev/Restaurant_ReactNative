import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

class SearchHeader extends Component {
    state = { showInput: false };

    handleChangeText = (text) => {
        const { onChangeText } = this.props;

        if (onChangeText) {
            onChangeText(text);
        }
    }

    showInput = () => {
        this.setState({ ...this.state, showInput: true });
        if (this.searchInput) { }
    }

    renderSearchInput = () => {
        return (
            <TextInput
                ref={(elem) => { this.searchInput = elem; }}
                style={styles.searchHeaderInput}
                placeholder='Search Business'
                autoFocus
                onChangeText={this.handleChangeText}
                clearButtonMode='while-editing'
                autoCorrect={false}

            />
        );
    }

    renderTitle = () => {
        return (
            <View style={styles.searchHeaderTitleContainer}>
                <Text style={styles.searchHeaderTitle} onPress={this.showInput}>Review Business</Text>
            </View>
        );
    }

    render() {
        return (
            <View style={styles.searchHeaderContainer}>
                <View style={styles.searchHeaderIcon}>
                    <TouchableWithoutFeedback onPress={this.showInput}>
                        <View>
                            <Icon name="ios-search" size={24} />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                { this.state.showInput ? this.renderSearchInput() : this.renderTitle() }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    searchHeaderContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 10,
    },
    searchHeaderIcon: {},
    searchHeaderInput: {
        paddingHorizontal: 10,
        width: '95%',
        fontFamily: 'Avenir',
        fontSize: 14,
    },
    searchHeaderTitle: {
        fontWeight: '500',
        fontFamily: 'Avenir',
        fontSize: 14,
    },
    searchHeaderTitleContainer: {
        alignItems: 'center',
        flex: 1,
        paddingRight: 10
    }
});
export default SearchHeader;
