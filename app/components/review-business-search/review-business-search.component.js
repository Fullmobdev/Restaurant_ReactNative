import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

// Components
import ReviewBusinessSearchView from './review-business-search-presentation.component';

// Actions
import { searchBusiness } from '../../actions/search-business/search-business.action';

// Selectors
import { getBusinessSearchResults } from '../../selectors/business-search-selectors';

class ReviewBusinessSearch extends Component {
    static PropTypes = {
        onCancel: PropTypes.func.isRequired,
        onSelectBusiness: PropTypes.func.isRequired,
        searchResults: PropTypes.array
    }

    componentDidMount() {
        this.props.onSearchBusinesses('');
    }

    searchBusinesses = (searchText) => {
        this.props.onSearchBusinesses(searchText);
    }

    render() {
        const {
            loading,
            onCancel,
            onSelectBusiness,
            searchResults,
            moment,
        } = this.props;

        return (

            <ReviewBusinessSearchView
                loading={loading}
                onCancel={onCancel}
                onChangeText={this.searchBusinesses}
                searchResults={searchResults}
                onSelectBusiness={onSelectBusiness}
                moment={moment}
            />
        );
    }
}

ReviewBusinessSearch.defaultProps = {
    cacheId: ''
};

const mapStateToProps = (state) => {
    const { businessSearch, moment } = state;
    const { businessSearchResults } = businessSearch;

    let businesses = getBusinessSearchResults(state);
    if (moment.business && businessSearch.businessSearchText === '') {
        businesses = [
            moment.business,
            ...businesses.filter((business) => business.id !== moment.business.id)
        ];
    }

    return {
        moment: moment.business,
        searchResults: businesses,
        loading: businessSearchResults.isFetchingBusinesses
    };
};


const mapDispatchToProps = (dispatch) => {
    return {
        onSearchBusinesses: (searchText) => {
            dispatch(searchBusiness(searchText));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ReviewBusinessSearch);
