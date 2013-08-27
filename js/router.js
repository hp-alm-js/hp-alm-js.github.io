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
      return controller.send('fetch');
  }

});

AlmUi.LoadingRoute = Em.Route.extend({});
AlmUi.HelloRoute = AlmUi.AuthRoute;
AlmUi.DefectsMyRoute = AlmUi.AuthRoute;
AlmUi.DefectsTeamRoute = Em.Route.extend({
  model: function() {
    // TODO find a way to remove this hard-coded team name
    var query = { "user-95": ["DDM Content"], status: ['Open', 'New'], severity: ["2 - High", "1 - Urgent"] };
    return AlmUi.Defect.find({query: query});
  }
});
