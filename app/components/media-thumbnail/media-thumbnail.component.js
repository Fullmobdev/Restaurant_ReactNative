import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon, { getImageSource } from 'react-native-vector-icons/Ionicons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../styles/colors.styles';

class MediaThumbnail extends Component {
    state = {
        defaultIcon: null
    };

    componentDidMount() {
        const { defaultIcon, iconSize } = this.props;

        if (!defaultIcon) { return; }

        getImageSource(defaultIcon, iconSize, Colors.ViewsGray1)
        .then((source) => {
            this.setState({ defaultIcon: source.uri });
        });
    }

    renderImage = (photoUri) => {
        if (photoUri) {
            return (
                  <Image
                      resizeMode='cover'
                      source={{ uri: photoUri }}
                      style={[styles.mediaThumbnailImage, this.props.iconStyle]}
                  />
            );
        }
    }

    render() {
        const {
            title,
            text,
            onPress,
            horizontal
        } = this.props;

        let {
            photoUri,
            contentContainerStyle,
            thumbnailStyle,
            titleStyle,
            textStyle,
            isHighlighted
        } = this.props;

        const stylesList = [styles.mediaThumbnailContainer];
        if (horizontal) stylesList.push(styles.mediaThumbnailContainerHorizontal);

        photoUri = photoUri || this.state.defaultIcon;


        return (
            <TouchableOpacity onPress={onPress}>
                <View style={stylesList}>
                    <View
                      style={isHighlighted ?
                      [styles.mediaThumbnailHighlightedMedia, thumbnailStyle] :
                      [styles.mediaThumbnailMedia, thumbnailStyle]}
                    >
                        { photoUri && this.renderImage(photoUri, isHighlighted) }
                    </View>
                    <View style={[contentContainerStyle]}>
                        <Text
                            ellipsizeMode={'tail'}
                            numberOfLines={1}
                            style={[styles.mediaThumbnailTitle, titleStyle]}
                        >
                            {title}
                        </Text>
                        <Text
                            ellipsizeMode={'tail'}
                            numberOfLines={1}
                            style={[styles.mediaThumbnailText, textStyle]}
                        >
                            {text}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

MediaThumbnail.propTypes = {
    defaultIcon: PropTypes.string,
    iconSize: PropTypes.number,
    horizontal: PropTypes.bool,
    isHighlighted: PropTypes.bool,
    title: PropTypes.string,
    text: PropTypes.string,
    photoUri: PropTypes.string,
    onPress: PropTypes.func,
    contentContainerStyle: PropTypes.oneOfType([
        PropTypes.number, PropTypes.array
    ]),
    iconStyle: PropTypes.oneOfType([
        PropTypes.number, PropTypes.array
    ]),
    thumbnailStyle: PropTypes.oneOfType([
        PropTypes.number, PropTypes.array
    ]),
    titleStyle: PropTypes.oneOfType([
        PropTypes.number, PropTypes.array
    ]),
    textStyle: PropTypes.oneOfType([
        PropTypes.number, PropTypes.array
    ])
};

MediaThumbnail.defaultProps = {
    iconSize: 25
};

const styles = StyleSheet.create({
    mediaThumbnailContainer: {
        alignItems: 'center'
    },
    mediaThumbnailContainerHorizontal: {
        flexDirection: 'row'
    },
    mediaThumbnailMedia: {
        backgroundColor: Colors.ViewsGray2,
        borderColor: 'gray',
        borderRadius: 25,
        borderWidth: 0.5,
        marginBottom: 10,
        height: 50,
        width: 50,
        overflow: 'hidden',
        padding: 2
    },
    mediaThumbnailHighlightedMedia: {
        backgroundColor: Colors.ViewsGray2,
        borderColor: Colors.ViewsBlue,
        borderRadius: 100,
        borderWidth: 2,
        marginBottom: 10,
        height: 50,
        width: 50,
        overflow: 'hidden',
        padding: 2
    },
    mediaThumbnailTitle: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 2,
        width: 50
    },
    mediaThumbnailText: {
        fontSize: 10,
        width: 60
    },
    mediaThumbnailImage: {
        position: 'absolute',
        top: -5,
        left: -5,
        width: 60,
        height: 60,
    }
});

export default MediaThumbnail;
