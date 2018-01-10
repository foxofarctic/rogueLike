
import ROT from 'rot-js';
import {MapMaker} from './map.js';
import {DisplaySymbol} from './displaySym.js';

// unspecified mode class
class UIMode {
  constructor(gameRef) {
    console.log("created" + this.constructor.name) ;
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
    this.display.drawText(1,1,"game start");
    this.display.drawText(1,3,"press any key to play");
  }

  handleInput(inputType,inputData) {
    super.handleInput(inputType, inputData);
    if (inputData.keyCode !== 0) {
      this.game.switchMode('persistence');
    }
  }
}

export class UIModePersistence extends UIMode{
  enter(){
    super.enter();
  }

  render(){
    this.display.drawText(1,1,"Game Control");
    this.display.drawText(5,3,"N - Start new game");
    if (this.game.isPlaying) {
      this.display.drawText(5,4,"S - Save your current game");
      this.display.drawText(1,8,"[Escape] - cancel/return to play");
    }
    if (this.game.hasSaved){
      this.display.drawText(5,4,"L - load saved game");
    }
  }

  handleInput(inputType,inputData) {
    super.handleInput(inputType,inputData);
    if (inputType == 'keyup') {
      if (inputData.key == 'n' || inputData.key == 'N') {
        //this.game.setupNewGame();
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
    }
  }

  handleSaveGame() {
    if (! this.localStorageAvailable()) {
      return;
    }
    let serializedGameState = this.game.toJSON();
    window.localStorage.setItem(this.game._PERSISTANCE_NAMESPACE,serializedGameState);
    this.game.hasSaved = true;
    this.game.messageHandler.send("Game saved");
    this.game.switchMode('play');
  }

  handleRestoreGame() {
    if (! this.localStorageAvailable()) {
      return;
    }
    let serializedGameState = window.localStorage.getItem(this.game._PERSISTANCE_NAMESPACE);
    this.game.fromJSON(serializedGameState);
    this.game.messageHandler.send("Game loaded");
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
      this.game.messageHandler.send('Sorry, no local data storage is available for this browser so game save/load is not possible');
      return false;
    }
  }
}

// mode play
export class UIModePlay extends UIMode {
  enter() {
    if (! this.map){
      //this.map = new Map(20,20);
      this.map = MapMaker(20,20);

    }
    this.camerax = 5;
    this.cameray = 8;
    this.cameraSymbol = new DisplaySymbol('@','#eb4');
    this.game.messageHandler.clear();
    this.game.isPlaying = true;
  }

  render() {
    // this.display.drawText(1,1,"game play");
    // this.display.drawText(1,3,"press any [Enter] to win");
    // this.display.drawText(1,5,"press any [Escape] to lose");
    this.game.messageHandler.send("entering " + this.constructor.name);
    this.map.render(this.display,this.camerax,this.cameray);
    this.cameraSymbol.render(this.display, this.display.getOptions().width/2, this.display.getOptions().height/2);
  }

  handleInput(inputType,inputData) {
    // super.handleInput(inputType,inputData);
    if (inputType == 'keyup') {
      this.game.messageHandler.send(`you pressed the ${inputData.key} key`);
      if (inputData.key == 'w') {
        this.game.switchMode('win');
      }
      else if (inputData.key == 'l') {
        this.game.switchMode('lose');
      }
      else if (inputData.key == '=') {
        this.game.switchMode('persistence');
      }

      // navigation (keeping in mind that top left is 0,0, so positive y moves you down)
      else if (inputData.key == '1') {
        this.moveCamera(-1,1);
      }
      else if (inputData.key == '2') {
        this.moveCamera(0,1);
      }
      else if (inputData.key == '3') {
        this.moveCamera(1,1);
      }
      else if (inputData.key == '4') {
        this.moveCamera(-1,0);
      }
      else if (inputData.key == '5') {
        this.moveCamera(0,0);
      }
      else if (inputData.key == '6') {
        this.moveCamera(1,0);
      }
      else if (inputData.key == '7') {
        this.moveCamera(-1,-1);
      }
      else if (inputData.key == '8') {
        this.moveCamera(0,-1);
      }
      else if (inputData.key == '9') {
        this.moveCamera(1,-1);
      }
    }
  }

  moveCamera(dx,dy){
    let newX = this._STATE.cameraMapLoc.x + x;
    let newY = this._STATE.cameraMapLoc.y + y;
    if (newX < 0 || newX > this._STATE.curMap.getXDim() - 1) { return; }
    if (newY < 0 || newY > this._STATE.curMap.getYDim() - 1) { return; }
   this._STATE.cameraMapLoc.x = newX;
   this._STATE.cameraMapLoc.y = newY;
   this.render();
  }
}

// winning mode
export class UIModeWin extends UIMode {
  render() {
    this.display.drawText(1,1,"game win");
    this.display.drawText(1,3,"you WIN!!");
    this.game.messageHandler.send("entering " + this.constructor.name);
  }
}

//losing mode
export class UIModeLose extends UIMode {
  render() {
    this.display.drawText(1,1,"game lose");
    this.display.drawText(1,3,"you lose.");
    this.game.messageHandler.send("entering " + this.constructor.name);
  }
}
