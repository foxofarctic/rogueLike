import {Color} from './color.js';
export let Message = {
  _curMessage: '',
  _curMessage2: '',
  _curMessage3: '',
  _targetDisplay: '',
  init: function(targetDisplay) {
    this._targetDisplay = targetDisplay;
  },
  render: function () {
    if (! this._targetDisplay) { return; }
    this._targetDisplay.clear();
    this._targetDisplay.drawText(1,1,this._curMessage,Color.FG,Color.BG);
    this._targetDisplay.drawText(1,2,this._curMessage2,Color.FG,Color.BG);
    this._targetDisplay.drawText(1,3,this._curMessage3,Color.FG,Color.BG);

  },
  send: function (msg) {
    console.log("in Message.send");
    console.log("sending: "+msg);
    //if(this._curMessage){
    this._curMessage3 = this._curMessage2;

    this._curMessage2 = this._curMessage;
    //} else{
    //  this._curMessage2 = '';
  //  }
    this._curMessage = msg;
    this.render();
  },
  clear: function () {
    //this._curMessage = '';
    this._targetDisplay.drawText(1,1,'',Color.FG,Color.BG);
    this._targetDisplay.drawText(1,2,'',Color.FG,Color.BG);
  }
};
