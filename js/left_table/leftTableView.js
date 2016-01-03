/**
 * Created by Sunny Hardasani on 12/31/2015.
 */

define(["jquery","d3","leftTableData"/*,"localSettings"*/],
        function($,d3,leftTableData/*,settings*/){

    //instance of the class
    var instance = null;

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

        $('#importedTable').on('scroll', function () {
            $('#leftOperations').scrollLeft($(this).scrollLeft());
        });

        //temoparary button to keep the rows
        $('#add-row-id-button').click(function(){
            self.oprCount++;

            leftTableData.insertNewOpr(self.oprCount,"ID",{topIndex:0,bottomIndex:1});
        });

        $('#remove-row-button').click(function(){
            self.oprCount++;
            leftTableData.insertNewOpr(self.oprCount,"REMOVE",Array.apply(null, new Array(self.rowCount)).map(Number.prototype.valueOf,0));
        });
        //leftTableData.insertNewOpr(self.oprCount,"ID",{topIndex:0,bottomIndex:1});
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
    LeftTableView.prototype.reload = function (_columns,_rowCount) {
        var self = this;

        self.dataWranglerIns = require("dataWrangler");
        //self.topTableData =  require("topTableData");
        leftTableData.reload();
        self.columns = _columns;
        self.rowCount = _rowCount;

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
            .style("border", "0px black solid")
            .attr("width", 2 * columnWidth); //todo string type
        self.leftTableHead = self.leftTable.append("thead");


        var header  = self.leftTableHead.append("tr")
            .style("border", "0px black solid")
            .style("padding", "5px");

        var allOpr = leftTableData.getAllOperations();

        for(key in allOpr) {
            header.append("th")
                .attr("width",columnWidth/3)
                .attr("height", "148.88px"); // todo get some permanent solution for that
        }

        var rowHeight = 26.66;
        var row  = self.leftTableHead.append("tr");

        self.cells = [];
        for(key in allOpr) {
            var svgCol = row.append("td")
                    .attr("height", rowHeight * self.rowCount)
                    .attr("width", columnWidth/3)
                    .style("border", "0px")
                    .append("svg")
                    .style("width", columnWidth/3)
                    .style("height", rowHeight * self.rowCount);
            self.cells.push(svgCol);

            if(allOpr[key].type === "ID") {//todo define id in local settings
                self.addRowIDOperation(key,svgCol,allOpr[key].obj);
            }
            else if(allOpr[key].type === "REMOVE") {//todo define id in local settings
                self.addDragNDropOperation(key,svgCol,allOpr[key].obj);
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
            .attr("height", 2)
            .attr("width", 6)
            .attr("fill", "black")
            .attr("cursor", "ns-resize")
            .call(dragdown);

        function bdragresize(d) {

            var stretchRectY = parseInt(d3.event.y / rowHeight);
            var newY = Math.max(0,Math.min(initialHeight + stretchRectY * rowHeight,rowHeight * self.rowCount));

            //move the right drag handle
            dragbardown.attr("y",d.y = newY);

            // resize the drag rectangle
            // as we are only resizing from the right,
            // the x coordinate does not need to change
            dragrect.attr("height", parseInt(dragbardown.attr("y"))-parseInt(dragrect.attr("y")));
        }

        function dragmove(d) {
            var recty = parseInt(d3.event.y / rowHeight);
            dragrect.attr("y", d.y = Math.min(rowHeight * self.rowCount - initialHeight, recty * rowHeight));
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
    LeftTableView.prototype.addDragNDropOperation = function (opr,svgCol,obj) {
        var self = this;

        var arrVisibilityStatus = obj;

        var columns = self.columns;
        var columnWidth = 150;//todo take this from setting option
        var rowHeight = 26.66;
        var fromCol;

        var width = columnWidth * columns.length,
            height = rowHeight * self.rowCount,
            radius = 3,
            radio = 5;

        var data = [];
        for(var index = 0; index < self.rowCount ;index++)
        {
            data.push({ id:index,
                        x:radio,
                        y: (index * rowHeight) + rowHeight/2,
                        visible: arrVisibilityStatus[index]
                        });
        }

        svgCol.selectAll(".rad")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", radio)
            .attr("class", "rad")
            .style("fill", "white")
            .style("stroke", "black")
            .style("fill-opacity", 0)
            .attr("cx", function(d){return d.x})
            .attr("cy", function(d){return d.y});

        var allDot = svgCol.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", ".dot")
            .attr("id",index)
            .attr("r", radius)
            .style("fill", "black")
            .attr("fill-opacity",function(d){return d.visible})
            .attr("cx", function(d){return d.x})
            .attr("cy", function(d){return d.y})
            .on("click",function(d){

                if(d.visible == 0) {
                    d.visible = 1;
                }
                else{
                    d.visible = 0;
                }

                var arrVisibilityStatus = [];
                var allDotData = allDot.data();
                for(key in allDotData){
                    arrVisibilityStatus.push(allDotData[key].visible);
                }
                leftTableData.insertNewOpr(opr,"REMOVE",arrVisibilityStatus);
            })

        }


    //this will return the single instance
    //of the singleton class
    return LeftTableView.getInstance();

});