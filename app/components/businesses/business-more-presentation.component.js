import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { web, phonecall, email } from 'react-native-communications';
import MapView, { Marker } from 'react-native-maps';
import { arrowForward, laptop, call, mail } from '../icons/icons';
import imgIcons from '../img-icons/img-icons';
import { Typography } from '../../styles/typography.styles';
import Colors from '../../styles/colors.styles';
// import Screen from '../../images/screen.png';

const BusinessMoreView = props => {
  const { businessName, telephone, address, website, location, openGoogleMap } = props;

  const { container, infoStyle, infoTitleContainer, iconStyle, spanText } = styles;
  return (
    <View style={container}>
      <View style={{ marginLeft: 16 }}>
        <Text style={styles.informationText}>Restaurant Information</Text>
        <TouchableOpacity onPress={() => web(`${website}`)} style={infoStyle}>
          <View style={infoTitleContainer}>
            <Icon style={iconStyle} name={laptop} size={24} />
            <Text style={spanText}>Visit Website</Text>
          </View>
          <Icon name={arrowForward} color={Colors.viewsRed2} size={16} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => phonecall(`${telephone.replace(/[+-\s]/g, '')}`, true)}
          style={infoStyle}
        >
          <View style={infoTitleContainer}>
            <Icon style={iconStyle} name={call} size={24} />
            <Text style={[spanText, styles.callText]}>{telephone}</Text>
          </View>
        </TouchableOpacity>        
        <View style={styles.moreInfoContainer}>
          <View style={styles.mpaConatiner}>
            <Text style={styles.informationText}>Location</Text>
            <View style={styles.location}>
              <MapView
                initialRegion={{
                  latitude: location.lat,
                  longitude: location.lng
                }}
                provider="google"
                style={styles.map}
                minZoomLevel={10}
                maxZoomLevel={18}
              >
                <Marker
                  coordinate={{ latitude: location.lat, longitude: location.lng }}
                  image={imgIcons.mapMarker}
                />
              </MapView>
            </View>

            <Text style={styles.addressBusinessName}>{businessName}</Text>
            <TouchableOpacity onPress={openGoogleMap} style={styles.addressContainer}>
              <Text style={styles.addressText}>{address}</Text>
              <Icon name={arrowForward} color={Colors.viewsRed2} size={16} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.ViewsWhite,
    paddingTop: 25,
    paddingBottom: 20
  },
  titleStyle: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 30,
    paddingRight: 30
  },
  infoStyle: {
    paddingVertical: 16,
    marginRight: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.ViewsGray2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  infoTitleContainer: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  spanText: {
    ...Typography.body
  },
  callText: {
    color: Colors.viewsRed2
  },
  iconStyle: {
    color: '#aaaaaa',
    marginRight: 15
  },
  informationText: {
    ...Typography.headline
  },
  moreInfoContainer: {
    marginTop: 8,
    marginLeft: -16,
    padding: 16,
    borderRadius: 5,
    backgroundColor: '#ffffff'
  },
  addressBusinessName: {
    ...Typography.headline
  },
  addressText: {
    ...Typography.body,
    marginTop: 5
  },
  location: {
    marginTop: 24,
    height: 243,
    marginBottom: 16
  },
  amenitiesContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10
  },
  mpaConatiner: {
    height: 350
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
});

export default BusinessMoreView;
