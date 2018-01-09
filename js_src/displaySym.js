import {Color} from './color.js';
class DisplaySymbol extends Tile{

  constructor(chr, fg, bg){
      this.chr = chr || ' ';
      // hex red,green,blue
      this.fg = fg || Color.FG;
      this.bg = bg || Color.BG;

  }

  render(display,console_x, console_y){
    display.draw(console_x,console_y, this.chr, this.fg, this.bg);
  }
}
