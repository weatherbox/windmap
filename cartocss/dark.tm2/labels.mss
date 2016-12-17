

// Country labels //
#country_label[zoom>=3] {
  text-name: @name;
  text-face-name: @sans_bold;
  text-fill: @text;
  text-size: 12;
  text-halo-fill: @text-halo;
  text-halo-radius: 0.5;
  text-wrap-width: 50;
  [zoom>=3][scalerank=1],
  [zoom>=4][scalerank=2],
  [zoom>=5][scalerank=3],
  [zoom>=6][scalerank>3] {
    text-size: 14;
  }
  [zoom>=4][scalerank=1],
  [zoom>=5][scalerank=2],
  [zoom>=6][scalerank=3],
  [zoom>=7][scalerank>3] {
    text-size: 16;
  }
  [zoom>=6][scalerank=1],
  [zoom>=7][scalerank=2],
  [zoom>=8][scalerank>=3] {
    text-size: 20;
  }
}

#country_label_line { 
  line-color: @text;
  line-dasharray: 3,3;
  line-width: 1;
}



// ---------------------------------------------------------------------
// Cities, towns, villages, etc


#place_label[zoom>=7][localrank<=1] {
  text-name: @name;
  text-face-name: @sans;
  text-wrap-width: 80;
  text-wrap-before: true;
  text-fill: @text;
  text-halo-fill: @text-halo;
  text-halo-radius: 0.5;
  text-halo-rasterizer: fast;
  text-size: 10;
  text-line-spacing:-2;
  text-margin:25;

  // Cities
  [type='city'][zoom>=8][zoom<=15] {
  	text-face-name: @sans;
    text-size: 15;
    text-line-spacing:-7;

    [zoom>=10] { 
      text-size: 17;
      text-wrap-width: 140;
    }
    [zoom>=12] { 
      text-size: 20;
      text-wrap-width: 180;
    }
    // Hide at largest scales:
    [zoom>=16] { text-name: "''"; }
  }
  
  // Towns
  [type='town'] {
    text-halo-fill: @text-halo;
    text-halo-radius: 0.5;
    [zoom>=12] { text-size: 12; }
    [zoom>=14] { text-size: 16; }
    [zoom>=16] { text-size: 22; }
    // Hide at largest scales:
    [zoom>=18] { text-name: "''"; }
  }
  
  // Villages and suburbs
  [type='village'] {
    text-size: 12;    
    text-halo-fill: @text-halo;
    text-halo-radius: 0.5;
    [zoom>=12] { text-size: 10; }
    [zoom>=14] { text-size: 14; }
    [zoom>=16] { text-size: 18; }
  }
  [type='hamlet'],
  [type='suburb'],
  [type='neighbourhood'] {
    text-fill: @fill3;
    text-face-name:	@sans;
    text-transform: none;
    text-margin:50;
    text-halo-radius: 2;
    text-character-spacing: 0.5;
    text-size: 12;
    [zoom>=14] { text-size: 14; }
    [zoom>=15] { text-size: 16; text-character-spacing: 1; }
    [zoom>=16] { text-size: 18; text-character-spacing: 2; }
    [zoom>=18] { text-size: 24; text-character-spacing: 3; }
  }
}


