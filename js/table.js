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
    self.printCharts();
}

Table.prototype.reload = function(_data) {
    var self = this;

    self.data = _data;
    self.displayRowCount = 15;
    console.log(self.displayRowCount);

    //self.init();
    self.updateTable() //todo remove
    self.printCharts();
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
    self.printCharts();

}

Table.prototype.printCharts =  function(){

    var self = this;
    console.log(1);
    for(key in self.data) {
        var col = self.data[key];
        var dataTypeObj  = col.dataTypeObj;
        var dataType = dataTypeObj.type;


        //add the printing logic per column
        var svgArea = "#col-"+(col.id-1);
        console.log(svgArea);
        if(dataType =="nominal"){
            //console.log(2)

            var freqMap = dataTypeObj.keyCountMap;
            var keys = Object.keys(freqMap);
            var d3FreMap = d3.entries(freqMap);
            console.log(d3.entries(freqMap));

            /*d3.select(svgArea).selectAll("rect")
                .data(d3FreMap)
                .enter()
                .append("rect")
                .attr("x",function(d,i){
                    console.log(d);
                    console.log(d.value.value);
                    return i*11;
                })
                .attr("width","10")
                .attr("height",function(d,i){
                    return d.value.value;
                })
                .style("fill","green");*/

            //refernce : http://jsfiddle.net/59vLw/
            var margin = {top: 0, right: 0, bottom: 0, left: 0},
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
 * This will print the table and svg content on the webpage
 */
Table.prototype.updateTable = function(){

    //todo divide this function into different functiosn
    //todo fix the table width
    //read the data type information min max value all needs to be stored for display purpose
    //optimize the code
    var self = this;
    var columns = [];
    var datatypeArray = [];

    //this will look for the data  in
    var ind = 0;
    var dInd = 0;
    for(key in self.data) {
        var col = self.data[key];
        columns[ind++] = col["colId"];
    }

    //take the row count and col count
    var rowCount  = self.data[0]["data"].length;
    var colCount  = Object.keys(self.data).length;
    var data = [];

    // this will create the data 2d array which
    // will be used to print the data
    for(var rowIndex = 0 ; rowIndex < rowCount ; rowIndex++){
        data[rowIndex] = [];
        for(var colIndex = 0 ; colIndex < colCount ; colIndex++){
            data[rowIndex][colIndex] = self.data[colIndex]["data"][rowIndex];
        }
    }

    //now the printing begins
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
                            .data(columns)
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
                        .style("height", "100%")
                        .style("width", "100%");

    svg.append("g")
        .attr("id",function(d,i){
            return "col-"+i;
        });


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

}