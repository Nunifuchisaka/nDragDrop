/*
## Droppable
*/

nDragDrop.droppable = function(opts){
  _.bindAll(this, "init", "mouseenter", "mouseleave", "mouseup");
  this.init(opts);
}

nDragDrop.droppable.prototype.init = function(opts){
  this.opts = $.extend({
    create: null,
    over: null,
    out: null,
    drop: null
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
  
  ndd.$current.drop = $(event.currentTarget);
  
  //console.log("ndd.$current.drop", ndd.$current.drop);
  //console.log( "closest", ndd.$current.drag.closest(ndd.$current.drop).length );
  
  //ドロップ先が親だったら除外
  if( 1 == ndd.$current.drag.closest(ndd.$current.drop).length ) return;
  
  if( this.opts.over ) {
    this.opts.over(event, {
      draggable: ndd.$current.drag,
      helper: ndd.drag.helper,
      offset: ndd.drag.helper.offset()
    });
  }
  
  ndd.$current.drop.addClass("ndd_drop_active");
}

nDragDrop.droppable.prototype.mouseleave = function(event){
  //if( null == ndd.$current.drag ) return;
  if( null == ndd.$current.drop ) return;
  console.group("drop mouseleave");
  ndd.$current.drop.removeClass("ndd_drop_active");
  ndd.$current.drop = null;
  console.groupEnd();
  if( this.opts.out ) {
    this.opts.out(event, {
      draggable: ndd.$current.drag,
      helper: ndd.drag.helper,
      offset: ndd.drag.helper.offset()
    });
  }
}

nDragDrop.droppable.prototype.mouseup = function(event){
  if( null == ndd.$current.drop ) return;
  ndd.$current.drop.removeClass("ndd_drop_active");
  ndd.$current.drop = null;
  //this.mouseleave(event);
  /*
  console.group("drop mouseup");
  console.log("ndd.$current.drag", ndd.$current.drag);
  console.groupEnd();
  */
  if( this.opts.drop ){
    this.opts.drop(event, {
      draggable: ndd.$current.drag,
      helper: ndd.drag.helper,
      offset: ndd.drag.helper.offset()
    });
  }
}
