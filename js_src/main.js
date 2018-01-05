import 'babel-polyfill';
import ROT from 'rot-js';
import {Game} from './game.js';
// initializes game element- hooks up browser with game element
window.onload = function() {
  console.log("starting WSRL - window loaded");
  // Check if rot.js can work on this browser
  if (!ROT.isSupported()) {
    alert("The rot.js library isn't supported by your browser.");
    return;
  }

  Game.init();

  // Add the containers to our HTML page
  document.getElementById('ws-main-display').appendChild(Game.getDisplay('main').getContainer());

  //add later
  // game.bindEvent('keypress');
  // game.bindEvent('keyup');
  // game.bindEvent('keydown');
  Game.render();

};
