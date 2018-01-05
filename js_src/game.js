
import * as U from './util.js';
import ROT from 'rot-js';
import {StartupMode, PlayMode, WinMode, LoseMode} from './ui_mode.js';

export let Game = {
  display: {
   SPACING: 1.1,
   main: {
     w: 80,
     h: 24,
     o: null
   }
},

modes: {
  startup: '',
  play: '',
  win: '',
  lose: ''
},

curMode: '',

init: function() {
    this._randomSeed = 5 + Math.floor(Math.random()*100000);
    //this._randomSeed = 76250;
    console.log("using random seed "+this._randomSeed);
    ROT.RNG.setSeed(this._randomSeed);

    this.display.main.o = new ROT.Display({
      width: this.display.main.w,
      height: this.display.main.h,
      spacing: this.display.SPACING});
      this.setupModes();
      this.switchModes('startup');
      console.log("game:");
      console.dir(this);
  },

  setupModes: function() {
    this.modes.startup = new StartupMode();
    this.modes.play = new PlayMode(this);
    console.log("startupModes");
  },

  bindEvent: function(eventType) {
    window.addEventListener(eventType, (evt) => {
      this.eventHandler(eventType, evt);
    });
  },

  eventHandler: function (eventType, evt) {
   // When an event is received have the current ui handle it
    if(this.curMode !== null && this.curMode != '') {
        this.curMode.handleInput(eventType, evt);
        this.render();
    }
  },

  switchModes: function(newModeName){
    if(this.curMode){
      this.curMode.exit();
    }
    this.curMode = this.modes[newModeName];
  },

  getDisplay: function (displayId) {
   if (this.display.hasOwnProperty(displayId)) {
     return this.display[displayId].o;
   }
   return null;
 },

 render: function() {
   this.renderMain();
 },

 renderMain: function() {
   //console.log("renderMain"); //for debugging purposes only
   //if (this.curMode.hasOwnProperty('render')){
     this.curMode.render(this.display.main.o);
  // }
  // let d = this.display.main.o;
  // for (let i = 0; i < 10; i++) {
  //   d.drawText(5,i+5,"hello world");
  // }
 }
};
