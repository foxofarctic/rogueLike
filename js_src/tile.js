// class for individual map tiles

import {DisplaySymbol} from './displaySym.js';

class Tile extends DisplaySymbol{

  constructor(name, chr, fg, bg){
      super(chr,fg,bg);
      this.name = name;
  }
}

export let TILES = {
    NULLTILE: new Tile('nullTile', '#'),
    WALL: new Tile('wall', '#'),
    FLOOR: new Tile('floor', '.')
}
