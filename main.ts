/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

/// <amd-dependency path='css!./style' />
import {mixin} from '../caleydo_core/main';
import {EventHandler} from '../caleydo_core/event';
import {parseCSV} from './parser';
import d3 = require('d3');
import {guessValueType, guessValueTypeOptions, editValueType, ITypeDefinition} from './valuetypes';

export function selectFileLogic($dropZone: d3.Selection<any>, $files: d3.Selection<any>, onFileSelected: (file: File)=>any, overCssClass = 'over') {
  function over() {
      const e = <DragEvent>d3.event;
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

export interface IColumnDefinition extends ITypeDefinition {
  name: string;
  column: string|number;
}


export class Importer extends EventHandler {
  private options = {};
  private $parent: d3.Selection<any>;

  private data: any[] = null;
  private config: IColumnDefinition[] = null;

  constructor(parent: Element, options: any = {}) {
    super();
    mixin(this.options, options);
    this.$parent = d3.select(parent).append('div').classed('caleydo-importer', true);

    this.build(this.$parent);
  }

  private selectedFile(file: File) {
    parseCSV(file).then((result) => {
      const data = result.data;
      const header = data.shift();
      this.data = data;
      this.configureData(this.$parent, header, data);
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

  private configureData($root: d3.Selection<any>, header: string[], data: string[][]) {
    $root.html(`
      <table class="table table-striped table-condensed">
        <thead>
          <th>Column</th>
          <th>Type</th>
        </thead>
        <tbody>
                
        </tbody>
      </table>
    `);

    const config = this.config = header.map((name,i) => ({column: i, name: name, type: guessValueType(data, (row)=>row[i]) }));


    const $rows = this.$parent.select('tbody').selectAll('tr').data(config);
    const types = ['string', 'real', 'int', 'categorical', 'idType'];

    const $rows_enter = $rows.enter().append('tr')
      .html((d) => `
      <td>
        <input type="input" class="form-control" value="${d.name}">
      </td>
      <td class="input-group">
        <select class='form-control'>
          <option value="string" ${d.type === 'string' ? 'selected="selected"': ''}>String</option>
          <option value="real" ${d.type === 'real' ? 'selected="selected"': ''}>Float</option>
          <option value="int" ${d.type === 'int' ? 'selected="selected"': ''}>Integer</option>
          <option value="categorical" ${d.type === 'categorical' ? 'selected="selected"': ''}>Categorical</option>
          <option value="idType" ${d.type === 'idType' ? 'selected="selected"': ''}>ID Type</option>
        </select>
        <span class="input-group-btn">
          <button class="btn-default btn-sm${d.type === 'string' ? ' disabled" disabled="disabled': ''}" type="button"><i class="glyphicon glyphicon-cog"></i></button>
        </span>
      </td>`);
    $rows_enter.select('input').on('change', function(d) {
      d.name = this.value;
    });
    $rows_enter.select('select').on('change', function(d) {
      d.type = types[this.selectedIndex < 0 ? 0 : this.selectedIndex];
      const configure = <HTMLButtonElement>this.parentElement.querySelector('button');
      if (d.type === 'string') {
        configure.classList.add('disabled');
        configure.disabled = true;
      } else {
        configure.classList.remove('disabled');
        configure.disabled = false;
      }
      const isIDType = d.type === 'idType';
      const tr = this.parentElement.parentElement;
      tr.className = isIDType ? 'info' : '';
      (<HTMLInputElement>(tr.querySelector('input'))).disabled = isIDType;
    });
    $rows_enter.select('button').on('click', (d: any) => {
      guessValueTypeOptions(d, data, (row) => row[d.column]);
      editValueType(d);
    });
  }

  getResult() {
    //derive all configs
    this.config.forEach((d) => {
      guessValueTypeOptions(d, this.data, (row) => row[d.column]);
    });
    return {
      data: this.data,
      meta: this.config
    };
  }
}


export function create(parent: Element, options: any = {}) {
  return new Importer(parent, options);
}
