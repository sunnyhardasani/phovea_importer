//////////////////////////////////////////////////////
// JSON Output File to handle output from the class //
//////////////////////////////////////////////////////

define(["jquery","d3"],
        function ($,d3) {


    // class instance initialized to null
    var instance = null;

    /**
     * 1. Check if instance is null then throw error
     * 2. Calls the load ui related to this class
     * @constructor
     */
    function FileConfiguration(){
        var self = this;

        //if instance is not null then throw an error
        if(instance !== null){
            throw new Error("Cannot instantiate more than one FileConfiguration, use FileConfiguration.getInstance()");
        }

        //load the ui
        self.loadUI();

        //read the data from the stored json file
        self.localJSONData = [];
    }

    /**
     * this function returns the instance of this
     * class if not created
     * @returns {*}
     */
    FileConfiguration.getInstance = function(){
        // gets an instance of the singleton. It is better to use
        if(instance === null){
            instance = new FileConfiguration();
        }
        return instance;
    };


    /**
     * This function will get initialized when this class
     * start from the constructor
     */
    FileConfiguration.prototype.init = function(){
        var self = this;

        //todo : this function will read the server
        self.readLocalData();
    }

    /**
     * This function will get initialized when this class
     * start from the constructor
     */
    FileConfiguration.prototype.addNewFile = function(file){

        var self = this;

        self.outFileData = {
            "name":file.name.substr(0,file.name.lastIndexOf('.')),
            "path":file.name,
            "size":file.size, // todo change this to total column and row count
            "columns":[]
        };
    }


    /**
     * This function will get loaded only once
     * this will attach all the ui operation to
     * the function on this class
     */
    FileConfiguration.prototype.loadUI = function(){
        var self = this;

        //file configuration ui functionality
        $("#main").toggle();
        $("#open-configuration-window").click(function(){
            $("#main").toggle();
            $(".box").toggle();
        });
        $("#save-conf-button").click(function(){
            self.saveConfiguration();
        });
    }

    /**
     * This function will get called when save configuration
     * button is clicked on the File Configuration UI,
     * This will save the current JSON Output to the file
     * on the local machine
     *
     * This function first request the data from the table
     * and then call the load data function which create the
     * json data of the columns and then attach the data to
     * the new file data
     */
    FileConfiguration.prototype.saveConfiguration = function() {
        var self = this;

        //get current table data from the table javascript

        //convert the table data to the json output format
        self.outFileData.columns = self.loadData(self.tempData); //todo this will take the data from the table

        //push the new file data to the local json dat  a
        self.localJSONData.push(self.outFileData);

        //write the json output to file
        self.writeJsonToFile(self.localJSONData);

        //reload the fresh data
        self.readLocalData();
    }

    /**
     * This function will write current json data to the file
     * and save the data for the future refernce
     */
    FileConfiguration.prototype.writeJsonToFile = function(data){
        //todo showing json output tempoaray on the screen
        //remove this and save it on the server
        $("#json-output").html(JSON.stringify(data));

        var self = this;
    }

    /**
     * this function will read the data from the local
     * machine and show it one the file configuration window *
     */
    FileConfiguration.prototype.readLocalData = function(){
        var self = this;

        //convert this data to JSON object
        //by using JSON.parse

        //read the file information and display on the
        //file confguration GUI

        //todo make it using exit and remove
        d3.select("#recentFiles").selectAll("*").remove();

        var recentFiles = d3.select("#recentFiles").style("width","400px").style("overflow","auto").selectAll("#file");
        var fileDivs  = recentFiles.data(self.localJSONData)
                            .enter().append("div")
                            .style("float","left")
                            .attr("id","#file");

            fileDivs.append("span")
                    .attr("class","glyphicon glyphicon-file")
                    .style("font-size","50px");

            fileDivs.append("div")
                    .style("width","60px")
                    .style("overflow","hidden")
                    .style("text-overflow","ellipsis")
                        .text(function(d){
                                        return d.path;
                                    });

            fileDivs.on("click",function(d){
                self.recentFileClicked(d.path);
            });

            //todo add following
            //fileDivs.exit().remove();
    }

    /**
     * this function will get called when recent file is clicked
     * on the file configuration UI, this will load the UI with
     * selected file information.
     * @param filepath
     */
    FileConfiguration.prototype.recentFileClicked = function(filepath){

        //todo send the data on the server and on file click operation
        //call the file uploader function to open the save file from the
        //server
        alert(filepath);
    }

    /**
     * This function will create the json output and load the
     *
     * @param curTableData
     */
    FileConfiguration.prototype.loadData = function(curTableData){
        var self = this;

        var outColumnArray = [];
        for(col in curTableData) {

            //fetching the required type and converting it to new structure
            var col = curTableData[col];
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

        //now push this col to new
        //console.log(JSON.stringify(outColumnArray));

        return outColumnArray;
    }

    //todo remove this function this will bring the temporary file upload
    FileConfiguration.prototype.tempDataLoad = function(data) {
        var self = this;
        self.tempData = data;
    }

    return FileConfiguration.getInstance();
});