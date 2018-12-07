'use strict';

angular.module('microvolution.job-submit', ['ngRoute', 'ngResource', 'ngMaterial', 'ui.grid', 'ui.grid.selection', 
                                            'microvolution.filesexplorer', 'microvolution.services'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/job-submit', {
            templateUrl: 'job-submit/job-submit.html',
            controller: 'JobSubmitCtrl'
        });
    }])

    .controller('JobSubmitCtrl', ['$scope', '$rootScope', '$location', '$uibModal', '$timeout',
            'SessionInfoFactory', 'AccessTokenFactory', 'TokenHandler', 'ExecuteJobFactory', 
            'TestExecuteJobFactory', 'FilesInfoFactory', 'FolderInfoFactory', 'SaveTemplateFactory', 
            'LoadTemplateFactory', 'FileInfoFactory', 'UserPreferenceFactory', '$mdDialog',

        function ($scope, $rootScope, $location, $uibModal, $timeout, 
            SessionInfoFactory, AccessTokenFactory, TokenHandler, ExecuteJobFactory, 
            TestExecuteJobFactory, FilesInfoFactory, FolderInfoFactory, SaveTemplateFactory, 
            LoadTemplateFactory, FileInfoFactory, UserPreferenceFactory, $mdDialog) 
        {
            
            //loading
            $scope.loading = false;
            
            // Gets the session data and redirects to the login screen if the user is not logged in
            SessionInfoFactory.get({}).$promise.then(function (sessionData) {
                if (sessionData.has_oauth_access_token !== "true") {
                    $location.path("/langingpage");
                    return;
                }
                document.getElementById("myCarousel").style.display="none";
                document.getElementById("home-btn").className="menu__link";
                document.getElementById("about-btn").className="menu__link";
                document.getElementById("about-btn").className="menu__link";
                document.getElementById("contact-btn").className="menu__link";
                document.getElementById("accesspolicy-btn").className="menu__link";
                document.getElementById("login").style.display="none";
                document.getElementById("about-btn").style.display="none";
                document.getElementById("contact-btn").style.display="none";
                document.getElementById("accesspolicy-btn").style.display="none";
                document.getElementById("logout-btn").style.display="block";
                document.getElementById("joblistmgr").style.display="block";
                document.getElementById("joblistmgr").className="menu__link";
                document.getElementById("jobsubmitmgr").style.display="block";
                document.getElementById("jobsubmitmgr").className="menu__link active";
                document.getElementById("convertermgr").style.display="block";
                document.getElementById("convertermgr").className="menu__link";

                $scope.session = sessionData;
                AccessTokenFactory.get({}).$promise.then(function (tokenData) {
                    TokenHandler.set(tokenData.access_token);
                    UserPreferenceFactory.get().$promise.then(
                        function (data) {
                            if(data.hasOwnProperty("pref")){
                                var prefData = data["pref"];
                                if(prefData.hasOwnProperty("preference")){
                                    $scope.preference = JSON.parse(prefData["preference"]);
                                }
                                if(prefData.hasOwnProperty("files")){
                                    $scope.selectedFilesGridOptions.data = JSON.parse(prefData["files"]);
                                }
                            } 
                            else{
                                setPreferenceToDefault();
                            } //end else
                        }
                    );
                });
            });

            
            // selected file
            $scope.selectedItem = null;
    
            ////// for selection
            // Objective IMmersion Refactive Index presets
            $scope.riPresets = [
                {'label': 'Presets', 'value': -1},
                {'label': 'Air', 'value': 1},
                {'label': 'Water', 'value': 1.33},
                {'label': 'Oil, type A', 'value': 1.515},
                {'label': 'Oil, type F/N', 'value': 1.518},
                {'label': '80% Glycerol', 'value': 1.45},
                {'label': 'Silicone', 'value': 1.41}
            ];
            $scope.riPresetChanged = function(){
                if($scope.preference.riPresetSelected.value > 0) 
                    $scope.preference.RI = $scope.preference.riPresetSelected.value;
            };
            // Sample Medium Refactive Index presets
            $scope.nsPresets = [
                {'label': 'Presets', 'value': -1},
                {'label': 'Water', 'value': 1.33},
                {'label': 'Vectashield', 'value': 1.46},
                {'label': 'Prolong Gold', 'value': 1.44},
                {'label': 'Fluoromount G', 'value': 1.4},
                {'label': 'Mowiol(low RI)', 'value': 1.41},
                {'label': 'Mowiol(low RI)', 'value': 1.49},
                {'label': '80% Glycerol', 'value': 1.45}
            ];
            $scope.nsPresetChanged = function(){
                if($scope.preference.nsPresetSelected.value > 0) 
                    $scope.preference.ns = $scope.preference.nsPresetSelected.value;
            };
            // psfType
            $scope.psfTypes = [
                {'label': 'Widefield', 'value': 0},
                {'label': 'Confocal', 'value': 1},
                {'label': 'Two Photon', 'value': 2},
                {'label': 'Light Sheet', 'value': 3},  
            ];

            // $scope.psfTypeChange = function(){
            //     if($scope.preference.psfType.value == 3){
            //         $scope.preference.NA = 1.1;
            //         $scope.preference.riPresetSelected = $scope.riPresets[2];
            //         $scope.preference.nsPresetSelected = $scope.nsPresets[1];
            //         $scope.preference.RI = 1.33;
            //         $scope.preference.ns = 1.33;
            //         $scope.preference.lightSheetIlluminationNA = 0.5;
            //     }
            // }

            $scope.resetPreference = function(){
                //resetting ----
                // todo
            }
            // psfModel
            $scope.psfModelTypes = [
                {'label': 'Scalar', 'value': 0},
                {'label': 'Vectorial', 'value': 1}]
            //regularization
            $scope.regularizationType = [
                {'label': 'None', 'value': 0},
                {'label': 'TV', 'value': 1},
                {'label': 'Entropy', 'value': 2}];

            $scope.regTypeChanged = function(){
                if($scope.preference.regularizationType.value != 0){
                    $scope.preference.automaticRegularizationScale = true; 
                }
            }

            //prefilter
            $scope.preFilterTypes = [
                {'label': 'None', 'value': 0},
                {'label': 'GaussianImage', 'value': 1},
                {'label': 'GaussianImageAndPSF', 'value': 2},
                {'label': 'MedianImage', 'value': 3}
                ];
            //post filter
            $scope.postFilterTypes = [
                {'label': 'None', 'value': 0},
                {'label': 'Gaussian', 'value': 1},
                {'label': 'Median', 'value': 2},
                {'label': 'SharpenFilter', 'value': 3}
                ];
            //output format
            $scope.scalingType = [
                {'label': 'Maintain full 32-bit (single precision float) range', 'value': 0},
                {'label': 'Scale image to fit in 16-bit range if necessary, and round to nearest value', 'value': 1},
                {'label': 'Scale image to fit in 8-bit range if necessary, and round to nearest value', 'value': 2}
            ];
            //file format
            $scope.fileFormatType = [
                {'label': 'TIFF', 'value': 0},
                {'label': 'OME-TIFF', 'value': 1}, 
                {'label': 'HDF5', 'value': 2}, 
                {'label': 'Imaris 5.0', 'value': 3},
                {'label': 'Slidebook 6.0', 'value': 4}, 
                {'label': 'Arivis .SIS', 'value': 5}
            ];
            //split channels
            $scope.splitChannelType = [
                {'label': 'No Split', 'value': 0},
                {'label': 'Split channels', 'value': 1}, 
                {'label': 'Split timepoints', 'value': 2}, 
                {'label': 'Split channels and timepoints', 'value': 3} 
                
            ];
            //split starting index
            $scope.splitStartingIndexType = [
                {'label': '0', 'value': 0},
                {'label': '1', 'value': 1}  
            ];
            
            
            /********************************************************************/
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
                { name: 'name', displayName: 'Name', allowCellFocus : false}
            ];
           
            $scope.selectedFilesGridOptions.onRegisterApi = function( gridApi ) {
                $scope.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope,function(row){
                    console.log("row selection changed");
                    if(row.isSelected){
                        $scope.selectedItem = row.entity;
			            if($scope.preference.readSpacing && $scope.selectedItem.dr && $scope.selectedItem.dz){
                            $scope.preference.lateralSpacing = $scope.selectedItem.dr;
                            $scope.preference.axialSpacing = $scope.selectedItem.dz;
                        }
                    }
                });
            };

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
                setPreferenceToDefault();
                // save preference
                savePreference();
            }

            
            
            
            /**
            * submit
            * padding, ns, devices, tiling, swapPsfZT, psfModel, 
            * pinholes, iterations, output, NA, swapZT, background, RI, files, prefFile, backgroundType
            */
            $scope.submit = function(isReal) {
                $scope.loading = true;
                try{
                    var formData = getFormData();
                    if(formData.output == null || formData.output == ""){
                        $scope.loading = false;
                        showAlertDialog('You have to choose an output folder');
                        return;              
                    }
                    if(formData.NA >= formData.RI){
                        $scope.loading = false;
                        showAlertDialog('Object NA must be smaller than Refactive Index');
                        return;              
                    }
                    
                    // save preference
                    savePreference();
                    var executioninfo = {   
                        "executioninfo": btoa(JSON.stringify(formData)),
                        "instances": formData.instances,
                        "arrayMax":formData.arrayMax,
                        "mem": formData.mem,
                        "devices": formData.devices,
                        "output": formData.output,
                        "usermail": $scope.session.email
                    }
                    //console.log(executioninfo);
                    if(isReal){
                      ExecuteJobFactory.query(executioninfo)
                       .$promise.then(
                           function(data) {
                               $scope.loading = false;
                               console.log(data);
                               $rootScope.$broadcast("notify", "Job submitted");
                               $location.path("/job-list");
                           },
                           function (error) {
                               $scope.loading = false;
                               showAlertDialog("Error: Problem submitting:" + error);
                           }
                       );
                     }else{
                        console.log(executioninfo);
                        TestExecuteJobFactory.query(executioninfo)
                       .$promise.then(
                           function(data) {
                               $scope.loading = false;
                               console.log(data);
                           },
                           function (error) {
                               $scope.loading = false;
                               showAlertDialog("Error: Problem submitting:" + error);
                           }
                        );
                     }
               }catch(err) {
                    showAlertDialog("Error: Problem submitting:" + error);
                   $scope.loading = false;
               }
            };


            // when loading is changed
            $scope.$on('loadingchanged',function(event,loading) {
                $scope.loading = loading;
            });


            /*************************open file explroer*****************************************/
            $scope.openFilesExplorer = function(mode){
                var $ctrl = this;
                $ctrl.modalContents = {};
                $ctrl.modalContents.mode = mode;
                if($ctrl.modalContents.mode == 'selectoutput'){
                    $ctrl.modalContents.title = "Select Output Folder";
                    if($scope.preference.output == null || $scope.preference.output.trim()=="")
                        $ctrl.modalContents.initialPath = "/afm01/scratch";
                    else{
                        var _pathParts = $scope.preference.output.split("/");
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
                        $scope.preference.output = $ctrl.selected;
                    }
                    else if($ctrl.modalContents.mode === 'selectfiles'){
                        var selectedList = "";
                        $ctrl.selected.forEach(function(item){
                            var isNew = true;
                            for(var i=0; i < $scope.selectedFilesGridOptions.data.length; i++){
                                if($scope.selectedFilesGridOptions.data[i].path === item.path)
                                    isNew = false;
                            }
                            if(isNew){
                                selectedList += item.path.replace(/ /g, "\ ") + ":";
                            }
                        });
                        selectedList = selectedList.slice(0, -1)
                        $scope.loading = true;
                        console.log(selectedList);
                        console.log(btoa(selectedList));
                        FilesInfoFactory.query({
                            'fileslist': btoa(selectedList)
                        }).$promise.then(
                            function(returnData) {
                                console.log(returnData);
                                var data = returnData.commandResult;
                                if(data.length > 0){
                                    data.forEach(function (item){
                                        item['name'] = item['path'].split('/').pop();
                                        var numOfChannels = parseInt(item['c']);
                                        var channels = []
                                        for(var i=1; i <=numOfChannels; i++){
                                            var channelName = 'Channel ' + i;
                                            channels.push({'name': channelName, 'iterations': 10,
                                                           'wavelength': 525, 'pinhole': 0, 'background': 0})
                                        }
                                        item['channels'] = channels;
                                        if(item['z']==1 && item['t']>10){
                                            $scope.preference.swapZT = true;
                                        }
                                        $scope.selectedFilesGridOptions.data.push(item);
                                        if($scope.preference.output.trim() == "")
                                            $scope.preference.output = item['defaultoutput'];
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
                                        item['name'] = item['path'];
                                        var numOfChannels = parseInt(item['c']);
                                        var channels = []
                                        for(var i=1; i <=numOfChannels; i++){
                                            var channelName = 'Channel ' + i;
                                            channels.push({'name': channelName, 'iterations': 10,
                                                           'wavelength': 525, 'pinhole': 0, 'background': 0})
                                        }
                                        item['channels'] = channels;
                                        // TODO: this is from James
                                        // Another way is to swap Z and T for all lattice
                                        if(item['z']==1 && item['t']>10){
                                            $scope.preference.swapZT = true;
                                        }
                                        $scope.selectedFilesGridOptions.data.push(item);
                                        $scope.preference.output = item['defaultoutput'];
                                    });
                                    $timeout(function () {
                                        $scope.gridApi.selection.selectRow($scope.selectedFilesGridOptions.data[0]);
                                    },
                                    100);

                                }
                                else{
                                    showAlertDialog("Failed to load " + $ctrl.selected);
                                }
                                $scope.loading = false;
                            },
                            function (error) {
                                $scope.loading = false;
                                showAlertDialog("Problem loading folder:" + $ctrl.selected);
                            }
                        );
                    }
                    else if($ctrl.modalContents.mode === 'newtemplate'){
                        var templateName = $ctrl.selected;
                        $scope.loading = true;
                        var formData = getFormData();
                        //console.log("@newtemplate");
                        //console.log(formData);
                        SaveTemplateFactory.query({"templateinfo": btoa(JSON.stringify(formData)),
                                          "templateName": templateName
                                        }).$promise.then(
                            function(returnData) {
                                $scope.loading = false;
                                $rootScope.$broadcast("notify", "Successfuly save template " + templateName);
                            },
                            function (error) {
                                $scope.loading = false;
                                console.log(error);
                                $rootScope.$broadcast("notify", "Error: Problem saving template:" + templateName);
                            }
                        )
                    }
                    else if($ctrl.modalContents.mode === 'loadtemplate'){
                        var templateName = $ctrl.selected.split(".")[0];
                        $scope.loading = true;
                        LoadTemplateFactory.query({
                            'templateName': templateName
                        }).$promise.then(
                            function(returnData) {
                                $scope.loading = false;
                                var data = returnData.commandResult[0].contents;
                                // parse single quote to double quote
                                var jsonData = ( new Function("return " + data) )();
                                //console.log(jsonData);
                                // load the jsonData into the form
                                setFormData(jsonData);
                            },
                            function (error) {
                                $scope.loading = false;
                                console.log(error);
                                $rootScope.$broadcast("notify", "Error: Problem loading template:" + answer[0]);
                            }
                        );
                    }
                    else if($ctrl.modalContents.mode === 'loadpsf'){
                        $scope.preference.psfFile = $ctrl.selected;                
                        $scope.loading = true;
                        console.log($ctrl.selected);
                        $rootScope.$broadcast("notify", "Loading Psf");
                        FileInfoFactory.query({
                            'filepath': btoa($ctrl.selected)
                        }).$promise.then(
                            function(returnData) {
                                console.log(returnData);
                                if(returnData.commandResult.length>0){
                                    var data = returnData.commandResult[0];    
                                    $scope.preference.psfInfo.dz = parseFloat(data.dz);
                                    $scope.preference.psfInfo.dr = parseFloat(data.dr);
                                    $scope.preference.psfInfo.x = parseFloat(data.x);
                                    $scope.preference.psfInfo.y = parseFloat(data.y);
                                    $scope.preference.psfInfo.z = parseFloat(data.z);
                                    $scope.preference.psfInfo.c = parseFloat(data.c);
                                    $scope.preference.psfInfo.t = parseFloat(data.t);
                                    if(data.z == 1 && data.t > 1)
                                        $scope.preference.swapPsfZT = true;
                                }
                                else{
                                    $scope.preference.psfInfo.dz = -1;
                                    $scope.preference.psfInfo.dr = -1;
                                    $scope.preference.psfInfo.x = -1;
                                    $scope.preference.psfInfo.y = -1;
                                    $scope.preference.psfInfo.z = -1;
                                    $scope.preference.psfInfo.c = -1;
                                    $scope.preference.psfInfo.t = -1;
                                    $rootScope.$broadcast("notify", "Failed to load " + $ctrl.selected);
                                }
                                $scope.loading = false;
                            },
                            function (error) {
                                $scope.loading = false;
                                console.log(error);
                                $rootScope.$broadcast("notify", "Error: Problem loading psf file:" + $ctrl.selected);
                            }
                        );
                    }
                }, function () {
                  console.log('Modal dismissed at: ' + new Date());
                });
            };

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

            /**********************************************************/
            /***********************************************************/
            /**
            * save preference
            */
            var savePreference = function(){
                //save it
                var savedData = {"pref": {
                                        "preference": angular.toJson($scope.preference), 
                                        "files": angular.toJson($scope.selectedFilesGridOptions.data)
                                        }
                                };
                UserPreferenceFactory.update({}, JSON.stringify(savedData));
            }

            var toPythonBoolean = function (booleanValue){
                var s = booleanValue.toString();
                return s && s[0].toUpperCase() + s.slice(1);
            }

            /**
            * get the data supplied by the user for this form
            */
            var getFormData = function(){
                var selectedFiles = [];
                $scope.selectedFilesGridOptions.data.forEach( function( item ){
                    var filePath = item.path;
                    selectedFiles.push(filePath);                        
                });
                
                if($scope.preference.automaticRegularizationScale){
                    $scope.preference.regularization = -1;
                }
                
                // get channel data
                if($scope.selectedItem && $scope.selectedItem.channels){
                    $scope.preference.iterations = []
                    $scope.preference.wavelengths = []
                    $scope.preference.pinholes = []
                    $scope.preference.backgrounds = []
                    $scope.selectedItem['channels'].forEach(function (channel){
                            $scope.preference.iterations.push(channel['iterations'])
                            $scope.preference.wavelengths.push(channel['wavelength'])
                            $scope.preference.pinholes.push(channel['pinhole'])
                            if($scope.preference.backgroundType=='Manual'){
                                $scope.preference.backgrounds.push(parseFloat(channel['background']))
                            }
                            else if($scope.preference.backgroundType=='None'){
                                $scope.preference.backgrounds.push(0)
                            }
                            else{
                                // parse directly the value in backgroundType
                                $scope.preference.backgrounds.push(parseFloat($scope.preference.backgroundType))
                            }
                        })
                        if($scope.preference.readSpacing && $scope.selectedItem.dr && $scope.selectedItem.dz){
                            $scope.preference.lateralSpacing = $scope.selectedItem.dr;
                            $scope.preference.axialSpacing = $scope.selectedItem.dz;
                        }
                }
                var formData = {
                   'padding': $scope.preference.padding.x + "," +$scope.preference.padding.y + "," + $scope.preference.padding.z,
                   'tiling': $scope.preference.tiling.x + "," + $scope.preference.tiling.y + "," + $scope.preference.tiling.z,
                   'NA': $scope.preference.NA,
                   'RI': $scope.preference.RI,
                   'ns': $scope.preference.ns,
                   'psfModel': $scope.preference.psfModel.value,
                   'backgroundType': $scope.preference.backgroundType,
                   'swapZT': toPythonBoolean($scope.preference.swapZT),
                   'swapPsfZT': toPythonBoolean($scope.preference.swapPsfZT),
                   'iterations': $scope.preference.iterations.join(),
                   'pinholes': $scope.preference.pinholes.join(),
                   'background': $scope.preference.backgrounds.join(),
                   'wavelength': $scope.preference.wavelengths.join(),
                   'devices': $scope.preference.gpus,
                   'files': selectedFiles.join(),
                   'output': $scope.preference.output,
                   //'prefFile': 'run.pref',
                   'psfType': $scope.preference.psfType.value,
                   'lightSheetIlluminationNA': $scope.preference.lightSheetIlluminationNA,
                   //////new stuff here////
                   'latSpacing': $scope.preference.lateralSpacing,
                   'axSpacing': $scope.preference.axialSpacing,
                   'psfX': $scope.preference.psfInfo.x,
                   'psfY': $scope.preference.psfInfo.y,
                   'psfZ': $scope.preference.psfInfo.z,
                   'psfC': $scope.preference.psfInfo.c,
                   'psfT': $scope.preference.psfInfo.t,
                   'psfLatSpacing': $scope.preference.psfInfo.dr,
                   'psfAxSpacing': $scope.preference.psfInfo.dz,
                   'generatePsf': toPythonBoolean($scope.preference.generatePsf),
                   'psfFile': $scope.preference.psfFile,
                   'instances': $scope.preference.numberOfParallelJobs,
                   'arrayMax': parseInt($scope.preference.numberOfParallelJobs)-1,
                   'mem': $scope.preference.mem,
                   'regType': $scope.preference.regularizationType.value,
                   'regularization': $scope.preference.regularization,
                   'prefilter': $scope.preference.prefilter.value,
                   'postfilter': $scope.preference.postfilter.value,
                   'blind': toPythonBoolean($scope.preference.blindDeconvolution),
                   'scaling': $scope.preference.scaling.value,
                   'format': $scope.preference.fileformat.value,
                   'split': $scope.preference.split.value,
                   'splitIdx': $scope.preference.splitIdx.value,
                   //'access_token': accessToken
                };
                if (isNaN(formData.axSpacing) || isNaN(formData.latSpacing))
                    throw "Lateral Spacing and Axial spacing cannot be null";
                return formData;
            }

            /**
            * set form data to preference
            */
            var setFormData = function(data){
                //console.log("Setting form data");
                //console.log(data);
                $scope.preference.NA = parseFloat(data.NA);
                $scope.preference.RI = parseFloat(data.RI);
                $scope.preference.axialSpacing = parseFloat(data.axSpacing);
                $scope.preference.backgroundType = data.backgroundType;
                $scope.preference.blind = data.blind == 'True';
                $scope.preference.gpus =  parseInt(data.devices);
                $scope.preference.fileformat = $scope.fileFormatType[parseInt(data.format)];
                $scope.preference.generatePsf = data.generatePsf == 'True';
                $scope.preference.numberOfParallelJobs = parseInt(data.instances);
                $scope.preference.lateralSpacing = parseFloat(data.latSpacing);
                $scope.preference.mem = parseInt(data.mem);
                $scope.preference.ns = parseFloat(data.ns);
                $scope.preference.postfilter = $scope.postFilterTypes[parseInt(data.postFilter)];
                $scope.preference.prefilter = $scope.preFilterTypes[parseInt(data.preFilter)];
                $scope.preference.psfFile = data.psfFile;
                $scope.preference.psfModel = $scope.psfModelTypes[parseInt(data.psfModel)];
                $scope.preference.psfType = $scope.psfTypes[parseInt(data.psfType)];
                $scope.preference.lightSheetIlluminationNA = parseFloat(data.lightSheetIlluminationNA);
                $scope.preference.regularization = parseFloat(data.regularization);
                $scope.preference.regularizationType = $scope.regularizationType[parseInt(data.regularizationType)];
                $scope.preference.scaling = $scope.scalingType[parseInt(data.scaling)];
                $scope.preference.swapPsfZT = data.swapPsfZT == 'True';
                $scope.preference.swapZT = data.swapZT == 'True';
                // psf
                $scope.preference.psfInfo.dz = parseFloat(data.psfAxSpacing);
                $scope.preference.psfInfo.dr = parseFloat(data.psfLatSpacing);
                $scope.preference.psfInfo.x = parseInt(data.psfX);
                $scope.preference.psfInfo.y = parseInt(data.psfY);
                $scope.preference.psfInfo.z = parseInt(data.psfZ);
                $scope.preference.psfInfo.c = parseInt(data.psfC);
                $scope.preference.psfInfo.t = parseInt(data.psfT);
                //padding and tileing
                var paddingSplitted = data.padding.split(",");
                $scope.preference.padding.x = parseInt(paddingSplitted[0]);
                $scope.preference.padding.y = parseInt(paddingSplitted[1]);
                $scope.preference.padding.z = parseInt(paddingSplitted[2]);
                var tilingSplitted = data.tiling.split(",");
                $scope.preference.tiling.x = parseInt(tilingSplitted[0]);
                $scope.preference.tiling.y = parseInt(tilingSplitted[1]);
                $scope.preference.tiling.z = parseInt(tilingSplitted[2]);
                // other splitted data
                $scope.preference.iterations = data.iterations.split(",").map(Number);
                $scope.preference.backgrounds = data.background.split(",").map(Number);
                $scope.preference.pinholes = data.pinholes.split(",").map(Number);
                $scope.preference.wavelengths = data.wavelength.split(",").map(Number);
                // create new selected item
                var newSelectedItem = {};
                newSelectedItem.channels = [];
                for(var i =0; i< $scope.preference.iterations.length; i++){
                    var channel = {};
                    channel.name = "Channel " + (i + 1);
                    channel.iterations = $scope.preference.iterations[i];
                    channel.background = $scope.preference.backgrounds[i];
                    channel.pinhole = $scope.preference.pinholes[i];
                    channel.wavelength = $scope.preference.wavelengths[i];
                    newSelectedItem.channels.push(channel);
                }
                $scope.selectedItem = newSelectedItem;
            };

            /**
            * reset Preference
            */
            var setPreferenceToDefault = function(){
                $scope.preference = {
                    'lateralSpacing': 100, // dr Lateral pixel spacing
                    'axialSpacing': 312, //dz Axial pixel spacing
                    'psfInfo': {'x': -1, 'y':-1, 'z': -1, 'dr': 100, 'dz': 312},
                    'generatePsf': true,
                    'readSpacing': true,
                    'readPsfSpacing': true,
                    'psfModel': 0, //BornWolf or Vectorial
                    'NA': 1.4, // Numerical aperture of the objective. 
                    'ns': 1.33, //Refractive index of the sample's immersion medium
                    'lightSheetIlluminationNA': 0.05,
                    'RI': 1.515, //Refractive index of the objective immersion medium
                    'tiling': {'x': 1, 'y': 1, 'z':1},
                    'padding': {'x': 0, 'y': 0, 'z': 0},
                    'backgroundType': 'None',
                    'backgrounds': null,
                    'pinholes': null,
                    'wavelengths': null,
                    'iterations': null,
                    'psfType': 3,
                    'swapZT': false,
                    'swapPsfZT': false,
                    'output': '',
                    'folder': '',
                    'psfFile': '',
                    'numberOfParallelJobs': 2,
                    'mem': 10000,
                    'gpus': 2,
                    'regularizationType': $scope.regularizationType[0],
                    'automaticRegularizationScale': false,
                    'regularization':-1,
                    'prefilter':$scope.preFilterTypes[0],
                    'postfilter':$scope.postFilterTypes[0],
                    'blindDeconvolution': false,
                    'scaling': $scope.scalingType[0],
                    'fileformat': $scope.fileFormatType[0],
                    'split': $scope.splitChannelType[0],
                    'splitIdx': $scope.splitStartingIndexType[0],
                    'riPresetSelected': $scope.riPresets[2],
                    'nsPresetSelected': $scope.nsPresets[1],
                    'autoDetect': false
                };  
            }


 

}]);




