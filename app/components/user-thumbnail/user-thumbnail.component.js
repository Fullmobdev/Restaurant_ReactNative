import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import Colors from '../../styles/colors.styles';

const getProfilePic = (profilePicUrl, size) => {
    
  const defaultUserStyle = styles[`defaultUser${size}`];
  const imageStyle = styles[`imageStyle${size}`];

  if (profilePicUrl !== '') {
    return (
      <Image style={imageStyle} resizeMode="cover" source={{ uri: profilePicUrl }} />
    );
  }
  return (
    <Icon
        name='ios-person'
        color={Colors.ViewsGray3}
        style={defaultUserStyle}
    />
  );
};

const UserThumbnail = (props) => {
    const { 
        containerStyle,
        disabled,
        size,
        onPress, 
        profilePicUrl 
    } = props;
    
    const userProfileStyle = styles[`userProfile${size}`];

    return (
        <TouchableOpacity 
            disabled={disabled}
            style={containerStyle} 
            onPress={onPress}
        >
            <View style={[styles.userProfile, userProfileStyle]}>
              {getProfilePic(profilePicUrl, size)}
            </View>
        </TouchableOpacity>
    );
};

UserThumbnail.propTypes = {
    containerStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
    size: PropTypes.oneOf(['Sm', 'Md']),
    onPress: PropTypes.func
};

UserThumbnail.defaultProps = {
    containerStyle: {},
    disabled: false,
    size: 'Sm',
    profilePicUrl: '',
    onPress: () => {}
};

const styles = StyleSheet.create({
    defaultUserSm: {
        fontSize: 40,
        position: 'relative',
        top: 5
    },
    defaultUserMd: {
        fontSize: 80,
        position: 'relative',
        top: 10
    },

    imageStyleSm: {
        height: 40,
        width: 40,
        borderRadius: 20
    },

    imageStyleMd: {
        height: 80,
        width: 80,
        borderRadius: 40
    }, 

    userProfile: {
        backgroundColor: Colors.ViewsWhite,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.ViewsGray1,        
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        
    },
    userProfileSm: {
        borderRadius: 15,
        height: 30,
        width: 30
    },
    userProfileMd: {
        borderRadius: 30,
        height: 60,
        width: 60
    }
});

export default UserThumbnail;
