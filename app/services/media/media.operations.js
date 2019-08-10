import { ImageEditor, ImageStore, Image } from 'react-native'
import ImageResizer from 'react-native-image-resizer';
import RNThumbnail from 'react-native-thumbnail'; //For creating thumbnails from videos
import * as mediaService from './media.service';

/**
 * Creates thumbnail from local uri.
 * @param {String} uri
 * @param {String} mediaType
 * @returns A promise with resolve argument being a dataURI
 */
export const createThumbnail = (uri, mediaType) => {
  return new Promise((resolve, reject) => {
    if (mediaService.isImage(mediaType)) {
      generateThumbnailFromImage(uri)
      .then(response => resolve(response))
      .catch(error => reject(error));
    } else {
      generateThumbnailFromVideo(uri)
      .then(response => resolve(response))
      .catch(error => reject(error));
    }
  });
};

/**
 * Scales down (portrai) image and uses its center to
 * generate a square thumbnail image
 * @param {String} uri
 */
const generateThumbnailFromImage = (uri) => {
  const thumbnailExt = 'JPEG'; //ImageResizer only works with JPEG and PNG types

  return new Promise((resolve, reject) => {
    scaleDownImage(uri, thumbnailExt)
    .then(response => {
      const scaledDownURI = response.path;
      squarifyPortraitImage(scaledDownURI, thumbnailExt)
        .then(dataURI => resolve(dataURI)).catch(error => reject(error));
    })
    .catch(error => {
      reject(error);
    });
  });
};

/**
 * @param {String} uri
 */
const generateThumbnailFromVideo = (uri) => {
  return new Promise((resolve, reject) => {
    RNThumbnail.get(uri).then((result) => {
      const thumbnailURI = result.path;
      generateThumbnailFromImage(thumbnailURI)
      .then(response => resolve(response))
      .catch(error => reject(error));
    }).catch(error => reject(error));
  });
};

/**
 * Crop a portrait image so that it becomes square. This will take the
 * center square of the portrait image
 * For example, portrait image
 * |1111|
 * |2222|
 * |3333|
 * |4444|
 *
 * After squarify:
 * |2222|
 * |3333|
 *
 * @param {String} uri uri of the image to by squarified
 * @param {String} imageExtension imageExtension of the image to by squarified (ex: JPEG, PNG, ..)
 * @returns Promise that with result = dataURI
 */
const squarifyPortraitImage = (uri, imageExtension) => {
  return new Promise((resolve, reject) => {
    Image.getSize(uri,
      (width, height) => {
        cropImage(uri, width, width, 0, height / 2 - width / 2)
        .then(imageData => resolve(base64ImageToDataURI(imageData, imageExtension)))
        .catch(error => reject(error));
      },
      (error) => reject(error));
  });
};

/**
 * Resizes (scales) down an image.
 * @param {String} uri
 * @param {String} imageExt
 * @returns promise with scaledDownURI = result.path
 */
const scaleDownImage = (uri, imageExt) => {
  return ImageResizer.createResizedImage(uri, 800, 800, imageExt, 100);
};

/**
 * Appends 'data:image/[extension];base64,' to a base64 string
 * @param {Base64 String} base64
 * @param {String} imageExtension
 */
const base64ImageToDataURI = (base64, imageExtension) => {
  return (`data:image/${imageExtension};base64, ${base64}`);
};

/**
 * Crops image from a local or remote uri.
 * @param {String} uri
 * @param {double} newW new width
 * @param {double} newH new height
 * @param {double} xOffset
 * @param {double} yOffset
 * @returns promise with result being a cropped base64 image (string)
 */
const cropImage = (uri, newW, newH, xOffset, yOffset) => {
  const cropData = {
    offset: { x: xOffset, y: yOffset },
    size: { width: newW, height: newH },
  };
  return new Promise((resolve, reject) => {
    ImageEditor.cropImage(uri, cropData, (string) => {
      ImageStore.getBase64ForTag(string, (imageData) => {
          //Remove image from ram
          ImageStore.removeImageForTag(string);
          resolve(imageData);
         }, (error) => reject(error));
        }, (error) => reject(error));
  });
};
