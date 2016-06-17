var file = require('path').resolve(__dirname, 'noise.mp3')
console.log('module.exports = "' + require('urify')(file) + '";')
