/**
 * Created by Sunny Hardasani on 13/10/2015
 */

define(["jquery", "d3", "d3-tip",
        "jquery-resizable-columns", "./fileConfiguration",
        "./utility/localSettings", "./utility/modColorBrewer",
        "./top_table/topTableView","./left_table/leftTableView"],
    function ($,d3, d3tip, jqueryResizableColumns, fileConfiguration,
               settings, colorbrewer,topTableView,leftTableView) {


        //defination of the variables
        var DATATYPE_STRING = settings.localSettings().DATATYPE_STRING;
        var DATATYPE_NOMINAL = settings.localSettings().DATATYPE_NOMINAL;
        var DATATYPE_NUMERICAL = settings.localSettings().DATATYPE_NUMERICAL;
        var DATATYPE_ORDINAL = settings.localSettings().DATATYPE_ORDINAL;
        var DATATYPE_ERROR = settings.localSettings().DATATYPE_ERROR;
        var DISPLAY_ROW_COUNT = settings.localSettings().DISPLAY_ROW_COUNT;

        //instance of the class
        var instance = null;

        /**
         * if class is reinitilized then throws an eror
         * @constructor
         */
        function Table() {
            var self = this;

            if (instance !== null) {
                throw new Error("Cannot instantiate more than one Table, use Table.getInstance()");
            }

            //todo this will be updated by taking the constructor parameter
            self.parentElementName = "x-importer-template";
            self.originalDataFlag = true;
        }

        /**
         * returns an instance of the class
         * @returns {*}
         */
        Table.getInstance = function () {
            // summary: Gets an instance of the singleton. It is better to use
            if (instance === null) {
                instance = new Table();
            }
            return instance;
        };

        /**
         * this function will called when new file
         * is loaded on the same session
         * @param _data
         */
        Table.prototype.reload = function (root, _data, _parentInstance) {
            var self = this;
            self.root = root;

            self.data = _data;
            self.displayRowCount = DISPLAY_ROW_COUNT;
            self.currPage = 1;
            self.dataToDisplay = [];
            self.parentInstance = _parentInstance;

            if(self.originalDataFlag){
                self.originalData = _data;
                self.originalDataFlag = false;
                self.rowCount = self.originalData[0]["data"].length;
            }


            //this will remove all the tips
            $(self.root).find(".d3-tip").remove();
            $(self.root).find(".n").remove();

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
            self.colCount = Object.keys(self.data).length;
            self.totalPages = Math.ceil(self.rowCount / DISPLAY_ROW_COUNT);

            self.createDataTypeBox();
            self.updatePagination();
            self.printTableHeaders();
            self.paginate(self.currPage);
            self.printCharts();
            self.highlightRowType();
            self.highlightColType();
            self.highlightIgnoreRows();

            //this will set on resizable columns
            //  $(self.parentElementName + " " + "table").resizableColumns(); //todo to start resizable columns
            $(self.root).find("#string-opr-menu > span").click(function () {
                $(self.root).find('#table-group').attr("class", "col-md-12");
                $(self.root).find('#operations').attr("class", "col-md-0 hidden");
            });
        }

        /**
         * this function will return the data
         * required by the application
         * @returns {*}
         */
        Table.prototype.getLoad = function () {
            return self.data;
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

            var pagination = d3.select(self.root).select("#paginate").selectAll(".pagination");
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



            //this will update the requried highlight on the table
            self.setDefaultTableColor();
            self.highlightRowType();
            self.highlightColType();
            self.highlightIgnoreRows();
        }

        /**
         * this function will set the default color
         * of the table i.e. white, after that
         * ID row and ID col with get highlighted
         */
        Table.prototype.setDefaultTableColor = function(){
            var self = this;

            //changing the default color of the table
            for(key in self.data){
                var col = self.data[key];
                var id = col.id-1;
                var colId = "col-"+id;

                //this function will highlight all the column
                //whose row identifier is true
                var rows = document.getElementsByClassName(colId);
                for (var i = 0; i < rows.length ; i++) {
                    rows[i].style.backgroundColor = "white";
                }
            }
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
                    self.parentInstance.changeDataType(colId, DATATYPE_NOMINAL);
                }
                else if ($(this).val() === DATATYPE_NUMERICAL) {
                    self.parentInstance.changeDataType(colId, DATATYPE_NUMERICAL);
                }
                else if ($(this).val() === DATATYPE_ORDINAL) {
                    self.parentInstance.changeDataType(colId,DATATYPE_ORDINAL);
                }
                $('#datatype-pop-up').hide();
            });

        }

        /**
         * todo temporary code similar to copy settings functionality
         *
         * this fucntion will create the color box
         * which appear on click of the bar graph
         * @param selectedScale
         */
        Table.prototype.createColorBox = function (selectedScale) {
            var self = this;

            //check which scale is selected and
            //create the color box accordingly
            if(selectedScale == "ordinalScale"){
                $('#colorbox-pop-up').css('height', '80');
            }
            else if(selectedScale == "polyLinearScale"){
                $('#colorbox-pop-up').css('height', '80');
            }
            else if(selectedScale == "linearScale") {
                $('#colorbox-pop-up').css('height', '130');
            }

            //remove previously selected child div element
            d3.select("#colorbox-pop-up").select("div").remove();

            //this will add the new div
            self.colorBox = d3.select("#colorbox-pop-up")
                .append("div")
                .attr("class", "allcolor")
                .selectAll(".palette")
                .data(d3.entries(colorbrewer[selectedScale]))
                .enter().append("div")
                .attr("class", "palette")
                .attr("title", function (d) {
                    return d.key;
                });
        }

        /**
         * This function will print the nominal
         * graph and also implement dragndrop
         * features
         * @param _col
         */
        Table.prototype.printNominalGraph  = function(_col, _svgArea){
            var self = this;

            //set up the margins of the svg
            var margin = {top: 5, right: 5, bottom: 0, left: 5},
                width = 150 - margin.left - margin.right,
                height = 100 - margin.top - margin.bottom;

            //take the col
            var col = _col;
            var svgArea = _svgArea;

            //fetch required data
            var selColor = col.colorScheme;
            var dataTypeObj = col.dataTypeObj;
            var dataType = dataTypeObj.type;
            var freqMap = dataTypeObj.keyCountMap;
            var keys = Object.keys(freqMap);
            var d3FreMap = d3.entries(freqMap);
            var index = 0;

            //Set up the required x, y and
            //color scales
            //Reference : http://jsfiddle.net/59vLw/
            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1);
            var y = d3.scale.linear()
                .range([height, 0]);
            var o = d3.scale.ordinal()
                .domain(d3FreMap.map(function (d) {
                    return d.key;
                }))
                .range(selColor);

            //Initialize the d3 tip for displaying
            //value for each bar on mouse hover
            var tip = d3tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function (d) {
                    return d.key + " : " + d.value.value;
                });

            //Form new svg and attach d3 tip
            var svg = d3.select(svgArea)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            svg.call(tip);

            //this will take the take got from the
            //data wrnagler and sort the data accordingly
            //to plot on the graph
            d3FreMap.sort(function (a, b) {
                if (a.value.sortIndex > b.value.sortIndex) {
                    return 1;
                }
                else if (a.value.sortIndex < b.value.sortIndex) {
                    return -1;
                }
                return 0;
            })

            // The following code was contained in the callback function.
            x.domain(d3FreMap.map(function (d) {
                return d.key;
            }));
            y.domain([0, d3.max(d3FreMap, function (d) {
                return d.value.value;
            })]);

            // Attach all the data required by the D3
            d3FreMap.map(function (d) {

                d.x = x(d.key);
                d.y = y(d.value.value);

                //add the real freq object to further sort and take the data
                d.freObjKey = d.key;
                d.freObjValue = d.value;

                // appending the svg area on the bar graph to fetch information for mouse event
                d.index = index++;
                d.svg = svgArea;
                d.colId = col.id - 1;

            });

            self.d3FreMapArr[col.id - 1] = d3FreMap;

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
                    return d.y-5;
                })
                .attr("height", function (d) {
                    return (height - y(d.value.value)) < 10 ? 10 : 10 + (height - y(d.value.value));
                })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .style("fill", function (d) {

                    //if color is null then set the
                    //color and send otherwise send
                    //the attached color
                    if (d.freObjValue.color === "") {
                        d.freObjValue.color = o(d.key);
                    }

                    return d.freObjValue.color;
                })
                .style("stroke-width","0.5")
                .style("stroke","rgb(0,0,0)")
                .on("contextmenu", function (d) {

                    var selectedSVG = d.svg;
                    var colId = d.colId;

                    self.createColorBox("ordinalScale");

                    self.colorBox.on("click", function (d) {

                        var keys = Object.keys(colorbrewer["ordinalScale"][d.key]);
                        var lastKey = keys[keys.length - 1];


                        self.parentInstance.changeColColor(colId, colorbrewer["ordinalScale"][d.key][lastKey]);

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

                    d3.event.preventDefault();
                });

            function type(d) {
                d.value.value = +d.value.value;
                return d;
            }
        }

        /**
         * This function is responsible for the
         * printing of the ordinal graph on the
         * main table
         * @param _col
         * @param _svgArea
         */
        Table.prototype.printOrdinalGraph  = function(_col, _svgArea){
            var self = this;

            //set up the margins of the svg
            var margin = {top: 5, right: 5, bottom: 0, left: 5},
                width = 150 - margin.left - margin.right,
                height = 100 - margin.top - margin.bottom;

            //take the col
            var col = _col;
            var svgArea = _svgArea;

            //fetch required data
            var selColor = col.colorScheme;
            var dataTypeObj = col.dataTypeObj;
            var dataType = dataTypeObj.type;
            var freqMap = dataTypeObj.keyCountMap;
            var keys = Object.keys(freqMap);
            var d3FreMap = d3.entries(freqMap);
            var index = 0;

            //Initialize the drag and drop behaviour on
            //the bar graph to drag and drop the bars for
            //nominal to oridinal conversion
            var drag = d3.behavior.drag()
                .origin(function (d) {
                    return d;
                })
                .on("dragstart", dragstart)
                .on("drag", dragmove)
                .on("dragend", dragstop);

            //Set up the required x, y and
            //color scales
            //Reference : http://jsfiddle.net/59vLw/
            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1);
            var y = d3.scale.linear()
                .range([height, 0]);
            var o = d3.scale.ordinal()
                .domain(d3FreMap.map(function (d) {
                    return d.key;
                }))
                .range(selColor);

            //Initialize the d3 tip for displaying
            //value for each bar on mouse hover
            var tip = d3tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function (d) {
                    return d.key + " : " + d.value.value;
                });

            //Form new svg and attach d3 tip
            var svg = d3.select(svgArea)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            svg.call(tip);

            //this will take the take got from the
            //data wrnagler and sort the data accordingly
            //to plot on the graph
            d3FreMap.sort(function (a, b) {
                if (a.value.sortIndex > b.value.sortIndex) {
                    return 1;
                }
                else if (a.value.sortIndex < b.value.sortIndex) {
                    return -1;
                }
                return 0;
            })

            // The following code was contained in the callback function.
            x.domain(d3FreMap.map(function (d) {
                return d.key;
            }));
            y.domain([0, d3.max(d3FreMap, function (d) {
                return d.value.value;
            })]);

            // Attach all the data required by the D3
            d3FreMap.map(function (d) {

                d.x = x(d.key);
                d.y = y(d.value.value);

                //add the real freq object to further sort and take the data
                d.freObjKey = d.key;
                d.freObjValue = d.value;

                // appending the svg area on the bar graph to fetch information for mouse event
                d.index = index++;
                d.svg = svgArea;
                d.colId = col.id - 1;

            });

            self.d3FreMapArr[col.id - 1] = d3FreMap;

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
                    return d.y-5;
                })
                .attr("height", function (d) {
                    return (height - y(d.value.value)) < 10 ? 10 : 10 + (height - y(d.value.value));
                })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .style("fill", function (d) {

                    //if color is null then set the
                    //color and send otherwise send
                    //the attached color
                    if (d.freObjValue.color === "") {
                        d.freObjValue.color = o(d.key);
                    }

                    return d.freObjValue.color;
                })
                .style("stroke-width","0.5")
                .style("stroke","rgb(0,0,0)")
                .call(drag)
                .on("contextmenu", function (d) {

                    var selectedSVG = d.svg;
                    var colId = d.colId;

                    self.createColorBox("ordinalScale");

                    self.colorBox.on("click", function (d) {

                        var keys = Object.keys(colorbrewer["ordinalScale"][d.key]);
                        var lastKey = keys[keys.length - 1];


                        self.parentInstance.changeColColor(colId, colorbrewer["ordinalScale"][d.key][lastKey]);

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

                    d3.event.preventDefault();
                });

            function type(d) {
                d.value.value = +d.value.value;
                return d;
            }

            function dragstart(d) {
                tip.destroy();
            }

            function dragmove(d) {
                d3.select(this).attr("x", d.x = Math.max(0, Math.min(width - d3.select(this).attr("width"), d3.event.x)))
                self.d3FreMapArr[d.colId][d.index].x = d.x;
            }

            function dragstop(d) {

                //this will sort the d3 freq map
                self.d3FreMapArr[d.colId].sort(function (a, b) {
                    if (a.x > b.x) {
                        return 1;
                    }
                    else if (a.x < b.x) {
                        return -1;
                    }
                    return 0;
                })

                //this will take the sorted data
                //and create the new freq map
                var newFreqSortedMap = {};
                var index = 0;
                for (var objInd in self.d3FreMapArr[d.colId]) {
                    var obj = self.d3FreMapArr[d.colId][objInd];
                    obj.freObjValue.sortIndex = index++;
                    newFreqSortedMap[obj.freObjKey] = obj.freObjValue;
                }

                //this will set the new frequency map
                self.parentInstance.setNewFreqMap(d.colId, newFreqSortedMap);
            }
        }

        /**
         * This function will print the numerical
         * data with histograms
         * @param _col
         * @param _svgArea
         */
        Table.prototype.printNumericalGraph = function(_col, _svgArea){
            var self = this;

            //take copy of the required parameter
            var col = _col;
            var svgArea = _svgArea;
            var selColor = col.colorScheme;
            var dataTypeObj = col.dataTypeObj;
            var dataType = dataTypeObj.type;
            var min = dataTypeObj.min;
            var max = dataTypeObj.max;
            var isDataCenter = dataTypeObj.isDataCenter;
            var binCount = settings.localSettings().NUMERICAL_BIN_COUNT;

            var setColorScale;
            if(isDataCenter){
                setColorScale = "polyLinearScale";
            }
            else{
                setColorScale = "linearScale"
            }

            //this will create the margin for numerical svg
            var margin = {top: 5, right: 5, bottom: 0, left: 5},
                width = 150 - margin.left - margin.right,
                height = 100 - margin.top - margin.bottom;

            //this will create the histogram required
            //for the numerical data, this will also
            //add the data required when any operations
            //is performed on the data type
            var histogram = d3.layout.histogram().bins(binCount)
            (dataTypeObj.data);
            var maxVal = d3.max(histogram, function (d) {
                return d.y;
            });
            var minVal = d3.min(histogram, function (d) {
                return d.y;
            });

            histogram.map(function (d) {
                //appending the svg area on the bar graph to fetch information for mouse event
                d.svg = svgArea;
                //min and max value
                d.max = maxVal;
                d.min = minVal;
                //attach the column id
                d.colId = col.id - 1;
            });

            //create all the required scale

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

            var linearColorScale;

            if(isDataCenter) {

                // setting min, max and center value for polylinear scale
                linearColorScale = d3.scale.linear()
                    .domain([d3.min(histogram, function (d) {
                        return d.x;
                    }),
                        0
                        , d3.max(histogram, function (d) {
                        return d.x;
                    })])
                    .range([selColor[0],"white",selColor[selColor.length - 1]]);
            }
            else{

                // setting min, max and center value for linear scale
                linearColorScale = d3.scale.linear()
                    .domain([d3.min(histogram, function (d) {
                        return d.x;
                    }), d3.max(histogram, function (d) {
                        return d.x;
                    })])
                    .range([selColor[0],selColor[selColor.length-1]]);
            }


            //D3 Tip defined
            var tip = d3tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function (d) {
                    return "" + d3.min(d) + " - " + d3.max(d);
                });

            //this will select the svg area to print the chart
            var vis = d3.select(svgArea)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("width", width)
                .attr("height", height);

            //this will initialize the tip
            //on the svg area
            vis.call(tip);

            //this will create the rectangle
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
                .style("fill", function (d) {
                    return linearColorScale(d.x);
                })
                .style("stroke-width","0.5")
                .style("stroke","black")
                //setting up the tips
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .on("contextmenu", function (d) {

                    var selectedSVG = d.svg;
                    var maxRangeForColor = d.max;
                    var minRangeForColor = d.min;
                    var colId = d.colId;

                    //call the function to create the
                    //color box of the linear scales
                    // polylinear scale for negative values
                    self.createColorBox(setColorScale);

                    //this function will be called when color box
                    //will be clicked
                    self.colorBox.on("click", function (d) {

                        //figure out the last key
                        var keys = Object.keys(colorbrewer[setColorScale][d.key]);
                        var lastKey = keys[keys.length - 1];

                        self.parentInstance.changeColColor(colId, colorbrewer[setColorScale][d.key][lastKey]);

                        //finally hide the color box
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

                    //open the colorbox div
                    $('#colorbox-pop-up')
                        .show()
                        .css('top', d3.event.pageY)
                        .css('left', d3.event.pageX)
                        .appendTo('body');

                    //stop the default event on the page
                    d3.event.preventDefault();
                });

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

        /**
         * This function will figure out whether
         * the it is error graph or not
         * @param _col
         * @param _svgArea
         */
        Table.prototype.printErrorGraph = function(_col,_svgArea){
            var self = this;

            //intialize the local variable
            var col = _col;
            var svgArea = _svgArea;
            var selColor = col.colorScheme;
            var dataTypeObj = col.dataTypeObj;
            var dataType = dataTypeObj.type;

            //set up the margins for the svg area
            var margin = {top: 5, right: 5, bottom: 0, left: 5},
                width = 150 - margin.left - margin.right,
                height = 100 - margin.top - margin.bottom;

            if (dataTypeObj.baseType == DATATYPE_NUMERICAL) {

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
                var tip = d3tip()
                    .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function (d, i) {

                        if (i == (histogram.length)) {
                            return "<strong>Invalid &nbsp; values &nbsp; frequency &nbsp; : " +
                                "</strong>" + d.y;
                        }
                        else {
                            return "" + d3.min(d) + " - " + d3.max(d);
                        }
                    });

                var vis = d3.select(svgArea)
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .attr("width", width)
                    .attr("height", height);

                //todo d3-tip error bower error
                vis.call(tip);

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
                    .style("stroke-width","0.5")
                    .style("stroke","black")
                    //setting up the tips
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);
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
                    //set the bar horizontally by calculating
                    //from distance from the previous bar and
                    //adding up the difference
                    histogram[10].x = histogram[9].x + histogram[9].dx;
                }

                //set the vertical limit of the bar
                histogram[10].y = d3.values(dataTypeObj.numberMap).length;

                //set the x scale of the of the histogram
                var x = d3.scale.ordinal()
                    .domain(histogram.map(function (d) {
                        return d.x;
                    }))
                    .rangeRoundBands([0, width]);

                //set the y scale of the histogram
                var y = d3.scale.linear()
                    .domain([0, d3.max(histogram, function (d) {
                        return d.y;
                    })])
                    .range([0, height]);

                //initialize the tip of the bar
                var tip = d3tip()
                    .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function (d, i) {
                        if (i == (histogram.length - 1)) {
                            return "<strong>Invalid &nbsp; value " + d.y +
                                "</strong>";
                        } else {
                            return "" + d3.min(d) + " - " + d3.max(d);
                        }
                    });

                var vis = d3.select(svgArea)
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .attr("width", width)
                    .attr("height", height);

                vis.call(tip);

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
                        if (i == (histogram.length - 1))
                            return "#FF3333";
                    })
                    .style("stroke-width","0.5")
                    .style("stroke","black")
                    //setting up the tips
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);
            }
        }

        /**
         * This function will print the string graph
         *
         * @param _col
         * @param _svgArea
         */
        Table.prototype.printStringGraph = function(_col,_svgArea){
            var self = this;

            //intialize the local variable
            var col = _col;
            var svgArea = _svgArea;
            var selColor = col.colorScheme;
            var dataTypeObj = col.dataTypeObj;
            var dataType = dataTypeObj.type;

            //set up the margins for the svg area
            var margin = {top: 5, right: 5, bottom: 0, left: 5},
                width = 150 - margin.left - margin.right,
                height = 100 - margin.top - margin.bottom;
        }

        /**
         * This function is responsible to print
         * all the types of chart.
         */
        Table.prototype.printCharts = function () {

            var self = this;

            self.d3FreMapArr = {};

            // todo remove this margin and set it each print function
            var margin = {top: 5, right: 5, bottom: 0, left: 5},
                width = 150 - margin.left - margin.right,
                height = 100 - margin.top - margin.bottom;


            for (key in self.data) {

                var col = self.data[key];
                var selColor = col.colorScheme;
                var dataTypeObj = col.dataTypeObj;
                var dataType = dataTypeObj.type;

                //add the printing logic per column
                var svgArea = self.parentElementName + " " +
                    "#svg-col-" + (col.id - 1);

                if (dataType == DATATYPE_NOMINAL) {
                    self.printNominalGraph(col,svgArea);
                }
                else if (dataType == DATATYPE_ORDINAL) {
                    self.printOrdinalGraph(col,svgArea);
                }
                else if (dataType == DATATYPE_NUMERICAL) {
                    self.printNumericalGraph(col,svgArea);
                }
                else if (dataType == DATATYPE_STRING) {

                }
                else if (dataType == DATATYPE_ERROR) {
                    self.printErrorGraph(col,svgArea);
                }
            }
        }

        /**
         * This function is reposible for the higlighting
         * of the selected row identifier, this function
         * works independently with no extra inputs
         */
        Table.prototype.highlightColType = function(){
            var self = this;

            for (key in self.data) {
                var col = self.data[key];
                if(col.isColType){
                    var id = col.id-1;
                    var colId = "col-"+id;

                    console.log("coltype called");
                    //this function will highlight all the column
                    //whose row identifier is true
                    var rows = document.getElementsByClassName(colId);
                    for (var i = 0; i < rows.length ; i++) {
                        rows[i].style.backgroundColor = "#D3D3D3";
                    }
                }
            }
        }

        Table.prototype.highlightRowType = function(){
            var self = this;

            var arr = self.parentInstance.getRowTypeID();
            for(key in arr){
                var id = key;
                var rowId = "row-"+id;

                //this function will highlight all the row ids
                var rows = document.getElementsByClassName(rowId);
                for (var i = 0; i < rows.length ; i++) {
                    rows[i].style.backgroundColor = "#D3D3D3";
                }
            }
        }

        Table.prototype.highlightIgnoreRows = function(){
            var self = this;

            var arr = self.parentInstance.getRowsToIgnore();
            for(key in arr) {
                if (arr[key] == 1) {
                    var id = key;
                    var rowId = "row-" + id;
                    console.log("ignore rows called");
                    //this function will highlight all the row ids
                    var rows = document.getElementsByClassName(rowId);

                    for (var i = 0; i < rows.length; i++) {
                        rows[i].style.backgroundColor = "#F9966B";
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
            var columnWidth = 150;
            for (key in self.data) {
                var col = self.data[key];
                columns[ind] = col;
                columns[ind].x = (columnWidth/2 ) + (columnWidth * ind); // required for drag and drop selection
                ind++;
            }
            var tableWidth = ind * 150;

            //var topTableView = require("topTableView");
            topTableView.reload(self.root, columns);

            //todo following top left goes into the separate function
            self.topLeftTable = d3.select(self.root).select("#topLeftOperations").append("table")
                .attr("id", "top-left-table")
                .style("border-collapse", "collapse")
                .style("border", "0px black solid")
                .style("width", 2 * columnWidth); //todo string type
            self.topLeftTableHead = self.topLeftTable.append("thead");

            //todo following left table goes into separate function
            var rowsToCreateLeftView = (self.rowCount / DISPLAY_ROW_COUNT >= 1) ? DISPLAY_ROW_COUNT : self.rowCount;
           leftTableView.reload(self.root, columns,rowsToCreateLeftView);

            self.table = d3.select(self.root).select("#importedTable").append("table")
                .attr("id", "data-table")
                .style("border-collapse", "collapse")
                //.style("border", "1px black solid")
                .style("width", "" + tableWidth + "px"); //todo string type

            // making it global as regularly used by the function to update the cell value
            self.thead = self.table.append("thead");
            self.tbody = self.table.append("tbody");

            // this function will place a new svg
            // element for the col id type selection
            //self.rowIDSelectionOpr(columns);

            //this function will place a new svg
            //element for the row id type selection
            //self.colIDSelectionOpr(columns);

            //add svg row in thhead
            var svgRow = self.thead.append("tr")
                .style("border", "1px black solid")
                .style("padding", "5px");

            //add multiple svg cell per column
            var svgCells = svgRow.selectAll(".colSvg")
                .data(columns)
                .enter()
                .append("th")
                .classed("colSvg", true)
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

            var dataTypeArray = [   DATATYPE_NUMERICAL,
                                    DATATYPE_NOMINAL,
                                    DATATYPE_ORDINAL,
                                    DATATYPE_STRING,
                                    DATATYPE_ERROR  ];

            var opr = svgCells.append("div").style("height", "20px");
            var select = opr.append("div")
                            .style("float", "left")
                            .style("width","100px")
                            .append("select")
                            .attr("id",function(d){
                                var strId = "drop-down-" + (d.id-1);
                                return strId;
                            })
                            .on("change",function(d){
                                var strId = "#drop-down-" + (d.id-1);
                                var datatype = $(self.root).find(strId).val();
                                self.parentInstance.changeDataType((d.id-1), datatype);
                            });
            var opt = select.selectAll("option")
                            .data(dataTypeArray)
                            .enter().append("option")
                            .attr("selected",function(d,i){
                                if(d3.select(this.parentNode).data()[0].dataTypeObj.type === d){
                                    return "selected";
                                }
                            })
                            .attr("value",function (d) {
                                return d;
                            })
                            .text(function (d) {
                                return d;
                            });

            var closeImg = opr.append("div")
                .style("text-align", "right");

            closeImg.append("input")
                .attr("type", "checkbox")
                .attr("name","remove-column")
                .attr("value",function(d){
                    return d.id-1;
                });

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
            self.addHelperButtons(columns);
            //self.addDragNDrop(columns);
            ////////////////////end - code for drag and drop setting /////////////////////////////////

        /*    // add the column id names
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
                .style("font-size", "12px");*/
        }

        /**
         *
         * @param _columns
         */
        Table.prototype.setCreationOpr = function(_columns){
            var self = this;

            var columns = _columns;
            var columnWidth = 150;
        }
        /**
         * This function handles the selection of
         * of row identifier on the table
         * @param _columns
         */
        Table.prototype.rowIDSelectionOpr = function(_columns){
            var self = this;

            var columns = _columns;
            var columnWidth = 150;
            var intialWidth = 0;

            //calculate intial and start index of the bar
            var rectStartIndex = 0;
            var flag = true;
            for(key in columns){
                var col = columns[key];
                if(col.isColType){
                    if(flag){
                        rectStartIndex = col.id - 1;
                        flag = false;
                    }
                    intialWidth = intialWidth + 150;
                }
            }

            var width = columnWidth * columns.length,
                height = 6,
                dragbarw = height+2;

            var drag = d3.behavior.drag()
                .origin(Object)
                .on("drag", dragmove)
                .on("dragend", dragstop);

            var dragright = d3.behavior.drag()
                .origin(Object)
                .on("drag", rdragresize)
                .on("dragend", rdragstop);

            var s = self.topTableHead.append("tr");
            var rowIdSelSVG = s.append("td")
                .attr("colspan", columns.length)
                .style("height", height)
                .style("border","1px")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            var newg = rowIdSelSVG.append("g")
                .data([{x: 0}]);

            var dragrect = newg.append("rect")
                .attr("id", "active")
                .attr("x", function(d) { return d.x = d.x + rectStartIndex * columnWidth; })
                .attr("height", height)
                .attr("width", intialWidth)
                .style("fill","grey")
                //.style("fill-opacity",0.5)
                .attr("cursor", "move")
                .call(drag);

            var dragbarright = newg.append("rect")
                .attr("x", function(d) { return d.x + intialWidth; })
                //.attr("y", dragbarw/2)
                .attr("id", "dragright")
                .attr("height", dragbarw)
                .attr("width", dragbarw/4)
                .attr("fill", "black")
                //.attr("fill-opacity", .5)
                .attr("cursor", "ew-resize")
                .call(dragright);

            function rdragresize(d) {

                var stretchRectX = parseInt(d3.event.x / columnWidth);
                var newX = Math.max(0,Math.min(intialWidth + stretchRectX * columnWidth,columnWidth * columns.length));
                //move the right drag handle
                dragbarright.attr("x",d.x = newX);

                // resize the drag rectangle
                // as we are only resizing from the right,
                // the x coordinate does not need to change
                dragrect.attr("width", parseInt(dragbarright.attr("x"))-parseInt(dragrect.attr("x")));
            }

            function dragmove(d) {
                var rectx = parseInt(d3.event.x / columnWidth);
                dragrect.attr("x", d.x = Math.min(width - intialWidth, rectx * columnWidth));
                dragbarright.attr("x",d.x + parseInt(dragrect.attr("width")));
            }

            function dragstop(d) {
                var leftIndex = parseInt(dragrect.attr("x"));
                var rightIndex = parseInt(dragbarright.attr("x"));
                var leftId = leftIndex / columnWidth;
                var rightId = rightIndex / columnWidth;

                self.parentInstance.changeRowType(leftId,rightId,rowNumber);
            }

            function rdragstop(d) {
                var leftIndex = parseInt(dragrect.attr("x"));
                var rightIndex = parseInt(dragbarright.attr("x"));
                var leftId = leftIndex / columnWidth;
                var rightId = rightIndex / columnWidth;

                self.parentInstance.changeRowType(leftId,rightId);
            }

        }
        /**
         * This function will show the min/max fields
         * for numerical data and add category for the
         * nominal data
         */
        Table.prototype.addHelperButtons = function(columns){
            var self = this;

            var thCell  = self.thead.append("tr")
                .selectAll("th")
                .data(columns)
                .enter()
                .append("th")
                .style("border", "1px black solid")
                .style("padding", "5px")
                .style("font-size", "10px")
                .attr("height","24.44")//todo think some permananet solution
                .each(function(d){
                    if(d.dataTypeObj.type == DATATYPE_NUMERICAL){
                        self.numericalOpr(d3.select(this),d);
                    }
                    else if(d.dataTypeObj.type == DATATYPE_NOMINAL || d.dataTypeObj.type == DATATYPE_ORDINAL){
                        self.nominalOpr(d3.select(this),d);
                    }
                });
        }

        /**
         * This function will handle the nomminal
         * operation of the data
         * @param _head
         * @param _data
         */
        Table.prototype.nominalOpr = function(_head,_data){
            var self = this;

            //fetch the required data
            var head = _head;
            var data = _data;

            //this will append the min and max
            //operation field into the UI for
            //numerical operations
            head.append("span")
                .text("Add new category:");
            head.append("input")
                .attr("class","new-category")
                .attr("name","new-category")
                .attr("type","text")
                .attr("size","3")
                .attr("value","")
                .style("border","0px");

            head.append("span")
                .attr("class","glyphicon glyphicon-plus")
                .style("float","right")
                .style("font-size","11px")
                .on("click",function(){
                    var newCategoryElement = head.select(".new-category").property("value");
                    if(newCategoryElement) {
                        self.parentInstance.addNewCategory(data.id - 1, newCategoryElement);
                    }
                    else{
                        alert("Please define category !!!");
                    }
                });
        }

        /**
         * This function will take care for the
         * numerical operations perform on the
         * graph like changing min and max value
         *
         * @param _head
         * @param _data
         */
        Table.prototype.numericalOpr = function(_head,_data){
            var self = this;

            //fetch the require variable
            var head = _head;
            var data = _data;

            //this will append the min and max
            //operation field into the UI for
            //numerical operations
            head.append("span")
                .style("font-size","12")
                .text("Min");

            head.append("input")
                .attr("class","min")
                .attr("name","min")
                .attr("type","text")
                .attr("size","1.5")
                .attr("value",data.dataTypeObj.min)
                .style("border","1px solid");

            if(data.dataTypeObj.isDataCenter){
                head.append("span")
                    .style("font-size","12")
                    .text("-");
                head.append("input")
                    .attr("class","min")
                    .attr("name","min")
                    .attr("type","text")
                    .attr("size","1.5")
                    .attr("value",data.dataTypeObj.center)
                    .style("border","1px solid");

                head.append("span")
                    .style("font-size","12")
                    .text("-");
            }

            head.append("input")
                .attr("name","max")
                .attr("class","max")
                .attr("type","text")
                .attr("size","1.5")
                .attr("value",data.dataTypeObj.max)
                .style("border","1px solid");

            head.append("span")
                .style("font-size","12")
                .text("Max");


            head.append("span")
                .attr("class","glyphicon glyphicon-retweet")
                .style("float","right")
                .style("font-size","11px")
                .on("click",function(){
                    var minElement = Number(head.select(".min").property("value"));
                    var maxElement = Number(head.select(".max").property("value"));

                    self.parentInstance.updateNumericalMinAndMax(data.id-1,
                        minElement,maxElement);
                });

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
            for (var index = (pageNum - 1) * DISPLAY_ROW_COUNT;
                 index < ((pageNum - 1) * DISPLAY_ROW_COUNT) + DISPLAY_ROW_COUNT && index < self.rowCount;
                 index++) {

                self.dataToDisplay[rowIndex] = [];
                for (var colIndex = 0; colIndex < self.colCount; colIndex++) {
                    self.dataToDisplay[rowIndex][colIndex] = self.originalData[colIndex]["data"][index];
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
            var rowId = 0;
            var colCount = self.dataToDisplay[0].length;

            // create a row for each object in the data
            var rows = self.tbody.selectAll("tr")
                .data(self.dataToDisplay);

            //for introducing fresh rows
            rows.enter().append("tr");

            // create a cell in each row for each column
            var cells = rows.selectAll("td")
                .data(function (d,i) {
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
                .attr("bgcolor","white")
                .on("mouseup", function (d, i) {
                    if (self.data[i]["dataTypeObj"].type == "string") {
                        // when selection is done on the string column
                        //return self.mouseUpEventTriggered(i);
                    }
                })
                /*.on("mouseover", function () {
                    d3.select(this).style("background-color", "aliceblue")
                })
                .on("mouseout", function () {
                    d3.select(this).style("background-color", "white")
                })*/;


            //for updating cell values
            cells.text(function (d) {
                return d;
            })
            .attr("id", function (d, i) {
                return "col-" + i;
            })
            .attr("class", function (d, i) {
                return "row-"+ (Math.floor(rowId++ / colCount) + (self.currPage-1)*DISPLAY_ROW_COUNT) +" "+"col-" + i;
            })
            .style("border", "1px black solid")
            .style("padding", "5px")
            .style("font-size", "12px")
            .style("overflow", "hidden");

            /*.on("mouseover", function () {
                d3.select(this).style("background-color", "aliceblue")
            })
            .on("mouseout", function () {
                d3.select(this).style("background-color", "white")
            })*/;


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
                //self.stringOperations = require('stringOperations');
                //self.stringOperations.reload(self.data, col, self.regex, self);

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

        /**
         * this function will return the current
         * data requried by the table
         * @returns {*}
         */
        Table.prototype.getTableData = function () {
            var self = this;

            //returning the current data with
            //which table is loaded
            return self.data;
        }

        /**
         * This function will return the current page
         * and this will be used by the lefttableview
         * to arrange the circle for selection
         * @returns {number|*}
         */
        Table.prototype.getCurrentPage = function(){
            var self = this;

            return self.currPage;
        }


        return Table.getInstance();
    });
