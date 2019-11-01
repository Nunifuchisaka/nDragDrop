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



/*
## 共通で使う変数とか
*/

var ndd = {
  $current: {
    drag: null,
    drop: null
  }
};

var Common = function(){
  console.count("Common");
  ndd.$body = $("body");
  //ndd.$clones = $('#nDragDrop_clones');
  ndd.$clones = $('<div id="ndd_clones"></div>');
  ndd.$body.append(ndd.$clones);
  /*
  if( 0 == this.$clones.length ){
    $("body").append(this.$clones);
  }
  */
}



/*
## Draggable
*/

nDragDrop.draggable = function(opts){
  _.bindAll(this, "init", "mousedown", "mousemove", "mouseup");
  this.init(opts);
}


nDragDrop.draggable.prototype.init = function(opts){
  this.opts = $.extend({
    
  }, opts);
  console.group("nDragDrop.draggable init");
  console.log(this.opts);
  console.groupEnd();
  var self = this;
  this.status = {
    drag: false
  };
  this.vars = {
    graspPosDiffX: 0,
    graspPosDiffY: 0
  };
  
  ndd.common = ndd.common || new Common();
  
  //this.$body = $("body");
  this.$el = $(this.opts.el);
  this.$el
    //.attr("draggable", "false");
    .addClass("ndd_drag");
  //this.$current;
  this.$clone;
  ndd.$body.on("mousedown.ndd_draggable", this.opts.el, this.mousedown);
  //console.log("mousedown", this.opts.el);
  ndd.$body.on("mouseup.ndd_draggable", this.mouseup);
}

nDragDrop.draggable.prototype.mousedown = function(event){
  console.group("draggable mousedown");
  //ndd.$current.drag = $(event.currentTarget);
  ndd.$current.drag = $(event.currentTarget).parent().find(this.opts.el);
  //console.log("ndd.$current.drag", ndd.$current.drag);
  var elOffset = ndd.$current.drag.offset();
  console.log("elOffset", elOffset);
  ndd.$clones
    .show()
    .css({
      top: elOffset.top,
      left: elOffset.left
    });
    //.append( ndd.$current.drag.clone() );
  
  console.group("set position");
  //var _drag = ndd.$current.drag.clone();
  ndd.$current.drag.each(function(i,el){
    var $el = $(el),
        offset = $el.offset();
    var _$el =  $el.clone().css({
      top: offset.top - elOffset.top,
      left: offset.left - elOffset.left
    });
    ndd.$clones.append(_$el);
  });
  console.groupEnd();
  
  ndd.$current.drag.css("visibility", "hidden");
  
  //掴んだ位置の差分
  this.vars.graspPosDiffX = elOffset.left - event.pageX;
  this.vars.graspPosDiffY = elOffset.top - event.pageY;
  
  console.log("X : " + this.vars.graspPosDiffX, "Y : " + this.vars.graspPosDiffY);
  //console.log("X : " + event.pageX, "Y : " + event.pageY);
  
  ndd.$body.on("mousemove.ndd_draggable", this.mousemove);
  console.groupEnd();
}

nDragDrop.draggable.prototype.mousemove = function(event){
  //console.group("mousemove");
  ndd.$clones.css({
    top: event.pageY + this.vars.graspPosDiffY,
    left: event.pageX + this.vars.graspPosDiffX
  });
  //console.groupEnd();
}

nDragDrop.draggable.prototype.mouseup = function(event){
  if( null == ndd.$current.drag ) return;
  console.group("mouseup");
  ndd.$body.off("mousemove.ndd_draggable");
  ndd.$clones.hide().empty();
  ndd.$current.drag.css("visibility", "visible");
  ndd.$current.drag = null;
  console.groupEnd();
}



/*
## Droppable
*/

nDragDrop.droppable = function(opts){
  _.bindAll(this, "init", "mouseenter", "mouseleave", "mouseup");
  this.init(opts);
}

nDragDrop.droppable.prototype.init = function(opts){
  this.opts = $.extend({
    
  }, opts);
  console.group("droppable init");
  console.log(this.opts);
  
  ndd.common = ndd.common || new Common();
  
  this.$el = $(this.opts.el);
  //this.$current;
  this.$el
    .addClass("ndd_drop")
    .on({
      mouseenter: this.mouseenter,
      mouseleave: this.mouseleave,
      mouseup: this.mouseup
    });
  
  console.groupEnd();
}

nDragDrop.droppable.prototype.mouseenter = function(event){
  if( null == ndd.$current.drag ) return;
  console.log("ndd.$current.drag", ndd.$current.drag);
  //
  
  ndd.$current.drop = $(event.currentTarget);
  
  console.log("ndd.$current.drop", ndd.$current.drop);
  //console.log( "closest", ndd.$current.drag.closest(ndd.$current.drop).length );
  
  //
  if( 1 == ndd.$current.drag.closest(ndd.$current.drop).length ) return;
  
  ndd.$current.drop.addClass("ndd_drop_active");
}

nDragDrop.droppable.prototype.mouseleave = function(event){
  //if( null == ndd.$current.drag ) return;
  if( null == ndd.$current.drop ) return;
  console.group("drop mouseleave");
  ndd.$current.drop.removeClass("ndd_drop_active");
  ndd.$current.drop = null;
  console.groupEnd();
}

nDragDrop.droppable.prototype.mouseup = function(event){
  if( null == ndd.$current.drop ) return;
  this.mouseleave(event);
  console.group("drop mouseup");
  console.log("ndd.$current.drag", ndd.$current.drag);
  console.groupEnd();
}



/*
## Selectable
*/

window.nSelectable = function(opts){
  _.bindAll(this, "init", "mousedown", "mousemove", "mouseup");
  this.init(opts);
}

nSelectable.prototype.init = function(opts){
  this.opts = $.extend({
    selectee: "> *",
    excluse: null
  }, opts);
  
  ndd.common = ndd.common || new Common();
  
  console.group("nSelectable init");
  
  this.vars = {
    startPosX: 0,
    startPosY: 0
  };
  
  this.$selectee;
  this.$selected;
  this.$el = $(this.opts.el);
  ndd.$current.select = null;
  
  this.$helper = $('<div id="ndd_selectable_helper"><div></div></div>');
  
  ndd.$body.on("mousedown.ndd_selectable", this.opts.el, this.mousedown);
  ndd.$body.on("mousemove.ndd_selectable", this.mousemove);
  ndd.$body.on("mouseup.ndd_selectable", this.mouseup);
  
  if( this.opts.excluse ){
    ndd.$body.on("mousedown", this.opts.excluse, this.excluse);
  }
  console.groupEnd();
}

nSelectable.prototype.excluse = function(event){
  console.count("excluse");
  event.preventDefault();
  event.stopPropagation();
}

nSelectable.prototype.mousedown = function(event){
  console.count("selectable mousedown");
  ndd.$current.select = $(event.currentTarget);
  console.log("ndd.$current.select", ndd.$current.select);
  this.vars.startPosX = event.pageX;
  this.vars.startPosY = event.pageY;
  ndd.$body.append(this.$helper);
  this.$helper.css({
    top: event.pageY,
    left: event.pageX,
    width: 0,
    height: 0
  });
  this.$selectee = ndd.$current.select.find(this.opts.selectee);
  console.log("this.$selectee", this.$selectee);
}

nSelectable.prototype.mousemove = function(event){
  if( null == ndd.$current.select ) return;
  //console.count("selectable mousemove");
  var self = this;
  //ここ丸コピ
  var tmp,
      x1 = this.vars.startPosX,
      y1 = this.vars.startPosY,
      x2 = event.pageX,
      y2 = event.pageY;
  if ( x1 > x2 ) { tmp = x2; x2 = x1; x1 = tmp; }
  if ( y1 > y2 ) { tmp = y2; y2 = y1; y1 = tmp; }
  this.$helper.css( { left: x1, top: y1, width: x2 - x1, height: y2 - y1 } );
  /*
  this.$helper.css({
    width: event.pageY - this.vars.startPosY,
    height: event.pageX - this.vars.startPosX
  });
  */
  this.$selectee.each(function(i,el){
    //console.log(i, el);
    var $me = $(el);
    //console.log( $me, self.$helper );
    var overlap = getOverlap( $me, self.$helper );
    //console.log("overlap", overlap);
    var _do = (overlap)?"addClass":"removeClass";
    $me[_do]("ndd_selected");
  });
}

nSelectable.prototype.mouseup = function(event){
  console.count("selectable mouseup");
  ndd.$current.select = null;
  this.$helper.remove();
  console.log("this.$helper", this.$helper);
}

})(jQuery, this, this.document);