import React from 'react';
import PropTypes from 'prop-types';
import { Image, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Rating } from 'react-native-elements';

import Colors from '../../styles/colors.styles';

const USER_RATING_STARTING_VALUE = 5;

const ReviewBusinessRating = ({
    name,
    photoUri,
    onPost
}) => {
    let userRating = USER_RATING_STARTING_VALUE;

    return(
        <View style={styles.container}>
            <View style={styles.thumbnailContainer}>
                <Image
                    source={{uri: photoUri}}
                    style={styles.thumbnail}
                ></Image>
                <View>
                    <Text style={styles.title}>{name}</Text>
                    <Text>How was your experience?</Text>
                </View>
            </View>
            <Rating
                style={styles.rating}
                fractions={0}
                imageSize={30}
                onFinishRating={(rating) => { userRating = rating }}
                startingValue={USER_RATING_STARTING_VALUE}
            ></Rating>
            <TouchableWithoutFeedback onPress={()=> {onPost(userRating)}}>
                <View style={styles.postButton}>
                    <Text style={styles.postButtonText}>Post</Text>
                </View>
            </TouchableWithoutFeedback>
        </View>
    )
}

ReviewBusinessRating.PropTypes = {
    name: PropTypes.string,
    photoUri: PropTypes.string,
    onPost: PropTypes.func
}

const styles = {
    container: {
        alignItems: 'center',
        paddingTop: 40
    },
    postButton: {
        alignItems: 'center',
        paddingVertical: 10,
        width: '100%',
        backgroundColor: Colors.ViewsBlue
    },
    postButtonText: {
        color: 'white'
    },
    rating: {
        marginBottom: 40
    },
    thumbnailContainer: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20
    },
    thumbnail: {
        height: 80,
        width: 80,
        marginRight: 10
    },
    title: {
        fontWeight: '600',
        marginBottom: 2
    }
}

export default ReviewBusinessRating;
