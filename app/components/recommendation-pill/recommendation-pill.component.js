import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Colors from '../../styles/colors.styles';

const RecommendationPill = ({ percentRecommend }) => {
    const percent = Math.round(percentRecommend * 100);
    return (
        <View>

                { percentRecommend ?
                    <View style={styles.container}><Text style={styles.recommendText}>{percent}% Recommend </Text></View> :
                    <View style={styles.noRecommendContainer}><Text style={styles.recommendText}>No Recommends</Text></View>
                }

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: Colors.ViewsBlue,
        paddingVertical: 2,
        width: 100,
        // flexDirection: 'row',
        // flex: 0
    },
    noRecommendContainer: {
      alignItems: 'center',
      backgroundColor: '#a8a8a8',
      paddingVertical: 2,
      width: 100
    },
    recommendText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700'
    },
});

export default RecommendationPill;
