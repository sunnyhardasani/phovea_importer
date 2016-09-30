/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import {generateDialog} from '../caleydo_bootstrap_fontawesome/dialogs';
import {list as listPlugins, IPluginDesc} from '../caleydo_core/plugin';

export interface ITypeDefinition {
  type: string;
  [key: string]: any;
}

export interface IValueTypeEditor {
  /**
   * guesses whether the given data is of the given type, returns a confidence value
   * @param data
   * @param accessor
   * @param sampleSize
   * @return the confidence (0 ... not, 1 ... sure) that this is the right value type
   */
  isType(data: any[], accessor: (row: any) => string, sampleSize: number): number;
  /**
   * parses the given value and updates them inplace
   * @return an array containing invalid indices
   */
  parse(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => string): number[];
  /**
   * guesses the type definition options
   * @param def
   * @param data
   * @param accessor
   */
  guessOptions(def: ITypeDefinition, data: any[], accessor: (row: any) => string);
  /**
   * opens and editor to edit the options
   * @param def
   */
  edit(def: ITypeDefinition);
}

export function submitOnForm(dialog: any, onSubmit: ()=>any) {
  dialog.body.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    onSubmit();
  });
  dialog.onSubmit(onSubmit);
}

//TODO normalized options: trim, toLowerCase, toUpperCase, Regex replacement
export function string_() : IValueTypeEditor {
  return {
    isType: () => 1,
    parse: () => [],
    guessOptions: (d) => d,
    edit: null
  }
}

/**
 * edits the given type definition in place with categories
 * @param definition call by reference argument
 * @return {Promise<R>|Promise}
 */
function editCategorical(definition: ITypeDefinition) {
  const cats = (<any>definition).categories || [];

  return new Promise((resolve) => {
    const dialog = generateDialog('Edit Categories (name TAB color)', 'Save');
    dialog.body.classList.add('caleydo-importer-categorical');
    dialog.body.innerHTML = `
      <form>
        <textarea class="form-control">${cats.map((cat) => cat.name + '\t' + cat.color).join('\n')}</textarea>
      </form>
    `;
    const textarea = dialog.body.querySelector('textarea');
    //http://stackoverflow.com/questions/6637341/use-tab-to-indent-in-textarea#6637396 enable tab character
    textarea.addEventListener('keydown', function (e: KeyboardEvent) {
      if (e.keyCode === 9 || e.which === 9) {
        e.preventDefault();
        var s = this.selectionStart;
        this.value = this.value.substring(0, this.selectionStart) + '\t' + this.value.substring(this.selectionEnd);
        this.selectionEnd = s + 1;
      }
    });
    submitOnForm(dialog, () => {
      const text = (<HTMLTextAreaElement>dialog.body.querySelector('textarea')).value;
      const categories = text.trim().split('\n').map((row) => {
        var l = row.trim().split('\t');
        return {name: l[0].trim(), color: l.length > 1 ? l[1].trim() : 'gray'};
      });
      dialog.hide();
      definition.type = 'categorical';
      (<any>definition).categories = categories;
      resolve(definition);
    });
    dialog.show();
  });
}

function guessCategorical(def: ITypeDefinition, data: any[], accessor: (row: any) => string) {
  const any_def: any = def;
  if (typeof any_def.categories !== 'undefined') {
    return def;
  }
  //unique values
  var cache = {};
  data.forEach((row) => {
    const v = accessor(row);
    cache[v] = v;
  });
  any_def.categories = Object.keys(cache).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).map((cat) => ({
    name: cat,
    color: 'gray'
  }));
  return def;
}

function isCategorical(data: any[], accessor: (row: any) => string, sampleSize: number) {
  const test_size = Math.min(data.length, sampleSize);
  if (test_size <= 0) {
    return 0;
  }
  const categories = {};
  for (let i = 0; i < test_size; ++i) {
    let v = accessor(data[i]);
    if (v == null || v.trim().length === 0) {
      continue; //skip empty samples
    }
    categories[v] = v;
  }

  const num_cats = Object.keys(categories).length;
  return 1-num_cats/test_size;
}

function parseCategorical(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => string) {
  const categories = ((<any>def).categories ||[]).map((cat) => cat.name);
  const invalid = [];
  function isValidCategory(v: string) {
    return categories.indexOf(v) >= 0;
  }
  data.forEach((d,i) => {
    const v = accessor(d);
    if (!isValidCategory(v)) {
      invalid.push(i);
    }
  });
  return invalid;
}

export function categorical() : IValueTypeEditor {
  return {
    isType: isCategorical,
    parse: parseCategorical,
    guessOptions: guessCategorical,
    edit: editCategorical
  }
}

/**
 * edits the given type definition in place with numerical properties
 * @param definition call by reference argument
 * @return {Promise<R>|Promise}
 */
export function editNumerical(definition: ITypeDefinition): Promise<ITypeDefinition> {
  const type = (<any>definition).type || 'real';
  const range = (<any>definition).range || [0, 100];

  return new Promise((resolve) => {
    const dialog = generateDialog('Edit Numerical Range', 'Save');
    dialog.body.classList.add('caleydo-importer-numerical');
    dialog.body.innerHTML = `
      <form>
        <div class="checkbox">
          <label class="radio-inline">
            <input type="radio" name="numerical-type" value="real" ${type !== 'int' ? 'checked="checked"' : ''}> Float
          </label>
          <label class="radio-inline">
            <input type="radio" name="numerical-type" value="int" ${type === 'int' ? 'checked="checked"' : ''}> Integer
          </label>
        </div>
        <div class="form-group">
          <label for="minRange">Minimum Value</label>
          <input type="number" class="form-control" name="numerical-min" step="any" value="${range[0]}">
        </div>
        <div class="form-group">
          <label for="maxRange">Maximum Value</label>
          <input type="number" class="form-control" name="numerical-max" step="any" value="${range[1]}">
        </div>
      </form>
    `;
    submitOnForm(dialog, () => {
      const type_s = (<HTMLInputElement>dialog.body.querySelector('input[name=numerical-type]')).checked ? 'real' : 'int';
      const min_r = parseFloat((<HTMLInputElement>dialog.body.querySelector('input[name=numerical-min]')).value);
      const max_r = parseFloat((<HTMLInputElement>dialog.body.querySelector('input[name=numerical-max]')).value);
      dialog.hide();
      definition.type = type_s;
      (<any>definition).range = [min_r, max_r];
      resolve(definition);
    });
    dialog.show();
  });
}

export function guessNumerical(def: ITypeDefinition, data: any[], accessor: (row: any) => string) {
  //TODO support different notations, comma vs point
  const any_def: any = def;
  if (typeof any_def.range !== 'undefined') {
    return def;
  }
  var min_v = data.length === 0 ? 0 : parseFloat(accessor(data[0]));
  var max_v = data.length === 0 ? 100 : parseFloat(accessor(data[0]));
  data.forEach((row) => {
    const v = parseFloat(accessor(row));
    if (v < min_v) {
      min_v = v;
    }
    if (v > max_v) {
      max_v = v;
    }
  });
  any_def.range = [min_v, max_v];
  return def;
}

function isNumerical(data: any[], accessor: (row: any) => string, sampleSize: number) {
  const test_size = Math.min(data.length, sampleSize);
  if (test_size <= 0) {
    return 0;
  }
  const isFloat = /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i;
  var numNumerical = 0;

  for (let i = 0; i < test_size; ++i) {
    let v = accessor(data[i]);
    if (v == null || v.trim().length === 0) {
      continue; //skip empty samples
    }
    if (isFloat.test(v)) {
      numNumerical += 1;
    }
  }
  return numNumerical / test_size;
}

function parseNumerical(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => string) {
  const isInt = def.type === 'int';
  const invalid = [];
  const isFloat = /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i;
  data.forEach((d,i) => {
    const v = accessor(d);
    if (!isFloat.test(v)) {
      invalid.push(i);
    } else {
      accessor(d, isInt ? parseInt(v) : parseFloat(v));
    }
  });
  return invalid;
}

export function numerical() : IValueTypeEditor {
  return {
    isType: isNumerical,
    parse: parseNumerical,
    guessOptions: guessNumerical,
    edit: editNumerical
  }
}

export interface IValueTypeDesc extends IPluginDesc {
  valuetype: string;
  priority: number;
}

function toValueTypeDesc(v: any): IValueTypeDesc {
  if (typeof v.priority === 'undefined') {
    v.priority = 100;
  }
  return v;
}

/**
 * returns all known value type editors
 * @return {any}
 */
export function getValueTypesEditors() {
  return listPlugins('importer_value_type').map(toValueTypeDesc);
}

