angular
  .module('capitainsNemo.reading')
  .directive('nemoNotes', function () {
      return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
          notebook: '=',
        },
        controller: ['$scope', function ($scope) {
          console.log($scope.notebook);
          $scope.show = function() {
            return (typeof $scope.notebook !== "undefined" && $scope.notebook.length > 0)
          }
        }],
        templateUrl: 'components/capitains-nemo.reading.notes/capitains-nemo.reading.notes.html'
      };
});