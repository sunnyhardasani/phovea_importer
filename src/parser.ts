/**
 * Created by Samuel Gratzl on 29.09.2016.
 */



import {mixin} from 'phovea_core/src/index';
import * as papaparse from 'papaparse';

export interface IParseResult {
  data: any;
  meta: any;
}

export interface ICSVParsingOptions {
  header?: boolean;
  delimiter?: string;
  newline?: string;
}

const defaultOptions = {
  skipEmptyLines: true
};

/**
 * parses the given csv file/blob using PapaParse
 * @param data
 * @param options additional options
 * @return {Promise<R>|Promise}
 */
export function parseCSV(data: any, options: ICSVParsingOptions = {}): Promise<IParseResult> {

  return new Promise((resolve, reject) => {
    papaparse.parse(data, mixin({
      complete: (result) => resolve({data: result.data, meta: result.meta}),
      error: (error) => reject(error)
    }, defaultOptions, options));
  });
}

export function streamCSV(data: any, chunk: (chunk: IParseResult)=>any, options: ICSVParsingOptions = {}): Promise<IParseResult> {

  return new Promise((resolve, reject) => {
    papaparse.parse(data, mixin({
      complete: (result) => resolve(null),
      chunk: (result) => chunk({data: result.data, meta: result.meta}),
      error: (error) => reject(error)
    }, defaultOptions, options));
  });
}

