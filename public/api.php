<?php

define('IN_GALLERY_DEV_MODE', false);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  header('Access-Control-Allow-Origin : *');
  header('Access-Control-Allow-Methods : POST, GET, OPTIONS, PUT, DELETE');
  header('Access-Control-Allow-Headers : content-type,x-requested-with,x-api-key,X-ACCOUNT-API-KEY,X-USER-API-KEY,account_api_key,user_api_key,0');
  exit;
}
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Content-Type: application/json');

require_once(dirname(__FILE__) . '/../../../wp-load.php');
require_once(dirname(__FILE__) . '/classes/photos.class.php');
require_once(dirname(__FILE__) . '/classes/uploadified.class.php');

function endpoint_upload()
{
  $uploadInfo = array();
  $uploadInfo['fileName'] = $_POST['fileName'];
  $uploadInfo['fileType'] = $_POST['fileType'];

  $responseData = array();
  $responseData['uploadInfo'] = $_POST;
  $responseData['fileInfo'] = $_FILES;

// import WP PHP scripts


  if (!is_user_logged_in() && !IN_GALLERY_DEV_MODE) {
    die("Access denied.");
    $responseData['userInfo'] = 'Upload should not be permitted.';
  } else {
    $responseData['userInfo'] = 'User has right capabilities. All OK.';
  }

// import my photo scripts

  global $oUploadifiedPhotosR;

  $responseData['referenceID'] = intval($_POST['referenceID'], 10);

  $objectID = intval($_POST['referenceID'], 10);

  $fileInfo = array(
    'title' => $_POST['displayName'],
    'description' => $_POST['description'],
    'alt' => $_POST['alt']
  );

  if ($objectID > 0) {
    $oUploadifiedPhotosR = new UploadifiedPhotosR($objectID);
    $responseData = array_merge($responseData, $oUploadifiedPhotosR->uploadPhoto($objectID, $fileInfo));
  } else {
    $responseData['error'] = 'Reference ID is missing.';
  }

  echo json_encode($responseData);
}

function endpoint_photos()
{
  $objectID = intval($_GET['referenceID'], 10);
  $responseData = array();
  if ($objectID > 0) {
    $oUploadifiedPhotosR = new UploadifiedPhotosR($objectID);
    $responseData['galleryPhotos'] = $oUploadifiedPhotosR->getPhotos();
    $responseData['galleryMeta'] = $oUploadifiedPhotosR->getGallery();
  } else {
    $responseData['error'] = 'Reference ID is missing.';
  }

  echo json_encode($responseData);
}

function endpoint_delete()
{
  $photoID = intval($_POST['photoID'], 10);
  $responseData = array();

  if (!is_user_logged_in() && !IN_GALLERY_DEV_MODE) {
    die("Access denied.");
    $responseData['userInfo'] = 'Upload should not be permitted.';
  } else {
    $responseData['userInfo'] = 'User has right capabilities. All OK.';
  }

  if ($photoID > 0) {
    $oUploadifiedPhotosR = new UploadifiedPhotosR(0);
    $responseData = $oUploadifiedPhotosR->deletePhoto($photoID);
  } else {
    $responseData['error'] = 'Reference ID is missing.';
  }

  echo json_encode($responseData);
}

function endpoint_updateGallery() {
  if (!is_user_logged_in() && !IN_GALLERY_DEV_MODE) {
    die("Access denied.");
  } else {
    $oGalleries = new UploadifiedR(false);
    $oGalleries->saveGallery();
  }
}
function endpoint_voteGallery() {
  $oGalleries = new UploadifiedR(false);
  $responseData = array();
  $responseData['galleryMeta'] = array();
  $responseData['galleryMeta']['voteCount'] = $oGalleries->voteGallery();
  echo json_encode($responseData);
}

function endpoint_update()
{
  $photoID = intval($_POST['photoID'], 10);
  $photoInfo = array(
    'title' => $_POST['title'],
    'description' => $_POST['description'],
    'alt' => $_POST['alt'],
    'geo' => $_POST['geo'],
  );

  $responseData = array();

  if (!is_user_logged_in() && !IN_GALLERY_DEV_MODE) {
    die("Access denied.");
    $responseData['userInfo'] = 'Upload should not be permitted.';
  } else {
    $responseData['userInfo'] = 'User has right capabilities. All OK.';
  }

  if ($photoID > 0) {
    $oUploadifiedPhotosR = new UploadifiedPhotosR($photoID);
    $responseData = $oUploadifiedPhotosR->updatePhotoInfo($photoID, $photoInfo);
  } else {
    $responseData['error'] = 'Reference ID is missing.';
  }

  echo json_encode($responseData);
}

function endpoint_photo()
{
  $objectID = intval($_GET['referenceID'], 10);
  $photoID = intval($_GET['photoID'], 10);
  $responseData = array();
  if ($objectID > 0 && $photoID > 0) {
    $oUploadifiedPhotosR = new UploadifiedPhotosR($objectID);
    $responseData = $oUploadifiedPhotosR->getPhoto($photoID);
  } else {
    $responseData['error'] = 'Reference ID is missing.';
  }

  echo json_encode($responseData);
}

function endpoint_default()
{
  $responseData = array();
  $responseData['status'] = 'OK';
  $responseData['message'] = 'Default Endpoint';
  echo json_encode($responseData);
}

switch ($_GET['action']) {
  case "upload":
    endpoint_upload();
    break;
  case "delete":
    endpoint_delete();
    break;
  case "update":
    endpoint_update();
    break;
  case "updateGallery":
    endpoint_updateGallery();
    break;
  case "voteGallery":
    endpoint_voteGallery();
    break;
  case "photos":
    endpoint_photos();
    break;
  case "photo":
    endpoint_photo();
    break;
  default:
    endpoint_default();
    break;
}

