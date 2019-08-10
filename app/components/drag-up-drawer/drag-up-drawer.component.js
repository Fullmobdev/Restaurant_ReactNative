import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, TouchableOpacity } from 'react-native';


const WINDOW_HEIGHT = Dimensions.get('window').height;

class DragUpDrawer extends Component {
    constructor(props) {
        super(props);
        
        this.touched = false;
        this.panResponder = {};
        this.state = {
            positionTopAnimatedValue: new Animated.Value(WINDOW_HEIGHT * props.initialPosition),
            initialPositionTop: WINDOW_HEIGHT * props.initialPosition, 
            currentPositionTop: WINDOW_HEIGHT * props.initialPosition
        };
    }

    componentDidMount() {
        this.panResponder = PanResponder.create({            
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                const finalTopPositionReached = ((this.state.currentPositionTop + gestureState.dy) / WINDOW_HEIGHT) <= this.props.stoppingPositions[0];
                return this.props.canAcceptResponder && this.touched && !finalTopPositionReached;
            },
            onPanResponderMove: (evt, gestureState) => {
                this.move(gestureState);
            },
            onPanResponderRelease: (evt, gestureState) => {
                this.moveFinished(gestureState);
            }
        });        
    }

    move = (gestureState) => {
        // Note we add to initial position because dy from gestureState is from 
        // when drag began, not since previous gestureState
        const newPositionTop = this.state.initialPositionTop + gestureState.dy;
        this.setState({ 
            positionTopAnimatedValue: new Animated.Value(newPositionTop),
            currentPositionTop: newPositionTop
        });
    }

    moveFinished = (gestureState) => {
        // Going up, vy is < 0
        let position = this.state.currentPositionTop;
        const { stoppingPositions } = this.props;

        if (gestureState.vy < 0) {
            position = this.getNextUpwardStoppingPositionTop(position, stoppingPositions);
        } else {
            position = this.getNextDownwardStoppingPositionTop(position, stoppingPositions);
        }
        
        this.animateToStoppingPosition(position);       
    }

    getNextUpwardStoppingPositionTop = (position, stoppingPositions) => {
        const currentPercentOfScreen = position / WINDOW_HEIGHT;

        for (let i = stoppingPositions.length - 1; i > -1; i--) {
            if (stoppingPositions[i] < currentPercentOfScreen) {
                return stoppingPositions[i] * WINDOW_HEIGHT;
            }
        }

        return 0;
    }

    getNextDownwardStoppingPositionTop = (position, stoppingPositions) => {
        const currentPercentOfScreen = position / WINDOW_HEIGHT;

        for (let i = 0; i < stoppingPositions.length; i++) {
            if (stoppingPositions[i] > currentPercentOfScreen) {
                return stoppingPositions[i] * WINDOW_HEIGHT;
            }
        }

        return 1;
    }

    animateToStoppingPosition = (position) => {
        Animated.spring(this.state.positionTopAnimatedValue, {
            toValue: position,
            duration: 100,
            onComplete: () => { this.animationEnd(position); }
        }).start();
    }

    animationEnd = (position) => {
        const { 
            stoppingPositions, 
            onFinalTopPositionReached, 
            onFinalBottomPositionReached, 
            onIntermediatePositionReached 
        } = this.props;
        const currentPercentOfScreen = position / WINDOW_HEIGHT;
        const finalBottomStoppingPosition = stoppingPositions[stoppingPositions.length - 1];

        if (currentPercentOfScreen <= stoppingPositions[0]) {
            onFinalTopPositionReached();
        } else if (finalBottomStoppingPosition <= currentPercentOfScreen) {            
            onFinalBottomPositionReached();
        } else {
            onIntermediatePositionReached();
        }

        this.setState({ 
            currentPositionTop: position,
            initialPositionTop: position 
        });
    }

    onTouchDrawer = () => {
        this.touched = true;
    }

    onReleaseDrawer = () => {
        this.touched = false;
    }

    scrollIntoView = () => {
        if (this.state.currentPositionTop >= WINDOW_HEIGHT - 10) { // Subtracting 10 to add some leeway
            const position = this.props.initialPosition * WINDOW_HEIGHT;
            this.animateToStoppingPosition(position);
        }        
    }

    render() {
        const { stoppingPositions } = this.props;
        const maxPositionTop = stoppingPositions[stoppingPositions.length - 1] * WINDOW_HEIGHT;
        const minPositionTop = stoppingPositions[0] * WINDOW_HEIGHT;

        const drawerPosition = {
            top: this.state.positionTopAnimatedValue.interpolate({
                inputRange: [0, WINDOW_HEIGHT],
                outputRange: [minPositionTop, maxPositionTop],
                extrapolate: 'clamp'
            })
        };
        
        return (
            <Animated.View 
                style={[styles.drawer, drawerPosition]}
                {...this.panResponder.panHandlers}
            >
                { this.props.renderOnTopOfContainer && this.props.renderOnTopOfContainer(this.scrollIntoView) }
                <TouchableOpacity 
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPressIn={this.onTouchDrawer} 
                    onPressOut={this.onReleaseDrawer}
                >
                    { this.props.children }
                </TouchableOpacity>
            </Animated.View>
        );
    }    
}

DragUpDrawer.propTypes = {
    /* Percent of container height to position the drawer */
    canAcceptResponder: PropTypes.bool,
    initialPosition: PropTypes.number,   
    onFinalTopPositionReached: PropTypes.func, 
    onFinalBottomPositionReached: PropTypes.func, 
    onIntermediatePositionReached: PropTypes.func,
    renderOnTopOfContainer: PropTypes.func,
    stoppingPositions: PropTypes.arrayOf(PropTypes.number)
};

DragUpDrawer.defaultProps = {
    canAcceptResponder: true,
    initialPosition: 0.5,
    onFinalTopPositionReached: () => {},
    onFinalBottomPositionReached: () => {},
    onIntermediatePositionReached: () => {},
    renderOnTopOfContainer: () => {},
    stoppingPositions: [0, 0.5, 1]
};

const styles = StyleSheet.create({
    drawer: {
        flex: 1
    }
});

export default DragUpDrawer;
