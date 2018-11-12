'use strict';

// Declare app level module which depends on views, and components
angular.module('microvolution', [
    'ngMaterial',
    'ngRoute',
    'ui.grid', 
    'ui.bootstrap',
    'ui.grid.selection',
    'microvolution.job-list',
    'microvolution.job-submit',
    'microvolution.landingpage',
    'microvolution.partials',
    'microvolution.faqdirectives'
]).
    config(['$routeProvider', '$httpProvider',
        function ($routeProvider, $httpProvider) {
            $routeProvider.otherwise({redirectTo: '/landingpage'});
            $httpProvider.interceptors.push('APIInterceptor');
        }])
    .constant('settings', {
        'URLs': {
            'base': '/client/',
            'apiBase': '/client/api/',
            'oauthStart': 'login',
            'logout': 'end_session',
            'sessionInfo': 'session_info',
            'accessToken': 'access_token',
            'serverApiBase': 'https://wwi-test.qbi.uq.edu.au/wiener/api/',
            'home': 'execute/home',
            'listJobs': 'execute/listall',
            'listFolder': 'execute/listfolder',
            'filesInfo': 'execute/filesinfo',
            'testExecution': 'execute/testexecute',
            'loadTemplate': 'execute/loadtemplate',
            'listTemplate': 'execute/listtemplate',
            'saveTemplate': 'execute/savetemplate',
            'executeMicrovolution': 'execute/executemicrovolution',
            'listFolderBase64': 'execute/listfolderbase64',
            'filesInfoBase64': 'execute/filesinfobase64',
            'folderInfoBase64': 'execute/folderinfobase64',
            'fileInfoBase64': 'execute/fileinfobase64',
            'testExecutionBase64': 'execute/testexecutebase64',
            'saveTemplateBase64': 'execute/savetemplatebase64',
            'executeMicrovolutionBase64': 'execute/executemicrovolutionbase64'  
        },
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
    .controller('AppCtrl', ['$mdToast', '$rootScope', '$scope', '$interval', '$window', 'settings','$location','$resource',
        function ($mdToast, $rootScope, $scope, $interval, $window, settings,$location,$resource) {
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
        
        var endSessionResource = $resource(settings.URLs.apiBase + settings.URLs.logout);

        // Resources
        var sessionInfoResource = $resource(settings.URLs.apiBase + settings.URLs.sessionInfo);
        // Starts the login auth flow
        var loginWindow;
        $scope.startLogin = function (service) {
            var width = 800,
                height = 600;
            var left = screen.width/2 - width/2,
                top = screen.height/2 - height/2;

            var url = settings.URLs.base + settings.URLs.oauthStart + "?service="+service;
            loginWindow = $window.open('about:blank', '', "top=" + top + ",left=" + left + ",width="+width+",height="+height); //yi removed
            // End any existing sessions before starting a new one
            endSessionResource.get({}, function() {
                loginWindow.location = url;
            });
        };
        var accessTokenResource = $resource(settings.URLs.apiBase + settings.URLs.accessToken);
        // Called any time the login popup closes
        var onLoginWindowClose = function() {
            sessionInfoResource.get({}, function(data) {
                if (data.has_oauth_access_token === "true") {
                    document.getElementById("login").style.display="none";
                    document.getElementById("logout-btn").style.display="block";
                    $location.path("/job-submit");
                    document.getElementById("joblistmgr").style.display="block";
                    document.getElementById("jobsubmitmgr").style.display="block";
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

        // sign out
        $scope.doSignout = function () {
            console.log("Signing out");
            endSessionResource.get({}, function () {
                if(document.getElementById("login").style.display="none")
                {
                    document.getElementById("login").style.display="inline-block";
                    document.getElementById("logout-btn").style.display="none"; 
                    document.getElementById("joblistmgr").style.display="none"; 
                    document.getElementById("jobsubmitmgr").style.display="none"; 
                }

                $location.path("/landingpage");
            });
        };        
    }]);
