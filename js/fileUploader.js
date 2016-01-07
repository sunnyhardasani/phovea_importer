/**
 * This class is responsible for file uploading
 * to the application either through drag and
 * drop or through select file.
 */

define(["jquery", "./dataWrangler","./utility/localSettings","./fileConfiguration"],
    function ($,dataWrangler,settings,fileConfiguration) {
    "use strict";

        console.log(dataWrangler);

    var INITIAL_START_BYTE = settings.localSettings().INITIAL_START_BYTE;
    var INITIAL_END_BYTE = settings.localSettings().INITIAL_END_BYTE;

    /**
     * Constructor whether instance is null or
     * not, if null then throw error
     * @constructor
     */
    function FileUploader(root){
      this.root = root;
      this.$root = $(root);
    }

    FileUploader.prototype.$id = function(id) {
      return this.root.querySelector('#' + id);
    };
    FileUploader.prototype.initUI = function() {
        var self = this;

        this.$root.find("#tool-id-button").bind("click",function(){
            //alert("ui called");
            self.$root.find( "#oprButtons" ).toggleClass( "hide" );
            self.$root.find( "#topLeftOperations" ).toggleClass( "hide" );
            self.$root.find( "#leftOperations" ).toggleClass( "hide" );
            self.$root.find( "#topOperations" ).toggleClass( "hide" );
            self.$root.find( "#importedTable" ).toggleClass( "col-md-10", "col-md-12" );
        });

        this.$root.find("#tool-id-button").trigger("click");

        //$('[data-toggle="tooltip"]').tooltip();
    }
    /**
     * Initialize function of File Uploader
     * @param _fileData
     * @param _table
     */
    FileUploader.prototype.init = function(_fileData,_table) {
        var self = this;

        //make the data global
        self.reader = _fileData;
        self.table = _table;

        //taking required html element
        var fileselect = this.$id("fileselect");
        var filedrag = this.$id("filedrag");
        var submitbutton = this.$id("submitbutton");

        // file select
        fileselect.addEventListener("change", self.fileSelectHandler.bind(self), false);

        // is XHR2 available
        var xhr = new XMLHttpRequest();
        if (xhr.upload) {

            // file drop
            filedrag.addEventListener("dragover", self.fileDragHover.bind(self), false);
            filedrag.addEventListener("dragleave", self.fileDragHover.bind(self), false);
            filedrag.addEventListener("drop", self.fileSelectHandler.bind(self), false);
            filedrag.style.display = "block";

            // remove submit button
            submitbutton.style.display = "none";
        }
    };

    /**
     * this function will select the file
     * @param e
     */
    FileUploader.prototype.fileSelectHandler = function(e) {

        var self = this;

        // cancel event and hover styling
        self.fileDragHover(e);

        // fetch FileList object
        self.files = e.target.files || e.dataTransfer.files;

        //call the file configuration instance and
        //add the new file to the file configuration
        //var fileConfigInst = new FileConfiguration();
        //fileConfigInst.addNewFile(self.files[0]);

        // process all File objects
        self.streamFile(self.files[0], INITIAL_START_BYTE, INITIAL_END_BYTE);
    };

    /**
     *  this function will read the next frame when the
     *  pagination reaches one of the last pages
     */
    FileUploader.prototype.streamNextFrame = function(){
        var self = this;
    }

    /**
     * Stream file will read the file from start byte to end byte
     * @param file
     * @param start_byte
     * @param end_byte
     */
    FileUploader.prototype.streamFile = function(file, start_byte, end_byte) {

        var self = this;

        // Reference for file reading in blocks:
        // http://www.html5rocks.com/en/tutorials/file/dndfiles/
        var start = parseInt(start_byte) || 0;
        var stop = parseInt(end_byte) || file.size - 1;
        var reader = new FileReader();

        // If we use onloadend, we need to check the readyState.
        reader.onloadend = function(evt) {
            if (evt.target.readyState == FileReader.DONE) {

                //read file data completely
                var data;
                self.file_data =  evt.target.result;

                // read data line by line
                if(self.file_data.lastIndexOf("\n")>0) {
                    data = self.file_data.substring(0, self.file_data.lastIndexOf("\n"));
                } else {
                    data = self.file_data;
                }

                // this function will call the file configuration
                // switch window to switch the window
                //fileConfiguration.switchWindow();

                // requireJS will ensure that the DataWrangler definition
                // is available to use, we can now import it for use.
                dataWrangler.reload(self.root, data, file, self);

                //this will initialize the ui
                self.initUI();
            }
        };

        var blob = file.slice(start, stop + 1);
        reader.readAsText(blob);
    };

    /**
     *
     * @param e
     */
    FileUploader.prototype.fileDragHover = function(e) {

        var self = this;

        e.stopPropagation();
        e.preventDefault();
        e.target.className = (e.type == "dragover" ? "hover" : "");
    };

    return {
      create: function(parent) {
        return new FileUploader(parent);
      }
    };
});
