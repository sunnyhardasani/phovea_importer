/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import {mixin, fix_id, random_id, identity} from '../caleydo_core/main';
import d3 = require('d3');
import {ITypeDefinition, ValueTypeEditor, guessValueType} from './valuetypes';
import {IDataDescription} from '../caleydo_core/datatype';

export interface IColumnDefinition {
  name: string;
  column: string|number;
  value: ITypeDefinition;
}

function commonFields(name: string) {
  const prefix = 'i'+random_id(3);
  return `
    <div class="form-group">
      <label for="${prefix}_name">Name</label>
      <input type="text" class="form-control" id="${prefix}_name" name="name" value="${name}" required="required">
    </div>
    <div class="form-group">
      <label for="${prefix}_desc">Description</label>
      <textarea class="form-control" id="${prefix}_desc" name="desc" rows="3"></textarea>
    </div>`;
}

function extractCommonFields($root: d3.Selection<any>) {
  return {
    name: $root.select('input[name="name"]').property('value'),
    description: $root.select('textarea[name="desc"]').property('value')
  };
}

export function importTable(editors: ValueTypeEditor[], $root: d3.Selection<any>, header: string[], data: string[][], name: string) {
  $root.html(`${commonFields(name)}
      <table class="table table-striped table-condensed">
        <thead>
          <th>Column</th>
          <th>Type</th>
        </thead>
        <tbody>
                
        </tbody>
      </table>
    `);
  const config = header.map((name, i) => ({
    column: i,
    name: name,
    value: {
      type: guessValueType(editors, name, i, data, (row)=>row[i], i)
    }
  }));

  const editorLookup = {};
  editors.forEach((editor) => editorLookup[editor.id] = editor);
  config.forEach((conf) => {
    (<any>conf).editor = editorLookup[conf.value.type];
  });

  const $rows = $root.select('tbody').selectAll('tr').data(config);

  const $rows_enter = $rows.enter().append('tr')
    .html((d) => `
      <td>
        <input type="input" class="form-control" value="${d.name}">
      </td>
      <td class="input-group">
        <select class='form-control'>
          ${editors.map((editor) => `<option value="${editor.id}" ${d.value.type === editor.id ? 'selected="selected"' : ''}>${editor.name}</option>`).join('\n')}
        </select>
        <span class="input-group-btn">
          <button class="btn btn-secondary" ${!(<any>d).editor.hasEditor ? 'disabled="disabled' : ''} type="button"><i class="glyphicon glyphicon-cog"></i></button>
        </span>
      </td>`);
  $rows_enter.select('input').on('change', function (d) {
    d.name = this.value;
  });
  $rows_enter.select('select').on('change', updateType(editors));
  $rows_enter.select('button').on('click', (d) => {
    (<any>d).editor.guessOptions(d.value, data, (row) => row[d.column]);
    (<any>d).editor.edit(d.value);
  });
  const common = extractCommonFields($root);

  return () => ({data: data, desc: toTableDataDescription(config, data, common)});
}

function toTableDataDescription(config: IColumnDefinition[], data: any[], common: { name: string, description: string}) {
  //derive all configs
  config.forEach((d) => {
    const editor = (<any>d).editor;
    editor.parse(d.value, data, (row, value?) => {
      if (typeof value !== 'undefined') {
        return row[d.column] = value;
      }
      return row[d.column];
    });
  });

  //generate config
  var idProperty = config.filter((d) => d.value.type === 'IDType')[0];
  if (!idProperty) {
    //create an artificial one
    idProperty = {value: {type: 'IDType', idType: 'Custom'}, name: 'IDType', column: '_index'};
    data.forEach((d, i) => d._index = i);
  }
  const columns = config.filter((c) => c !== idProperty).map((c) => {
    var r: IColumnDefinition = mixin(<any>{}, c);
    delete (<any>r).editor;
    return r;
  });
  const desc: IDataDescription = {
    type: 'table',
    id: fix_id(common.name+random_id(2)),
    name: common.name,
    description: common.description,
    fqname: 'upload/' + common.name,
    size: [data.length, columns.length],
    idtype: (<any>idProperty).value.idType,
    columns: columns,
    idcolumn: <string>idProperty.column
  };

  return desc;
}

function updateType(editors: ValueTypeEditor[]) {
  return function (d) {
    const type = editors[this.selectedIndex < 0 ? 0 : this.selectedIndex];
    d.value.type = type.id;
    d.editor = type;
    const configure = <HTMLButtonElement>this.parentElement.querySelector('button');

    if (!type.hasEditor) {
      configure.classList.add('disabled');
      configure.disabled = true;
    } else {
      configure.classList.remove('disabled');
      configure.disabled = false;
    }
    const isIDType = type.isImplicit;
    const tr = this.parentElement.parentElement;
    tr.className = isIDType ? 'info' : '';
    (<HTMLInputElement>(tr.querySelector('input'))).disabled = isIDType;
  }
}

export function importMatrix(editors: ValueTypeEditor[], $root: d3.Selection<any>, header: string[], data: string[][], name: string) {
  const prefix = 'a'+random_id(3);

  const rows = header.slice(1),
    cols = data.map((d) => d.shift());

  const data_range = d3.range(rows.length*cols.length);
  function byIndex(i, v?) {
    const m = i % cols.length;
    if (v !== undefined) {
      return data[(i-m)/cols.length][m] = v;
    } else {
      return data[(i-m)/cols.length][m];
    }
  }

  const configs = [{
    column: -1,
    name: 'Row ID Type',
    value: {
      type: 'IDType'
    },
    editor: null
  },{
    column: -1,
    name: 'Column ID Type',
    value: {
      type: 'IDType'
    },
    editor: null
  }, {
    column: -1,
    name: 'value',
    value: {
      type: guessValueType(editors, 'value', -1, data_range, byIndex)
    },
    editor: null
  }];

  const editorLookup = {};
  editors.forEach((editor) => editorLookup[editor.id] = editor);
  configs.forEach((conf) => {
    conf.editor = editorLookup[conf.value.type];
  });

  const $rows = $root.html(commonFields(name)).selectAll('div.field').data(configs);
  $rows.enter().append('div').classed('form-group', true).html((d,i) => `
        <label for="${prefix}_${i}">${d.name}</label>
        <div class="input-group">
          <select class="form-control" ${i<2?'disabled="disabled"':''} id="${prefix}_${i}">
            ${editors.map((editor) => `<option value="${editor.id}" ${d.value.type === editor.id ? 'selected="selected"' : ''}>${editor.name}</option>`).join('\n')}
          </select>
          <span class="input-group-btn"><button class="btn btn-secondary" ${!d.editor.hasEditor ? 'disabled="disabled' : ''} type="button"><i class="glyphicon glyphicon-cog"></i></button></span>
        </div>`);

  $rows.select('select').on('change', updateType(editors));
  $rows.select('button').on('click', (d, i) => {
    if (i < 2) {
      d.editor.guessOptions(d.value, i === 0 ? rows: cols, identity);
    } else {
      d.editor.guessOptions(d.value, data_range, byIndex);
    }
    d.editor.edit(d.value);
  });

  //parse data
  //TODO set rows and cols
  configs[0].editor.parse(configs[0].value, rows, identity);
  configs[1].editor.parse(configs[1].value, cols, identity);
  configs[2].editor.parse(configs[2].value, data_range, byIndex);


  const common = extractCommonFields($root);

  const desc: IDataDescription = {
    type: 'matrix',
    id: fix_id(common.name+random_id(3)),
    name: common.name,
    fqname: 'upload/' + common.name,
    description: common.description,
    size: [rows.length, cols.length],
    rowtype: (<any>configs[0]).value.idType,
    coltype: (<any>configs[1]).value.idType,
    value: configs[1].value
  };

  return () => ({
    rows: rows,
    cols: cols,
    data: data,
    desc: desc
  });
}
