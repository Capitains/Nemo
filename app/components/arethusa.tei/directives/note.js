"use strict";

angular.module('arethusa.tei').directive('note', [
  function() {
    return {
      restrict: 'E',
      scope: {
        notebook : '='
      },
      link: function($scope, $element, $attrs) {
        console.log($scope.notebook)
        var identifier = $element[0].innerHTML;
        $scope.showNote = function() {
          return;
        }
        //'<a ng-click="showNote()">*</a>'
      }
    };
  }
]);
