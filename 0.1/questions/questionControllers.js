app.controller('QuestionsMenuCtrl', function($scope, questionService) {
  $scope.settings = questionService.settings;

  $scope.$watch('settings.val.minQuestionLevel', function(value, oldValue) {
    if (value === oldValue) return;
    if (value > $scope.settings.val.maxQuestionLevel) $scope.settings.val.maxQuestionLevel = value;
    console.log($scope.settings);
  });

  $scope.$watch('settings.val.maxQuestionLevel', function(value, oldValue) {
    if (value === oldValue) return;
    if (value < $scope.settings.val.minQuestionLevel) $scope.settings.val.minQuestionLevel = value;
  });

  $scope.$watch('settings.val.minOptionsLevel', function(value, oldValue) {
    if (value === oldValue) return;
    if (value > $scope.settings.val.maxOptionsLevel) $scope.settings.val.maxOptionsLevel = value;
  });

  $scope.$watch('settings.val.maxOptionsLevel', function(value, oldValue) {
    if (value === oldValue) return;
    if (value < $scope.settings.val.minOptionsLevel) $scope.settings.val.minOptionsLevel = value;
  });
});

app.controller('QuestionsCtrl', function($scope, $timeout, questionService) {
  $scope.settings = questionService.settings;

  var setScope = function() {
    $scope.displayOptions = false;
    $scope.question = questionService.question;
    var seconds = $scope.settings.val.optionDisplay.seconds;
    if (seconds !== undefined) { $timeout(function() { $scope.displayOptions = true; }, seconds*1000); }
  };

  $scope.getQuestion = function() {
    $scope.answered = undefined;
    $scope.question = undefined;
    questionService.getAndSetData({}).then(setScope);
  };

  $scope.setAnswered = function(option) {
    if ($scope.answered !== undefined) return; //can't change answer
    $scope.answered = option;
  };

  $scope.getClass = function(option) {
    if ($scope.answered === undefined) return 'btn-info'; //not yet answered
    if (option === $scope.question.answer) return 'btn-success'; //the answer
    if (option === $scope.answered && option !== $scope.question.answer) return 'btn-danger'; //user's answer but not the answer
    return 'disabled'; //everything else
  };

  $scope.getQuestion();
});
