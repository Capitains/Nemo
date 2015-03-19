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
          $scope.watch($scope.text, function(text, text2) {
            if(typeof text === "undefined") { 
              return true; 
            } else {
              $scope.entity = new Passage(
                text.urn,
                window.CTSAPI,
                text.inventory,
                text
              );
            }
          });
          $scope.refs = {}
          
          $scope.first = function () {

            $scope.entity.firstPassage().then.call(this, function() {
              $scope.passage = $scope.entity.Passage;
            });
          };

          $scope.level = function() {
            $scope.entity.validReffs().then(function() {
              $scope.refs = $scope.entity.container.validReffs;
            })
          }

          $scope.retrieve = function () {

            $scope.entity.load().then.call(this, function() {
              $scope.passage = $scope.entity.Passage;
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