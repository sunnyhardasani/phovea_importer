/**
 * Created by Sunny Hardasani on 12/31/2015.
 */

define(["jquery","d3","topTableData"],
        function($,d3,topTableData){

    //instance of the class
    var instance = null;

    /**
     * if class is reinitialized then throws an eror
     * @constructor
     */
    function TopTableView() {
        var self = this;

        if (instance !== null) {
            throw new Error("Cannot instantiate more than one TopTableView, use TopTableView.getInstance()");
        }

        self.parentElementName = "x-importer-template";
        self.oprCount = 0;
        self.initUI();
    }

    /**
     * This will initialize the UI which
     * will be called once on the initialiaztion
     * of the application
     */
    TopTableView.prototype.initUI = function () {
        var self = this;

        $('#importedTable').on('scroll', function () {
            $('#topOperations').scrollLeft($(this).scrollLeft());
        });

        $('#topOperations').on('scroll', function () {
            $('#importedTable').scrollLeft($(this).scrollLeft());
        });

        $('#topOperations').on('scroll', function () {
            $('#topLeftOperations').scrollTop($(this).scrollTop());
        });

        //temoparary button to keep the rows
        $('#add-col-id-button').click(function(){
            self.oprCount++;
            topTableData.insertNewOpr(self.oprCount,"ID",{"left":0,"right":1});
        });

        $('#copy-id-button').click(function(){
            self.oprCount++;

            self.selectedCol = [];
            //check for all the button whose radio buttons are marked
            //and take action against it
            for (var i = 0; i < self.columns.length; i++) {
                self.selectedCol.push(false);
            }
            topTableData.insertNewOpr(self.oprCount,"COPY_SETTINGS",{"fromCol":0 ,"arr":self.selectedCol});
        });
    }

    /**
     * returns an instance of the class
     * @returns {*}
     */
    TopTableView.getInstance = function () {
        // summary: Gets an instance of the singleton. It is better to use
        if (instance === null) {
            instance = new TopTableView();
        }
        return instance;
    };

    /**
     * this function will called when new file
     * is loaded on the same session
     * @param _data
     */
    TopTableView.prototype.reload = function (_columns) {
        var self = this;

        self.dataWranglerIns = require("dataWrangler");
        //self.topTableData =  require("topTableData");
        topTableData.reload();
        self.columns = _columns;
        self.init();
    }

    /**
     * only constructor or reload function call
     * this function this will load the data and
     * update the pagination, update table and
     * print charts
     */
    TopTableView.prototype.init = function () {
        var self = this;

        self.loadTopTable();

        var allOpr = topTableData.getAllOperations();
        console.log(allOpr);
        for(key in allOpr){
            if(allOpr[key].type === "ID"){//todo define id in local settings
                self.addIDOperation(key,                    //row
                                    allOpr[key].obj.left,   //left index
                                    allOpr[key].obj.right); //right index
            }
            else if(allOpr[key].type === "COPY_SETTINGS"){
                self.addDragNDropOperation(key,allOpr[key].obj.arr);
            }
        }
    }

    /**
     * this function is responsible to initialize
     * the user interface for performing selection
     * operations on the table
     */
    TopTableView.prototype.loadTopTable = function () {
        var self = this;


        var tableWidth = self.columns.length * 150;

        //this function will initialize the table
        self.toptable = d3.select(self.parentElementName + " " + "#topOperations")
            .append("table")
            .attr("id", "top-table")
            .style("border-collapse", "collapse")
            .style("border", "0px black solid")
            .style("width", "" + tableWidth + "px"); //todo string type
        self.topTableHead = self.toptable.append("thead");

    }

    /**
     * this function is responsible to initialize
     * the user interface for performing selection
     * operations on the table
     */
    TopTableView.prototype.addIDOperation = function (opr,startIndex,endIndex) {
        var self = this;

        var columns = self.columns;
        var columnWidth = 150;//todo take this from setting option

        //calculate intial and start index of the bar
        var rectStartIndex = startIndex;
        var intialWidth = (endIndex-startIndex) * columnWidth;

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

        var svgRow = self.topTableHead.append("tr");
        var rowIdSelSVG = svgRow.append("td")
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

            topTableData.insertNewOpr(opr,"ID",{"left":leftId,"right":rightId});
        }

        function rdragstop(d) {
            var leftIndex = parseInt(dragrect.attr("x"));
            var rightIndex = parseInt(dragbarright.attr("x"));
            var leftId = leftIndex / columnWidth;
            var rightId = rightIndex / columnWidth;

            topTableData.insertNewOpr(opr,"ID",{"left":leftId,"right":rightId});
        }
    }

    /**
     * This function will handle all the drag
     * and drop related operations of the table
     */
    TopTableView.prototype.addDragNDropOperation = function (opr,arrColVisibleStatus) {
        var self = this;

        var columns = self.columns;
        var columnWidth = 150;//todo take this from setting option
        var fromCol;

        var width = columnWidth * columns.length,
            height = 13,
            radius = 3,
            radio = 6;

        var drag = d3.behavior.drag()
            .origin(function (d) {
                return d;
            })
            .on("drag", dragmove)
            .on("dragend", dragstop);

        var rsvg = self.topTableHead.append("tr");

        var osvg = rsvg.append("th").attr("colspan", columns.length)
            .append("svg")
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
                    fromCol = i;
                }
                else {
                    d3.select(c[0][i]).attr("visibility", "hidden");
                }
            });

        var c = osvg.selectAll(".dot")
            .data(columns).enter().append("circle")
            .attr("class", "dot")
            .attr("id",function(d){
                return d.id - 1;
            })
            .attr("r", radius)
            .style("fill", "black")
            //.style("fill-opacity","0.3")
            .attr("visibility", function(d,i){
                if(arrColVisibleStatus[i]){
                    return "visible";
                }
                else{
                    return "hidden";
                }
            })
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

            var selectedCol = [];
            topTableData.insertNewOpr(opr,"COPY_SETTINGS",{"fromCol":fromCol,"arr":self.selectedCol});
        }

        function checkRightRadios(fromLoc, currentLoc) {
            for (var i = 0; i < c[0].length; i++) {
                var selectedCircle = d3.select(c[0][i]);
                if (currentLoc > selectedCircle.attr("cx")
                    && selectedCircle.attr("cx") >= fromLoc) {
                    selectedCircle.attr("visibility", "visible");
                    self.selectedCol[parseInt(selectedCircle.attr("id"))] = true;
                }
            }
        }
    }

    //this will return the single instance
    //of the singleton class
    return TopTableView.getInstance();

});