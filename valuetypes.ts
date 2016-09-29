/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import dialogs = require('../caleydo_bootstrap_fontawesome/dialogs');

export interface ITypeDefinition {
  type: string;
  [key: string]: any;
}

export function editCategorical(old: ITypeDefinition): Promise<ITypeDefinition> {
  const cats = (<any>old).categories || [];

  return new Promise((resolve) => {
    const dialog = dialogs.generateDialog('Edit Categories (name TAB color)', 'Save');
    dialog.body.classList.add('caleydo-importer-categorical');
    dialog.body.innerHTML = `
      <form>
        <textarea class="form-control">${cats.map((cat) => cat.name + '\t' + cat.color).join('\n')}</textarea>
      </form>
    `;
    const textarea = dialog.body.querySelector('textarea');
    //http://stackoverflow.com/questions/6637341/use-tab-to-indent-in-textarea#6637396 enable tab character
    textarea.addEventListener('keydown', function(e: KeyboardEvent) {
      if (e.keyCode == 9 || e.which == 9) {
        e.preventDefault();
        var s = this.selectionStart;
        this.value = this.value.substring(0, this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
        this.selectionEnd = s + 1;
      }
    });
    dialog.onSubmit(() => {
      const text = (<HTMLTextAreaElement>dialog.body.querySelector('textarea')).value;
      const categories = text.trim().split('\n').map((row) => {
        var l = row.trim().split('\t');
        return {name: l[0].trim(), color: l.length > 1 ? l[1].trim() : 'gray' };
      });
      dialog.hide();
      resolve({ type: 'categorical', categories: categories });
    });
    dialog.show();
  });
}

export function editNumerical(old: ITypeDefinition): Promise<ITypeDefinition> {
  const type = (<any>old).type || 'real';
  const range = (<any>old).range || [0, 100];

  return new Promise((resolve) => {
    const dialog = dialogs.generateDialog('Edit Numerical Range', 'Save');
    dialog.body.classList.add('caleydo-importer-numerical');
    dialog.body.innerHTML = `
      <form>
        <div class="checkbox">
          <label class="radio-inline">
            <input type="radio" name="numerical-type" value="real" ${type !== 'int'? 'checked="checked"' : ''}> Real
          </label>
          <label class="radio-inline">
            <input type="radio" name="numerical-type" value="int" ${type === 'int'? 'checked="checked"' : ''}> Int
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

    dialog.onSubmit(() => {
      const type_s = (<HTMLInputElement>dialog.body.querySelector('input[name=numerical-type]')).checked ? 'real' : 'int';
      const min_r = parseFloat((<HTMLInputElement>dialog.body.querySelector('input[name=numerical-min]')).value);
      const max_r = parseFloat((<HTMLInputElement>dialog.body.querySelector('input[name=numerical-max]')).value);
      dialog.hide();
      resolve({ type: type_s, range: [min_r, max_r] });
    });
    dialog.show();
  });
}
