
import ROT from 'rot-js';
import {MapMaker} from './map.js';
import {Color} from './color.js';
import {DisplaySymbol} from './displaySym.js';
import {DATASTORE,clearDataStore} from './datastore.js';
import {EntityFactory} from './entities.js';

// unspecified mode class
class UIMode {
  constructor(gameRef) {
    this.game = gameRef;
    this.display = this.game.getDisplay("main");
  }

  enter() {
     console.log(`UIMode enter - ${this.constructor.name}`);
  }
  exit() {
    console.log(`UIMode exit - ${this.constructor.name}`);
  }
  render() { console.log(`UIMode render - ${this.constructor.name}`);
  }
  handleInput(inputType,inputData) {
    console.log(`UIMode handleInput - ${this.constructor.name}`);
    UIMode.dumpInput(inputType,inputData);
  }

  static dumpInput(inputType,inputData) {
    console.log(`inputType: ${inputType}`);
    console.log('inputData:');
    console.dir(inputData);
  }
}

// starting mode
export class UIModeStart extends UIMode {
  enter() {
    super.enter();
    this.game.messageHandler.send("Welcome to Lucas Game");
  }

  render() {
    this.display.drawText(1, 1, "game start", Color.FG, Color.BG);
    this.display.drawText(1, 3, "press any key to play", Color.FG, Color.BG);
  }

  handleInput(inputType,inputData) {
    // super.handleInput(inputType, inputData);
    if (inputData.keyCode !== 0 && inputType == 'keyup') {
      this.game.switchMode('persistence');
    }
  }
}

// persistence mode for Save, Load, New Game
export class UIModePersistence extends UIMode{
  enter(){
    super.enter();
    if (window.localStorage.getItem(this.game._PERSIST_NAMESPACE)){
      this.game.hasSaved = true;
    }
  }

  render(){
    this.display.drawText(1, 1, "Game Control", Color.FG, Color.BG);
    this.display.drawText(5 , 3, "N - Start new game", Color.FG, Color.BG);
    if (this.game.isPlaying) {
      this.display.drawText(5, 4, "S - Save your current game", Color.FG, Color.BG);
      this.display.drawText(1, 8, "[Escape] - cancel/return to play", Color.FG, Color.BG);
    }
    if (this.game.hasSaved){
      this.display.drawText(5, 5, "L - load saved game", Color.FG, Color.BG);
    }
  }

  handleInput(inputType,inputData) {
    // super.handleInput(inputType,inputData);
    if (inputType == 'keyup') {
      if (inputData.key == 'n' || inputData.key == 'N') {
        this.game.setupNewGame();
        this.game.messageHandler.send("New game started");
        this.game.switchMode('play');
      }
      else if (inputData.key == 's' || inputData.key == 'S') {
        if (this.game.isPlaying) {
          this.handleSaveGame();
        }
      }
      else if (inputData.key == 'l' || inputData.key == 'L') {
        if (this.game.hasSaved) {
          this.handleRestoreGame();
        }
      }
      else if (inputData.key == 'Escape') {
        if (this.game.isPlaying) {
          this.game.switchMode('play');
        }
      }
      else if (inputData.key == 'h' || inputData.key == 'H'){
        this.game.switchMode('help');
      }
    }
  }

  handleSaveGame() {
    if (! this.localStorageAvailable()) {
      return;
    }
    //let serializedGameState = this.game.toJSON();
    window.localStorage.setItem(this.game._PERSIST_NAMESPACE,JSON.stringify(DATASTORE)) ;
    this.game.hasSaved = true;
    this.game.messageHandler.send("Game saved");
    this.game.switchMode('play');
  }

  handleRestoreGame() {
    if (! this.localStorageAvailable()) {
      return;
    }
    let serializedGameState = window.localStorage.getItem(this.game._PERSIST_NAMESPACE);
    //this.game.fromJSON(serializedGameState);
    // this.game.messageHandler.send("Game loaded");
    // this.game.switchMode('play');
    let savedState = JSON.parse(serializedGameState);
    clearDataStore();

    //DATASTORE = JSON.parse(serializedGameState);
    //DATASTORE.ID_SEQ = state.ID_SEQ;
    DATASTORE.GAME = this.game;
    this.game.fromJSON(savedState.GAME);

    // gets Id and deserializes it to retrieve map object and the makes map
    for (let savedMapId in savedState.MAPS) {
      MapMaker(JSON.parse(savedState.MAPS[savedMapId]));
    }

    this.game.messageHandler.send("Game Loaded");
    this.game.switchMode('play');
  }

  localStorageAvailable() {
    // NOTE: see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
    try {
      var x = '__storage_test__';
      window.localStorage.setItem( x, x);
      window.localStorage.removeItem(x);
      return true;
    }
    catch(e) {
      this.game.messageHandler.send('Sorry, no local data storage is available, so no save/load possible');
      return false;
    }
  }
}


// mode play
export class UIModePlay extends UIMode {
  // constructor(gameRef) {
  //   super.enter();
  //   this.state ={
  //     mapId: '',
  //     cameramapx: '',
  //     cameramapy: ''
  //   };
  // }

  enter() {
    super.enter();
    // if (! this.map){
    //   //this.map = new Map(20,20);
    //   let m = MapMaker(20,20);
    //   this.state.mapId = m.getId
    //   m.build();
    // }
    // this.camerax = 5;
    // this.cameray = 8;
    // this.cameraSymbol = new DisplaySymbol('@','#eb4');
    // this.game.messageHandler.clear();
    this.game.isPlaying = true;
    //this.avatarSym = new DisplaySymbol('@','#ee1');
  }

  startNewGame() {
    this._STATE = {};
    let m = MapMaker(60,20);
    //m.build();
    this._STATE.curMapId = m.getId();
    this._STATE.cameraMapLoc = {
      x: Math.round(m.getXDim()/2),
      y: Math.round(m.getYDim()/2)
    };
    this._STATE.cameraDisplayLoc = {
      x: Math.round(this.display.getOptions().width/2),
      y: Math.round(this.display.getOptions().height/2)
    };

    //DisplaySymbol({'name': 'avatar', 'chr':'@', 'fg' '#eb4'});
    let a = EntityFactory.create('avatar');
    this._STATE.avatarId = a.getId();
    m.addEntityAtRandomPosition(a);
  }

  toJSON(){
     return JSON.stringify(this._STATE);
  }

  fromJSON(json){
    this._STATE = JSON.parse(json);
  }

  // restoreFromState(stateData){
  //   console.log('res');
  //   console.dir(stateData);
  //   this.state = stateData;
  // }

  render() {
    // this.display.drawText(1,1,"game play");
    // this.display.drawText(1,3,"press any [Enter] to win");
    // this.display.drawText(1,5,"press any [Escape] to lose");
    this.game.messageHandler.send("entering " + this.constructor.name);
    //console.dir(DATASTORE.MAPS[this._STATE.curMapId]);
    DATASTORE.MAPS[this._STATE.curMapId].render(this.display,
    this._STATE.cameraMapLoc.x,this._STATE.cameraMapLoc.y);
    //this.avatarSym.render(this.display,this._STATE.cameraDisplayLoc.x,this._STATE.cameraDisplayLoc.y);
  }

  handleInput(inputType,inputData) {
    // super.handleInput(inputType,inputData);
    if (inputType == 'keyup') {
      this.game.messageHandler.send(`you pressed the ${inputData.key} key`);
      if (inputData.key == 'x') {
        this.game.switchMode('win');
      }
      else if (inputData.key == 'l') {
        this.game.switchMode('lose');
      }
      else if (inputData.key == 'p') {
        this.game.switchMode('persistence');
      }
      else if (inputData.key == 'h' || inputData.key == 'H'){
        this.game.switchMode('help');
      }

      // navigation (keeping in mind that top left is 0,0, so positive y moves you down)

      else if (inputData.key == 's') {
        this.moveAvatar(0,1);
      }
      // else if (inputData.key == '3') {
      //   this.moveAvatar(1,1);
      // }
      else if (inputData.key == 'a') {
        this.moveAvatar(-1,0);
      }
      // else if (inputData.key == '5') {
      //   this.moveAvatar(0,0);
      // }
      else if (inputData.key == 'd') {
        this.moveAvatar(1,0);
      }
      // else if (inputData.key == '7') {
      //   this.moveAvatar(-1,-1);
      // }
      else if (inputData.key == 'w') {
        this.moveAvatar(0,-1);
      }
      // else if (inputData.key == '9') {
      //   this.moveAvatar(1,-1);
      // }
    }
  }

  moveAvatar(dx,dy){
  //   let newX = this._STATE.cameraMapLoc.x + dx;
  //   let newY = this._STATE.cameraMapLoc.y + dy;
  //   if (newX < 0 || newX > DATASTORE.MAPS[this._STATE.curMapId].getXDim() - 1) { return; }
  //   if (newY < 0 || newY > DATASTORE.MAPS[this._STATE.curMapId].getYDim() - 1) { return; }
  //  this._STATE.cameraMapLoc.x = newX;
  //  this._STATE.cameraMapLoc.y = newY;
  //  this.render();
    this.getAvatar().moveBy(dx,dy);
    this.moveCameraToAvatar();
  }

  moveCameraToAvatar(){
    this._STATE.cameraMapLoc.x = this.getAvatar().getX();
    this._STATE.cameraMapLoc.y = this.getAvatar().getY();
  }

  getAvatar(){
    return DATASTORE.ENTITIES[this._STATE.avatarId];
  }
}

export class UIModeHelp extends UIMode{
  render() {
    this.display.drawText(1, 1, "Help Screen", Color.FG, Color.BG);
    this.display.drawText(1, 3, "press h to return to play", Color.FG, Color.BG);
    this.display.drawText(1, 5, "w - move up", Color.FG, Color.BG);
    this.display.drawText(1, 6, "a - move left", Color.FG, Color.BG);
    this.display.drawText(1, 7, "s - move down", Color.FG, Color.BG);
    this.display.drawText(1, 8, "d - move right", Color.FG, Color.BG);
    this.display.drawText(1, 9, "p - pause/ enter persistence mode", Color.FG, Color.BG);
    this.display.drawText(1, 10, "h - help screen", Color.FG, Color.BG);

  }

  handleInput(inputType,inputData) {
    // super.handleInput(inputType, inputData);
    if (inputData.keyCode == 'h' || 'H') {
      this.game.switchMode('play');
    }
  }

}

// winning mode
export class UIModeWin extends UIMode {
  render() {
    this.display.drawText(1,1,"game win", Color.FG,Color.BG);
    this.display.drawText(1,3,"you WIN!!", Color.FG,Color.BG);
    this.game.messageHandler.send("entering " + this.constructor.name);
  }
}

//losing mode
export class UIModeLose extends UIMode {
  render() {
    this.display.drawText(1,1,"game lose",Color.FG,Color.BG);
    this.display.drawText(1,3,"you lose.",Color.FG,Color.BG);
    this.game.messageHandler.send("entering " + this.constructor.name);
  }
}
