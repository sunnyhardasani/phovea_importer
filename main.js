/**
 * Created by Samuel Gratzl on 07.01.2016.
 */

define(['exports', 'text!./xImporterTemplate.html', 'text!./style.css', '../caleydo_bootstrap_fontawesome/dialogs', '../caleydo_core/main', './js/fileUploader', './js/fileConfiguration', 'bootstrap'],
  function (exports, template, style, dialogs, C, fileUploader, fileConfiguration) {
    function ImporterWizard(parent, callback, options) {
      this.options = C.mixin({

      }, options);
      callback = callback || C.noop;

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
      this.fileUploaderIns = fileUploader.create(this.root);
      this.fileConfigurationIns = fileConfiguration.create(this.root);

      // this will initialize the file uploader
      var fileData = {};
      this.fileUploaderIns.init(fileData, null);

      // on the start of the application load the file configuration instance
      // this will initialize the file configuration data, attach all the UI
      // relation operations and load the already read files from the local
      // machines
      this.fileConfigurationIns.init();
    }

    ImporterWizard.prototype.save = function() {
      return this.fileConfigurationIns.save();
    };

    exports.create = function (parent, callback, options) {
      return new ImporterWizard(parent, callback, options);
    };
    exports.openDialog = function (options) {
      return new Promise(function(resolve) {
        var dialog = dialogs.generateDialog('Import Data', 'Import');
        function done(result) {
          dialog.destroy();
          resolve(result);
        }
        dialog.body.parentElement.parentElement.style.width = '60%';
        var importer = exports.create(dialog.body, done, options);

        dialog.onHide(function() {
          resolve(importer.save());
          dialog.destroy();
        });
        dialog.show();
      })
    }
});
