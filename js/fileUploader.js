/**
 * FileReader Constructor
 * @param _fileData
 * @constructor
 */
function FileUploader(_fileData,_table){
    var self = this;

    self.reader = _fileData;
    self.table = _table;

    if (window.File && window.FileList && window.FileReader){
        self.init();
    }
}

/**
 * this function will select the file
 * @param e
 */
FileUploader.prototype.fileSelectHandler = function(e) {

    var self = this;
    console.log(e);

    // cancel event and hover styling
    self.fileDragHover(e);

    // fetch FileList object
    var files = e.target.files || e.dataTransfer.files;

    console.log("files" + files[0]);

    // process all File objects
    self.streamFile(files[0]);
};

FileUploader.prototype.streamFile = function(file) {

    var self = this;
    var data;

    //Todo: following logic needs to be changed for large files (look for node.js examples)
    if (file.type.indexOf("text") == 0) {
        self.reader = new FileReader();
        self.reader.onload = function(e) {
            data = self.reader.result;
            //this will initialize the new separator modal
            if(self.separatorModal == null) {
                self.separatorModal = new SeparatorModal(data, file);
            }
            else {
                self.separatorModal.reload(data, file);
            }
        }
        self.reader.readAsText(file);
    }
};

// file drag hover
FileUploader.prototype.fileDragHover = function(e) {

    var self = this;

    e.stopPropagation();
    e.preventDefault();
    e.target.className = (e.type == "dragover" ? "hover" : "");
};



/**
 * Initialize function of File Reader
 */
FileUploader.prototype.init = function() {
    var self = this;

    //taking up the
    var fileselect = $id("fileselect");
    var filedrag = $id("filedrag");
    var submitbutton = $id("submitbutton");

    // file select
    fileselect.addEventListener("change", self.fileSelectHandler.bind(self), false);

    // is XHR2 available?
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
