app.factory('dataService', function($http, config, $rootScope) {
  var o = {};

  o.getAndSetData = function(dataToPost) {
    var getDataFromServer = $http.post(config.requests.urls.monarchs, dataToPost, config.postConfig);
    var setData = function(response) {
      o.data = response.data;
      $rootScope.$broadcast('dataReceived'); //more than one controller needs to know
    };
    getDataFromServer.then(setData);
  };

  return o;
});
