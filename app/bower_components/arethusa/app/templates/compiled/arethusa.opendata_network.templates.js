angular.module('arethusa.opendataNetwork').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.opendata_network/graph_setting.html',
    "<span>\n" +
    "  <span class=\"note\">{{ title }}</span>\n" +
    "  <input style=\"display: inline; height: 1.2rem; width: 3rem; padding:0rem; font-size:0.6rem; margin:0;\" type=\"text\" ng-model=\"inputVal\"/> \n" +
    "  <span class=\"note\" ng-click=\"save()\"><i class=\"fa fa-save\"></i></span>\n" +
    "</span>\n" +
    "\n"
  );


  $templateCache.put('templates/arethusa.opendata_network/opendata_network.html',
    "<div class=\"tree-canvas\">\n" +
    "  <div class=\"tree-settings\">\n" +
    "    <span token-selector=\"state.tokens\"></span>\n" +
    "  </div>\n" +
    "  <div\n" +
    "    open-data-graph\n" +
    "    conf=\"plugin.conf\"\n" +
    "    tokens=\"state.tokens\"\n" +
    "    to-bottom\n" +
    "  >\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.opendata_network/opendata_settings.html',
    "<span\n" +
    "  title=\"Zoom Out\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"graphZoom(0.9)\">\n" +
    "  <i class=\"fa fa-search-minus\"></i>\n" +
    "</span><span\n" +
    "  title=\"Zoom In\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"graphZoom(1.1)\">\n" +
    "  <i class=\"fa fa-search-plus\"></i>\n" +
    "</span><span\n" +
    "  title=\"Original Zoom\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"graphZoom()\">\n" +
    "  <i class=\"fa fa-search\"></i>\n" +
    "</span><span\n" +
    "  title=\"Move\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  jqyoui-draggable=\"{onDrag:'draggingGraph()'}\">\n" +
    "  <i class=\"fa fa-arrows\"></i>\n" +
    "</span><span\n" +
    "  title=\"Move to left\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"graphMove(-20, 0)\">\n" +
    "  <i class=\"fa fa-arrow-circle-left\"></i>\n" +
    "</span><span\n" +
    "  title=\"Move to left\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"graphMove(20, 0)\">\n" +
    "  <i class=\"fa fa-arrow-circle-right\"></i>\n" +
    "</span><span\n" +
    "  title=\"Move to left\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"graphMove(0, 20)\">\n" +
    "  <i class=\"fa fa-arrow-circle-up\"></i>\n" +
    "</span><span\n" +
    "  title=\"Move to left\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"graphMove(0, -20)\">\n" +
    "  <i class=\"fa fa-arrow-circle-down\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"Centrer l'arbre\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"graphMove()\">\n" +
    "  <i class=\"fa fa-dot-circle-o\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"Pause\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"forceToggle()\">\n" +
    "  <i class=\"fa\" ng-class=\"{'fa-pause':D3Params.running, 'fa-play':D3Params.running===false}\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"{{ translations.focusSel() }} {{ keyHints.focusSelection}}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"focusSelection()\">\n" +
    "  <i class=\"fi-target-two rotate-on-hover\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"{{ translations.focusSel() }} {{ keyHints.focusSelection}}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"toggleLabels()\">\n" +
    "  <i class=\"fa\" ng-class=\"{'fa-eye':!D3Params.displayLabels,'fa-eye-slash':D3Params.displayLabels}\"></i>\n" +
    "</span>\n" +
    "<span ng-click=\"advancedSettings = !advancedSettings\"><i class=\"fa fa-gear rotate-on-hover\"></i></span>\n" +
    "<div ng-show=\"advancedSettings\">\n" +
    "  <div class=\"right\" style=\"text-align: right;\">\n" +
    "    <div><span graph-setting is-int=\"true\" value=\"D3Params.charge\" title=\"Charge\"></span></div>\n" +
    "    <div><span graph-setting is-int=\"true\" value=\"D3Params.linkDistance\" title=\"Link Distance\"></span></div>\n" +
    "  </div>\n" +
    "</div>"
  );

}]);
