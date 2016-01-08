/**
 * Created by Samuel Gratzl on 07.01.2016.
 */

define(['require', 'exports', 'text!./xImporterTemplate.html', 'text!./style.css', 'bootstrap', './js/fileUploader', './js/fileConfiguration'],
  function (require, exports, template, style) {
    template = template.replace('STYLE_HACK',style);

    function ImporterWizard(parent) {
      this.root = document.createElement('div');
      this.root.classList.add('importer');
      parent.appendChild(this.root);
      this.root = this.root.createShadowRoot();
      this.root.applyAuthorStyles = true;
      this.root.innerHTML = template;
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
