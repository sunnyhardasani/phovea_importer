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
    function LeftTableData() {
        var self = this;

        if (instance !== null) {
            throw new Error("Cannot instantiate more than one LeftTableData, use LeftTableData.getInstance()");
        }

        //todo this will be updated by taking the constructor parameter
        self.parentElementName = "x-importer-template";
        self.operations = [];
    }

    /**
     * returns an instance of the class
     * @returns {*}
     */
    LeftTableData.getInstance = function () {
        // summary: Gets an instance of the singleton. It is better to use
        if (instance === null) {
            instance = new LeftTableData();
        }
        return instance;
    };

    /**
     * this function will called when new file
     * is loaded on the same session
     * @param _data
     */
    LeftTableData.prototype.reload = function () {
        var self = this;
        self.dataWranglerIns = require("dataWrangler");
        self.init();
    }

    /**
     * only constructor or reload function call
     * this function this will load the data and
     * update the pagination, update table and
     * print charts
     */
    LeftTableData.prototype.init = function () {
        var self = this;

    }

    /**
     * This fucntion handles all the new operation
     * added on the left operation table
     * @param row
     * @param _type
     * @param _obj
     */
    LeftTableData.prototype.insertNewOpr = function (row,_type,_obj) {
        var self = this;

        //this will insert the new operation
        //type
        self.operations[row] = {
            type : _type,
            obj:_obj
        };

        if(_type == "ID") {
            //this will take all the operations
            //and give to datawrangler to set
            //todo make similar changes in the topTableData
            var arr = [];
            for (key in self.operations) {
                var type = self.operations[key].type;
                var obj = self.operations[key].obj;
                if (type === "ID") {
                    for (var index = obj.topIndex; index < obj.bottomIndex; index++) {
                        arr[index] = true;
                    }
                }
            }

            self.dataWranglerIns.setRowTypeID(arr);
        }
        else if(_type == "REMOVE"){
            var arrVisibilityStatus = _obj;
            self.dataWranglerIns.setRowsToIgnore(arrVisibilityStatus);
        }
    }

    LeftTableData.prototype.getAllOperations = function () {
        var self = this;

        return self.operations;
    }


    return LeftTableData.getInstance();

});