var Writer = require('wav').Writer
var fs = require('fs')
var path = require('path')

var output = fs.createWriteStream(path.resolve(__dirname, 'output.wav'))
var writer = new Writer()
writer.pipe(output)

var seconds = 1
var samples = new Buffer(writer.sampleRate * seconds)
for (var i = 0; i < samples.length; i++) {
  samples[i] = 127 + Math.floor(Math.sin(i) * 127)
  if (samples[i] === 0) samples[i] = 10
}
writer.write(samples)
writer.end()
