import MixpanelMapper from '../services/analytics-wrapper/mixpanel-mapper';

function createViewsAnalyticsMiddleware() {
    return ({dispatch, getState}) => next => action => {
        if (MixpanelMapper[action.type]) {
            MixpanelMapper[action.type](action.payload || action.scene);
        }

        return next(action);
    };
}

viewsAnalyticsMiddleware = createViewsAnalyticsMiddleware();

export default viewsAnalyticsMiddleware;
