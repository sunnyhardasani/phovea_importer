
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