'use strict';
angular.module('arethusa.morph', []);

'use strict';
/* A newable factory to handle the Morphology service
 *
 * The constructor functions takes a configuration object (that typically
 * contains a resource object for this service).
 *
 */
angular.module('arethusa.morph').factory('BspMorphRetriever', [
  'configurator',
  function (configurator) {
    function deleteUnwantedKeys(obj, keys) {
      keys.forEach(function (el) {
        delete obj[el];
      });
    }

    function flattenAttributes(form, toFlatten) {
      toFlatten.forEach(function (el) {
        var attr = form[el];
        if (attr) {
          form[el] = attr.$;
        }
      });
    }

    function renameAttributes(form, mappings) {
      if (!mappings) return;
      for (var oldName in mappings) {
        var newName = mappings[oldName];
        var val = form[oldName];
        delete form[oldName];
        form[newName] = val;
      }
    }

    function renameValues(form, mappings) {
      if (!mappings) return;
      for (var category in mappings) {
        var val = form[category];
        var actions = mappings[category];
        var actual = actions[val];
        if (actual) {
          form[category] = actual;
        }
      }
    }

    function formatLexInvData(uri) {
      if (uri) {
        return {
          uri: uri,
          urn: uri.slice(uri.indexOf('urn:'))
        };
      }
    }

    return function (conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);

      this.getWord = function (word) {
        return resource.get({ 'word': word });
      };

      this.abort = resource.abort;

      this.getData = function (string, callback) {
        self.getWord(string).then(function (res) {
          try {
            // The body can contain a single object or an array of objects.
            // Can also be undefined, in that case we will just throw an exception
            // eventually - and we will end up in catch path and just return
            // an empty array.
            var entries = arethusaUtil.toAry(res.data.RDF.Annotation.Body);
            var results = arethusaUtil.inject([], entries, function (results, el) {
                var entry = el.rest.entry;
                var lemma = entry.dict.hdwd.$;
                // We might have multiple inflections for each entry and need to wrap
                // the array vs. object problem again.
                arethusaUtil.toAry(entry.infl).forEach(function (form) {
                  // form is an object with some key/val pairs we have no use for right
                  // now - we just ditch them. The rest we take and form another object,
                  // which will wrap up the morphological attributes and contain lemma
                  // information.
                  // There are actually more than these original 3 - we might want to do
                  // this differently at some point.
                  deleteUnwantedKeys(form, [
                    'term',
                    'stemtype'
                  ]);
                  // If the form has a case attribute, it wrapped in another object we
                  // don't want and need. Flatten it to a plain expression.
                  // The same goes for part of speech.
                  flattenAttributes(form, [
                    'case',
                    'pofs'
                  ]);
                  renameAttributes(form, self.mapping.attributes);
                  renameValues(form, self.mapping.values);

                  results.push({
                    lexInvLocation: formatLexInvData(entry.uri),
                    lemma: lemma,
                    attributes: form,
                    origin: 'bsp/morpheus'
                  });
                });
              });
            callback(results);
          } catch (err) {
            return [];
          }
        });
        return [];
      };
    };
  }
]);

"use strict";

// This is a workaround for restrictions within the an accordion directive.
// An accordion-heading cannot receive a class before it's converted to a dd
// element (the foundation equivalent for an accordion-heading). We therefore
// place a class toggling directive onto a child element of it and set the class
// on the parent... Hacky, but effective.

angular.module('arethusa.morph').directive('accordionHighlighter', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var className = 'accordion-selected';

      scope.$watch('form.selected', function(newVal, oldVal) {
        if (newVal) {
          element.parent().addClass(className);
        } else {
          element.parent().removeClass(className);
        }
      });
    }
  };
});

'use strict';
angular.module('arethusa.morph').directive('formSelector', function () {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var id = scope.id;

      function action(event) {
        event.stopPropagation();
        scope.$apply(function() {
          if (scope.form.selected) {
            scope.plugin.unsetState(id);
          } else {
            scope.plugin.setState(id, scope.form);
          }
        });
        // remove focus so shortcut keys can work
        event.target.blur();
      }

      scope.$watch('form.selected', function(newVal, oldVal) {
        scope.iconClass = newVal ? 'minus' : 'plus';
        scope.title     = newVal ? 'deselect' : 'select';
      });

      element.bind('click', action);
    },
    template: '\
      <input\
        type="checkbox"\
        class="postag-selector"\
        ng-checked="form.selected">\
      </input>\
    '
  };
});

"use strict";

angular.module('arethusa.morph').directive('mirrorMorphForm', [
  'morph',
  function(morph) {
    return {
      restrict: 'A',
      scope: {
        form: '=mirrorMorphForm',
        tokenId: '='
      },
      link: function(scope, element, attrs) {
        var morphToken = morph.analyses[scope.tokenId];
        var menuId = 'mfc' + scope.tokenId;

        function newCustomForm() {
          var form = angular.copy(scope.form);

          // We might want to clean up even more here - such as the
          // lexical inventory information. Revisit later.
          delete form.origin;

          return form;
        }

        element.bind('click', function() {
          scope.$apply(function() {
            morphToken.customForm = newCustomForm();
          });
        });
      }
    };
  }
]);

'use strict';
// unused right now
angular.module('arethusa.morph').directive('morphForm', function () {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'templates/morph_form.html'
  };
});
"use strict";

angular.module('arethusa.morph').directive('morphFormAttributes', [
  'morph',
  'notifier',
  'state',
  function(morph, notifier, state) {
    return {
      restrict: 'A',
      scope: {
        form: '=morphFormAttributes',
        tokenId: '='
      },
      link: function(scope, element, attrs) {
        var id = scope.tokenId;

        scope.m = morph;
        scope.attrs = morph.sortAttributes(scope.form.attributes);
        scope.inv = scope.form.lexInv;

        scope.askForRemoval = function() {
          scope.confirmationRequested = true;
        };

        scope.skipRemoval = function() {
          scope.confirmationRequested = false;
        };

        scope.removeForm = function() {
          if (scope.form.selected) {
            morph.unsetState(id);
          }
          morph.removeForm(id, scope.form);
          notifier.success('Removed form of ' + state.asString(id));
        };
      },
      templateUrl: 'templates/arethusa.morph/morph_form_attributes.html'
    };
  }
]);

'use strict';

angular.module('arethusa.morph').directive('morphFormCreate', [
  'morph',
  'state',
  'notifier',
  'translator',
  'morphLocalStorage',
  function(morph, state, notifier, translator, morphLocalStorage) {
    return {
      restrict: 'E',
      scope: {
        token: '=morphToken',
        id: '=morphId'
      },
      link: function (scope, element, attrs, form) {
        var inArray = arethusaUtil.isIncluded;
        var lemmaForm = element.find('#lemma-form');

        scope.translations = translator({
          'morph.createSuccess': 'createSuccess',
          'morph.createError': 'createError'
        });


        scope.m = morph;
        scope.form = scope.token.customForm;
        scope.forms = scope.token.forms;

        function depdencencyMet(dependencies, type) {
          if (!dependencies) {
            return true;
          }
          var ok = true;
          for (var k in dependencies) {
            var condition;
            condition = checkAttribute(dependencies, k);
            condition = type ? condition : !condition;
            if (condition) {
              ok = false;
              break;
            }
          }
          return ok;
        }

        function checkAttribute(dependencies, attr) {
          var value = dependencies[attr];
          if (value === "*") {
            return angular.isDefined(scope.form.attributes[attr]);
          } else {
            return inArray(arethusaUtil.toAry(value), scope.form.attributes[attr]);
          }
        }

        function ifDependencyMet(dependencies) {
          return depdencencyMet(dependencies, false);
        }

        function unlessDependencyMet(dependencies) {
          return depdencencyMet(dependencies, true);
        }

        function rulesMet(rules) {
          // No rules, everything ok
          var isOk;
          if (!rules) {
            isOk = true;
          } else {
            for (var i = rules.length - 1; i >= 0; i--){
              var rule = rules[i];
              var ifDep = ifDependencyMet(rule['if']);
              var unDep = unlessDependencyMet(rule.unless);
              if (ifDep && unDep) {
                isOk = true;
                break;
              }
            }
          }
          return isOk;
        }

        function getVisibleAttributes() {
          return arethusaUtil.inject([], morph.postagSchema, function (memo, attr) {
            if (rulesMet(morph.rulesOf(attr))) {
              memo.push(attr);
            }
          });
        }

        function setVisibleAttributes() {
          scope.visibleAttributes = getVisibleAttributes();
        }

        function addLemmaHint() {
          lemmaForm.find('input').addClass('warn');
          translator('morph.lemmaHint', function(translation) {
            scope.lemmaHint = translation;
          });
        }

        function removeLemmaHint() {
          lemmaForm.find('input').removeClass('warn');
          scope.lemmaHint = '';
        }

        scope.declareOk = function() {
          removeLemmaHint();
        };

        scope.reset = function() {
          scope.resetAlert();
          addLemmaHint();
          morph.resetCustomForm(scope.token, scope.id);
        };

        scope.resetAlert = function() {
          scope.alert = false;
        };

        scope.save = function(valid) {
          if (valid) {
            cleanUpAttributes();
            addOrigin();
            addForm();
            scope.reset();
          } else {
            scope.alert = true;
          }
        };

        // At the point of saving we have undefined values around in the
        // forms attributes - we clean them up as to not distort our output
        function cleanUpAttributes() {
          var cleanAttrs = arethusaUtil.inject({}, scope.visibleAttributes, function(memo, attr) {
            memo[attr] = scope.form.attributes[attr];
          });
          scope.form.attributes = cleanAttrs;
        }

        function addOrigin() {
          scope.form.origin = 'you';
        }

        // Most of this functionality should be moved into the service!
        function addForm() {
          var newForm = angular.copy(scope.form);
          scope.forms.push(newForm);
          morph.setState(scope.id, newForm);
          morph.addToLocalStorage(scope.token.string, newForm);
          propagateToEqualTokens(newForm);
          var str = state.asString(scope.id);
          var msg = scope.translations.createSuccess({ form: str });
          notifier.success(msg);
        }

        function propagateToEqualTokens(form) {
          var str = scope.token.string;
          angular.forEach(state.tokens, function(token, id) {
            if (id !== scope.id) {
              if (token.string === str) {
                var morphForm = morph.analyses[id];
                var newForm = angular.copy(form);
                newForm.selected = false;
                morphForm.forms.push(newForm);
                if (!morph.hasSelection(morphForm)) {
                  morph.setState(id, newForm);
                }
              }
            }
          });
        }

        scope.$watch('form.attributes', function (newVal, oldVal) {
          setVisibleAttributes();
        }, true);

        scope.$watch('token.customForm', function(newVal, oldVal) {
          scope.form = newVal;
        });

        element.on('show-mfc' + scope.id, function() {
          // This hardcodes the idea of a sidepanel. Might rethink how to do this
          // at a later stage.
          var container = angular.element(document.getElementById('sidepanel'));
          // We need to scroll to the first child - the element itself is placed
          // at a completely different place in the DOM.
          container.scrollTo(element.children(), 0, 500);
        });

        addLemmaHint();
      },
      templateUrl: 'templates/morph_form_create.html'
    };
  }
]);

'use strict';
angular.module('arethusa.morph').directive('morphFormEdit', function () {
  return {
    restrict: 'E',
    templateUrl: 'templates/morph_form_edit.html'
  };
});
'use strict';
// Deprecated and not working, we don't need this anymore as we can just use the real deal.
// Kept for sudden mind changes.
angular.module('arethusa.morph').service('fakeMorphRetriever', function () {
  this.getStubData = function (callback) {
    var result;
    var request = $.ajax({
        url: './static/analyses.json',
        async: false
      });
    request.done(callback);
  };
  var stubData;
  this.getStubData(function (res) {
    stubData = res;
  });
  this.getData = function (string, callback) {
    var result = stubData[string] || [];
    callback(result);
  };
});

"use strict";

angular.module('arethusa.morph').service('LexicalInventoryRetriever', [
  'configurator',
  function(configurator) {
    function buildDictionaryLinksQuery(urn) {
      var q = '\
        select ?object from <http://data.perseus.org/ds/lexical>\
        where {' +
          '<' + urn  + '>\
          <http://purl.org/dc/terms/isReferencedBy> ?object\
        }\
      ';
      return q;
    }

    function linkProvider(link) {
      if (link.match('alpheios')) {
        return 'Alpheios';
      } else {
        if (link.match('logeion')) {
          return 'Logeion';
        } else {
          if (link.match('perseus')) {
            return 'Perseus';
          }
        }
      }
    }

    function extractLinks(data) {
      var objs = data.results.bindings;
      return arethusaUtil.inject({}, objs, function(memo, obj) {
        var link = obj.object.value;
        memo[linkProvider(link)] = link;
      });
    }

    return function(conf) {
      var resource = configurator.provideResource(conf.resource);

      this.getData = function(urn, form) {
        form.lexInv = {
          uri: form.lexInvLocation.uri,
          urn: form.lexInvLocation.urn
        };

        var query = buildDictionaryLinksQuery(urn);
        resource.get({ query: query }).then(function(res) {
          form.lexInv.dictionaries = extractLinks(res.data);
        });
      };
    };
  }
]);

'use strict';
angular.module('arethusa.morph').service('morph', [
  'state',
  'configurator',
  'plugins',
  'globalSettings',
  'keyCapture',
  'morphLocalStorage',
  'commons',
  'saver',
  'navigator',
  'exitHandler',
  function (
    state,
    configurator,
    plugins,
    globalSettings,
    keyCapture,
    morphLocalStorage,
    commons,
    saver,
    navigator,
    exitHandler
  ) {
    var self = this;
    this.name = 'morph';

    var morphRetrievers;
    var inventory;
    var searchIndex;

    // Shows a need to define the plugins name upfront - would
    // also spare a first configure round when the service is injected
    // for the first time.
    // Part of a larger change though to be done a little later.
    globalSettings.addColorizer('morph');

    this.canSearch = true;

    // When a user is moving fast between chunks, a lot of outstanding
    // requests can build up in the retrievers. As they are all asynchronous
    // their callbacks fire when we have already moved away from the chunk which
    // started the calls.
    // This can lead to quite a bit of confusion and is generally not a very
    // good solution.
    // We therefore use the new abort() API of Resource to cancel all requests
    // we don't need anymore. All morph retrievers need to provide an abort()
    // function now (usually just a delegator to Resource.abort).
    //
    // On init, we check if morphRetrievers were already defined and if they
    // are we abort all outstanding requests.
    function abortOutstandingRequests() {
      if (morphRetrievers) {
        angular.forEach(morphRetrievers, abortRetriever);
      }
    }

    function abortRetriever(retriever) {
      var fn = retriever.abort;
      if (angular.isFunction(fn)) fn();
    }


    this.defaultConf = {
      mappings: {},
      gloss: false,
      matchAll: true,
      preselect: false,
      localStorage: true,
      storePreferences: true
    };

    function configure() {
      var props = [
        'postagSchema',
        'attributes',
        'mappings',
        'noRetrieval',
        'gloss',
        'localStorage',
        'storePreferences'
      ];

      configurator.getConfAndDelegate(self, props);
      configurator.getStickyConf(self, ['preselect', 'matchAll']);

      self.analyses = {};
      morphRetrievers = configurator.getRetrievers(self.conf.retrievers);
      propagateMappings(morphRetrievers);

      if (self.localStorage) {
        morphRetrievers.localStorage = morphLocalStorage.retriever;
        morphLocalStorage.comparator = isSameForm;
      }

      // This is useful for the creation of new forms. Usually we want to
      // validate if all attributes are set properly - the inclusion of
      // special empty attributes allows to say specifically that something
      // should be left unannotated/unknown. Useful for elliptic nodes etc.
      addSpecialEmptyAttributes();

      if (self.conf.lexicalInventory) {
        inventory = configurator.getRetriever(self.conf.lexicalInventory.retriever);
      }

      colorMap = undefined;
      searchIndex = {};
    }

    var emptyAttribute = {
      long: '---',
      short: '---',
      postag: '_'
    };

    function addSpecialEmptyAttribute(attrObj, name) {
      attrObj.values['---'] = emptyAttribute;
    }

    function addSpecialEmptyAttributes() {
      angular.forEach(self.attributes, addSpecialEmptyAttribute);
    }

    function mappingFor(name) {
      // this exists so that mapping instances can refer to each
      // other through providing a string instead of an mappings
      // object.
      var mappings = self.mappings[name];
      while (angular.isString(mappings)) {
        mappings = self.mappings[name];
      }
      return mappings || {};
    }

    function propagateMapping(retriever, name) {
      retriever.mapping = mappingFor(name);
    }

    function propagateMappings(retrievers) {
      angular.forEach(retrievers, propagateMapping);
    }

    function getDataFromInventory(form) {
      if (inventory && form.lexInvLocation) {
        var urn = form.lexInvLocation.urn;
        inventory.getData(urn, form);
      }
    }

    function Forms(string) {
      this.string = string;
      this.forms  = [];
      this.analyzed = false;
    }

    function seedAnalyses() {
      return arethusaUtil.inject({}, state.tokens, function (obj, id, token) {
        obj[id] = new Forms(token.string);
      });
    }

    this.postagToAttributes = function (form) {
      var attrs = {};
      angular.forEach(form.postag, function (postagVal, i) {
        var postagClass = self.postagSchema[i];
        var possibleVals = self.attributeValues(postagClass);
        var attrObj = arethusaUtil.findObj(possibleVals, function (obj) {
            return obj.postag === postagVal;
          });
        // attrObj can be undefined when the postag is -
        if (attrObj) {
          attrs[postagClass] = attrObj.short;
        }
      });
      form.attributes = attrs;
    };

    function createEmptyPostag() {
      return arethusaUtil.map(self.postagSchema, function (el) {
        return '-';
      }).join('');
    }

    this.updatePostag = function (form, attr, val) {
      var index = self.postagSchema.indexOf(attr);
      var postag = self.postagValue(attr, val);
      form.postag = arethusaUtil.replaceAt(form.postag, index, postag);
    };

    this.attributesToPostag = function (attrs) {
      var postag = '';
      var postagArr = arethusaUtil.map(self.postagSchema, function (el) {
          var attrVals = self.attributeValues(el);
          var val = attrs[el];
          var valObj = arethusaUtil.findObj(attrVals, function (e) {
            return e.short === val || e.long === val;
          });
          return valObj ? valObj.postag : '-';
        });
      return postagArr.join('');
    };

    this.emptyForm = function(string) {
      return {
        lemma: string,
        postag: self.emptyPostag,
        attributes: emptyAttributes()
      };
    };

    function emptyAttributes() {
      return arethusaUtil.inject({}, self.postagSchema, function(memo, el) {
        memo[el] = undefined;
      });
    }

    // Gets a from the inital state - if we load an already annotated
    // template, we have to take it inside the morph plugin.
    // In the concrete use case of treebanking this would mean that
    // we have a postag value sitting there, which we have to expand.
    //
    // Once we have all information we need, the plugin also tries to
    // write back style information to the state object, e.g. to colorize
    // tokens according to their Part of Speech value.
    function getAnalysisFromState (val, id) {
      var analysis = state.tokens[id].morphology;
      // We could always have no analysis sitting in the data we are
      // looking at - no data also means that the postag is an empty
      // string or an empty postag.
      //
      // The other case we might encounter here is an object that has
      // only attributes defined, but no postag
      if (analysis) {
        var attrs = analysis.attributes;

        if (postagNotEmpty(analysis.postag)) {
          self.postagToAttributes(analysis);
        } else if (attrs) {
          analysis.postag = self.attributesToPostag(attrs);
        } else {
          return;
        }

        analysis.origin = 'document';
        analysis.selected = true;
        setGloss(id, analysis);
        val.forms.push(analysis);

        if (isColorizer()) state.addStyle(id, self.styleOf(analysis));
      }
    }

    function postagNotEmpty(postag) {
      return postag && !postag.match(/^-*$/);
    }

    function mapAttributes(attrs) {
      // We could use inject on attrs directly, but this wouldn't give us
      // the correct order of properties inside the newly built object.
      // Let's iterate over the postag schema for to guarantee it.
      // Sorting of objects is a problem we need a solution for in other
      // places as well.
      // This solution comes at a price - if we cannot find a key (not every
      // form has a tense attribute for example), we might stuff lots of undefined
      // stuff into this object. We pass over this with a conditional.
      return arethusaUtil.inject({}, self.postagSchema, function (memo, k) {
        var v = attrs[k];
        if (v) {
          var values = self.attributeValues(k);
          var obj = arethusaUtil.findObj(values, function (el) {
              return el.short === v || el.long === v;
            });
          memo[k] = obj ? obj.short : v;
        }
      });
    }

    // When we find no form even after retrieving, we need to unset
    // the token style. This is important when we move from chunk
    // to chunk, as token might still have style from a former chunk.
    // When no analysis is present, this can be very misleading.
    function unsetStyleWithoutAnalyses(forms, id) {
      if (forms.length === 0 && isColorizer()) {
        state.unsetStyle(id);
      }
    }

    // The BspMorphRetriever at times returns quite a lot of duplicate
    // forms - especially identical forms classified as coming from a
    // different dialect. We don't need this information right now, so
    // we can ignore such forms
    function makeUnique(forms) {
      return aU.unique(forms, function(a, b) {
        return a.lemma === b.lemma && a.postag === b.postag;
      });
    }

    this.getExternalAnalyses = function (analysisObj, id) {
      angular.forEach(morphRetrievers, function (retriever, name) {
        retriever.getData(analysisObj.string, function (res) {
          res.forEach(function (el) {
            // need to parse the attributes now
            el.attributes = mapAttributes(el.attributes);
            // and build a postag
            el.postag = self.attributesToPostag(el.attributes);
            // try to obtain additional info from the inventory
            getDataFromInventory(el);
          });
          var str = analysisObj.string;
          var forms = analysisObj.forms;
          mergeDuplicateForms(forms[0], res);
          var newForms = makeUnique(res);
          arethusaUtil.pushAll(forms, newForms);


          if (self.storePreferences) {
            sortByPreference(str, forms);
          }

          if (self.preselect) {
            preselectForm(forms[0], id);
          }

          unsetStyleWithoutAnalyses(forms, id);
        });
      });
    };

    function mergeDuplicateForms(firstForm, otherForms) {
      if (firstForm && firstForm.origin === 'document') {
        var duplicate;
        for (var i = otherForms.length - 1; i >= 0; i--){
          var el = otherForms[i];
          if (isSameForm(firstForm, el)) {
            duplicate = el;
            break;
          }
        }
        if (duplicate) {
          var oldSelectionState = firstForm.selected;
          angular.extend(firstForm, duplicate);
          firstForm.origin = 'document';
          firstForm.selected = oldSelectionState;
          otherForms.splice(otherForms.indexOf(duplicate), 1);
        }
      }
    }

    function isSameForm(a, b) {
      return a.lemma === b.lemma && a.postag === b.postag;
    }

    function selectedForm(id) {
      return state.getToken(id).morphology;
    }

    function preselectForm(form, id) {
      if (form && selectedForm(id) !== form) {
        state.doSilent(function() {
          self.setState(id, form);
        });
      }
    }

    function loadInitalAnalyses() {
      if (self.noRetrieval !== "all") {
        angular.forEach(self.analyses, loadToken);
      }
    }

    function loadToken(val, id) {
      getAnalysisFromState(val, id);
      if (self.noRetrieval !== "online") {
        self.getExternalAnalyses(val, id);
      } else {
        // We only need to do this when we don't
        // retrieve externally. If we do, we call
        // this function from within the request's
        // callback.
        unsetStyleWithoutAnalyses(val.forms, id);
      }
      val.analyzed = true;
      self.resetCustomForm(val, id);
    }

    self.preselectToggled = function() {
      if (self.preselect) applyPreselections();
    };

    this.hasSelection = function(analysis) {
      var hasSelection;
      for (var i = analysis.forms.length - 1; i >= 0; i--){
        if (analysis.forms[i].selected) {
          hasSelection = true;
          break;
        }
      }
      return hasSelection;
    };

    function applyPreselection(analysis, id) {
      if (analysis.forms.length > 0) {
        if (!self.hasSelection(analysis)) {
          self.setState(id, analysis.forms[0]);
        }
      }
    }

    function applyPreselections() {
      angular.forEach(self.analyses, applyPreselection);
    }

    self.resetCustomForm = function(val, id) {
      var string = state.asString(id);
      val.customForm = self.emptyForm(string);
    };

    this.currentAnalyses = function () {
      var analyses = self.analyses;
      return arethusaUtil.inject({}, state.selectedTokens, function (obj, id, val) {
        var token = analyses[id];
        if (token) {
          obj[id] = token;
        }
      });
    };

    this.selectAttribute = function (attr) {
      return self.attributes[attr] || {};
    };
    this.longAttributeName = function (attr) {
      return self.selectAttribute(attr).long;
    };
    this.attributeValues = function (attr) {
      return self.selectAttribute(attr).values || {};
    };
    this.attributeValueObj = function (attr, val) {
      return self.attributeValues(attr)[val] || {};
    };
    this.longAttributeValue = function (attr, val) {
      return self.attributeValueObj(attr, val).long;
    };
    this.abbrevAttributeValue = function (attr, val) {
      return self.attributeValueObj(attr, val).short;
    };
    this.postagValue = function (attr, val) {
      return self.attributeValueObj(attr, val).postag;
    };

    this.concatenatedAttributes = function (form) {
      var res = [];
      angular.forEach(form.attributes, function (value, key) {
        res.push(self.abbrevAttributeValue(key, value));
      });
      return res.join('.');
    };

    this.sortAttributes = function(attrs) {
      return arethusaUtil.inject([], self.postagSchema, function(memo, p) {
        var val = attrs[p];
        if (val) {
          memo.push({
            attr: p,
            val: val
          });
        }
      });
    };


    function createColorMap() {
      var keys = ['long', 'postag'];
      var maps = [];
      var map = { header: keys, maps: maps };

      angular.forEach(self.attributes, function(value, key) {
        var colors = {};
        var obj = { label: value.long, colors: colors };
        aU.inject(colors, value.values, function(memo, k, v) {
          var key = aU.flatten(aU.map(keys, v)).join(' || ');
          memo[key] = v.style;
        });
        maps.push(obj);
      });

      return map;
    }

    var colorMap;
    this.colorMap = function() {
      if (!colorMap) colorMap = createColorMap();
      return colorMap;
    };

    this.applyStyling = function() {
      angular.forEach(state.tokens, function(token, id) {
        var form = token.morphology;
        if (form) {
          state.addStyle(id, self.styleOf(form));
        } else {
          state.unsetStyle(id);
        }
      });
    };

    this.styleOf = function (form) {
      var fullStyle = {};
      angular.forEach(form.attributes, function(value, key) {
        var style = self.attributeValueObj(key, value).style;
        angular.extend(fullStyle, style);
      });
      return fullStyle;
    };

    this.removeForm = function(id, form) {
      var forms = self.analyses[id].forms;
      var i = forms.indexOf(form);
      self.removeFromLocalStorage(state.asString(id), form);
      forms.splice(i, 1);
    };

    this.addToLocalStorage = function(string, form) {
      if (self.localStorage) {
        morphLocalStorage.addForm(string, form);
      }
    };

    this.removeFromLocalStorage = function(string, form) {
      if (self.localStorage) {
        morphLocalStorage.removeForm(string, form);
      }
    };

    function deselectAll(id) {
      angular.forEach(self.analyses[id].forms, function(form, i) {
        form.selected = false;
      });
    }

    function undoFn(id) {
      var current = selectedForm(id);
      if (current) {
        return function() { self.setState(id, current); };
      } else
        return function() { self.unsetState(id); };
    }

    function preExecFn(id, form) {
      return function() {
        deleteFromIndex(id);
        addToIndex(form, id);
        deselectAll(id);
        form.selected = true;

        if (isColorizer()) state.addStyle(id, self.styleOf(form));
      };
    }

    function setGloss(id, form) {
      if (self.gloss) self.analyses[id].gloss = form.gloss;
    }

    this.updateGloss = function(id, form) {
      if (self.gloss) {
        state.broadcast('tokenChange');
        var gloss = self.analyses[id].gloss || '';
        form = form || selectedForm(id);
        form.gloss = gloss;
      }
    };

    function isColorizer() {
      return globalSettings.isColorizer('morph');
    }

    this.setState = function (id, form) {
      self.updateGloss(id);
      state.change(id, 'morphology', form, undoFn(id), preExecFn(id, form));
    };

    function unsetUndo(id) {
      var current = selectedForm(id);
      return function() {
        self.setState(id, current);
      };
    }

    function unsetPreExec(id) {
      return function() {
        deleteFromIndex(id);
        deselectAll(id);
        selectedForm(id).selected = false;

        if (isColorizer()) state.unsetStyle(id);
      };
    }

    this.unsetState = function (id) {
      state.change(id, 'morphology', null, unsetUndo(id), unsetPreExec(id));
    };

    this.rulesOf = function (attr) {
      return self.selectAttribute(attr).rules;
    };

    function findThroughOr(keywords) {
      return arethusaUtil.inject({}, keywords, function(memo, keyword) {
        var hits = searchIndex[keyword] || [];
        angular.forEach(hits, function(id, i) {
          memo[id] = true;
        });
      });
    }

    function findThroughAll(keywords) {
      // we need to fill a first array which we can check against first
      var firstKw = keywords.shift();
      var hits = searchIndex[firstKw] || [];
      angular.forEach(keywords, function(keyword, i) {
        var moreHits = searchIndex[keyword] || [];
        hits = arethusaUtil.intersect(hits, moreHits);
      });
      // and know return something with unique values
      return arethusaUtil.inject({}, hits, function(memo, id) {
        memo[id] = true;
      });
    }

    this.queryForm = function() {
      var keywords = self.formQuery.split(' ');
      // The private fns return an object and not an array, even if we only
      // need ids - but we avoid duplicate keys that way.
      var ids = self.matchAll ? findThroughAll(keywords) : findThroughOr(keywords);
      state.multiSelect(Object.keys(ids));
    };

    function loadSearchIndex() {
      angular.forEach(state.tokens, function(token, id) {
        var form = token.morphology || {};
        addToIndex(form, id);
      });
    }

    function addToIndex(form, id) {
      var attrs = form.attributes || {};
      angular.forEach(attrs, function(val, key) {
        if (!searchIndex[val]) {
          searchIndex[val] = [];
        }
        searchIndex[val].push(id);
      });
    }

    function deleteFromIndex(id) {
      var form = state.getToken(id).morphology || {};
      var attrs = form.attributes || {};
      angular.forEach(attrs, function(value, key) {
        // the index might contain duplicate ids
        var ids = searchIndex[value];
        if (ids) {
          var i = ids.indexOf(id);
          while (i !== -1) {
            ids.splice(i, 1);
            i = ids.indexOf(id);
          }
        }
      });
    }

    this.canEdit = function() {
      return self.mode === "editor";
    };

    state.on('tokenAdded', function(event, token) {
      var id = token.id;
      var forms = new Forms(token.string);
      self.analyses[id] = forms;
      token.morphology = {};
      loadToken(forms, id);
    });

    state.on('tokenRemoved', function(event, token) {
      var id = token.id;
      deleteFromIndex(id);
      delete self.analyses[id];
    });

    function guardSelection(fn) {
      if (plugins.isSelected(self)) {
        var selectionCount = state.hasClickSelections();
        if (selectionCount === 1) fn();
      }
    }

    function selectSurroundingForm(dir) {
      var id = Object.keys(state.clickedTokens)[0];
      var forms = self.analyses[id].forms;
      var currentIndex = forms.indexOf(selectedForm(id));

      var index;
      if (dir) {
        index = (currentIndex === forms.length - 1) ? 0 : currentIndex + 1;
      } else {
        index = (currentIndex === 0) ? forms.length - 1 : currentIndex - 1;
      }
      self.setState(id, forms[index]);
    }

    function selectNext() {
      guardSelection(function() {
        selectSurroundingForm(true);
      });
    }

    function selectPrev() {
      guardSelection(function() {
        selectSurroundingForm();
      });
    }

    this.activeKeys = {};
    var keys = keyCapture.initCaptures(function(kC) {
      return {
        morph: [
          kC.create('selectNextForm', function() { kC.doRepeated(selectNext); }, '↓'),
          kC.create('selectPrevForm', function() { kC.doRepeated(selectPrev); }, '↑')
        ]
      };
    });

    angular.extend(self.activeKeys, keys.selections);

    this.settings = [
      commons.setting('Expand Selected', 'expandSelection'),
      commons.setting('Store Preferences', 'storePreferences'),
      commons.setting('Preselect', 'preselect', this.preselectToggled)
    ];

    var shouldSavePreference;
    function afterSave() {
      shouldSavePreference = true;
    }

    function sortByPreference(string, forms) {
      return morphLocalStorage.sortByPreference(string, forms);
    }

    function savePreferences() {
      if (shouldSavePreference && self.storePreferences) {
        angular.forEach(state.tokens, savePreference);
        shouldSavePreference = false;
      }
    }

    function savePreference(token) {
      if (token.morphology && token.morphology.postag) {
        morphLocalStorage.addPreference(token.string, token.morphology);
      }
    }

    saver.onSuccess(afterSave);
    navigator.onMove(savePreferences);
    exitHandler.onLeave(savePreferences);

    this.init = function () {
      abortOutstandingRequests();
      configure();
      self.emptyPostag = createEmptyPostag();
      self.analyses = seedAnalyses();
      loadInitalAnalyses();
      loadSearchIndex();
      plugins.declareReady(self);
    };
  }
]);

"use strict";

angular.module('arethusa.morph').service('morphLocalStorage', [
  'plugins',
  'arethusaLocalStorage',
  '_',
  function(plugins, arethusaLocalStorage, _) {
    var PREFERENCE_DELIMITER = ';;';
    var PREFERENCE_COUNT_DELIMITER = '@@';
    var LEMMA_POSTAG_DELIMITER = '|-|';
    var self = this;

    this.localStorageKey = 'morph.forms';
    this.preferenceKey = 'morph.prefs';

    this.delimiters = {
      preference: PREFERENCE_DELIMITER,
      count: PREFERENCE_COUNT_DELIMITER,
      lemmaToPostag: LEMMA_POSTAG_DELIMITER
    };

    this.retriever = {
      getData: getData,
      abort: function() {}
    };

    this.addForm = addForm;
    this.addForms = addForms;
    this.removeForm = removeForm;

    this.addPreference = addPreference;
    this.addPreferences = addPreferences;
    this.sortByPreference = sortByPreference;

    this.getForms = getForms;
    this.getPreferences = getPreferences;

    function key(k) {
      return self.localStorageKey + '.' + k;
    }

    function preferenceKey(k) {
      return self.preferenceKey + '.' + k;
    }


    function getData(string, callback) {
      var forms = retrieve(string);
      callback(forms);
    }

    function retrieve(string) {
      return arethusaLocalStorage.get(key(string)) || [];
    }

    function retrievePreference(string) {
      return arethusaLocalStorage.get(preferenceKey(string)) || '';
    }

    function persist(string, value) {
      arethusaLocalStorage.set(key(string), value);
    }

    function persistPreference(string, value) {
      return arethusaLocalStorage.set(preferenceKey(string), value);

    }

    function addForm(string, form) {
      // Check if we already stored info about this word,
      // if not add a need array to the store
      var forms = retrieve(string) || [];

      // Store a copy and set the selected property to false!
      var newForm = angular.copy(form);
      newForm.selected = false;
      forms.push(newForm);
      persist(string, forms);
    }

    function addForms(string, newForms) {
      var forms = retrieve(string) || [];
      var keys = _.map(forms, formToKey);
      _.forEach(newForms, function(form) {
        if (!_.contains(keys, formToKey(form))) {
          forms.push(form);
        }
      });
      persist(string, forms);
    }

    function removeForm(string, form) {
      var forms = retrieve(string);
      if (forms) {
        // find element and remove it, when it's present
        var stored = aU.find(forms, function (otherForm) {
          return self.comparator(form, otherForm);
        });
        if (stored) {
          forms.splice(forms.indexOf(stored), 1);
        }
        persist(string, forms);
      }
    }

    function addPreference(string, form, additor) {
      additor = parseInt(additor) || 1;
      var key = formToKey(form);
      var counts = preferencesToCounts(string, key);
      var counter = counts[key];
      var newCount = counter ? counter + additor : 1;
      counts[key] = newCount;
      var sortedCounts = toSortedArray(counts);
      var toStore = _.map(sortedCounts, function(countArr) {
        return countArr[0] + PREFERENCE_COUNT_DELIMITER + countArr[1];
      }).join(PREFERENCE_COUNT_DELIMITER);

      persistPreference(string, toStore);
    }

    function addPreferences(string, frequencies) {
      var data = frequencies.split(PREFERENCE_DELIMITER);
      return _.forEach(data, function(datum) {
        var formAndCount = datum.split(PREFERENCE_COUNT_DELIMITER);
        var lemmaAndPostag = formAndCount[0].split(LEMMA_POSTAG_DELIMITER);
        var count = formAndCount[1];
        var lemma = lemmaAndPostag[0];
        var postag  = lemmaAndPostag[1];
        addPreference(string, { lemma: lemma, postag: postag }, count);
      });
    }

    function toSortedArray(counts) {
      return _.map(counts, function(v, k) {
        return [k, v];
      }).sort(function(a, b) {
        return a[1] < b[1];
      });
    }

    function preferencesToCounts(string) {
      var prefs = retrievePreference(string).split(PREFERENCE_DELIMITER);
      return _.inject(_.filter(prefs), function(memo, pref) {
        var parts = pref.split(PREFERENCE_COUNT_DELIMITER);
        memo[parts[0]] = parseInt(parts[1]);
        return memo;
      }, {});
    }

    // Might be better to do this in an immutable way, but it works suprisingly well
    function sortByPreference(string, forms) {
      var counts = preferencesToCounts(string);
      var selectors = _.inject(forms, function(memo, form) {
        memo[formToKey(form)] = form;
        return memo;
      }, {});

      _.forEachRight(toSortedArray(counts), function(counter) {
        var form = selectors[counter[0]];
        if (form) {
          var i = forms.splice(forms.indexOf(form), 1);
          forms.unshift(form);
        }
      });
      return forms;
    }

    function formToKey(form) {
      return form.lemma + LEMMA_POSTAG_DELIMITER + form.postag;
    }

    function getForms() {
      return collectFromStore(self.localStorageKey);
    }

    function getPreferences() {
      return collectFromStore(self.preferenceKey);
    }

    function collectFromStore(keyFragment) {
      return _.inject(arethusaLocalStorage.keys(), function(memo, key) {
        var match = key.match('^' + keyFragment + '.(.*)');
        if (match) {
          memo[match[1]] = arethusaLocalStorage.get(key);
        }
        return memo;
      }, {});
    }
  }
]);

angular.module('arethusa.morph').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.morph/context_menu.html',
    "<div>{{ plugin.concatenatedAttributes(token.morphology) }}</div>\n"
  );


  $templateCache.put('templates/arethusa.morph/morph_form_attributes.html',
    "<div class=\"small-12 columns note\">\n" +
    "  <alert\n" +
    "    class=\"error radius center fade-in\"\n" +
    "    ng-if=\"confirmationRequested\">\n" +
    "    Do you really want to remove this form?\n" +
    "    <div class=\"small-1 columns\">\n" +
    "      <i ng-click=\"removeForm()\" class=\"clickable fi-check\"></i>\n" +
    "    </div>\n" +
    "    <div class=\"small-1 columns\">\n" +
    "      <i ng-click=\"skipRemoval()\" class=\"clickable fi-x\"></i>\n" +
    "    </div>\n" +
    "  </alert>\n" +
    "\n" +
    "  <div class=\"right\">\n" +
    "    <a\n" +
    "      mirror-morph-form=\"form\"\n" +
    "      reveal-toggle=\"mfc{{ tokenId }}\"\n" +
    "      always-reveal=\"true\"\n" +
    "      token-id=\"tokenId\">\n" +
    "      Create new\n" +
    "    </a>\n" +
    "    <span>&nbsp;-&nbsp;</span>\n" +
    "    <a\n" +
    "      target=\"_blank\"\n" +
    "      href=\"http://http://www.perseus.tufts.edu/\">\n" +
    "      Report Error\n" +
    "    </a>\n" +
    "    <span>&nbsp;-&nbsp;</span>\n" +
    "    <a\n" +
    "      ng-click=\"askForRemoval()\">\n" +
    "      Remove Form\n" +
    "    </a>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"small-12 columns text\" ng-repeat=\"o in attrs\">\n" +
    "  <span class=\"small-5 columns note\">\n" +
    "    <span class=\"right\">{{ m.longAttributeName(o.attr) }}</span>\n" +
    "  </span>\n" +
    "  <span class=\"small-7 columns\"> {{ m.longAttributeValue(o.attr, o.val) }}</span>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div ng-if=\"inv\" class=\"small-12 columns\">\n" +
    "  <hr>\n" +
    "  <div>\n" +
    "    <p>\n" +
    "      <span class=\"small-8 columns\"><em>Lexical Inventory</em></span>\n" +
    "      <span class=\"small-4 columns note\">\n" +
    "        <a href=\"{{ inv.uri }}\" target=\"_blank\">{{ inv.urn }}</a>\n" +
    "      </span>\n" +
    "    </p>\n" +
    "  </div>\n" +
    "  <br>\n" +
    "  <div class=\"small-12 columns\" style=\"margin-top: 1em\">\n" +
    "    <ul class=\"text\">\n" +
    "      <li>Dictionary Entries\n" +
    "        <ul class=\"text\">\n" +
    "          <li ng-repeat=\"(name, link) in inv.dictionaries\">\n" +
    "            <a href=\"{{ link }}\" target=\"_blank\">{{ name }}</a>\n" +
    "          </li>\n" +
    "        </ul>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.morph/search.html',
    "<div class=\"row\">\n" +
    "<div class=\"small-12 columns\">\n" +
    "  <label>\n" +
    "    <span translate=\"morph.searchByForm\"/>\n" +
    "    <div class=\"row collapse\">\n" +
    "    <div class=\"small-10 columns\">\n" +
    "      <input type=\"search\"\n" +
    "        ng-change=\"plugin.queryForm()\"\n" +
    "        ng-model=\"plugin.formQuery\" />\n" +
    "    </div>\n" +
    "    <div class=\"small-2 columns\">\n" +
    "    <label class=\"postfix\">\n" +
    "      <span translate=\"morph.matchAll\"/>\n" +
    "      <input\n" +
    "        type=\"checkbox\"\n" +
    "        ng-change=\"plugin.queryForm()\"\n" +
    "        ng-model=\"plugin.matchAll\"/>\n" +
    "    </label>\n" +
    "    </div>\n" +
    "    </div>\n" +
    "  </label>\n" +
    "</div>\n" +
    "</div>\n" +
    "\n"
  );

}]);
