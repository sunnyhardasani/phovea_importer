define(["jquery", "d3", "d3-tip", "table", "utility/localSettings", "utility/modColorBrewer"],
    function ($, d3, d3tip, table, settings, colorbrewer) {

        // default values
        var MIN_VALUE = settings.localSettings().MIN_VALUE;
        var MAX_VALUE = settings.localSettings().MAX_VALUE;
        var RATIO = settings.localSettings().RATIO;
        var TOTAL_STRAT_COUNT = settings.localSettings().TOTAL_STRAT_COUNT;

        // defination of the variables
        var DATATYPE_STRING = settings.localSettings().DATATYPE_STRING;
        var DATATYPE_NOMINAL = settings.localSettings().DATATYPE_NOMINAL;
        var DATATYPE_NUMERICAL = settings.localSettings().DATATYPE_NUMERICAL;
        var DATATYPE_ORDINAL = settings.localSettings().DATATYPE_ORDINAL;
        var DATATYPE_ERROR = settings.localSettings().DATATYPE_ERROR;

        //initialize the instance with the null
        var instance = null;

        /**
         * this function will check instance is null then
         * throw an error and register the required html
         * elements
         * @constructor
         */
        function DataWrangler() {
            if (instance !== null) {
                throw new Error("Cannot instantiate more than one DataWrangler, use DataWrangler.getInstance()");
            }

            // registering all the events of the check box
            // and input box on the separator modal
            this.registerSepEvents();
        }

        /**
         * this function will return the instance of
         * the class
         * @returns {*}
         */
        DataWrangler.getInstance = function () {
            // summary: Gets an instance of the singleton. It is better to use
            if (instance === null) {
                instance = new DataWrangler();
            }
            return instance;
        };

        // getElementById - helper function
        function $id(id) {
            return document.getElementById(id);
        }

        /**
         * Initialize the instance with the new data
         * @param data
         * @param file
         * @param _mainInstance
         */
        DataWrangler.prototype.reload = function (data, file, _mainInstance) {

            var self = this;
            self.data = data;
            self.file = file;
            self.mainInstance = _mainInstance;
            self.delimiter = {};
            self.idColumn = 0; //todo: this variable will indicate the column row in the data, need to guess automatically
            self.idRow = 0; //todo: this will indicate the row identification in the table

            //clean all the previous content on the separator modal
            self.clean();

            //call the initialize function
            self.init();
        }

        /**
         * this function will initialize the separator modal
         * and display the file selected and gives and option
         * to use different types of separator on the file
         */
        DataWrangler.prototype.init = function () {

            var self = this;

            //now guess the separator in the file
            self.guessAndCheckDelimiter();

            self.saveClicked();
        };

        /**
         * this function will print the msg on the separator modal
         * @param msg
         */
        DataWrangler.prototype.output = function (msg) {
            /*   var m = $id("fileDetails");
             m.innerHTML = msg + m.innerHTML;*/
        }

        /**
         * this function will clean  all the msg on the separator modal
         * @param msg
         */
        DataWrangler.prototype.clean = function () {
            d3.select("#colorbox-pop-up").selectAll("*").remove();
            d3.select("#importedTable").selectAll("*").remove();
        }

        /**
         * todo: make another box to show how the demo view how the table will look like
         */
        DataWrangler.prototype.registerSepEvents = function () {

            var self = this;

            // registering all the events of the
            // check box and input box on the separator
            // modal
            $("#comma").click(function () {
                if ($(this).is(':checked')) {
                    self.saveClicked();
                }
                else {
                }
            });
            $("#space").click(function () {
                if ($(this).is(':checked')) {
                    self.saveClicked();
                }
                else {
                }
            });
            $("#tab").click(function () {
                if ($(this).is(':checked')) {
                    self.saveClicked();
                }
                else {
                }
            });
            $("#semicolon").click(function () {
                if ($(this).is(':checked')) {
                    self.saveClicked();
                }
                else {
                }
            });

            // this will read the event on the
            $('#any').bind('input', function () {
                // get the current value of the input field.
                var val = $(this).val();
            });

            // this will read the event on the
            $('#save').click(function () {
                // get the current value of the input field.
                self.saveClicked();
            });

        }

        /**
         * this function will guess the separator from the input data
         */
        DataWrangler.prototype.guessAndCheckDelimiter = function () {
            /**
             * take first line, look for comma first, if found then add comma to the list
             * also consider that comma should no tbe present in the double quotes
             * as it will not be considered.
             *
             * in this currently handling all the positive scenario expecting user is going
             * to introduce perfect file with no error in file
             *
             * currently guessing four separators ;,\s\t
             *
             * todo: handle all the error scenarios in this case
             * todo: like
             * todo: take generic approach to handle all the delimiter
             */

            var self = this;

            // ref: need to look for it
            // these regex ignore the double quotes
            // and return delimited separated strings
            // todo: make generic regex which will deal
            // todo: with all the delimiter

            //ref : http://stackoverflow.com/questions/366202/regex-for-splitting-a-string-using-space-when-not-surrounded-by-single-or-double
            var rxSemi = /(?!\s|;|$)[^;"]*("(\\.|[^\\"])*"[^;"]*)*/g;
            var rxComma = /(?!\s|,|$)[^,"]*("(\\.|[^\\"])*"[^,"]*)*/g;
            var rxTab = /(?!\s|\t|$)[^\t"]*("(\\.|[^\\"])*"[^\t"]*)*/g;
            var rxSpace = /[^\s"']+|"([^"]*)"|'([^']*)'/;

            //take the copy of data
            var text = self.data;

            // take all the lines of the
            // text in the row array
            var rows = text.split('\n');
            var row = rows[0];

            var arrSemi = row.match(rxSemi);
            var arrComma = row.match(rxComma);
            var arrTab = row.match(rxTab);
            var arrSpace = row.match(rxSpace);

            var nSemiCount = arrSemi.length;
            var nCommaCount = arrComma.length;
            var nTabCount = arrTab.length;
            var nSpaceCount = arrSpace.length;


            // this will mark the guessed delimiter
            // on the ui of the separator modal
            // which ever is higher selected that
            var max = -1;
            var strDelimiter;

            if (max < nSemiCount) {
                strDelimiter = "semicolon";
                max = nSemiCount;
            }
            if (max < nCommaCount) {
                strDelimiter = "comma";
                max = nCommaCount;
            }
            if (max < nTabCount) {
                strDelimiter = "tab";
                max = nTabCount;
            }
            if (max < nSpaceCount) {
                strDelimiter = "space";
                max = nSpaceCount;
            }

            //set the highest count radio button to true
            $id(strDelimiter).checked = true;

        }

        /**
         * this function will change the global delimiter
         * with the change made on the ui
         */
        DataWrangler.prototype.getDelimiter = function () {

            var self = this;

            if ($id('any').value != "") {
                this.delimiter = $id('any').value.charAt(0);
            }
            else if ($id('comma').checked) {
                this.delimiter = ",";
            }
            else if ($id('space').checked) {
                this.delimiter = "\s";
            }
            else if ($id("tab").checked) {
                this.delimiter = "\t";
            }
            else if ($id('semicolon').checked) {
                this.delimiter = ";";
            }
        }

        /**
         * This function will convert dsv to json converter
         * dsv delimiter are used which are checked on the
         * separator modal and also the
         */
        DataWrangler.prototype.saveClicked = function (newCategoryData) {  //todo temporary solution for new data

            var self = this;

            //clean complete table
            self.clean();


            //get the selected delimiter from the separator modal
            self.getDelimiter();

            //this data
            var text = self.data;
            var dsv = d3.dsv(self.delimiter, "text/plain");
            self.importedData = dsv.parseRows(text);

            //this will check if there is any element in the array then add
            //to the imported array
            /*console.log(newCategoryData);
             if(newCategoryData != null && newCategoryData.length != 0){
             for(index in self.importedData){
             self.importedData[index].push(newCategoryData[index]);
             }
             }*/

            /**
             *  Approach:
             *  1. Slice row of the data
             *  2. Slice column of the data
             *  3. Form column object and insert each object in array
             *  4. Guess data type from the column object
             *  5. Finally send the data to the table creation
             */

                //self.sliceRowId();    //todo - auto guess - currently guessing that the first row is column id
            self.sliceColId();      //todo - auto guess - currently guessing that the first col is row id
            self.formColumn();      //working
            self.guessDataType();   //working

            // requireJS will ensure that the Table definition is available
            // to use, we can now import it for use.
            self.table = require('table');
            self.table.reload(self.allColumnsDataArray, self);
        }

        /**
         * This function will slice the row id
         */
        DataWrangler.prototype.sliceRowId = function () {
            var self = this;

            /**
             * todo
             * current fetching the first col as row identifier
             * need to discuss with Alex about this point
             * idea: can use data type for knowing aboubt this col
             */
            self.rowId = [];

            var key = 0;
            self.importedData.forEach(function (row) {
                self.rowId[key] = self.importedData[key].shift();
                key++;
            });
        }

        //todo
        DataWrangler.prototype.sliceColId = function () {
            var self = this;

            /**
             * todo : need to this logic after discussion with Alex
             * currently expecting the first row to be the column id
             * slice of the column from the imported data and keep the remaining structure as it is;
             * compare with the data type if all the column have either string or int data type then
             */


            self.colId = self.importedData.shift();

        }


        //this will form each column data
        DataWrangler.prototype.formColumn = function () {

            var self = this;

            self.allColumnsDataArray = {};
            self.importedData.forEach(function (row) {

                var colKey = 0;
                row.forEach(function (cell) {

                    //find the key if not available then create the new key
                    if (!self.allColumnsDataArray.hasOwnProperty(colKey)) {
                        self.allColumnsDataArray[colKey] = {
                            //insert if any more column information is required
                            "id": colKey,
                            "colorScheme": colorbrewer["defaultScale"]["default"][12], // todo add this 12 into settings
                            "colId": self.colId[colKey],          //head will guess in separate function
                            "dataTypeObj": new Object(),         //data type will be guessed in separate function
                            "data": []
                        };
                    }

                    // as the column key start from zero this is the starting key
                    self.allColumnsDataArray[colKey].id = colKey + 1;

                    // push the cell content into repective array
                    // this data is use for printing
                    self.allColumnsDataArray[colKey].data.push(cell);

                    //increase the key
                    colKey++;
                });
            });
        }

        /**
         * Guess Data Type function: this function will take the column array and
         * guess the data type for each column if found some incorrect information
         * let the user the by inserting the data in the array column
         * todo need to optimize the below code for both space and time complexity
         */
        DataWrangler.prototype.guessDataType = function () {

            var self = this;

            for (key in self.allColumnsDataArray) {

                var col = self.allColumnsDataArray[key];
                var colData = col["data"];
                var dataCount = colData.length;

                //following data will get refresh with each iteration
                var nNumericCount = 0;
                var nTotalCount = dataCount;
                var min = MIN_VALUE; //
                var max = MAX_VALUE;
                var freqMap = {};
                var numberMap = {};
                var stringMap = {};

                //for type real and range
                //first check all the data is numerical
                for (var index = 0; index < dataCount; index++) {

                    //following handles the numerical items
                    if (!isNaN(colData[index])) {

                        //increase the numerical element count
                        nNumericCount++;

                        //converting string to number
                        var nData = Number(colData[index]);

                        //note: first checking for min and max value data might of the real and range type
                        //finding the maximum value and the min value might be required for the range
                        if (max < nData) {
                            max = nData;
                        }
                        if (min > nData) {
                            min = nData;
                        }

                        //calculate the frequency of each element
                        //todo freqmap data strcuture will require few changes
                        if (!freqMap.hasOwnProperty(nData)) {
                            freqMap[nData] = {
                                value: 1,
                                sortIndex: index,
                                type: "numerical",
                                color:""
                            };
                        }
                        else {
                            freqMap[nData].value++;
                        }

                        //add the number data in the array
                        numberMap[index] = colData[index];
                    }
                    else {

                        // this will load the data in the frequency map as
                        // string and each element frequency is calculated
                        // now string data can be of different types as all
                        // the element or all the element can have different
                        // elements calculate the frequency of each element

                        var strData = colData[index];

                        if (!freqMap.hasOwnProperty(strData)) {
                            freqMap[strData] = {
                                value: 1,
                                sortIndex: index,
                                type: "string",
                                color:""
                            };
                        }
                        else {
                            freqMap[strData].value++;
                        }

                        //add the number data in the array
                        //this data is required by the error field
                        stringMap[index] = colData[index];
                    }
                }

                //add all the type of data in the column
                col["dataTypeObj"].keyCountMap = freqMap;
                col["dataTypeObj"].stringMap = stringMap;           //adding string map if suppose user ask to change the datatype
                col["dataTypeObj"].numberMap = numberMap;          //adding numerical map if suppose user ask to change the datatype
                col["dataTypeObj"].data = colData;
                col["dataTypeObj"].min = min;
                col["dataTypeObj"].max = max;

                //finding out the total key count in the frequency data map
                var nKeyCount = Object.keys(freqMap).length;

                //currently considering that there are only numeric and string data
                //todo: not handled numeric with string to ask the user
                //only numeric data found

                //only numeric data
                if (nNumericCount == nTotalCount) {

                    // now its confirmed that we have only numeric data
                    // lets check whether the data is stratified or not
                    // todo: Following logic require confirmation after discussion
                    // todo: Ratio logic calculation needs to be discussed and may require change

                    //checking for stratified data
                    if (nKeyCount / nNumericCount < RATIO && nKeyCount < TOTAL_STRAT_COUNT) {
                        col["dataTypeObj"].type = DATATYPE_NOMINAL;
                    }
                    else {
                        //todo: set the output parameter in this area
                        //Print the data is real and the range of the data
                        col["dataTypeObj"].type = DATATYPE_NUMERICAL;
                    }
                }
                else if (nNumericCount == 0) { // only string data

                    // If non numeric element found
                    // Todo: following logic require change after discussion
                    //String can be stratified
                    if ((nKeyCount / nTotalCount) < RATIO) { // Todo: logic change is required in this line
                        col["dataTypeObj"].type = DATATYPE_NOMINAL;
                    }
                    else {
                        //String can be names of the person so chances are
                        //Print the data is real and the range of the data
                        col["dataTypeObj"].type = DATATYPE_STRING;
                    }

                }
                else {
                    // todo get the location of all the different items and
                    // keep the type as error i.e. not able to judge and sent
                    // define error structure and send the doubtful error
                    // location to the server
                    col["dataTypeObj"].type = DATATYPE_ERROR;

                    // guessing the base data type of the column if base type
                    // is numerical than highlight the strings with red color
                    // currently added the ratio of 0.8, if suppose there are
                    // 10 numbers and then for base type to be numerical there
                    // must be 6,7,8,9 or 10 numbers else its base type change
                    // to string
                    col["dataTypeObj"].baseType = (nNumericCount / nTotalCount) >= 0.5 ? DATATYPE_NUMERICAL : DATATYPE_STRING;
                }
            }
        }

        /**
         * This function is responsible for changing the data type
         * this will take the col id and the new data type change
         * required
         */
        DataWrangler.prototype.changeDataType = function (colId, newDataType) {
            var self = this;

            self.allColumnsDataArray[colId]["dataTypeObj"].type = newDataType;

            //todo the following line of code in the
            //separate function of table reinitialize
            self.clean();

            //this will keep only one instance of the table class
            if (!self.table) {
                self.table = new Table(self.allColumnsDataArray, self);
            }
            else {
                self.table.reload(self.allColumnsDataArray, self);
            }
        }

        /**
         * this function will change the color of the column of
         * the chart
         * @param colId
         * @param newColor
         */
        DataWrangler.prototype.changeColColor = function (colId, newColor) {
            var self = this;

            if(self.allColumnsDataArray[colId].colorScheme !== newColor ) {
                self.allColumnsDataArray[colId].colorScheme = newColor;

                for (var obj in self.allColumnsDataArray[colId]["dataTypeObj"].keyCountMap) {
                    self.allColumnsDataArray[colId]["dataTypeObj"].keyCountMap[obj].color = "";
                }

                //todo the following line of code in the
                //separate function of table reinitialize
                self.clean();

                //this will keep only one instance of the table class
                if (!self.table) {
                    self.table = new Table(self.allColumnsDataArray, self);
                }
                else {
                    self.table.reload(self.allColumnsDataArray, self);
                }
            }
        }

        /**
         * This function will return the current data
         * on which all th operations are performing
         */
        DataWrangler.prototype.getColumnData = function () {
            var self = this;

            //this will return the current column data
            return self.allColumnsDataArray;
        }

        /**
         * This function is responsible adding the new category
         * in the nominal data
         */
        DataWrangler.prototype.addNewCategoryInNominal = function () {
            var self = this;

        }

        /**
         * This new frequency map comes from the
         * table when column drang and dropped
         * @param colId
         * @param freqMap
         */
       DataWrangler.prototype.setNewFreqMap = function(colId, freqMap){
           var self = this;

           //set the new freq map
           self.allColumnsDataArray[colId]["dataTypeObj"].keyCountMap = freqMap;

           //todo the following line of code in the
           //separate function of table reinitialize
           self.clean();

           //this will keep only one instance of the table class
           self.table = require('table');
           self.table.reload(self.allColumnsDataArray, self);
       }

        /**
         * This will update numerical minimum and maximum
         * value
         */
        DataWrangler.prototype.updateNumericalMinAndMax = function(_colId,_min,_max){
            var self = this;

            var colId = _colId;

            //set the minimum and maximum in the data strcuture
            self.allColumnsDataArray[colId]["dataTypeObj"].min = _min;
            self.allColumnsDataArray[colId]["dataTypeObj"].max = _max;

            //todo the following line of code in the
            //separate function of table reinitialize
            self.clean();

            //this will keep only one instance of the table class
            self.table = require('table');
            self.table.reload(self.allColumnsDataArray, self);
        }

        DataWrangler.prototype.addNewCategory = function(_colId,newCategoryElement){
            var self = this;

            var colId = _colId;

            //set the minimum and maximum in the data strcuture
            var sortIndexForNewCat = Object.keys(self.allColumnsDataArray[colId]["dataTypeObj"].keyCountMap).length;
            if(!self.allColumnsDataArray[colId]["dataTypeObj"].keyCountMap.hasOwnProperty(newCategoryElement)){
                self.allColumnsDataArray[colId]["dataTypeObj"].keyCountMap[newCategoryElement] = {
                    value: 0,
                    sortIndex: sortIndexForNewCat,
                    type: "nominal",
                    color:""
                };
            }
            else{
                //todo confirm whether to perform any operations or not
            }

            //todo the following line of code in the
            //separate function of table reinitialize
            self.clean();

            //this will keep only one instance of the table class
            self.table = require('table');
            self.table.reload(self.allColumnsDataArray, self);

        }


        return DataWrangler.getInstance();
    });