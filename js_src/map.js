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
    this.state.entityIdToMapPos = {};
    this.state.mapPosToEntityId = {};
    this.build();
  }

  build() {
    this.tileGrid =
    TILE_GRID_GENERATOR[this.state.mapType](this.state.xdim, this.state.ydim, this.state.setupRngState);
  }
  getId(){  return this.state.id; }
  setId(newId){ this.state.id = newId;}

  getXDim(){return this.state.xdim; }
  setXDim(newId){ this.state.xdim = newId; }
  getYDim(){ return this.state.ydim; }
  setYDim(newId){ this.state.ydim = newId; }
  getMapType(){ return this.state.mapType; }
  setMapType(newId){ this.state.mapType = newId; }
  getRngState(){ return this.state.setupRngState; }
  setRngState(newId){ this.state.setupRngState = newId;}


  getTile(x,y) {
    if ((x < 0) || (x >= this.state.xdim) || (y<0) || (y >= this.state.ydim)) {
      return TILES.NULLTILE;
    }
    return this.tileGrid[x][y] || TILES.NULLTILE;
  }

  extractEntity(ent){
    delete this.state.mapPosToEntityId[this.state.entityIdToMapPos[ent.getId()]];
    delete this.state.entityIdToMapPos[ent.getId()];
    return ent;
  }

  addEntityAt(ent, mapx, mapy){
    let pos =  `${mapx},${mapy}`;
    this.state.entityIdToMapPos[ent.getId()] = pos;
    this.state.mapPosToEntityId[pos] = ent.getId();
    ent.setMapId(this.getId());
    ent.setX(mapx);
    ent.setY(mapy);
  }

  updateEntityPosition(ent,newMapX,newMapY){
    let oldPos = this.state.entityIdToMapPos[ent.getId()];
    delete this.state.mapPosToEntityId[oldPos] ;
    this.state.mapPosToEntityId[`${newMapX},${newMapY}`]= ent.getId();
    this.state.entityIdToMapPos[ent.getId()] = `${newMapX},${newMapY}`;
  }

  addEntityAtRandomPosition(ent) {
      let openPos = this.getRandomOpenPosition();
      let p = openPos.split(',');
      this.addEntityAt(ent,p[0],p[1]);
  }

  getRandomOpenPosition(){
    let x = Math.trunc(ROT.RNG.getUniform()*this.state.xdim);
    let y = Math.trunc(ROT.RNG.getUniform()*this.state.ydim);
    // check openness
    if ( this.isPositionOpen(x,y)){
      return `${x},${y}`;
    }
    return this.getRandomOpenPosition();
  }

  isPositionOpen(x,y){
    console.log(x);
    console.log(y);
    if ( this.tileGrid[x][y].isA('floor')){
      return true;
    }
    return false;
  }

  getTargetPositionInfo(x,y){
    let info = {
      entity: '',
      tile: this.getTile(x,y),
    };
    let entId = this.state.mapPosToEntityId[`${x},${y}`];
    if (entId){
      info.entity = DATASTORE.ENTITIES[entId];
      console.log(info.entity);
    }
    console.log("targetPosition");
    console.dir(info);

    return info;
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
        let pos = `${xi},${yi}`;
        if(this.state.mapPosToEntityId[pos]){
          DATASTORE.ENTITIES[this.state.mapPosToEntityId[pos]].render(display,cx,cy);
    } else{
      this.getTile(xi,yi).render(display,cx,cy);
    }
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
  //   let tg = init2DArray(xdim,ydim,TILES.NULLTILE);
  //   let gen = new ROT.Map.Cellular(xdim, ydim, { connected: true });
  //   let origRngState = ROT.RNG.getState();
  //   ROT.RNG.setSTate(rngState);
  //
  //   gen.randomize(.5);
  //   gen.create();
  //   gen.create();
  //   gen.create();
  //   gen.create();
  //   gen.create();
  //   gen.connect(function(x,y,isWall) {
  //       tg[x][y] = (isWall || x==0 || y==0 || x==xdim-1 || y==ydim-1) ? TILES.WALL : TILES.FLOOR;
  //     });
  //     Rot.rng.setState(origRngState);
  //   return tg;
  // }
  let origRngState = ROT.RNG.getState();
   ROT.RNG.setState(rngState);
   let tg = init2DArray(xdim,ydim,TILES.NULLTILE);
   let gen = new ROT.Map.Cellular(xdim, ydim, { connected: true });
   gen.randomize(.49);
   for(let i=3;i>=0;i--) {
     gen.create();
     // set the boundary to all wall each pass
     for (let x=0;x<xdim;x++) {
       for (let y=0;y<ydim;y++) {
         if (x<=1 || y<=1 || x>=xdim-2 || y>=ydim-2) {
           gen.set(x,y,1);
         }
       }
     }
   }
   gen.connect(function(x,y,isWall) {
     tg[x][y] = (isWall || x==0 || y==0 || x==xdim-1 || y==ydim-1) ? TILES.WALL : TILES.FLOOR;
   });
   ROT.RNG.setState(origRngState);
   return tg;
 }
}

// creates maps
export function MapMaker(mapData) {
  //console.log("MapWidth" + mapWidth);
  //console.log("MapH " + mapHeight);
  let m = new Map(mapData.xdim, mapData.ydim, mapData.mapType);
  if (mapData.id !== undefined) { m.setId(mapData.id); }
  if (mapData.setupRngState !== undefined) { m.setRngState(mapData.setupRngState); }
  m.build();

  DATASTORE.MAPS[m.getId()] = m;

  return m;
}
