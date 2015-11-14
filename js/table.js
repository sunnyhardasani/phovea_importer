/**
 * Created by Sunny Hardasani on 13/10/2015
 */

/**
 *
 * @param _fileData
 * @constructor
 */
function Table(_data, _parentInstance){
    var self = this;

    self.data = _data;
    self.displayRowCount = DISPLAY_ROW_COUNT;
    self.currPage = 1;
    self.dataToDisplay = [];
    self.parentInstance = _parentInstance;

    //load file data and call initialize
    self.init();
}

/**
 * this function will called when new file
 * is loaded on the same session
 * @param _data
 */
Table.prototype.reload = function(_data, _parentInstance) {
    var self = this;

    self.data = _data;
    self.displayRowCount = DISPLAY_ROW_COUNT;
    self.currPage = 1;
    self.dataToDisplay = [];
    self.parentInstance = _parentInstance;

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

    //this will set on resizable columns
    $("table").resizableColumns();
    $("#string-opr-menu > img").click( function(){
        $('#table-group').attr("class","col-md-12");
        $('#operations').attr("class","col-md-0 hidden");
    });
}


/**
 *
 */
Table.prototype.updatePagination = function(){
    var self = this;

    //total pages in the pagination;
    var pageData = [];

    //this will create the page
    //todo clean the following code to handle pagination logic
    //todo pagination display on page not working properly when pages reache to end

    /*if(self.totalPages - self.currPage < 10){
        x = self.totalPages - 10;
    }else*/{
        x = self.currPage;
    }

    pageData.push("previous");
    for(i =0; ( x + i) < self.totalPages && i < 10; i++){
        if(self.currPage < 7){
            pageData.push(i+1);
        }
        else{
            pageData.push((self.currPage - 6) + i+1);
        }
    }
    pageData.push("next");

    var pagination = d3.select("#paginate").selectAll(".pagination");
    var page = pagination.selectAll("li").data(pageData);

    page.enter()
        .append("li")
        .attr("class",function(d){ if(d == self.currPage) return "active";})
        .append("a")
        .text(function(d){return d;})
        .style("cursor","pointer")
        .on("click",function(d){
            return self.paginate(d);
        });

    page.attr("class",function(d){ if(d == self.currPage) return "active";})
        .select("a")
        .text(function(d){return d;})
        .style("cursor","pointer")
        .on("click",function(d){
            return self.paginate(d);
        });

    page.exit().remove();

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

    if(page === "next"){
        self.currPage = self.currPage + 10;
        if (self.currPage > self.totalPages) {
            self.currPage = self.totalPages - 10;
        }
    }
    else if(page === "previous") {
        self.currPage = self.currPage - 10;
        if (self.currPage < 0) {
            self.currPage = 1;
        }
    }else{
        self.currPage = page;
    }

    //this function will update the table
    self.fetchPageData(self.currPage);
    self.updateTable();
    self.updatePagination();
}


Table.prototype.printCharts =  function(){

    var self = this;

    for(key in self.data) {

        var col = self.data[key];
        var dataTypeObj  = col.dataTypeObj;
        var dataType = dataTypeObj.type;


        //add the printing logic per column
        var svgArea = "#svg-col-"+(col.id-1);
        var margin = {top: 5, right: 5, bottom: 0, left: 5},
            width = 150 - margin.left - margin.right,
            height = 100 - margin.top - margin.bottom;

        if(dataType =="nominal"){

            var freqMap = dataTypeObj.keyCountMap;
            var keys = Object.keys(freqMap);
            var d3FreMap = d3.entries(freqMap);


            //refernce : http://jsfiddle.net/59vLw/
            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1);

            var y = d3.scale.linear()
                .range([height, 0]);

            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return "Freq[&nbsp;" + d.key
                         + "&nbsp;]:  <span style='color:red'>" + d.value.value + "</span>";
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

            var min = dataTypeObj.min;
            var max = dataTypeObj.max;

            var histogram = d3.layout.histogram().bins(/*settings.bins*/10)
            (dataTypeObj.data);

            var x = d3.scale.ordinal()
                .domain(histogram.map(function(d) { return d.x; }))
                .rangeRoundBands([0, width]);

            var y = d3.scale.linear()
                .domain([0, d3.max(histogram, function(d) { return d.y; })])
                .range([0, height/* - settings.bottompad*/]);


            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return "<strong>Range: [</strong> <span style='color:red'>" + d3.min(d)+" - "+d3.max(d) + "</span><strong>]</strong>";
                });

            var vis = d3.select(svgArea)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("width", width)
                .attr("height", height);

            vis.call(tip);

            vis.selectAll("rect")
                .data(histogram)
                .enter().append("svg:rect")
                .classed("numerical-bar",true)
                .classed("numerical-bar:hover",true)
                // move the bars down by their total height, so they animate up (not down)
                .attr("transform", function(d) { return "translate(" + x(d.x) + "," + (height - y(d.y)) + ")"; })
                .attr("width", x.rangeBand()-1) //-1 for setting difference between bars
                .attr("y", 0)
                .attr("height", function(d) { return y(d.y); })
                //setting up the tips
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            // bottom line
            vis.append("svg:line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", height)
                .attr("y2", height);


            // bucket numbers
            vis.selectAll("text")
                .data(histogram)
                .enter().append("svg:text")
                .attr("x", function(d, i) { return x(d.x) + x.rangeBand() / 2; })
                .attr("y", height)
                .attr("width", x.rangeBand());

        }
        else if(dataType =="string"){

        }
        else if(dataType =="error"){

            var min = dataTypeObj.min;
            var max = dataTypeObj.max

            var histogram = d3.layout.histogram().bins(10) //todo set the bin count in the setting folder
            (d3.values(dataTypeObj.numberMap));

            console.log(col.colId,histogram);

            //new value added for error histogram
            histogram[10] = new Array;

            //todo check this logic with other data
            if(histogram[9].dx == 0){
                histogram[9].x = 0;
                histogram[10].x = 50;
            }
            else {
                histogram[10].x = histogram[9].x + histogram[9].dx;
            }
            histogram[10].y = d3.values(dataTypeObj.stringMap).length;

            var x = d3.scale.ordinal()
                .domain(histogram.map(function(d) { return d.x; }))
                .rangeRoundBands([0, width]);

            var y = d3.scale.linear()
                .domain([0, d3.max(histogram, function(d) { return d.y; })])
                .range([0, height]);

            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d,i) {

                    if(i==(histogram.length-1))
                        return "<strong>Invalid &nbsp; values &nbsp; frequency &nbsp; : </strong> <span style='color:red'>" + d.y + "</span><strong></strong>";

                    return "<strong>Range: [</strong> <span style='color:red'>" + d3.min(d)+" - "+d3.max(d) + "</span><strong>]</strong>";
                });

            var vis = d3.select(svgArea)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("width", width)
                .attr("height", height);

            vis.call(tip);

            vis.selectAll("rect")
                .data(histogram)
                .enter().append("svg:rect")
                .classed("numerical-bar",true)
                .classed("numerical-bar:hover",true)

                // move the bars down by their total height, so they animate up (not down)
                .attr("transform", function(d) { return "translate(" + x(d.x) + "," + (height - y(d.y)) + ")"; })
                .attr("width", x.rangeBand()-1) //-1 for setting difference between bars
                .attr("y", 0)
                .attr("height", function(d) { return y(d.y); })

                //adding separate color for bar graph
                .style("fill", function(d,i) {if(i==(histogram.length-1)) return "#FF3333"; })

                //setting up the tips
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);
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
        columns[ind++] = col;
    }
    var tableWidth = ind * 150;

    self.table = d3.select("#importedTable").append("table")
                            .attr("id", "data-table")
                            .style("border-collapse", "collapse")
                            .style("border", "1px black solid")
                            .style("width", ""+tableWidth+"px"); //todo string type

       // making it global as regularly used by the function to update the cell value
    self.thead = self.table.append("thead");
    self.tbody = self.table.append("tbody");

    //add svg row in thhead
    var svgRow = self.thead.append("tr")
        .style("border", "1px black solid")
        .style("padding","5px");

    //add multiple svg cell per column
    var svgCells = svgRow.selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .attr("id",function(d,i){
            return "col-"+i;
        })
        .style("border", "1px black solid")
        .style("font-size", "12px")
        .style("overflow", "hidden")
        .style("height", "100px")
        .on("mouseover", function(){d3.select(this).style("background-color", "aliceblue")})
        .on("mouseout", function(){d3.select(this).style("background-color", "white")});

    var opr  = svgCells.append("div").style("height","20px")

    var datatype = opr.append("div")
                        .text(function(d){
                                return d.dataTypeObj.type;
                            })
                        .style("overflow","hidden")
                        .style("text-overflow","ellipsis")
                        .style("width","50px")
                        .style("float","left")
                        .style("background-color", "lightgrey");

    var closeImg = opr.append("div")
                .style("text-align","right");

    closeImg.append("img")
        .attr("src","/Importer/img/CloseWindow.png")
        .style("margin-right","5px")
        .on("click",function(d,i){
            self.hideColumn(i);
        })

    /*//todo for diply on mouse hover
     .style("width","10")
     .on("mouseover", function(){
     d3.select(this).style("display", "inline")
     })
     .on("mouseout", function(){
     d3.select(this).style("display", "none")
     });*/

    //add svg in svg cell
    var svg = svgCells.append("svg")
        .style("height", "100%")
        .style("width", "100%");

    //add svg
    svg.append("g")
        .attr("id",function(d,i){
            return "svg-col-"+i;
        });

    // add the column id names
    self.thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function(d) { return d.colId; })
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
Table.prototype.updateTable = function() {

    var self = this;
    var tableData = self.data;

    // create a row for each object in the data
    var rows = self.tbody.selectAll("tr")
        .data(self.dataToDisplay);

    //for introducing fresh rows
    rows.enter().append("tr");

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function (d) {
            return d;
        });



    //for fresh cell values
    cells.enter()
        .append("td")
        .text(function (d) {
            return d;
        })
        .style("border", "1px black solid")
        .style("padding", "5px")
        .style("font-size", "12px")
        .style("overflow", "hidden")
        .on("mouseup",function(d,i){
            if(self.data[i]["dataTypeObj"].type == "string"){
                // when selection is done on the string column
                return self.mouseUpEventTriggered(i);
            }
        })
        .on("mouseover", function () {
            d3.select(this).style("background-color", "aliceblue")
        })
        .on("mouseout", function () {
            d3.select(this).style("background-color", "white")
        });


    //for updating cell values
    cells.text(function (d) {
            return d;
        })
        .attr("id",function(d,i){
                return "col-"+i;
        })
        .style("border", "1px black solid")
        .style("padding", "5px")
        .style("font-size", "12px")
        .style("overflow", "hidden")
        .on("mouseover", function () {
            d3.select(this).style("background-color", "aliceblue")
        })
        .on("mouseout", function () {
            d3.select(this).style("background-color", "white")
        });


    //remove in case data is not there
    cells.exit().remove();
    rows.exit().remove();
}

/**
 * This function will be called when text is select on the
 * string column
 *
 * 1. triggered when the user make some selection on the string column
 * 2. this will send the selected range to the guessRegex function to guess the regex
 * 3. this function will call another function to highlight on the selected
 *    column (that function will be called always when user changes the table)
 * 4. this function will send the regex to to another function which will
 *    perform regex operations on the complete data of the column.
 *
 * @param col - column number
 */
Table.prototype.mouseUpEventTriggered = function(col) {
    var self = this;

    var selection;
    if (window.getSelection) {
        selection = window.getSelection()/*.getRangeAt(0)*/;
    } else if (document.selection) {
        selection = document.selection.createRange();
    }

    var selStr = selection.toString().trim();
    if(selStr.length > 0 ) {

        //guess regex from the selection and given column
        self.guessRegex(selection,col);
        //this function will highlight regex text on that particular column
        self.highlightColumn(col);

        // this function will show the hidden div
        // on the right side of the table
        if(self.stringOperations == null) {
            self.stringOperations = new StringOperations(self.data,col,self.regex, self);
        }
        else {
            self.stringOperations.reload(self.data,col,self.regex, self);
        }
    }
}

/**
 * This function will higlight the column ht
 * References: http://jsbin.com/iriwaw/2/edit?html,js,output
 * TODO:
 * 1. Add handling when the new page gets loaded it changes
 * @param col
 */
Table.prototype.highlightColumn = function(col) {
    var self = this;
    var startIndexOfData = 2;

    //now make the regex for the selection operations
    var x = document.getElementById('data-table').rows;
    for (var i = startIndexOfData; i < DISPLAY_ROW_COUNT + startIndexOfData ; i++) {
        var y = x[i].cells;
        y[col].innerHTML = y[col].textContent.replace(new RegExp('('  +   self.regex   +    ')','gi'), '<span style="background-color:#c4e3f3">$1</span>');
    }
}

/**
 * This function will parse the text information
 * and guess regex automatically
 * TODO:
 * 1. Logic pending need to be decided when
 * @param selection
 * @param col
 */
Table.prototype.guessRegex = function(selection, col) {
    var self = this;

    /*var startOff = selection.startOffset;
    var endOff = selection.endOffset;
    var selStr = selection.startContainer.textContent;

    // get the start index
    var startChar;
    for(var ind = startOff; ind >= 0 ; ind-- ){
        if(!((selStr[ind] >='a' && selStr[ind] <= 'z')
            || (selStr[ind] >='A' && selStr[ind] <= 'Z')
            || (selStr[ind] == ' ')
            || (selStr[ind] >='0' && selStr[ind] <= '9'))){
            startChar = selStr[ind];
            console.log(selStr,ind);
            console.log(startChar);
            break;
        }
    }

    var endChar;
    for(var ind = endOff; ind <= selStr.length ; ind++ ){
        console.log(selStr);
        if(!((selStr[ind] >='a' && selStr[ind] <= 'z')
            || (selStr[ind] >='A' && selStr[ind] <= 'Z')
            || (selStr[ind] === ' ')
            || (selStr[ind] >='0' && selStr[ind] <= '9'))){
            endChar = selStr[ind];
            console.log(selStr,ind);
            console.log(endChar);
            break;
        }
        console.log(selStr,ind);
    }

    self.regex = "";
    if(startChar && startChar.length > 0)
        self.regex = self.regex + "(?="+startChar+")";
    self.regex = self.regex + "[0-9a-zA-Z\\s]+";
    if(endChar && endChar.length > 0)
        self.regex = self.regex + "(?=["+endChar+"])";

    console.log(self.regex);*/

    // currently setting the default regex
    self.regex = "(?![.:])[a-zA-Z\\s]+(?=[-])";
}

/**
 * This function will take the column id and hide the column
 * @param col
 */
Table.prototype.hideColumn = function(col) {

    var self = this;

    //setting the column width to 0
    document.getElementsByTagName('th')[col].style.width = '0%';

    //calling the resize event to restore the divs
    $(window).trigger('resize');
}