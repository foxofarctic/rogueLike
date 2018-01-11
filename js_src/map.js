// map class the tile grid the game is played on
import ROT from 'rot-js';
//import * as U from './util.js';
import {TILES} from './tile.js';
import {init2DArray, uniqueId} from './util.js';
import {DATASTORE} from './datastore.js';


class Map{
  constructor(xdim, ydim) {
    this.state = {};
    this.state.xdim = xdim || 1;
    this.state.ydim = ydim || 1;
  //  this.tileGrid = init2DArray( this.xdim, this.ydim, TILES.NULLTILE );
    this.state.mapType = 'basic caves' ;
    this.state.setupRngState = ROT.RNG.getState();
    this.state.id = uniqueId('map-'+ this.state.mapType);
    console.dir(this);
  }

  build() {
    this.tileGrid =
    TILE_GRID_GENERATOR[this.state.mapType](this.state.xdim, this.state.ydim, this.state.setupRngState);
  }
  getId(){
    return this.state.id;
  }
  setId(newId){
    this.state.id = newId;
  }

  getXDim(){
    return this.state.xdim;
  }
  setXDim(newId){
    this.state.xdim = newId;
  }
  getYDim(){
    return this.state.ydim;
  }
  setYDim(newId){
    this.state.ydim = newId;
  }
  getMapType(){
    return this.state.mapType;
  }
  setMapType(newId){
    this.state.mapType = newId;
  }
  getRngState(){
    return this.state.setupRngState;
  }
  setRngState(newId){
    this.state.setupRngState = newId;
  }
  getTile(x,y) {
    if ((x < 0) || (x >= this.state.xdim) || (y<0) || (y >= this.state.ydim)) {
      return TILES.NULLTILE;
    }
    return this.tileGrid[x][y] || TILES.NULLTILE;
  }
  render(display, camera_map_x, camera_map_y){
    let cx = 0;
    let cy = 0;
    let xstart = camera_map_x - Math.trunc(display.getOptions().width / 2);
    let ystart = camera_map_y - Math.trunc(display.getOptions().height / 2);
    let xend = xstart + display.getOptions().width; //{{display width}};
    let yend = ystart + display.getOptions().height; //{{display height}};

    for(let xi=xstart; xi < xend; xi++){
      //console.log("outer");
      for(let yi=ystart; yi < yend; yi++){
        //console.log("inner");
        this.getTile(xi,yi).render(display,cx,cy);
        cy++;
      }
      cx++;
      cy = 0;
    }
  }

  toJSON(){
    return JSON.stringify(this.state);
  }

  getTile(mapx, mapy){
    if (mapx < 0 || mapx > this.state.xdim-1 || mapy < 0 || mapy > this.state.ydim -1 ){
      return TILES.NULLTILE;
    }
    return this.tileGrid[mapx][mapy];

  }


}

let TILE_GRID_GENERATOR = {
  'basic caves': function(xdim,ydim,rngState) {
    let tg = init2DArray(xdim,ydim,TILES.NULLTILE);
    let gen = new ROT.Map.Cellular(xdim, ydim, { connected: true });
    let origRngState = ROT.RNG.getState();
    ROT.RNG.setSTate(rngState);

    gen.randomize(.5);
    gen.create();
    gen.create();
    gen.create();
    gen.create();
    gen.create();
    gen.connect(function(x,y,isWall) {
        tg[x][y] = (isWall || x==0 || y==0 || x==xdim-1 || y==ydim-1) ? TILES.WALL : TILES.FLOOR;
      });
      Rot.rng.setState(origRngState);
    return tg;
  }
}

// creates maps
export function MapMaker(mapWidth, mapHeight) {
  let m = new Map(mapWidth, mapHeight);
  DATASTORE.MAPS[m.getId()] = m;
  return m;
}
