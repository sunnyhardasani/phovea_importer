/**
 * Created by Sunny on 11/8/2015.
 */


function StringOperations(_data,_col,_regex, _parentInstance){
    var self = this;

    self.data = _data;
    self.col = _col;
    self.regex = _regex;
    self.selectedElements = [];
    self.localMatchedData = [];
    self.parentInstance = _parentInstance;

    //default operation when the image is clicked
    //close the div
    //todo move into separate function
    $("#operations > img").click( function(){
        $('#table-group').attr("class","col-md-12");
        $('#operations').attr("class","col-md-0 hidden");
    });

    $("#button-new-category").click( function(){
       self.newCategoryColToData();
    });

    //load file data and call initialize
    self.init();
}

StringOperations.prototype.reload = function(_data,_col,_regex, _parentInstance) {
    var self = this;

    self.data = _data;
    self.col = _col;
    self.regex = _regex;
    self.selectedElements = [];
    self.localMatchedData = [];
    self.parentInstance = _parentInstance;

    //load file data and call initialize
    self.init();
}

StringOperations.prototype.init = function() {
    var self = this;

    //this will initialize the div operation
    $('#table-group').attr("class", "col-md-10");
    $('#operations').attr("class", "col-md-2 show");

    d3.select("#elements-selected").selectAll("*").remove();

    self.findRegexElements();
    self.printElementsBar(d3.entries(self.elements));
}

StringOperations.prototype.findRegexElements = function(){
    var self = this;

    var colData  = self.data[self.col].data;
    self.elements = {};
    for(index in colData){
        var matches = colData[index].match(
            new RegExp(
                self.regex,
                "i"
            )
        );

        if(!self.elements.hasOwnProperty(matches[0])){
            self.elements[matches[0]] = {
                match : matches[0],
                count : 1
            };
        }
        else{
            self.elements[matches[0]].count++;
        }

        //keep the match data array for each rows
        self.localMatchedData.push( matches[0] );
    }
}

/**
 * This function will print the bar chart required for the
 * data operations.
 * Reference: http://dataviscourse.net/2015/lectures/lecture-advanced-d3/
 * @param data
 */
StringOperations.prototype.printElementsBar = function(data){
    var self = this;

    // the height and width of the actual drawing area
    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    var width = 100 - margin.left - margin.right;

    //height of the bar chart is variable currently width of the
    //bar chart is taken 16 ( 15 + 1) 15 actual width and 1 for space
    var height = margin.top - margin.bottom + data.length * (15 + 1);

    //select the semis svg from the main index file
    var svg = d3.select("#semis")
        .attr({
            width: width + margin.left + margin.right,
            height: height + margin.top + margin.bottom
        });

        // introducing dummy data as only one group is needed every time
        svg.data([1]).enter().append("g")

        // here we move everything by the margins
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var max = d3.max(data, function(d) { return d.value.count; })

    //todo add this if sorting required
    /*data = data.sort(function compare(a, b) {
        return a.value
        switch (active) {
            case "product":
            case "type":
                if (a[active] < b[active])
                    return -1;
                else if (a[active] > b[active])
                    return 1;
                else
                    return 0;
                break;
            case "tonnage":
                return a.tons - b.tons;
                break;
        }
    }); */

    // set the x scale for the graph
    var xScale = d3.scale.linear()
        .domain([0, max])
        .range([0, width])
        .nice();

    // set the color scale for the graph
    var colorScale = d3.scale.ordinal()
        .domain([0, max])
        .range(colorbrewer.Greens[7]);

    // here we use an ordinal scale with rangeBoundBands
    // to position and size the bars in y direction
    var yScale = d3.scale.ordinal()
        .rangeRoundBands([0, height], .1);

   /*
    var xAxis = d3.svg.axis();
    xAxis.scale(xScale);
    xAxis.orient("bottom");

    svg.append("g")
        .classed("axis", true)
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .call(xAxis);*/

    // here we update the y-scale
    yScale.domain(data.map(function (d) {
        return d.value.match;
    }))

    //todo open after fixing d3-tip bower error
    /*var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<strong> " + d.value.match + "</strong>";
        });
    svg.call(tip);*/

    var barGroups = svg.selectAll(".barGroup")
        // here we tell D3 how to know which objects are the
        // same thing between updates (object consistency)
        .data(data, function (d) {
            return d.value.match;
        });

    var barGroupsEnter = barGroups.enter()
        .append("g")
        .classed("barGroup", true).attr("transform", function (d, i) {
            return "translate(" + 0 + "," + yScale(d.value.match) + ")";
        });


    //adding rectangle for checkboxes
    barGroupsEnter.append("rect")
        .attr("x","2" )
        .attr("width","10")
        .attr("height","11")
        .attr("type", "checkbox")
        .attr("id", function(d,i){
                return "element-"+i;
            })
        .attr("check","false")
        .attr("value", function (d) {
            return d.value.match;
        })
        .style("fill","white")
        .style("stroke","black")
        .on("click",function(d,i){

                var eID = "element-" + i;
                if(d3.select("#"+eID).attr("check") === "false") {
                    d3.select("#"+eID).style("fill", "black").attr("check","true");
                }
                else{
                    d3.select("#"+eID).style("fill", "white").attr("check","false");
                }

                //now call the function on element selection
                self.onElementSelection(eID,
                    d3.select("#"+eID).attr("check"),
                    d.value.match);
            });

    //adding the rectangle for bar display
    barGroupsEnter.append("rect")
        .attr("x", "15")
        .attr("height", yScale.rangeBand())
        .style("fill", function (d) {
            // here we apply the color scale
            return colorScale(d.value.count);
        })
        .attr("width", function (d, i) {
            // here we call the scale function.
            return Math.abs(xScale(d.value.count) - xScale(0));
        })
        //setting up the tips
        /*.on('mouseover', tip.show)
        .on('mouseout', tip.hide)*/;

    //adding the count
    barGroupsEnter.append("text").text(function (d) {
            return d.value.count;
        })
        .attr("x", function (d, i) {
                // here we call the scale function.
                return Math.abs(xScale(d.value.count) - xScale(0)) + 13;//2 is the spa
            })
        // dy is a shift along the y axis
        .attr("dy", yScale.rangeBand() / 2)
        // align it to the right
        .attr("text-anchor", "end")
        // center it
        .attr("alignment-baseline", "middle");


    //Exit and remove
    barGroups.exit().remove();
}




StringOperations.prototype.onElementSelection = function(element,check,displayText){
    var self = this;

    if(check === "true"){
        d3.select("#elements-selected").append("div").attr("id","sel"+element).text(displayText);

        //insert an element in selected elements array
        self.selectedElements.push(displayText);
    }
    else{
        d3.select("#sel" + element).remove();

        //delete an  element from selected elements array
        //todo make your own library and add array delete function in it
        var index = self.selectedElements.indexOf(displayText);
        if (index > -1) {
            self.selectedElements.splice(index, 1);
        }
    }
}

/**
 *
 */
StringOperations.prototype.newCategoryColToData = function(){
    var self = this;

    var others = $('input[name="selected-category"]:checked').length ? "others" : "";
    var newColName = $('#new-col-name').val();

    //add rest of th data
    for(index in self.localMatchedData){
        if(!(self.selectedElements.indexOf(self.localMatchedData[index]) > -1)){
            self.localMatchedData[index] = others;
        }
    }

    //add the column name
    self.localMatchedData[0] = newColName;

    //todo patch: sending the data to wrangler class
    self.parentInstance.parentInstance.saveClicked(self.localMatchedData);

    //hiding the column
    $('#table-group').attr("class","col-md-12");
    $('#operations').attr("class","col-md-0 hidden");
}