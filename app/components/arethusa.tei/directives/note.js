"use strict";

angular.module('arethusa.tei').directive('note', [
  function() {
    return {
      restrict: 'E',
      scope: {
        notebook   : '=',
        identifier : '=',
        layout     : '='
      },
      controller: function($scope, $element, $attrs) {
        $scope.showNote = function() {
          $scope.notebook[$scope.identifier].focus = !$scope.notebook[$scope.identifier].focus;
          $scope.layout.select("notes");
        }
      },
      template : '<a class=\"tei-note\" ng-click="showNote()"> [{{identifier + 1}}] </a>'
    };
  }
]);
