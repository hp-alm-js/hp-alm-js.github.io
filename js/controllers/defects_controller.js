AlmUi.DefectsController = Ember.ArrayController.extend({
  needs: ['defects', 'application'],
  fetch: function() {
    this.set('controllers.defects.model', this.model());
  }
});

AlmUi.DefectsMyController = AlmUi.DefectsController.extend({
  model: function() {
    var username = this.get('controllers.application.currentUser');
    var query = { owner: [username], status: ['Open', 'New'] };
    return AlmUi.Defect.find({query: query});
  }
});

AlmUi.DefectsTeamController = Em.ArrayController;
