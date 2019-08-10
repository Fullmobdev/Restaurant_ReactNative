import { LIKES_VIEWS_MODAL_SHOWN, LIKES_VIEWS_MODAL_CLOSED } from '../../types/likes-views-modal.types';

export const showLikesViewsModal = () => {
    return {
        type: LIKES_VIEWS_MODAL_SHOWN
    };
};

export const closeLikesViewsModal = () => {
    return {
        type: LIKES_VIEWS_MODAL_CLOSED
    };
};
