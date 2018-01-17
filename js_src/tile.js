// class for individual map tiles

import {DisplaySymbol} from './displaySym.js';

class Tile extends DisplaySymbol{

  constructor(template){
      super(template);
      this.name = template.name;
      this.transparent = template.transparent || false;
      this.passable = template.passable || false;
  }

  isImpassable(){ return ! this.passable;}
  isPassable(){ return this.passable; }
  isTransparent(){return this.transparent;}
  isOpaque(){return !this.transparent}
  setPassable(newVal){ this.passable = newVal;}
  setTransparent(newVal){ this.transparent = newVal;}
  isA(name){
    return this.name == name;
  }
}

export let TILES = {
    NULLTILE: new Tile({name:'nullTile', chr:'#', tranparent: false, passable: false}),
    WALL: new Tile({name:'wall', chr:'#', tranparent: false, passable: false}),
    FLOOR: new Tile({name:'floor', chr:'.', tranparent: true, passable: true})
}
