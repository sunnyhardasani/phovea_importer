/**
 * Created by Sunny Hardasani on 12/31/2015.
 */

define(["jquery","d3","leftTableData"/*,"localSettings"*/],
        function($,d3,leftTableData/*,settings*/){

    //instance of the class
    var instance = null;
    var DISPLAY_ROW_COUNT = 14 + 1//header;// settings.localSettings().DISPLAY_ROW_COUNT;

    /**
     * if class is reinitialized then throws an eror
     * @constructor
     */
    function LeftTableView() {
        var self = this;

        if (instance !== null) {
            throw new Error("Cannot instantiate more than one LeftTableView, use LeftTableView.getInstance()");
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
    LeftTableView.prototype.initUI = function () {
        var self = this;

        console.log("left table");

        $('#importedTable').on('scroll', function () {
            $('#leftOperations').scrollLeft($(this).scrollLeft());
        });

        //temoparary button to keep the rows
        $('#add-row-id-button').click(function(){
            self.oprCount++;

            leftTableData.insertNewOpr(self.oprCount,"ID",{topIndex:0,bottomIndex:1});
        });
    }

    /**
     * returns an instance of the class
     * @returns {*}
     */
    LeftTableView.getInstance = function () {
        // summary: Gets an instance of the singleton. It is better to use
        if (instance === null) {
            instance = new LeftTableView();
        }

        return instance;
    };

    /**
     * this function will called when new file
     * is loaded on the same session
     * @param _data
     */
    LeftTableView.prototype.reload = function (_columns) {
        var self = this;

        self.dataWranglerIns = require("dataWrangler");
        //self.topTableData =  require("topTableData");
        leftTableData.reload();
        self.columns = _columns;

        self.init();

    }

    /**
     * only constructor or reload function call
     * this function this will load the data and
     * update the pagination, update table and
     * print charts
     */
    LeftTableView.prototype.init = function () {
        var self = this;

        self.loadTopTable();
    }

    /**
     * this function is responsible to initialize
     * the user interface for performing selection
     * operations on the table
     */
    LeftTableView.prototype.loadTopTable = function () {
        var self = this;

        var columnWidth = 150;
        var colCount = 1;

        self.leftTable = d3.select(self.parentElementName + " " + "#leftOperations")
            .append("table")
            .attr("id", "left-table")
            .style("border-collapse", "collapse")
            .style("border", "1px black solid")
            .style("width", 2 * columnWidth); //todo string type
        self.leftTableHead = self.leftTable.append("thead");


        var header  = self.leftTableHead.append("tr")
            .style("border", "1px black solid")
            .style("padding", "5px")
            .style("border", "1px black solid");

        var allOpr = leftTableData.getAllOperations();

        for(key in allOpr) {
            header.append("th").style("width",columnWidth/3).style("height", "148.88px"); // todo get some permanent solution for that
        }

        var rowHeight = 26.66;
        var row  = self.leftTableHead.append("tr");

        self.cells = [];
        for(key in allOpr) {
            var svgCol = row.append("td")
                    .style("height", rowHeight * DISPLAY_ROW_COUNT)
                    .style("border", "1px")
                    .append("svg")
                    .attr("width", columnWidth/3)
                    .attr("height", rowHeight * DISPLAY_ROW_COUNT);
            self.cells.push(svgCol);

            if(allOpr[key].type === "ID") {//todo define id in local settings
                self.addRowIDOperation(key,svgCol,allOpr[key].obj);
            }
        }
    }

    /**
     * this function is responsible to initialize
     * the user interface for performing selection
     * operations on the table
     */
    LeftTableView.prototype.addRowIDOperation = function (opr,svgCol,obj) {
        var self = this;

        var columns = self.columns;
        var columnWidth = 150;//todo take this from setting option
        var width = columnWidth * columns.length,
            height = 6,
            dragbarw = height+2;
        var rowHeight = 26.66;

        //calculate intial and start index of the bar
        var rectStartIndex = obj.topIndex;
        var initialHeight = (obj.bottomIndex-obj.topIndex) * rowHeight;

        console.log(initialHeight);

        var drag = d3.behavior.drag()
            .origin(Object)
            .on("drag", dragmove)
            .on("dragend", dragstop);

        var dragdown = d3.behavior.drag()
            .origin(Object)
            .on("drag", bdragresize)
            .on("dragend", bdragstop);

        var newg = svgCol.append("g")
            .data([{y: 0}]);

        var dragrect = newg.append("rect")
            .attr("id", "active")
            .attr("y", function(d) { return d.y = d.y + rectStartIndex * rowHeight; })
            .attr("height", initialHeight)
            .attr("width", 6)
            .style("fill","grey")
            //.style("fill-opacity",0.5)
            .attr("cursor", "move")
            .call(drag);

        var dragbardown = newg.append("rect")
            .attr("y", function(d) { return d.y + initialHeight; })
            //.attr("y", dragbarw/2)
            .attr("id", "dragdown")
            .attr("height", dragbarw)
            .attr("width", dragbarw/4)
            .attr("fill", "black")
            .attr("cursor", "ns-resize")
            .call(dragdown);

        function bdragresize(d) {

            var stretchRectY = parseInt(d3.event.y / rowHeight);
            var newY = Math.max(0,Math.min(initialHeight + stretchRectY * rowHeight,rowHeight * DISPLAY_ROW_COUNT));

            //move the right drag handle
            dragbardown.attr("y",d.y = newY);

            // resize the drag rectangle
            // as we are only resizing from the right,
            // the x coordinate does not need to change
            dragrect.attr("height", parseInt(dragbardown.attr("y"))-parseInt(dragrect.attr("y")));
        }

        function dragmove(d) {
            var recty = parseInt(d3.event.y / rowHeight);
            dragrect.attr("y", d.y = Math.min(rowHeight * DISPLAY_ROW_COUNT - initialHeight, recty * rowHeight));
            dragbardown.attr("y",d.y + parseInt(dragrect.attr("height")));
        }

        function dragstop(d) {
            var topIndex = parseInt(dragrect.attr("y"));
            var bottomIndex = parseInt(dragbardown.attr("y"));
            var topId = Math.ceil(topIndex / rowHeight);
            var bottomId = Math.ceil(bottomIndex / rowHeight);

            leftTableData.insertNewOpr(opr,"ID",{topIndex:topId,bottomIndex:bottomId});
        }

        function bdragstop(d) {
            var topIndex = parseInt(dragrect.attr("y"));
            var bottomIndex = parseInt(dragbardown.attr("y"));
            var topId = Math.ceil(topIndex / rowHeight);
            var bottomId = Math.ceil(bottomIndex / rowHeight);

            leftTableData.insertNewOpr(opr,"ID",{topIndex:topId,bottomIndex:bottomId});        }
    }

    /**
     * This function will handle all the drag
     * and drop related operations of the table
     */
    LeftTableView.prototype.addDragNDropOperation = function (opr,arrColVisibleStatus) {
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
    return LeftTableView.getInstance();

});