const superView = require('./supervisorView.js');

function run() {
  superView
    .mainMenu([
      { value: 'dept-sales', name: 'View department sales' },
      { value: 'add-dept', name: 'Add new department' },
      { value: 'quit', name: 'Quit' },
    ])
    .then(({ action }) => {
      console.log(action);
      if (action === 'quit') process.exit();
      return run();
    })
    .catch((err) => { throw err; });
}

module.exports = run;
