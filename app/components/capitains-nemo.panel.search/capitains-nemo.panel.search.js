angular
  .module('capitainsNemo.panels')
  .directive('nemoSearch', function () {
      return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
          layout: '=',
          texts: '=',
          target: '='
        },
        controller: ['$scope', '$q',function ($scope, $q) {

          if(typeof $scope.layout.categories.search === "undefined") {
            $scope.layout.categories.search = false;
          }
          $scope.query = "";
          $scope.index = {};
          $scope.engine = null;


          var indexing = function() {
            $scope.engine = new Bloodhound({
              local: $scope.texts,
              datumTokenizer: function(d) {
                return Bloodhound.tokenizers.whitespace(d.fulltext);
              },
              queryTokenizer: Bloodhound.tokenizers.whitespace
            });
            return $scope.engine.initialize();
          }
          /**
           * Placeholder function ulti
           * @return {[type]} [description]
           */
          $scope.search = function() {
            if(Object.keys($scope.texts).length === 0) {
              return [];
            }
            if($scope.engine === null) {
              indexing().then(function() {
                $scope.search = search;
                $scope.loading = false;
                console.log($scope.engine)
                $scope.search();
              });
            }
          }
          var search = function() {
            var results = [];
            if(Object.keys($scope.texts).length === 0) {
              return [];
            }
            if($scope.query.length >= 3) {
              $scope.engine.get($scope.query, function(suggestions) {
                results = suggestions;
              });
            }
            return results;
          }
          $scope.select = function(object) {
            $scope.target = object;
            $scope.layout.select('passages');
          }
          $scope.loading = true;
        }],
        templateUrl: 'components/capitains-nemo.panel.search/capitains-nemo.panel.search.html'
      };
});