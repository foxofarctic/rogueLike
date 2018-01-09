// class for individual map tiles

import {DisplaySymbol} from './displaySym.js';
class Tile extends DisplaySymbol{

  constructor(name, chr, fg, bg){
      super(chr,fg,bg);
      this.name = name;
  }
}

let TILES = {
    NULLTILE: new TILE('nullTile', '#'),
    WALL: new TILE('wall', '#'),
    FLOOR: new TILE('floor', '.')
}
