'use strict';

// Declare app level module which depends on views, and components
angular.module('capitainsNemo', [
  'ngRoute',
  'capitainsSparrow.models',
  'capitainsNemo.home',
  'capitainsNemo.panel-passage',
  'capitainsNemo.panel-browse'
]).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/home'});
  }]);
