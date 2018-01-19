//encapsulate the handling of mixins
import {DisplaySymbol} from './displaySym.js';
import * as E from './mixinEntities.js';

export class MixableSymbol extends DisplaySymbol {
  constructor(template) {
    super(template);
    console.log("constructing mixins");
    console.dir(template);
    if (! this.state){this.state = {};}

    this.mixins = [];
    this.mixinTracker = {};
    if (template.mixinNames){
      for (let mi = 0; mi < template.mixinNames.length; mi++){
        this.mixins.push(E[template.mixinNames[mi]]);
        this.mixinTracker[template.mixinNames[mi]] = true;
        console.log(template.mixinNames[mi]);
      }
    }

    for (let mi = 0; mi < this.mixins.length; mi++){
      let m = this.mixins[mi];
      if (m.META.stateNameSpace) {
        this.state[m.META.stateNameSpace] = {};
        if (m.META.stateModel){
          for (let sbase in m.META.stateModel){
            this.state[m.META.stateNameSpace][sbase] = m.META.stateModel[sbase];
          }
        }
      }
      for (let method in m.METHODS) {
        if (m.METHODS) {
          this[method] = m.METHODS[method];
        }
      }
      console.log("mixin stateNameSpace of " + template.mixinNames[mi] );
      console.dir(this.state[m.META.stateNameSpace]);
    }
    for (let mi = 0; mi < this.mixins.length; mi++) {
      let m = this.mixins[mi];
      if (m.META.initialize) {
        m.META.initialize.call(this,template);
      }
    }
  }

  raiseMixinEvent(evtLabel, evtData) {
    for (let mi = 0; mi < this.mixins.length; mi++) {
      let m = this.mixins[mi];
      if (m.LISTENERS && m.LISTENERS[evtLabel]) {
        m.LISTENERS[evtLabel].call(this,evtData);
      }
    }
  }
}
