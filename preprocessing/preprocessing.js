'use strict';

angular.module('microvolution.preprocessing', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/preprocessing', {
            templateUrl: 'preprocessing/preprocessing.html',
            controller: 'PrepCtrl'
        });
    }])

    .controller('PrepCtrl', ['$scope', '$rootScope', '$location', '$uibModal',
        '$mdDialog', 'SessionInfoFactory', 'AccessTokenFactory', 'TokenHandler', 
        'UserPreferenceFactory', 'FolderInfoFactory', 'PreprocessFactory', '$timeout',
        function ($scope, $rootScope, $location, $uibModal,
            $mdDialog, SessionInfoFactory, AccessTokenFactory, TokenHandler, 
            UserPreferenceFactory, FolderInfoFactory, PreprocessFactory, $timeout) {

            // Gets the session data and redirects to the login screen if the user is not logged in
            SessionInfoFactory.get({}).$promise.then(function (sessionData) {
                if (sessionData.has_oauth_access_token !== "true") {
                    $location.path("/landingpage");
                    return;
                }            
                document.getElementById("myCarousel").style.display="none";
                document.getElementById("home-btn").className="menu__link";
                document.getElementById("about-btn").className="menu__link";
                document.getElementById("faq-btn").className="menu__link";
                document.getElementById("accesspolicy-btn").className="menu__link";
                document.getElementById("login").style.display="none";
                document.getElementById("logout-btn").style.display="block";
                document.getElementById("joblistmgr").style.display="block";
                document.getElementById("about-btn").style.display="none";
                document.getElementById("accesspolicy-btn").style.display="none";
                document.getElementById("joblistmgr").className="menu__link";
                document.getElementById("jobsubmitmgr").style.display="block";
                document.getElementById("jobsubmitmgr").className="menu__link";
                document.getElementById("convertermgr").style.display="block";
                document.getElementById("convertermgr").className="menu__link";
                document.getElementById("filesmanagermgr").style.display="block";
                document.getElementById("filesmanagermgr").className="menu__link";
                document.getElementById("prepmgr").style.display="block";
                document.getElementById("prepmgr").className="menu__link active";
                /**************************************************************/
                $scope.session = sessionData;
                AccessTokenFactory.get({}).$promise.then(function (tokenData) {
                    TokenHandler.set(tokenData.access_token);
                    UserPreferenceFactory.get().$promise.then(
                        function (data) {
                            if(data.hasOwnProperty("preprocessing")){
                                $scope.prepConfig = JSON.parse(data["preprocessing"]);
                            } 
                            else{
                                setConfigToDefault();
                            } //end else
                            $scope.selectedFilesGridOptions.data = $scope.prepConfig["files"];
                            if($scope.selectedFilesGridOptions.data.length > 0)
                                $timeout(function () {
                                    $scope.gridApi.selection.selectRow($scope.selectedFilesGridOptions.data[0]);
                                },
                                100);
                        }
                    );
                });
            });
            /**
            * set Config to default
            */
            var setConfigToDefault = function(){
                $scope.prepConfig = {   
                                        "files": [], 
                                        "combine": {"combine": true, "order": []},
                                        "output": ""
                                    };
            }
            /**************************************************/
            // currently selected file
            $scope.selectedItem = null;
            $scope.loading = false;
            /**************************************************/
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
                gridApi.selection.on.rowSelectionChanged($scope,function(row){
                    if(row.isSelected){
                        $scope.selectedItem = row.entity;
                    }
                });
            };

            /****************************************************/
            /** open file explorer **/
            $scope.openFilesExplorer = function(mode){
                var $ctrl = this;
                $ctrl.modalContents = {};
                $ctrl.modalContents.mode = mode;
                if($ctrl.modalContents.mode == 'selectoutput'){
                    $ctrl.modalContents.title = "Select Output Folder";
                    if($scope.prepConfig.output == null || $scope.prepConfig.output.trim()=="")
                        $ctrl.modalContents.initialPath = "/scratch";
                    else{
                        var _pathParts = $scope.prepConfig.output.split("/");
                        $ctrl.modalContents.initialPath = _pathParts.slice(0,-1).join("/");
                        $ctrl.modalContents.initialNewItem = _pathParts.slice(-1)[0];   
                    }
                }
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
                        showAlertDialog("You have not selected anything");
                        return;
                    }
                    if($ctrl.modalContents.mode === 'selectoutput'){
                        $scope.prepConfig.output = $ctrl.selected;
                    }
                    else if($ctrl.modalContents.mode === 'selectfolders'){
                        $scope.loading = true;
                        FolderInfoFactory.query({
                            'folderpath': btoa($ctrl.selected)
                        }).$promise.then(
                            function(returnData) {
                                console.log(returnData);
                                var data = returnData.commandResult;
                                if(data.length > 0){
                                    data.forEach(function (item){
                                        if(item['z'] <= 1){
                                            showAlertDialog("Invalid folder of image stack. Ignored!");
                                            return;
                                        }
                                        item['name'] = item['path'].split('/').slice(-2).join("/");
                                        item['ftype'] = 'folder';
                                        item['deskew']={
                                            'deskew': true, 
                                            'keepDeskew': true,
                                            'angle': 32.8,
                                            'threshold': item['threshold'],
                                            'suggestedThreshold': item['threshold'],
                                            'suggestedStdDev': item['stddev'],
                                            'modifyMetaData': false,
                                            'pixelUnit': item['unit'],
                                            'pixelWidth': item['pixelW'],
                                            'pixelHeight': item['pixelH'],
                                            'voxelDepth': item['pixelD']  
                                        };
                                        item['center']={
                                            'center': true, 
                                            'keepCenter': true
                                        };
                                        console.log(item);
                                        $scope.selectedFilesGridOptions.data.push(item);
                                        // add to combine
                                        if(!$scope.prepConfig.combine.order.includes(item['name']))
                                            $scope.prepConfig.combine.order.push(item['name']);
                                    });
                                    //not sure why, but this works
                                    $timeout(function () {
                                        $scope.gridApi.selection.selectRow($scope.selectedFilesGridOptions.data[0]);
                                    },
                                    100);
                                }
                                else{
                                    showAlertDialog("Failed to load " + selectedList);
                                }
                                $scope.loading = false;
                            },
                            function (error) {
                                $scope.loading = false;
                                showAlertDialog("Problem loading files:" + selectedList);
                            }
                        );
                    }
                }, function () {
                   // console.log('Modal dismissed at: ' + new Date());
                });


            }

            /****************************************************/
            /**
            * remove currently selcted
            */
            $scope.removeSelected = function() {
                $scope.gridApi.selection.getSelectedRows().forEach(function(row){
                    for(var i=0; i < $scope.selectedFilesGridOptions.data.length; i++){
                        if($scope.selectedFilesGridOptions.data[i].path === row.path){
                            $scope.selectedFilesGridOptions.data.splice(i, 1);
                            var fileName = row.path.split('/').slice(-2).join("/");
                            for(var j=0; j < $scope.prepConfig.combine.order.length; j++){
                                if($scope.prepConfig.combine.order[j] == fileName)
                                    $scope.prepConfig.combine.order.splice(j,1);
                            }
                        }
                    }
                });
                // remove combine order as well
                savePreference();
            };

            /**
            * remove all
            */
            $scope.removeAll = function() {
                $scope.selectedFilesGridOptions.data = [];
                // reset preference
                setConfigToDefault();
                // save preference
                savePreference();
            }

            /************************************************************/
            var showAlertDialog = function(message){
                $mdDialog.show(
                    $mdDialog.alert({
                        title: 'Alert', 
                        content: message,
                        ok: "Close"
                    })
                );
            }
            /***********************************************************/
            /**
            * save preference
            */
            var savePreference = function(){
                //save it
                UserPreferenceFactory.update({}, JSON.stringify(
                    {
                        "preprocessing": angular.toJson($scope.prepConfig) 
                    }));
            }


            $scope.dragControlListeners = {
                containment: '#combineOrder',//optional param.
                clone: false, //optional param for clone feature.
                allowDuplicates: false //optional param allows duplicates to be dropped.
            };

            /*****************************************************************/
            $scope.submit = function() {
                $scope.loading = true;
                $scope.prepConfig.files = $scope.selectedFilesGridOptions.data;
                savePreference();
                var submitJson = { 
                                    "usermail": $scope.session.email,
                                    "output": $scope.prepConfig.output,
                                    "prepinfo": btoa(JSON.stringify($scope.prepConfig))
                                }
                PreprocessFactory.process(submitJson)
                   .$promise.then(
                       function(data) {
                            $scope.loading = false;
                            $rootScope.$broadcast("notify", "Job submitted");
                            $location.path("/job-list");
                       },
                       function (error) {
                            $scope.loading = false;
                            showAlertDialog("Error: Problem submitting:" + error);
                       }
                   );
            };

            
        }]);




