/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

//register all extensions in the registry following the given pattern
module.exports = function (registry) {
  //registry.push('extension-type', 'extension-id', function() { return System.import('./src/extension_impl'); }, {});
  registry.push('importer_value_type', 'categorical', function () {
    return System.import('./src/valuetypes');
  }, {
    'factory': 'categorical',
    'name': 'Categorical',
    'priority': 50
  });

  registry.push('importer_value_type', 'real', function () {
    return System.import('./src/valuetypes');
  }, {
    'factory': 'numerical',
    'name': 'Float',
    'priority': 10
  });

  registry.push('importer_value_type', 'int', function () {
    return System.import('./src/valuetypes');
  }, {
    'factory': 'numerical',
    'name': 'Integer',
    'priority': 20
  });

  registry.push('importer_value_type', 'string', function () {
    return System.import('./src/valuetypes');
  }, {
    'factory': 'string_',
    'name': 'String',
    'priority': 100
  });

  registry.push('importer_value_type', 'idType', function () {
    return System.import('./src/valuetype_idtype');
  }, {
    'factory': 'idType',
    'name': 'IDType',
    'priority': 30,
    'implicit': true
  });
};

