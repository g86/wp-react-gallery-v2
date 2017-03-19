<script type="text/javascript">
	window.activePostId = <?php echo intval($_GET['post']); ?>;
	window.uploadUrl = '<?php echo '/wp-content/plugins/include-gallery/api.php?action=upload'; ?>';
	window.photosUrl = '<?php echo '/wp-content/plugins/include-gallery/api.php?action=photos&referenceID='.intval($_GET['post']); ?>';
</script>
<!-- for react app -->
<div id="mountIncludeGallery"></div>

<hr />
<a href="./admin.php?page=uploadified_details_editor_R&galleryID=<?php echo intval($_GET['post']); ?>">Gallery Edit Screen</a>