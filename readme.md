# WP Gallery Plugin
React based gallery plugin (admin part only). Gallery plugin which is WP independent implementation with it's own file location and little PHP api. 

## Plugin deployables
Files and folders: build, classes, php-includes, api.php, include-gallery-plugin.php

## How to deploy
I haven't created automatic installation for this plugin yet, however you may still use it if you follow the steps below:

- checkout the project
- `npm install` for installing dependencies
- `npm run build` to generate deployable files
- install `db/database-structure-v2.sql` onto your MySQL database
- create "include-gallery" in `[DOCUMENT_ROOT]/wp-content/plugins/`
- create "photo-content" in `[DOCUMENT_ROOT]/` on your server, you might need to modify permissions to allow files to be uploaded to it
- copy following files to "include-gallery" folder on the server: `build, classes, php-includes, api.php, include-gallery-plugin.php` 
- go to your WP admin panel, enable the plugin and good to go! 