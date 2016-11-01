/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import {create as createImporter} from './index';

import {generateDialog} from 'phovea_bootstrap_fontawesome/src/dialogs';
import {wrapObjects} from 'phovea_core/src/table_impl';
import {create, addIconVisChooser} from 'phovea_core/src/multiform';

const dialog = generateDialog('Import', 'Import');

const importer = createImporter(dialog.body, {});

dialog.onSubmit(() => {
  const r = importer.getResult();
  if (r == null) {
    return;
  }

  dialog.hide();
  console.log(r);

  var dataset = null;
  if (r.desc.type === 'table') {
    dataset = wrapObjects(r.desc, r.data, (<any>r.desc).idcolumn);
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

