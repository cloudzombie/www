const path = require('path');
const fs = require('fs');

const statics = function statics(req, res, next) {
  if (req.path.lastIndexOf('.html') === req.path.length - 5) {
    next();
    return;
  }

  const file = path.join(__dirname, '..', 'public', `${req.path}.html`);

  fs.exists(file, (exists) => {
    if (!exists) {
      next();
      return;
    }

    res.sendFile(file);
  });
};

module.exports = statics;
