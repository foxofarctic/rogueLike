
class UIMode {
  constructor(){
    console.log("created " + this.constructor.name);
  }

  enter(){
    console.log("entering " + this.constructor.name);
  }
  exit(){
    console.log("exiting " + this.constructor.name);
  }
  //given an action from user, change the game state
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

// notes:
// can't have properties in javascript class
// instance of class uses "this" operator

//inheritance
export class StartupMode extends UIMode{
  constructor(){
    // accesses classes parents
    super();
  }

  render(display){
    console.log("rendering " + this.constructor.name);
    display.drawText(2,2,"rendering" + this.constructor.name);
    display.drawText(2,4,".____                                 ");
    display.drawText(2,5,"|    |    __ __   ____ _____    ______");
    display.drawText(2,6,"|    |   |  |  \\_/ ___\\__  \\  /  ___/");
    display.drawText(2,7,"|    |___|  |  /\\  \\___ / __ \\_\\___ \\ ");
    display.drawText(2,8,"|_______ \\____/  \\___  >____  /____  >");
    display.drawText(2,9,"        \\/           \\/     \\/     \\/ ");
  }


  handleInput(inputType,inputData) {
    if (inputData.charCode !== 0) { // ignore the various modding keys - control, shift, etc.
      this.game.switchMode('play');
    }
  }
}

export class PlayMode extends UIMode {
  enter() {
    super.enter();
  }

  render() {
    this.display.drawText(1,1,"game play",UIColor.FG,UIColor.BG);
    this.display.drawText(1,3,"press any [Enter] to win",UIColor.FG,UIColor.BG);
    this.display.drawText(1,5,"press any [Escape] to lose",UIColor.FG,UIColor.BG);
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

// this code seems to break it
// export class WinMode extends UIMode {
//   render() {
//     this.display.drawText(1,1,"game win",UIColor.FG,UIColor.BG);
//     this.display.drawText(1,3,"you WIN!!!",UIColor.FG,UIColor.BG);
//   }
// }
//
// export class LoseMode extends UIMode(){
//   render() {
//     this.display.drawText(1,1,"game lose",UIColor.FG,UIColor.BG);
//     this.display.drawText(1,3,"you lose :(",UIColor.FG,UIColor.BG);
//   }
// }
