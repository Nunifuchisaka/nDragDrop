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
  _.bindAll(this, "init",
  "mousedown", "mousemove", "mouseup",
  "dragstart", "dragging");
  this.init(opts);
}


nDragDrop.draggable.prototype.init = function(opts){
  this.opts = $.extend({
    distance: 2
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
    graspPosDiffY: 0,
    mousedownPageX: 0,
    mousedownPageY: 0,
    mousemoveStack: 0
  };
  
  ndd.common = ndd.common || new Common();
  
  //this.$body = $("body");
  this.$el = $(this.opts.el);
  //this.$current;
  this.$clone;
  ndd.$body.on("mousedown.ndd_draggable", this.opts.el, this.mousedown);
  //console.log("mousedown", this.opts.el);
  ndd.$body.on("mouseup.ndd_draggable", this.mouseup);
}

nDragDrop.draggable.prototype.dragstart = function(event){
  ndd.$body.off("mousemove.ndd_drag_mousemove");
  console.group("draggable dragstart");
  //this.status.drag = true;
  
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
  
  console.log("X : " + this.vars.graspPosDiffX, "Y : " + this.vars.graspPosDiffY);
  //console.log("X : " + event.pageX, "Y : " + event.pageY);
  
  ndd.$body.on("mousemove.ndd_dragging", this.dragging);
  console.groupEnd();
}

nDragDrop.draggable.prototype.mousedown = function(event){
  console.group("draggable mousedown");
  ndd.$current.drag = $(event.currentTarget).parent().find(this.opts.el);
  this.vars.mousedownPageX = event.pageX;
  this.vars.mousedownPageY = event.pageY;
  
  //掴んだ位置の差分
  var elOffset = ndd.$current.drag.offset();
  this.vars.graspPosDiffX = elOffset.left - event.pageX;
  this.vars.graspPosDiffY = elOffset.top - event.pageY;
  
  console.groupEnd();
  ndd.$body.on("mousemove.ndd_drag_mousemove", this.mousemove);
}

nDragDrop.draggable.prototype.mousemove = function(event){
  console.group("draggable mousemove");
  this.vars.mousemoveStack++;
  if( this.vars.mousemoveStack > this.opts.distance ){
    this.vars.mousemoveStack = 0;
    this.dragstart(event);
  }
  console.groupEnd();
}

nDragDrop.draggable.prototype.dragging = function(event){
  //console.group("draggable dragging");
  ndd.$clones.css({
    top: event.pageY + this.vars.graspPosDiffY,
    left: event.pageX + this.vars.graspPosDiffX
  });
  //console.groupEnd();
}

nDragDrop.draggable.prototype.mouseup = function(event){
  ndd.$body.off("mousemove.ndd_drag_mousemove");
  if( null == ndd.$current.drag ) return;
  console.group("draggable mouseup");
  ndd.$body.off("mousemove.ndd_dragging");
  ndd.$clones.hide().empty();
  ndd.$current.drag.css("visibility", "visible");
  ndd.$current.drag = null;
  this.status.drag = false;
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
  _.bindAll(this, "init", "click", "mousedown", "mousemove", "mouseup", "keydown");
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
  this.$selected;//(this.opts.selectee).filter(".ndd_selected")
  this.$el = $(this.opts.el);
  //ndd.$current.select = null;
  
  this.$el.each(function(i, el){
    var $me = $(el),
        $selected = $me.find(".ndd_selected");
    console.log(i, el, $selected.length);
    $selected.last().addClass("ndd_pivot");
  });
  
  this.$helper = $('<div id="ndd_selectable_helper"><div></div></div>');
  
  ndd.$body.on("mousedown.ndd_selectable", this.opts.el, this.mousedown);
  ndd.$body.on("mousemove.ndd_selectable", this.mousemove);
  ndd.$body.on("mouseup.ndd_selectable", this.mouseup);
  
  ndd.$body.on("click.ndd_selectable", this.opts.el + " " + this.opts.selectee, this.click);
  
  if( this.opts.excluse ){
    ndd.$body.on("mousedown", this.opts.excluse, this.excluse);
  }
  
  //ndd.$window.on("keydown", this.keydown);
  //ndd.$body.on("keydown", this.opts.selectee, this.keydown);
  
  console.groupEnd();
}

nSelectable.prototype.click = function(event){
  console.group("click");
  var $me = $(event.currentTarget),
      $parent = $me.parents(this.opts.el),
      $pivot = $parent.find(".ndd_pivot");
  console.log("currentTarget", event.currentTarget);
  
  //メタキーが押されていない場合はすべての選択を解除する
  if( !(event.ctrlKey || event.metaKey || event.shiftKey) ){
    //console.log("ctrl or cmd.");
    $parent.find(".ndd_selected").not($me).removeClass("ndd_selected");
  }
  
  if( event.ctrlKey || event.metaKey ){
    //メタキーを押しているとき
    if( $me.hasClass("ndd_selected") ){
      //クリックした要素が選択中だったとき
      $me.removeClass("ndd_selected ndd_pivot");
      $pivot = $parent.find(".ndd_pivot");
      if( 0 == $pivot.length ){
        //pivotがなかったとき
        var $next = $me.next(".ndd_selected");
        if( 0 < $next.length ){
          //次の要素があったとき
          $next.addClass("ndd_pivot");
        } else {
          //次の要素がなかったとき
          var $prev = $me.prev(".ndd_selected");
          if( 0 < $next.length ){
            //前の要素があったとき
            $prev.addClass("ndd_pivot");
          } else {
            //前の要素がなかったとき
            $parent.find(".ndd_selected").eq(0).addClass("ndd_pivot");
          }
        }
        $pivot = $parent.find(".ndd_pivot");
      }
    } else {
      //クリックした要素が選択中ではなかったとき
      $pivot.removeClass("ndd_pivot");
      $parent.find(".ndd_tmp").removeClass("ndd_tmp");
      $me.addClass("ndd_selected ndd_pivot");
      $pivot = $parent.find(".ndd_pivot");
    }
  } else {
    //メタキーを押していないとき
    $me.addClass("ndd_selected");
  }
  
  
  //シフトキーが押されている場合
  if( event.shiftKey ){
    $parent.find(".ndd_tmp").removeClass("ndd_tmp ndd_selected");
    if( 0 == $pivot.length ){
      $parent.find(this.opts.selectee).eq(0).addClass("ndd_pivot");
      $pivot = $parent.find(".ndd_pivot");
    }
    var current = $me.index(),
        pivot = $pivot.index();
    console.log("current", current);
    console.log("pivot", pivot);
    var l = Math.max(current, pivot),
        s = Math.min(current, pivot);
    var $item = $parent.find(this.opts.selectee);
    for( var i = s; i <= l; i++ ){
      $item.eq(i).addClass("ndd_selected");
      if( i != pivot ){
        $item.eq(i).addClass("ndd_tmp");
      }
    }
  }
  
  if( $me.hasClass("ndd_selected") ){
    if( !event.shiftKey ){
      //ndd.$last.select = $me;
      $parent.find(".ndd_pivot").removeClass("ndd_pivot");
      $me.addClass("ndd_pivot");
    }
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

nSelectable.prototype.keydown = function(event){
  return false;
}

})(jQuery, this, this.document);