"use strict";

angular.module('arethusa.tei').directive('note', [
  function() {
    return {
      restrict: 'E',
      scope: {
        notebook   : '=',
        identifier : '='
      },
      controller: function($scope, $element, $attrs) {
        $scope.showNote = function(status) {
          $scope.notebook[$scope.identifier].focus = status;
        }
      },
      template : '<a class=\"tei-note\" ng-mouseenter="showNote(true)" ng-mouseleave="showNote(false)">●</a>'
    };
  }
]);
