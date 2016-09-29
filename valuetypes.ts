/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import {generateDialog} from '../caleydo_bootstrap_fontawesome/dialogs';
import {list as listidtypes} from '../caleydo_core/idtype';
import {mixin} from '../caleydo_core/main';

export interface ITypeDefinition {
  type: string;
  [key: string]: any;
}

function submitOnForm(dialog: any, onSubmit: ()=>any) {
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
export function editCategorical(definition: ITypeDefinition) {
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

export function guessCategorical(def: ITypeDefinition, data: any[], accessor: (row: any) => string) {
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

function isNumerical(v: string) {
  //copied from regex from papaparse
  return /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i.test(v);
}

/**
 * edits the given type definition in place with idtype properties
 * @param definition call by reference argument
 * @return {Promise<R>|Promise}
 */
export function editIDType(definition: ITypeDefinition): Promise<ITypeDefinition> {
  const idtype = (<any>definition).idtype || 'Custom';
  const existing = listidtypes();
  const idtypes_list = existing.map((type) => `<option value="${type.id}" ${type.id === idtype ? 'selected="selected"' : ''}>${type.name}</option>`).join('\n');

  return new Promise((resolve) => {
    const dialog = generateDialog('Edit IDType', 'Save');
    dialog.body.classList.add('caleydo-importer-idtype');
    dialog.body.innerHTML = `
      <form>
        <div class="form-group">
          <label for="idType">IDType</label>
          <select id="idType" class="form-control">
            <option value=""></option>
            ${idtypes_list} 
          </select>
        </div>
        <div class="form-group">
          <label for="idType_new">New IDType</label>
          <input type="text" class="form-control" id="idType_new" value="${existing.some((i) => i.id === idtype) ? '' : idtype}">
        </div>
      </form>
    `;
    (<HTMLSelectElement>(dialog.body.querySelector('select'))).addEventListener('change', function (e) {
      (<HTMLInputElement>(dialog.body.querySelector('input'))).disabled = this.selectedIndex !== 0;
    });

    submitOnForm(dialog, () => {
      const selectedIndex = (<HTMLSelectElement>dialog.body.querySelector('select')).selectedIndex;
      const idType = selectedIndex <= 0 ? (<HTMLInputElement>dialog.body.querySelector('input')).value : existing[selectedIndex - 1].id;
      dialog.hide();
      definition.type = 'idType';
      (<any>definition).idType = idType;
      resolve(definition);
    });
    dialog.show();
  });
}


export function guessIDType(def: ITypeDefinition, data: any[], accessor: (row: any) => string) {
  const any_def: any = def;
  if (typeof any_def.idType !== 'undefined') {
    return def;
  }
  any_def.idtype = 'Custom';
  //TODO
  return def;
}

export interface IGuessOptions {
  /**
   * number of samples considered
   */
  sampleSize?: number; //100
  /**
   * threshold if more than X percent of the samples are numbers it will be detected as number
   */
  numberThreshold?: number; //0.7
  /**
   * threshold if less than X percent are unique categories in the samples it will be detected as categorical
   */
  categoricalThreshold?: number; //0.3
}

/**
 * guesses the value type
 * @param data the underlying data
 * @param accessor accessor to the specific property
 * @return {string}
 */
export function guessValueType(data: any[], accessor: (row: any) => string, options: IGuessOptions = {}) {
  options = mixin({
    sampleSize: 100,
    numberThreshold: 0.7,
    categoricalThreshold: 0.3
  }, options);
  const test_size = Math.min(options.sampleSize, data.length);

  var numNumerical = 0;
  const categories = {};
  for (let i = 0; i < test_size; ++i) {
    let v = accessor(data[i]);
    if (v == null || v.trim().length === 0) {
      continue; //skip empty samples
    }
    if (isNumerical(v)) {
      numNumerical += 1;
    }
    categories[v] = v;
  }

  if (numNumerical >= test_size * options.numberThreshold) {
    return 'real';
  }
  if (Object.keys(categories).length <= test_size * options.categoricalThreshold) {
    return 'categorical';
  }

  return 'string';
}

/**
 * guesses and extends the given type definition if needed
 * @param def the existing definition
 * @param data the underlying data
 * @param accessor accessor to the specific property
 * @return {any}
 */
export function guessValueTypeOptions(def: ITypeDefinition, data: any[], accessor: (row: any) => string) {
  switch (def.type) {
    case 'idType':
      return guessIDType(def, data, accessor);
    case 'categorical':
      return guessCategorical(def, data, accessor);
    case 'int':
    case 'real':
      return guessNumerical(def, data, accessor);
  }
  return def;
}

/**
 * edits the given type definition edits it in place
 * @param def the existing definition
 * @return {any}
 */
export function editValueType(def: ITypeDefinition): Promise<ITypeDefinition> {
  switch (def.type) {
    case 'idType':
      return editIDType(def);
    case 'categorical':
      return editCategorical(def);
    case 'int':
    case 'real':
      return editNumerical(def);
  }
  return Promise.resolve(def);
}
