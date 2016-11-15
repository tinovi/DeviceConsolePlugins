define([
  'angular',
  'lodash',
  './editorCtrl.js',
],
function (angular) {
  'use strict';

  var module = angular.module('grafiz.services');

  module.factory('GSMMOD1', function() {
    function GSMMOD1() {
      this.meta = {
        type: 'GSMMOD1',
        editor: 'partials/editor.html'
      };
    }

    return GSMMOD1;
  });

});
