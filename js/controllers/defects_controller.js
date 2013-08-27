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

AlmUi.DefectsTeamController = AlmUi.DefectsController.extend({
  model: function() {
    // TODO find a way to remove this hard-coded team name
    var query = { "user-95": ["DDM Content"], status: ['Open', 'New'], severity: ["2 - High", "1 - Urgent"] };
    return AlmUi.Defect.find({query: query});
  }
});
