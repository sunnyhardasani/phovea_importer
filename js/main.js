requirejs.config({
    paths:{
        "jquery": "../bower_components/jquery/dist/jquery.min",
        "bootstrap": "../bower_components/bootstrap/dist/js/bootstrap.min",
        "d3": "../bower_components/d3/d3",
        "colorbrewer": "../bower_components/colorbrewer/colorbrewer",
        "d3-tip": "../bower_components/d3-tip/index",
        "jquery-resizable-columns": "../bower_components/jquery-resizable-columns/dist/jquery.resizableColumns.min",
        "store": "../bower_components/store/store.min"
    },
    shim: { d3Tip: ['d3']}
});

define(["require","utility","fileUploader","fileConfiguration"],function (require) {

    // requireJS will ensure that the FileUploader, FileConfiguration definition is available
    // to use, we can now import it for use.
    var FileUploader = require('fileUploader');
    var FileConfiguration = require('fileConfiguration');

    //this will initialize the file uploader
    var fileData = {};
    var fileUploader = new FileUploader(fileData,null);

    //on the start of the application load the file configuration instance
    //this will initialize the file configuration data, attach all the UI
    //relation operations and load the already read files from the local
    //machines
    var fileConfigurationInst = new FileConfiguration();
    fileConfigurationInst.init();

    $("#main").toggle();

    //todo move in the new function to initialize UI
    $("#open-configuration-window").click(function(){
        $("#main").toggle();
        $(".box").toggle();
    });

    $("#save-conf-button").click(function(){
        self.saveConfiguration();
    });
});