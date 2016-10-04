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
  $('.bbc-ask-question input').focus();

  $scope.glued = true;
  $scope.conversation = [];

  $scope.exampleQuestions = [
    "",
    "Who has scored the most runs?",
    "Who has scored the least runs?",
    "How many matches has Joe Root played against New Zealand?",
    "Who has the highest batting average?",
    "Who has the faced the most balls?",
    "What is Joe Root's batting average?",
    "How many career matches has Sachin Tendulkar played?",
    "What is Andrew Strauss's batting average against New Zealand?",
    "Which Englishman has the highest batting average?",
    "Which Indian has the lowest batting average?"
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
      question: false,
      answer: 'No results'
    });
  };

  $scope.ask = function () {
    if ($scope.question && !$scope.answering) {
      $scope.answering = true;


      addQA($scope.question, false, false, false);

      // clear text
      $scope.question = '';

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
