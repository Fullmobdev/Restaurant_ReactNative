import React, { Component } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
import Video from 'react-native-video';

// Services
import { getAppVersion } from '../../services/app-info/app-info.service';

// Assets
import bgVideo from '../../images/background_video.mp4';
import LogoCombo from '../../images/views_logo.png';
import ViewsColor from '../../styles/colors.styles';

class ForcedUpgrade extends Component {
    render() {
        const { currentVersion, description, latestVersion, storeUrl } = this.props; 

        return (
            <View style={{ flex: 1 }}>
                <Video
                    repeat
                    source={bgVideo}
                    resizeMode='cover'
                    style={styles.videoStyle}
                />
                <View style={styles.overlay}> 
                    <Image style={styles.logo} source={LogoCombo} />
                    <View style={styles.header}>
                        <Text style={styles.heading}> Version Update </Text>
                        <Text style={styles.versionText}> Current Version: { currentVersion } </Text>
                        <Text style={styles.versionText}> Recommended Version: { latestVersion } </Text>
                    </View>
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionText}>{ description }</Text>
                    </View>
                    
                </View>
            </View>
        );
    }
};

const mapStateToProps = (state) => {
    const currentVersion = getAppVersion();
    const { latestVersion, forcedUpgrade } = state.settings;
    const { description, minimumVersion, storeUrl } = forcedUpgrade;
    
    return {
        currentVersion,
        description,
        latestVersion,
        minimumVersion,
        storeUrl
    };
};

export default connect(mapStateToProps)(ForcedUpgrade);

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    versionText: {
        color: ViewsColor.ViewsGray2,
        marginVertical: 2
    },
    descriptionContainer: {
        padding: 30
    },
    descriptionText: {
        color: ViewsColor.ViewsWhite,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center'
    },
    header: {
        alignItems: 'center',
        paddingTop: 40
    },
    heading: {
        color: ViewsColor.ViewsWhite,
        fontSize: 21,
        fontWeight: '600',
        marginBottom: 5
    },
    logo: {
        height: 80,
        width: 130,
        resizeMode: 'contain'
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingTop: 60,
        alignItems: 'center'
    },
    videoStyle: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      },
});

