import firebase from 'react-native-firebase';
import RNFetchBlob from 'react-native-fetch-blob';
import _ from 'lodash';
import RNCompress from 'react-native-compress';
import { NativeModules } from 'react-native';

export const uploadMedia = (mediaPath, mediaType) => {
  if (isImage(mediaType)) {
    return upload(mediaPath, mediaType);
  }

  //If its a video, compress it
  return new Promise((resolve, reject) => {
    compressVideo(mediaPath)
    .then(response => {
      upload(response.path, mediaType)
      .then(blobResponse => {
        deleteMediaAtLocalPath(response.path); //Deleted the compressed video
        resolve(blobResponse);
      })
      .catch(error => {
        //If video was already compressed
        //but there was an error uploading
        deleteMediaAtLocalPath(response.path);
        reject(error);
      });
    }).catch(error => reject(error));
  });
};

const upload = (mediaPath, mediaType) => {
  const uid = guid();
  const typePrefix = isImage(mediaType) ? 'image' : 'video';

  return firebase.storage().ref('users').child(`${uid}.${mediaType}`)
  .putFile(mediaPath, { type: `${typePrefix}/${mediaType}` });
};

const compressVideo = (uri) => {
  return RNCompress.compressVideo(uri, 'medium');
};

export const deleteMediaAtLocalPath = (path) => {
  RNFetchBlob.fs.unlink(path)
  .then(() => { })
  // `unlink` will throw an error, if the item to unlink does not exist
  .catch((err) => { });
};

export const isImage = (mediaType) => {
  const supportedMobileImageFormats = ['tiff', 'tif', 'jpeg', 'gif',
  'png', 'dib', 'bmp', 'BMPf', 'ico', 'cur', 'xbm'];
  return _.includes(supportedMobileImageFormats, mediaType);
};

/**
 * 
 * @param {*} uri 
 * @param {*} seconds 
 * @returns a promise that recieves an object with 3 properties thumbnail uri, thumbnail width and height( in order )
 */

export const fetchThumbnailAtSeconds = (uri, seconds) => {
  return NativeModules.CustomThumbnail.fetchCustomThumbnail(uri, seconds);
};

/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */
function guid() {
  function _p8(s) {
      var p = (Math.random().toString(16)+"000000000").substr(2,8);
      return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
  }
  return _p8() + _p8(true) + _p8(true) + _p8();
}
