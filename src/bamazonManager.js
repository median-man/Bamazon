const managerView = require('./managerView.js');

function run() {
  managerView
    .mainMenu()
    .then(({ action }) => {
      if (action !== 'quit') {
        run();
      }
    })
    .catch((err) => { throw err; });
}
module.exports = { run };
