import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, Text } from 'react-native';

import SlideInShrinkBorderAnim from './slide-in-shrink-border-anim.component';

class MediaViewerText extends Component {
    state = {
        runAnimation: true
    }

    componentWillReceiveProps({ text }) {
        if (this.isTextChange(text)) {
            this.setState({ runAnimation: true });
        }
    }

    isTextChange(newText) {
        return this.props.text !== newText;
    }

    onAnimationRun = () => {
        this.setState({ runAnimation: false });
    }

    render() {
        const { text } = this.props;

        return (
            <SlideInShrinkBorderAnim
                runAnimation={this.state.runAnimation}
                onAnimationRun={this.onAnimationRun}
            >
                <Text
                    style={styles.text}
                >
                    {text.toUpperCase()}
                </Text>
            </SlideInShrinkBorderAnim>
        );
    }
}

MediaViewerText.propTypes = {
    text: PropTypes.string
};

const styles = StyleSheet.create({
    text: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'left',
        padding: 10
    }
});

export default MediaViewerText;
