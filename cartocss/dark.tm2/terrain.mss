#hillshade {
  opacity:0.25;
  polygon-fill: @hill;
  polygon-comp-op: multiply;
  polygon-opacity: 0.5;
  
  ::0[zoom<=13],
  ::1[zoom=14],
  ::2[zoom>=15][zoom<=16],
  ::3[zoom>=17][zoom<=18],
  ::4[zoom>=19] {
    comp-op: hard-light;
    polygon-clip: false;
    image-filters-inflate: true;
    [class='shadow'] {
      polygon-fill: #000;
      polygon-opacity: 0.1;
      [zoom>=15][zoom<=16] { polygon-opacity: 0.06; }
      [zoom>=17][zoom<=18] { polygon-opacity: 0.06; }
      [zoom>=18] { polygon-opacity: 0.03; }
    }
    [class='highlight'] {
      polygon-fill: #fff;
      polygon-opacity: 0.02;
      [zoom>=15][zoom<=16] { polygon-opacity: 0.06; }
      [zoom>=17][zoom<=18] { polygon-opacity: 0.06; }
      [zoom>=18] { polygon-opacity: 0.06; }
    }
  }
  ::1 { image-filters: agg-stack-blur(2,2); }
  ::2 { image-filters: agg-stack-blur(4,4); }
  ::3 { image-filters: agg-stack-blur(20,20); }
  ::4 { image-filters: agg-stack-blur(20,20); }
}