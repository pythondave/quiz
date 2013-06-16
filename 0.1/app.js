var app = angular.module('app', ['ui.bootstrap', 'ngMockE2E', 'ngResource', 'ui.compat']);

app.run(function($rootScope) {
  _.templateSettings = { 'interpolate': /{{([\s\S]+?)}}/g }; //allow double-moustache syntax in message templates
  //create some new generic underscore methods
  _.mixin({ //ref: http://underscorejs.org/#mixin
    compare: function(a, b) { //compares a and b and returns 1 (a first), -1 (b first) or 0 (equal)
      if (a === undefined && b === undefined) return 0;
      if (a === undefined) return -1;
      if (b === undefined) return 1;
      return (a>b?1:(b>a?-1:0));
    },
    deep: function (o, path) { // extracts a value from a nested object using a string path
      //ref: https://gist.github.com/furf/3208381
      // usage: _.deep({ a: { b: { c: { d: ['e', 'f', 'g'] }, 'a.b.c.d[2]'); ==> 'g
      var keys = path.replace(/\[(["']?)([^\1]+?)\1?\]/g, '.$2').replace(/^\./, '').split('.');
      var i = 0, n = keys.length;
      while ((o = o[keys[i++]]) && i < n) {}
      return i < n ? void 0 : o;
    },
    deepCompare: function(o1, o2, path) { //compares 2 deep values (see 'compare' and 'deep')
      return _.compare(_.deep(o1, path), _.deep(o2, path));
    },
    arrayOfValues: function(o) { //returns an array of object values; o: any object (non-circular)
      //can be useful for generic text-search on a an object
      var a = [];
      function traverse(o) {
        for (var i in o) {
          if (typeof o[i] === 'object') { traverse(o[i]); } else { a.push(o[i]); }
        }
      }
      traverse(o);
      return a;
    },
    objectify: function(x, newPropertyName) { //converts x to an object if it isn't one already
      newPropertyName = newPropertyName || 'val';
      if (typeof x === 'object') { return x; } else { var o = {}; o[newPropertyName] = x; return o; }
    },
    objectifyAll: function(arr, newPropertyName) { //'objectifies' all items of an array
      return _.map(arr, function(item) { return _(item).objectify(newPropertyName).value(); });
    },
    addUniqueId: function(o) { //adds a uniqueId to o
      o.id = _.uniqueId();
      return o;
    },
    addUniqueIds: function(arr, newPropertyName) {
      return _.map(arr, function(item) { return _(item).addUniqueId(newPropertyName).value(); });
    },
    firstDefined: function() { return _.find(arguments, function(x) { return !_.isUndefined(x); }); },
    eachRight: function(arr, callback) {
      for (var i = arr.length-1; i >= 0; i--) { callback(arr[i], i, arr); }
      return arr;
    },
    rejectInPlace: function(arr, callback) {
      return _.eachRight(arr, function(item, index) { if (callback(item)) arr.splice(index, 1); });
    },
    toTitleCase: function(s) { return s.toLowerCase().replace(/^(.)|\s(.)/g, function($1) { return $1.toUpperCase(); }); },
    toPascalCase: function(s) { return _.toTitleCase(s).replace(/ /g, ''); },
    toCamelCase: function(s) { var x = _.toPascalCase(s); return x[0].toLowerCase() + x.substring(1); },
    addProperty: function(arr, propertyName, propertyValue) { //adds a property to every item in an array
      _.each(arr, function(item) { item[propertyName] = propertyValue; }); return arr;
    },
    invertString: function(s) { return (s.slice(0, 1) === '-' ? s.slice(1) : '-' + s ); } // _.invertString('abc') => '-abc'; _.invertString('-abc') => 'abc';
  });
});

//navbar (top menu)
app.controller('NavBarCtrl', function($scope, $state) {
  $scope.navBarUrl = "shared/navBar.html";
  $scope.menuItems = [
    { name: 'data', title: 'Data' },
    { name: 'questions', title: 'Questions' }
  ];
  $scope.$on('$stateChangeSuccess', function() {
    $scope.activeMenuItem = $state.current.name;
  });
});

//states (routes) - ref: https://github.com/angular-ui/ui-router
app.config(function($stateProvider) {
  $stateProvider
    .state('data', {
      url: '/data',
      views: {
        'left': { templateUrl: 'data/menu.html', controller: 'DataMenuCtrl' },
        'main': { templateUrl: 'data/default.html', controller: 'DataCtrl' }
      }
    })
    .state('questions', {
      url: '/questions',
      views: {
        'left': { templateUrl: 'questions/menu.html', controller: 'QuestionsMenuCtrl' },
        'main': { templateUrl: 'questions/default.html', controller: 'QuestionsCtrl' }
      }
    });
});

// keyboard events
app.controller('KeyboardEventCtrl', function($scope, $state) {
  var ctrlIsDown, altIsDown;
  $scope.$on('keydown', function(e, keyCode) {
    if (keyCode === 17) ctrlIsDown = true;
    if (keyCode === 18) altIsDown = true;
    if (ctrlIsDown && altIsDown) {
      if (keyCode == 49 || keyCode == 84) { $state.transitionTo('teachers'); } //1 or t
      if (keyCode == 50 || keyCode == 74) { $state.transitionTo('jobs'); } //2 or j
      if (keyCode == 51 || keyCode == 65) { $state.transitionTo('applications'); } //3 or a
    }
  });
  $scope.$on('keyup', function(e, keyCode) {
    if (keyCode === 17) ctrlIsDown = false;
    if (keyCode === 18) altIsDown = false;
  });
});
