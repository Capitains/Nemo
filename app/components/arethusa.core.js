"use strict";

angular.module('arethusa.core', [
  'ngResource',
  'ngCookies',
  'LocalStorageModule'
])
.value('BASE_PATH', '..')
.constant('_', window._);