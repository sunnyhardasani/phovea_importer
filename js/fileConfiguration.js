//////////////////////////////////////////////////////
// JSON Output File to handle output from the class //
//////////////////////////////////////////////////////

define(["jquery", "d3","./dataWrangler"],

    function ($, d3, dataWrangler) {

        // class instance initialized to null
        var instance = null;

        /**
         * 1. Check if instance is null then throw error
         * 2. Calls the load ui related to this class
         * @constructor
         */
        function FileConfiguration() {
            var self = this;

            //if instance is not null then throw an error
            if (instance !== null) {
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
        FileConfiguration.getInstance = function () {
            // gets an instance of the singleton. It is better to use
            if (instance === null) {
                instance = new FileConfiguration();
            }
            return instance;
        };


        /**
         * This function will get initialized when this class
         * start from the constructor
         */
        FileConfiguration.prototype.init = function () {
            var self = this;

            //todo : this function will read the server
            self.readLocalData();
        }

        /**
         * This function will get initialized when this class
         * start from the constructor
         */
        FileConfiguration.prototype.addNewFile = function () {

            var self = this;

            var settings = require("./utility/localSettings");
            var TABLE_HOMOGENEOUS = settings.localSettings().TABLE_HOMOGENEOUS;
            var TABLE_HETEROGENEOUS = settings.localSettings().TABLE_HETEROGENEOUS;

            var allColData = self.dataWranglerIns.getColumnData();
            var file = require("./fileUploader").files[0];


            //fetch the column count
            var columnCount = Object.keys(self.dataWranglerIns.getColumnData()).length;

            //fetch the row count of the object
            var rowCount = self.dataWranglerIns.getColumnData()[0].data.length;
            if(file.size > settings.localSettings().INITIAL_END_BYTE){
                rowCount = "NA";
            }

            //iterate all the columns and check the
            var colIds = [];
            for(key in allColData){
                var col = allColData[key];
                if(col.isColType){
                    colIds.push(parseInt(col.id-1));
                }
            }

            //take the left operations and select the
            var rowTypeIds = [];
            var rowTypeDataArr = self.dataWranglerIns.getRowTypeID();
            for(key in rowTypeDataArr){
                if(rowTypeDataArr[key]){
                    rowTypeIds.push(parseInt(key));
                }
            }

            //take the rows to ignore operation from
            //rows to ignore
            var rowsToIgnore = [];
            var rowToIgnoreArr = self.dataWranglerIns.getRowsToIgnore();
            for(key in rowToIgnoreArr){
                if(rowToIgnoreArr[key] == 1){
                    rowsToIgnore.push(parseInt(key));
                }
            }

            var colData;
            var type = self.findType(colIds,rowTypeIds,rowsToIgnore);
            if(type === TABLE_HOMOGENEOUS){
                var homogeneousKey =  self.homogeneousKey;
                colData = {homogeneousKey : allColData[homogeneousKey]};
            }
            else{
                colData = allColData;
            }

            //prepare the file data
            self.outFileData = {
                "name": file.name.substr(0, file.name.lastIndexOf('.')),
                "path": file.name,
                "size": {
                    "col_count": columnCount,
                    "row_count": rowCount
                },
                "type": type,
                "rowtype": rowTypeIds,
                "coltype": colIds,
                "ignorerows": rowsToIgnore,
                "columns": self.loadData(colData)
            };
        }

        /**
         * this function is responsible for finding out
         * type of the table Homogeneous or Heterogeneous
         * @param _colIds
         * @param _rowTypeIds
         * @param _rowsToIgnore
         * @returns {string}
         */
        FileConfiguration.prototype.findType = function (_colIds,_rowTypeIds,_rowsToIgnore) {
            var self = this;

            var settings = require("./utility/localSettings");

            var DATATYPE_STRING = settings.localSettings().DATATYPE_STRING;
            var DATATYPE_NOMINAL = settings.localSettings().DATATYPE_NOMINAL;
            var DATATYPE_NUMERICAL = settings.localSettings().DATATYPE_NUMERICAL;
            var DATATYPE_ORDINAL = settings.localSettings().DATATYPE_ORDINAL;
            var DATATYPE_ERROR = settings.localSettings().DATATYPE_ERROR;

            var TABLE_HOMOGENEOUS = settings.localSettings().TABLE_HOMOGENEOUS;
            var TABLE_HETEROGENEOUS = settings.localSettings().TABLE_HETEROGENEOUS;

            var allColData = self.dataWranglerIns.getColumnData();
            var lastCol = null;
            var tableType = TABLE_HOMOGENEOUS;

            for (key in allColData) {
                var col = allColData[key];

                //this if will take care for all
                //the ID columns to ignore while
                //finding out the type
                if (_colIds.indexOf(col.id-1) < 0) {

                    if (lastCol != null) {

                        //1. check all the type
                        //2. if numerical
                        //      a. check min
                        //      b. check max
                        //      c. check center
                        //3. if nominal
                        //      a. compare all the keys should be same
                        //4. todo ask if string

                        console.log(col, lastCol);

                        if (lastCol["dataTypeObj"].type !== col["dataTypeObj"].type) {
                            tableType = TABLE_HETEROGENEOUS;
                            break;
                        }
                        if (lastCol["dataTypeObj"].type === DATATYPE_NUMERICAL) {
                            if (lastCol["dataTypeObj"].min != col["dataTypeObj"].min) {
                                tableType = TABLE_HETEROGENEOUS;
                                break;
                            }
                            else if (lastCol["dataTypeObj"].max !== col["dataTypeObj"].max) {
                                tableType = TABLE_HETEROGENEOUS;
                                break;
                            }
                            else if (lastCol["dataTypeObj"].center !== col["dataTypeObj"].center) {
                                tableType = TABLE_HETEROGENEOUS;
                                break;
                            }
                        }
                        else if (lastCol["dataTypeObj"].type !== DATATYPE_NOMINAL) {
                            for (key1 in lastCol["dataTypeObj"].keyCountMap) {
                                if (!(key1 in col["dataTypeObj"].keyCountMap)) {
                                    tableType = TABLE_HETEROGENEOUS;
                                    break;
                                }
                            }
                        }

                        console.log(col);
                    }
                    else {
                        lastCol = col;
                        self.homogeneousKey = key;
                    }
                }
            }

            return tableType;
        }

        /**
         * This function will save the json file on the
         * local machine, it will get invoked when
         * save configuration is clicked
         * @param textToWrite
         * @param fileNameToSaveAs
         */
        FileConfiguration.prototype.saveFile = function(textToWrite,fileNameToSaveAs)
        {
            var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});

            var downloadLink = document.createElement("a");
            downloadLink.download = fileNameToSaveAs;
            downloadLink.innerHTML = "Download File";
            if (window.webkitURL != null)
            {
                // Chrome allows the link to be clicked
                // without actually adding it to the DOM.
                downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
            }
            else
            {
                // Firefox requires the link to be added to the DOM
                // before it can be clicked.
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                downloadLink.onclick = destroyClickedElement;
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
            }

            downloadLink.click();
        }

        /**
         * This function will get loaded only once
         * this will attach all the ui operation to
         * the function on this class
         */
        FileConfiguration.prototype.loadUI = function () {
            var self = this;

            //file configuration ui functionality
            /*$("#main").hide();
            $("#open-configuration-window").click(function () {
                $("#main").toggle();
                $(".box").toggle();
            });*/
            $("#save-conf-button").click(function () {
                self.saveConfiguration();
            });
        }

        /**
         * This function is responsible for switching
         * windows between the file configuration ui
         * and main ui
         */
        /*FileConfiguration.prototype.switchWindow = function(){
            var self = this;
            $("#main").show();
            $(".box").hide();
        }
        */
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
        FileConfiguration.prototype.saveConfiguration = function () {
            var self = this;

            self.dataWranglerIns =  require("./dataWrangler");

            self.addNewFile();

            //convert the table data to the json output format
            //self.outFileData.columns = self.loadData(self.dataWranglerIns.getColumnData());

            //push the new file data to the local json dat  a
            //self.localJSONData.push(self.outFileData);

            //write the json output to file
            self.writeJsonToFile(self.outFileData);

            //reload the fresh data
            //self.readLocalData();
        }

        /**
         * This function will write current json data to the file
         * and save the data for the future refernce
         */
        FileConfiguration.prototype.writeJsonToFile = function (data) {
            var self = this;

            //now print the json output and save the configuration file
            var json = JSON.stringify(data);
            var blob = new Blob([json], {type: "application/json"});
            var url  = URL.createObjectURL(blob);

            self.saveFile(json,"file.json");

            var url = 'data:text/json;charset=utf8,' + encodeURIComponent(json);
            window.open(url, '_blank');
            window.focus();


            var self = this;
        }

        /**
         * this function will read the data from the local
         * machine and show it one the file configuration window *
         */
        FileConfiguration.prototype.readLocalData = function () {
            var self = this;

            //convert this data to JSON object
            //by using JSON.parse

            //read the file information and display on the
            //file confguration GUI

            //todo make it using exit and remove
            d3.select("#recentFiles").selectAll("*").remove();

            var recentFiles = d3.select("#recentFiles")
                .style("width", "400px")
                .style("overflow", "auto")
                .selectAll("#file");

            var fileDivs = recentFiles.data(self.localJSONData)
                .enter().append("div")
                .style("float", "left")
                .attr("id", "#file");

            fileDivs.append("span")
                .attr("class", "glyphicon glyphicon-file")
                .style("font-size", "50px");

            fileDivs.append("div")
                .style("width", "60px")
                .style("overflow", "hidden")
                .style("text-overflow", "ellipsis")
                .text(function (d) {
                    return d.path;
                });

            fileDivs.on("click", function (d) {
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
        FileConfiguration.prototype.recentFileClicked = function (filepath) {

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
        FileConfiguration.prototype.loadData = function (curTableData) {
            var self = this;

            console.log(curTableData);

            var outColumnArray = [];
            for (col in curTableData) {

                //fetching the required type and converting it to new structure
                var col = curTableData[col];

                var dataTypeObj = col["dataTypeObj"];
                var data = col["data"];

                //taking the json output information
                var outId = col["id"];
                var outHeader = col["colId"];
                var outColor = col["colorScheme"];

                //for numerical data type
                if (dataTypeObj.type === "numerical") {
                    var outNumericalDTType = {
                        "type": dataTypeObj.type,
                        "min": dataTypeObj.min,
                        "max": dataTypeObj.max
                    };

                    if(dataTypeObj.isDataCenter){
                        outNumericalDTType["center"] = dataTypeObj.center;
                    }

                    outColumnArray.push({
                        "id": outId,
                        "header": outHeader,
                        "datatype": outNumericalDTType,
                        "colorSchemeSelected": outColor
                    });
                }
                //for nominal data type
                else if (dataTypeObj.type === "nominal") {
                    var outCategories = [];
                    for (cat in dataTypeObj.keyCountMap) {
                        outCategories.push({
                            "name": cat,
                            "freq": dataTypeObj.keyCountMap[cat]
                        });
                    }
                    var outNominalDTType = {
                        type: dataTypeObj.type,
                        categories: outCategories
                    };
                    outColumnArray.push({
                        "id": outId,
                        "header": outHeader,
                        "datatype": outNominalDTType,
                        "colorSchemeSelected": outColor
                    });
                }
                //for string data type
                else if (dataTypeObj.type === "string") {
                    var outStringDTType = {
                        type: dataTypeObj.type
                    };
                    outColumnArray.push({
                        "id": outId,
                        "header": outHeader,
                        "datatype": outStringDTType,
                        "colorSchemeSelected": outColor
                    });
                }
                //for error data type
                else if (dataTypeObj.type === "error") {
                    var outErrorDTType = {
                        type: dataTypeObj.type,
                        expected_type: dataTypeObj.baseType
                    };
                    outColumnArray.push({
                        "id": outId,
                        "header": outHeader,
                        "datatype": outErrorDTType
                    });
                }
            }

            return outColumnArray;
        }

        //todo remove this function this will bring the temporary file upload
        FileConfiguration.prototype.tempDataLoad = function (data) {
            var self = this;
            self.tempData = data;
        }

        return FileConfiguration.getInstance();
    });
