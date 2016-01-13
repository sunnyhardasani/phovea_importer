/**
 * Created by Sunny Hardasani on 12/31/2015.
 */

define(["require","jquery"],function(require){

    var $ = require("jquery");
    //var dataWrangler = require("dataWrangler");
    //console.log("data wrangler : ",dataWrangler);

    //instance of the class
    var instance = null;

    /**
     * if class is reinitialized then throws an eror
     * @constructor
     */
    function TopTableData() {
        var self = this;

        if (instance !== null) {
            throw new Error("Cannot instantiate more than one TopTableData, use TopTableData.getInstance()");
        }

        //todo this will be updated by taking the constructor parameter
        self.parentElementName = "x-importer-template";
        self.operations = [];
    }

    /**
     * returns an instance of the class
     * @returns {*}
     */
    TopTableData.getInstance = function () {
        // summary: Gets an instance of the singleton. It is better to use
        if (instance === null) {
            instance = new TopTableData();
        }
        return instance;
    };

    /**
     * this function will called when new file
     * is loaded on the same session
     * @param _data
     */
    TopTableData.prototype.reload = function () {
        var self = this;
        self.dataWranglerIns = require("../dataWrangler");
        self.init();
    }

    /**
     * only constructor or reload function call
     * this function this will load the data and
     * update the pagination, update table and
     * print charts
     */
    TopTableData.prototype.init = function () {
        var self = this;

    }

    TopTableData.prototype.insertNewOpr = function (row,_type,_obj) {
        var self = this;

        //this will insert the new operation
        //type
        self.operations[row] = {
            "type" : _type,
            "obj":_obj
        };

        if(_type === "ID") {
            self.dataWranglerIns.changeRowType(self.operations);
        }
        else if(_type === "COPY_SETTINGS"){
            //now take the column selected array
            //and perform the copy settings opertaions
            self.dataWranglerIns.copySettings(_obj.fromCol,_obj.arr);
        }
        else if(_type === "REMOVE_COLUMN"){
            //now take the column selected array
            //and perform the copy settings opertaions
            self.dataWranglerIns.removeColumn(_obj.arr);
        }
    }

    TopTableData.prototype.getAllOperations = function () {
        var self = this;


        return self.operations;
    }


    return TopTableData.getInstance();

});
