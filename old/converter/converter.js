'use strict';

angular.module('microvolution.converter', ['ngRoute', 'ngResource'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/converter', {
            templateUrl: 'converter/converter.html',
            controller: 'ConverterCtrl'
        });
    }])

    .controller('ConverterCtrl', ['$scope', '$location',
        '$uibModal', 'ConverterFactory', 'UserPreferenceFactory',
        function ($scope, $location,
            $uibModal, ConverterFactory, UserPreferenceFactory) {
            
            
            // Gets the session data and redirects to the login screen if the user is not logged in
            $scope.checkSession(function(){
                console.log("checkig session...");
		        document.getElementById("home-btn").className="menu__link";
                document.getElementById("contact-btn").className="menu__link";
                document.getElementById("faq-btn").className="menu__link";
                document.getElementById("login").style.display="none";
                document.getElementById("logout-btn").style.display="block";
                document.getElementById("joblistmgr").style.display="block";
                document.getElementById("contact-btn").style.display="none";
                document.getElementById("joblistmgr").className="menu__link";
                document.getElementById("jobsubmitmgr").style.display="block";
                document.getElementById("jobsubmitmgr").className="menu__link";
                document.getElementById("convertermgr").style.display="block";
                document.getElementById("convertermgr").className="menu__link active";
                document.getElementById("filesmanagermgr").style.display="block";
                document.getElementById("filesmanagermgr").className="menu__link";
                document.getElementById("prepmgr").style.display="block";
                document.getElementById("prepmgr").className="menu__link";
                UserPreferenceFactory.get().$promise.then(
                    function (data) {
                        if(data.hasOwnProperty("converter")){
                            var prefData = data["converter"];
                            if(prefData.hasOwnProperty("preference")){
                                $scope.convertOptions = JSON.parse(prefData["preference"]);
                                // make sure mode is set properlly
                                if(!$scope.convertOptions.hasOwnProperty("mode") ||
                                         $scope.convertOptions == ''){
                                    $scope.convertOptions.mode = 'file';
                                }
                            }
                            if(prefData.hasOwnProperty("files")){
                                $scope.selectedFilesGridOptions.data = JSON.parse(prefData["files"]);
                            }
                            //console.log($scope.convertOptions);
                        } 
                        else{
                            setOptionsToDefault();
                        } //end else
                    }
                );
            });

            $scope.methods = [
                {'label': 'Bigload', 'value': 'bigload'},
                {'label': 'Chunked', 'value': 'chunked'},
                {'label': 'Hyperslab', 'value': 'hyperslab'}];

            $scope.methodDescriptions = {
                'bigload': 'This method loads all the contiguous channels into memory, interleave them, then dump to disk.',
                'chunked': 'For each chunk of dimension (Z, Y, X) in each source channel, interleave into the destination.',
                'hyperslab': 'For each z-stack, read a single channel, interleave it, then write to disk.'
            };
            $scope.loading = false;
            /**  selected files table **/
            $scope.selectedFilesGridOptions = {
                enableRowSelection: true,
                enableRowHeaderSelection: false,
                enableSelectAll: false,
                multiSelect: false,
                noUnselect: true,
                showGridFooter: false,
                data: []
            };

            $scope.selectedFilesGridOptions.columnDefs = [
                { name: 'name', 
                  displayName: 'Name',
                  cellTooltip: 
                    function( row, col ) {
                      return row.entity.path;
                    }, 
                  allowCellFocus : false
                }
            ];

            $scope.selectedFilesGridOptions.onRegisterApi = function( gridApi ) {
                $scope.gridApi = gridApi;
            };

            $scope.removeSelected = function() {
                $scope.gridApi.selection.getSelectedRows().forEach(function(row){
                    for(var i=0; i < $scope.selectedFilesGridOptions.data.length; i++){
                        if($scope.selectedFilesGridOptions.data[i].path === row.path)
                            $scope.selectedFilesGridOptions.data.splice(i, 1);
                    }
                });
                saveOptions();
            };

            /**
            * remove all
            */
            $scope.removeAll = function() {
                $scope.selectedFilesGridOptions.data = [];
                // reset preference
                setOptionsToDefault();
                // save preference
                saveOptions();
            };

            $scope.methodChanged = function(){
                $scope.methodDescription = $scope.methodDescriptions[$scope.convertOptions.method.value];
            };

            var setOptionsToDefault = function(){
                $scope.convertOptions = {
                    'output': '',
                    'prefix': '',
                    'method': $scope.methods[0],
                    'mode': 'files'
                };
            };
            /**
            * save preference
            */
            var saveOptions = function(){
                //save it
                var savedData = {"converter": {
                                        "preference": angular.toJson($scope.convertOptions), 
                                        "files": angular.toJson($scope.selectedFilesGridOptions.data)
                                        }
                                };
                UserPreferenceFactory.update({}, angular.toJson(savedData));
            };

            var getConvertingOptions = function(){
                var fileList = [];
                $scope.selectedFilesGridOptions.data.forEach(function(item){
                    fileList.push(item.path);
                });
                var options = {
                    'output': $scope.convertOptions.output,
                    'prefix': '',
                    'method': $scope.methods[0].value, // always bigload
                    'files': btoa(fileList.join(":"))                  
                };
                return options;
            }

            $scope.submit = function() {
                $scope.loading = true;
                saveOptions();
                var convertingOptions = getConvertingOptions();
                convertingOptions["usermail"] = $scope.session.email;
                ConverterFactory.query(convertingOptions)
                   .$promise.then(
                       function(data) {
                            $scope.loading = false;
                            $scope.broadcastMessage("Job submitted");
                            $location.path("/job-list");
                       },
                       function (error) {
                            $scope.loading = false;
                            $scope.showAlertDialog("Error: Problem submitting:" + error);
                       }
                   );
            };


            /*************************open file explroer*****************************************/
            $scope.openFilesExplorer = function(mode){
                var $ctrl = this;
                $ctrl.modalContents = {};
                $ctrl.modalContents.mode = mode;
                $ctrl.modalContents.extension = "ims";
                $ctrl.modalContents.source = 'converter';
                var modalInstance = $uibModal.open({
                    animation: false,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'filesexplorer/filesexplorer.tmpl.html',
                    controller: 'ModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    size: 'lg',
                    appendTo: null,
                    scope: $scope,
                    preserveScope: true,
                    resolve: {
                      modalContents: function () {
                        return $ctrl.modalContents;
                      }
                    }
                  });
                /**** process the answer ****/
                modalInstance.result.then(function (selected) {
                    $ctrl.selected = selected;
                    if($ctrl.selected==null || $ctrl.selected==""){
                        $scope.showAlertDialog("You have not selected anything");
                        return;
                    }
                    if($ctrl.modalContents.mode === 'selectoutput'){
                        $scope.convertOptions.output = $ctrl.selected;
                        $scope.output = $ctrl.selected;
                    }
                    else if($ctrl.modalContents.mode === 'selectfiles'){
                        if($scope.convertOptions.mode !=='files'){
                            $scope.convertOptions.mode = 'files';
                            $scope.selectedFilesGridOptions.data= [];
                        }
                        $ctrl.selected.forEach(function(item){
                            var isNew = true;
                            for(var i=0; i < $scope.selectedFilesGridOptions.data.length; i++){
                                if($scope.selectedFilesGridOptions.data[i].path === item.path)
                                    isNew = false;
                            }
                            if(isNew){
                                $scope.selectedFilesGridOptions.data.push(item);
                            }
                        });
                    }
                    else if($ctrl.modalContents.mode === 'selectfolders'){
                        $scope.selectedFilesGridOptions.data = [];
                        $scope.convertOptions.mode ='folder';
                        $scope.selectedFilesGridOptions.data.push(
                            {'name': $ctrl.selected, 'path': $ctrl.selected}
                        );
                    }
                    
                }, function () {
                  console.log('Modal dismissed at: ' + new Date());
                });
            };
        }]);




