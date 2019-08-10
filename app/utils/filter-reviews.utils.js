import { FilterTypes } from "../types/filter.types";

export const filterReviewIds = (reviewIds, reviews, filter, filterOrder) => {
    switch (filter) {
        case FilterTypes.createdDate:
            return filterReviewIdsByDate(reviewIds, reviews, filterOrder);
        case FilterTypes.likes:
            return filterReviewIdsByLikes(reviewIds, reviews, filterOrder);
        default:
            return reviewIds;
    }
};

const filterReviewIdsByDate = (reviewIds, reviews, filterOrder) => {
    return reviewIds.sort((a, b) => {
        const review1 = reviews[a];
        const review2 = reviews[b];

        review1Date = new Date(review1.createdTime).getTime();
        review2Date = new Date(review2.createdTime).getTime();

        return -1 * (review1Date - review2Date);
    });
};

const filterReviewIdsByLikes = (reviewIds, reviews, filterOrder) => {
    return reviewIds.sort((a, b) => {
        const review1 = reviews[a];
        const review2 = reviews[b];

        return -1 * (review1.numLikes - review2.numLikes);
    });
};
