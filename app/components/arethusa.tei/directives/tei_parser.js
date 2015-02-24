"use strict";

angular.module('arethusa.tei').directive('teiParser', [
  '$compile',
  function($compile) {
    return {
      restrict: 'A',
      scope: {
        template    : '=teiParser',
        notebook    : '=notebook',
        layout      : '=layout'
      },
      link: function(scope, element, attrs) {
        scope.$watch('template', function(newVal, oldVal) {
          // @balmas TODO - need to confirm when we should expect
          // newVal to equal oldVal and when not
          // as currently coded anyway the watch seems only to 
          // execute when both are equal -- this came up when
          // coding the text_context directive as well
          if (newVal) {
            element.empty();
            init();
          }
        });

        var init = function() {
          var template = scope.template,
              parser,
              xmlDoc;
          /*
          Modifying the template
           */
          if(window.DOMParser) {
            parser=new DOMParser();
            xmlDoc=parser.parseFromString(template,"text/xml");
          } else {
            xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async=false;
            xmlDoc.loadXML(template); 
          }
          for (var i = xmlDoc.getElementsByTagName("note").length - 1; i >= 0; i--) {
            xmlDoc.getElementsByTagName("note")[i].setAttribute("layout", "layout")
            xmlDoc.getElementsByTagName("note")[i].setAttribute("notebook", "notebook")
            xmlDoc.getElementsByTagName("note")[i].setAttribute("identifier", i)
          };
          template = (new XMLSerializer()).serializeToString(xmlDoc); 
          element.append($compile(template)(scope));
        }
      }
    };
  }
]);
