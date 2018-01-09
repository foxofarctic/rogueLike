// map class the tile grid the game is played on
import ROT from 'rot-js';
import * as U from './util.js';
import {TILES} from './tile.js';
import {init2DArray} from './util.js';


export class Map{
  constructor(xdim, ydim) {
    this.xdim = xdim || 1;
    this.ydim = ydim || 1;
  //  this.tileGrid = init2DArray( this.xdim, this.ydim, TILES.NULLTILE );
    this.tileGrid = TILE_GRID_GENERATOR['basic caves'](xdim, ydim);
  }

  render(display, camera_map_x, camera_map_y){
    let cx = 0;
    let cy = 0;
    let xstart = camera_map_x - Math.trunc(display.getOptions().width / 2);
    let ystart = camera_map_y - Math.trunc(display.getOptions().height / 2);
    let xend = xstart + display.getOptions().width; //{{display width}};
    let yend = ystart + display.getOptions().height; //{{display height}};

    for(let xi=0; xstart < xend; xi++){
      //console.log("outer");
      for(let yi=0; ystart < yend; yi++){
        //console.log("inner");
        this.getTile(xi,yi).render(display,cx,cy);
        cy++;
      }
      cx++;
      cy = 0;
    }
  }

  getTile(mapx, mapy){
    if (mapx < 0 || mapx > this.xdim-1 || mapy < 0 || mapy > this.ydim -1 ){
      return TILES.NULLTILE;
    }
    return this.tileGrid[mapx][mapy];

  }


}

let TILE_GRID_GENERATOR = {
  'basic caves': function(xdim,ydim) {
    let tg = init2DArray(xdim,ydim,TILES.NULLTILE);
    let gen = new ROT.Map.Cellular(xdim, ydim, { connected: true });
    gen.randomize(.5);
    gen.create();
    gen.create();
    gen.create();
    gen.create();
    gen.create();
    gen.connect(function(x,y,isWall) {
        tg[x][y] = (isWall || x==0 || y==0 || x==xdim-1 || y==ydim-1) ? TILES.WALL : TILES.FLOOR;
      });
    return tg;
  }
}
