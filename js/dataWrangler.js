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
    var m = $id("fileDetails");
    m.innerHTML = msg + m.innerHTML;
}

/**
 * this function will clean  all the msg on the separator modal
 * @param msg
 */
DataWrangler.prototype.clean = function(){
    $id("fileDetails").innerHTML = "";
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

        }
        else{
        }
    });
    $("#space").click( function(){
        if( $(this).is(':checked') ) {
        }
        else{
        }
    });
    $("#tab").click( function(){
        if( $(this).is(':checked') ) {
        }
        else{
        }
    });
    $("#semicolon").click( function(){
        if( $(this).is(':checked') ) {
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
     * take first line look for comma first if found then add comma to the list
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

    var rxSemi  = /(?!\s|;|$)[^;"]*("(\\.|[^\\"])*"[^;"]*)*/g;
    var rxComma = /(?!\s|,|$)[^,"]*("(\\.|[^\\"])*"[^,"]*)*/g;
    var rxTab   = /(?!\s|\t|$)[^\t"]*("(\\.|[^\\"])*"[^\t"]*)*/g;
    var rxSpace = /[^\s"']+|"([^"]*)"|'([^']*)'/;   //ref : http://stackoverflow.com/questions/366202/regex-for-splitting-a-string-using-space-when-not-surrounded-by-single-or-double

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


    //get the selected delimiter from the separator modal
    self.getDelimiter();

    //this data
    var text = self.data;
    var dsv = d3.dsv(self.delimiter, "text/plain");
    var importedData = dsv.parseRows(text);

    //this function will fill the data in the column object
    self.formColumn(importedData);

    //read each column data and find out the data type
    self.guessDataType();

    //this will keep only one instance of the table class
    if(self.table == null){
        self.table = new Table(importedData);
    }
    else {
        self.table.reload(importedData);
    }

}

//this will form each column data
DataWrangler.prototype.formColumn =  function(importedData){

    self.allColumnsDataArray = {};

    importedData.forEach(function(row){

        var colKey = 0;
        row.forEach( function(cell){

            //find the key if not available then create the new key
            if(!self.allColumnsDataArray.hasOwnProperty(colKey)){
                self.allColumnsDataArray[colKey] = {
                    //insert if any more column information is required
                    "id": 0,
                    "data": [],
                    "datatype": "",     //data type will be guessed in separate function
                    "head":"",          //head will guess in separate function
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


DataWrangler.prototype.guessDataType =  function(){

}