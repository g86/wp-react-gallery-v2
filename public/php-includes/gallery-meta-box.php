<script type="text/javascript">
    window.activePostId = <?php echo intval($_GET['post']); ?>;
    window.uploadUrl = '<?php echo '/wp-content/plugins/include-gallery/api.php?action=upload'; ?>';
    window.updateUrl = '<?php echo '/wp-content/plugins/include-gallery/api.php?action=update'; ?>';
    window.deleteUrl = '<?php echo '/wp-content/plugins/include-gallery/api.php?action=delete'; ?>';
    window.photosUrl = '<?php echo '/wp-content/plugins/include-gallery/api.php?action=photos&referenceID=' . intval($_GET['post']); ?>';
</script>
<!-- for react app -->
<div id="mountIncludeGallery"></div>
<div class="in-gallery__footer">
  <a href="./admin.php?page=impressions_gallery_v2&galleryID=<?php echo intval($_GET['post']); ?>">Switch to GALLERY-ONLY-SCREEN</a>
</div>