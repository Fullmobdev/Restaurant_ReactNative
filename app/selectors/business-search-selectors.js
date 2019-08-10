import { createSelector } from 'reselect';

const getBusinessSearchText = state => state.businessSearch.businessSearchText;
const getBusinessSearches = state => state.businessSearch.businessSearches;
const getBusinessResults = state => state.businessSearch.businessSearchResults;

const getBusinessSearchResultIds = createSelector(
    [getBusinessSearchText, getBusinessSearches],
    (searchText, searches) => {
        return searches[searchText] || [];
    }
);

export const getBusinessSearchResults = createSelector(
    [getBusinessSearchResultIds, getBusinessResults],
    (businessIds, businesses) => {
        const businessResults = businessIds.map((id) => {
            return businesses[id];
        });

        return businessResults;
    }
);
