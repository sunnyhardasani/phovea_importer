/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import main = require('./main');

import {generateDialog} from '../caleydo_bootstrap_fontawesome/dialogs';

//TODO

const dialog = generateDialog('Import', 'Import');

const importer = main.create(dialog.body, {});

dialog.onSubmit(() => {
  dialog.hide();
  const r = importer.getResult();
  console.log(r);
});

dialog.show();

