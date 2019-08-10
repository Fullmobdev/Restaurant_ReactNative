import React, { PropTypes } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import { Icon } from 'react-native-elements';
// Components
import BusinessMediaThumbnail from '../business-media-thumbnail/business-media-thumbnail.component';
import MediaThumbnail from '../media-thumbnail/media-thumbnail.component';
import SearchHeader from '../search-header/search-header.component';


const ReviewBusinessSearchView = ({
    loading,
    searchResults,
    onChangeText,
    onSelectBusiness,
    onCancel,
    moment
}) => {
    return (
        <View>
            <SearchHeader onChangeText={onChangeText} />
            <View style={styles.searchResultsContainer}>
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.searchResultsScrollContainer}
                    horizontal
                    keyboardShouldPersistTaps="always"
                >
                  { loading ? renderLoader() : renderSearchResults(searchResults, onSelectBusiness, moment) }
                </ScrollView>
            </View>
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.cancelButton}>
                    <Text>Cancel</Text>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
};

const renderLoader = () => {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator />
        </View>
    );
};


const renderSearchResults = (searchResults, onSelectBusiness, moment) => {
    return searchResults.map((searchResult) => (
            <View style={styles.searchResultsContent} key={searchResult.id} >
                <View style={styles.searchResultsContent}>
                    <BusinessMediaThumbnail
                        id={searchResult.id}
                        title={searchResult.name}
                        text={searchResult.address}
                        photoReference={searchResult.photoReference}
                        photoUri={searchResult.photoUri}
                        onPress={() => { onSelectBusiness(searchResult); }}
                        moment={moment}
                        isHighlighted={moment ? moment.id === searchResult.id : null}
                    />
                </View>
            </View>
        )
    );
};

ReviewBusinessSearchView.propTypes = {
    loading: PropTypes.bool,
    searchResults: PropTypes.array,
    onSelectBusiness: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isHighlighted: PropTypes.bool
};


const styles = StyleSheet.create({
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 10
    },
    loadingContainer: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center'

    },
    searchResultsContainer: {
        borderBottomColor: 'gray',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'gray',
        borderTopWidth: StyleSheet.hairlineWidth
    },
    searchResultsContent: {
        marginRight: 10
    },
    searchResultsScrollContainer: {
        minWidth: '100%',
        minHeight: 125,
        paddingLeft: 10,
        paddingVertical: 20
    }
});
export default ReviewBusinessSearchView;
