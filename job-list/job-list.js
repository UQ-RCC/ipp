'use strict';

angular.module('strudelWeb.job-list', ['ngRoute', 'ngResource'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/job-list', {
            templateUrl: 'job-list/job-list.html',
            controller: 'JobListCtrl'
        });
    }])

    .controller('JobListCtrl', ['$scope', '$rootScope', '$resource', '$interval', '$location', '$mdSidenav', '$mdMedia', '$mdDialog', 'settings',
        function ($scope, $rootScope, $resource, $interval, $location, $mdSidenav, $mdMedia, $mdDialog, settings) {
            // Resources
            var sessionInfoResource = $resource(settings.URLs.apiBase + settings.URLs.sessionInfo);
            var accessTokenResource = $resource(settings.URLs.apiBase + settings.URLs.accessToken, {}, {
                'get': {
                    isArray: false
                }
            });
            //var endSessionResource = $resource(settings.URLs.apiBase + settings.URLs.logout);
            
            var getJobsResource = $resource(settings.URLs.serverApiBase + settings.URLs.listJobs, {}, {
                'get': {
                    isArray: false
                }
            });
            $scope.jobs = [];
            //refresh experiment
            var jobListRefreshInProgress = false;
            var jobListRefreshPromise;
            $scope.refreshCountdown = 1000;

            // Gets the session data and redirects to the login screen if the user is not logged in
            sessionInfoResource.get({}).$promise.then(function (sessionData) {
		        if (sessionData.has_oauth_access_token !== "true") {
                    $location.path("/landingpage");
                    return;
                }            
                document.getElementById("myCarousel").style.display="none";
                document.getElementById("login").style.display="none";
                document.getElementById("logout-btn").style.display="block";
                document.getElementById("joblistmgr").style.display="block";
                document.getElementById("jobsubmitmgr").style.display="block";

                $scope.session = sessionData;
                //get the jobs for the first time
		        accessTokenResource.get({}).$promise.then(
                    function (token) {
                        var accessToken = token.access_token
                        if (accessToken !== "") {
                            getJobsResource.get({'access_token': accessToken}).$promise.then(
                                function(returnData){
                                    var data = returnData.commandResult;
                                    $scope.jobs = [];
                                    // Check the status of each desktop
                                    for (var i = 0; i < data.length; i++) {
                                        (function (jobData) {                                    
                                            $scope.jobs.push({
                                                'jobid': jobData.jobid,
                                                'uname': jobData.uname,
                                                'status': jobData.status,
                                                'nnodes': jobData.nnodes,
                                                'remainingWalltime': jobData.remainingWalltime,
                                                'selected': false, 
                                            });
                                        })(data[i]);
                                    }                            
                                }
                            )// end get JobsResource
                        }//end if
                    }
                ); 

            });

            
            $scope.refreshJobList = function () {
            	function doRefresh() {
                    jobListRefreshInProgress = true;
                    accessTokenResource.get({}).$promise.then(
                        function (token) {
                            var accessToken = token.access_token
                            if (accessToken !== "") {
                                getJobsResource.get({'access_token': accessToken}).$promise.then(
                                    function(returnData){
                                        var data = returnData.commandResult;
                                        $scope.jobs = [];
                                        for (var i = 0; i < data.length; i++) {
                                            (function (jobData) {                                    
                                                $scope.jobs.push({
                                                    'jobid': jobData.jobid,
                                                    'uname': jobData.uname,
                                                    'status': jobData.status,
                                                    'nnodes': jobData.nnodes,
                                                    'remainingWalltime': jobData.remainingWalltime,
                                                    'selected': false, 
                                                });
                                            })(data[i]);
                                        }                            
                                    },//end function data
                                    function (error) {
                                        $rootScope.$broadcast("notify", "Could not refresh experiment list!");
                                    }
                                    ).finally(
                                        function () {
                                            jobListRefreshInProgress = false;
                                            $scope.refreshCountdown = 1000;
                                            jobListRefreshPromise = $interval(function () {
                                                if ($scope.refreshCountdown > 0) {
                                                    $scope.refreshCountdown--;
                                                }
                                            }, 30, 100);
                                            jobListRefreshPromise.then(function () {
                                                doRefresh();
                                            });

                                        }
                                    );
                            }
                        }
                    );
                }

                if (angular.isDefined(jobListRefreshPromise) && !jobListRefreshInProgress) {
                    $interval.cancel(jobListRefreshPromise);
                    jobListRefreshPromise = undefined;
                }
                if (!jobListRefreshInProgress) {
                    doRefresh();
                }
            };

            // Stop refreshing the experiments if the route changes
            $scope.$on('$destroy', function () {
                if (jobListRefreshPromise) {
                    $interval.cancel(jobListRefreshPromise);
                }
            });
            //list experiment is in progress
            $scope.jobListRefreshInProgress = function(){
                return jobListRefreshInProgress;
            }
            
            //kill all seleced jobs
            $scope.killSelectedJob = function(){
                console.log("Request to kill selected jobs");
            }

            //extend all selected jobs
            $scope.extendSelectedJob = function(){
                console.log("Request to extend selected jobs");
            }
        
            //$scope.$on('refresh-event', function(event, profileObj) {
            //    refreshJobList();
            //});
            
            $scope.refreshJobList();

        }])


;
