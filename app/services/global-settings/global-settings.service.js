import semver from 'semver';
import { getDatabaseReferenceByPath } from '../db-access.service';
import { GLOBAL_SETTINGS_PATH } from './global-settings.endpoints';
import { getAppVersion } from '../app-info/app-info.service';

export const fetchGlobalSettings = () => {
    const url = GLOBAL_SETTINGS_PATH;
    return getDatabaseReferenceByPath(url)
    .once('value')
    .then(snapshot => {
        return snapshot.val();
    });
};

export const isForcedUpgradeRequired = (minimumAppVersion) => {
    const currentAppVersion = getAppVersion();

    if (!semver.valid(currentAppVersion) || !semver.valid(minimumAppVersion)) {
        return false;
    }

    return semver.lt(currentAppVersion, minimumAppVersion);
};

