const TEST_HOST = window.IN_GALLERY_TEST_HOST || 'http://localhost'
export const TEST_UPLOAD_URL = `${TEST_HOST}/wp-content/plugins/include-gallery/api.php?action=upload`
export const TEST_DELETE_URL = `${TEST_HOST}/wp-content/plugins/include-gallery/api.php?action=delete`
export const TEST_UPDATE_URL = `${TEST_HOST}/wp-content/plugins/include-gallery/api.php?action=update`

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


    try {
      if (isJSON(photo.exif)) {
        exifData = JSON.parse(photo.exif)
      }
    } catch (error) {
      console.log('Could not parseEXIF data...')
    }

    return {
      ...photo,
      "galleryId": photo.objectId,
      "photoThumbnail": photo.photoPath,
      "photoMedium": photo.photoPath,
      "photoLarge": photo.photoPath,
      "photoOriginal": photo.photoPath
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
    return uploadsPending
  }, 0)
}

export const countSizeUploaded = (files) => {
  return files.reduce((uploadsPending, file) => {
    if (file.isUploaded === false && file.error === false) {
      return uploadsPending
    } else {
      uploadsPending = uploadsPending + file.size
      return uploadsPending
    }
  }, 0)
}

export const getSizePath = (path, size) => {
  return path.replace('galleries', `public-images/${size}`)
}