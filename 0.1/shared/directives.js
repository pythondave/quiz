app.directive('keyboardEvent', function () { // *** WIP - ref: http://plnkr.co/edit/mCt85P?p=preview
  return function ($scope, $elem, attr) {
    $elem.bind('keydown', function(e) {
      e.stopPropagation();
      $scope.$apply(function() { $scope.$emit('keydown', e.which);});
    });
    $elem.bind('keypress', function(e) {
      e.stopPropagation();
      $scope.$apply(function() { $scope.$emit('keypress', e.which); });
    });
    $elem.bind('keyup', function(e) {
      e.stopPropagation();
      $scope.$apply(function() { $scope.$emit('keyup', e.which); });
    });
  };
});

app.directive('simpleTooltip', function ($compile) {
//the angular-ui tooltip was causing many digest cycles, so I created this simpler version for the purposes needed on this project
  return {
    restrict: 'A',
    scope: '=',
    controller: function ($scope, $element, $parse) {
      var c, p = $element; //child and parent elements

      var getElementPosition = function(el) {
        var d = el.css('display');
        el.css('display', 'inline'); //so width and height aren't reported as 0
        var o = { t: el.offset().top, l: el.offset().left, w: el.prop('offsetWidth'), h: el.prop('offsetHeight') };
        el.css('display', d); //set back to what it was
        return o;
      };
      var addTooltip = function () {
        var attr = $element.attr('simple-tooltip');
        var options = (attr.charAt(0)==='{' ? $parse(attr)() : { text: attr, placement: 'top', 'class': '' });
        if (!c) { //only need to create it once
          if (!options.text) return;
          options.text = options.text.replace(/\n/gi, '<br/>');
          options.heading = (options.heading ? '<span class="heading">' + options.heading + '</span><hr/>' : '');
          var html = '<div class="tooltip ' + options.placement + ' ' + options['class'] + ' in" style="white-space: normal"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + options.heading + options.text + '</div></div>';
          c = $compile(html)($scope);
          $element.prepend(c);
        }
        //figure out where to put it and then show it
        var pPos = getElementPosition(p), cPos = getElementPosition(c);
        var top = { top: (pPos.t-cPos.h)+'px', right: (pPos.t+(pPos.h-cPos.h)/2)+'px' }[options.placement];
        var left = { top: (pPos.l+(pPos.w-cPos.w)/2)+'px', right: (pPos.l+pPos.w)+'px' }[options.placement];
        c.css({ display: 'block',  top: top, left: left }).show();
      };
      var removeTooltip = function () { if (c) c.hide(); }; //hide it rather than remove it
      $element.bind( 'mouseenter', function() { addTooltip(); });
      $element.bind( 'mouseleave', function() { removeTooltip(); });
    }
  };
});