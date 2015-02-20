'use strict';

// Declare app level module which depends on views, and components
angular.module('capitainsNemo', [
  'ngRoute',
  'capitainsSparrow.models',
  'capitainsNemo.home',
  'capitainsNemo.utils',
  'capitainsNemo.panels',
  'capitainsNemo.square',
  'arethusa.tei'
]).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .otherwise({redirectTo: '/'});
  }]);
