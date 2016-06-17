var Writer = require('wav').Writer
var fs = require('fs')
var path = require('path')

var output = fs.createWriteStream(path.resolve(__dirname, 'output.wav'))
var writer = new Writer({ channels: 1 })
writer.pipe(output)

var seconds = 1.5
var sampleCount = Math.floor(writer.sampleRate * seconds)
sampleCount += 4 - (sampleCount % 4)
console.error('Total samples:', sampleCount)

var samples = new Buffer(sampleCount)
for (var i = 0; i < samples.length; i++) {
  samples[i] = 127 + Math.floor(Math.sin(i) * 127)
  if (samples[i] === 0) samples[i] = 10
}
writer.write(samples)
writer.end()
