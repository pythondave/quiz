// *** IMPORTANT ***
//This file should be included in the PROTOTYPE ONLY.
//In theory it acts as the server in the absence of the server. It is a mock server.
// *** ********* ***

app.factory('delayResponseInterceptor', function($q, $timeout, config) {
  //Can be used to delay all mock responses by a typical (and occasionally atypical) random amount, or fail entirely at a certain rate
  var serverSpeedMultiplier = _.firstDefined(config.serverSpeedMultiplierOverride, config.requests.serverSpeedMultiplier, 0.2); //reduce during dev so things work faster (say 0.2), increase (to say 1) when demoing
  config.local = { //configure special values for particular requests here
    //delayLengthMultiplier: standard random server response delay will be multiplied by this (e.g. for requests which are normally longer, say)
    //errorRate: 0: no errors; 1 error every time;
    logRequestsToConsole: true, //change to true to monitor server requests in the console window
    attributeDefaults: { delayLengthMultiplier: 1, errorRate: 0 } //these will be used if no specific value is found
  };
  var getConfigValue = function(requestUrl, attributeName, defaultValue) { //use to ease the process of getting config values
    defaultValue = defaultValue || config.local.attributeDefaults[attributeName];
    if (!config.local[requestUrl]) return defaultValue;
    if (!config.local[requestUrl][attributeName]) return defaultValue;
    return config.local[requestUrl][attributeName];
  };
  var randomLogNormalValue = function(mu, sigma) { //server responses can be roughly modelled by a lognormal distribution
    var z1 = Math.sqrt(-2 * Math.log(1.0 - Math.random())) * Math.sin(2 * Math.PI * Math.random());
    return Math.exp(mu + sigma * z1);
  };
  var getStandardRandomServerResponseDelayLength = function() { //returns a random integer
    var randomInteger = Math.round(1000*randomLogNormalValue(-1.2, 0.5)); //typically 100-1000, occasionally 50-100 or 1000-1700
    return randomInteger * serverSpeedMultiplier;
  };
  var logSampleStandardRandomServerResponseDelayLengths = function(n) { //used for experimentally working out good values for mu and sigma
    var a = [];
    for (var i=0; i<100; i++) {
      a.push(getStandardRandomServerResponseDelayLength());
    }
    a.sort(function(a, b) { return a-b; });
    console.log(a);
  };
  var getRandomServerResponseDelayLengthForRequestUrl = function(requestUrl) { //return a ramdom delay for a given request
    var delayLengthMultiplier = getConfigValue(requestUrl, 'delayLengthMultiplier');
    var delay = getStandardRandomServerResponseDelayLength() * delayLengthMultiplier;
    return delay;
  };
  var delay = function(lengthInMilliSeconds) { //promise which resolves after a delay
    var deferred = $q.defer();
    $timeout(deferred.resolve, lengthInMilliSeconds);
    return deferred.promise;
  };
  var delayedHttpRequest = function(httpRequest) { //takes an httpRequest promise and returns it, delayed by an amount appropriate for that request type
    //note that we need to resolve the httpRequest twice - once to get the url (to get related config values), and then again after the delay
    var responseInfo;
    var getResponseInfo = function(response) {
      if (config.local.logRequestsToConsole && response.config.method === 'POST') {
        console.log('SERVER REQUEST: ', response.config.url, 'PARAMS: ', response.config.data);
      }
      responseInfo = response;
      return httpRequest; //use the same promise
    };
    var delayForRandomDuration = function() {
      var delayLength = getRandomServerResponseDelayLengthForRequestUrl(responseInfo.config.url);
      return delay(delayLength);
    };
    var getHttpRequest = function() {
      var errorRate = getConfigValue(responseInfo.config.url, 'errorRate');
      if (Math.random() < errorRate) { return $q.reject(); } //randomly error according to the errorRate
      return httpRequest;
    };
    return httpRequest.then(getResponseInfo).then(delayForRandomDuration).then(getHttpRequest);
  };

  return delayedHttpRequest;
});

//add the above factory to the responseInterceptors - this calls 'delayedHttpRequest' during every http request
app.config(function($httpProvider) {
  $httpProvider.responseInterceptors.unshift('delayResponseInterceptor');
});

app.factory('serverListsService', function() {
  var o = {};

  var getDurationInYears = function(from, to) {
    from = parseInt(from, 10);
    to = (to==='present' ? new Date().getFullYear() : parseInt(to, 10));
    return to-from;
  };

  o.monarchsOfEnglandAndBritain = [
    { monarch: 'Egbert', from: '802', to: '839', house: 'Wessex', questionLevel: 4 },
    { monarch: 'Aethelwulf', from: '839', to: '858', house: 'Wessex', questionLevel: 5 },
    { monarch: 'Aethelbald', from: '858', to: '860', house: 'Wessex', questionLevel: 5 },
    { monarch: 'Aethelbert', from: '860', to: '866', house: 'Wessex', questionLevel: 5 },
    { monarch: 'Aethelred', from: '866', to: '871', house: 'Wessex', questionLevel: 5 },
    { monarch: 'Alfred the Great', from: '871', to: '899', house: 'Wessex', questionLevel: 3 },
    { monarch: 'Edward the Elder', from: '899', to: '925', house: 'Wessex', questionLevel: 5 },
    { monarch: 'Athelstan', from: '925', to: '940', house: 'Wessex', questionLevel: 4 },
    { monarch: 'Edmund the Magnificent', from: '940', to: '946', house: 'Wessex', questionLevel: 5 },
    { monarch: 'Eadred', from: '946', to: '955', house: 'Wessex', questionLevel: 5 },
    { monarch: 'Eadwig (Edwy) All-Fair', from: '955', to: '959', house: 'Wessex', questionLevel: 5 },
    { monarch: 'Edgar the Peaceable', from: '959', to: '975', house: 'Wessex', questionLevel: 5 },
    { monarch: 'Edward the Martyr', from: '975', to: '978', house: 'Wessex', questionLevel: 5 },
    { monarch: 'Aethelred II', from: '979 and 1014', to: '1013 and 1016', house: 'Wessex', info: 'AKA Ethelred the Unready', questionLevel: 3 },
    { monarch: 'Edmund II', from: '1016', to: '1016', house: 'Wessex', info: 'AKA Edmund Ironside', questionLevel: 3 },
    { monarch: 'Svein Forkbeard', from: '1014', to: '1014', house: 'Danish', questionLevel: 4 },
    { monarch: 'Cnut', from: '1016', to: '1035', house: 'Danish', info: 'AKA Canute', questionLevel: 3 },
    { monarch: 'Harold I', from: '1035', to: '1040', house: 'Danish', questionLevel: 4 },
    { monarch: 'Hardicnut', from: '1040', to: '1042', house: 'Danish', questionLevel: 4 },
    { monarch: 'Edward the Confessor', from: '1042', to: '1066', house: 'Saxons', questionLevel: 4 },
    { monarch: 'Harold II', from: '1066', to: '1066', house: 'Saxons', questionLevel: 1 },
    { monarch: 'William I', from: '1066', to: '1087', house: 'Normans', info: 'AKA William the Conquerer', questionLevel: 1 },
    { monarch: 'William II', from: '1087', to: '1100', house: 'Normans', questionLevel: 4 },
    { monarch: 'Henry I', from: '1100', to: '1135', house: 'Normans', questionLevel: 4 },
    { monarch: 'Stephen', from: '1135', to: '1154', house: 'Normans', questionLevel: 4 },
    { monarch: 'Empress Matilda', from: '1141', to: '1141', house: 'Normans', info: 'AKA Queen Maud', questionLevel: 3 },
    { monarch: 'Henry II', from: '1154', to: '1189', house: 'Plantagenets', questionLevel: 4 },
    { monarch: 'Richard I', from: '1189', to: '1199', house: 'Plantagenets', questionLevel: 3 },
    { monarch: 'John', from: '1199', to: '1216', house: 'Plantagenets', questionLevel: 2 },
    { monarch: 'Henry III', from: '1216', to: '1272', house: 'Plantagenets', questionLevel: 2 },
    { monarch: 'Edward I', from: '1272', to: '1307', house: 'Plantagenets', questionLevel: 2 },
    { monarch: 'Edward II', from: '1307', to: '1327', house: 'Plantagenets', questionLevel: 2 },
    { monarch: 'Edward III', from: '1327', to: '1377', house: 'Plantagenets', questionLevel: 2 },
    { monarch: 'Richard II', from: '1377', to: '1399', house: 'Plantagenets', questionLevel: 2 },
    { monarch: 'Henry IV', from: '1399', to: '1413', house: 'Lancaster', questionLevel: 2 },
    { monarch: 'Henry V', from: '1413', to: '1422', house: 'Lancaster', questionLevel: 2 },
    { monarch: 'Henry VI', from: '1422', to: '1461', house: 'Lancaster', questionLevel: 2 },
    { monarch: 'Edward IV', from: '1461', to: '1483', house: 'York', questionLevel: 2 },
    { monarch: 'Edward V', from: '1483', to: '1483', house: 'York', questionLevel: 3 },
    { monarch: 'Richard III', from: '1483', to: '1485', house: 'York', questionLevel: 1 },
    { monarch: 'Henry VII', from: '1485', to: '1509', house: 'Tudors', questionLevel: 2 },
    { monarch: 'Henry VIII', from: '1509', to: '1547', house: 'Tudors', questionLevel: 1 },
    { monarch: 'Edward VI', from: '1547', to: '1553', house: 'Tudors', questionLevel: 2 },
    { monarch: 'Jane Grey', from: '1553', to: '1553', house: 'Tudors', questionLevel: 3 },
    { monarch: 'Mary I', from: '1553', to: '1558', house: 'Tudors', questionLevel: 2 },
    { monarch: 'Elizabeth I', from: '1558', to: '1603', house: 'Tudors', questionLevel: 1 },
    { monarch: 'James I', from: '1603', to: '1625', house: 'Stuarts', questionLevel: 2 },
    { monarch: 'Charles I', from: '1625', to: '1649', house: 'Stuarts', questionLevel: 2 },
    { monarch: 'Oliver Cromwell', from: '1649', to: '1658', house: 'Commonwealth', questionLevel: 2 },
    { monarch: 'Richard Cromwell', from: '1658', to: '1659', house: 'Commonwealth', questionLevel: 3 },
    { monarch: 'Charles II', from: '1660', to: '1685', house: 'Stuarts', questionLevel: 2 },
    { monarch: 'James II', from: '1685', to: '1688', house: 'Stuarts', questionLevel: 2 },
    { monarch: 'William III', from: '1689', to: '1702', house: 'Stuarts', questionLevel: 2 },
    { monarch: 'Mary II', from: '1689', to: '1694', house: 'Stuarts', questionLevel: 2 },
    { monarch: 'Anne', from: '1702', to: '1714', house: 'Stuarts', questionLevel: 2 },
    { monarch: 'George I', from: '1714', to: '1727', house: 'Hanover', questionLevel: 2 },
    { monarch: 'George II', from: '1727', to: '1760', house: 'Hanover', questionLevel: 2 },
    { monarch: 'George III', from: '1760', to: '1820', house: 'Hanover', questionLevel: 1 },
    { monarch: 'George IV', from: '1820', to: '1830', house: 'Hanover', questionLevel: 2 },
    { monarch: 'William IV', from: '1830', to: '1837', house: 'Hanover', questionLevel: 2 },
    { monarch: 'Victoria', from: '1837', to: '1901', house: 'Hanover', questionLevel: 1 },
    { monarch: 'Edward VII', from: '1901', to: '1910', house: 'Saxe-Coburg-Gotha', questionLevel: 2 },
    { monarch: 'George V', from: '1910', to: '1936', house: 'Windsor', questionLevel: 2 },
    { monarch: 'Edward VIII', from: '1936', to: '1936', house: 'Windsor', questionLevel: 2 },
    { monarch: 'George VI', from: '1936', to: '1952', house: 'Windsor', questionLevel: 2 },
    { monarch: 'Elizabeth II', from: '1952', to: 'present', house: 'Windsor', questionLevel: 1 }
  ];
  _.each(o.monarchsOfEnglandAndBritain, function(m) { m.durationInYears = getDurationInYears(m.from, m.to); });

  return o;
});

app.factory('randomDataService', function(serverListsService) {
  var capitaliseFirstLetter = function(s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  var offsetDateByDays = function(days, date) {
    return new Date((date || new Date()).getTime() + days*24*60*60*1000);
  };
  var getRandomInteger = function(from, to) {
    return from+Math.floor(Math.random()*(to-from+1));
  };
  var getRandomJsDate = function(from, to) {
    var f = (from ? from.getTime() : new Date(1900, 0, 1).getTime());
    var t = (to ? to.getTime() : new Date(2100, 0, 1).getTime());
    return new Date(f + Math.random() * (t - f));
  };
  var getRandomIsoDate = function(from, to) {
    return getRandomJsDate(from, to).toISOString();
  };
  var getRandomArrayItem = function(arr) {
    return arr[getRandomInteger(0, arr.length-1)];
  };
  var getRandomDataItem = function(type) {
    //*** TODO: some of these should occasionally return undefined etc - need to check which that's possible for
    switch (type) {
      case 'id': return _.uniqueId();
    }
    return "WIP";
  };
  var getRandomObject = function(properties) {
    var o = {};
    for (var i = 0; i < properties.length; i++) {
      var p = properties[i];
      if (typeof p === 'string') o[p] = getRandomDataItem(p);
      if (typeof p === 'object') o[p.name] = getRandomDataItem(p.type);
    }
    return o;
  };
  var getRandomArrayOfObjects = function(options) {
    var a = [];
    for (var i = 0; i < options.length; i++) {
      var o = (options.fn ? options.fn.call() : getRandomObject(options.properties));
      a.push(o);
    }
    return a;
  };
  var getRandomArrayOfDataItems = function(options) {
    var a = [];
    for (var i = 0; i < options.length; i++) {
      var v = (options.fn ? options.fn.call() : getRandomDataItem(options.type));
      a.push(v);
    }
    return a;
  };
  var getRandomSentence = function() {
    var s = getRandomArrayOfDataItems({ type: 'latinWord', length: getRandomInteger(1, 10) }).join(' ');
    return capitaliseFirstLetter(s) + '.';
  };
  var getRandomParagraph = function(minSentences, maxSentences) {
    minSentences = minSentences || 1; maxSentences = maxSentences || 8;
    return getRandomArrayOfDataItems({ fn: getRandomSentence, length: getRandomInteger(minSentences, maxSentences) }).join(' ');
  };
  var getRandomMultiParagraphMessage = function(minParagraphs, maxParagraphs) {
    minParagraphs = minParagraphs || 1; maxParagraphs = maxParagraphs || 4;
    return getRandomArrayOfDataItems({ fn: getRandomParagraph, length: getRandomInteger(minParagraphs, maxParagraphs) }).join('\n\n');
  };
  var o = {};
  o.getRandomInteger = getRandomInteger;
  o.getRandomArrayItem = getRandomArrayItem;
  o.getRandomDataItem = getRandomDataItem;
  o.getRandomIsoDate = getRandomIsoDate;
  o.getRandomObject = getRandomObject;
  o.getRandomArrayOfObjects = getRandomArrayOfObjects;
  o.getRandomArrayOfDataItems = getRandomArrayOfDataItems;
  o.getRandomSentence = getRandomSentence;
  o.getRandomParagraph = getRandomParagraph;
  return o;
});

//set dummy server responses to posts and gets
app.run(function($httpBackend, $resource, $q, $timeout, serverListsService, randomDataService) {
  //note: $httpBackend requests are at the bottom

  //dummy responses (in the form of javascript objects)

  var filterByQuestionLevel = function(array, params) {
    _.defaults(params, { minQuestionLevel: 1, maxQuestionLevel: 5 });
    var filterFunction = function(item) {
      return  item.questionLevel >= params.minQuestionLevel &&
              item.questionLevel <= params.maxQuestionLevel;
    };
    return _.filter(array, filterFunction);
  };

  var monarchsResponse = function(method, url, data, headers) {
    var params = (data ? JSON.parse(data) : {});
    var monarchs = filterByQuestionLevel(serverListsService.monarchsOfEnglandAndBritain, params);
    var response = {
      "monarchs": monarchs
    };
    return [200, response];
  };

  //templates
  _.templateSettings = { 'interpolate': /{{([\s\S]+?)}}/g }; //allow moustaches
  var questionTemplate = "When did {{monarch}}'s reign begin?";
  var searchTemplate = "{{monarch}} {{house}}";
  var durationTemplate = " ({{( durationInYears===0 ? 'less than a year' : durationInYears + ' years' )}})";
  var precededByTemplate = "{{( previous ? ' Preceded by ' + previous.monarch + ' (' + previous.house + ');' : '' )}}";
  var succeededByTemplate = "{{( next ? ' Succeeded by ' + next.monarch + ' (' + next.house + ');' : '' )}}";
  var infoTemplate = "Reign {{from}}-{{to}}" + durationTemplate + "; House of {{house}};" + precededByTemplate + succeededByTemplate + "{{( info ? ' ' + info + ';' : '' )}}";

  var questionResponse = function(method, url, paramString, headers) {
    //*** TODO: split out the generic and specific stuff (probably easiest to introduce another question type and then rework this code for that)
    var params = (paramString ? JSON.parse(paramString) : {});
    var data = serverListsService.monarchsOfEnglandAndBritain;

    var filteredData = filterByQuestionLevel(data, params);
    var filteredIndex = randomDataService.getRandomInteger(0, filteredData.length-1);
    var item = filteredData[filteredIndex];
    var index = _.indexOf(data, item);
    var previous = (index > 0 ? data[index-1] : undefined);
    var next = (index < data.length-1 ? data[index+1] : undefined);
    var questionData =  _.assign({ info: undefined }, item, { previous: previous }, { next: next });

    var o = {};
    o.data = item;
    o.search = _.template(searchTemplate, questionData);
    o.questionLevel = item.questionLevel;
    o.question = _.template(questionTemplate, questionData);
    o.info = _.template(infoTemplate, questionData);
    o.answer = item.from;

    //options
    _.defaults(params, { minOptionsLevel: 1, maxOptionsLevel: 5 });
    o.optionsLevel = randomDataService.getRandomInteger(params.minOptionsLevel, params.maxOptionsLevel);
    var optionVars = {
      1: { numberOfOptions: 3, optionRange: 1000 },
      2: { numberOfOptions: 4, optionRange: 400 },
      3: { numberOfOptions: 4, optionRange: 200 },
      4: { numberOfOptions: 6, optionRange: 100 },
      5: { numberOfOptions: 10, optionRange: 100 }
    };
    var optionVar = optionVars[o.optionsLevel];

    o.options = [o.answer];
    var potentialOptionIsOkay = function(potentialOption) {
      var inRange = (potentialOption >= 750 && potentialOption <= new Date().getFullYear());
      var isNew = (!_.some(o.options, function(x) { return x === potentialOption; }));
      return (inRange && isNew);
    };
    while (o.options.length < optionVar.numberOfOptions) {
      var potentialOption = String(parseInt(parseInt(o.answer, 10)+(Math.random()-0.5)*optionVar.optionRange, 10));
      if (potentialOptionIsOkay(potentialOption)) { o.options.push(potentialOption); }
    }
    o.options = _.shuffle(o.options);

    return [200, o];
  };

  var questionsResponse = function(method, url, data, headers) {
    var response = {
      "questions": { a: 'hello world' }
    };
    return [200, response];
  };

  //Note: url rule - all lower case, words separated with a hyphen
    $httpBackend.whenGET(/.html/).passThrough();
    $httpBackend.whenJSONP(/.json/).passThrough();
    $httpBackend.whenPOST('/monarchs').respond(monarchsResponse);
    $httpBackend.whenPOST('/question').respond(questionResponse);
    $httpBackend.whenPOST('/questions').respond(questionsResponse);
});
