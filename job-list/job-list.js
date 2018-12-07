'use strict';

angular.module('microvolution.job-list', ['ngRoute', 'ngResource'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/job-list', {
            templateUrl: 'job-list/job-list.html',
            controller: 'JobListCtrl'
        });
    }])

    .controller('JobListCtrl', ['$scope', '$rootScope', '$interval', '$location', 
        'SessionInfoFactory', 'AccessTokenFactory', 'ListJobsFactory', 'StopJobsFactory', 'TokenHandler',
        function ($scope, $rootScope, $interval, $location, 
            SessionInfoFactory, AccessTokenFactory, ListJobsFactory, StopJobsFactory, TokenHandler) {
            
            $scope.jobs = [];
            //refresh experiment
            var jobListRefreshTimer;

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
                document.getElementById("contact-btn").className="menu__link";
                document.getElementById("accesspolicy-btn").className="menu__link";
                document.getElementById("login").style.display="none";
                document.getElementById("logout-btn").style.display="block";
                document.getElementById("joblistmgr").style.display="block";
                document.getElementById("about-btn").style.display="none";
                document.getElementById("contact-btn").style.display="none";
                document.getElementById("accesspolicy-btn").style.display="none";
                document.getElementById("joblistmgr").className="menu__link active";
                document.getElementById("jobsubmitmgr").style.display="block";
                document.getElementById("jobsubmitmgr").className="menu__link";
                document.getElementById("convertermgr").style.display="block";
                document.getElementById("convertermgr").className="menu__link";

                AccessTokenFactory.get({}).$promise.then(function (tokenData) {
                    TokenHandler.set(tokenData.access_token);
                    //get the jobs for the first time
                    jobListRefreshTimer=$interval(function(){queryJobs();},4000);
                });
                 
            });

            var queryJobs = function(){
                ListJobsFactory.query().$promise.then(
                    function(returnData){
                        console.log(returnData);
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
                );
            }
            
            // Stop refreshing the experiments if the route changes
            $scope.$on('$destroy', function () {
                if (jobListRefreshTimer) {
                    $interval.cancel(jobListRefreshTimer);
                }
            });
            
            
            //kill all seleced jobs
            $scope.killSelectedJob = function(){
                $scope.jobs.forEach(function(job){
                    if(job.selected){
                         StopJobsFactory.stop({'jobidNumber': job.jobid}).$promise.then(
                            function(){
                                $rootScope.$broadcast("notify", "Job:" + job.jobid + " cancelled");
                            }
                         );
                    }
                });

            }

        }]);




