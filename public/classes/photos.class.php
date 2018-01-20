<?php

define('EXPOSE_FIELDS', array(
  'id' => true,
  'objectId' => true,
  'photoPath' => true,
  'width' => true,
  'height' => true,
  'ratio' => true,
  'isDeleted' => false,
  'isPublic' => false,
  'isCover' => true,
  'title' => true,
  'description' => true,
  'alt' => true,
  'geo' => true,
  'exifGeo' => false,
  'exif' => false,
  'exifAuthor' => false,
  'exifTimeCreated' => false,
  'exifCameraMake' => true,
  'exifCameraModel' => true,
  'exifIso' => true,
  'exifShutter' => true,
  'exifAperture' => true,
  'exifFocalLength' => true
));

class UploadifiedPhotosR
{
  public function __construct($ID)
  {
    $this->ID = $ID;
    $this->defaultPhotoPath = '/galleries/no-photo.jpg';
  }

  public function getPhotos()
  {
    global $wpdb;
    // create separate endpoint for admin, or query by role

    $exposeFieldNames = array();

    foreach (EXPOSE_FIELDS as $field => $expose) {
      if ($expose) {
        $exposeFieldNames[] = $field;
      }
    }

    $fieldsQueryPart = '`' . implode('`,`', $exposeFieldNames) . '`';

    $q = "SELECT {$fieldsQueryPart} FROM impressions_gallery_photos WHERE objectId = '{$this->ID}' AND isDeleted = '0' ORDER BY `num` ASC, `id` ASC";

    $aPhotos = $wpdb->get_results($q, ARRAY_A);
    return $aPhotos;
  }

  public function getPhotosIDs()
  {
    global $wpdb;
    $aPhotos = $wpdb->get_results("SELECT `id` FROM impressions_gallery_photos WHERE objectId = '{$this->ID}' AND isDeleted = '0' ORDER BY `num` ASC, `id` ASC", ARRAY_A);
    $aIDs = array();
    if (count($aPhotos) > 0) foreach ($aPhotos as $a) {
      $aIDs[] = $a['id'];
    }
    return $aIDs;
  }

  private function createTargetDir($absTargetDir)
  {
    if (!is_dir($absTargetDir)) {
      mkdir($absTargetDir, 0755, true);
    }
  }

  public function uploadPhoto($iObjectID, $fileInfo)
  {
    ini_set('memory_limit', '512M');
    $responseData = array();
    if (!empty($_FILES) && $iObjectID > 0) {
      $tempUploadedFile = $_FILES['file']['tmp_name'];

      //$targetPath = $_SERVER['DOCUMENT_ROOT'] . $_REQUEST['folder'] . '/';

      $absPathWatermark = false;
      $absTargetDir = $_SERVER['DOCUMENT_ROOT'] . '/galleries/' . $iObjectID . '/';
      $absTargetDir = str_replace('//', '/', $absTargetDir);

      $this->createTargetDir($absTargetDir);

      $time = time();
      $absTargetFile = $absTargetDir . $iObjectID . '_' . $time . '_' . rand(0, 9);


      $fileTypes = 'jpg|gif|png|jpeg';
      $typesArray = explode('|', $fileTypes);
      $fileParts = pathinfo($_FILES['file']['name']);
      $fileExtension = $fileParts['extension'];

      $EXIF = $this->getExifData($tempUploadedFile);

      $fileInfo['geo'] = $this->getGpsData($tempUploadedFile);

      $fileInfo['exif'] = json_encode($EXIF);
      $fileInfo = array_merge($fileInfo, $this->getPhotoParams($EXIF));

      if (in_array(strtolower($fileExtension), $typesArray)) {
        // Uncomment the following line if you want to make the directory if it doesn't exist
        // mkdir(str_replace('//','/',$targetPath), 0755, true);
        $absTargetFile .= '.' . strtolower($fileExtension);

        move_uploaded_file($tempUploadedFile, $absTargetFile);
        $sRelativeOriginalPath = str_replace($_SERVER['DOCUMENT_ROOT'], '', $absTargetFile);
        //$sWatermarkedCopyPath = preg_replace('|nt-originals|Uis','nt-photos',$sourceFile);

        $aNewDimensions = $this->resizeSavedPhoto($sRelativeOriginalPath, $sRelativeOriginalPath, $absPathWatermark, $EXIF);
        $fileInfo['is_deleted'] = '0';
        $fileInfo['is_public'] = '1';
        $fileInfo['isCover'] = '0';
        $fileInfo['width'] = $aNewDimensions['width'];
        $fileInfo['height'] = $aNewDimensions['height'];
        $fileInfo['ratio'] = (float)($aNewDimensions['width'] / $aNewDimensions['height']);
        $iNewPhotoID = $this->savePhotoData($iObjectID, $sRelativeOriginalPath, $fileInfo);
        $responseData['uploadedPhoto'] = $this->getNewPhotoData($iNewPhotoID);
        $responseData['allPhotos'] = $this->getPhotos();
        $responseData['status'] = 'OK';
      } else {
        $responseData['error'] = 'API: Invalid file type.';
        $responseData['status'] = 'FAILED';
      }
    } else {
      $responseData['error'] = 'API: File error.';
      $responseData['status'] = 'FAILED';
    }
    return $responseData;
  }

  private function getPhotoParams($EXIF)
  {
    $someData = array(
      'exifAuthor' => isset($EXIF['IFD0']['Artist']) ? $EXIF['IFD0']['Artist'] : '',
      'exifTimeCreated' => isset($EXIF['EXIF']['DateTimeOriginal']) ? $EXIF['EXIF']['DateTimeOriginal'] : '',
      'exifCameraMake' => isset($EXIF['IFD0']['Make']) ? $EXIF['IFD0']['Make'] : '',
      'exifCameraModel' => isset($EXIF['IFD0']['Model']) ? $EXIF['IFD0']['Model'] : '',
      'exifIso' => isset($EXIF['EXIF']['ISOSpeedRatings']) ? $EXIF['EXIF']['ISOSpeedRatings'] : '',
      'exifShutter' => isset($EXIF['EXIF']['ExposureTime']) ? $EXIF['EXIF']['ExposureTime'] : '',
      'exifAperture' => isset($EXIF['EXIF']['FNumber']) ? $EXIF['EXIF']['FNumber'] : '',
      'exifFocalLength' => isset($EXIF['EXIF']['FocalLengthIn35mmFilm']) ? $EXIF['EXIF']['FocalLengthIn35mmFilm'] : (
        isset($EXIF['EXIF']['FocalLength']) ? $EXIF['EXIF']['FocalLength'] : ''
      )
    );

    return $someData;
  }

  private function getGpsData($filename)
  {
    $exif = @exif_read_data($filename);
    $lon = $this->getGps($exif["GPSLongitude"], $exif['GPSLongitudeRef']);
    $lat = $this->getGps($exif["GPSLatitude"], $exif['GPSLatitudeRef']);
    return $lat . ',' . $lon;
  }

  private function getExifData($filename)
  {
    $exif = @exif_read_data($filename, 0, true);
    if (isset($exif['COMPUTED'])) {
      if (isset($exif['COMPUTED']['html'])) {
        unset($exif['COMPUTED']['html']);
      }
    }
    return $exif;
  }

  private function getGps($exifCoord, $hemi)
  {

    $degrees = count($exifCoord) > 0 ? $this->gps2Num($exifCoord[0]) : 0;
    $minutes = count($exifCoord) > 1 ? $this->gps2Num($exifCoord[1]) : 0;
    $seconds = count($exifCoord) > 2 ? $this->gps2Num($exifCoord[2]) : 0;

    $flip = ($hemi == 'W' or $hemi == 'S') ? -1 : 1;

    return $flip * ($degrees + $minutes / 60 + $seconds / 3600);

  }

  private function gps2Num($coordPart)
  {

    $parts = explode('/', $coordPart);

    if (count($parts) <= 0)
      return 0;

    if (count($parts) == 1)
      return $parts[0];

    return floatval($parts[0]) / floatval($parts[1]);
  }

  public function savePhotoData($iObjectID, $filePath, $fileInfo)
  {
    global $wpdb;
    
    $fieldNames = array(
      'id' => '',
      'objectId' => $iObjectID,
      'photoPath' => $filePath,
      'width' => $fileInfo['width'],
      'height' => $fileInfo['height'],
      'ratio' => $fileInfo['ratio'],
      'isDeleted' => $fileInfo['isDeleted'],
      'isPublic' => $fileInfo['isPublic'],
      'isCover' => $fileInfo['isCover'],
      'title' => $fileInfo['title'],
      'description' => $fileInfo['description'],
      'alt' => $fileInfo['alt'],
      'geo' => $fileInfo['geo'],
      'exifGeo' => $fileInfo['exifGeo'],
      'exif' => $fileInfo['exif'],
      'exifAuthor' => $fileInfo['exifAuthor'],
      'exifTimeCreated' => $fileInfo['exifTimeCreated'],
      'exifCameraMake' => $fileInfo['exifCameraMake'],
      'exifCameraModel' => $fileInfo['exifCameraModel'],
      'exifIso' => $fileInfo['exifIso'],
      'exifShutter' => $fileInfo['exifShutter'],
      'exifAperture' => $fileInfo['exifAperture'],
      'exifFocalLength' => $fileInfo['exifFocalLength']
    );


    $q = "INSERT INTO impressions_gallery_photos (`" . implode("`,`", array_keys($fieldNames)) . "`) VALUES ('" . implode("','", $fieldNames) . "')";

    $wpdb->query($q);

    return $wpdb->insert_id;
  }

  public function deletePhoto($sPhotoID)
  {
    global $wpdb;
    $q = "UPDATE impressions_gallery_photos SET isDeleted = 1 WHERE id = '{$sPhotoID}'";
    $wpdb->query($q);
    return array(
      'allPhotos' => $this->getPhotos(),
      'message' => 'ok',
      'query' => $q,
      'db_response' => $wpdb->last_error
    );
  }

  public function deletePhotos()
  {
    global $wpdb;
    $wpdb->query("UPDATE impressions_gallery_photos SET isDeleted = 1 WHERE object_id = '{$this->ID}'");
  }

  public function updatePhotoInfo($photoID, $photoInfo)
  {
    global $wpdb;
    $q = "UPDATE impressions_gallery_photos SET 
              `title` = '{$photoInfo['title']}',
              `description` = '{$photoInfo['description']}',
              `alt` = '{$photoInfo['alt']}',
              `geo` = '{$photoInfo['geo']}',
              `isCover` = '{$photoInfo['isCover']}'
              WHERE `id` = '{$photoID}'";
    $wpdb->query($q);

    return array(
      'message' => 'ok',
      'query' => $q,
      'db_response' => $wpdb->last_error
    );
  }

  public function resizeSavedPhoto($sourceFile, $targetFile, $sWatermark = false, $EXIF = array())
  {
    $sourceAbsoluteFile = str_replace('//', '/', $_SERVER['DOCUMENT_ROOT'] . '/' . $sourceFile);
    $targetAbsoluteFile = str_replace('//', '/', $_SERVER['DOCUMENT_ROOT'] . '/' . $targetFile);

    $degrees = 0;
    if (isset($EXIF['IFD0']['Orientation'])) {
      // landscape == 1
      if ($EXIF['IFD0']['Orientation'] == 6) {
        // rotate 90* CW
        $degrees = -90;
      }
      if ($EXIF['IFD0']['Orientation'] == 8) {
        // rotate 90* CW
        $degrees = 90;
      }
    }

    $imgSizes = array(
      'small' => 460,
      'medium' => 720,
      'large' => 1080,
      'full' => 2048,
    );

    $newHeight = $imgSizes['full'];

    list($origWidth, $origHeight, $origType) = getimagesize($sourceAbsoluteFile);
    $imageType = image_type_to_mime_type($origType);

    if ($degrees !== 0) {
      $tmpWidth = $origWidth;
      $origWidth = $origHeight;
      $origHeight = $tmpWidth;
    }

    if ($newHeight < $origHeight) {
      $scale = $newHeight / $origHeight;
      //echo 'Scaling ratio: ' . $scale;
    } else {
      $scale = 1;
      //return;
    }

    $newWidth = ceil($origWidth * $scale);
    $newHeight = ceil($origHeight * $scale);

    $newImage = imagecreatetruecolor($newWidth, $newHeight);
    switch ($imageType) {
      case "image/gif":
        $sourceImage = imagecreatefromgif($sourceAbsoluteFile);
        break;
      case "image/pjpeg":
      case "image/jpeg":
      case "image/jpg":
        $sourceImage = imagecreatefromjpeg($sourceAbsoluteFile);
        break;
      case "image/png":
      case "image/x-png":
        $sourceImage = imagecreatefrompng($sourceAbsoluteFile);
        break;
      default:
        break;
    }
    if ($degrees !== 0) {
      $sourceImage = imagerotate($sourceImage, $degrees, 0);
    }
    imagecopyresampled($newImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
    imagedestroy($sourceImage); // free memory

    if ($sWatermark) {
      // compose watermark
      list($WaterMarkWidth, $WaterMarkHeight) = getimagesize($sWatermark);
      $placementX = $newWidth - $WaterMarkWidth;
      $placementY = $newHeight - $WaterMarkHeight;
      $sWatermarkImage = imagecreatefrompng($sWatermark);
      imagealphablending($newImage, TRUE);
      imagealphablending($sWatermarkImage, TRUE);
      imagecopy($newImage, $sWatermarkImage, $placementX, $placementY, 0, 0, $WaterMarkWidth, $WaterMarkHeight);
    }
    switch ($imageType) {
      case "image/gif":
        imagegif($newImage, $targetAbsoluteFile);
        break;
      case "image/pjpeg":
      case "image/jpeg":
      case "image/jpg":
        imagejpeg($newImage, $targetAbsoluteFile, 90);
        break;
      case "image/png":
      case "image/x-png":
        imagepng($newImage, $targetAbsoluteFile);
        break;
    }
    chmod($targetAbsoluteFile, 0777);

    $storedDimensions = array('width' => $newWidth, 'height' => $newHeight);

    return $storedDimensions;
  }

  public function getPhoto($sPhotoID)
  {
    global $wpdb;
    return $wpdb->get_row("SELECT * FROM impressions_gallery_photos WHERE id = '{$sPhotoID}'", ARRAY_A);
  }

  public function getFirstPhoto($sObjectID)
  {
    global $wpdb;
    if (!$sObjectID) $sObjectID = $this->ID;
    $sPath = $wpdb->get_var("SELECT photoPath FROM impressions_gallery_photos WHERE objectId = '{$sObjectID}' AND isDeleted = '0' ORDER BY `num` ASC, `id` ASC LIMIT 0,1");
    //if (!file_exists($_SERVER['DOCUMENT_ROOT'] . '/' . $sPath) || !$sPath) return $this->defaultPhotoPath;
    if (!$sPath) return $this->defaultPhotoPath;
    else return $sPath;
  }

  public function getFirstPublicPhoto($sObjectID)
  {
    global $wpdb;
    if (!$sObjectID) $sObjectID = $this->ID;
    return $wpdb->get_var("SELECT photoPath FROM impressions_gallery_photos WHERE objectId = '{$sObjectID}' AND isDeleted = '0' ORDER BY `num` ASC, `id` ASC LIMIT 0,1");
  }

  public function getNewPhotoData($ID)
  {
    global $wpdb;
    return $wpdb->get_row("SELECT * FROM impressions_gallery_photos WHERE id = '{$ID}'", ARRAY_A);
  }

  public function sortPhotos($sObjectID)
  {
    global $wpdb;
    $aPhStr = explode(",", $_POST['photoOrder']);
    if (is_array($aPhStr)) {
      $aIDs = array();
      foreach ($aPhStr as $NUM => $val) {
        list($trash, $ID) = split("_", $val);
        $q = "UPDATE impressions_gallery_photos SET num = '{$NUM}' WHERE id = '{$ID}'";
        $wpdb->query($q);
      }
      echo "Sort complete.";
    }
  }
}