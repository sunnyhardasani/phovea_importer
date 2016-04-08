/**
 * Created by Sunny Hardasani on 12/31/2015.
 */

define(['require', 'jquery', '../dataWrangler'], function (require, $, dataWrangler) {

  //instance of the class
  var instance = null;

  /**
   * if class is reinitialized then throws an eror
   * @constructor
   */
  function TopTableData() {
    this.operations = [];
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
   */
  TopTableData.prototype.reload = function () {
    var self = this;
    self.init();
  };

  /**
   * only constructor or reload function call
   * this function this will load the data and
   * update the pagination, update table and
   * print charts
   */
  TopTableData.prototype.init = function () {

  };

  TopTableData.prototype.insertNewOpr = function (row, _type, _obj) {
    var self = this;

    //this will insert the new operation
    //type
    self.operations[row] = {
      'type': _type,
      'obj': _obj
    };

    if (_type === 'ID') {
      dataWrangler.changeRowType(self.operations);
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

  TopTableData.prototype.getAllOperations = function () {
    return this.operations;
  };


  return TopTableData.getInstance();

});
