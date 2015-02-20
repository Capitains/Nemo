angular
  .module('capitainsNemo.square')
  .directive('nemoSquareInfo', function () {
      return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
          passage   : '=',
        },
        controller: function ($scope) {
          $scope.expanded = false;
          $scope.expand = function() {
            $scope.expanded = !$scope.expanded;
          }
        },
        templateUrl: 'components/capitains-nemo.square.info/capitains-nemo.square.info.html'
      };
});