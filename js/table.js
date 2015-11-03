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
    self.displayRowCount = DISPLAY_ROW_COUNT;
    self.currPage = 1;
    self.dataToDisplay = [];

    //load file data and call initialize
    self.init();

}

/**
 * this function will called when new file
 * is loaded on the same session
 * @param _data
 */
Table.prototype.reload = function(_data) {
    var self = this;

    self.data = _data;
    self.displayRowCount = DISPLAY_ROW_COUNT;
    self.currPage = 1;
    self.dataToDisplay = [];

    //load file data and call initialize
    self.init();
}

/**
 * Only constructor or reload function call
 * this function this will load the data and
 * update the pagination, update table and
 * print charts
 */
Table.prototype.init = function() {
    var self = this;

    //take the row count and col count
    self.rowCount  = self.data[0]["data"].length;
    self.colCount  = Object.keys(self.data).length;
    self.totalPages = Math.ceil(self.rowCount/DISPLAY_ROW_COUNT);


    self.updatePagination();
    self.printTableHeaders();
    self.paginate(self.currPage);
    self.printCharts();
}


/**
 *
 */
Table.prototype.updatePagination = function(){
    var self = this;

    //total pages in the pagination;
    var pageData = [];

    //this will create the page
    pageData.push("previous");
    for(i =0 ; i < self.totalPages && i < 10; i++){
        pageData.push(i+1);
    }
    pageData.push("next");

    var pagination = d3.select("#paginate").selectAll(".pagination");
    var page = pagination.selectAll("li").data(pageData);

    page.enter().append("li")
        .append("a")
        .text(function(d){return d;})
        .style("cursor","pointer")
        .on("click",function(d){
            return self.paginate(d);
        });

   /* page.text(function(d){return d;})
        .style("cursor","pointer")
        .on("click",function(d){
            return self.paginate(d);
        });*/
}

/**
 * todo later if row count display multiple change is required
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

    self.currPage = page;

    //this function will update the table
    self.fetchPageData(self.currPage);
    self.updateTable();
    //alert("hit");

}


Table.prototype.printCharts =  function(){

    var self = this;

    for(key in self.data) {
        var col = self.data[key];
        var dataTypeObj  = col.dataTypeObj;
        var dataType = dataTypeObj.type;


        //add the printing logic per column
        var svgArea = "#col-"+(col.id-1);

        if(dataType =="nominal"){

            var freqMap = dataTypeObj.keyCountMap;
            var keys = Object.keys(freqMap);
            var d3FreMap = d3.entries(freqMap);

            //refernce : http://jsfiddle.net/59vLw/
            var margin = {top: 5, right: 0, bottom: 0, left: 0},
                width = 150 - margin.left - margin.right,
                height = 100 - margin.top - margin.bottom;

            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1);

            var y = d3.scale.linear()
                .range([height, 0]);

            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return d.key
                         + "&nbsp; <span style='color:red'>" + d.value.value + "</span>";
                })

            var svg = d3.select(svgArea)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.call(tip);

            // The following code was contained in the callback function.
            x.domain(d3FreMap.map(function(d) { return d.key; }));
            y.domain([0, d3.max(d3FreMap, function(d) { return d.value.value; })]);

            svg.selectAll(".bar")
                .data(d3FreMap)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d.key); })
                .attr("width", x.rangeBand())
                .attr("y", function(d) {return y(d.value.value); })
                .attr("height", function(d) { return (height - y(d.value.value)) < 10 ? 10 : 10 + (height - y(d.value.value)) ; })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)

            function type(d) {
                d.value.value = +d.value.value;
                return d;
            }
        }
        else if(dataType =="numerical"){
        }
        else if(dataType =="string"){
        }
        else if(dataType =="error"){
        }
    }
}

/**
 * update columns
 */
Table.prototype.printTableHeaders = function(){
    var self = this;

    var columns = [];

    //this will look for the data  in
    var ind = 0;
    var dInd = 0;
    for(key in self.data) {
        var col = self.data[key];
        columns[ind++] = col["colId"];
    }

    self.table = d3.select("#importedTable").append("table")
                            .style("border-collapse", "collapse")
                            .style("border", "1px black solid");

    //set the columns width
    self.table.selectAll("col")
            .data(columns)
            .enter()
            .append("col")
            .style("width", "150px");

    // making it global as regularly used by the function to update the cell value
    self.thead = self.table.append("thead");
    self.tbody = self.table.append("tbody");

    //add svg row in thhead
    var svgRow = self.thead.selectAll("tr")
        .data([1])
        .enter()
        .append("tr")
        .style("border", "1px black solid")
        .style("padding","5px");

    //add multiple svg cell per column
    var svgCells = svgRow.selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .style("border", "1px black solid")
        .style("font-size", "12px")
        .style("overflow", "hidden")
        .style("height", "100px")
        .on("mouseover", function(){d3.select(this).style("background-color", "aliceblue")})
        .on("mouseout", function(){d3.select(this).style("background-color", "white")});

    //add svg in svg cell
    var svg = svgCells.append("svg")
        .style("height", "100%")
        .style("width", "100%");

    //add svg
    svg.append("g")
        .attr("id",function(d,i){
            return "col-"+i;
        });

    // add the column id names
    self.thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function(d) { return d; })
        .style("border", "1px black solid")
        .style("padding", "5px")
        .style("font-size", "12px");
}

/**
 * todo : most important function to add intelligence to perform calculation
 * this function will take the data required to
 * display the data fetch
 *
 * In future this function might take few more argument
 * and perform the some data wrangling to fetch the data
 * reqruied to display
 */
Table.prototype.fetchPageData = function(pageNum) {
    var self = this;

    var rowIndex = 0;
    // this will create the data 2d array which
    // will be used to print the data
    for(var index = (pageNum - 1) * DISPLAY_ROW_COUNT ; index < ((pageNum - 1) * DISPLAY_ROW_COUNT) + DISPLAY_ROW_COUNT && index < self.rowCount ; index++){
        self.dataToDisplay[rowIndex] = [];
        for(var colIndex = 0 ; colIndex < self.colCount ; colIndex++){
            self.dataToDisplay[rowIndex][colIndex] = self.data[colIndex]["data"][index];
        }
        rowIndex++;
    }
}

/**
 * This will print the table and svg content on the webpage
 */
Table.prototype.updateTable = function(){

    var self = this;

    // create a row for each object in the data
    var rows = self.tbody.selectAll("tr")
        .data(self.dataToDisplay);

    //for introducing fresh rows
    rows.enter().append("tr");

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(d){ return d;});

    //for fresh cell values
    cells.enter()
        .append("td")
        .text(function(d) { return d; })
        .style("border", "1px black solid")
        .style("padding", "5px")
        .style("font-size", "12px")
        .style("overflow", "hidden")
        .on("mouseover", function(){d3.select(this).style("background-color", "aliceblue")})
        .on("mouseout", function(){d3.select(this).style("background-color", "white")});

    //for updating cell values
    cells
        .text(function(d) { return d; })
        .style("border", "1px black solid")
        .style("padding", "5px")
        .style("font-size", "12px")
        .style("overflow", "hidden")
        .on("mouseover", function(){d3.select(this).style("background-color", "aliceblue")})
        .on("mouseout", function(){d3.select(this).style("background-color", "white")});


    //remove in case data is not there
    cells.exit().remove();
    rows.exit().remove();


}