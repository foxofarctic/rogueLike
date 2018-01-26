
import ROT from 'rot-js';
import {MapMaker} from './map.js';
import {Color} from './color.js';
import {MixableSymbol} from './mixableSym.js';
import {Message} from './message.js' ;
import {DATASTORE,clearDataStore} from './datastore.js';
import {EntityFactory} from './entities.js';
import {SCHEDULER,TIME_ENGINE,initTiming} from './timing.js';
import {COMMAND,getCommandFromInput,setKeyBinding} from './command.js';


//*******************************
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
  renderAvatar(display){
    display.clear();
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


//********************************************
// starting mode
export class UIModeStart extends UIMode {
  enter() {
    super.enter();
    Message.send("Welcome to Lucas Game");
  }

  render() {
    this.display.drawText(1, 1, "game start", Color.FG, Color.BG);
    this.display.drawText(1, 3, "Poor Lucas got lost one evening on a midnight stroll,", Color.FG, Color.BG);
    this.display.drawText(1, 5, "somehow he ended up in the fearsomely ferocious forest.", Color.FG, Color.BG);
    this.display.drawText(1, 7, "He needs to find his way back home to the *.", Color.FG, Color.BG);
    this.display.drawText(1, 9, "Guide him home while collecting monster treasure...", Color.FG, Color.BG);
    this.display.drawText(1, 11, "Press any key to continue", Color.FG, Color.BG);

  }

  handleInput(inputType,inputData) {
    // super.handleInput(inputType, inputData);
    if (inputData.keyCode !== 0 && inputType == 'keyup') {
      this.game.switchMode('persistence');
    }
  }
}

//**********************************************
// persistence mode for Save, Load, New Game
export class UIModePersistence extends UIMode{
  enter(){
    super.enter();
    if (window.localStorage.getItem(this.game._PERSIST_NAMESPACE)){
      this.game.hasSaved = true;
    }
    setKeyBinding('persistence');
  }

  render(){
    this.display.drawText(1, 1, "Game Control", Color.FG, Color.BG);
    this.display.drawText(5 , 3, "N - Start new game", Color.FG, Color.BG);
    this.display.drawText(1, 7, "Press h for help", Color.FG, Color.BG);

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
    // console.log("command is "+getCommandFromInput(inputType,inputData));
    let gameCommand = getCommandFromInput(inputType,inputData);
    if (gameCommand == COMMAND.NULLCOMMAND) { return false; }

    if (gameCommand == COMMAND.NEW_GAME) {
      this.game.setupNewGame();
      Message.send("New game started");
      this.game.switchMode('play');
    } else
    if (gameCommand == COMMAND.SAVE_GAME) {
      if (this.game.isPlaying) {
        this.handleSaveGame();
      }
    } else
    if (gameCommand == COMMAND.LOAD_GAME) {
      if (this.game.hasSaved) {
        this.handleRestoreGame();
      }
    } else
    if (gameCommand == COMMAND.CANCEL) {
      if (this.game.isPlaying) {
        this.game.switchMode('play');
      }
    } else
    if (gameCommand == COMMAND.HELP) {
        this.game.switchMode('help');
    }
    return false;
  }

  handleSaveGame() {
    if (! this.localStorageAvailable()) {
      return;
    }
    //let serializedGameState = this.game.toJSON();
    window.localStorage.setItem(this.game._PERSIST_NAMESPACE,JSON.stringify(DATASTORE)) ;
    this.game.hasSaved = true;
    Message.send("Game saved");
    this.game.switchMode('play');
  }

  handleRestoreGame() {
    if (! this.localStorageAvailable()) {
      return;
    }
    let restorationString = window.localStorage.getItem(this.game._PERSIST_NAMESPACE);
    let state = JSON.parse(restorationString);
    console.log("Restore");
    console.dir(state);
    clearDataStore();
    DATASTORE.ID_SEQ = state.ID_SEQ;
    DATASTORE.GAME = state.GAME;

    this.game.fromJSON(state.GAME);
    for (let mapID in state.MAPS){
      let mapData = JSON.parse(state.MAPS[mapID]);
      console.log("mapload");
      console.dir(mapData);
      DATASTORE.MAPS[mapID] = MapMaker(mapData); //mapData.xdim, mapData.ydim, mapData.setRngState);
      DATASTORE.MAPS[mapID].build();
    }
    for (let entID in state.ENTITIES){
      DATASTORE.ENTITIES[entID] = JSON.parse(state.ENTITIES[entID]);
      let ent = EntityFactory.create(DATASTORE.ENTITIES[entID].name);
      if (DATASTORE.ENTITIES[entID].name == 'avatar'){
        this.game._mode.play._STATE.avatarId = ent.getId();
      }
      DATASTORE.MAPS[Object.keys(DATASTORE.MAPS)[0]].addEntityAt(ent, DATASTORE.ENTITIES[entID].x, DATASTORE.ENTITIES[entID].y)
      delete DATASTORE.ENTITIES[entID];
    }

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
      Message.send('Sorry, no local data storage is available, so no save/load possible');
      return false;
    }
  }
}

// **************************************
// mode play
export class UIModePlay extends UIMode {

  enter() {
    super.enter();
    this.game.isPlaying = true;
    setKeyBinding(['play','movement_numpad']);
    TIME_ENGINE.unlock();

  }

  startNewGame() {
    initTiming();
    this._STATE = {};
    let m = MapMaker({xdim:20,ydim:20});
    //m.build();
    this._STATE.newXDim = 20;
    this._STATE.newYDim = 20;
    this._STATE.level = 1;

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
    //a.setMeleeDamage(1);
    m.addEntityAtRandomPosition(a);
    this.moveCameraToAvatar();

    for(let mossCount = 0; mossCount<1; mossCount++){
      m.addEntityAtRandomPosition(EntityFactory.create('moss'));
    }
    for(let monsterCount = 0; monsterCount < 4;monsterCount++){
      m.addEntityAtRandomPosition(EntityFactory.create('snipe'));
    }
    //for(let portalCount = 0; portalCount<1; portalCount++){
    m.addEntityAtRandomPosition(EntityFactory.create('portal'));
  //  }
  }

  clearCurrentLevel() {
    let currentMap = this.getAvatar().getMap();
    let listOfEntitiesOnMap = currentMap.getListOfEntities();
    for(let i = 0; i < listOfEntitiesOnMap.length; i++){
      if(listOfEntitiesOnMap[i].chr != '@' ){
        console.log("old entities destroyed");
        listOfEntitiesOnMap[i].destroy();
      }
    }
  }

  startNewLevel(avatar, x, y, level) {
    let m = MapMaker({xdim: x,ydim: y});

    this._STATE.curMapId = m.getId();
    this._STATE.cameraMapLoc = {
      x: Math.round(m.getXDim()/2),
      y: Math.round(m.getYDim()/2)
    };
    this._STATE.cameraDisplayLoc = {
      x: Math.round(this.display.getOptions().width/2),
      y: Math.round(this.display.getOptions().height/2)
    };

    this._STATE.avatarId = avatar.getId();
    m.addEntityAtRandomPosition(avatar);
    this.moveCameraToAvatar();

    for(let mossCount = 0; mossCount< (5*level) ; mossCount++){
      m.addEntityAtRandomPosition(EntityFactory.create('moss'));
    }
    for(let monsterCount = 0; monsterCount < (10*level);monsterCount++){
      m.addEntityAtRandomPosition(EntityFactory.create('snipe'));
    }
    if (level < 20){
      m.addEntityAtRandomPosition(EntityFactory.create('portal'));
    } else {
      m.addEntityAtRandomPosition(EntityFactory.create('finish'));
    }
  }

  toJSON(){
     return JSON.stringify(this._STATE);
  }

  fromJSON(json){
    this._STATE = JSON.parse(json);
  }

  render() {
    //Message.send("entering " + this.constructor.name);
    DATASTORE.MAPS[this._STATE.curMapId].render(this.display,
    this._STATE.cameraMapLoc.x,this._STATE.cameraMapLoc.y);
    //this.avatarSym.render(this.display,this._STATE.cameraDisplayLoc.x,this._STATE.cameraDisplayLoc.y);
  }

  renderAvatar(display) {
    display.clear();
    display.drawText(0, 0, "Avatar");
    display.drawText(0, 2, "time: " + this.getAvatar().getTime());
    display.drawText(0, 3, "location: " + this.getAvatar().getX() + ", " + this.getAvatar().getY());
    display.drawText(0, 4, "Max HP: " + this.getAvatar().getMaxHp());
    display.drawText(0, 5, "Current HP: " + this.getAvatar().getHp());
    display.drawText(0, 6, "Treasure: " + this.getAvatar().getScore());
    display.drawText(0, 7, "Level: " + this._STATE.level);

  }

  handleInput(inputType,inputData) {
    // super.handleInput(inputType,inputData);
   let gameCommand = getCommandFromInput(inputType,inputData);

   if (gameCommand == COMMAND.NULLCOMMAND) { return false; }

   if (gameCommand == COMMAND.GAME_CONTROLS) {
     this.game.switchMode('persistence');
     return false;
   }
   if (gameCommand == COMMAND.HELP){
     this.game.switchMode('help');
   }
   if (gameCommand == COMMAND.MESSAGES) {
     this.game.switchMode('messages');
     return false;
   }

   let avatarMoved = false;
   if (gameCommand == COMMAND.MOVE_U) {
     avatarMoved = this.moveAvatar(0,-1);
   } else
   if (gameCommand == COMMAND.MOVE_L) {
     avatarMoved = this.moveAvatar(-1,0);
   } else
   if (gameCommand == COMMAND.MOVE_R) {
     avatarMoved = this.moveAvatar(1,0);
   } else
   if (gameCommand == COMMAND.MOVE_D) {
     avatarMoved = this.moveAvatar(0,1);
   } else
   if (gameCommand == COMMAND.REST){
     //avatarMoved = this.moveAvatar(0,0);
     this.getAvatar().raiseMixinEvent('actionDone');
     DATASTORE.ENTITIES[this._STATE.avatarId].addTime(1);
     DATASTORE.ENTITIES[this._STATE.avatarId].gainHp(1);
   }

   if (avatarMoved) {
     this.moveCameraToAvatar();
   }
   if (DATASTORE.ENTITIES[this._STATE.avatarId].getNewLevel()){
     this._STATE.newXDim = this._STATE.newXDim + 10;
     this._STATE.newYDim = this._STATE.newYDim + 10;
     this._STATE.level++;
     DATASTORE.ENTITIES[this._STATE.avatarId].setNewLevel(false);

     this.clearCurrentLevel();
     this.startNewLevel(DATASTORE.ENTITIES[this._STATE.avatarId], this._STATE.newXDim, this._STATE.newYDim, this._STATE.level );
   }
   if( DATASTORE.ENTITIES[this._STATE.avatarId].getWin() ){
     this.game.switchMode('win');
   }
   if( DATASTORE.ENTITIES[this._STATE.avatarId].getLose()){
     //SCHEDULER.lock();
     this.game.switchMode('lose');
   }
   //this.checkGameWinLose();
   return true;
}

  moveAvatar(dx,dy){
    if (DATASTORE.ENTITIES[this._STATE.avatarId].tryWalk(dx,dy)) {
      DATASTORE.ENTITIES[this._STATE.avatarId].addTime(1);
      this.moveCameraToAvatar();
      //this.render();
    }
  }

  moveCameraToAvatar(){
    this._STATE.cameraMapLoc.x = this.getAvatar().getX();
    this._STATE.cameraMapLoc.y = this.getAvatar().getY();
  }

  getAvatar(){
    return DATASTORE.ENTITIES[this._STATE.avatarId];
  }
}

//*****************************************
export class UIModeHelp extends UIMode{

  render() {
    this.display.drawText(1, 1, "Help Screen", Color.FG, Color.BG);
    this.display.drawText(1, 3, "press h to return to play", Color.FG, Color.BG);
    this.display.drawText(1, 5, "w - move up", Color.FG, Color.BG);
    this.display.drawText(1, 6, "a - move left", Color.FG, Color.BG);
    this.display.drawText(1, 7, "s - move down", Color.FG, Color.BG);
    this.display.drawText(1, 8, "d - move right", Color.FG, Color.BG);
    this.display.drawText(1, 9, "r - rest and gain hp", Color.FG, Color.BG);
    this.display.drawText(1, 10, "p - pause/ enter persistence mode", Color.FG, Color.BG);
    this.display.drawText(1, 11, "h - help screen", Color.FG, Color.BG);
    this.display.drawText(1, 13, "0 - portals to different realms", Color.FG, Color.BG);
    this.display.drawText(1, 14, "& - dangerous snipes", Color.FG, Color.BG);
    this.display.drawText(1, 15, "* - home", Color.FG, Color.BG);
    this.display.drawText(1, 16, "# - Moss- destroy for health and points", Color.FG, Color.BG);

  }

  handleInput(inputType,inputData) {
    // super.handleInput(inputType, inputData);
    if (getCommandFromInput(inputType,inputData) == COMMAND.HELP) {
      this.game.switchMode('persistence');
    }
  }

}

//********************************************
export class UIModeMessages extends UIMode {
  render() {
    Message.render(this.display);
  }

  handleInput(inputType,inputData) {
    if (inputType == 'keyup') {
      if (inputData.key == 'Escape') {
        if (this.game.isPlaying) {
          this.game.switchMode('play');
        }
      }
      return false;
    }
  }
}

//********************************************
// winning mode
export class UIModeWin extends UIMode {
  render() {
    this.display.drawText(1,1,"game win", Color.FG,Color.BG);
    this.display.drawText(1,3,"you WIN!!", Color.FG,Color.BG);
    Message.send("entering " + this.constructor.name);
  }

  renderAvatar(){}
}


//**********************************************
//losing mode
export class UIModeLose extends UIMode {
  render() {
    this.display.drawText(1,1,"game lose",Color.FG,Color.BG);
    this.display.drawText(1,3,"you lose.",Color.FG,Color.BG);
    Message.send("entering " + this.constructor.name);
  }
  renderAvatar(){}
}
