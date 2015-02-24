angular
  .module('capitainsNemo.reading')
  .directive('nemoNotes', function () {
      return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
          notebook : '=',
          layout   : "="
        },
        controller: ['$scope', function ($scope) {
          $scope.show = function() {
            return (typeof $scope.notebook !== "undefined" && $scope.notebook.length > 0)
          }
          $scope.notebookArray = [];

          $scope.$watch("notebook", function(notebook) {
            if(typeof notebook === "undefined") {
              $scope.notebookArray = [];
            } else {
              $scope.notebookArray = [].map.call(Object.keys(notebook), function(key) { return notebook[key]; });
            }
          });
          
        }],
        templateUrl: 'components/capitains-nemo.reading.notes/capitains-nemo.reading.notes.html'
      };
});