
import ROT from 'rot-js';

// unspecified mode class
class UIMode {
  constructor(gameRef) {
    console.log("created" + this.constructor.name) ;
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
  }

  render() {
    //this.display.drawText(1,1,"game start");
    this.display.drawText(1,3,"press any key to play");
  }

  handleInput(inputType,inputData) {
    if (inputData.charCode !== 0) {
      this.game.switchMode('play');
    }
  }
}

// mode play
export class UIModePlay extends UIMode {
  enter() {
    super.enter();
  }

  render() {
    this.display.drawText(1,1,"game play");
    this.display.drawText(1,3,"press any [Enter] to win");
    this.display.drawText(1,5,"press any [Escape] to lose");
  }

  handleInput(inputType,inputData) {
    if (inputType == 'keypress') {
      if (inputData.keyCode == ROT.VK_ENTER || inputData.keyCode == ROT.VK_RETURN) {
        this.game.switchMode('win');
      }
    }
    else if (inputType == 'keydown') {
      if (inputData.keyCode == ROT.VK_ESCAPE) {
        this.game.switchMode('lose');
      }
    }
  }
}


// winning mode
export class UIModeWin extends UIMode {
  render() {
    this.display.drawText(1,1,"game win");
    this.display.drawText(1,3,"you WIN!!");
  }
}

//losing mode
export class UIModeLose extends UIMode {
  render() {
    this.display.drawText(1,1,"game lose");
    this.display.drawText(1,3,"you lose.");
  }
}
