// a base class that defines all entities(creatures) in gameRef

import {MixableSymbol} from './mixableSym.js';
import {uniqueId} from './util.js';
import {DATASTORE} from './datastore.js';

export class Entity extends MixableSymbol {
  constructor(template) {
    super(template);
    this.name = template.name;
    if (!this.state){ this.state = {}; }
    this.state.x = 0;
    this.state.y = 0; // initial set
    this.state.mapId = 0;
    this.state.id = uniqueId();
  }

  getName(){ return this.state.name;}
  setName(newInfo){ this.state.name = newInfo; }
  getX(){ return this.state.x;}
  setX(newInfo){ this.state.x = newInfo;}
  getY(){ return this.state.y;}
  setY(newInfo){ this.state.y = newInfo;}
  getPosition(){  return `${this.state.x},${this.state.y}`; }
  getMapId(){ return this.state.mapId; }
  setMapId(newInfo){this.state.mapId = newInfo; }
  getMap(){ return DATASTORE.MAPS[this.state.mapId]; }
  getId(){ return this.state.id; }
  setId(newInfo){ this.state.id = newInfo;}

  destroy(){
    // remove from map remove from DATASTORE
    this.getMap().extractEntity(this);
    delete DATASTORE[this.getId()];
  }

  moveBy(dx,dy) {
    let newX = this.state.x*1 + dx*1;
    let newY = this.state.y*1 + dy*1;

  // check validity
    if(this.getMap().isPositionOpen(newX,newY)){
        this.state.x = newX;
        this.state.y = newY;
        this.getMap().updateEntityPosition(this,this.state.x,this.state.y);
        return true;
     }
    return false
  }
  toJSON(){
    return JSON.stringify(this.state)
  }
  fromJSON(s){
    this.state = JSON.parse(s);
  }

}
