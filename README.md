Caleydo Data Importer ![Caleydo Web Client Plugin](https://img.shields.io/badge/Caleydo%20Web-Client%20Plugin-F47D20.svg)
=====================

A data importer that takes a CSV file, let's users define the data types and properties, and hands it over for parsing.

Installation
------------
```bash
./manage.sh clone Caleydo/caleydo_importer
./manage.sh resolve
```

If you want this plugin to be dynamically resolved as part of another application of plugin, you need to add it as a peer dependency to the _package.json_ of the application or plugin it should belong to:

```json
{
  "peerDependencies": {
    "caleydo_importer": "*"
  }
}
```

***

<a href="https://caleydo.org"><img src="http://caleydo.org/assets/images/logos/caleydo.svg" align="left" width="200px" hspace="10" vspace="6"></a>
This repository is part of **[Caleydo Web](http://caleydo.org/)**, a platform for developing web-based visualization applications. For tutorials, API docs, and more information about the build and deployment process, see the [documentation page](http://caleydo.org/documentation/).
