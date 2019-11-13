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
  console.count("nSelectable excluse");
  event.preventDefault();
  event.stopPropagation();
}

nSelectable.prototype.mousedown = function(event){
  //console.count("selectable mousedown");
  ndd.$current.select = $(event.currentTarget);
  //console.log("ndd.$current.select", ndd.$current.select);
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
  //console.log("this.$selectee", this.$selectee);
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
  //console.count("selectable mouseup");
  ndd.$current.select = null;
  this.$helper.remove();
  //console.log("this.$helper", this.$helper);
}

nSelectable.prototype.keydown = function(event){
  return false;
}
