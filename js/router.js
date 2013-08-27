AlmUi.Router.map(function () {
  this.resource('application');
  this.resource('hello', { path: '/' });
  this.resource("defect", { path: "/defect/:defect_id" });
  this.resource("defects", { path: "/defects/" }, function(){
    this.route("my");
    this.route("team");
  });
});

AlmUi.ApplicationRoute = Em.Route.extend({
  model: function () {
  }
});

AlmUi.AuthRoute = Em.Route.extend({
  setupController: function (controller, model) {
    var that = this;
    this.controllerFor('application').checkLogin().then(function(username) {
      that.setupWithAuth(controller, model);
    });
  },
  setupWithAuth: function(controller, model) {
      controller.send('fetch');
  }

});

AlmUi.HelloRoute = AlmUi.AuthRoute;
AlmUi.DefectsMyRoute = AlmUi.AuthRoute;
AlmUi.DefectsTeamRoute = AlmUi.AuthRoute;

