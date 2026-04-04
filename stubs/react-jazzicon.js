const React = require('react');

function Jazzicon({ diameter = 32, seed = 0 }) {
  return React.createElement('div', {
    style: { width: diameter, height: diameter, borderRadius: '50%', background: '#' + seed.toString(16).padStart(6, '0').slice(0, 6) },
  });
}

module.exports = Jazzicon;
module.exports.default = Jazzicon;
