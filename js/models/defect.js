AlmUi.Defect = DS.Model.extend({
//  id: DS.attr('string'),
  title: DS.attr('string'),
  description: DS.attr('string'),
  comments: DS.attr('string')
});

AlmUi.Defect.FIXTURES = [
 {
   id: 1,
   title: 'Defect 1 title',
   description: 'Lorem ipsum',
   comments: 'Lorem ipsum'
 },
 {
   id: 2,
   title: 'Defect 2 title',
   description: 'Lorem ipsum',
   comments: 'Lorem ipsum'
 },
 {
   id: 3,
   title: 'Defect 3 title',
   description: 'Lorem ipsum',
   comments: 'Lorem ipsum'
 }
];
