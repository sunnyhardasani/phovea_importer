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
    self.displayRowCount = 10;

    self.init();
}

Table.prototype.reload = function(_data) {
    var self = this;

    self.data = _data;
    self.displayRowCount = 10;

    self.init();
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

    var self = this;

    //ref:http://christopheviau.com/d3_tutorial/
    var sampleHTML = d3.select("#importedTable")
        .append("table")
        .style("border-collapse", "collapse")
        .style("border", "2px black solid")

        .selectAll("tr")
        .data(self.tableData)
        .enter().append("tr")

        .selectAll("td")
        .data(function(d){return d;})
        .enter().append("td")
        .style("border", "1px black solid")
        .style("padding", "5px")
        .on("mouseover", function(){d3.select(this).style("background-color", "aliceblue")})
        .on("mouseout", function(){d3.select(this).style("background-color", "white")})
        .text(function(d){return d;})
        .style("font-size", "12px");

    //todo add exit and remove for the table
}