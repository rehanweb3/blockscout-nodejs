const React = require('react');

function GradientAvatar({ size = 32, name = '' }) {
  const color = '#' + name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0).toString(16).slice(0, 6).padStart(6, '0');
  return React.createElement('div', {
    style: { width: size, height: size, borderRadius: '50%', background: color },
  });
}

module.exports = GradientAvatar;
module.exports.default = GradientAvatar;
