function validateNameInput(input, maxLength) {
  if (input.toUpperCase() === 'C') return true;
  if (!/[a-z]/i.test(input)) return 'Input must contain a letter.';
  if (input.length < 2) return 'Must have at least 2 characters';
  if (input.length > maxLength) return `Must contain ${maxLength} or fewer characters.`;
  return true;
}

function filterTextInput(input) {
  if (input.toUpperCase() === 'C') return 'C';
  return input;
}

module.exports = { filterTextInput, validateNameInput };
