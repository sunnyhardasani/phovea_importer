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
   /* self.addFileInfo();
    self.addAllColumns();*/

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
    /*self.saveObjectToFile();*/
}

JSONOutput.prototype.addFileInfo = function(){

}

JSONOutput.prototype.createDataTypeJSONObj = function(dataTypeObj){

}

JSONOutput.prototype.readData = function(){

    var self = this;

    var outColumnArray = [];
    console.log("hit");
    for(col in self.data) {
        console.log("hit");
        //fetching the required type and converting it to new structure
        var col = self.data[col];
        var dataTypeObj = col["dataTypeObj"];
        var data = col["data"];


        //taking the json output information
        var outId = col["id"];
        var outHeader = col["colId"];

        //for numerical data type
        if (dataTypeObj.type === "numerical") {
            var outNumericalDTType = {
                    type: dataTypeObj.type,
                    min: dataTypeObj.min,
                    max: dataTypeObj.max
                };
            outColumnArray.push({
                "id":outId,
                "header":outHeader,
                "datatype" : outNumericalDTType
            });
        }
        //for nominal data type
        else if(dataTypeObj.type === "nominal") {
            var outCategories = [];
            for(cat in dataTypeObj.keyCountMap){
                outCategories.push({
                    "name":cat,
                    "freq": dataTypeObj.keyCountMap[cat]
                });
            }
            var outNominalDTType = {
                    type: dataTypeObj.type,
                    categories:outCategories
            };
            outColumnArray.push({
                "id":outId,
                "header":outHeader,
                "datatype" : outNominalDTType
            });
        }
        //for string data type
        else if(dataTypeObj.type === "string") {
            var outStringDTType = {
                    type: dataTypeObj.type
            };
            outColumnArray.push({
                "id":outId,
                "header":outHeader,
                "datatype" : outStringDTType
            });
        }
        //for error data type
        else if(dataTypeObj.type === "error") {
            var outErrorDTType = {
                    type: dataTypeObj.type,
                    expected_type: dataTypeObj.baseType
            };
            outColumnArray.push({
                "id":outId,
                "header":outHeader,
                "datatype" : outErrorDTType
            });
        }
    }

    console.log(JSON.stringify(outColumnArray));
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