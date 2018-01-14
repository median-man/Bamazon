function validateNameInput(input, maxLength) {
  if (input.toUpperCase() === 'C') return true;
  if (!/[a-z]/i.test(input)) return 'Input must contain a letter.';
  if (input.length < 2) return 'Must have at least 2 characters';
  if (input.length > maxLength) return `Must contain ${maxLength} or fewer characters.`;
  return true;
}

// Returns true if input is 'C' or a number >= 0.
function isNumberGreaterOrEqual(input, min) {
  if (input === 'C') return true;
  if (Number.isNaN(input)) return 'Invalid choice';
  if (input < min) return `Must be >= ${min}`;
  return true;
}

function filterTextInput(input) {
  if (input.toUpperCase() === 'C') return 'C';
  return input;
}

module.exports = { filterTextInput, validateNameInput, isNumberGreaterOrEqual };
