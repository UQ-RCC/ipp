'use strict';

angular.module('microvolution.files-manager', ['ngRoute', 'ngResource', 'ngMaterial', 
                                            'ui.grid', 'ui.grid.selection', 
                                            'microvolution.filesexplorer', 'microvolution.services'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/files-manager', {
            templateUrl: 'files-manager/files-manager.html',
            controller: 'FilesManagerCtrl'
        });
    }])

    .controller('FilesManagerCtrl', ['$scope', '$rootScope', '$interval', '$location', 
        'SessionInfoFactory', 'AccessTokenFactory', 'TokenHandler', 'ListFolderFactory', 
        'UserPreferenceFactory', '$mdDialog', '$uibModal', 
        'DeleteFilesFactory', 'CopyFilesFactory', 'MoveFilesFactory', 'ListCopyingProcessFactory',
        function ($scope, $rootScope, $interval, $location, 
            SessionInfoFactory, AccessTokenFactory, TokenHandler, ListFolderFactory, 
            UserPreferenceFactory, $mdDialog, $uibModal, 
            DeleteFilesFactory, CopyFilesFactory, MoveFilesFactory, ListCopyingProcessFactory) {
            
            //refresh experiment
            var filesListRefreshTimer;
            $scope.filesmanagerOptions = {
                'currentpath': "/afm01",
                'selectAll': false,
                'selectedItems': [],
                'bookmarkEdit': false,
                'shortcuts': [],
                'loading': false
            };


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
                document.getElementById("filesmanagermgr").className="menu__link active";
                document.getElementById("prepmgr").style.display="block";
                document.getElementById("prepmgr").className="menu__link";

                $scope.session = sessionData;
                AccessTokenFactory.get({}).$promise.then(function (tokenData) {
                    TokenHandler.set(tokenData.access_token);
                    //get the jobs for the first time
                    $scope.init();
                    //listFolder($scope.filesmanagerOptions.currentpath);
                    filesListRefreshTimer=$interval(function(){ls($scope.filesmanagerOptions.currentpath);},40000);
                });
                 
            });
            
            
            // Stop refreshing the experiments if the route changes
            $scope.$on('$destroy', function () {
                if (filesListRefreshTimer) {
                    $interval.cancel(filesListRefreshTimer);
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
                $scope.filesmanagerOptions.loading = true;
                ListFolderFactory.query({
                    'folderpath': btoa(newPath)
                }).$promise.then(
                     function(returnData){
                        console.log("Listing:" + newPath);
                        console.log(returnData);
                        //for some reason 500 is considered success :-s
                        if(returnData.status == 500){
                            $scope.filesmanagerOptions.loading = false;
                            $scope.filesmanagerOptions.currentpath = oldPath;
                            $rootScope.$broadcast("notify", "Error loading:" + newPath + ". You probably do not have permission");
                            return;
                        }
                        var data = returnData.commandResult;
                        if(data == null){
                            $scope.filesmanagerOptions.loading = false;
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
                        $scope.filesmanagerOptions.filesFolderList = data;
                        $scope.filesmanagerOptions.loading = false;
                        $scope.filesmanagerOptions.currentpath = newPath;
                        // save to currentpath
                        var lastPath = {'lastPath': newPath};
                        UserPreferenceFactory.update({}, JSON.stringify(lastPath));
                    }
                ),
                function (error) {
                    console.log("Error: failed to load:" + newPath);
                    $scope.filesmanagerOptions.loading = false;
                    $scope.filesmanagerOptions.currentpath = oldPath;
                    $rootScope.$broadcast("notify", "Error loading:" + newPath + ". You probably do not have permission");
                }                 
            };

            var createQuickNavs = function(folderPath){
                // splitting path into paths
                var paths = folderPath.split("/");
                var path = "/";
                $scope.filesmanagerOptions.paths = [path];
                paths.forEach(function(item){
                    if(item !=""){
                        path = path + item + "/";
                        $scope.filesmanagerOptions.paths.push(path);
                    }
                });
            }

            /*
            * init the file explorer
            */
            $scope.init = function(){
                // now move into shotcuts
                var home = "/clusterdata/";
                if($scope.session != undefined && $scope.session != null){
                    home = home + $scope.session.uname;
                }
                // query the list of bookmarks
                UserPreferenceFactory.get().$promise.then(
                    function (data) {
                        // bookmarks
                        if(data.hasOwnProperty("bookmarks"))
                            $scope.filesmanagerOptions.shortcuts = JSON.parse(data["bookmarks"]);
                        else
                            $scope.filesmanagerOptions.shortcuts = []; 
                        // home   
                        var hasHome = false;
                        $scope.filesmanagerOptions.shortcuts.forEach(function(item){
                            if(item.label == 'home'){
                                hasHome = true;
                            }
                        });
                        if(!hasHome){
                            $scope.filesmanagerOptions.shortcuts.unshift({'label': 'home', 'path':home})
                        }
                        // last path
                        var lastPath = "";
                        if(data.hasOwnProperty("lastPath"))
                            lastPath = data["lastPath"];
                        // only set to last path if initialPath is not empty
                        if(lastPath && 
                            ($scope.filesmanagerOptions.initialPath == null 
                                || $scope.filesmanagerOptions.initialPath.trim()=="") ){
                            $scope.filesmanagerOptions.currentpath = lastPath;
                        } 
                        // load it
                        //default path
                        createQuickNavs($scope.filesmanagerOptions.currentpath);
                        ls($scope.filesmanagerOptions.currentpath, "");
                    }
                );
            };    

            $scope.refresh = function () {
                ls($scope.filesmanagerOptions.currentpath);
            };

            /**
            * copy current path to clipboard
            */
            $scope.copyCurrentPathToClipboard = function(){
                var copyElement = document.createElement("textarea");
                copyElement.style.position = 'fixed';
                copyElement.style.opacity = '0';
                copyElement.textContent = $scope.filesmanagerOptions.currentpath;
                var body = document.getElementsByTagName('body')[0];
                body.appendChild(copyElement);
                copyElement.select();
                try{
                    var successful = document.execCommand('copy');
                    if (!successful) throw successful;
                    $rootScope.$broadcast("notify", "Copied to clipboard");

                }
                catch (err) {
                    $rootScope.$broadcast("notify", "Error: cannot copy to clipboard");
                }
                body.removeChild(copyElement);
            }

            /**
            *
            */
            $scope.addShortcut = function (shortcutPath) {
                shortcutPath = shortcutPath.replace(/\/$/, "");
                var shortcutName = shortcutPath.substring(shortcutPath.lastIndexOf('/')+1);
                // add it to the existing paths
                $scope.filesmanagerOptions.shortcuts.push({'label': shortcutName, 'path': shortcutPath});
                // save it to preference
                var bookmarks = {'bookmarks':  angular.toJson( $scope.filesmanagerOptions.shortcuts )};
                UserPreferenceFactory.update({}, JSON.stringify(bookmarks));
            };

            $scope.removeShortcut = function(shortcut){
                for(var i = $scope.filesmanagerOptions.shortcuts.length - 1; i >= 0; i--) {
                    var item = $scope.filesmanagerOptions.shortcuts[i];
                    if(item.label == shortcut.label && item.path == shortcut.path) {
                       $scope.filesmanagerOptions.shortcuts.splice(i, 1);
                       break;
                    }
                }
                var bookmarks = {'bookmarks':  angular.toJson( $scope.filesmanagerOptions.shortcuts )};
                UserPreferenceFactory.update({}, JSON.stringify(bookmarks));
            }

            $scope.visitShortcut = function(shortcutPath){
                createQuickNavs(shortcutPath);
                ls(shortcutPath, $scope.filesmanagerOptions.currentpath);
            };


            /**
              * dive into afolder
              */
            $scope.navigate = function(item){
                // do not bother navigating into a file
                if(item.permission.startsWith('-'))
                    return;
                var oldPath = $scope.filesmanagerOptions.currentpath;
                var newPath = $scope.filesmanagerOptions.currentpath + item.name;
                createQuickNavs(newPath);
                ls(newPath, oldPath);
            };
            
            $scope.toggleBookmarkEdit = function(){
                console.log("@bookmarkedit" + $scope.filesmanagerOptions.bookmarkEdit);
                $scope.filesmanagerOptions.bookmarkEdit=!$scope.filesmanagerOptions.bookmarkEdit;
            }

            /*
            * when change the path
            */
            $scope.onPathChange = function(newPath){
                ls($scope.filesmanagerOptions.currentpath, "");
            };


            /**
              * only available for files
              */
            $scope.selectAllItems = function(){
                $scope.filesmanagerOptions.selectedItems = [];
                $scope.filesmanagerOptions.filesFolderList.forEach(function(item){
                    if(item.permission.startsWith('-')){
                        item.selected = $scope.filesmanagerOptions.selectAll;              
                    }
                    if(item.selected){
                        $scope.filesmanagerOptions.selectedItems.push(item);
                    }
                });
            };


            $scope.selectItem = function(item){
                if(item.selected){
                    $scope.filesmanagerOptions.selectedItems.push(item);
                }
                else{
                    $scope.filesmanagerOptions.selectedItems.pop(item);
                }
            };

            /*************************************************************/
            $scope.createFileFolder = function(){

            }

            $scope.deleteFileFolder = function(ev){
                var selectedFilesPaths = [];
                $scope.filesmanagerOptions.selectedItems.forEach(function(file) {
                    selectedFilesPaths.push(file.path);
                });
                $mdDialog.show({
                  controller: DialogController,
                  templateUrl: 'files-manager/confirm-delete.tmpl.html',
                  parent: angular.element(document.body),
                  targetEvent: ev,
                  clickOutsideToClose:true,
                  fullscreen: false
                })
                .then(function(answer) {
                    console.log('your choice "' + answer + '"');
                    if(answer == 'yes'){
                        $scope.filesmanagerOptions.loading = true;
                        doDeleteFileFolder(selectedFilesPaths);
                        $scope.refresh();
                        $scope.filesmanagerOptions.loading = false;
                    }
                }, function() {
                    console.log('You cancelled the dialog.');
                });
            }

            ///// for the dialog
            var currentScope = $scope;
            function DialogController($scope, $mdDialog) {
                $scope.selectedItems = currentScope.filesmanagerOptions.selectedItems;
                $scope.hide = function() {
                  $mdDialog.hide();
                };

                $scope.cancel = function() {
                  $mdDialog.cancel();
                };

                $scope.answer = function(answer) {
                  $mdDialog.hide(answer);
                };
            }

            $scope.copyFolder = function(ev, deleteSource){
                // get the selected files
                var selectedFilesPaths = [];
                var numberOfFolders = 0;
                $scope.filesmanagerOptions.selectedItems.forEach(function(file) {
                    selectedFilesPaths.push(file.path);
                    if(file.permission.startsWith('d')){
                        numberOfFolders = numberOfFolders + 1;
                    }
                });
                if(numberOfFolders != 1 && numberOfFolders != $scope.filesmanagerOptions.selectedItems.length){
                    showAlertDialog("The portal only supports copy one folder at a time");
                    return;
                }
                var sourceDir = selectedFilesPaths[0];
                $scope.filesmanagerOptions.loading = true;
                // check whether there is any copying process going on
                ListCopyingProcessFactory.list().$promise.then(
                    function(returnData) {
                        var copyingProcess = returnData.commandResult;
                        if(copyingProcess.length == 0){
                            $scope.startCopyingFolder(ev, sourceDir, deleteSource);
                        }
                        else {
                            showAlertDialog("It seems another copying process is going on. Wait for it to finish.");
                            $scope.filesmanagerOptions.loading = false;
                            return;
                        }
                    },
                    function (error) {
                        $scope.filesmanagerOptions.loading = false;
                        showAlertDialog("Problem accessing Wiener");
                    }
                );

                

            }


            $scope.startCopyingFolder = function(ev, sourceDir, deleteSource){
                // TODO find a smater way to deal with this
                var parallel = 8;
                // now open the files explorer to get the destination folder
                var $ctrl = this;
                $ctrl.modalContents = {};
                $ctrl.modalContents.mode = 'selectoutput';
                $ctrl.modalContents.title = "Select Destination Folder";
                $ctrl.modalContents.initialPath = $scope.filesmanagerOptions.currentpath;
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
                    doCopyFolder(ev, sourceDir, $ctrl.selected, deleteSource, parallel);
                })
            }

            // delete list of files/folder
            var doDeleteFileFolder = function(fileList){
                var fileListStr = fileList.join(";");
                $scope.filesmanagerOptions.loading = true;
                DeleteFilesFactory.delete({
                    'fileslist': btoa(fileListStr)
                }).$promise.then(
                    function(returnData) {
                        $scope.refresh();
                    },
                    function (error) {
                        $scope.filesmanagerOptions.loading = false;
                        showAlertDialog("Problem deleting files:" + fileList);
                    }
                );
            }
            // move files/folders
            var doCopyFolder = function(ev, sourceDir, destDir, deleteSource, parallel){
                $scope.filesmanagerOptions.loading = true; 
                if(deleteSource){
                    MoveFilesFactory.move({
                        'sources': btoa(sourceDir),
                        'dest': btoa(destDir),
                        'parallel': parallel,
                        'usermail': $scope.session.email
                    }).$promise.then(
                        function(returnData) {
                            $scope.refresh();
                        },
                        function (error) {
                            $scope.filesmanagerOptions.loading = false;
                            showAlertDialog("Problem moving files:" + fileList);
                        }
                    );  
                } else {
                    CopyFilesFactory.copy({
                        'sources': btoa(sourceDir),
                        'dest': btoa(destDir),
                        'parallel': parallel,
                        'usermail': $scope.session.email
                    }).$promise.then(
                        function(returnData) {
                            $rootScope.$broadcast("notify", "Start copying to :"+destDir);
                            $scope.filesmanagerOptions.loading = false;
                        },
                        function (error) {
                            $scope.filesmanagerOptions.loading = false;
                            showAlertDialog("Problem copying files:" + fileList);
                        }
                    );
                }
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


        }]);




