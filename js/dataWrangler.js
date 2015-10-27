/**
 * Created by sunny hardasani on 10/14/2015.
 */
//make it data wrangler
function DataWrangler(_data,_file){

    var self = this;
    self.data = _data;
    self.file = _file;
    self.delimiter ={};
    self.idColumn= 0; //todo: this variable will indicate the column row in the data, need to guess automatically
    self.idRow=0; //todo: this will indicate the row identification in the table


    //clean all the previous content on the separator modal
    self.clean();

    //call the initialize function
    self.init();

    // registering all the events of the
    // check box and input box on the separator
    // modal
    self.registerSepEvents();

};

DataWrangler.prototype.reload = function(data,file) {

    var self = this;
    self.data = data;
    self.file = file;
    self.delimiter ={};
    self.idColumn= 0; //todo: this variable will indicate the column row in the data, need to guess automatically
    self.idRow=0; //todo: this will indicate the row identification in the table

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
DataWrangler.prototype.init   = function(){

    var self = this;

    //this will display the file information on the modal
    self.output(
     "<p>File information: <strong>" + self.file.name +
     "</strong> type: <strong>" + self.file.type +
     "</strong> size: <strong>" + self.file.size +
     "</strong> bytes</p>"
     );

    //this will display the file data on the modal
    self.output(
     "<p><strong>" + self.file.name + ":</strong></p><pre>" +
     self.data.replace(/</g, "&lt;").replace(/>/g, "&gt;") +
     "</pre>"
     );

    //now guess the separator in the file
    self.guessAndCheckDelimiter();
    self.saveClicked();

    //this will open the modal with the file details in it
    //$("#separatorModal").modal('show');

};

/**
 * this function will print the msg on the separator modal
 * @param msg
 */
DataWrangler.prototype.output = function(msg){
 /*   var m = $id("fileDetails");
    m.innerHTML = msg + m.innerHTML;*/
}

/**
 * this function will clean  all the msg on the separator modal
 * @param msg
 */
DataWrangler.prototype.clean = function(){
    //$id("fileDetails").innerHTML = "";
    d3.select("#importedTable").selectAll("*").remove();
}

/**
 * todo: make another box to show how the demo view how the table will look like
 */
DataWrangler.prototype.registerSepEvents =  function(){

    var self = this;


    // registering all the events of the
    // check box and input box on the separator
    // modal
    $("#comma").click( function(){
        if( $(this).is(':checked') ) {
            self.saveClicked();
        }
        else{
        }
    });
    $("#space").click( function(){
        if( $(this).is(':checked') ) {
            self.saveClicked();
        }
        else{
        }
    });
    $("#tab").click( function(){
        if( $(this).is(':checked') ) {
            self.saveClicked();
        }
        else{
        }
    });
    $("#semicolon").click( function(){
        if( $(this).is(':checked') ) {
            self.saveClicked();
        }
        else{
        }
    });

    // this will read the event on the
    $('#any').bind('input', function() {
        // get the current value of the input field.
        var val = $(this).val();
    });

    // this will read the event on the
    $('#save').click( function(){
        alert("save registered");
        // get the current value of the input field.
        self.saveClicked();
    });

}

/**
 * this function will guess the separator from the input data
 */
DataWrangler.prototype.guessAndCheckDelimiter = function(){
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
    var rxSemi  = /(?!\s|;|$)[^;"]*("(\\.|[^\\"])*"[^;"]*)*/g;
    var rxComma = /(?!\s|,|$)[^,"]*("(\\.|[^\\"])*"[^,"]*)*/g;
    var rxTab   = /(?!\s|\t|$)[^\t"]*("(\\.|[^\\"])*"[^\t"]*)*/g;
    var rxSpace = /[^\s"']+|"([^"]*)"|'([^']*)'/;

    //take the copy of data
    var text = self.data;

    // take all the lines of the
    // text in the row array
    var rows = text.split('\n');
    var row = rows[0];

    var arrSemi  =  row.match(rxSemi);
    var arrComma  =  row.match(rxComma);
    var arrTab =  row.match(rxTab);
    var arrSpace  =  row.match(rxSpace);

    var nSemiCount = arrSemi.length;
    var nCommaCount =  arrComma.length;
    var nTabCount = arrTab.length;
    var nSpaceCount = arrSpace.length;

    console.log("comma" + nCommaCount);
    console.log("semicolon" + nSemiCount);
    console.log("space" +nSpaceCount);
    console.log("tab" + nTabCount);


    // this will mark the guessed delimiter
    // on the ui of the separator modal
    // which ever is higher selected that
    var max = -1;
    var strDelimiter;

    if(max < nSemiCount){
        strDelimiter = "semicolon";
        max = nSemiCount;
    }
    if(max < nCommaCount) {
        strDelimiter = "comma";
        max = nCommaCount;
    }
    if(max < nTabCount){
        strDelimiter = "tab";
        max = nTabCount;
    }
    if(max < nSpaceCount){
        strDelimiter  = "space";
        max = nSpaceCount;
    }

    //set the highest count radio button to true
    $id(strDelimiter).checked = true;

}

DataWrangler.prototype.getDelimiter =  function() {

    var self = this;

    console.log($id("tab").checked);

    if ($id('comma').checked) {
        this.delimiter = ",";
        console.log("selected delimiter : comma");
    }
    else if($id('space').checked){
        this.delimiter = "\s";
        console.log("selected delimiter : space");
    }
    else if($id("tab").checked){
        this.delimiter = "\t";
        console.log("selected delimiter : tab");
    }
    else if($id('semicolon').checked){
        this.delimiter = ";";
        console.log("selected delimiter : semicolon");
    }

   if($id('any').value != ""){
        this.delimiter = $id('any').value.charAt(0);
    }
}

/**
 * this function will convert dsv to json converter
 * dsv delimiter are used which are checked on the
 * separator modal and also the
 */
DataWrangler.prototype.saveClicked =  function(){

    var self = this;

    //clean complete table
    self.clean();

    //get the selected delimiter from the separator modal
    self.getDelimiter();

    //this data
    var text = self.data;
    var dsv = d3.dsv(self.delimiter, "text/plain");
    self.importedData = dsv.parseRows(text);

    /**
     *  Approach:
     *  1. Slice row of the data
     *  2. Slice column of the data
     *  3. Form column object and insert each object in array
     *  4. Guess data type from the column object
     *  5. Finally send the data to the table creation
     */

    self.sliceRowId();      //todo - auto guess - currently guessing that the first row is column id
    self.sliceColId();      //todo - auto guess - currently guessing that the first col is row id
    self.formColumn();      //working
    self.guessDataType();   //working

    //this will keep only one instance of the table class
    if(self.table == null){
        self.table = new Table(self.importedData);
    }
    else {
        self.table.reload(self.importedData);
    }

    console.log(self.allColumnsDataArray);
}

//todo
DataWrangler.prototype.sliceRowId =  function() {
    var self = this;

    /**
     * todo
     * current fetching the first col as row identifier
     * need to discuss with Alex about this point
     * idea: can use data type for knowing aboubt this col
     */
    self.rowId = [];

    var key = 0;
    self.importedData.forEach(function(row) {
        self.rowId[key] = self.importedData[key].shift();
        key++;
    });
}

//todo
DataWrangler.prototype.sliceColId =  function() {
    var self = this;

    /**
     * todo : need to this logic after discussion with Alex
     * currently expecting the first row to be the column id
     * slice of the column from the imported data and keep the remaining structure as it is;
     * compare with the data type if all the column have either string or int data type then
     */


    self.colId =  self.importedData.shift();

}



//this will form each column data
DataWrangler.prototype.formColumn =  function(){

    var self = this;

    self.allColumnsDataArray = {};
    self.importedData.forEach(function(row){

        var colKey = 0;
        row.forEach( function(cell){

            //find the key if not available then create the new key
            if(!self.allColumnsDataArray.hasOwnProperty(colKey)){
                self.allColumnsDataArray[colKey] = {
                    //insert if any more column information is required
                    "id":colKey,
                    "colId":self.colId[colKey],           //head will guess in separate function
                    "dataTypeObj": new Object(),         //data type will be guessed in separate function
                    "data": []
                };
            }

            // as the column key start from zero this is the starting key
            self.allColumnsDataArray[colKey].id = colKey+1;

            // push the cell content into repective array
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
 */
DataWrangler.prototype.guessDataType =  function(){

    var self = this;

    for(key in self.allColumnsDataArray){

        var col = self.allColumnsDataArray[key];
        var colData = col["data"];
        var dataCount = colData.length;

        //following data will get refresh with each iteration
        var nNumericCount = 0;
        var nTotalCount = dataCount;
        var min = MIN_VALUE; //
        var max = MAX_VALUE;
        var freqMap = {};

        //for type real and range
        //first check all the data is numerical
        for(var index = 0 ; index < dataCount; index++) {

            //following handles the numerical items
            if(!isNaN(colData[index])) {

                //increase the numerical element count
                nNumericCount++;

                //converting string to number
                var nData = Number(colData[index]);

                //note: first checking for min and max value data might of the real and range type
                //finding the maximum value and the min value might be required for the range
                if( max < nData)
                {
                    max = nData;
                }
                if( min > nData)
                {
                    min = nData;
                }

                //calculate the frequency of each element
                if(!freqMap.hasOwnProperty(nData)){
                    freqMap[nData] = {
                        value : 1
                    };
                }
                else{
                    freqMap[nData].value++;
                }
            }
            else{

                //this will load the data in the frequency map as string and each element frequency is calculated
                //now string data can be of different types as all the element or all the element can have different elements
                //calculate the frequency of each element
                //console.log(nData + " in freq map " + freqMap.hasOwnProperty[nData]);

                var strData = colData[index];

                if(!freqMap.hasOwnProperty(strData)){
                    freqMap[strData] = {
                        value : 1
                    };
                }
                else{
                    freqMap[strData].value++;
                }
            }
        }

        //finding out the total key count in the frequency data map
        var nKeyCount = Object.keys(freqMap).length;

        //currently considering that there are only numeric and string data
        //todo: not handled numeric with string to ask the user
        //only numeric data found

        //only numeric data
        if(nNumericCount == nTotalCount) {

            // now its confirmed that we have only numeric data
            // lets check whether the data is stratified or not
            // todo: Following logic require confirmation after discussion
            // todo: Ratio logic calculation needs to be discussed and may require change

            //checking for stratified data
            if( nKeyCount / nNumericCount < RATIO){

                //print that the data in this column is stratified
                var p = "";
                for (key in freqMap) {
                    if (freqMap.hasOwnProperty(key)) {
                        //todo add handling for datatype in col data
                        p = p + " Key : " + key + " " + freqMap[key].value;
                    }
                }

                console.log("Nominal : " + p);

                col["dataTypeObj"].type = "nominal"; //todo: define constants for hardcoded values
                col["dataTypeObj"].keyCountMap  = freqMap;
            }
            else{
                //todo: set the output parameter in this area
                //Print the data is real and the range of the data
                console.log("Vector - Min: " + min +" Max: " + max);

                col["dataTypeObj"].type = "numerical"; //todo: define constants for hardcoded values
                col["dataTypeObj"].min  = min;
                col["dataTypeObj"].max  = max;
            }
        }
        else if(nNumericCount == 0){ // only string data

            // If non numeric element found
            // Todo: following logic require change after discussion
            //String can be stratified
            if( (nKeyCount / nTotalCount) < RATIO){ // Todo: logic change is required in this line
                //Todo: set the output parameter in this area
                //print that the data in this column is stratified
                var p = "";
                for (key in freqMap) {
                    if (freqMap.hasOwnProperty(key)) {
                        p = p + " Key : " + key + " " + freqMap[key].value;
                    }
                }

                console.log("Nominal : " + p);

                col["dataTypeObj"].type = "nominal"; //todo: define constants for hardcoded values
                col["dataTypeObj"].keyCountMap  = freqMap;
            }
            else{
                //String can be names of the person so chances are
                //Print the data is real and the range of the data
                console.log("String Different");

                col["dataTypeObj"].type = "string";
            }

        }
        else{
            // todo get the location of all the different items and
            // keep the type as error i.e. not able to judge and sent
            // define error structure and send the doubtful error
            // location to the server

            col["dataTypeObj"].type = "error";
            //todo send the column id on which suggestion is requried from the user along with the hyppthesis
            //col["dataTypeObj"].errorInformation

            console.log("show error - string and numerical data found in one column");
        }
    }
}