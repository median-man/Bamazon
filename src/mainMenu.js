module.exports = function mainMenu(choices) {
  return {
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices,
  };
};
