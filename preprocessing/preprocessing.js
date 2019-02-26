'use strict';

angular.module('microvolution.preprocessing', ['ngRoute', 'ngResource'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/preprocessing', {
            templateUrl: 'preprocessing/preprocessing.html',
            controller: 'PrepCtrl'
        });
    }])

    .controller('PrepCtrl', ['$scope', '$rootScope', '$interval', '$location', 
        'SessionInfoFactory', 'AccessTokenFactory', 'TokenHandler', 'UserPreferenceFactory',
        function ($scope, $rootScope, $interval, $location, 
            SessionInfoFactory, AccessTokenFactory, TokenHandler, UserPreferenceFactory) {

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
                          return row.entity.name;
                        }, 
                      allowCellFocus : false
                    }
                ];
               
                $scope.selectedFilesGridOptions.onRegisterApi = function( gridApi ) {
                    $scope.gridApi = gridApi;
                    gridApi.selection.on.rowSelectionChanged($scope,function(row){
                        console.log("row selection changed");
                        if(row.isSelected){
                            $scope.selectedItem = row.entity;
                        }
                    });
                };

                // currently selected file
                $scope.selectedItem = null;

                /**************************************************************/
                AccessTokenFactory.get({}).$promise.then(function (tokenData) {
                    TokenHandler.set(tokenData.access_token);
                    UserPreferenceFactory.get().$promise.then(
                        function (data) {
                            if(data.hasOwnProperty("preprocessing")){
                                var prefData = data["preprocessing"];
                                if(prefData.hasOwnProperty("combine")){
                                    $scope.combine = JSON.parse(prefData["combine"]);
                                }
                                if(prefData.hasOwnProperty("files")){
                                    $scope.selectedFilesGridOptions.data = JSON.parse(prefData["files"]);
                                }
                            } 
                            else{
                                setConfigToDefault();
                            } //end else
                        }
                    );
                });

                /**
                * set Config to default
                */
                var setConfigToDefault = function(){
                    $scope.combine = {"combine": "true", "order": []};
                    $scope.selectedFilesGridOptions.data = [];
                }

                
                /****************************************************/
                /** open file explorer **/
                $scope.openFilesExplorer = function(mode){
                }

                /****************************************************/
                /**
                * remove currently selcted
                */
                $scope.removeSelected = function() {
                    $scope.gridApi.selection.getSelectedRows().forEach(function(row){
                        for(var i=0; i < $scope.selectedFilesGridOptions.data.length; i++){
                            if($scope.selectedFilesGridOptions.data[i].path === row.path)
                                $scope.selectedFilesGridOptions.data.splice(i, 1);
                        }
                    });
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

                /***********************************************************/
                /**
                * save preference
                */
                var savePreference = function(){
                    //save it
                    var savedData = {"preprocessing": {
                                            "combine": angular.toJson($scope.combine), 
                                            "files": angular.toJson($scope.selectedFilesGridOptions.data)
                                        }
                                    };
                    UserPreferenceFactory.update({}, JSON.stringify(savedData));
                }

                




                 
            });

            
        }]);




