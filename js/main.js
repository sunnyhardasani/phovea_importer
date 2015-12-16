require.config({
    paths:{
        "jquery": "bower_components/jquery/dist/jquery.min",
        "bootstrap": "bower_components/bootstrap/dist/js/bootstrap.min",
        "d3": "bower_components/d3/d3",
        "colorbrewer": "bower_components/colorbrewer/colorbrewer",
        "d3-tip": "bower_components/d3-tip/index",
        "jquery-resizable-columns": "bower_components/jquery-resizable-columns/dist/jquery.resizableColumns",
        "store": "bower_components/store/store.min"
    }
});
/*

require(["fileUploader"],function(FileUploader) {
    console.log("its working");
    console.log(FileUploader);

    var fileData = {};
    new FileUploader(fileData, null);
})
*/

    /*console.log(FileUploader);
    //this will initialize the file uploader
    /!*var fileUploader = *!/*//*
});

/*
(function () {

    function init(){
        var fileData = {};
        //this will initialize the file uploader
        var fileUploader = new FileUploader(fileData,null, this);

        //on the start of the application load the file configuration instance
        //this will initialize the file configuration data, attach all the UI
        //relation operations and load the already read files from the local
        //machines
        var fileConfigurationInst = new FileConfiguration();
        fileConfigurationInst.init();
    }

    //this will call the init function
    init();
})();
*/


/**
 *  TODO - Approach for change to the main application:
 *
 *  main image of the application is whenever the file
 *  is loaded it will read the data show the initial data
 *  of the file
 *
 *  application will ask the user to change the data accordingly
 *  and then on click save the data will get loaded on the server
 *
 *  user should be given an option to save all the data in the
 *  json object or only the meta data information is enough
 *
 */