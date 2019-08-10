import * as SceneType from '../types/scene.types';

export const Tabs = {
    timeline: 0,
    reward: 1,
    camera: 2,
    search: 3,
    profile: 4
};

export const TabsIndexToName = {
    [Tabs.timeline]: SceneType.TIMELINE_TAB,
    [Tabs.reward]: SceneType.REWARDS_TAB,
    [Tabs.camera]: SceneType.CAPTURE_TAB,
    [Tabs.search]: SceneType.SEARCH_TAB,
    [Tabs.profile]: SceneType.PROFILE
};
