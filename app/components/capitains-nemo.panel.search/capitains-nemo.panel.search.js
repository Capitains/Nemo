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
          console.log($q)
          if(typeof $scope.layout.categories.search === "undefined") {
            $scope.layout.categories.search = false;
          }
          $scope.query = "";
          $scope.index = {};
          $scope.lunr = null;

          var indexing = function() {
            var deferred = $q.defer();
            (function() {
              $scope.lunr = lunr(function () {
                this.field('title', {boost: 10})
                this.field('lang', {boost: 1})
                this.field('author', {boost: 10})
                this.ref('urn')
              })
              angular.forEach($scope.texts, function(text) {
                text.title = text.getTitle();
                $scope.lunr.add(text);
                $scope.index[text.urn] = text;
              });
              deferred.resolve();
            })();
            return deferred.promise;
          }
          /**
           * Placeholder function ulti
           * @return {[type]} [description]
           */
          $scope.search = function() {
            if($scope.texts.length === 0) {
              return [];
            }
            if($scope.lunr === null) {
              indexing().then(function() {
              $scope.search = search;
              $scope.loading = false;
              $scope.search();
            });
            }
          }
          var search = function() {
            var results = [];
            if($scope.texts.length === 0) {
              return [];
            }
            if($scope.lunr === null) {
              indexing();
            }
            if($scope.query.length > 3) {
              $scope.lunr.search($scope.query).forEach(function(ref) {
                results.push($scope.index[ref.ref])
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