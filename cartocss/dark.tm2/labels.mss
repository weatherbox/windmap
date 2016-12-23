// ---------------------------------------------------------------------
// Cities, towns, villages, etc

#place_label[zoom>=11][localrank<=1] {
  text-name: @name;
  text-face-name: @sans;
  text-wrap-width: 80;
  text-wrap-before: true;
  text-fill: @text;
  text-halo-fill: @fill1;
  //text-halo-radius: 2;
  text-halo-rasterizer: fast;
  text-size: 0;
  text-line-spacing:-2;
  text-margin:25;
  
  [zoom=11] { text-margin:300; }
  [zoom=12] { text-margin:100; }

  // Cities
  [type='city'][zoom>=8][zoom<=15] {
  	text-face-name: @sans;
    text-size: 14;
    text-line-spacing:-7;

    [zoom>=10] {
      text-size: 16;
      text-wrap-width: 140;
    }
    [zoom>=12] { 
      text-size: 18;
      text-wrap-width: 180;
    }
    // Hide at largest scales:
    [zoom>=16] { text-name: "''"; }
  }
  
  // Towns
  [type='town'] {
    text-size: 12;    
    text-halo-fill: @fill1;
    text-halo-radius: 1.9;
    [zoom>=13] { text-size: 12; }
    [zoom>=14] { text-size: 16; }
    [zoom>=16] { text-size: 22; }
    // Hide at largest scales:
    [zoom>=18] { text-name: "''"; }
  }
  
  // Villages and suburbs
  [type='village'] {
    text-size: 12;    
    text-halo-fill: @fill1;
    text-halo-radius: 1.9;
    [zoom>=13] { text-size: 12; }
    [zoom>=14] { text-size: 14; }
    [zoom>=16] { text-size: 18; }
  }

}