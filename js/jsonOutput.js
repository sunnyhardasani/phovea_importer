//////////////////////////////////////////////////////
// JSON Output File to handle output from the class //
//////////////////////////////////////////////////////

/**
 * Main function of this class called when JSON Output
 * button is clicked
 * @param _data
 * @param _parentInstance
 * @constructor
 */

function JSONOutput(_data,_parentInstance){
    var self = this;

    //initializing the local variable
    self.data = _data;

    self.parentInstance = _parentInstance;
    self.columns = [];

    //load file data and call initialize
    self.init();
}

/**
 * This function will get initialized when this class
 * start from the constructor
 */
JSONOutput.prototype.init = function(){

    var self = this;

    self.readData();
    self.addFileInfo();
    self.addAllColumns();

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


    //once all the col details are filled save the object to main file
    self.saveObjectToFile();
}

JSONOutput.prototype.readData = function(){

    var self = this;

    for(key in self.data){

        //fetching the required type and converting it to new structure
        var col             = self.data[col];
        var dataTypeObj     = self.data["dataTypeObj"];
        var id              = col["id"];
        var colId           = col["colId"];
        var data            = col["data"];

        //1. create new data type required for the output
        //2. add self.addnewCol() and send the data type object to it

    }
}

JSONOutput.prototype.addNewCol = function( id, colId, dataType){

    var self = this;

    // approach:
    // first check the type of the data type
    // for data type think about the colorscale too
    // todo add the similar color scale in the data
    // wrangler class to read over here
    // create object required to insert in the column

    //add the data type object in the columns
    if(!self.columns.hasOwnProperty()){
        self.columns.push({
            id : id,
            col_id: colId,
            data_type: dataType//todo new object of the data type calculated above goes over here
        })
    }
}