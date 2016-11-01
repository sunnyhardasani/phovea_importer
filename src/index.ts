/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import './style.scss';
import {mixin} from 'phovea_core/src/index';
import {EventHandler} from 'phovea_core/src/event';
import {parseCSV} from './parser';
import * as d3 from 'd3';
import {createValueTypeEditors} from './valuetypes';
import {IDataDescription} from 'phovea_core/src/datatype';
import {importTable} from './importtable';

export function selectFileLogic($dropZone: d3.Selection<any>, $files: d3.Selection<any>, onFileSelected: (file: File)=>any, overCssClass = 'over') {
  function over() {
    const e = <Event>(<any>d3.event);
    e.stopPropagation();
    e.preventDefault();
    const s = (<HTMLElement>e.target).classList;
    if (e.type === 'dragover') {
      s.add(overCssClass);
    } else {
      s.remove(overCssClass);
    }
  }

  function select() {
    over();
    const e: any = d3.event;
    //either drop or file select
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (files.length > 0) {
      //just the first file for now
      onFileSelected(files[0]);
    }
  }

  $files.on('change', select);
  $dropZone.on('dragover', over).on('dragleave', over).on('drop', select);
}

export class Importer extends EventHandler {
  private options = {};
  private $parent: d3.Selection<any>;

  private builder: ()=>{data: any, desc: IDataDescription};

  constructor(parent: Element, options: any = {}) {
    super();
    mixin(this.options, options);
    this.$parent = d3.select(parent).append('div').classed('caleydo-importer', true);

    this.build(this.$parent);
  }

  private selectedFile(file: File) {
    var name = file.name;
    name = name.substring(0, name.lastIndexOf('.')); //remove .csv

    Promise.all([<any>parseCSV(file), createValueTypeEditors()]).then((results) => {
      const editors = results[1];
      const data = results[0].data;
      const header = data.shift();

      this.builder = importTable(editors, this.$parent, header, data, name);
    });
  }

  private build($root: d3.Selection<any>) {
    $root.html(`
      <div class="drop-zone">
        <input type="file" id="importer-file" />
      </div>
    `);

    selectFileLogic($root.select('div.drop-zone'), $root.select('input[type=file]'), this.selectedFile.bind(this));
  }

  getResult() {
    return this.builder ? this.builder() : null;
  }
}


export function create(parent: Element, options: any = {}) {
  return new Importer(parent, options);
}
