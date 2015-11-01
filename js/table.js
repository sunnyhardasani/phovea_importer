/**
 * Created by Sunny Hardasani on 13/10/2015
 */

/**
 *
 * @param _fileData
 * @constructor
 */
function Table(_data){
    var self = this;

    self.data = _data;
    self.displayRowCount = 15;
    console.log(self.displayRowCount);

//    self.init();
    self.updateTable() //todo remove
}

Table.prototype.reload = function(_data) {
    var self = this;

    self.data = _data;
    self.displayRowCount = 15;
    console.log(self.displayRowCount);

    //self.init();
    self.updateTable() //todo remove
}

Table.prototype.init = function() {
    var self = this;
    //self.updatePagination();
    self.paginate(1);
}


/**
 *
 */
Table.prototype.updatePagination = function(){
    var self = this;

    self.totalPages = self.data.length / self.displayRowCount + 1;


}

/**
 *
 * @param rowCount
 */
Table.prototype.changeRowCount = function(rowCount) {

    var self = this;
    self.displayRowCount = rowCount;
}

/**
 * page can be in the range from 1,2,...,n
 * @param page
 */
Table.prototype.paginate = function(page) {

    var self = this;

    self.selPage = page;

    var startIndex = (page-1) * self.displayRowCount;
    var endIndex = page*self.displayRowCount + 1; //+1 is for excluding the column

    console.log("start index : " + startIndex );
    console.log("end index : " + endIndex);

    //fetches the data to display on page
    self.tableData  = (self.data).slice(startIndex,endIndex);

    //this function will update the table
    self.updateTable();
}

/**
 *
 */
Table.prototype.updateTable = function(){

    //todo divide this function into different functiosn
    //todo fix the table width
    //read the data type information min max value all needs to be stored for display purpose
    //optimize the code
    var self = this;
    self.data;

    console.log(self.data);


    var columns = [];
    var datatypeArray = [];

    //this will look for the data  in
    var ind = 0;
    var dInd = 0;
    for(key in self.data) {
        var col = self.data[key];
        columns[ind++] = col["colId"];

        datatypeArray[dInd] = "";

        //temporary code fetch teh data type
        var datatype = col["dataTypeObj"].type;
        console.log(datatype);
        if(datatype == "nominal"){
            var freqMap = col["dataTypeObj"].keyCountMap;
            for (var key in freqMap) {

                //use this frequency map to plot the data
                var count = freqMap[key];
                datatypeArray[dInd] = datatypeArray[dInd] + key + "-" + count.value + "\n";

            }
            dInd++;
        }
        else if(datatype == "numerical"){
            var count = freqMap[key];
            datatypeArray[dInd++] = datatypeArray[dInd] + key + " min: " + count.min + " max: " + count.max + "\n";
        }
        else if(datatype == "string"){
            datatypeArray[dInd++] = "string";
        }
        else if(datatype == "error"){
            datatypeArray[dInd++] = "error";
        }else{
            datatypeArray[dInd++] = "";
        }
    }

    console.log(columns);

    var rowCount  = self.data[0]["data"].length;
    var colCount  = Object.keys(self.data).length;
    var data = [];

    for(var rowIndex = 0 ; rowIndex < rowCount ; rowIndex++){
        data[rowIndex] = [];
        for(var colIndex = 0 ; colIndex < colCount ; colIndex++){
            data[rowIndex][colIndex] = self.data[colIndex]["data"][rowIndex];
        }
    }

    var table = d3.select("#importedTable")
                    .append("table")
                    .style("border-collapse", "collapse")
                    .style("border", "1px black solid");

    //set the columns width
    table.selectAll("col")
    .data(columns)
    .enter()
    .append("col")
    .style("width", "150px");

    thead       = table.append("thead");
    tbody       = table.append("tbody");

    var svgRow = thead.selectAll("tr")
        .data([1])
        .enter()
        .append("tr")
        .style("border", "1px black solid")
        .style("padding","5px");

    var svgCells = svgRow.selectAll("th")
                            .data(datatypeArray)
                            .enter()
                            .append("th")
                            .style("border", "1px black solid")
                            .style("font-size", "12px")
                            .style("overflow", "hidden")
                            .style("height", "100px")
                            .on("mouseover", function(){d3.select(this).style("background-color", "aliceblue")})
                            .on("mouseout", function(){d3.select(this).style("background-color", "white")});

    //
    var svg = svgCells.append("svg")
                        //.text(function(d) { return d; })
                        .style("height", "100%")
                        .style("width", "100%");

    svg.append("g");


    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function(d) { return d; })
        .style("border", "1px black solid")
        .style("padding", "5px")
        .style("font-size", "12px");

    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(d){return d;})
        .enter()
        .append("td")
        .text(function(d) { return d; })
        .style("border", "1px black solid")
        .style("padding", "5px")
        .style("font-size", "12px")
        .style("overflow", "hidden")
        .on("mouseover", function(){d3.select(this).style("background-color", "aliceblue")})
        .on("mouseout", function(){d3.select(this).style("background-color", "white")});


    //todo check this out !!!
    /*.data(function(row) {
        return columns.map(function(column) {
            return {column: column, value: row[column]};
        });
    })*/



    //this will contain the each col data
    //self.data

    //ref:http://christopheviau.com/d3_tutorial/
    /*var sampleHTML = d3.select("#importedTable")
        .append("table")
        .style("border-collapse", "collapse")
        .style("border", "2px black solid")

        .selectAll("tr")
        .data(data)
        .enter().append("tr")

        .selectAll("td")
        .data(function(d){return d;})
        .enter().append("td")
        .style("border", "1px black solid")
        .style("padding", "5px")
        .on("mouseover", function(){d3.select(this).style("background-color", "aliceblue")})
        .on("mouseout", function(){d3.select(this).style("background-color", "white")})
        .text(function(d){return d;})
        .style("font-size", "12px");*/

    //todo add exit and remove for the table
}