import {Color} from './color.js';
export let Message = {
  _curMessage: '',
  _targetDisplay: '',
  init: function(targetDisplay) {
    this._targetDisplay = targetDisplay;
  },
  render: function () {
    if (! this._targetDisplay) { return; }
    this._targetDisplay.clear();
    this._targetDisplay.drawText(1,1,this._curMessage,Color.FG,Color.BG);
  },
  send: function (msg) {
    this._curMessage = msg;
    this.render();
  },
  clear: function () {
    //this._curMessage = '';
    targetDisplay.drawText(1,1,'',Color.FG,Color.BG);
  }
};
