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

export const formatPhotosObject = (photos) => {
  return photos.map(photo => {
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