/*!
  
  jquery.nDragDrop.js
  
  Version: 0.1.0
  Author: Nunifuchisaka(nunifuchisaka@gmail.com)
  Website: http://nunifuchisaka.com/w/n-drag-drop/demo
  Repository: https://github.com/Nunifuchisaka/nDragDrop
  
*/
;(function($, window, document, undefined){
'use strict';

window.nDragDrop = window.nDragDrop || {};
// window.nSelectable = window.nSelectable || {};



/*
## functions
*/

//要素が被さっているか否かを取得
function getOverlap($a, $b){
  var a_rect = $a.get(0).getBoundingClientRect(),
      b_rect = $b.get(0).getBoundingClientRect();
  return !(a_rect.right < b_rect.left || 
           a_rect.left > b_rect.right || 
           a_rect.bottom < b_rect.top || 
           a_rect.top > b_rect.bottom);
}

function diffNumber(a, b){
  var v = a - b;
  if( 0 > v ) v *= -1;
  return v;
}


/*
## 共通で使う変数とか
*/

var ndd = {
  drag: {
    helper: null
  },
  $clones: null,
  $current: {
    drag: null,
    drop: null,
    select: null
  },
  $last: {
    select: null
  }
};

var Common = function(){
  console.count("Common");
  ndd.$window = $(window);
  ndd.$document = $(document);
  ndd.$body = $("body");
  //ndd.drag.helper = $('#nDragDrop_clones');
  ndd.drag.helper = $('<div id="ndd_drag_helper"></div>');
  ndd.$body.append(ndd.drag.helper);
  /*
  if( 0 == this.$clones.length ){
    $("body").append(this.$clones);
  }
  */
}
