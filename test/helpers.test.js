const { expect } = require('chai');
const { isNumberGreaterOrEqual, validateNameInput } = require('../src/helpers.js');

describe('helpers.validateNameInput', function () {
  it('is a function', function () {
    expect(validateNameInput).to.be.a('function');
  });
  function expectString(input, msg) {
    it(`returns a string when ${msg || `input is "${input}"`}`, function () {
      expect(validateNameInput(input, 35)).to.be.a('string');
    });
  }
  describe('valid input must be a a string with a length of at least 2', function () {
    it('returns true when input is "Cherlindrea\'s wand"', function () {
      expect(validateNameInput('Cherlindrea\'s wand 24', 25)).to.be.true;
    });
    expectString('a', 'input is an empty string');
  });
  describe('valid input must conatain at least 1 letter from the alphabet', function () {
    expectString('351', 10);
  });
  describe('valid input must not be longer than length paremter', function () {
    const testString = 'test'.repeat(9);
    expectString(testString, `input string has a length of ${testString.length}`);
  });
  it('return true when input is "C" and ignores case', function () {
    expect(validateNameInput('C')).to.be.true;
    expect(validateNameInput('c')).to.be.true;
  });
});

describe('helpers.isNumberGreaterOrEqual', function () {
  function expectWhen(quantity, type) {
    describe(`when quantity argument is ${quantity}`, function () {
      if (type === 'string') {
        it('returns a string', function () {
          expect(isNumberGreaterOrEqual(quantity, 0)).to.be.a(type);
        });
      } else {
        it('returns true', function () {
          expect(isNumberGreaterOrEqual('cancel', 0)).to.be.true;
        });
      }
    });
  }
  expectWhen('cancel', true);
  expectWhen(1, true);
  expectWhen(NaN, 'string');
  expectWhen(-1, 'string');
});
