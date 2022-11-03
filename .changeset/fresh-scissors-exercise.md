---
'cm4all-wp-bundle': patch
---

add support for @wordpress/preferences-persistence and @wordpress/preferences  

WordPress 6.1 adds 2 new NPM wordpress scoped packages 

- @wordpress/preferences-persistence
- @wordpress/preferences-persistence

see https://make.wordpress.org/core/2022/10/10/changes-to-block-editor-preferences-in-wordpress-6-1/

`import` statements referencing these packages will automatically transpiled to their matching `window.wp.` pendants by cm4all-wp-bundle