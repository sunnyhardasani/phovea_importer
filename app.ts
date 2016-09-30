/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import main = require('./main');

import {generateDialog} from '../caleydo_bootstrap_fontawesome/dialogs';
import {wrapObjects} from '../caleydo_core/table_impl';
import {create, addIconVisChooser} from '../caleydo_core/multiform';

const dialog = generateDialog('Import', 'Import');

const importer = main.create(dialog.body, {});

dialog.onSubmit(() => {
  const r = importer.getResult();
  if (r == null) {
    return;
  }

  dialog.hide();
  console.log(r);

  const table = wrapObjects(r.desc, r.data, (<any>r.desc).idcolumn);
  console.log(table);

  const form = create(table, document.querySelector('main'));
  addIconVisChooser(document.querySelector('header'), form);
});


dialog.show();

