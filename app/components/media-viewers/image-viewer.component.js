import React, { Component } from 'react';
import { Image } from 'react-native';

export default class ImageViewer extends Component {
  render() {
    return (
      <Image
        source={{ uri: this.props.imageURI }}
        style={this.props.style}
      />
    );
  }
}
