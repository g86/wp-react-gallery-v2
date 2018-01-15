<?php
//require_once('classes/realty.class.php');
require_once(dirname(__FILE__) . '/' . 'photos.class.php');

class UploadifiedR
{
  public function __construct($autoload = true)
  {
    $this->ID = get_the_ID();
    $this->aData = array();

    if ($autoload == true) $this->loadByID($this->ID);

    $this->oPhotos = new UploadifiedPhotosR($this->ID);

    $this->aTempCols = array();
    $this->sTempID = 0;
  }

  public function getValue($field)
  {
    if (isset($this->aData[$field])) return $this->aData[$field];
    else return '';
  }

  public function getGallery()
  {
    return $this->aData;
  }

  public function loadByID($ID = 0, $return = false)
  {
    global $wpdb;
    $this->aData = $wpdb->get_row("SELECT * FROM impressions_galleries WHERE id = '{$ID}'", ARRAY_A);
    $this->ID = $ID;
    $this->oPhotos = new UploadifiedPhotosR($this->ID);
    if ($return == true) return $this->aData;
  }

  public function saveGallery()
  {
    global $wpdb;
    //print_r($_POST); exit;
    $aGallery = array(
      'id' => $_POST['ID'],
      'mapZoomLevel' => @$_POST['mapZoomLevel']
    );

    $iGalleryExists = $wpdb->get_var("SELECT COUNT(id) FROM impressions_galleries WHERE `id` = '{$_POST['ID']}'");
    if ($iGalleryExists > 0) {
      // update
      $sValues = "";
      foreach ($aGallery as $k => $v) {
        if ($k == 'ID') continue;
        $aValues[] = "`" . $k . "`='" . $v . "'";
      }
      $q = "UPDATE impressions_galleries SET " . implode(",", $aValues) . " WHERE id = '{$_POST['ID']}'";
    } else {
      $q = "INSERT INTO impressions_galleries (`" . implode("`,`", array_keys($aGallery)) . "`) VALUES ('" . implode("','", $aGallery) . "')";
    }

    $wpdb->query($q);
  }

  public function deleteGallery($iGalleryID)
  {
    global $wpdb;
    $sizeMiB = $this->deleteGalleryPhotos($iGalleryID);
    $wpdb->query("DELETE FROM impressions_galleries WHERE `id` = '{$iGalleryID}'");
    if (is_dir($_SERVER['DOCUMENT_ROOT'] . '/galleries/' . $iGalleryID . '')) {
      rmdir($_SERVER['DOCUMENT_ROOT'] . '/galleries/' . $iGalleryID . '');
    }
    //echo "size(MB): " . $sizeMiB."<br />";
  }

  private function deleteGalleryPhotos($iGalleryID)
  {
    global $wpdb;
    $a_bytes = 0;
    $a_count = 0;
    $delPhotos = $wpdb->get_results("SELECT * FROM impressions_gallery_photos WHERE objectId = '{$iGalleryID}'", ARRAY_A);
    if (is_array($delPhotos) && count($delPhotos) > 0) foreach ($delPhotos as $a) {
      $delPath = $_SERVER['DOCUMENT_ROOT'] . $a['photoPath'];
      //echo $delPath . '<br />';

      $a_bytes += filesize($delPath);
      $a_count++;
      // delete file
      if (file_exists($delPath)) {
        unlink($delPath);
      }
      // delete db entry
      $wpdb->query("DELETE FROM impressions_gallery_photos WHERE `id` = '{$a['id']}'");
    }
    return round($a_bytes / 1048576, 2);
  }
}