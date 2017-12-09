<?php
/*
Plugin Name: Include Gallery
Plugin URI: http://www.include.lt
Description: Gallery per single post. Multi upload capability straight from your mobile device.
Version: 2.0
Author: Gediminas Ginkevicius
Tags: 
Author URI: http://www.include.lt
License: UNLICENSED
*/

add_action('admin_init', 'include_gallery_init_R');

function include_gallery_init_R()
{
  add_action('admin_head', 'include_gallery_admin_scripts_R');
  add_action('save_post', 'save_uploadified_gallery_R');
}

function save_uploadified_gallery_R()
{
  require_once('classes/uploadified.class.php');

  global $oUploadifiedR;
  $oUploadifiedR = new UploadifiedR;
  $oUploadifiedR->saveGallery();
}

function include_gallery_admin_scripts_R()
{
  require_once('classes/uploadified.class.php');

  global $oUploadifiedR;
  $oUploadifiedR = new UploadifiedR;

  $htmlFile = file_get_contents(dirname(__FILE__) . '/index.html');
  $jsFileName = '';
  if (preg_match('|src=\"/static/js/(main\.[0-9a-z]+\.js)\"|Uis', $htmlFile, $res)) {
    $jsFileName = $res[1];
    wp_register_script('uploadified_admin_js_general_R', plugins_url("static/js/{$jsFileName}", __FILE__));
    wp_enqueue_script('uploadified_admin_js_general_R');
    wp_register_style('uploadified_admin_css_icons_R', 'https://fonts.googleapis.com/icon?family=Material+Icons');
    wp_enqueue_style('uploadified_admin_css_icons_R');
  }
  // wp_register_style( 'uploadified_admin_css_general', plugins_url('build/static/css/uploadified.css', __FILE__) );

  uploadified_meta_boxes_R();
}

function uploadified_meta_boxes_R()
{
  require_once('classes/uploadified.class.php');

  global $oUploadifiedR;
  $oUploadifiedR = new UploadifiedR;
  $oUploadifiedR->loadByID(get_the_ID());

  if (@$oUploadifiedR->aData['id'] > 0) {
    add_meta_box('uploadified_metabox_photos_R', 'Gallery Photos [R]', 'uploadified_meta_photos_R', 'post', 'normal', 'high');
  }

}

function uploadified_meta_photos_R()
{
  global $oUploadifiedR;
  require_once('php-includes/uploadified-meta-photos.php');
}

function uploadified_meta_debug_R()
{
  global $wpdb;
  $realty_fields = $wpdb->get_results("SHOW COLUMNS FROM uploadified_photos", ARRAY_A);
  $fields = array();
  if (is_array($realty_fields)) foreach ($realty_fields as $f) {
    echo $f['Field'] . ' <span style="color:#ccc">' . $f['Type'] . "</span><br />";
  }
}

add_action('admin_menu', 'uploadified_gallery_details_menu_R');
function uploadified_gallery_details_menu_R()
{
  add_menu_page('Gallery Tools [R]', 'Gallery Tools [R]', 'manage_options', 'uploadified_details_editor_R', 'uploadified_gallery_tools_page_R');
}

function uploadified_gallery_tools_page_R()
{
  global $wpdb;
  if (isset($_GET['galleryID'])) {
    $galleryID = intval($_GET['galleryID']);
    $oPost = get_post($galleryID);
    require_once('php-includes/gallery-tools-meta-editor.php');
  }
}