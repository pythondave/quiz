app.factory('questionService', function($http, config) {
  var o = {};
  var optionDisplays = [
    { text: 'Immediately', seconds: 0 },
    { text: 'After 1 second', seconds: 1 },
    { text: 'After 2 second', seconds: 2 },
    { text: 'After 3 seconds', seconds: 3 },
    { text: 'After 5 seconds', seconds: 5 },
    { text: 'After 10 seconds', seconds: 10 },
    { text: 'Only on request' }
  ];
  o.settings = {
    val: { minQuestionLevel: 1, maxQuestionLevel: 5, minOptionsLevel: 1, maxOptionsLevel: 5, optionDisplay: optionDisplays[2] },
    questionLevels: [1,2,3,4,5],
    optionLevels: [1,2,3,4,5],
    optionDisplays: optionDisplays
  };

  o.getAndSetData = function(dataToPost) {
    dataToPost = _.defaults(dataToPost, o.settings.val);
    var getDataFromServer = $http.post(config.requests.urls.question, dataToPost, config.postConfig);
    var setData = function(response) {
      o.question = response.data;
    };
    return getDataFromServer.then(setData);
  };

  return o;
});
