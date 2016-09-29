/**
 * Created by Samuel Gratzl on 29.09.2016.
 */


/// <reference path="../../tsd.d.ts" />
import C = require('../caleydo_core/main');
import papaparse = require('papaparse');

export interface IParseResult {
  data: any;
  meta: any;
}

export interface ICSVParsingOptions {
  header?: boolean;
  delimiter?: string;
  newline?: string;
}

/**
 * parses the given csv file/blob using PapaParse
 * @param data
 * @param options additional options
 * @return {Promise<R>|Promise}
 */
export function parseCSV(data: any, options: ICSVParsingOptions = {}): Promise<IParseResult> {
  return new Promise((resolve, reject) => {
    papaparse.parse(data, C.mixin({
      complete: (result) => {
        resolve({data: result.data, meta: result.meta});
      },
      error: (error) => {
        reject(error);
      }
    }, options));
  });
}
