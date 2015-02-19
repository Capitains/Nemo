angular
  .module('capitainsNemo.panel-browse', [])
  .directive('nemoBrowse', function () {
      return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
          layout   : '=',
          current  : '=',
          next     : '=',
          icon     : '=',
          label    : '=',
          nextstep : '='
        },
        controller: function ($scope) {
          $scope.select = function(object) {
            $scope.next = (typeof object.children === "undefined") ? object : object.children;
            $scope.layout.select($scope.nextstep)
          }
          $scope.deactivated = function() {
            return ($scope.layout.isSelected(label)) ? "deactivated" : "";
          }
        },
        templateUrl: 'components/capitains-nemo.panel.browse/capitains-nemo.panel.browse.html'
      };
});