angular
  .module('capitainsNemo.panel-passage', [])
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
          var Repository = $injector.get($scope.injector);

          $scope.retrieve = function () {
            var urn = $scope.text.urn;
            var start = [], end = [];
            //We construct the urn passage
            for (var i = 0; i <= $scope.text.start.length - 1; i++) {
              if(typeof $scope.text.start[i] === "undefined" || $scope.text.start[i] === "") {
                break;
              }
              start.push($scope.text.start[i])
            };
            for (var i = 0; i <= start.length - 1; i++) {
              if(typeof $scope.text.end[i] === "undefined" || $scope.text.end[i] === "") {
                break;
              }
              end.push($scope.text.end[i])
            };
            var urn = urn + ":" + start.join(".") + "-" + end.join(".");

            var passage = Repository.passage(
              urn,
              "http://localhost:8080/exist/rest/db/xq/CTS.xq?",
              $scope.text.inventory
            );

            passage.load().then.call(this, function() {
              $scope.passage = passage.Passage;
              $scope.passage.source = $scope.text;
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