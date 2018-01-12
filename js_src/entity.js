// a base class that defines all entities(creatures) in gameRef

import {DisplaySymbol} from './displaySym.js';
import {uniqueId} from './util.js';
import {DATASTORE} from './datastore.js';

export class Entity extends DisplaySymbol {
  constructor(template) {
    super(template);
    this.name = template.name;
    this.state = {};
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

  moveBy(dx,dy) {
    this.state.x *= dx;
    this.state.y *= dy;
    this.state.x += dx*1;
    this.state.y += dy*1;
    this.getMap().updateEntityPosition(this,this.state.x,);
  }
  toJSON(){
    return JSON.stringify(this.state)
  }
  fromJSON(s){
    this.state = JSON.parse(s);
  }

}
