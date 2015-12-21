/**
 * Created by Sunny Hardasani on 13/10/2015
 */

define(["jquery",
        "d3",
        "d3-tip",
        "colorbrewer",
        "dataWrangler",
        "table",
        "jquery-resizable-columns",
        "fileConfiguration",
        "stringOperations"],function () {

    //instance of the class
    var instance = null;

    /**
     * if class is reinitilized then throws an eror
     * @constructor
     */
    function Table(){
        if(instance !== null){
            throw new Error("Cannot instantiate more than one Table, use Table.getInstance()");
        }
    }

    /**
     * returns an instance of the class
     * @returns {*}
     */
    Table.getInstance = function(){
        // summary: Gets an instance of the singleton. It is better to use
        if(instance === null){
            instance = new Table();
        }
        return instance;
    };

    /**
     * this function will called when new file
     * is loaded on the same session
     * @param _data
     */
    Table.prototype.reload = function (_data, _parentInstance) {
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
     * only constructor or reload function call
     * this function this will load the data and
     * update the pagination, update table and
     * print charts
     */
    Table.prototype.init = function () {
        var self = this;

        //take the row count and col count
        self.rowCount = self.data[0]["data"].length;
        self.colCount = Object.keys(self.data).length;
        self.totalPages = Math.ceil(self.rowCount / DISPLAY_ROW_COUNT);

        self.createColorBox();
        self.createDataTypeBox();
        self.updatePagination();
        self.printTableHeaders();
        self.paginate(self.currPage);
        self.printCharts();

        //this will set on resizable columns
        $("table").resizableColumns(); //todo to start resizable columns
        $("#string-opr-menu > img").click(function () {
            $('#table-group').attr("class", "col-md-12");
            $('#operations').attr("class", "col-md-0 hidden");
        });

        // requireJS will ensure that the DataWrangler definition is available
        // to use, we can now import it for use.
        var FileConfiguration = require('fileConfiguration');
        FileConfiguration.tempDataLoad(self.data);
    }


    /**
     *
     */
    Table.prototype.updatePagination = function () {
        var self = this;

        //total pages in the pagination;
        var pageData = [];

        //this will create the page
        //todo clean the following code to handle pagination logic
        //todo pagination display on page not working properly when pages reache to end

        /*if(self.totalPages - self.currPage < 10){
         x = self.totalPages - 10;
         }else*/
        {
            x = self.currPage;
        }

        //handling for first six pages
        if (self.currPage <= 3) {
            for (i = 1; i < self.totalPages && i <= 5; i++) {
                pageData.push(i);
            }
            pageData.push("next");
        }
        //handling for last six pages
        else if (self.totalPages - self.currPage >= 1 && self.totalPages - self.currPage <= 6) {
            pageData.push("previous");

            for (var i = self.totalPages - 6; i < self.totalPages; i++) {
                pageData.push(i);
            }
        }
        //any page between them
        else {

            pageData.push("previous");

            for (var i = -2; i <= 2; i++)
                pageData.push(self.currPage + i);

            pageData.push("next");

        }

        var pagination = d3.select("#paginate").selectAll(".pagination");
        var page = pagination.selectAll("li").data(pageData);

        page.enter()
            .append("li")
            .attr("class", function (d) {
                if (d == self.currPage) return "active";
            })
            .append("a")
            .text(function (d) {
                return d;
            })
            .style("cursor", "pointer")
            .on("click", function (d) {
                return self.paginate(d);
            });

        page.attr("class", function (d) {
            if (d == self.currPage) return "active";
        })
            .select("a")
            .text(function (d) {
                return d;
            })
            .style("cursor", "pointer")
            .on("click", function (d) {
                return self.paginate(d);
            });

        page.exit().remove();

    }

    /**
     * todo later if row count display multiple change is required
     * @param rowCount
     */
    Table.prototype.changeRowCount = function (rowCount) {
        var self = this;
        self.displayRowCount = rowCount;
    }

    /**
     * page can be in the range from 1,2,...,n
     * @param page
     */
    Table.prototype.paginate = function (page) {

        var self = this;

        if (page === "next") {
            self.currPage = self.currPage + 5;
            if (self.currPage > self.totalPages) {
                self.currPage = self.totalPages - 5;
            }
        }
        else if (page === "previous") {
            self.currPage = self.currPage - 5;
            if (self.currPage < 0) {
                self.currPage = 1;
            }
        } else {
            self.currPage = page;
        }

        //this function will update the table
        self.fetchPageData(self.currPage);
        self.updateTable();
        self.updatePagination();
    }

    /**
     * this function will create the data type box
     * @param colId
     */
    Table.prototype.createDataTypeBox = function (colId) {
        var self = this;

        $('#datatype-pop-up input:radio').prop('checked', false);
        $('#datatype-pop-up input:radio').off('click');
        $('#datatype-pop-up input:radio').click(function () {
            if ($(this).val() === DATATYPE_STRING) {
                self.parentInstance.changeDataType(colId, DATATYPE_STRING);
            }
            else if ($(this).val() === DATATYPE_NOMINAL) {
                self.parentInstance.changeDataType(colId, DATATYPE_NOMINAL);
            }
            else if ($(this).val() === DATATYPE_NUMERICAL) {
                self.parentInstance.changeDataType(colId, DATATYPE_NUMERICAL);
            }
            else if ($(this).val() === DATATYPE_ORDINAL) {
                //self.parentInstance.changeDataType(colId,DATATYPE_ORDINAL);
            }

            $('#datatype-pop-up').hide();
        });

    }

    /**
     * this fucntion will create the color box
     * which appear on click of the bar graph
     */
    Table.prototype.createColorBox = function () {
        var self = this;

        self.colorBox = d3.select("#colorbox-pop-up")
            .append("div")
            .attr("class", "allcolor")
            .selectAll(".palette")
            .data(d3.entries(colorbrewer))
            .enter().append("div")
            .attr("class", "palette")
            .attr("title", function (d) {
                return d.key;
            });
    }

    /**
     * this function will print the charts
     */
    Table.prototype.printCharts = function () {

        var self = this;

        for (key in self.data) {

            var col = self.data[key];
            var dataTypeObj = col.dataTypeObj;
            var dataType = dataTypeObj.type;

            //add the printing logic per column
            var svgArea = "#svg-col-" + (col.id - 1);
            var temp = svgArea;
            var margin = {top: 5, right: 5, bottom: 0, left: 5},
                width = 150 - margin.left - margin.right,
                height = 100 - margin.top - margin.bottom;

            if (dataType == "nominal") {

                var freqMap = dataTypeObj.keyCountMap;
                var keys = Object.keys(freqMap);
                var d3FreMap = d3.entries(freqMap);

                var drag = d3.behavior.drag()
                    .origin(function (d) {
                        return d;
                    })
                    .on("drag", dragmove)
                    .on("dragend", dragstop);

                //refernce : http://jsfiddle.net/59vLw/
                var x = d3.scale.ordinal()
                    .rangeRoundBands([0, width], .1);

                var y = d3.scale.linear()
                    .range([height, 0]);


                var o = d3.scale.ordinal()
                    .domain(d3FreMap.map(function (d) {
                        return d.key;
                    }))
                    .range(colorbrewer.Set1[9]);

                /*var tip = d3.tip()
                 .attr('class', 'd3-tip')
                 .offset([-10, 0])
                 .html(function(d) {
                 return "Freq[&nbsp;" + d.key
                 + "&nbsp;]:  <span style='color:red'>" + d.value.value + "</span>";
                 })*/

                var svg = d3.select(svgArea)
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                /*svg.call(tip)*/
                ;

                // The following code was contained in the callback function.
                x.domain(d3FreMap.map(function (d) {
                    return d.key;
                }));
                y.domain([0, d3.max(d3FreMap, function (d) {
                    return d.value.value;
                })]);

                d3FreMap.map(function (d) {

                    d.x = x(d.key);
                    d.y = y(d.value.value);

                    // appending the svg area on the bar graph to fetch information for mouse event
                    d.svg = svgArea;
                });

                var bars = svg.selectAll(".bar")
                    .data(d3FreMap)
                    .enter().append("rect")
                    .attr("svg-info", function (d) {
                        return d.svg;
                    }) // appending the svg area on the bar graph to fetch information for mouse event
                    .attr("class", "bar")
                    .attr("x", function (d) {
                        return d.x;
                    })
                    .attr("width", x.rangeBand())
                    .attr("y", function (d) {
                        return d.y;
                    })
                    .attr("height", function (d) {
                        return (height - y(d.value.value)) < 10 ? 10 : 10 + (height - y(d.value.value));
                    })
                    /*.on('mouseover', tip.show)
                     .on('mouseout', tip.hide)*/
                    .style("fill", function (d) {
                        return o(d.key);
                    })
                    .call(drag)
                    .on("dblclick", function (d) {

                        var selectedSVG = d.svg;

                        self.colorBox.on("click", function (d) {

                            var o = d3.scale.ordinal()
                                .domain(d3FreMap.map(function (d) {
                                    return d.key;
                                }))
                                .range(colorbrewer[d.key][9]);

                            d3.select(selectedSVG).selectAll(".bar")
                                .style("fill", function (d) {
                                    return o(d.key);
                                });

                            $('#colorbox-pop-up').hide();
                        })

                            //todo need to check the below code whether its required or not
                            .selectAll(".swatch")
                            .data(function (d) {
                                return d.value[d3.keys(d.value).map(Number).sort(d3.descending)[0]];
                            })
                            .enter().append("div")
                            .attr("class", "swatch")
                            .style("background-color", function (d) {
                                return d;
                            });

                        $('#colorbox-pop-up')
                            .show()
                            .css('top', d3.event.pageY)
                            .css('left', d3.event.pageX)
                            .appendTo('body');
                    });

                function type(d) {
                    d.value.value = +d.value.value;
                    return d;
                }

                function dragmove(d) {
                    d3.select(this).attr("x", d.x = Math.max(0, Math.min(width - d3.select(this).attr("width"), d3.event.x)))
                }

                function dragstop() {
                }
            }
            else if (dataType == "numerical") {

                var min = dataTypeObj.min;
                var max = dataTypeObj.max;

                var histogram = d3.layout.histogram().bins(/*settings.bins*/10)
                (dataTypeObj.data);

                var x = d3.scale.ordinal()
                    .domain(histogram.map(function (d) {
                        return d.x;
                    }))
                    .rangeRoundBands([0, width]);

                var y = d3.scale.linear()
                    .domain([0, d3.max(histogram, function (d) {
                        return d.y;
                    })])
                    .range([0, height/* - settings.bottompad*/]);


                //todo d3-tip bower error
                /*var tip = d3.tip()
                 .attr('class', 'd3-tip')
                 .offset([-10, 0])
                 .html(function(d) {
                 return "<strong>Range: [</strong> <span style='color:red'>" + d3.min(d)+" - "+d3.max(d) + "</span><strong>]</strong>";
                 });*/

                var vis = d3.select(svgArea)
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .attr("width", width)
                    .attr("height", height);

                //todo d3-tip bower error
                /*vis.call(tip);*/

                vis.selectAll("rect")
                    .data(histogram)
                    .enter().append("svg:rect")
                    .classed("numerical-bar", true)
                    .classed("numerical-bar:hover", true)

                    // move the bars down by their total height, so they animate up (not down)
                    .attr("transform", function (d) {
                        return "translate(" + x(d.x) + "," + (height - y(d.y)) + ")";
                    })
                    .attr("width", x.rangeBand() - 1) //-1 for setting difference between bars
                    .attr("y", 0)

                    .attr("height", function (d) {
                        return y(d.y);
                    })
                    //setting up the tips
                    /*.on('mouseover', tip.show)
                     .on('mouseout', tip.hide)*/;

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
                    .attr("x", function (d, i) {
                        return x(d.x) + x.rangeBand() / 2;
                    })
                    .attr("y", height)
                    .attr("width", x.rangeBand());

            }
            else if (dataType == "string") {

            }
            else if (dataType == "error") {

                if (dataTypeObj.baseType == "numerical") {

                    var histogram = d3.layout.histogram().bins(10) //todo set the bin count in the setting folder
                    (d3.values(dataTypeObj.numberMap));


                    //new value added for error histogram
                    histogram[10] = new Array;

                    //todo check this logic with other data
                    if (histogram[9].dx == 0) {
                        histogram[9].x = 0;
                        histogram[10].x = 50;
                    }
                    else {
                        histogram[10].x = histogram[9].x + histogram[9].dx;
                    }
                    histogram[10].y = d3.values(dataTypeObj.stringMap).length;

                    var x = d3.scale.ordinal()
                        .domain(histogram.map(function (d) {
                            return d.x;
                        }))
                        .rangeRoundBands([0, width]);

                    var y = d3.scale.linear()
                        .domain([0, d3.max(histogram, function (d) {
                            return d.y;
                        })])
                        .range([0, height]);


                    //todo - fix the d3 tip bower error
                    /*var tip = d3.tip()
                     .attr('class', 'd3-tip')
                     .offset([-10, 0])
                     .html(function (d, i) {

                     if (i == (histogram.length - 1))
                     return "<strong>Invalid &nbsp; values &nbsp; frequency &nbsp; : </strong> <span style='color:red'>" + d.y + "</span><strong></strong>";

                     return "<strong>Range: [</strong> <span style='color:red'>" + d3.min(d) + " - " + d3.max(d) + "</span><strong>]</strong>";
                     });*/

                    var vis = d3.select(svgArea)
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .attr("width", width)
                        .attr("height", height);

                    //todo d3-tip error bower error
                    /*vis.call(tip);*/

                    vis.selectAll("rect")
                        .data(histogram)
                        .enter().append("svg:rect")
                        .classed("numerical-bar", true)
                        .classed("numerical-bar:hover", true)

                        // move the bars down by their total height, so they animate up (not down)
                        .attr("transform", function (d) {
                            return "translate(" + x(d.x) + "," + (height - y(d.y)) + ")";
                        })
                        .attr("width", x.rangeBand() - 1) //-1 for setting difference between bars
                        .attr("y", 0)
                        .attr("height", function (d) {
                            return y(d.y);
                        })

                        //adding separate color for bar graph
                        .style("fill", function (d, i) {
                            if (i == (histogram.length - 1)) return "#FF3333";
                        })

                        //setting up the tips
                        /*.on('mouseover', tip.show)
                         .on('mouseout', tip.hide)*/;
                }
                else {

                    var histogram = d3.layout.histogram().bins(10) //todo set the bin count in the setting folder
                    (d3.values(dataTypeObj.stringMap));


                    //new value added for error histogram
                    histogram[10] = new Array;

                    //todo check this logic with other data
                    if (histogram[9].dx == 0) {
                        histogram[9].x = 0;
                        histogram[10].x = 50;
                    }
                    else {
                        histogram[10].x = histogram[9].x + histogram[9].dx;
                    }
                    histogram[10].y = d3.values(dataTypeObj.numberMap).length;

                    var x = d3.scale.ordinal()
                        .domain(histogram.map(function (d) {
                            return d.x;
                        }))
                        .rangeRoundBands([0, width]);

                    var y = d3.scale.linear()
                        .domain([0, d3.max(histogram, function (d) {
                            return d.y;
                        })])
                        .range([0, height]);

                    /*var tip = d3.tip()
                     .attr('class', 'd3-tip')
                     .offset([-10, 0])
                     .html(function (d, i) {

                     if (i == (histogram.length - 1))
                     return "<strong>Invalid &nbsp; values &nbsp; frequency &nbsp; : </strong> <span style='color:red'>" + d.y + "</span><strong></strong>";

                     return "<strong>Range: [</strong> <span style='color:red'>" + d3.min(d) + " - " + d3.max(d) + "</span><strong>]</strong>";
                     });*/

                    var vis = d3.select(svgArea)
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .attr("width", width)
                        .attr("height", height);

                    /*vis.call(tip);*/

                    vis.selectAll("rect")
                        .data(histogram)
                        .enter().append("svg:rect")
                        .classed("numerical-bar", true)
                        .classed("numerical-bar:hover", true)

                        // move the bars down by their total height, so they animate up (not down)
                        .attr("transform", function (d) {
                            return "translate(" + x(d.x) + "," + (height - y(d.y)) + ")";
                        })
                        .attr("width", x.rangeBand() - 1) //-1 for setting difference between bars
                        .attr("y", 0)
                        .attr("height", function (d) {
                            return y(d.y);
                        })

                        //adding separate color for bar graph
                        .style("fill", function (d, i) {
                            if (i == (histogram.length - 1)) return "#FF3333";
                        })

                        //setting up the tips
                        /*.on('mouseover', tip.show)
                         .on('mouseout', tip.hide)*/;
                }
            }
        }
    }

    /**
     * update columns
     */
    Table.prototype.printTableHeaders = function () {
        var self = this;

        var columns = [];

        //this will look for the data  in
        var ind = 0;
        var dInd = 0;
        for (key in self.data) {
            var col = self.data[key];
            columns[ind] = col;
            columns[ind].x = (5 + 130) + (150 * ind); // required for drag and drop selection
            ind++;
        }
        var tableWidth = ind * 150;

        self.table = d3.select("#importedTable").append("table")
            .attr("id", "data-table")
            .style("border-collapse", "collapse")
            .style("border", "1px black solid")
            .style("width", "" + tableWidth + "px"); //todo string type

        // making it global as regularly used by the function to update the cell value
        self.thead = self.table.append("thead");
        self.tbody = self.table.append("tbody");

        //add svg row in thhead
        var svgRow = self.thead.append("tr")
            .style("border", "1px black solid")
            .style("padding", "5px");

        //add multiple svg cell per column
        var svgCells = svgRow.selectAll(".colSvg")
            .data(columns)
            .enter()
            .append("th")
            .classed("colSvg", true)/*
         .attr("id",function(d,i){
         return "col-"+i;
         })*/
            .style("border", "1px black solid")
            .style("font-size", "12px")
            .style("overflow", "hidden")
            .style("height", "100px")
            .on("mouseover", function () {
                d3.select(this).style("background-color", "aliceblue")
            })
            .on("mouseout", function () {
                d3.select(this).style("background-color", "white")
            });

        var opr = svgCells.append("div").style("height", "20px")

        var datatype = opr.append("div")
            .text(function (d) {
                return d.dataTypeObj.type;
            })
            .style("overflow", "hidden")
            .style("text-overflow", "ellipsis")
            .style("width", "50px")
            .style("float", "left")
            .on("dblclick", function (d) { // todo move this in the separate function

                self.createDataTypeBox(d.id - 1);

                $('#datatype-pop-up')
                    .show()
                    .css('top', d3.event.pageY)
                    .css('left', d3.event.pageX)
                    .appendTo('body');
            });

        var closeImg = opr.append("div")
            .style("text-align", "right");

        closeImg.append("span")
            .attr("class", "glyphicon glyphicon-remove-sign")
            .style("margin-right", "5px")
            .on("click", function (d, i) {
                self.hideColumn(i);
            })

        //add svg in svg cell
        var svg = svgCells.append("svg")
            .style("height", "100%")
            .style("width", "100%");

        //add svg
        svg.append("g")
            .attr("id", function (d, i) {
                return "svg-col-" + i;
            });

        ////////////////////start  - code for drag and drop setting /////////////////////////////////
        self.addDragNDrop(columns);
        ////////////////////end - code for drag and drop setting /////////////////////////////////

        // add the column id names
        self.thead.append("tr")
            .selectAll("th")
            .data(columns)
            .enter()
            .append("th")
            .text(function (d) {
                return d.colId;
            })
            .style("border", "1px black solid")
            .style("padding", "5px")
            .style("font-size", "12px");
    }

    /**
     * This function will handle all the drag and drop related operations of the table
     *
     */
    Table.prototype.addDragNDrop = function (columns) {
        var self = this;

        var width = 150 * columns.length,
            height = 12,
            radius = 3,
            radio = 5;

        var drag = d3.behavior.drag()
            .origin(function (d) {
                return d;
            })
            .on("drag", dragmove)
            .on("dragend", dragstop);

        var osvg = self.thead.append("th").attr("colspan", columns.length).append("svg")
            .attr("width", width)
            .attr("height", height);

        var rad1 = osvg.selectAll(".rad")
            .data(columns).enter().append("circle")
            .attr("r", radio)
            .attr("class", "rad")
            .style("fill", "white")
            .style("stroke", "black")
            .style("fill-opacity", 0)
            .attr("cx", function (d, i) {
                return d.x;
            })
            .attr("cy", height / 2)
            .on("click", function (d, i) {
                if (d3.select(c[0][i]).attr("visibility") == "hidden") {
                    d3.select(c[0][i]).attr("visibility", "visible");
                }
                else {
                    d3.select(c[0][i]).attr("visibility", "hidden");
                }
            });

        var c = osvg.selectAll(".dot")
            .data(columns).enter().append("circle")
            .attr("class", "dot")
            .attr("r", radius)
            .style("fill", "black")
            //.style("fill-opacity","0.3")
            .attr("visibility", "hidden")
            .attr("cx", function (d, i) {
                return d.x;
            })
            .attr("cy", height / 2)
            .call(drag);

        var r = osvg.selectAll(".high")
            .data(columns).enter().append("rect")
            .attr("class", "high")
            .style("fill", "black")
            .style("fill-opacity", "0.3")
            .attr("x", function (d, i) {
                return d.x;
            })
            .attr("y", height / 2 - radius)
            .attr("height", radius * 2).call(drag);

        function dragmove(d) {
            var selRecLen = 0;
            d3.select(this)
                .attr("cx", selRecLen = Math.max(d.x, Math.min(width - radius, d3.event.x)));
            d3.select(r[0][d.id - 1]).attr("width", selRecLen - d.x);

            checkRightRadios(d.x, selRecLen);

        }

        function dragstop(d) {
            d3.select(r[0][d.id - 1]).attr("width", 0);
            d3.select(this).attr("cx", d.x)
        }

        function checkRightRadios(fromLoc, currentLoc) {
            for (var i = 0; i < c[0].length; i++) {
                var selectedCircle = d3.select(c[0][i]);
                if (currentLoc > selectedCircle.attr("cx") && selectedCircle.attr("cx") >= fromLoc) {
                    selectedCircle.attr("visibility", "visible");
                }
            }
        }
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
    Table.prototype.fetchPageData = function (pageNum) {
        var self = this;

        var rowIndex = 0;
        // this will create the data 2d array which
        // will be used to print the data
        for (var index = (pageNum - 1) * DISPLAY_ROW_COUNT; index < ((pageNum - 1) * DISPLAY_ROW_COUNT) + DISPLAY_ROW_COUNT && index < self.rowCount; index++) {
            self.dataToDisplay[rowIndex] = [];
            for (var colIndex = 0; colIndex < self.colCount; colIndex++) {
                self.dataToDisplay[rowIndex][colIndex] = self.data[colIndex]["data"][index];
            }
            rowIndex++;
        }
    }

    /**
     * This will print the table and svg content on the webpage
     */
    Table.prototype.updateTable = function () {

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
            .on("mouseup", function (d, i) {
                if (self.data[i]["dataTypeObj"].type == "string") {
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
            .attr("id", function (d, i) {
                return "col-" + i;
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
    Table.prototype.mouseUpEventTriggered = function (col) {
        var self = this;

        var selection;
        if (window.getSelection) {
            selection = window.getSelection()/*.getRangeAt(0)*/;
        } else if (document.selection) {
            selection = document.selection.createRange();
        }

        var selStr = selection.toString().trim();
        if (selStr.length > 0) {

            //guess regex from the selection and given column
            self.guessRegex(selection, col);
            //this function will highlight regex text on that particular column
            self.highlightColumn(col);

            // requireJS will ensure that the StringOperations definition is available
            // to use, we can now import it for use.
            self.stringOperations = require('stringOperations');
            self.stringOperations.reload(self.data, col, self.regex, self);

        }
    }

    /**
     * This function will higlight the column ht
     * References: http://jsbin.com/iriwaw/2/edit?html,js,output
     * TODO:
     * 1. Add handling when the new page gets loaded it changes
     * @param col
     */
    Table.prototype.highlightColumn = function (col) {
        var self = this;
        var startIndexOfData = 2;

        //now make the regex for the selection operations
        var x = document.getElementById('data-table').rows;
        for (var i = startIndexOfData; i < DISPLAY_ROW_COUNT + startIndexOfData; i++) {
            var y = x[i].cells;
            y[col].innerHTML = y[col].textContent.replace(new RegExp('(' + self.regex + ')', 'gi'), '<span style="background-color:#c4e3f3">$1</span>');
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
    Table.prototype.guessRegex = function (selection, col) {
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
    Table.prototype.hideColumn = function (col) {

        var self = this;

        //setting the column width to 0
        document.getElementsByTagName('th')[col].style.width = '0.1%';

        //calling the resize event to restore the divs
        $(window).trigger('resize');
    }

    return Table.getInstance();
});