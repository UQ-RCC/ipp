'use strict';

angular.module('strudelWeb.job-submit', ['ngRoute', 'ngResource', 'ui.grid', 'ui.grid.selection', 'ui.grid.treeView'])

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
            var sessionInfoResource = $resource(settings.URLs.apiBase + settings.URLs.sessionInfo);
            var accessTokenResource = $resource(settings.URLs.apiBase + settings.URLs.accessToken, {}, {
                'get': {
                    isArray: false
                }
            });
            
            
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
            var filesInfo = $resource(settings.URLs.serverApiBase + settings.URLs.filesInfoBase64, {}, {
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
            
             //loading
            $scope.loading = false;

            // Gets the session data and redirects to the login screen if the user is not logged in
            sessionInfoResource.get({}).$promise.then(function (sessionData) {
                if (sessionData.has_oauth_access_token !== "true") {
                    $location.path("/langingpage");
                    return;
                }
                document.getElementById("myCarousel").style.display="none";
                document.getElementById("home-btn").className="menu__link";
                document.getElementById("about-btn").className="menu__link";
                document.getElementById("faq-btn").className="menu__link";
                document.getElementById("contact-btn").className="menu__link";
                document.getElementById("accesspolicy-btn").className="menu__link";
                document.getElementById("login").style.display="none";
                document.getElementById("logout-btn").style.display="block";
                document.getElementById("joblistmgr").style.display="block";
                document.getElementById("joblistmgr").className="menu__link";
                document.getElementById("jobsubmitmgr").style.display="block";
                document.getElementById("jobsubmitmgr").className="menu__link active";

                $scope.session = sessionData; 
                accessTokenResource.get({}).$promise.then(
                    function (token) {
                        var accessToken = token.access_token
                        console.log(accessToken);
                        getUserHome.get({'access_token': accessToken}).$promise.then(function (userData) {
                            $scope.userhome = userData.commandResult[0].home;
                        });
                    }
                )

            });

            
            // selected file
            $scope.selectedItem = null;
            $scope.preference = {
                'lateralSpacing': 100, // dr Lateral pixel spacing
                'axialSpacing': 312, //dz Axial pixel spacing
                'psfLateralSpacing': 100,
                'psfAxialSpacing': 312,
                'generatePsf': true,
                'readSpacing': true,
                'readPsfSpacing': true,
                'psfModel': 0, //BornWolf or Vectorial
                'NA': 1.4, // Numerical aperture of the objective. 
                'ns': 1.33, //Refractive index of the sample's immersion medium
                'lightSheetIlluminationNA': -1,
                'RI': 1.515, //Refractive index of the objective immersion medium
                'tiling': {'x': 1, 'y': 1, 'z':1},
                'padding': {'x': 0, 'y': 0, 'z': 0},
                'backgroundType': 'None',
                'backgrounds': null,
                'pinholes': null,
                'wavelengths': null,
                'iterations': null,
                'psfType': 0,
                'lightSheet': {'NA': 'NaN'},
                'swapZT': false,
                'swapPsfZT': false,
                'output': '',
                'folder': '',
                'psfFile': '',
                'numberOfParallelJobs': 2,
                'mem': 5000,
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
                'riPresetSelected': {},
                'nsPresetSelected': {},
            };

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
                if($scope.preference.riPresetSelected.value > 0) $scope.preference.RI = $scope.preference.riPresetSelected.value;
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
                if($scope.preference.nsPresetSelected.value > 0) $scope.preference.ns = $scope.preference.nsPresetSelected.value;
            };
            // psfType
            $scope.psfTypes = [
                {'label': 'Widefield', 'value': 0},
                {'label': 'Confocal', 'value': 1},
                {'label': 'Two Photon', 'value': 2},
                {'label': 'Light Sheet', 'value': 3},  
            ];

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
            
            /********************************************************/
            /*   dialog */
            /********************************************************/
            $scope.dialogmode='fileselect';
            console.log("mod:" + $scope.dialogmode); 
            $scope.openSelectionDialog = function(ev, dialogmode){
                console.log("mod:" + $scope.dialogmode);
                $scope.dialogmode = dialogmode;
                //show the dialogue
                $mdDialog.show({
                    controller: DialogController,
                        templateUrl: 'job-submit/dialog.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose:false,
                        fullscreen: true
                }).then(function(answer) {
                    console.log("Answer:");
                    console.log(answer);
                    if (['fileselect', 'folderselect', 'outputfolder'].includes($scope.dialogmode)){
                        if(answer.length == 0){
                            $rootScope.$broadcast("notify", "You have not selected anything");
                            return;
                        }
                        if($scope.dialogmode === 'outputfolder'){
                            var outputPath = answer[0].path + "/" + $scope.dialogInput;
                            $scope.preference.output = outputPath;
                        }
                        else if( ['folderselect', 'fileselect'].includes($scope.dialogmode)){
                            $scope.gridApi.selection.selectRow(answer[0]);
                            $scope.gridApi.grid.refresh();
                            var selectedList = "";
                            answer.forEach( function( selectedItem ){
                                var isNew = true;
                                for(var i=0; i < $scope.selectedFilesGridOptions.data.length; i++){
                                    if($scope.selectedFilesGridOptions.data[i].path === selectedItem.path)
                                        isNew = false;
                                }
                                if(isNew){
                                    selectedList += selectedItem.path.replace(/ /g, "\ ") + ":";
                                } 
                            });
                            selectedList = selectedList.slice(0, -1)
                            console.log(selectedList) 
                            // now do things accordingly
                            accessTokenResource.get({}).$promise.then(
                                function (token) {
                                    var accessToken = token.access_token
                                    if (accessToken !== "") {
                                        $scope.loading = true;  
                                        $rootScope.$broadcast("notify", "Loading files");  
                                        // if dialogmod is in fileselect or outputfolder
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
                                                        $scope.selectedFilesGridOptions.data.push(item);
                                                    });
                                                    $scope.gridApi.grid.refresh();
                                                }
                                                else
                                                    $rootScope.$broadcast("notify", "Failed to load " + selectedList);
                                                $scope.loading = false;
                                            },
                                            function (error) {
                                                $scope.loading = false;
                                                console.log(error);
                                                $rootScope.$broadcast("notify", "Error: Problem loading files:" + selectedList);
                                            }
                                        );  
                                    }
                                }
                            );
                        }                      
                    }// done if
                    // save new template
                    if($scope.dialogmode === 'newtemplate'){
                        if($scope.dialogGridOptions.data.includes($scope.dialogInput))
                            $rootScope.$broadcast("notify", "Overwriting " + $scope.dialogInput);
                            accessTokenResource.get({}).$promise.then(
                            function (token) {
                                var accessToken = token.access_token
                                if (accessToken !== "") {
                                    $scope.loading = true;  
                                    var formData = getFormData($scope.dialogmode);
                                    saveTemplate.get({"templateinfo": btoa(JSON.stringify(formData)),
                                                      "templateName": $scope.dialogInput,
                                                      "access_token": accessToken
                                                    }).$promise.then(
                                        function(returnData) {
                                            $scope.loading = false;
                                            $rootScope.$broadcast("notify", "Successfuly save template " + $scope.dialogInput);
                                        },
                                        function (error) {
                                            $scope.loading = false;
                                            console.log(error);
                                            $rootScope.$broadcast("notify", "Error: Problem saving template:" + $scope.dialogInput);
                                        }
                                    )
                                }
                            }
                        );   
                    }
                    // load an existing template
                    if($scope.dialogmode === 'loadtemplate'){
                        if(answer.length == 0)
                            $rootScope.$broadcast("notify", "You have not selected any template");
                        else{                            
                            $rootScope.$broadcast("notify", "Loading template:" + answer[0].template);
                            accessTokenResource.get({}).$promise.then(
                                function (token) {
                                    var accessToken = token.access_token
                                    if (accessToken !== "") {
                                        $scope.loading = true;    
                                        loadTemplate.get({
                                            'templateName': answer[0].template,
                                            'access_token': accessToken
                                        }).$promise.then(
                                            function(returnData) {
                                                $scope.loading = false;
                                                var data = returnData.commandResult[0].contents;
                                                // parse single quote to double quote
                                                var jsonData = ( new Function("return " + data) )();
                                                // load the jsonData into the form
                                                setFormData(jsonData);
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
                    }
                }, function() {
                    console.log("cancelled");
                });
            }
            var thisScope = $scope;
	        $scope.dialogInput = "";
            function DialogController($scope, $mdDialog) {
                $scope.dialogmode = thisScope.dialogmode;
                $scope.currentData = [];
                var columnDefs = [];
                if (['fileselect', 'folderselect', 'outputfolder'].includes($scope.dialogmode)){
                    columnDefs =  [
                        { name: 'name', displayName: 'Name', allowCellFocus : false, width: '60%' },
                        { name: 'size', displayName: 'Size', allowCellFocus : false, width: '5%' },
                        { name: 'owner', displayName: 'Owner', allowCellFocus : false, width: '10%' },
                        { name: 'group', displayName: 'Group', allowCellFocus : false, width: '5%' },
                        { name: 'permission', displayName: 'Permission', allowCellFocus : false, width: '15%' }  
                    ];
                }
                else{
                    columnDefs =  [
                        { name: 'template', displayName: 'Template Name', allowCellFocus : false}
                    ];
                }
                var multiSelect = ['fileselect', 'folderselect'].includes($scope.dialogmode);
                    $scope.dialogGridOptions = {
                    showTreeExpandNoChildren: false,
                    enableRowSelection: false,
                    enableRowHeaderSelection: true,
                    multiSelect: multiSelect,
                    noUnselect: false,
                    data: [],
                    columnDefs: columnDefs
                };
                thisScope.dialogGridOptions = $scope.dialogGridOptions;
   
                $scope.dialogGridOptions.onRegisterApi = function( gridApi ) {
                    $scope.gridApi = gridApi;
                    if (['fileselect', 'folderselect', 'outputfolder'].includes($scope.dialogmode)){
                        $scope.gridApi.treeBase.on.rowExpanded($scope, function(row) {
                            console.log("get folder....");
                            getFolder(row.entity.path);
                        });                        
                    }
        		    else{
            			console.log("invoe @ on Register API");
            			getAvailableTemplates();
        		    }
                };
            
                var writeoutNode = function( childArray, currentLevel, dataArray ){
                    childArray.forEach( function( childNode ){
                        childNode.$$treeLevel = currentLevel;
                        dataArray.push( childNode );
                        if(childNode.children.length >0)
                            writeoutNode( childNode.children, currentLevel + 1, dataArray );
                    });
                };

                var writeoutData = function(newData, currentElem, path){
                    if (currentElem.path === path ) 
                        currentElem.children = newData;
                    else if (path.startsWith(currentElem.path)){
                        currentElem.children.forEach(function(element){
                            writeoutData(newData, element, path);
                        });
                    }   
                };
                var getFolder = function(path){
                    console.log("Loading:" + path) 
                    accessTokenResource.get({}).$promise.then(
                        function (token) {
                            var accessToken = token.access_token
                            if (accessToken !== "") {
                                console.log("Loading:" + path) 
                                console.log("Loading:" + btoa(path)) 
                               listFolder.get({
                                    'folderpath': btoa(path),
                                    'access_token': accessToken
                                   }).$promise.then(
                                     function(returnData){
                                        console.log(returnData);
                                        var data = returnData.commandResult;
                                        if(data == null){
                                            $scope.loading = false;
                                            $rootScope.$broadcast("notify", "Error loading:" + path + ". You probably do not have permission");
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
                                            element.path = path + '/' + element.name
                                        });
                                        if($scope.currentData.length == 0)
                                            $scope.currentData = data;
                                        else{
                                            $scope.currentData.forEach(function(element){
                                                writeoutData(data, element, path);  
                                            });
                                        }
                                        $scope.dialogGridOptions.data = [];
                                        writeoutNode($scope.currentData, 0, $scope.dialogGridOptions.data );
                                        $scope.gridApi.grid.refresh();
                                        // only select files or folder
                                        $scope.dialogGridOptions.isRowSelectable = function(row){
                                            // can select either file or folder
                                            return (['fileselect', 'folderselect'].includes($scope.dialogmode))? row.entity.type === 'f': row.entity.type === 'd';
                                        };
                                        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
                                    }
                                ),
                                function (error) {
                                    $scope.loading = false;
                                    $rootScope.$broadcast("notify", "Error loading:" + path + ". You probably do not have permission");
                                }
                            }
                        },                          
                        function (error) {
                            $scope.loading = false;
                            $rootScope.$broadcast("notify", "Error getting an access token" + error);
                        }
                    );                  
                }


                var getAvailableTemplates = function(){
		            accessTokenResource.get({}).$promise.then(
                        function (token) {
                            var accessToken = token.access_token
                            if (accessToken !== "") {
                               listTemplate.get({
                                    'access_token': accessToken
                                   }).$promise.then(
                                     function(returnData){
                                        var data = returnData.commandResult;
			                            $scope.dialogGridOptions.data = data;
					                    $scope.gridApi.grid.refresh();
                                    }
                                )
                            }
                        },                          
                        function (error) {
                            $scope.loading = false;
                            $rootScope.$broadcast("notify", "Error getting an access token" + error);
                        }
                    );                  
                }

                console.log("get folder or templates here...");
                if(['fileselect', 'folderselect'].includes($scope.dialogmode) )
                    getFolder("/afm01");
                else if(['outputfolder'].includes($scope.dialogmode) )
                    getFolder(thisScope.userhome);
                else 
                    getAvailableTemplates();
                $scope.hide = function() {
                  $mdDialog.hide();
                };

                $scope.cancel = function() {
                  $mdDialog.cancel();
                };

                $scope.answer = function(answer) {
                  if(document.getElementById('dialog-input'))
		       thisScope.dialogInput = document.getElementById('dialog-input').value;
                  $mdDialog.hide(answer);
                };

                $scope.getSelected = function(){
                    return $scope.gridApi.selection.getSelectedRows(); 
                }
            }



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

            /**
            * load psf
            */
            $scope.loadPsf = function() {
                console.log('load psf here');
                // open another window to show
            }

            var toPythonBoolean = function (booleanValue){
                var s = booleanValue.toString();
                return s && s[0].toUpperCase() + s.slice(1);
            }
 
            /**
            * get the data supplied by the user for this form
            */
            var getFormData = function(mode){
                var selectedFiles = [];
                var selectedFolders = new Set();
                $scope.selectedFilesGridOptions.data.forEach( function( item ){
                    var filePath = item.path;
                    selectedFiles.push(filePath);
                    var extension = filePath.split('.').pop();
                    var dirname = filePath.match(/(.*)[\/\\]/)[1]||'';
                    selectedFolders.add(dirname + "/*" + extension);
                });
                if($scope.preference.automaticRegularizationScale){
                    $scope.preference.regularization = -1;
                }
                if(mode==='folderselect')
                    $scope.preference.folder = Array.from(selectedFolders).join();
                
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
                   //////new stuff here////
                   'folders': $scope.preference.folder,
                   'latSpacing': $scope.preference.lateralSpacing,
                   'axSpacing': $scope.preference.axialSpacing,
                   'psfLatSpacing': $scope.preference.psfLateralSpacing,
                   'psfAxSpacing': $scope.preference.psfAxialSpacing,
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
                   //'split': $scope.preference.split,
                   //'splitIdx': $scope.preference.splitIdx,
                   //'access_token': accessToken
                };
                console.log(formData);
                if (isNaN(formData.axSpacing) || isNaN(formData.latSpacing))
                    throw "Lateral Spacing and Axial spacing cannot be null";
                    return formData;
                }

            /**
            * set form data to preference
            */
            var setFormData = function(data){
                console.log("Setting form data");
                console.log(data);
                $scope.preference.NA = parseFloat(data.NA);
                $scope.preference.RI = parseFloat(data.RI);
                $scope.preference.axialSpacing = parseFloat(data.axialSpacing);
                $scope.preference.backgroundType = data.backgroundType;
                $scope.preference.blind = data.blind == 'True';
                $scope.preference.gpus =  parseInt(data.devices);
                $scope.preference.fileformat = $scope.fileFormatType[parseInt(data.format)];
                $scope.preference.generatePsf = data.generatePsf == 'True';
                $scope.preference.numberOfParallelJobs = parseInt(data.instances);
                $scope.preference.lateralSpacing = parseFloat(data.lateralSpacing);
                $scope.preference.mem = parseInt(data.mem);
                $scope.preference.ns = parseFloat(data.ns);
                $scope.preference.postfilter = $scope.postFilterTypes[parseInt(data.postFilter)];
                $scope.preference.prefilter = $scope.preFilterTypes[parseInt(data.preFilter)];
                $scope.preference.psfAxialSpacing = parseFloat(data.psfAxSpacing);
                $scope.preference.psfFile = data.psfFile;
                $scope.preference.psfLateralSpacing = parseFloat(data.psfLatSpacing);
                $scope.preference.psfModel = $scope.psfModelTypes[parseInt(data.psfModel)];
                $scope.preference.psfType = $scope.psfTypes[parseInt(data.psfType)];
                $scope.preference.regularization = parseFloat(data.regularization);
                $scope.preference.regularizationType = $scope.regularizationType[parseInt(data.regularizationType)];
                $scope.preference.scaling = $scope.scalingType[parseInt(data.scaling)];
                $scope.preference.swapPsfZT = data.swapPsfZT == 'True';
                $scope.preference.swapZT = data.swapZT == 'True';
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
                    var formData = getFormData($scope.dialogmode);
                    accessTokenResource.get({}).$promise.then(
                        function (token) {
                            var accessToken = token.access_token
                            if (accessToken !== "") {
                                var executioninfo = {   "executioninfo": btoa(JSON.stringify(formData)),
                                    "instances": formData.instances,
                                    "arrayMax":formData.arrayMax,
                                    "mem": formData.mem,
                                    "devices": formData.devices,
                                    "output": formData.output,
                                    "access_token": accessToken
                                }
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
            }


}]);
