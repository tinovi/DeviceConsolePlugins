define([
  'angular',
  'lodash',
  './editorCtrl.js',
],
function (angular) {
  'use strict';

  var module = angular.module('grafiz.services');

  module.factory('WIFITE1', function() {
    function WIFITE1() {
      this.meta = {
        type: 'WIFITE1',
        editor: 'partials/editor.html'
      };
    }

    return WIFITE1;
  });

});
