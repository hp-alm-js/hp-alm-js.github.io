var app = angular.module('AlmUi', []);

app.
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', {}).
      when('/home', {templateUrl: 'templates/hello.html', controller: HomeCtrl,}).
      when('/defects', {}).
      when('/defects', {}).
      when('/defects/my', {}).
      when('/defects/team', {}).
      when('/defect/:defect_id', {})
}]);

function HomeCtrl($scope) {}

function RouteCtrl($scope, $route, $location) {
  if (['', '/'].indexOf($location.path()) != -1) {
    $location.path("/home"); 
  }
  var assignRouteVisible = function() {
    var path = $location.path(),
        routes = Object.keys($route.routes),
        buildRouteVisible = function(path) {
        return path.replace('/', '') + "Visible";
    };
    routes.map(function(el) {
       var routeVisible = buildRouteVisible(el);
       $scope[routeVisible] = false;
    });
    var routeVisible = buildRouteVisible(path);
    if(routes.indexOf(path) != -1) {
       $scope[routeVisible] = true;
    }
  };
  $scope.$on('$routeChangeSuccess', assignRouteVisible);
  assignRouteVisible();
}


app.factory('LoginService', function($q, $rootScope) {
  var checkLogin = function () {
    var deferred = $q.defer();
    ALM.tryLogin(function onLogin(username) {
      $('#login_container').hide();
      $('#login_error').hide();
      $rootScope.$apply(function () {deferred.resolve(username)});
    }, function onError(error) {
      console.log(error);
      $('#login_container').css('display', 'block');
      $rootScope.$apply(function () {deferred.resolve(null)});
    });
    return deferred.promise;
  },
  login = function(username, password) {
    var deferred = $q.defer();
    ALM.login(username, password, function onLogin() {
      $rootScope.$apply(function () {deferred.resolve(true)});
    }, function onError() {
      $('#login_error').show();
      $rootScope.$apply(function () {deferred.resolve(false)});
    });
    return deferred.promise;
  },
  logout = function () {
    var deferred = $q.defer();
    ALM.logout(function() {
      $rootScope.$apply(function () {deferred.resolve()});
    });
    return deferred.promise;
  };
  return {
    checkLogin: checkLogin,
    login: login,
    logout: logout
  };
});

function appCtrl($scope, LoginService) {
  ALM.config("https://qc2d.atlanta.hp.com/qcbin/", "BTO", "ETG");
  // login function
  $scope.login = function () {
    var username = $('#username').val(),
        password = $('#password').val();
    LoginService.login(username, password).then(function() {
      $scope.currentUser = LoginService.checkLogin();
      $('#login_form')[0].submit(); // submit to hidden frame
    });
  }
  // logout function
  $scope.logout = function () {
    LoginService.logout().then(function (){
      $scope.currentUser = null;
      $("#login_form").show();
      $('#login_container').css('display', 'block');
    });
  }
  // bind current user
  $scope.currentUser = LoginService.checkLogin();
};

function defects($scope) {
  $scope.defects = ["dfas"];
}

function defect($scope) {
}
