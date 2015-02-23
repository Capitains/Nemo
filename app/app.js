'use strict';

// Declare app level module which depends on views, and components
angular.module('capitainsNemo', [
  'ngRoute',
  'capitainsSparrow.models',
  'capitainsNemo.home',
  'capitainsNemo.utils',
  'capitainsNemo.panels',
  'capitainsNemo.square',
  'capitainsNemo.reading',
  'arethusa.tei',
  'sanitizeHTML'
]).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .otherwise({redirectTo: '/'});
  }]);
