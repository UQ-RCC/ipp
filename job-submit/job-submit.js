'use strict';

angular.module('microvolution.job-submit', ['ngRoute', 'ngResource', 'ui.grid', 'ui.grid.selection', 'ui.grid.treeView'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/job-submit', {
            templateUrl: 'job-submit/job-submit.html',
            controller: 'JobSubmitCtrl'
        });
    }])

    .controller('JobSubmitCtrl', ['$scope', '$rootScope', '$resource', '$interval', '$location',
        '$mdDialog', 'settings', 'uiGridTreeViewConstants', 'uiGridConstants',
        function ($scope, $rootScope, $resource, $interval, $location, 
            $mdDialog, settings, uiGridTreeViewConstants, uiGridConstants) {
            // Resources
            $scope.sessionInfoResource = $resource(settings.URLs.apiBase + settings.URLs.sessionInfo);
            $scope.accessTokenResource = $resource(settings.URLs.apiBase + settings.URLs.accessToken, {}, {
                'get': {
                    isArray: false
                }
            });
            //loading
            $scope.loading = false;
            
            //var endSessionResource = $resource(settings.URLs.apiBase + settings.URLs.logout);
            var getUserHome = $resource(settings.URLs.serverApiBase + settings.URLs.home , {}, {
                'get': {
                    isArray: false
                }
            });
            var listFolder = $resource(settings.URLs.serverApiBase + settings.URLs.listFolderBase64 , {}, {
                'get': {
                    isArray: false
                }
            });
            
            var executeMicrovolutionJob = $resource(settings.URLs.serverApiBase + settings.URLs.executeMicrovolutionBase64, {}, {
                'get': {
                    isArray: false
                }
            });
            var testExecute = $resource(settings.URLs.serverApiBase + settings.URLs.testExecutionBase64, {}, {
                'get': {
                    isArray: false
                }
            });
            var listTemplate = $resource(settings.URLs.serverApiBase + settings.URLs.listTemplate, {}, {
                'get': {
                    isArray: false
                }
            });
            
            
            // Gets the session data and redirects to the login screen if the user is not logged in
            $scope.sessionInfoResource.get({}).$promise.then(function (sessionData) {
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

                $scope.session = sessionData;
            });

            
            // selected file
            $scope.selectedItem = null;
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
                'regularizationType': {},
                'automaticRegularizationScale': false,
                'regularization':-1,
                'prefilter':{},
                'postfilter':{},
                'blindDeconvolution': false,
                'scaling': {},
                'fileformat': {},
                'split': 0,
                'splitIdx': 0,
                'riPresetSelected': {'label': 'Water', 'value': 1.33},
                'nsPresetSelected': {'label': 'Water', 'value': 1.33}
            };
            // auto detect
            $scope.autoDetect = false;
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

            $scope.psfTypeChange = function(){
                if($scope.preference.psfType.value == 3){
                    $scope.preference.NA = 1.1;
                    $scope.preference.riPresetSelected = $scope.riPresets[2];
                    $scope.preference.nsPresetSelected = $scope.nsPresets[1];
                    $scope.preference.RI = 1.33;
                    $scope.preference.ns = 1.33;
                    $scope.preference.lightSheetIlluminationNA = 0.5;
                }
            }

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
            };

            /**
            * remove all
            */
            $scope.removeAll = function() {
                //maybe dialog here ?
                $scope.selectedFilesGridOptions.data = [];
            }

            var toPythonBoolean = function (booleanValue){
                var s = booleanValue.toString();
                return s && s[0].toUpperCase() + s.slice(1);
            }
 
            /**
            * get the data supplied by the user for this form
            */
            $scope.getFormData = function(){
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
            $scope.setFormData = function(data){
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
            }

            /**
            * submit
            * padding, ns, devices, tiling, swapPsfZT, psfModel, 
            * pinholes, iterations, output, NA, swapZT, background, RI, files, prefFile, backgroundType
            */
            $scope.submit = function(isReal) {
                $scope.loading = true;
                try{
                    var formData = $scope.getFormData();
                    if(formData.output == null || formData.output == ""){
                        $scope.loading = false;
                        $rootScope.$broadcast("notify", "You have to choose an output folder");
                        return;              
                    }
                    $scope.accessTokenResource.get({}).$promise.then(
                        function (token) {
                            var accessToken = token.access_token
                            if (accessToken !== "") {
                                var executioninfo = {   
                                    "executioninfo": btoa(JSON.stringify(formData)),
                                    "instances": formData.instances,
                                    "arrayMax":formData.arrayMax,
                                    "mem": formData.mem,
                                    "devices": formData.devices,
                                    "output": formData.output,
                                    "access_token": accessToken,
                                    "usermail": $scope.session.email
                                }
                                console.log(executioninfo);
                                if(isReal){
                                  executeMicrovolutionJob.get(executioninfo)
                                   .$promise.then(
                                       function(data) {
                                           $scope.loading = false;
                                           console.log(data);
                                           $rootScope.$broadcast("notify", "Job submitted");
                                           $location.path("/job-list");
                                       },
                                       function (error) {
                                           $scope.loading = false;
                                           $rootScope.$broadcast("notify", "Error: Problem submitting:" + error);
                                       }
                                   );
                                 }else{
                                    testExecute.get(executioninfo)
                                   .$promise.then(
                                       function(data) {
                                           $scope.loading = false;
                                           console.log(data);
                                       },
                                       function (error) {
                                           $scope.loading = false;
                                           $rootScope.$broadcast("notify", "Error: Problem submitting:" + error);
                                       }
                                    );
                                 }
                            } // end if access token
                        }
                    );
               }catch(err) {
                   $rootScope.$broadcast("notify", "Error: " + err);
                   $scope.loading = false;
               }
            };
        // when loading is changed
        $scope.$on('loadingchanged',function(event,loading) {
            $scope.loading = loading;
        });
}]);


angular.module('microvolution.job-submit')
.controller('ModalCtrl', ['$scope', '$rootScope','$resource', 'settings', '$uibModal', '$log', '$document', '$timeout',
                function ($scope, $rootScope, $resource, settings, $uibModal, $log, $document, $timeout) {
  var filesInfo = $resource(settings.URLs.serverApiBase + settings.URLs.filesInfoBase64, {}, {
    'get': {
        isArray: false
    }
  });

  var folderInfo = $resource(settings.URLs.serverApiBase + settings.URLs.folderInfoBase64, {}, {
    'get': {
        isArray: false
    }
  });

  var fileInfo = $resource(settings.URLs.serverApiBase + settings.URLs.fileInfoBase64, {}, {
    'get': {
        isArray: false
    }
  });

  var saveTemplate = $resource(settings.URLs.serverApiBase + settings.URLs.saveTemplateBase64, {}, {
    'get': {
        isArray: false
    }
  });
  var loadTemplate = $resource(settings.URLs.serverApiBase + settings.URLs.loadTemplate, {}, {
    'get': {
        isArray: false
    }
  });

  var $ctrl = this;
  $ctrl.modalContents = {};
  $ctrl.modalContents.title = "Files Exlorer";
  $ctrl.modalContents.mode = 'files';
  $ctrl.open = function (mode) {
    $ctrl.modalContents.mode = mode;
    if($ctrl.modalContents.mode == 'selectfiles')
        $ctrl.modalContents.title = "Select Files";
    else if($ctrl.modalContents.mode == 'selectfolders')
        $ctrl.modalContents.title = "Select Folders";
    else if($ctrl.modalContents.mode == 'selectoutput'){
        $ctrl.modalContents.title = "Select Output Folder";
        if($scope.preference.output == null || $scope.preference.output.trim()=="")
            $ctrl.modalContents.initialPath = "/afm01/scratch";
        else{
            var _pathParts = $scope.preference.output.split("/");
            $ctrl.modalContents.initialPath = _pathParts.slice(0,-1).join("/");
            $ctrl.modalContents.initialNewItem = _pathParts.slice(-1)[0];
        }
    }
    else if($ctrl.modalContents.mode == 'newtemplate')
        $ctrl.modalContents.title = "Save Template";
    else if($ctrl.modalContents.mode == 'loadtemplate')
        $ctrl.modalContents.title = "Select Template";
    else if($ctrl.modalContents.mode == 'loadpsf')
        $ctrl.modalContents.title = "Select Psf File";
        
    var modalInstance = $uibModal.open({
      animation: false,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'job-submit/filesexplorer.tmpl.html',
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

    var changeParentLoading = function(loading){
        $scope.loading = loading;
        $scope.$emit('loadingchanged',$scope.loading);  
    }
    /*
    * process the answer
    */
    modalInstance.result.then(function (selected) {
        $ctrl.selected = selected;
        if($ctrl.selected==null || $ctrl.selected==""){
            $rootScope.$broadcast("notify", "You have not selected anything");
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
            $scope.accessTokenResource.get({}).$promise.then(
                function (token) {
                    var accessToken = token.access_token
                    if (accessToken !== "") {
                        changeParentLoading(true);
                        $rootScope.$broadcast("notify", "Loading files");
                        filesInfo.get({
                            'fileslist': btoa(selectedList),
                            'access_token': accessToken
                        }).$promise.then(
                            function(returnData) {
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
                                else
                                    $rootScope.$broadcast("notify", "Failed to load " + selectedList);
                                changeParentLoading(false);
                            },
                            function (error) {
                                changeParentLoading(false);
                                console.log(error);
                                $rootScope.$broadcast("notify", "Error: Problem loading files:" + selectedList);
                            }
                        );
                    }
                }
            );


        }
        else if($ctrl.modalContents.mode === 'selectfolders'){
            $scope.accessTokenResource.get({}).$promise.then(
                function (token) {
                    var accessToken = token.access_token
                    if (accessToken !== "") {
                        changeParentLoading(true);
                        $rootScope.$broadcast("notify", "Loading folder");
                        folderInfo.get({
                            'folderpath': btoa($ctrl.selected),
                            'access_token': accessToken
                        }).$promise.then(
                            function(returnData) {
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
                                else
                                    $rootScope.$broadcast("notify", "Failed to load " + $ctrl.selected);
                                changeParentLoading(false);
                            },
                            function (error) {
                                changeParentLoading(false);
                                console.log(error);
                                $rootScope.$broadcast("notify", "Error: Problem loading folder:" + $ctrl.selected);
                            }
                        );
                    }
                }
            );
        }
        else if($ctrl.modalContents.mode === 'newtemplate'){
            var templateName = $ctrl.selected;
            $scope.accessTokenResource.get({}).$promise.then(
                function (token) {
                    var accessToken = token.access_token
                    if (accessToken !== "") {
                        $scope.loading = true;
                        var formData = $scope.getFormData();
                        console.log("@newtemplate");
                        console.log(formData);
                        saveTemplate.get({"templateinfo": btoa(JSON.stringify(formData)),
                                          "templateName": templateName,
                                          "access_token": accessToken
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
                }
            );
        }
        else if($ctrl.modalContents.mode === 'loadtemplate'){
            var templateName = $ctrl.selected.split(".")[0];
            $scope.accessTokenResource.get({}).$promise.then(
                function (token) {
                    var accessToken = token.access_token
                    if (accessToken !== "") {
                        $scope.loading = true;
                        loadTemplate.get({
                            'templateName': templateName,
                            'access_token': accessToken
                        }).$promise.then(
                            function(returnData) {
                                $scope.loading = false;
                                var data = returnData.commandResult[0].contents;
                                // parse single quote to double quote
                                var jsonData = ( new Function("return " + data) )();
                                //console.log(jsonData);
                                // load the jsonData into the form
                                $scope.setFormData(jsonData);
                            },
                            function (error) {
                                $scope.loading = false;
                                console.log(error);
                                $rootScope.$broadcast("notify", "Error: Problem loading template:" + answer[0]);
                            }
                        )
                    }
                }
            );
        }
        else if($ctrl.modalContents.mode === 'loadpsf'){
            $scope.preference.psfFile = $ctrl.selected;                
            $scope.accessTokenResource.get({}).$promise.then(
                function (token) {
                    var accessToken = token.access_token
                    if (accessToken !== "") {
                        changeParentLoading(true);
                        $rootScope.$broadcast("notify", "Loading Psf");
                        fileInfo.get({
                            'filepath': btoa($ctrl.selected),
                            'access_token': accessToken
                        }).$promise.then(
                            function(returnData) {
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
                                changeParentLoading(false);
                            },
                            function (error) {
                                changeParentLoading(false);
                                console.log(error);
                                $rootScope.$broadcast("notify", "Error: Problem loading psf file:" + $ctrl.selected);
                            }
                        );
                    }
                }
            );
        }
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
}]);

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

angular.module('microvolution.job-submit')
.controller('ModalInstanceCtrl', ['$scope', '$rootScope', '$uibModalInstance', 'modalContents', '$resource', 'settings',
    function ($scope, $rootScope, $uibModalInstance, modalContents, $resource, settings) {
  var $ctrl = this; 
  $ctrl.modalContents = modalContents;
  $ctrl.modalContents.loading = false;
  $ctrl.modalContents.filesFolderList = [];
  if($ctrl.modalContents.initialPath == null || $ctrl.modalContents.initialPath.trim()=="")
    $ctrl.modalContents.currentpath = "/afm01/Q0703";  
  else
    $ctrl.modalContents.currentpath = $ctrl.modalContents.initialPath;    
  $ctrl.modalContents.selectAll = false;
  $ctrl.modalContents.extensions = ["tif", "nd2", "ims", "sld"];
  $ctrl.modalContents.extension = "";
  $ctrl.modalContents.newItem = "";
  if($ctrl.modalContents.initialNewItem != null && $ctrl.modalContents.initialNewItem.trim()!="")
    $ctrl.modalContents.newItem =  $ctrl.modalContents.initialNewItem;    
  $ctrl.modalContents.selectedItems = [];
  $ctrl.selected = {};

  var listFolder = $resource(settings.URLs.serverApiBase + settings.URLs.listFolderBase64 , {}, {
    'get': {
        isArray: false
    }
  });

  /**
  * list dir
  */
  var ls = function(newPath, oldPath){
    if(newPath == null)
        return;
    if(!newPath.endsWith("/"))
        newPath = newPath + "/";
    $ctrl.modalContents.loading = true;
    $scope.accessTokenResource.get({}).$promise.then(
        function (token) {
            var accessToken = token.access_token
            if (accessToken !== "") {
                listFolder.get({
                    'folderpath': btoa(newPath),
                    'access_token': accessToken
                   }).$promise.then(
                     function(returnData){
                        //for some reason 500 is considered success :-s
                        if(returnData.status == 500){
                            $ctrl.modalContents.loading = false;
                            $ctrl.modalContents.currentpath = oldPath;
                            $rootScope.$broadcast("notify", "Error loading:" + newPath + ". You probably do not have permission");
                            return;
                        }
                        var data = returnData.commandResult;
                        if(data == null){
                            $ctrl.modalContents.loading = false;
                            return;
                        }                                            
                        data.forEach(function(element) {
                            element.children = [];
                            element.type = 'f';
                            if(['d', 'l'].includes(element.permission.charAt(0))){
                                element.type = element.permission.charAt(0);
                                element.children.push({name: "", children: []})
                                // symlink
                                if(element.type==='l')
                                    element.name = element.name.split("->")[0].trim();
                            }
                            element.path = newPath + element.name;
                            element.selected = false;
                        });
                        $ctrl.modalContents.filesFolderList = data;
                        $ctrl.modalContents.loading = false;
                        $ctrl.modalContents.currentpath = newPath;
                    }
                ),
                function (error) {
                    console.log("Error: failed to load:" + newPath);
                    $ctrl.modalContents.loading = false;
                    $ctrl.modalContents.currentpath = oldPath;
                    $rootScope.$broadcast("notify", "Error loading:" + newPath + ". You probably do not have permission");
                }
            }
        },                          
        function (error) {
            console.log("Error: failed to load:" + newPath);
            $ctrl.modalContents.loading = false;
            $ctrl.modalContents.currentpath = oldPath;
            $rootScope.$broadcast("notify", "Error getting an access token" + error);
        }
    );                  
  };

  var createQuickNavs = function(folderPath){
    // splitting path into paths
    var paths = folderPath.split("/");
    var path = "/";
    $ctrl.modalContents.paths = [path];
    paths.forEach(function(item){
        if(item !=""){
            path = path + item + "/";
            $ctrl.modalContents.paths.push(path);
        }
    });
  }

  /*
  * when change the path
  */
  $ctrl.onPathChange = function(newPath){
    console.log("path change:" + newPath);
    ls($ctrl.modalContents.currentpath, "");
  };


  /*
  * init the file explorer
  */
  $ctrl.init = function(){
    //default path
    createQuickNavs($ctrl.modalContents.currentpath);
    // now move into shotcuts
    var home = "/clusterdata/";
    if($scope.session != undefined && $scope.session != null){
        home = home + $scope.session.uname;
    }
    $ctrl.modalContents.shortcuts = [{'label': 'home', 'path': home}, 
                                     {'label': 'scratch', 'path':'/afm01/scratch/'},
                                     {'label': 'afm01', 'path':'/afm01/'}
                                     ];
    if(['loadtemplate', 'newtemplate'].includes($ctrl.modalContents.mode)){
        createQuickNavs(home + "/.microvolution");
        ls(home + "/.microvolution", "");
    }
    else
        ls($ctrl.modalContents.currentpath, "");
  };    

  $ctrl.refresh = function () {
    ls($ctrl.modalContents.currentpath);
  };

  $ctrl.isLoading = function () {
    return $ctrl.modalContents.loading;
  };

  $ctrl.shortcut = function(shortcutPath){
    createQuickNavs(shortcutPath);
    ls(shortcutPath, $ctrl.modalContents.currentpath);
  };

  /**
  * only available for files
  */
  $ctrl.selectAll = function(status){
    $ctrl.modalContents.selectedItems = [];
    $ctrl.modalContents.filesFolderList.forEach(function(item){
        item.selected = $ctrl.modalContents.selectAll;
        if(item.selected && item.permission.startsWith('-')){
            $ctrl.modalContents.selectedItems.push(item);
        }
    });
  };


  $ctrl.selectItem = function(item){
    if(item.selected){
        $ctrl.modalContents.selectedItems.push(item);
    }
    else{
        $ctrl.modalContents.selectedItems.pop(item);
    }
  };


  /**
  * check whether itemSelect should be enabled
  */
  $ctrl.itemSelectDisabled = function(item){
    if(['selectoutput', 'selectfolders'].includes($ctrl.modalContents.mode))
        return true;
    else if(['selectfiles', 'loadpsf'].includes($ctrl.modalContents.mode)){
        return (item.permission.startsWith('d') || item.permission.startsWith('l'));
    }
    else
        return false;
  };

  /**
  * check whether to hide the table item
  */
  $ctrl.itemHidden = function(item){
    return ($ctrl.modalContents.mode=='selectfolders' 
            && item.permission.startsWith('-') 
            && !item.name.endsWith($ctrl.modalContents.extension)) ||
            (['newtemplate', 'loadtemplate'].includes($ctrl.modalContents.mode) 
                && !item.name.endsWith("template")
                );
  };

  
  
  /**
  * dive into afolder
  */
  $ctrl.navigate = function(item){
    // do not bother navigating into a file
    if(item.permission.startsWith('-'))
        return;
    var oldPath = $ctrl.modalContents.currentpath;
    var newPath = $ctrl.modalContents.currentpath + item.name;
    createQuickNavs(newPath);
    ls(newPath, oldPath);
  };

  $ctrl.ok = function () {
    if($ctrl.modalContents.mode === 'selectoutput'){
        $ctrl.selected = $ctrl.modalContents.currentpath + $ctrl.modalContents.newItem;
    }
    else if($ctrl.modalContents.mode === 'selectfiles'){
        $ctrl.selected = $ctrl.modalContents.selectedItems;
    }
    else if($ctrl.modalContents.mode === 'selectfolders'){
        $ctrl.selected = $ctrl.modalContents.currentpath + "*." +$ctrl.modalContents.extension; //folder + exensions
    }
    else if($ctrl.modalContents.mode === 'newtemplate'){
        $ctrl.selected = $ctrl.modalContents.newItem; //new template
    }
    else if($ctrl.modalContents.mode === 'loadtemplate'){
        if($ctrl.modalContents.selectedItems.length == 0){
            $ctrl.selected = null;
        }
        else
            $ctrl.selected = $ctrl.modalContents.selectedItems[0].name;//template path
    }
    else if($ctrl.modalContents.mode === 'loadpsf'){
        if($ctrl.modalContents.selectedItems.length == 0){
            $ctrl.selected = null;
        }
        else
            $ctrl.selected = $ctrl.modalContents.selectedItems[0].path;//template path
    }
    $uibModalInstance.close($ctrl.selected);
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);

// Please note that the close and dismiss bindings are from $uibModalInstance.

angular.module('microvolution.job-submit').component('modalComponent', {
  templateUrl: 'job-submit/filesexplorer.tmpl.html',
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
  }
});