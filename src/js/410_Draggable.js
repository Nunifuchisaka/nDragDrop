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
    distance: 2,
    create: null,
    start: null,
    drag: null,
    stop: null
  }, opts);
  console.group("nDragDrop Draggable init");
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
  ndd.$body.on("mousedown.ndd_draggable", this.opts.el, this.mousedown);
  //console.log("mousedown", this.opts.el);
  ndd.$body.on("mouseup.ndd_draggable", this.mouseup);
}

nDragDrop.draggable.prototype.dragstart = function(event){
  ndd.$body.off("mousemove.ndd_drag_mousemove");
  //console.group("draggable dragstart");
  //this.status.drag = true;
  
  //console.log("ndd.$current.drag", ndd.$current.drag);
  var elOffset = ndd.$current.drag.offset();
  //console.log("elOffset", elOffset);
  ndd.drag.helper
    .show()
    .css({
      top: elOffset.top,
      left: elOffset.left
    });
    //.append( ndd.$current.drag.clone() );
  
  //選択されている要素を$clonesに追加
  ndd.$current.drag.each(function(i,el){
    var $el = $(el),
        offset = $el.offset();
    var _$el =  $el.clone().css({
      top: offset.top - elOffset.top,
      left: offset.left - elOffset.left
    });
    ndd.drag.helper.append(_$el);
  });
  
  ndd.$current.drag.css("visibility", "hidden");
  
  //console.log("X : " + this.vars.graspPosDiffX, "Y : " + this.vars.graspPosDiffY);
  //console.log("X : " + event.pageX, "Y : " + event.pageY);
  
  ndd.$body.on("mousemove.ndd_dragging", this.dragging);
  
  if( this.opts.start ) {
    this.opts.start(event, {
      helper: ndd.drag.helper,
      offset: ndd.drag.helper.offset()
      //position: elOffset
    });
  }
  //console.groupEnd();
}

nDragDrop.draggable.prototype.mousedown = function(event){
  //console.group("draggable mousedown");
  ndd.$current.drag = $(event.currentTarget).parent().find(this.opts.el);
  this.vars.mousedownPageX = event.pageX;
  this.vars.mousedownPageY = event.pageY;
  
  //掴んだ位置の差分
  var elOffset = ndd.$current.drag.offset();
  this.vars.graspPosDiffX = elOffset.left - event.pageX;
  this.vars.graspPosDiffY = elOffset.top - event.pageY;
  
  //console.groupEnd();
  ndd.$body.on("mousemove.ndd_drag_mousemove", this.mousemove);
}

nDragDrop.draggable.prototype.mousemove = function(event){
  //console.group("draggable mousemove");
  this.vars.mousemoveStack++;
  if( this.vars.mousemoveStack > this.opts.distance ){
    this.vars.mousemoveStack = 0;
    this.dragstart(event);
  }
  //console.groupEnd();
}

nDragDrop.draggable.prototype.dragging = function(event){
  //console.group("draggable dragging");
  ndd.drag.helper.css({
    top: event.pageY + this.vars.graspPosDiffY,
    left: event.pageX + this.vars.graspPosDiffX
  });
  
  if( this.opts.drag ) {
    this.opts.drag(event, {
      helper: ndd.drag.helper,
      offset: ndd.drag.helper.offset()
    });
  }
  //console.groupEnd();
}

nDragDrop.draggable.prototype.mouseup = function(event){
  ndd.$body.off("mousemove.ndd_drag_mousemove");
  if( null == ndd.$current.drag ) return;
  //console.group("draggable mouseup");
  ndd.$body.off("mousemove.ndd_dragging");
  ndd.$current.drag.css("visibility", "visible");
  if( this.opts.stop ) {
    this.opts.stop(event, {
      helper: ndd.drag.helper,
      offset: ndd.drag.helper.offset()
    });
  }
  ndd.drag.helper.hide().empty();
  ndd.$current.drag = null;
  this.status.drag = false;
  //console.groupEnd();
}
