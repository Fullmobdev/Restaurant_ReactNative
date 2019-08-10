import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import ViewsColors from '../../styles/colors.styles';

class ReviewStoryProgressBar extends Component {
    state = {
        progressAnim: new Animated.Value(0),
    }

    currentAnimation = null;

    componentDidMount() {
        this.currentAnimation = this.startAnimation(this.props.duration);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.currentIndex !== nextProps.currentIndex) {
            if (this.currentAnimation) {
                this.currentAnimation.stop();
            }
            
            this.setState({ progressAnim: new Animated.Value(0) });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { currentIndex, duration, numberOfReviews } = this.props;
        const { 
            currentIndex: nextCurrentIndex, duration: nextDuration, numberOfReviews: nextNumberOfReviews 
        } = nextProps;

        if (currentIndex !== nextCurrentIndex || 
            numberOfReviews !== nextNumberOfReviews ||
            duration !== nextDuration ||
            this.state.progressAnim !== nextState.progressAnim) {
            return true;
        }

        return false;
    }

    componentDidUpdate(prevProps, prevState) {
        this.currentAnimation = this.startAnimation(this.props.duration);
    }

    startAnimation = (duration) => {
        if (!duration) {
            return; 
        }

        return Animated.timing(
            this.state.progressAnim,
            {
                toValue: 100,
                duration
            }
        ).start();
    }

    renderPills = (currentIndex, numberOfPills, smoothBar) => {
        const pills = [];

        for (let i = 0; i < numberOfPills; i++) {

            const pillStyles = [styles.pill];

            if (i === (numberOfPills - 1) && smoothBar) {
                pillStyles.push(styles.lastPillSmoothBar);
            } else if (i === (numberOfPills - 1)) {
                pillStyles.push(styles.lastPill);
            } else if (smoothBar) {
                pillStyles.push(styles.pillSmoothBar);
            }

            const innerPillStyles = i < currentIndex ? [styles.selectedPill] : '';

            const innerPill = i === currentIndex ? 
            ( 
                <Animated.View 
                    style={[styles.selectedPill, 
                        {
                            width: this.state.progressAnim.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%']
                            })
                        }]} 
                />
            ) 
            : (<View style={[innerPillStyles]} />);


            pills.push((
                <View style={pillStyles}>
                    { innerPill }
                </View>
            ));
        }

        return pills;
    }

    render() {
        const { currentIndex, numberOfReviews, smoothBar } = this.props;

        return (
            <View style={styles.container}>
                { this.renderPills(currentIndex, numberOfReviews, smoothBar) }
            </View>
        );
    }
}

ReviewStoryProgressBar.propTypes = {
    currentIndex: PropTypes.number.isRequired,
    smoothBar: PropTypes.bool,
    numberOfReviews: PropTypes.number.isRequired
    
};

ReviewStoryProgressBar.defaultProps = {
    smoothBar: false
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 3
    },
    pill: {
        borderRadius: 5,
        flex: 1,
        backgroundColor: ViewsColors.ViewsGray1Opacity(0.7),
        height: '100%',
        marginRight: 2
    },
    pillSmoothBar: {
        marginRight: 0,
        borderBottomRightRadius: 0,
        borderTopRightRadius: 0
    },
    lastPill: {
        marginRight: 0
    },
    lastPillSmoothBar: {
        borderBottomLeftRadius: 0,
        borderTopLeftRadius: 0
    },
    selectedPill: {
        backgroundColor: ViewsColors.ViewsGray2,
        height: '100%',
        opacity: 0.8
    }
});

export default ReviewStoryProgressBar;
