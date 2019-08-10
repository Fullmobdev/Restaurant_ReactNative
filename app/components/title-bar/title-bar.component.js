import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import ViewsColor from '../../styles/colors.styles';

class TitleBar extends Component {
    render() {
        return (
            <View style={styles.container}>
                { this.props.children }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        height: 44,
        borderBottomColor: ViewsColor.ViewsGray1,
        borderBottomWidth: StyleSheet.hairlineWidth
    }
});

export default TitleBar;
