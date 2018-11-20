'use strict';

angular
  .module('microvolution.filesexplorer')
  .component('filesExplorer', {
    templateUrl: 'filesexplorer/filesexplorer.tmpl.html',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
    controller: function () {
      var $ctrl = this;

      $ctrl.$onInit = function () {
        $ctrl.modalContents = $ctrl.resolve.modalContents;
        $ctrl.selected = "";
      };

      $ctrl.ok = function () {
        $ctrl.close({$value: $ctrl.selected});
      };

      $ctrl.cancel = function () {
        $ctrl.dismiss({$value: 'cancel'});
      };
    }//end ontroller
  })