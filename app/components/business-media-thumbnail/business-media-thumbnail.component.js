import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import MediaThumbnail from '../media-thumbnail/media-thumbnail.component';

// Actions
import { fetchBusinessPhoto } from '../../actions/search-business/search-business.action';

class BusinessMediaThumbnail extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { id, onLoadPhoto, photoReference, photoUri } = this.props;

        if (!photoUri && photoReference) {
            // TODO: Need to handle if the request has been sent but
            // we're no longer showing this restaurant
            onLoadPhoto(id, photoReference);
        }
    }


    render() {
        const { horizontal, text, title, onPress, photoUri, isHighlighted } = this.props;

        return (
            <MediaThumbnail
                title={title}
                text={text}
                photoUri={photoUri}
                onPress={onPress}
                horizontal={horizontal}
                isHighlighted={isHighlighted}
            />
        );
    }
}

BusinessMediaThumbnail.propTypes = {
    id: PropTypes.string,
    horizontal: PropTypes.bool,
    text: PropTypes.string,
    title: PropTypes.string,
    onPress: PropTypes.func,
    photoReference: PropTypes.string,
    photoUri: PropTypes.string
};

BusinessMediaThumbnail.defaultProps = {
    horizontal: false,
};

const mapDispatchToProps = (dispatch) => {
    return {
        onLoadPhoto: (id, photoReference) => {
            dispatch(fetchBusinessPhoto(id, photoReference));
        }
    };
};

export default connect(null, mapDispatchToProps)(BusinessMediaThumbnail);
