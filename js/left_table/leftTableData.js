/**
 * Created by Sunny Hardasani on 12/31/2015.
 */

define(['jquery', '../dataWrangler'], function ($, dataWrangler) {

  //instance of the class
  var instance = null;

  /**
   * if class is reinitialized then throws an eror
   * @constructor
   */
  function LeftTableData() {
    this.operations = [];
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
   */
  LeftTableData.prototype.reload = function () {
    this.init();
  };

  /**
   * only constructor or reload function call
   * this function this will load the data and
   * update the pagination, update table and
   * print charts
   */
  LeftTableData.prototype.init = function () {
  };

  /**
   * This function handles all the new operation
   * added on the left operation table
   * @param row
   * @param _type
   * @param _obj
   */
  LeftTableData.prototype.insertNewOpr = function (row, _type, _obj) {
    var self = this;

    //this will insert the new operation
    //type
    self.operations[row] = {
      type: _type,
      obj: _obj
    };

    if (_type ==='ID') {
      //this will take all the operations
      //and give to datawrangler to set
      //todo make similar changes in the topTableData
      var arr = [];
      Object.keys(self.operations).forEach(function(key) {
        var type = self.operations[key].type;
        var obj = self.operations[key].obj;
        if (type === 'ID') {
          for (var index = obj.topIndex; index < obj.bottomIndex; index++) {
            arr[index] = true;
          }
        }
      });
      dataWrangler.setRowTypeID(arr);
    } else if (_type == 'REMOVE') {
      dataWrangler.setRowsToIgnore(_obj);
    }
  };

  LeftTableData.prototype.getAllOperations = function () {
    return this.operations;
  };

  return LeftTableData.getInstance();
});
