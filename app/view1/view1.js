'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', '$http', '$q', function($scope, $http, $q) {

  var nodeRed = 'http://cricket-v2-nodered.eu-gb.mybluemix.net/';

  /*
  $scope.conversation = [{
    question: 'Who is Sachin Tendulkar?',
    answer: 'Sachin Ramesh Tendulkar is a former Indian cricketer and captain, widely regarded as one of the greatest batsmen of all time. He took up cricket at the age of eleven, made his Test debut on 15 November 1989 against Pakistan in Karachi at the age of sixteen, and went on to represent Mumbai domestically and India internationally for close to twenty-four years. He is the only player to have scored one hundred international centuries, the first batsman to score a double century in a One Day International, the holder of the record for the number of runs in both ODI and Test cricket, and the only player to complete more than 30,000 runs in international cricket.',
    from: 'DuckDuckGo',
    confidence: '100'
  }];
  */

  $scope.conversation = [];

  $scope.exampleQuestions = [
    "Who has the most balls faced?",
    "Who has the least balls faced?",
    "Who has the most runs?",
    "Who has the least runs?",
    "Who has the highest batting average?",
    "Who has the lowest batting average?",
    "Who has the least total outs?",
    "Who has the most total outs?",
    "What is JE Roots batting average?",
    "How many career matches has JE Root played?",
    "How many balls faced has JE Root had?",
    "How many runs has JE Root scored against Australia?",
    "What is JE root batting average against Australia?"
  ];
  var exampleIndex = 0;

  var setExampleQuestion = function() {
    $scope.question = $scope.exampleQuestions[exampleIndex];
  };

  var increment = function() {
    exampleIndex++;

    if (exampleIndex === $scope.exampleQuestions.length) {
      exampleIndex = 0;
    }
  };

  var decrement = function() {
    exampleIndex--;

    if (exampleIndex < 0) {
      exampleIndex = $scope.exampleQuestions.length - 1;
    }
  };

  $scope.key = function($event){
    if ($event.keyCode === 38) {
      setExampleQuestion();
      increment();
    } else if ($event.keyCode === 40) {
      setExampleQuestion();
      decrement();
    } else if ($event.keyCode === 13) {
      $scope.ask();
    }
  };

  var addQA = function(question, answer, from, confidence) {
    $scope.conversation.push({
      question: question,
      answer: answer,
      from: from,
      confidence: confidence
    });
  };

  var addFailedQA = function() {
    $scope.conversation.push({
      question: $scope.question,
      answer: 'No results'
    });
  };

  $scope.ask = function () {
    if ($scope.question && !$scope.answering) {
      $scope.answering = true;


      addQA($scope.question, false, false, false);
      //var ddg = $http.post(nodeRed + 'ddg', {question: $scope.question});
      //var dbpedia = $http.post(nodeRed + 'dbpedia', {question: $scope.question});
      var stats = $http.post(nodeRed + 'stats', {question: $scope.question});

      //var promises = [ddg, dbpedia, stats];
      var promises = [stats];

      $q.all(promises)
        .then(function(response) {
          var highestConfidence = 0;
          var result;

          response.forEach(function(r) {
            if (r.data.confidence >= highestConfidence && r.data.result !== "I don't know.") {
              result = r.data;
            }
          });

          // TODO change flow so these are kept in json
          result = JSON.parse(result.result);
          if (result && result.question && result.question.text && result.answers && result.answers.length > 0) {
            var questionText = result.question.text;
            var answerText = result.answers[0].chatty_text;
            var answerSource = result.answers[0].source.name;
            var answerConfidence = result.answers[0].answer_confidence;
            addQA(false, answerText, answerSource, answerConfidence);
          } else {
            addFailedQA();
          }
          $scope.answering = false;
        }, function(response) {

        });
    }
  };
}]);
