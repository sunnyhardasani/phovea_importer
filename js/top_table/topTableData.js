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

  exports.insertNewOpr = function (row, _type, _obj) {
    //this will insert the new operation
    //type
    operations[row] = {
      'type': _type,
      'obj': _obj
    };

    if (_type === 'ID') {
      dataWrangler.changeRowType(operations);
    } else if (_type === 'COPY_SETTINGS') {
      //now take the column selected array
      //and perform the copy settings operations
      dataWrangler.copySettings(_obj.fromCol, _obj.arr);
    } else if (_type === 'REMOVE_COLUMN') {
      //now take the column selected array
      //and perform the copy settings operations
      dataWrangler.removeColumn(_obj.arr);
    }
  };

  exports.getAllOperations = function () {
    return operations;
  };
});
