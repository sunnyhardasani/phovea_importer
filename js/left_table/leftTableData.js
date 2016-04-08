/**
 * Created by Sunny Hardasani on 12/31/2015.
 */

define(['exports', 'jquery', '../dataWrangler'], function (exports, $, dataWrangler) {

  var operations = [];


  /**
   * this function will called when new file
   * is loaded on the same session
   */
  exports.reload = function () {
    exports.init();
  };

  /**
   * only constructor or reload function call
   * this function this will load the data and
   * update the pagination, update table and
   * print charts
   */
  exports.init = function () {
  };

  /**
   * This function handles all the new operation
   * added on the left operation table
   * @param row
   * @param _type
   * @param _obj
   */
  exports.insertNewOpr = function (row, _type, _obj) {
    //this will insert the new operation
    //type
    operations[row] = {
      type: _type,
      obj: _obj
    };

    if (_type ==='ID') {
      //this will take all the operations
      //and give to datawrangler to set
      //todo make similar changes in the topTableData
      var arr = [];
      Object.keys(operations).forEach(function(key) {
        var type = operations[key].type;
        var obj = operations[key].obj;
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

  exports.getAllOperations = function () {
    return operations;
  };
});
