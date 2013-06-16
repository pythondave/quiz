app.value('config', function() {
  var o = {};

  o.requests = {
    postConfig: { "headers": { "Content-Type": "application/x-www-form-urlencoded" } }
  };
  o.requests.urls = {
    monarchs: '/monarchs',
    question: '/question'
  };
  return o;
}());