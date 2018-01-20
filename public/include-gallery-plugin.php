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
    if ((@$_GET['post'] && @$_GET['action'] == 'edit') || ($_GET['page']== 'impressions_gallery_v2' && @$_GET['galleryID'])) {
        add_action('admin_head', 'impressions_gallery_v2_admin_scripts');
    }

    add_action('save_post', 'save_impressions_gallery_v2');
}

function save_impressions_gallery_v2()
{
    require_once('classes/uploadified.class.php');

    global $oUploadifiedR;
    $oUploadifiedR = new UploadifiedR;
    $oUploadifiedR->saveGallery();
}

function impressions_gallery_v2_admin_scripts()
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

    if (get_the_ID()) {
        add_meta_box('uploadified_metabox_photos_R', 'Impressions Gallery v2', 'uploadified_meta_photos_R', 'post', 'normal', 'high');
    }

}

function uploadified_meta_photos_R()
{
    global $oUploadifiedR;
    require_once('php-includes/gallery-meta-box.php');
}

function uploadified_meta_debug_R()
{
    global $wpdb;
    $realty_fields = $wpdb->get_results("SHOW COLUMNS FROM impressions_gallery_photos", ARRAY_A);
    $fields = array();
    if (is_array($realty_fields)) foreach ($realty_fields as $f) {
        echo $f['Field'] . ' <span style="color:#ccc">' . $f['Type'] . "</span><br />";
    }
}

add_action('admin_menu', 'uploadified_gallery_details_menu_R');
function uploadified_gallery_details_menu_R()
{
    add_menu_page('I-Gallery v2', 'I-Gallery v2', 'manage_options', 'impressions_gallery_v2', 'impressions_gallery_v2_tools_page');
}

function impressions_gallery_v2_tools_page()
{
    global $wpdb;
    if (isset($_GET['galleryID'])) {
        $galleryID = intval($_GET['galleryID']);
        $oPost = get_post($galleryID);
        require_once('php-includes/gallery-tools-page.php');
    } else {
      show_gallery_tools();
      handle_gallery_tools();
    }
}

function show_gallery_tools() {
  ?>
  <form method="post">
    <p>After deleting pictures their files are not actually removed, but marked as deleted in the database instead - the last option after deleting image by mistake.</p>
    <p>To free up some space from potentially dead images please use the function below. This will clean files as well as database.</p>
    <button name="truncateDeletedPhotos" value="truncateDeletedPhotos">Cleanup Image Directories</button>
  </form>
  <?php
}
function handle_gallery_tools() {
  global $wpdb;

  if (isset($_POST) && isset($_POST['truncateDeletedPhotos'])) {
    $a_bytes = 0;
    $a_count = 0;
    $deletedPhotos = $wpdb->get_results("SELECT * FROM impressions_gallery_photos WHERE isDeleted = 1",ARRAY_A);
    if (is_array($deletedPhotos) && count($deletedPhotos) > 0) foreach ($deletedPhotos as $a) {
      $delPath = $_SERVER['DOCUMENT_ROOT'] . $a['photoPath'];
      $a_bytes += filesize($delPath);
      $a_count++;
      // delete file
      if (file_exists($delPath)) {
        unlink($delPath);
        echo 'X ';
      } else {
        echo 'E ';
      }
      // delete db entry
      $wpdb->query("DELETE FROM impressions_gallery_photos WHERE `id` = '{$a['id']}'");
    }
    // echo 'Space saved: ' . round($a_bytes / 1048576, 2) . ' MiB ('.$a_count.' items deleted)<br />';

    $dirToScan = $_SERVER['DOCUMENT_ROOT'] . '/galleries';
    $dirContents = scandir($dirToScan);
    foreach ($dirContents as $dirItem) {
      if (preg_match('|^\d+$|Uis', $dirItem)) {
        // is gallery dir
        $files = scandir($dirToScan . '/' . $dirItem);
        if (is_array($files) && count($files) > 0) {
          foreach ($files as $fileName) {
            if ($fileName == '.' || $fileName == '..') {
              continue;
            }
            $filePartialPath = '/galleries/' . $dirItem . '/' . $fileName;
            $fileCheckOnDB = $wpdb->get_results("SELECT * FROM impressions_gallery_photos WHERE `photoPath` = '{$filePartialPath}'", ARRAY_A);
            if (!is_array($fileCheckOnDB) || count($fileCheckOnDB) == 0) {
              // echo "-- File <strong>{$filePartialPath}</strong> is not in DB!<br />";
              echo 'X ';
              $delPath = $_SERVER['DOCUMENT_ROOT'] . '/galleries/' . $dirItem . '/' . $fileName;
              unlink($delPath);
              $a_bytes += filesize($delPath);
              $a_count++;
            } else {
              // echo "File <strong>{$filePartialPath}</strong> is stored in DB!<br />";
              echo '_ ';
            }
          }
        }
      }
    }
    echo '<br /><br />Space saved: ' . round($a_bytes / 1048576, 2) . ' MiB ('.$a_count.' items deleted)<br />';
    // remove empty records, created by WP autosave.
    // $wpdb->query("DELETE FROM impressions_galleries WHERE `title` ='' AND `description` = '' AND `story` = ''");
  }
}