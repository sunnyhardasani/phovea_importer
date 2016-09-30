/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import {mixin, fix_id} from '../caleydo_core/main';
import d3 = require('d3');
import {ITypeDefinition, ValueTypeEditor, guessValueType} from './valuetypes';
import {IDataDescription} from '../caleydo_core/datatype';

export interface IColumnDefinition {
  name: string;
  column: string|number;
  value: ITypeDefinition;
}

export function importTable(editors: ValueTypeEditor[], $root: d3.Selection<any>, header: string[], data: string[][], name: string) {
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
  const config = header.map((name, i) => ({
    column: i,
    name: name,
    value: {
      type: guessValueType(editors, name, data, (row)=>row[i])
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
          <button class="btn-default btn-sm${!(<any>d).editor.hasEditor ? ' disabled" disabled="disabled' : ''}" type="button"><i class="glyphicon glyphicon-cog"></i></button>
        </span>
      </td>`);
  $rows_enter.select('input').on('change', function (d) {
    d.name = this.value;
  });
  $rows_enter.select('select').on('change', function (d) {
    const type = editors[this.selectedIndex < 0 ? 0 : this.selectedIndex];
    d.value.type = type.id;
    (<any>d).editor = type;
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
  });
  $rows_enter.select('button').on('click', (d) => {
    (<any>d).editor.guessOptions(d.value, data, (row) => row[d.column]);
    (<any>d).editor.edit(d.value);
  });

  return () => ({data: data, desc: toTableDataDescription(config, data, name)});
}

function toTableDataDescription(config: IColumnDefinition[], data: any[], name: string) {
  //derive all configs
  config.forEach((d) => {
    const editor = (<any>d).editor;
    editor.guessOptions(d.value, data, (row) => row[d.column]);
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
    id: fix_id(name),
    name: name,
    fqname: 'upload/' + name,
    size: [data.length, columns.length],
    idtype: (<any>idProperty).value.idType,
    columns: columns,
    idcolumn: <string>idProperty.column
  };

  return desc;
}
