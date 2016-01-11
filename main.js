/**
 * Created by Samuel Gratzl on 07.01.2016.
 */

define(['require', 'exports', 'text!./xImporterTemplate.html', 'text!./style.css', 'bootstrap', './js/fileUploader', './js/fileConfiguration'],
  function (require, exports, template, style) {
    function ImporterWizard(parent) {
      this.root = document.createElement('div');
      this.root.classList.add('importer');
      parent.appendChild(this.root);
      this.root = this.root.createShadowRoot();
      //deprecated this.root.applyAuthorStyles = true;
      this.root.innerHTML = template;

      var sstyle = document.createElement('style');
      var fullstyle = style;

      //import the styles that need to mapped also in the shadow dom as @imports
      var styles = [].slice.call(document.querySelectorAll('link[href$="/jquery-resizable-columns/dist/jquery.resizableColumns.css"], link[href$="bootstrap/dist/css/bootstrap.css"]'));
      styles.forEach(function(s) {
        fullstyle = '@import url("'+ s.href+'");\n' + fullstyle;
      });

      sstyle.innerText = fullstyle;
      this.root.insertBefore(sstyle, this.root.firstChild);

      // requireJS will ensure that the FileUploader,
      // FileConfiguration definition is available
      // to use, we can now import it for use.
      this.fileUploaderIns = require('./js/fileUploader').create(this.root);
      this.fileConfigurationIns = require('./js/fileConfiguration').create(this.root);

      // this will initialize the file uploader
      var fileData = {};
      this.fileUploaderIns.init(fileData, null);

      // on the start of the application load the file configuration instance
      // this will initialize the file configuration data, attach all the UI
      // relation operations and load the already read files from the local
      // machines
      this.fileConfigurationIns.init();
    }

    exports.create = function (parent) {
      return new ImporterWizard(parent);
    }
});
