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
    if (isJSON(photo.exif)) {
      exifData = JSON.parse(photo.exif)
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


/* ----------- */
let a = {
  "FILE": {
    "FileName": "phpXG97vO",
    "FileDateTime": 1514675369,
    "FileSize": 3624555,
    "FileType": 2,
    "MimeType": "image/jpeg",
    "SectionsFound": "ANY_TAG, IFD0, THUMBNAIL, EXIF, GPS, INTEROP"
  },
  "COMPUTED": {
    "Height": 3024,
    "Width": 4032,
    "IsColor": 1,
    "ByteOrderMotorola": 0,
    "ApertureFNumber": "f/1.7",
    "UserComment": null,
    "UserCommentEncoding": "UNDEFINED",
    "Thumbnail.FileType": 2,
    "Thumbnail.MimeType": "image/jpeg",
    "Thumbnail.Height": 376,
    "Thumbnail.Width": 504
  },
  "IFD0": {
    "Make": "samsung",
    "Model": "SM-G950F",
    "Orientation": 1,
    "XResolution": "72/1",
    "YResolution": "72/1",
    "ResolutionUnit": 2,
    "Software": "G950FXXU1AQI7",
    "DateTime": "2017:11:26 17:53:47",
    "YCbCrPositioning": 1,
    "Exif_IFD_Pointer": 214,
    "GPS_IFD_Pointer": 882
  },
  "THUMBNAIL": {
    "ImageWidth": 504,
    "ImageLength": 376,
    "Compression": 6,
    "Orientation": 1,
    "XResolution": "72/1",
    "YResolution": "72/1",
    "ResolutionUnit": 2,
    "JPEGInterchangeFormat": 1218,
    "JPEGInterchangeFormatLength": 21248
  },
  "EXIF": {
    "ExposureTime": "1/10",
    "FNumber": "17/10",
    "ExposureProgram": 2,
    "ISOSpeedRatings": 200,
    "ExifVersion": "0220",
    "DateTimeOriginal": "2017:11:26 17:53:47",
    "DateTimeDigitized": "2017:11:26 17:53:47",
    "ComponentsConfiguration": "u0001u0002u0003u0000",
    "ShutterSpeedValue": "336/100",
    "ApertureValue": "153/100",
    "BrightnessValue": "-322/100",
    "ExposureBiasValue": "-20/10",
    "MaxApertureValue": "153/100",
    "MeteringMode": 3,
    "Flash": 0,
    "FocalLength": "420/100",
    "MakerNote": "u0007",
    "UserComment": "u0000u0000u0000u0000u0000u0000u0000u0000u0000u0000u0000u0000u0000",
    "SubSecTime": "0401",
    "SubSecTimeOriginal": "0401",
    "SubSecTimeDigitized": "0401",
    "FlashPixVersion": "0100",
    "ColorSpace": 1,
    "ExifImageWidth": 4032,
    "ExifImageLength": 3024,
    "InteroperabilityOffset": 852,
    "ExposureMode": 0,
    "WhiteBalance": 0,
    "FocalLengthIn35mmFilm": 26,
    "SceneCaptureType": 0,
    "ImageUniqueID": "F12LLJA00VM F12LLKG01GM"
  },
  "GPS": {
    "GPSVersion": "u0002u0002u0000u0000",
    "GPSLatitudeRef": "N",
    "GPSLatitude": ["51 / 1", "30 / 1", "41 / 1      "],
    "GPSLongitudeRef": "W      ",
    "GPSLongitude": ["0 / 1      ", "5 / 1      ", "2 / 1      "],
    "GPSAltitudeRef": "u0000      ",
    "GPSAltitude": "210 / 1      ",
    "GPSTimeStamp": ["17 / 1      ", "53 / 1      ", "44 / 1      "],
    "GPSDateStamp": "2017:11:26"
  }, "INTEROP": {"InterOperabilityIndex": "R98", "InterOperabilityVersion": "0100"}
}