
import ROT from 'rot-js';
import * as U from './util.js';
import {UIModeStart, UIModePlay, UIModeWin, UIModeLose, UIModePersistence, UIModeHelp} from './ui_mode.js';
import {Message} from './message.js' ;
import {DATASTORE, clearDataStore} from './datastore.js';
import {initTiming} from './timing.js';


console.log('ROT is:');
console.dir(ROT);

export let Game = {

  messageHandler: Message,

  _mode: {
    start: '',
    persistence: '',
    play: '',
    win: '',
    lose: '',
    help: ''
  },
  _curMode: '',

  // make all the screens
  _DISPLAY_SPACING: 1.1,
  _display: {
    main: {
      w: 80,
      h: 24,
      o: null
    },
    avatar: {
      w: 20,
      h: 24,
      o: null
    },
    message: {
      w: 100,
      h: 6,
      o: null
    }
  },

  //_STATE: {},

  //constant name of game
  _PERSIST_NAMESPACE: 'LucasGame',

  isPlaying: false,
  hasSaved: false,

  // initialize game
  init: function() {
    console.log("Game object:");
    console.dir(Game);

    //console.log("datastore object: ");
    //console.dir(DATASTORE);
    //DATASTORE.GAME = this;
    // this._randomSeed = 5 + Math.floor(Math.random()*100000);
    //this._randomSeed = 76250;
    //console.log("using random seed "+this._randomSeed);
    //ROT.RNG.setSeed(this._randomSeed);

    this.setupDisplays();
    this.setupModes();
    this.messageHandler.init(this.getDisplay('message'));
    this.switchMode('start');
  },

  setupNewGame: function(){
    //this._STATE.randomSeed = 5 + Math.floor(Math.random()*100000);
    //this._STATE._randomSeed = 76250;
    //console.log("using random seed "+this._STATE._randomSeed);
    //ROT.RNG.setSeed(this._STATE._randomSeed);
    console.log("starting new game") ;
    clearDataStore();
    DATASTORE.GAME = this;
    console.log("datastore:");
    console.dir(DATASTORE);
    this._mode.play.startNewGame();
    //this.initTiming();
  },

  // initialize all mode objects
  setupModes: function() {
    // initialize mode objects!
    this._mode.start = new UIModeStart(this);
    this._mode.persistence = new UIModePersistence(this); // need to implement in uimode
    this._mode.play = new UIModePlay(this);
    this._mode.win = new UIModeWin(this);
    this._mode.lose = new UIModeLose(this);
    this._mode.help = new UIModeHelp(this);
    //this.switchMode('start');
  },

  setupDisplays: function() {
    for (var display_key in this._display) {
      this._display[display_key].o = new ROT.Display({
        width: this._display[display_key].w,
        height: this._display[display_key].h,
        spacing: this._DISPLAY_SPACING});
    }
  },

  getDisplay: function (displayId) {
    if (this._display.hasOwnProperty(displayId)) {
      return this._display[displayId].o;
    }
    return null;
  },

  // render our screen on the browser
  render: function() {
    this.renderDisplayAvatar();
    this.renderDisplayMain();
    this.renderMessage();
  },

  renderDisplayAvatar: function() {
    let d = this._display.avatar.o;
    //d.clear();
    this._curMode.renderAvatar(d);
    // d.drawText(1,1,"Avatar");
    // let a = this._mode.play.getAvatar();
    // if (! a) { return; };
    // d.drawText(3,2,"Turns: " + a.getTime());
  },

  renderMessage: function() {
     this.messageHandler.render();
  },

  renderDisplayMain: function() {
    this._display.main.o.clear();
    if (this._curMode === null || this._curMode == '') {
      return;
    } else {
      this._curMode.render();
    }
  },

  // recognize events that occur (keyups)
  bindEvent: function(eventType) {
    window.addEventListener(eventType, (evt) => {
      this.eventHandler(eventType, evt);
    });
  },

  eventHandler: function (eventType, evt) {
    // When an event is received have the current ui handle it
    if (this._curMode !== null && this._curMode != '') {
        this._curMode.handleInput(eventType, evt);
        this.render();
    }
  },

  switchMode: function (newMode) {
    if (typeof newMode == 'string' || newMode instanceof String) {
      if (this._mode.hasOwnProperty(newMode)) {
        newMode = this._mode[newMode];
      } else {
        return;
      }
    }

    if (this._curMode !== null && this._curMode != '') {
      this._curMode.exit();
    }
    this._curMode = newMode;
    if (this._curMode !== null && this._curMode != '') {
      this._curMode.enter();
    }
    this.render();
  },

  // serializes game state
  toJSON: function (){
    return this._mode.play.toJSON();
  },

  // gets game state from serialized game state
  fromJSON: function (json){
    this._mode.play.fromJSON(json);
  }
};
