<?php
	class UploadifiedPhotosR {
		public function __construct($ID) {
			$this->ID = $ID;
			$this->defaultPhotoPath = '/photo-content/no-photo.jpg';
		}
		public function getPhotos() {
			global $wpdb;
			$aPhotos = $wpdb->get_results("SELECT * FROM uploadified_photos WHERE object_id = '{$this->ID}' AND is_deleted = '0' ORDER BY `num` ASC, `id` ASC", ARRAY_A);
			return $aPhotos;
		}
		public function getPhotosIDs() {
			global $wpdb;
			$aPhotos = $wpdb->get_results("SELECT `id` FROM uploadified_photos WHERE object_id = '{$this->ID}' AND is_deleted = '0' ORDER BY `num` ASC, `id` ASC", ARRAY_A);
			$aIDs = array();
			if (count($aPhotos) > 0) foreach ($aPhotos as $a) {
				$aIDs[] = $a['id'];
			}
			return $aIDs;
		}
		public function uploadPhoto($iObjectID) {
			ini_set('memory_limit','512M');
            $responseData = array();
			if (!empty($_FILES) && $iObjectID > 0) {
				$tempFile = $_FILES['file']['tmp_name'];
				
				//$targetPath = $_SERVER['DOCUMENT_ROOT'] . $_REQUEST['folder'] . '/';
				
				$sWatermark = $_SERVER['DOCUMENT_ROOT'] . '/wp-content/plugins/uploadified-gallery/watermarks/impressions-watermark.png';
				
				$targetPath = $_SERVER['DOCUMENT_ROOT'] . '/photo-content/' . $iObjectID. '/';
				if (!is_dir($targetPath)) {
					mkdir(str_replace('//','/',$targetPath), 0755, true);
				}
				$time = time();
				$targetFile =  str_replace('//','/',$targetPath) . $iObjectID . '_'. $time . '_' . rand(0,9);
				
				$fileTypes  = 'jpg|gif|png|jpeg';
				$typesArray = explode('|',$fileTypes);
				$fileParts  = pathinfo($_FILES['file']['name']);
				
				if (in_array(strtolower($fileParts['extension']),$typesArray)) {
					// Uncomment the following line if you want to make the directory if it doesn't exist
					// mkdir(str_replace('//','/',$targetPath), 0755, true);
					$targetFile .= '.' . strtolower($fileParts['extension']);
					
					move_uploaded_file($tempFile,$targetFile);
					$sRelativeOriginalPath = str_replace($_SERVER['DOCUMENT_ROOT'],'',$targetFile);
					//$sWatermarkedCopyPath = preg_replace('|nt-originals|Uis','nt-photos',$sourceFile);
					
					$this->resizeSavedPhoto($sRelativeOriginalPath,$sRelativeOriginalPath,$sWatermark);
					$iNewPhotoID = $this->savePhotoData($iObjectID,$sRelativeOriginalPath);
                    $responseData['uploadedPhoto'] = $this->getNewPhotoData($iNewPhotoID );
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
		public function savePhotoData($iObjectID,$originalFile) {
			global $wpdb;
			$wpdb->query("INSERT INTO uploadified_photos (id,object_id,photo_path,is_deleted,is_public) VALUES ('','{$iObjectID}','{$originalFile}','0','1')");
			return mysql_insert_id();
		}
		public function deletePhoto($sPhotoID) {
			global $wpdb;
			$wpdb->query("UPDATE uploadified_photos SET is_deleted = 1 WHERE id = '{$sPhotoID}'");
            $responseData['allPhotos'] = $this->getPhotos();
		}
		public function deletePhotos() {
			global $wpdb;
			$wpdb->query("UPDATE uploadified_photos SET is_deleted = 1 WHERE object_id = '{$this->ID}'");
		}
		public function updatePhotoInfo($aData) {
			global $wpdb;
		}
		public function resizeSavedPhoto($sourceFile,$targetFile,$sWatermark = false) {
			$sourceAbsoluteFile = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'] . '/' . $sourceFile);
			$targetAbsoluteFile = str_replace('//','/',$_SERVER['DOCUMENT_ROOT'] . '/' . $targetFile);

			// maxw 960?
			$newHeight = 960;
			// maxh 720?
			list($origWidth, $origHeight, $origType) = getimagesize($sourceAbsoluteFile);
			$imageType = image_type_to_mime_type($origType);
			
			if ($newHeight < $origHeight) {
				$scale = $newHeight / $origHeight;
				//echo 'Scaling ratio: ' . $scale;
			} else {
				$scale = 1;
				//return;
			}
			
			$newWidth = ceil($origWidth * $scale);
			$newHeight = ceil($origHeight * $scale);
			
			$newImage = imagecreatetruecolor($newWidth,$newHeight);
			switch($imageType) {
				case "image/gif":
					$sourceImage=imagecreatefromgif($sourceAbsoluteFile); 
					break;
				case "image/pjpeg":
				case "image/jpeg":
				case "image/jpg":
					$sourceImage=imagecreatefromjpeg($sourceAbsoluteFile); 
					break;
				case "image/png":
				case "image/x-png":
					$sourceImage=imagecreatefrompng($sourceAbsoluteFile); 
					break;
				default:
					break;
			}
			imagecopyresampled($newImage,$sourceImage,0,0,0,0,$newWidth,$newHeight,$origWidth,$origHeight);
			if ($sWatermark) {
				// compose watermark
				list($WaterMarkWidth,$WaterMarkHeight) = getimagesize($sWatermark);
				$placementX = $newWidth - $WaterMarkWidth;
				$placementY = $newHeight- $WaterMarkHeight;
				$sWatermarkImage = imagecreatefrompng($sWatermark);
				imagealphablending($newImage, TRUE);
				imagealphablending($sWatermarkImage, TRUE);
				imagecopy($newImage, $sWatermarkImage, $placementX, $placementY, 0, 0, $WaterMarkWidth, $WaterMarkHeight);
				
			}
			switch($imageType) {
				case "image/gif":
					imagegif($newImage,$targetAbsoluteFile); 
					break;
				case "image/pjpeg":
				case "image/jpeg":
				case "image/jpg":
					imagejpeg($newImage,$targetAbsoluteFile,90); 
					break;
				case "image/png":
				case "image/x-png":
					imagepng($newImage,$targetAbsoluteFile);  
					break;
			}
			chmod($targetAbsoluteFile, 0777);
		}
		public function getPhoto($sPhotoID) {
			global $wpdb;
			return $wpdb->get_row("SELECT * FROM uploadified_photos WHERE id = '{$sPhotoID}'",ARRAY_A);
		}
		public function getFirstPhoto($sObjectID) {
			global $wpdb;
			if (!$sObjectID) $sObjectID = $this->ID;
			$sPath = $wpdb->get_var("SELECT photo_path FROM uploadified_photos WHERE object_id = '{$sObjectID}' AND is_deleted = '0' ORDER BY `num` ASC, `id` ASC LIMIT 0,1");
			//if (!file_exists($_SERVER['DOCUMENT_ROOT'] . '/' . $sPath) || !$sPath) return $this->defaultPhotoPath;
			if (!$sPath) return $this->defaultPhotoPath;
			else return $sPath;
		}
		public function getFirstPublicPhoto($sObjectID) {
			global $wpdb;
			if (!$sObjectID) $sObjectID = $this->ID;
			return $wpdb->get_var("SELECT photo_path FROM uploadified_photos WHERE object_id = '{$sObjectID}' AND is_deleted = '0' ORDER BY `num` ASC, `id` ASC LIMIT 0,1");
		}
		public function getNewPhotoData($ID) {
            global $wpdb;
            return $wpdb->get_row("SELECT * FROM uploadified_photos WHERE id = '{$ID}'",ARRAY_A);
        }
		public function showNewPhoto($ID) {
			global $wpdb;
			$photo = $wpdb->get_row("SELECT * FROM uploadified_photos WHERE id = '{$ID}'",ARRAY_A);
			echo '<div class="photo-item" id="photo_'.$ID.'">';
			echo '<a href="/photo.php?src='.urlencode($photo['photo_path']).'&zc=0&h=480&q=90" class="fancybox" rel="group" id="impression_'.$ID.'"><img src="/photo.php?src='.urlencode($photo['photo_path']).'&zc=1&w=80&h=80&q=100&s=1" /></a>';
			echo '<div class="delete-photo"><a href="#" rel="'.$ID.'">&nbsp;</a></div>';
			echo '</div>';
		}
		public function sortPhotos($sObjectID) {
			global $wpdb;
			$aPhStr = explode(",",$_POST['photoOrder']);
			if (is_array($aPhStr)) {
				$aIDs = array();
				foreach ($aPhStr as $NUM=>$val) {
					list($trash,$ID) = split("_",$val);
					$q = "UPDATE uploadified_photos SET num = '{$NUM}' WHERE id = '{$ID}'";
					$wpdb->query($q);
				}
				echo "Sort complete.";
			}
		}
	}