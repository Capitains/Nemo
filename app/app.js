'use strict';

// Declare app level module which depends on views, and components
angular.module('capitainsNemo', [
  'ngRoute',
  'capitainsSparrow.models',
  'capitainsNemo.home'
]).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/home'});
  }]);
