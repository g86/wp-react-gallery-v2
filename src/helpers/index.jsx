export const TEST_UPLOAD_URL = 'http://www.impressions.lt/wp-content/plugins/include-gallery/api.php?action=upload'
export const TEST_DELETE_URL = 'http://www.impressions.lt/wp-content/plugins/include-gallery/api.php?action=delete'
export const TEST_UPDATE_URL = 'http://www.impressions.lt/wp-content/plugins/include-gallery/api.php?action=update'

export const fileSizeFromBytes = (sizeInBytes, toUnits = 'mb') => {
  let size = 0
  switch (toUnits) {
    case "kb":
      size = (sizeInBytes / 1024).toFixed(2)
      break
    default:
      size = (sizeInBytes / (1024 * 1024)).toFixed(2)
      break
  }
  return size
}

export const isJSON = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export const formatPhotosObject = (photos) => {
  return photos.map(photo => {
    let exifData = photo.exif
    if (isJSON(photo.exif)){
      exifData = JSON.parse(photo.exif)
    }
    return {
      "id": photo.id,
      "galleryId": photo.object_id,
      "order": photo.num,
      "photoThumbnail": photo.photo_path,
      "photoMedium": photo.photo_path,
      "photoLarge": photo.photo_path,
      "photoOriginal": photo.photo_path,
      "timeCreated": "",
      "isExceptional": photo.is_impressive,
      "isPanorama": true,
      "isWallpaper": false,
      "isCover": photo.is_header,
      "alt": photo.alt,
      "geo": photo.geo,
      "exif": exifData,
      "title": photo.title,
      "description": photo.description,
      "rating": "",
      "keywords": "",
      "category": "",
      "author": "",
      "camera": "",
      "iso": "",
      "shutter": "",
      "aperture": "",
      "focalLength": ""
    }
  })
}

export const countFilesToBeUploaded = (files) => {
  return files.reduce((uploadsPending, file) => {
    if (file.isUploaded === false && file.error === false) {
      return ++uploadsPending
    } else {
      return uploadsPending
    }
  }, 0)
}

export const countSizeToBeUploaded = (files) => {
  return files.reduce((uploadsPending, file) => {
    uploadsPending += file.size
    return  uploadsPending
  }, 0)
}

export const countSizeUploaded = (files) => {
  return files.reduce((uploadsPending, file) => {
    if (file.isUploaded === false && file.error === false) {
      return  uploadsPending
    } else {
      uploadsPending = uploadsPending + file.size
      return  uploadsPending
    }
  }, 0)
}