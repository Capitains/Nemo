angular.module('capitainsNemo.utils', [])
  .factory('Layout', ['$q', function($q) {
    var Layout =  function() {
      this.categories = {};
      this.menu = false;
      /**
       * For a given categories, checks if this has to be shown
       * @param   {string}  div Category
       * @returns {Boolean}     [description]
       */
      this.isSelected = function(div) {
        if(typeof this.categories[div] === "undefined") { this.categories[div] = false; }
        return (this.categories[div] === true) ? true : false;
      }
      /**
       * Select a category to show
       * @param   {string}  div Category
       * @return {[type]}     [description]
       */
      this.select = function(div) {
        var $this = this;

        this.menu = (div !== "page");
        angular.forEach(this.categories, function(value, key) {
          $this.categories[key] = (div === key);
        });
      }
      this.toggle = function(div) {
        var $this = this;

        angular.forEach(this.categories, function(value, key) {
          $this.categories[key] = (key === div) ? !$this.categories[key] : false;
        });
        if(div !== "page") {
          this.menu = this.categories[div];
        }
      }
    }
    return Layout;
  }]);
