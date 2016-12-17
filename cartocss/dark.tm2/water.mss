
@water: #575757;

#water {
  ::fill {
    polygon-fill: #000;
    polygon-opacity: 0;
    polygon-comp-op: src-out;
  }
  
  ::line {
    line-color: #d5d5d5;
    line-width: 1;
    line-join: round;
    line-comp-op: dst-over;
  }
}

#waterway {
  [type='river'],
  [type='canal'] {
    line-color: @water;
    line-width: 0;
    [zoom>=10] { line-width: 0.5; }
    [zoom>=12] { line-width: 1; }
    [zoom>=14] { line-width: 2; }
    [zoom>=16] { line-width: 3; }
  }
  [type='stream'] {
    line-color: @water;
    line-width: 0;
    [zoom>=12] { line-width: 0.5; }
    [zoom>=14] { line-width: 1; }
    [zoom>=16] { line-width: 2; }
    [zoom>=18] { line-width: 3; }
  }
}
