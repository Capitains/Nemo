angular
  .module('capitainsNemo.panels')
  .directive('nemoPassage', function () {
      return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
          layout: '=',
          text: '=',
          passage: '=',
          injector : '@'
        },
        controller: function ($scope, $injector) {
          var Passage = $injector.get($scope.injector);

          $scope.first = function () {
            
            var passage = new Passage(
              $scope.text.urn,
              window.CTSAPI,
              $scope.text.inventory,
              $scope.text
            );

            passage.firstPassage().then.call(this, function() {
              $scope.passage = passage.Passage;
            });
          };

          $scope.retrieve = function () {

            var passage = new Passage(
              $scope.text.urn,
              window.CTSAPI,
              $scope.text.inventory,
              $scope.text
            );

            passage.load().then.call(this, function() {
              $scope.passage = passage.Passage;
            });
          };

          $scope.select = function() {
            $scope.retrieve();
            $scope.layout.select("page");
          }
        },
        templateUrl: 'components/capitains-nemo.panel.passage/capitains-nemo.panel.passage.html'
      };
});