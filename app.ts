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

  var dataset = null;
  if (r.desc.type === 'table') {
    dataset = wrapObjects(r.desc, r.data, (<any>r.desc).idcolumn)
  } else if (r.desc.type === 'matrix') {
    dataset = null; //TODO
  }
  console.log(dataset);

  if (dataset) {
    const form = create(dataset, document.querySelector('main'));
    addIconVisChooser(document.querySelector('header'), form);
  }
});


dialog.show();

