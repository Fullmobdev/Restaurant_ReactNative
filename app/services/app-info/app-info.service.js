import DeviceInfo from 'react-native-device-info';

export const getAppVersion = () => {
    return DeviceInfo.getVersion();
};

export const getAppVersionWithBuildNumber = () => {
    return DeviceInfo.getReadableVersion();
}
