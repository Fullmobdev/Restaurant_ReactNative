import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import SelectSliderOption from './select-slider-option/select-slider-option.component';

import { SCROLL_EVENT_THROTTLE } from './select-slider.constants';
import Colors from '../../styles/colors.styles';


class SelectSlider extends Component {
    constructor(props) {
        super(props);
        this.contentInsetSet = false;
        this.scrollOptionsDimensions = {};
        this.scrollOptionsWdith = 0;
        this.optionLayoutRemainingCount = props.options.length;
        this.scrollView = null;

        this.state = {
            contentInsetLeft: 0,
            contentInsetRight: 0,
            optionsLoaded: false,
            scrollViewContentContainerWidth: null,
            selectedOptionIndex: null
        };
    }

    componentDidUpdate(prevProps, prevState) {
        const { optionsLoaded, scrollViewContentContainerWidth } = this.state;

        if ((!prevState.scrollViewContentContainerWidth || !prevState.optionsLoaded) &&
            scrollViewContentContainerWidth && optionsLoaded) {
                this.setScrollViewContentInset();
            }
        
        if (prevState.contentInsetLeft === 0 && this.state.contentInsetLeft !== 0) {
            this.scrollView.scrollTo({ x: 1, y: 0 });
        }
    }

    handleOnScroll = (evt) => {
        const { contentInset, contentOffset } = evt.nativeEvent;

        // Note: since we subtracted half of the first option's container
        // width to set contentInset, now we have to add it back to
        // calculate the scrollXCoord
        const extraOffset = this.getLeftMostOptionsWidth(this.scrollOptionsDimensions) / 2;
        const scrollXCoord = contentInset.left + contentOffset.x + extraOffset;
            

        const selectedOptionIndex = this.getSelectedOptionIndex(scrollXCoord);
        
        if (selectedOptionIndex !== this.state.selectedOptionIndex) {
            this.setState({ selectedOptionIndex });
            this.props.onSelection(selectedOptionIndex);
        }
    }

    getSelectedOptionIndex = (scrollXCoord) => {
        const sortedScrollOptionsXCoords = 
            Object.keys(this.scrollOptionsDimensions)
            .map(xCoordStr => parseFloat(xCoordStr))
            .sort((a, b) => a - b);

        for (let i = 0; i < sortedScrollOptionsXCoords.length; i++) {
            const xCoord = sortedScrollOptionsXCoords[i];
            const xCoordEnd = xCoord + this.scrollOptionsDimensions[xCoord];

            if (xCoord <= scrollXCoord && scrollXCoord <= xCoordEnd) {
                return i;
            }
        }
    }

    handleScrollViewLayout = ({ nativeEvent }) => {
        this.setState({
            scrollViewContentContainerWidth: nativeEvent.layout.width
        });
    }

    handleScrollOptionLayout = ({ nativeEvent }) => {
        const { x, width } = nativeEvent.layout;

        this.scrollOptionsDimensions[x] = width;
        this.scrollOptionsWdith += width;
        this.optionLayoutRemainingCount--;

        if (this.optionLayoutRemainingCount === 0) {
            this.setState({ optionsLoaded: true });
        }
    }

    setScrollViewContentInset = () => {
        let { selectionPoint } = this.props; 
        const { scrollViewContentContainerWidth } = this.state;

        selectionPoint = selectionPoint || (scrollViewContentContainerWidth / 2);
        
        let contentInsetLeft = 0;
        let contentInsetRight = 0;

        const rightMostOptionWidth = this.getRightMostOptionsWidth(this.scrollOptionsDimensions);
        const leftMostOptionWidth = this.getLeftMostOptionsWidth(this.scrollOptionsDimensions);

        if (this.scrollOptionsWdith <= scrollViewContentContainerWidth) {
            contentInsetRight = this.scrollOptionsWdith - selectionPoint - 
                (rightMostOptionWidth / 2);            
        } else {
            contentInsetRight = scrollViewContentContainerWidth - selectionPoint -
                (rightMostOptionWidth / 2);
        }

        contentInsetLeft = selectionPoint - (leftMostOptionWidth / 2);

        this.setState({
            contentInsetLeft,
            contentInsetRight
        });
        this.contentInsetSet = true;
    }

    getLeftMostOptionsWidth = (optionsDimensions) => {
        return optionsDimensions[this.getLeftMostOptionStart(optionsDimensions)];
    }

    getRightMostOptionsWidth = (optionsDimensions) => {
        return optionsDimensions[this.getRightMostOptionStart(optionsDimensions)];
    }

    getLeftMostOptionStart = (optionsDimensions) => {
        return Object.keys(optionsDimensions)
        .reduce((a, b) => {
            return Math.min(parseFloat(a), parseFloat(b));
        });
    }

    getRightMostOptionStart = (optionsDimensions) => {
        return Object.keys(optionsDimensions)
        .reduce((a, b) => {
            return Math.max(parseFloat(a), parseFloat(b));
        });
    }

    renderOptions = (options, selectedOptionIndex) => {
        return options.map((option, index) => {
            return (
                    <SelectSliderOption
                        key={option} 
                        option={option}
                        onLayout={this.handleScrollOptionLayout}
                        selected={index === selectedOptionIndex}
                    />
            );
        });
    }

    render() {
        const { options, selectionPoint } = this.props;
        const { 
            contentInsetLeft, contentInsetRight, scrollViewContentContainerWidth, 
            selectedOptionIndex 
        } = this.state;
        const defaultMarkerPositionLeft = scrollViewContentContainerWidth ?
            (scrollViewContentContainerWidth / 2) - 3 : 0;

        return (
            <View style={styles.container}>
                <ScrollView
                    ref={elem => { this.scrollView = elem; }}
                    contentContainerStyle={[styles.scrollViewContainer, { minWidth: '100%' }]}
                    contentInset={{
                        left: contentInsetLeft,
                        right: contentInsetRight
                    }}
                    horizontal
                    onLayout={this.handleScrollViewLayout}
                    onScroll={this.handleOnScroll}
                    scrollEventThrottle={SCROLL_EVENT_THROTTLE}
                    showsHorizontalScrollIndicator={false}
                    snapToAlignment={'start'}
                > 
                    { this.renderOptions(options, selectedOptionIndex) }                    
                </ScrollView>
                <View style={[styles.marker, { left: selectionPoint || defaultMarkerPositionLeft }]} />
            </View>
        );
    }
}

SelectSlider.propTypes = {
    options: PropTypes.arrayOf(PropTypes.string),
    selectionPoint: PropTypes.number,
    onSelection: PropTypes.func
};

SelectSlider.defaultProps = {
    options: [],
    onSelection: () => {}
};

const styles = StyleSheet.create({
    container: {},
    contentContainer: {
        flexDirection: 'row',
        
    },
    marker: {
        height: 0,
        width: 0,
        borderBottomWidth: 6,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderColor: 'transparent',
        borderBottomColor: Colors.ViewsWhite,
        position: 'relative',
        marginTop: 10,
        shadowColor: '#4f5051',
        shadowRadius: 1.5,
        shadowOffset: {
            width: 0.5,
            height: 0.5,
        }
    },
    scrollViewContainer: {
        height: 40,
        alignItems: 'center'
    }
});

export default SelectSlider;

