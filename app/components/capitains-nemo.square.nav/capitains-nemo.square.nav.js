angular
  .module('capitainsNemo.square')
  .directive('nemoSquareNav', function () {
      return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
          passage   : '=',
          direction : '=',
          injector  : '@'
        },
        controller: function ($scope, $injector) {
          var Passage = $injector.get($scope.injector);

          $scope.directionIcon = ($scope.direction === "next") ? "glyphicon-chevron-right" : "glyphicon-chevron-left";
          $scope.directionLang = ($scope.direction === "next") ? "Next" : "Previous";
          $scope.go = function () {
            $scope.text = $scope.passage.source;
            var urn = $scope.passage[$scope.direction];

            var passage = new Passage(
              urn,
              window.CTSAPI,
              $scope.text.inventory,
              $scope.text
            );
            passage.Passage.prev = $scope.passage.urn;

            passage.load().then.call(this, function() {
              $scope.passage = passage.Passage;
            });
          };
        },
        templateUrl: 'components/capitains-nemo.square.nav/capitains-nemo.square.nav.html'
      };
});