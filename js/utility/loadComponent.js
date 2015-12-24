/**
 * Created by Sunny Hardasani on 12/23/2015.
 * This file will register the webcomponent
 * with name x-importer-template.
 * on calling the create element new component
 * will get create on the ui
 * todo need to the
 */

define(function(){
    function supportsCustomElements() {
        return 'registerElement' in document;
    }
    if (supportsCustomElements()) {
        var proto = Object.create(HTMLElement.prototype, {
            createdCallback: {
                value: function() {
                    var t = document.querySelector('#importertemplate');
                    var clone = document.importNode(t.content, true);
                    this.appendChild(clone);
                }
            }
        });
        document.registerElement('x-importer-template', {prototype: proto});
    }
    else{
        alert("WHOAA!!! I think register element is not\ " +
            "supported in you browser...");
    }
});
