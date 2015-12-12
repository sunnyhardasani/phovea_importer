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

    //todo remove this calling the file configuration load data function
    //by making this class singleton
    var fileConfig = new FileConfiguration();
    fileConfig.tempDataLoad(self.data);
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

    //handling for first six pages
    if(self.currPage <= 3){
        for(i =1; i < self.totalPages && i<=5 ; i++) {
            pageData.push(i);
        }
        pageData.push("next");
    }
    //handling for last six pages
    else if(self.totalPages - self.currPage>= 1 && self.totalPages - self.currPage <= 6){
        pageData.push("previous");

        for(var i = self.totalPages-6 ; i<self.totalPages ; i++){
            pageData.push(i);
        }
    }
    //any page between them
    else{

    pageData.push("previous");

    for(var i = -2 ; i <= 2 ; i++)
        pageData.push(self.currPage + i);

    pageData.push("next");

}

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
        self.currPage = self.currPage + 5;
        if (self.currPage > self.totalPages) {
            self.currPage = self.totalPages - 5;
        }
    }
    else if(page === "previous") {
        self.currPage = self.currPage - 5;
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

/**
 * this function will print the charts
 */
Table.prototype.printCharts =  function(){

    var self = this;


    var colorbrewer={YlGn:{3:["#f7fcb9","#addd8e","#31a354"],4:["#ffffcc","#c2e699","#78c679","#238443"],5:["#ffffcc","#c2e699","#78c679","#31a354","#006837"],6:["#ffffcc","#d9f0a3","#addd8e","#78c679","#31a354","#006837"],7:["#ffffcc","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#005a32"],8:["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#005a32"],9:["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"]},YlGnBu:{3:["#edf8b1","#7fcdbb","#2c7fb8"],4:["#ffffcc","#a1dab4","#41b6c4","#225ea8"],5:["#ffffcc","#a1dab4","#41b6c4","#2c7fb8","#253494"],6:["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#2c7fb8","#253494"],7:["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"],8:["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"],9:["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]},GnBu:{3:["#e0f3db","#a8ddb5","#43a2ca"],4:["#f0f9e8","#bae4bc","#7bccc4","#2b8cbe"],5:["#f0f9e8","#bae4bc","#7bccc4","#43a2ca","#0868ac"],6:["#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#43a2ca","#0868ac"],7:["#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#08589e"],8:["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#08589e"],9:["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#0868ac","#084081"]},BuGn:{3:["#e5f5f9","#99d8c9","#2ca25f"],4:["#edf8fb","#b2e2e2","#66c2a4","#238b45"],5:["#edf8fb","#b2e2e2","#66c2a4","#2ca25f","#006d2c"],6:["#edf8fb","#ccece6","#99d8c9","#66c2a4","#2ca25f","#006d2c"],7:["#edf8fb","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"],8:["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"],9:["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#006d2c","#00441b"]},PuBuGn:{3:["#ece2f0","#a6bddb","#1c9099"],4:["#f6eff7","#bdc9e1","#67a9cf","#02818a"],5:["#f6eff7","#bdc9e1","#67a9cf","#1c9099","#016c59"],6:["#f6eff7","#d0d1e6","#a6bddb","#67a9cf","#1c9099","#016c59"],7:["#f6eff7","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016450"],8:["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016450"],9:["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016c59","#014636"]},PuBu:{3:["#ece7f2","#a6bddb","#2b8cbe"],4:["#f1eef6","#bdc9e1","#74a9cf","#0570b0"],5:["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe","#045a8d"],6:["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#2b8cbe","#045a8d"],7:["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],8:["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],9:["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]},BuPu:{3:["#e0ecf4","#9ebcda","#8856a7"],4:["#edf8fb","#b3cde3","#8c96c6","#88419d"],5:["#edf8fb","#b3cde3","#8c96c6","#8856a7","#810f7c"],6:["#edf8fb","#bfd3e6","#9ebcda","#8c96c6","#8856a7","#810f7c"],7:["#edf8fb","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#6e016b"],8:["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#6e016b"],9:["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#810f7c","#4d004b"]},RdPu:{3:["#fde0dd","#fa9fb5","#c51b8a"],4:["#feebe2","#fbb4b9","#f768a1","#ae017e"],5:["#feebe2","#fbb4b9","#f768a1","#c51b8a","#7a0177"],6:["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#c51b8a","#7a0177"],7:["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"],8:["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"],9:["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177","#49006a"]},PuRd:{3:["#e7e1ef","#c994c7","#dd1c77"],4:["#f1eef6","#d7b5d8","#df65b0","#ce1256"],5:["#f1eef6","#d7b5d8","#df65b0","#dd1c77","#980043"],6:["#f1eef6","#d4b9da","#c994c7","#df65b0","#dd1c77","#980043"],7:["#f1eef6","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#91003f"],8:["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#91003f"],9:["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#980043","#67001f"]},OrRd:{3:["#fee8c8","#fdbb84","#e34a33"],4:["#fef0d9","#fdcc8a","#fc8d59","#d7301f"],5:["#fef0d9","#fdcc8a","#fc8d59","#e34a33","#b30000"],6:["#fef0d9","#fdd49e","#fdbb84","#fc8d59","#e34a33","#b30000"],7:["#fef0d9","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#990000"],8:["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#990000"],9:["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"]},YlOrRd:{3:["#ffeda0","#feb24c","#f03b20"],4:["#ffffb2","#fecc5c","#fd8d3c","#e31a1c"],5:["#ffffb2","#fecc5c","#fd8d3c","#f03b20","#bd0026"],6:["#ffffb2","#fed976","#feb24c","#fd8d3c","#f03b20","#bd0026"],7:["#ffffb2","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],8:["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],9:["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]},YlOrBr:{3:["#fff7bc","#fec44f","#d95f0e"],4:["#ffffd4","#fed98e","#fe9929","#cc4c02"],5:["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"],6:["#ffffd4","#fee391","#fec44f","#fe9929","#d95f0e","#993404"],7:["#ffffd4","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],8:["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],9:["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]},Purples:{3:["#efedf5","#bcbddc","#756bb1"],4:["#f2f0f7","#cbc9e2","#9e9ac8","#6a51a3"],5:["#f2f0f7","#cbc9e2","#9e9ac8","#756bb1","#54278f"],6:["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#756bb1","#54278f"],7:["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"],8:["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"],9:["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"]},Blues:{3:["#deebf7","#9ecae1","#3182bd"],4:["#eff3ff","#bdd7e7","#6baed6","#2171b5"],5:["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"],6:["#eff3ff","#c6dbef","#9ecae1","#6baed6","#3182bd","#08519c"],7:["#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],8:["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],9:["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"]},Greens:{3:["#e5f5e0","#a1d99b","#31a354"],4:["#edf8e9","#bae4b3","#74c476","#238b45"],5:["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"],6:["#edf8e9","#c7e9c0","#a1d99b","#74c476","#31a354","#006d2c"],7:["#edf8e9","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],8:["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],9:["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"]},Oranges:{3:["#fee6ce","#fdae6b","#e6550d"],4:["#feedde","#fdbe85","#fd8d3c","#d94701"],5:["#feedde","#fdbe85","#fd8d3c","#e6550d","#a63603"],6:["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#e6550d","#a63603"],7:["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"],8:["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"],9:["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#a63603","#7f2704"]},Reds:{3:["#fee0d2","#fc9272","#de2d26"],4:["#fee5d9","#fcae91","#fb6a4a","#cb181d"],5:["#fee5d9","#fcae91","#fb6a4a","#de2d26","#a50f15"],6:["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#de2d26","#a50f15"],7:["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],8:["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],9:["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"]},Greys:{3:["#f0f0f0","#bdbdbd","#636363"],4:["#f7f7f7","#cccccc","#969696","#525252"],5:["#f7f7f7","#cccccc","#969696","#636363","#252525"],6:["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#636363","#252525"],7:["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],8:["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],9:["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525","#000000"]},PuOr:{3:["#f1a340","#f7f7f7","#998ec3"],4:["#e66101","#fdb863","#b2abd2","#5e3c99"],5:["#e66101","#fdb863","#f7f7f7","#b2abd2","#5e3c99"],6:["#b35806","#f1a340","#fee0b6","#d8daeb","#998ec3","#542788"],7:["#b35806","#f1a340","#fee0b6","#f7f7f7","#d8daeb","#998ec3","#542788"],8:["#b35806","#e08214","#fdb863","#fee0b6","#d8daeb","#b2abd2","#8073ac","#542788"],9:["#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788"],10:["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"],11:["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"]},BrBG:{3:["#d8b365","#f5f5f5","#5ab4ac"],4:["#a6611a","#dfc27d","#80cdc1","#018571"],5:["#a6611a","#dfc27d","#f5f5f5","#80cdc1","#018571"],6:["#8c510a","#d8b365","#f6e8c3","#c7eae5","#5ab4ac","#01665e"],7:["#8c510a","#d8b365","#f6e8c3","#f5f5f5","#c7eae5","#5ab4ac","#01665e"],8:["#8c510a","#bf812d","#dfc27d","#f6e8c3","#c7eae5","#80cdc1","#35978f","#01665e"],9:["#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e"],10:["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"],11:["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"]},PRGn:{3:["#af8dc3","#f7f7f7","#7fbf7b"],4:["#7b3294","#c2a5cf","#a6dba0","#008837"],5:["#7b3294","#c2a5cf","#f7f7f7","#a6dba0","#008837"],6:["#762a83","#af8dc3","#e7d4e8","#d9f0d3","#7fbf7b","#1b7837"],7:["#762a83","#af8dc3","#e7d4e8","#f7f7f7","#d9f0d3","#7fbf7b","#1b7837"],8:["#762a83","#9970ab","#c2a5cf","#e7d4e8","#d9f0d3","#a6dba0","#5aae61","#1b7837"],9:["#762a83","#9970ab","#c2a5cf","#e7d4e8","#f7f7f7","#d9f0d3","#a6dba0","#5aae61","#1b7837"],10:["#40004b","#762a83","#9970ab","#c2a5cf","#e7d4e8","#d9f0d3","#a6dba0","#5aae61","#1b7837","#00441b"],11:["#40004b","#762a83","#9970ab","#c2a5cf","#e7d4e8","#f7f7f7","#d9f0d3","#a6dba0","#5aae61","#1b7837","#00441b"]},PiYG:{3:["#e9a3c9","#f7f7f7","#a1d76a"],4:["#d01c8b","#f1b6da","#b8e186","#4dac26"],5:["#d01c8b","#f1b6da","#f7f7f7","#b8e186","#4dac26"],6:["#c51b7d","#e9a3c9","#fde0ef","#e6f5d0","#a1d76a","#4d9221"],7:["#c51b7d","#e9a3c9","#fde0ef","#f7f7f7","#e6f5d0","#a1d76a","#4d9221"],8:["#c51b7d","#de77ae","#f1b6da","#fde0ef","#e6f5d0","#b8e186","#7fbc41","#4d9221"],9:["#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221"],10:["#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419"],11:["#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419"]},RdBu:{3:["#ef8a62","#f7f7f7","#67a9cf"],4:["#ca0020","#f4a582","#92c5de","#0571b0"],5:["#ca0020","#f4a582","#f7f7f7","#92c5de","#0571b0"],6:["#b2182b","#ef8a62","#fddbc7","#d1e5f0","#67a9cf","#2166ac"],7:["#b2182b","#ef8a62","#fddbc7","#f7f7f7","#d1e5f0","#67a9cf","#2166ac"],8:["#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac"],9:["#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac"],10:["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"],11:["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"]},RdGy:{3:["#ef8a62","#ffffff","#999999"],4:["#ca0020","#f4a582","#bababa","#404040"],5:["#ca0020","#f4a582","#ffffff","#bababa","#404040"],6:["#b2182b","#ef8a62","#fddbc7","#e0e0e0","#999999","#4d4d4d"],7:["#b2182b","#ef8a62","#fddbc7","#ffffff","#e0e0e0","#999999","#4d4d4d"],8:["#b2182b","#d6604d","#f4a582","#fddbc7","#e0e0e0","#bababa","#878787","#4d4d4d"],9:["#b2182b","#d6604d","#f4a582","#fddbc7","#ffffff","#e0e0e0","#bababa","#878787","#4d4d4d"],10:["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#e0e0e0","#bababa","#878787","#4d4d4d","#1a1a1a"],11:["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#ffffff","#e0e0e0","#bababa","#878787","#4d4d4d","#1a1a1a"]},RdYlBu:{3:["#fc8d59","#ffffbf","#91bfdb"],4:["#d7191c","#fdae61","#abd9e9","#2c7bb6"],5:["#d7191c","#fdae61","#ffffbf","#abd9e9","#2c7bb6"],6:["#d73027","#fc8d59","#fee090","#e0f3f8","#91bfdb","#4575b4"],7:["#d73027","#fc8d59","#fee090","#ffffbf","#e0f3f8","#91bfdb","#4575b4"],8:["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"],9:["#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4"],10:["#a50026","#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"],11:["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"]},Spectral:{3:["#fc8d59","#ffffbf","#99d594"],4:["#d7191c","#fdae61","#abdda4","#2b83ba"],5:["#d7191c","#fdae61","#ffffbf","#abdda4","#2b83ba"],6:["#d53e4f","#fc8d59","#fee08b","#e6f598","#99d594","#3288bd"],7:["#d53e4f","#fc8d59","#fee08b","#ffffbf","#e6f598","#99d594","#3288bd"],8:["#d53e4f","#f46d43","#fdae61","#fee08b","#e6f598","#abdda4","#66c2a5","#3288bd"],9:["#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd"],10:["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"],11:["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"]},RdYlGn:{3:["#fc8d59","#ffffbf","#91cf60"],4:["#d7191c","#fdae61","#a6d96a","#1a9641"],5:["#d7191c","#fdae61","#ffffbf","#a6d96a","#1a9641"],6:["#d73027","#fc8d59","#fee08b","#d9ef8b","#91cf60","#1a9850"],7:["#d73027","#fc8d59","#fee08b","#ffffbf","#d9ef8b","#91cf60","#1a9850"],8:["#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850"],9:["#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850"],10:["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"],11:["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"]},Accent:{3:["#7fc97f","#beaed4","#fdc086"],4:["#7fc97f","#beaed4","#fdc086","#ffff99"],5:["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0"],6:["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f"],7:["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17"],8:["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17","#666666"]},Dark2:{3:["#1b9e77","#d95f02","#7570b3"],4:["#1b9e77","#d95f02","#7570b3","#e7298a"],5:["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e"],6:["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02"],7:["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d"],8:["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666"]},Paired:{3:["#a6cee3","#1f78b4","#b2df8a"],4:["#a6cee3","#1f78b4","#b2df8a","#33a02c"],5:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99"],6:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c"],7:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f"],8:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00"],9:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6"],10:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a"],11:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99"],12:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]},Pastel1:{3:["#fbb4ae","#b3cde3","#ccebc5"],4:["#fbb4ae","#b3cde3","#ccebc5","#decbe4"],5:["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6"],6:["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc"],7:["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd"],8:["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec"],9:["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec","#f2f2f2"]},Pastel2:{3:["#b3e2cd","#fdcdac","#cbd5e8"],4:["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4"],5:["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9"],6:["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae"],7:["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc"],8:["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc","#cccccc"]},Set1:{3:["#e41a1c","#377eb8","#4daf4a"],4:["#e41a1c","#377eb8","#4daf4a","#984ea3"],5:["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00"],6:["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33"],7:["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628"],8:["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf"],9:["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"]},Set2:{3:["#66c2a5","#fc8d62","#8da0cb"],4:["#66c2a5","#fc8d62","#8da0cb","#e78ac3"],5:["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854"],6:["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f"],7:["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494"],8:["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"]},Set3:{3:["#8dd3c7","#ffffb3","#bebada"],4:["#8dd3c7","#ffffb3","#bebada","#fb8072"],5:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3"],6:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462"],7:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69"],8:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5"],9:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9"],10:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd"],11:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5"],12:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]}};




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

            var drag = d3.behavior.drag()
                .origin(function(d) { return d; })
                .on("drag", dragmove)
                .on("dragend",dragstop);

            //refernce : http://jsfiddle.net/59vLw/
            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1);

            var y = d3.scale.linear()
                .range([height, 0]);


            var o = d3.scale.ordinal()
                .domain(d3FreMap.map(function(d) { return d.key; }))
                .range(colorbrewer.Set1[9]);

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

            d3FreMap.map( function(d) {
                d.x = x(d.key);
                d.y = y(d.value.value);
            });

            var bars = svg.selectAll(".bar")
                .data(d3FreMap)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return d.x; })
                .attr("width", x.rangeBand())
                .attr("y", function(d) {return d.y; })
                .attr("height", function(d) { return (height - y(d.value.value)) < 10 ? 10 : 10 + (height - y(d.value.value)) ; })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .style("fill",function(d) { return o(d.key); })
                .call(drag);

                svg.on("dblclick",function(){
                    bars.style("fill",function(d) {
                        return "black";
                    });
                    d3.select("#pop-up").append("div").attr("class","allcolor")
                        .selectAll(".palette")
                        .data(d3.entries(colorbrewer))
                        .enter().append("div")
                        .attr("class", "palette")
                        .attr("title", function(d) { return d.key; })
                        .on("click", function(d) {
                            var o = d3.scale.ordinal()
                                .domain(d3FreMap.map(function(d) { return d.key; }))
                                .range(colorbrewer[d.key][9]);

                            bars.style("fill",function(d) {
                                return o(d.key);
                            });
                        })
                        .selectAll(".swatch")
                        .data(function(d) { return d.value[d3.keys(d.value).map(Number).sort(d3.descending)[0]]; })
                        .enter().append("div")
                        .attr("class", "swatch")
                        .style("background-color", function(d) { return d; });

                    $('#pop-up')
                        .show()
                        .css('top', d3.event.pageY )
                        .css('left',d3.event.pageX)
                        .appendTo('body');
                });

            function type(d) {
                d.value.value = +d.value.value;
                return d;
            }
            function dragmove(d){
                d3.select(this).attr("x", d.x = Math.max(0, Math.min(width - d3.select(this).attr("width"), d3.event.x)))
            }
            function dragstop(){
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

            if(dataTypeObj.baseType == "numerical") {

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

                var tip = d3.tip()
                    .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function (d, i) {

                        if (i == (histogram.length - 1))
                            return "<strong>Invalid &nbsp; values &nbsp; frequency &nbsp; : </strong> <span style='color:red'>" + d.y + "</span><strong></strong>";

                        return "<strong>Range: [</strong> <span style='color:red'>" + d3.min(d) + " - " + d3.max(d) + "</span><strong>]</strong>";
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
                        if (i == (histogram.length - 1)) return "#FF3333";
                    })

                    //setting up the tips
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);
            }
            else{

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

                var tip = d3.tip()
                    .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function (d, i) {

                        if (i == (histogram.length - 1))
                            return "<strong>Invalid &nbsp; values &nbsp; frequency &nbsp; : </strong> <span style='color:red'>" + d.y + "</span><strong></strong>";

                        return "<strong>Range: [</strong> <span style='color:red'>" + d3.min(d) + " - " + d3.max(d) + "</span><strong>]</strong>";
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
                        if (i == (histogram.length - 1)) return "#FF3333";
                    })

                    //setting up the tips
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);
            }
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
        columns[ind] = col;
        columns[ind].x = (5 + 130) + (150 * ind); // required for drag and drop selection
        ind++;
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


    //////////////////////Following code to be moved into new class////////////////////////

    //self.thead.append("th").attr("colspan",ind).text("hi");
    /*var drag = d3.behavior.drag()
        .origin(function(d) { console.log(d); return d; })
        .on("dragstart", dragstarted)
        .on("drag", dragged)
        .on("dragend", dragended);*/
/*
    var colOperations = self.thead.selectAll(".opr")
        .data(columns)
        .enter()
        .append("th")
        .classed("opr",true)
        .style("border", "1px black solid")
        .style("font-size", "12px")
        .style("overflow", "hidden")
        .style("height", "100px")
        .on("mouseover", function(){d3.select(this).style("background-color", "aliceblue")})
        .on("mouseout", function(){d3.select(this).style("background-color", "white")});

    colOperations.append("svg")
        .attr("width","150")
        .attr("height","100");*//*
        .append("rect")
        .attr("width","10")
        .attr("height","10")
        .call(drag);*/

    /*function dragstarted(d) {
        console.log(d)
        d3.event.sourceEvent.stopPropagation();
        d3.select(this).classed("dragging", true);
    }

    function dragged(d) {
        console.log(d)
        d3.select(this).attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
    }

    function dragended(d) {
        console.log(d)
        d3.select(this).classed("dragging", false);
    }*/

    ///////////////////////////////////////////////////////////////////////////////////////////




    //add svg row in thhead
    var svgRow = self.thead.append("tr")
        .style("border", "1px black solid")
        .style("padding","5px");

    //add multiple svg cell per column
    var svgCells = svgRow.selectAll(".colSvg")
        .data(columns)
        .enter()
        .append("th")
        .classed("colSvg",true)/*
        .attr("id",function(d,i){
            return "col-"+i;
        })*/
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

    /*//todo for display on mouse hover
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




    ////////////////////start  - code for drag and drop setting /////////////////////////////////
    self.addDragNDrop(columns);
    ////////////////////end - code for drag and drop setting /////////////////////////////////

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
 * This function will handle all the drag and drop related operations of the table
 *
 */
Table.prototype.addDragNDrop = function(columns){
    var self = this;

    var width = 150*columns.length,
        height = 40,
        radius = 3,
        radio = 5;

    var drag = d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("drag", dragmove)
        .on("dragend",dragstop);

    var osvg = self.thead.append("th").attr("colspan",columns.length).append("svg")
        .attr("width",width)
        .attr("height", height);

    var rad1 = osvg.selectAll(".rad")
        .data(columns).enter().append("circle")
        .attr("r", radio)
        .attr("class","rad")
        .style("fill","white")
        .style("stroke","black")
        .style("fill-opacity",0)
        .attr("cx", function(d,i){return d.x;})
        .attr("cy", height/2)
        .on("click",function(d,i){
            if(d3.select(c[0][i]).attr("visibility") == "hidden"){
                d3.select(c[0][i]).attr("visibility","visible");
            }
            else{
                d3.select(c[0][i]).attr("visibility","hidden");
            }
        });

    var c = osvg.selectAll(".dot")
        .data(columns).enter().append("circle")
        .attr("class","dot")
        .attr("r", radius)
        .style("fill","blue")
        .style("fill-opacity","0.3")
        .attr("visibility", "hidden")
        .attr("cx", function(d,i){return d.x;})
        .attr("cy", height/2)
        .call(drag);

    var r = osvg.selectAll(".high")
        .data(columns).enter().append("rect")
        .attr("class","high")
        .style("fill","blue")
        .style("fill-opacity","0.3")
        .attr("x",function(d,i){return d.x;})
        .attr("y",height/2-radius)
        .attr("height",radius*2).call(drag);

    function dragmove(d) {
        var selRecLen = 0;
        d3.select(this)
            .attr("cx", selRecLen = Math.max(d.x , Math.min(width - radius, d3.event.x)));
        d3.select(r[0][d.id-1]).attr("width",selRecLen - d.x);

        checkRightRadios(d.x,selRecLen);

    }
    function dragstop(d) {
        d3.select(r[0][d.id-1]).attr("width",0);
        d3.select(this).attr("cx", d.x)
    }

    function checkRightRadios(fromLoc, currentLoc){
        for(var i = 0 ; i < c[0].length ; i++) {
            var selectedCircle = d3.select(c[0][i]);
            if (currentLoc > selectedCircle.attr("cx") && selectedCircle.attr("cx") >= fromLoc){
                selectedCircle.attr("visibility","visible");
            }
        }
    }

    //color change operations
    var colRect = osvg.selectAll(".colChangeBtn")
        .data(columns)
        .attr("class","colChangeBtn");
    colRect.enter().append("rect")
        .style("fill","red")
        .attr("x",function(d,i){return d.x - 130;})
        .attr("y",1)
        .attr("height",(height-2)/2)
        .attr("width",(height-2)/2);
    colRect.enter()
        .append("rect")
        .style("fill","green")
        .attr("x",function(d,i){return d.x - 130 + (height-2)/2;})
        .attr("y",1)
        .attr("height",(height-2)/2)
        .attr("width",(height-2)/2);
    colRect.enter()
        .append("rect")
        .style("fill","blue")
        .attr("x",function(d,i){return d.x - 130;})
        .attr("y",1 + (height-2)/2)
        .attr("height",(height-2)/2)
        .attr("width",(height-2)/2);
    colRect.enter()
        .append("rect")
        .style("fill","yellow")
        .attr("x",function(d,i){return d.x - 130 + (height-2)/2;})
        .attr("y",1 + (height-2)/2)
        .attr("height",(height-2)/2)
        .attr("width",(height-2)/2);
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
    document.getElementsByTagName('th')[col].style.width = '0.1%';

    //calling the resize event to restore the divs
    $(window).trigger('resize');
}