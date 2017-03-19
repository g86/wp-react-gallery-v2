<script type="text/javascript">
    window.activePostId = <?php echo intval($_GET['galleryID']); ?>;
    window.uploadUrl = '<?php echo '/wp-content/plugins/include-gallery/api.php?action=upload'; ?>';
    window.photosUrl = '<?php echo '/wp-content/plugins/include-gallery/api.php?action=photos&referenceID=' . intval($_GET['galleryID']); ?>';
</script>

<div class="wrap">
    <div class="icon32" id="icon-tools"><br></div>
    <h2>Editing: <?php echo $oPost->post_title; ?>
        <a class="add-new-h2"
           href="/wp-admin/post.php?post=<?php echo $oPost->ID; ?>&action=edit">
            Back to Post
        </a>
    </h2>

    <div class="tool-box">
        <!-- for react app -->
        <div id="mountIncludeGallery"></div>
    </div>
</div>