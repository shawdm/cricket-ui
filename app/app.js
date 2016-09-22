'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.login',
  'myApp.view1'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $routeProvider.otherwise({redirectTo: '/login'});
}]);
