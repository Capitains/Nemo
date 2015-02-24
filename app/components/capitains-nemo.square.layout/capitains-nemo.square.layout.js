angular
  .module('capitainsNemo.square')
  .directive('nemoSquareLayout', function () {
      return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
          layout   : '=',
          target   : '=',
          icon     : '=',
          label    : '=',
          apply    : '=' 
        },
        controller: function ($scope) {
          $scope.select = function(div) {
            var fn;
            if(typeof $scope.apply === "undefined") {
              fn = $scope.layout.select;
            } else {
              fn = $scope.apply;
            }
            fn.call($scope.layout, div);
          }
        },
        templateUrl: 'components/capitains-nemo.square.layout/capitains-nemo.square.layout.html'
      };
});