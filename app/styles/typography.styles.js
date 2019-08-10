import { StyleSheet } from 'react-native';

import Colors from './colors.styles';

export const Typography = {
    title1: {
        color: Colors.ViewsBlack,
        fontFamily: 'System',
        fontSize: 28,
    },
    title3: {
        color: Colors.ViewsBlack,
        fontFamily: 'System',
        fontSize: 20
    },
    body: {
        color: Colors.ViewsBlack,
        fontFamily: 'System',
        fontSize: 15,
        lineHeight: 20
    },
    bodySmall: {
        color: Colors.ViewsBlack,
        fontFamily: 'System',
        fontSize: 13,
        lineHeight: 17
    },
    bodyXSmall: {
        color: Colors.ViewsBlack,
        fontFamily: 'System',
        fontSize: 11, 
        lineHeight: 15
    },
    micro: {
        color: Colors.ViewsBlack,
        fontFamily: 'System',
        fontSize: 8,
        lineHeight: 11
    },
    headline: {
        color: Colors.ViewsBlack,
        fontFamily: 'System',
        fontSize: 15,
        fontWeight: 'bold',
        lineHeight: 20
    }
};

export const TextShadows = StyleSheet.create({
    cameraText: {
        shadowColor: Colors.ViewsBlack,
        shadowRadius: 10,
        shadowOpacity: 0.8
    }
});
