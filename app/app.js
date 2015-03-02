'use strict';

// Declare app level module which depends on views, and components
angular
  .module('capitainsNemo', [
    'ngRoute',
    'LocalStorageModule', 

    'arethusa.core',

    'capitainsSparrow.models',
    'capitainsNemo.home',
    'capitainsNemo.utils',
    'capitainsNemo.panels',
    'capitainsNemo.square',
    'capitainsNemo.reading',
    'arethusa.tei',
    'sanitizeHTML'
  ]).
  config([
    '$routeProvider',
    'localStorageServiceProvider', 
    function($routeProvider, localStorageServiceProvider) {
      //Routes
      $routeProvider
        .otherwise({redirectTo: '/'});

      //Configurations
      localStorageServiceProvider.setPrefix('capitainsNemo');
    }
  ]);
