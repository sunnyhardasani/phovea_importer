/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

/// <amd-dependency path='css!./style' />
import C = require('../caleydo_core/main');
import events = require('../caleydo_core/event');
import parser = require('./parser');
import d3 = require('d3');

export class Importer extends events.EventHandler {
  private options = {

  };
  private $parent : d3.Selection<any>;

  constructor(parent: Element, options : any = {}) {
    super();
    C.mixin(this.options, options);
    this.$parent = d3.select(parent).append('div').classed('caleydo-importer', true);

    this.build(this.$parent);
  }

  private selectedFile(file: File) {
    parser.parseCSV(file).then((result) => {
      console.log(result);
    });
  }

  private build($root: d3.Selection<any>) {
    $root.html(`
      <div class="drop-zone">
        <input type="file" id="importer-file" />
      </div>
    `);

    function over() {
      const e =<DragEvent>d3.event;
      e.stopPropagation();
      e.preventDefault();
      const s = (<HTMLElement>e.target).classList;
      if (e.type === 'dragover') {
        s.add('over');
      } else {
        s.remove('over');
      }
    }

    const select = ()=> {
      over();
      const e : any =d3.event;
      const files = e.target.files || e.dataTransfer.files;
      if (files.length > 0) {
        this.selectedFile(files[0]);
      }
    };

    $root.select('input[type=file]').on('change', select);
    $root.select('div.drop-zone').on('dragover', over).on('dragleave', over).on('drop', select);
  }
}


export function create(parent: Element, options: any = {}) {
  return new Importer(parent, options);
}
