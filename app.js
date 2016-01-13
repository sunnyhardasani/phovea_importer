/**
 *
 */

//define the main module having 4 dependencies: d3 (external library), caleydo main, caleydo data, and a header template for a common styling
define(['./main'], function (importer) {
  'use strict';

  importer.openDialog().then(function(json) {
    console.log(json);
  });
});
