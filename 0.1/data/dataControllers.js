app.controller('DataMenuCtrl', function($scope, dataService) {
  $scope.questionLevels = [1,2,3,4,5];

  //get data
  var getting = false; //ensures we only get once at a time
  var getAndSetData = function() {
    if (getting) return; getting = true;
    var dataToPost = { minQuestionLevel: $scope.minQuestionLevel, maxQuestionLevel: $scope.maxQuestionLevel };
    dataService.getAndSetData(dataToPost);
  };
  $scope.$on('dataReceived', function() { getting = false; });

  $scope.$watch('minQuestionLevel', function(value, oldValue) {
    if (value === oldValue) return;
    if (value > $scope.maxQuestionLevel) $scope.maxQuestionLevel = value;
    getAndSetData();
  });

  $scope.$watch('maxQuestionLevel', function(value, oldValue) {
    if (value === oldValue) return;
    if (value < $scope.minQuestionLevel) $scope.minQuestionLevel = value;
    getAndSetData();
  });
});

app.controller('DataCtrl', function($scope, dataService) {
  $scope.$on('dataReceived', function() {
    $scope.monarchs = dataService.data.monarchs;
  });

  dataService.getAndSetData();
});
