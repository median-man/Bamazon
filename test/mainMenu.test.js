const { expect } = require('chai');
const mainMenu = require('../src/mainMenu.js');

const testChoices = [
  { value: 'all', name: 'View products for sale' },
  { value: 'low', name: 'View low inventory' },
  { value: 'add', name: 'Add to inventory' },
  { value: 'new', name: 'Add new product' },
  { value: 'quit', name: 'Quit' },
];

describe('mainMenu', function () {
  it(
    'is a function which accepts an array of choice objects for the choice param',
    function () {
      mainMenu(testChoices);
    },
  );
  it('returns an object', function () {
    expect(mainMenu(testChoices)).to.be.an('object');
  });
  describe('the object returned', function () {
    it('includes type, message, name, and choices keys', function () {
      expect(mainMenu(testChoices)).to.include.all.keys(['type', 'message', 'name', 'choices']);
    });
    it('value of type is "list"', function () {
      expect(mainMenu(testChoices).type).to.equal('list');
    });
    it('value of message is a question', function () {
      const { message } = mainMenu(testChoices);
      expect(message).to.be.a('string').which.includes('?').and.lengthOf.at.least(2);
    });
    it('value of name is "action"', function () {
      expect(mainMenu(testChoices).name).to.equal('action');
    });
    it('value of choices includes all members of the choices parameter', function () {
      const { choices } = mainMenu(testChoices);
      expect(choices).to.have.all.ordered.members(testChoices);
    });
  });
});
