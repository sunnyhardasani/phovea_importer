/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import {generateDialog} from '../caleydo_bootstrap_fontawesome/dialogs';
import {list as listPlugins, IPluginDesc, load as loadPlugins, IPlugin, get as getPlugin} from '../caleydo_core/plugin';
import {mixin} from '../caleydo_core/main';

export interface ITypeDefinition {
  type: string;
  [key: string]: any;
}

export interface IValueTypeEditor {
  /**
   * guesses whether the given data is of the given type, returns a confidence value
   * @param name name of the column
   * @param data
   * @param accessor
   * @param sampleSize
   * @return the confidence (0 ... not, 1 ... sure) that this is the right value type
   */
  isType(name: string, data: any[], accessor: (row: any) => string, sampleSize: number): number;
  /**
   * parses the given value and updates them inplace
   * @return an array containing invalid indices
   */
  parse(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => any): number[];
  /**
   * guesses the type definition options
   * @param def
   * @param data
   * @param accessor
   */
  guessOptions(def: ITypeDefinition, data: any[], accessor: (row: any) => any);
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

/**
 * edits the given type definition in place with categories
 * @param definition call by reference argument
 * @return {Promise<R>|Promise}
 */
function editString(definition: ITypeDefinition) {
  const def: any = definition;
  const convert = def.convert || null;
  const regexFrom = def.regexFrom || null;
  const regexTo = def.regexTo || null;

  return new Promise((resolve) => {
    const dialog = generateDialog('Edit String Conversion', 'Save');
    dialog.body.classList.add('caleydo-importer-string');
    dialog.body.innerHTML = `
      <form>
        <div class="form-group">
          <label>Text Conversion</label>
          
          <div class="radio">
            <label class="radio">
              <input type="radio" name="string-convert" value="" ${!convert ? 'checked="checked"' : ''}> None
            </label>
           </div>
          <div class="radio">
            <label class="radio">
              <input type="radio" name="string-convert" value="toUpperCase" ${convert ==='toUpperCase' ? 'checked="checked"' : ''}> UPPER CASE
            </label>
           </div>
          <div class="radio">
            <label class="radio">
              <input type="radio" name="string-convert" value="toLowerCase" ${convert ==='toLowerCase' ? 'checked="checked"' : ''}> lower case
            </label>
           </div>
          <div class="radio">
            <label class="radio">
              <input type="radio" name="string-convert" value="regex" ${convert ==='regex"' ? 'checked="checked"' : ''}> Regex Replacement
            </label>
           </div>
          </div>
          <div class="form-group">
            <label for="regexFrom">Regex Search Expression</label>
            <input type="text" class="form-control" ${convert !== 'regex' ? 'disabled="disabled"' : ''} name="regexFrom" value="${regexFrom || ''}">
          </div>
          <div class="form-group">
            <label for="regexTo">Regex Replacement Expression</label>
            <input type="text" class="form-control"  ${convert !== 'regex' ? 'disabled="disabled"' : ''} name="regexTo" value="${regexTo || ''}">
          </div>
      </form>
    `;
    const choices = ([].slice.apply(dialog.body.querySelectorAll('input[type="radio"]')));
    choices.forEach((e) => e.addEventListener('change', function() {
      const regexSelected = (this.checked && this.value === 'regex');
      ([].slice.apply(dialog.body.querySelectorAll('input[type="text"]'))).forEach((e) => e.disabled = !regexSelected);
    }));

    function findSelectedRadio() {
      const first = choices.filter((e) => e.checked)[0];
      return first ? first.value : '';
    }

    submitOnForm(dialog, () => {
      dialog.hide();
      definition.type = 'string';
      def.convert = findSelectedRadio();
      def.regexFrom = def.convert === 'regex' ? (<HTMLInputElement>(dialog.body.querySelector('input[name="regexFrom"]'))).value : null;
      def.regexTo = def.convert === 'regex' ? (<HTMLInputElement>(dialog.body.querySelector('input[name="regexTo"]'))).value : null;

      resolve(definition);
    });
    dialog.show();
  });
}

function guessString(def: ITypeDefinition, data: any[], accessor: (row: any) => string) {
  const any_def: any = def;
  if (typeof any_def.convert !== 'undefined') {
    return def;
  }
  any_def.convert = null;
  return def;
}

function parseString(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => string) {
  const anydef : any = def;
  const regexFrom = new RegExp(anydef.regexFrom);
  const regexTo = anydef.regexTo;

  const lookup = {
    toLowerCase: (d:string)=>d.toLowerCase(),
    toUpperCase: (d:string)=>d.toUpperCase(),
    regex: (d:string)=>d.replace(regexFrom, regexTo)
  };
  const op = lookup[anydef.convert];

  if (!op) {
    return [];
  }

  const invalid = [];
  data.forEach((d,i) => {
    var v = String(accessor(d));
    v = op(v);
    accessor(d,v);
  });
  return invalid;
}


export function string_() : IValueTypeEditor {
  return {
    isType: () => 1, //always a string
    parse: parseString,
    guessOptions: (d) => guessString,
    edit: editString
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

function isCategorical(name: string, data: any[], accessor: (row: any) => string, sampleSize: number) {
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

function isNumerical(name: string, data: any[], accessor: (row: any) => string, sampleSize: number) {
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
  name: string;
  priority: number;
}

function toValueTypeDesc(v: any): IValueTypeDesc {
  if (typeof v.priority === 'undefined') {
    v.priority = 100;
  }
  if (typeof v.name === 'undefined') {
    v.name = v.valuetype;
  }
  return v;
}


export class ValueTypeEditor implements IValueTypeEditor {
  private desc: any;
  private impl : IValueTypeEditor;

  constructor(impl: IPlugin) {
    this.desc = impl.desc;
    this.impl = impl.factory();
  }

  get hasEditor() {
    return this.impl.edit != null;
  }

  get isImplicit() {
    return this.desc.implicit === true;
  }

  get priority() {
    return typeof this.desc.priority !== 'undefined' ? this.desc.priority : 100;
  }

  get name() {
    return this.desc.name;
  }

  get id() {
    return this.desc.id;
  }

  isType(name: string, data: any[], accessor: (row: any) => string, sampleSize: number) {
    return this.impl.isType(name, data, accessor, sampleSize);
  };

  parse(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => any): number[] {
    return this.impl.parse(def, data, accessor);
  }

  guessOptions(def: ITypeDefinition, data: any[], accessor: (row: any) => any) {
    return this.impl.guessOptions(def, data, accessor);
  }

  edit(def: ITypeDefinition) {
    return this.impl.edit(def);
  }
}

const EXTENSION_POINT = 'importer_value_type';

export function createValueTypeEditor(id: string): Promise<ValueTypeEditor> {
  const p = getPlugin(EXTENSION_POINT, id);
  if (!p) {
    return Promise.reject('not found: '+id);
  }
  return p.load().then((impl) => new ValueTypeEditor(impl));
}

export function createValueTypeEditors(): Promise<ValueTypeEditor[]> {
  return loadPlugins(listPlugins(EXTENSION_POINT)).then((impls) => impls.map((i) => new ValueTypeEditor(i)));
}

export interface IGuessOptions {
  /**
   * number of samples considered
   */
  sampleSize?: number; //100
  /**
   * threshold if more than X percent of the samples are numbers it will be detected as number
   * numerical - 0.7
   * categorical - 0.7
   */
  thresholds?: { [type: string]: number };
}

/**
 * guesses the value type returning a string
 * @param editors the possible types
 * @param name the name of the column/file for helper
 * @param data the data
 * @param accessor to access the column
 * @param options additional options
 * @return {any}
 */
export function guessValueType(editors: ValueTypeEditor[], name: string, data: any[], accessor: (row: any) => any, options : IGuessOptions = {}) {
  options = mixin({
    sampleSize: 100,
    thresholds: <any>{
      numerical: 0.7,
      categorical: 0.7
    }
  }, options);
  const test_size = Math.min(options.sampleSize, data.length);

  //compute guess results
  var results = editors.map((editor) => ({type: editor.id, editor: editor, confidence: editor.isType(name, data, accessor, test_size), priority: editor.priority}));
  //filter all 0 confidence ones by its threshold
  results = results.filter((r) => typeof options.thresholds[r.type] !== 'undefined' ? r.confidence >= options.thresholds[r.type] : r.confidence > 0);

  if (results.length <= 0) {
    return null;
  }
  //order by priority (less more important)
  results = results.sort((a,b) => a.priority - b.priority);
  //choose the first one
  return results[0].type;
}
