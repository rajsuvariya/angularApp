var app = angular.module('rcapp',['ui.router', 'ngCookies', 'base64']);

app.config(['$stateProvider','$urlRouterProvider',
	function ($stateProvider,$urlRouterProvider) {
		
		$urlRouterProvider.otherwise('/home');
		$stateProvider
			.state('home', {
				url: "/home",
				templateUrl: "home.html",
			}).state('login', {
				url: "/login",
				templateUrl: "Login.html",
			//	controller:'searchclr'
				//security :false
			}).state('search', {
				url: "/search",
				templateUrl: "search.html",
			//	controller:'searchclr'
				//security :false
			}).state('profile', {
				url: "/profile",
				templateUrl: "profile.html",
			//	controller:'profileclr'
				//security :true
			}).state('other', {
				url: "/other",
				templateUrl: "other.html",
			//	controller:'otherclr'
				//security :true
			}).state('requestbook', {
				url: "/requestbook",
				templateUrl: "requestbook.html",
			//	controller:'requestclr'
				//security :true
			}).state('otherprofile', {
				url: "/otherprofile",
				templateUrl: "otherprofile.html",
			//	controller:'homeclr'
				//security :true
			}).state('bookdetails', {
				url: "/bookDetails",
				templateUrl: "bookDetails.html"
			})
		}
]);

app.run(function ($rootScope,$cookies) {
        $rootScope.userid = null;
        $rootScope.otheruserid = null;
    });

app.service('Service', function(){
	var result;
    var book;
   return{
	   setdata :function(data) {
		  this.result= data;
	   },
	   getdata :function(){
	   	  return this.result;
	   },
	   setbook: function(data){
	   		this.book = data;
//	   		console.log(this.book);
	   },
	   getbook :function(){
	   	  return this.book;
	   }
   }
});
app.controller('homeclr',[ '$scope', '$rootScope', '$state', '$http', 'Service','$base64', '$cookies', function($scope,$rootScope,$state,$http,Service,$base64,$cookies){

	$scope.result = [];
	console.log("Home cookies:"+ $cookies.username);
	
	$scope.search = function(){
		
		var key = $scope.searchBook.split(' ').join('_');
		var urlnew ='https://www.googleapis.com/books/v1/volumes?q=' + key;
		

		$http({
		  method: 'GET',
		  url: urlnew,
		}).then(function successCallback(response) {
			Service.setdata(response.data.items);
			console.log("dtaa : "+Service.getdata());
			$state.go('search');
		  }, function errorCallback(response) {
	
		  });	
	};
	$scope.login = function(){
			$state.go('login');
	};
	$scope.profile = function(){
			$state.go('profile');
	};
}]);


app.controller('loginclr', [ '$scope', '$rootScope', '$state', '$http', 'Service','$base64', '$cookies', function($scope,$rootScope,$state,$http,Service,$base64,$cookies){

	$scope.profile = function(){
		var authdata = $base64.encode($scope.username + ':' + $scope.password);
	 	$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; 
		
		$http.get('https://webmail.daiict.ac.in/service/home/~/inbox.json').success(function(data,status,header,config) {
		 		$cookies.username = $scope.username;
		 		console.log("successfully LogIn:"+ $cookies.username);
		 		$state.go('profile');
			}).error(function(data, status, headers, config) {
				console.log('Not'+status+data);
			});
	};
}]);

app.controller('indexclr', function($scope,$state,$http){

	$scope.login = function(){
			$state.go('login');
	};

	$scope.profile = function(){
			$state.go('profile');
	};
});


app.controller('profileclr',[ '$scope', '$rootScope', '$state', '$http', 'Service','$base64', '$cookies',function($scope,$rootScope,$state,$http,Service,$base64,$cookies){
	if($cookies.username == '-1' | $cookies.username==null | $cookies.username==''){
		$state.go('home');
	}
	
	$rootScope.userid=$cookies.username;
	var userid = $cookies.username;

	console.log("Profile cookies:"+$cookies.username);
	console.log("Profile userid:"+userid);

	$scope.booklist = {};
	$http.get("http://localhost:3000/home/bookissue/").success(function(response){
			$scope.booklist = response;		
	});

	$scope.search = function(){

		var key = $scope.searchBook.split(' ').join('_');
		var urlnew ='https://www.googleapis.com/books/v1/volumes?q=' + key;
		

		$http({
		  method: 'GET',
		  url: urlnew,
		}).then(function successCallback(response) {
			Service.setdata(response.data.items);
			console.log("dtaa : "+Service.getdata());
			$state.go('search');
		}, function errorCallback(response) {
	
		});	

		$state.go('search');
	};
	$scope.other = function(){
		$state.go('other');
	};	
	$scope.requestbook = function(){
		$state.go('requestbook');
	};
	$scope.logout = function(){
		$cookies.username='';
		console.log("Logout cookies:"+$cookies.username);
		$state.go('home');
	};
	$scope.back = function(){
		$state.go('other');
	};
}]);




app.controller('searchclr', ['$scope', '$rootScope', '$state', '$http', 'Service','$base64', '$cookies', function($scope,$rootScope,$state,$http,Service,$base64,$cookies){
	console.log("searh cookies:"+$cookies.username);
	
	$scope.profileback = function(){
		$state.go('profile');
	};

	$scope.result = Service.getdata();
	$scope.ourResult = [];	
	$scope.requestBooks = [];
		

	angular.forEach($scope.result, function(value, key) {
  	//	console.log(key + ': ' + value.volumeInfo.industryIdentifiers[0].identifier);
  		var urlnew2 = 'http://localhost:3000/home/Book/'+value.volumeInfo.industryIdentifiers[0].identifier;
  	//	console.log("API USR:"+urlnew2);  		
 
 		$http.get(urlnew2).success(function(response){
 			console.log(response);
 			if(response.results[0]==null){
        		$scope.requestBooks.push(value);
 			}
 			else{
        		$scope.ourResult.push(value);
 			}
 		});
	});
	
	$scope.book = function(index){
//		console.log(index);
		Service.setbook($scope.ourResult[index]);
		$state.go("bookdetails");
	
	};
	
	$scope.bookMore = function(index){
//		console.log(index);
		Service.setbook($scope.requestBooks[index]);
		$state.go("bookdetails");
	
	};
	
	$scope.request = function(index){	
		Service.setbook($scope.requestBooks[index]);
		$state.go("requestbook");			
	}
	
	$scope.moredetails = function(){
		//$state.go('bookdetails');
	};


	$scope.homeback = function(){
		$state.go('home');
	};


	$scope.search = function(){
		$state.go('search');
	};

    $scope.bookdetails = function(){
		$state.go('bookdetails');
	};
}]);

app.controller('otherclr', [ '$scope', '$rootScope', '$state', '$http', 'Service','$base64', '$cookies', function($scope,$rootScope,$state,$http,Service,$base64,$cookies){
	if($cookies.username == '-1' | $cookies.username==null | $cookies.username==''){
		$state.go('home');
	}
	$rootScope.userid=$cookies.username;
	var userid = $cookies.username;

	$scope.otherprofile = function(){
		$rootScope.otheruserid = $scope.searchprofile;
		$cookies.otheruserid = $scope.searchprofile;
		$state.go('otherprofile');
	};
	$scope.search = function(){
		$state.go('otherprofile');
	};
}]);

app.controller('bookDetailsclr',function($location, $scope,$state,$http, Service){
	$scope.book = Service.getbook();
	var key = $scope.book.volumeInfo.industryIdentifiers[0].identifier;
	$scope.myResult = [];
	$scope.IsIssued = [];

	var urlnew2 = 'http://localhost:3000/home/Book/'+key;		
	$http.get(urlnew2).success(function(response){
		if(response.results[0]==null){

		}
		else{
    		$scope.myResult=response.results;
		}
	});

	
	$scope.homeback = function(){
		$state.go('search');
	};
});


app.controller('otherprofileclr',[ '$scope', '$rootScope', '$state', '$http', 'Service','$base64', '$cookies', function($scope,$rootScope,$state,$http,Service,$base64,$cookies){
	if($cookies.username == '-1' | $cookies.username==null | $cookies.username==''){
		$state.go('home');
	}

	$rootScope.userid=$cookies.username;
	var userid = $cookies.username;

	console.log("otherprofile cookies:"+$cookies.username);
	var otheruserid = $cookies.otheruserid;	
	console.log(otheruserid);		
	$scope.booklist = [];
	$http.get("http://localhost:3000/home/bookissue").success(function(response){
			angular.forEach(response, function(value, key) {
				if (value.UniqueId==otheruserid) {
					$scope.booklist.push(value);
					
				}
			});

	});

	$scope.search = function(){
			var otheruserid2 = $scope.searchProfileID;
			$scope.booklist = [];
			$http.get("http://localhost:3000/home/bookissue").success(function(response){
			angular.forEach(response, function(value, key) {
				if (value.UniqueId==otheruserid2) {
					$scope.booklist.push(value);
				}
			});
	});
	}

	$scope.back = function(){
		$state.go('profile');
	};

	$scope.logout = function(){
		$cookies.username='';
		console.log("Logout cookies:"+$cookies.username);
		$state.go('home');
	};
}]);

app.controller('requestbookclr',[ '$scope', '$rootScope', '$state', '$http', 'Service','$base64', '$cookies', function($scope,$rootScope,$state,$http,Service,$base64,$cookies){
	if($cookies.username == '-1' | $cookies.username==null | $cookies.username==''){
		$state.go('home');
	}
	console.log("requestbook cookies:"+$cookies.username);



	$rootScope.userid=$cookies.username;
	var userid = $cookies.username;
	$scope.book = Service.getbook();
	
	$scope.reqbooklist = [];
	$http.get("http://localhost:3000/home/requestbook").success(function(response){		
			angular.forEach(response, function(value, key) {
				if (value.UniqueId==userid) {
					$scope.reqbooklist.push(value);
					
				}
			});
	});

	$scope.requestbook = function(){
		var requestbook = {
			"ISBN":$scope.isbn,
			"UniqueId":$rootScope.userid,
			"DoReq": new Date(1/9/2016),
			"comment":$scope.comment
		};
		$http.post("http://localhost:3000/home/requestbook",requestbook).success(function(res){
			console.log(requestbook)
			console.log(res);
			if(res.error == 0){	
				console.log('added successfully');
				$state.go("profile");}
			else{ 
				console.log('Error');
			}

		});
	};
//		$state.go('profile');

	$scope.cancell = function(){
		$state.go('profile');
	};
}])
