/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import {generateDialog} from '../caleydo_bootstrap_fontawesome/dialogs';
import {list as listidtypes} from '../caleydo_core/idtype';
import {ITypeDefinition, IValueTypeEditor, submitOnForm} from './valuetypes';

/**
 * edits the given type definition in place with idtype properties
 * @param definition call by reference argument
 * @return {Promise<R>|Promise}
 */
function editIDType(definition: ITypeDefinition): Promise<ITypeDefinition> {
  const idtype = (<any>definition).idType || 'Custom';
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

function guessIDType(def: ITypeDefinition, data: any[], accessor: (row: any) => string) {
  const any_def: any = def;
  if (typeof any_def.idType !== 'undefined') {
    return def;
  }
  any_def.idType = 'Custom';
  //TODO
  return def;
}

function isIDType(name: string, data: any[], accessor: (row: any) => string, sampleSize: number) {
  //TODO
  return 0;
}

function parseIDType(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => string) {
  //TODO check all ids
  return [];
}

export function idType() : IValueTypeEditor {
  return {
    isType: isIDType,
    parse: parseIDType,
    guessOptions: guessIDType,
    edit: editIDType
  }
}
