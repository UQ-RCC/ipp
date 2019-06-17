'use strict';

// Declare app level module which depends on views, and components
angular.module('microvolution', [
    'ngMaterial',
    'ngRoute',
    'ui.grid', 
    'ui.bootstrap',
    'as.sortable',
    'ui.grid.selection',
    'microvolution.job-list',
    'microvolution.job-submit',
    'microvolution.landingpage',
    'microvolution.partials',
    'microvolution.filesexplorer',
    'microvolution.converter',
    'microvolution.services',
    'microvolution.files-manager',
    'microvolution.preprocessing'
]).
    config(['$routeProvider', '$httpProvider',
        function ($routeProvider, $httpProvider) {
            $routeProvider.otherwise({redirectTo: '/landingpage'});
            $httpProvider.interceptors.push('APIInterceptor');
        }])
    .constant('settings', {
        'URLs': {
            'staticHomePage': 'http://localhost/',
            'base': '/client/',
            'apiBase': '/client/api/',
            'oauthStart': 'login',
            'logout': 'end_session',
            'sessionInfo': 'session_info',
            'accessToken': 'access_token',
            'serverApiBase': 'https://wwi-test.qbi.uq.edu.au/wiener/api/',
            'home': 'execute/home',
            'stop': 'execute/stop',
            'listJobs': 'execute/listall',
            'loadTemplate': 'execute/loadtemplate',
            'listTemplate': 'execute/listtemplate',
            'saveTemplate': 'execute/savetemplate',
            'listFolderBase64': 'execute/listfolderbase64',
            'filesInfoBase64': 'execute/filesinfobase64',
            'folderInfoBase64': 'execute/folderinfobase64',
            'fileInfoBase64': 'execute/fileinfobase64',
            'saveTemplateBase64': 'execute/savetemplatebase64',
            'executeMicrovolutionBase64': 'execute/executemicrovolutionbase64',
            'convertFileBase64': 'execute/convertfilebase64',
            'deleteBase64': 'execute/deletebase64',
            'copyBase64': 'execute/copybase64',
            'moveBase64': 'execute/moveBase64',
            'listCopyingProcess': 'execute/listCopying',
            'preprocess': 'execute/preprocessing'
                
        },
        'maxRetryOnServerError': 3
    })
    .service('APIInterceptor', ['$rootScope', '$location', '$injector', '$timeout', '$log', 'settings',
        function ($rootScope, $location, $injector, $timeout, $log, settings) {
            var service = this;

            // Keep track of the failures per URL
            var failures = {};

            service.request = function (config) {
                return config;
            };

            service.response = function (response) {
                if (response.status !== 500 && failures.hasOwnProperty(response.config.url)) {
                    delete failures[response.config.url];
                }
                return response;
            };

            service.responseError = function (response) {
                // Redirect to login page on unauthorised response
                if (response.status === 403) {
                    $rootScope.$broadcast("notify", "You've been logged out!");
                    $location.path('/');

                // Retry on 500
                } else if (response.status === 500) {
                    var url = response.config.url;
                    if (failures.hasOwnProperty(url)) {
                        failures[url]++;
                    } else {
                        failures[url] = 1;
                    }
                    if (failures[url] < settings.maxRetryOnServerError) {
                        $log.error("Retrying failed request (500) for URL " + url + " (" + failures[url] + "failures so far)");
                        return $timeout(function () {
                            var $http = $injector.get('$http');
                            return $http(response.config);
                        }, 3000);
                    }
                }
                return response;
            };
        }])
    .controller('AppCtrl', ['$mdToast', '$rootScope', '$scope', '$interval', '$window', 
        'settings','$location', 'SessionInfoFactory', 'EndSessionFactory', 
        'AccessTokenFactory', 'TokenHandler',
        function ($mdToast, $rootScope, $scope, $interval, $window, 
        settings,$location, SessionInfoFactory, EndSessionFactory, AccessTokenFactory, TokenHandler) {
            $rootScope.$on('notify', function (event, message) {
            $mdToast.show(
                $mdToast.simple()
                    .content(message)
                    .position("bottom right")
                    .hideDelay(10000)
            );
        });
        document.getElementById("logout-btn").style.display="none"; 
        document.getElementById("joblistmgr").style.display="none"; 
        document.getElementById("jobsubmitmgr").style.display="none"; 
        document.getElementById("convertermgr").style.display="none";
        document.getElementById("filesmanagermgr").style.display="none";
        document.getElementById("prepmgr").style.display="none";
        $scope.toolbarHidden = false;
        $rootScope.$on('makeToolbarVisible', function (event) {
            $scope.toolbarHidden = false;
        });

        $rootScope.$on('makeToolbarInvisible', function (event) {
            $scope.toolbarHidden = true;
        });
        $rootScope.$on('$routeChangeSuccess', function (event) {
            $scope.toolbarHidden = false;
        });
        
        // Starts the login auth flow
        var loginWindow;
        $scope.startLogin = function (service) {
            var width = 800,
                height = 600;
            var left = screen.width/2 - width/2,
                top = screen.height/2 - height/2;

            var url = settings.URLs.base + settings.URLs.oauthStart + "?service="+service;
            loginWindow = $window.open('about:blank', '', 
                "top=" + top + ",left=" + left + ",width="+width+",height="+height);
            // End any existing sessions before starting a new one
            EndSessionFactory.get({}, function() {
                loginWindow.location = url;
            });
        };
        // Called any time the login popup closes
        var onLoginWindowClose = function() {
            SessionInfoFactory.get({}, function(data) {
                if (data.has_oauth_access_token === "true") {
                    document.getElementById("home-btn").style.display="none";
                    document.getElementById("login").style.display="none";
                    document.getElementById("logout-btn").style.display="block";
                    $location.path("/files-manager");
                    document.getElementById("joblistmgr").style.display="block";
                    document.getElementById("jobsubmitmgr").style.display="block";
                    document.getElementById("convertermgr").style.display="block";
                    document.getElementById("filesmanagermgr").style.display="block";
                    document.getElementById("prepmgr").style.display="block";
                } else {
                    $rootScope.$broadcast("notify", "Login failed :(");
                    //hide login and register button
                    $("#over").remove(); //added
                }
            });
        };

        // Detects whether the login window is still open
        var loginWindowPreviouslyClosed = true;
        var loginWindowOpen = function() {
            var windowOpen = angular.isDefined(loginWindow) && loginWindow.closed === false;
            if (loginWindowPreviouslyClosed === false && windowOpen === false) {
                loginWindowPreviouslyClosed = true;
                onLoginWindowClose();
            } else if (loginWindowPreviouslyClosed === true && windowOpen === true) {
                loginWindowPreviouslyClosed = false;
            }
            return windowOpen;
        };
        $interval(loginWindowOpen, 500); // Don't rely on the digest cycle - it can be slow.

        $scope.showSpinner = function() {
            return loginWindowOpen();
        };

        // Disables the login button if the service is not selected, or a login is currently in progress
        $scope.loginButtonDisabled = function(service) {
            return !angular.isDefined(service) || loginWindowOpen();
        };

        $scope.sessionRefreshTimer = $interval(function(){
                                                console.log("....Checking session....");
                                                $scope.checkSession();
                                            },300000);// every 5 minutes
        $scope.checkSession = function(onValidAccessTokenCallback){
            SessionInfoFactory.get({}, function(data) {
                if (data.has_oauth_access_token !== "true") {
                    $location.path("/landingpage");
                    return;
                } else {
                    $scope.session = data;
                    AccessTokenFactory.get({}).$promise.then(function (tokenData) {
                        TokenHandler.set(tokenData.access_token);
                        if(onValidAccessTokenCallback){
                            onValidAccessTokenCallback();
                        }
                    }),
                    function (error) {
                        $location.path("/landingpage");
                        return;
                    };
                }
            }),
            function (error) {
                $location.path("/landingpage");
                return;
            };
        };
        $scope.$on('$destroy', function () {
            if ($scope.sessionRefreshTimer) {
                $interval.cancel($scope.sessionRefreshTimer );
            }
        });

        // sign out
        $scope.doSignout = function () {
            console.log("Signing out");
            EndSessionFactory.get({}, function () {
                if(document.getElementById("login").style.display="none")
                {
                    document.getElementById("home-btn").style.display="block";
                    document.getElementById("login").style.display="inline-block";
                    document.getElementById("logout-btn").style.display="none"; 
                    document.getElementById("joblistmgr").style.display="none"; 
                    document.getElementById("jobsubmitmgr").style.display="none"; 
                    document.getElementById("convertermgr").style.display="none";
                    document.getElementById("filesmanagermgr").style.display="none";
                    document.getElementById("prepmgr").style.display="none";
                }

                $location.path(settings.URLs.staticHomePage);
            });
        };

            
    }]);
