var once = require('once')
var bufferToWav = require('audiobuffer-to-wav')

module.exports = detectMediaElementSource
function detectMediaElementSource (cb, audioContext, timeoutDelay, ignoreCache) {
  if (typeof cb !== 'function') {
    throw new TypeError('must specify a callback function')
  }

  var AudioCtor = window.AudioContext || window.webkitAudioContext
  if (!AudioCtor ||
      typeof window.Blob === 'undefined' ||
      typeof window.URL === 'undefined' ||
      typeof window.URL.createObjectURL !== 'function') {
    console.log('no support')
    // will not support our method, assume browser is too old
    return process.nextTick(function () {
      cb(false)
    })
  }

  var tempContext = false
  if (!audioContext) {
    tempContext = true
    audioContext = new AudioCtor()
  }

  var defaultDelay = /Safari/.test(navigator.userAgent) ? 550 : 250
  timeoutDelay = typeof timeoutDelay === 'number' ? timeoutDelay : defaultDelay

  if (audioContext.state === 'suspended' &&
      typeof audioContext.resume === 'function') {
    // Safari 9 may start in a suspended state :(
    audioContext.resume()
    setTimeout(runDetection, 10)
  } else {
    runDetection()
  }

  function runDetection () {
    var audio = new window.Audio()
    var node = audioContext.createMediaElementSource(audio)
    var analyser = audioContext.createAnalyser()
    node.connect(analyser)

    var interval, timeout
    var ended = once(function (result) {
      clearInterval(interval)
      clearTimeout(timeout)
      audio.pause()
      // audio.src = ''
      node.disconnect()
      done(result)
    })

    audio.addEventListener('canplaythrough', once(function () {
      audio.play()
    }))

    // when playback begins, we sum the frequency data
    audio.addEventListener('play', once(function () {
      var array = new Uint8Array(analyser.frequencyBinCount)
      interval = setInterval(function () {
        analyser.getByteFrequencyData(array)

        // as soon as we hit non-zero, we stop
        if (hasNonZero(array)) {
          ended(true)
        }
      }, 1)
    }))

    var buffer = createNoise(1, 44100)
    var bytes = bufferToWav(buffer)
    resetTimeout()

    try {
      var blob = new window.Blob([ bytes ], { type: 'audio/wav' })
      var url = window.URL.createObjectURL(blob)
      audio.loop = true
      audio.src = url
      audio.load()
    } catch (e) {
      ended(false)
    }

    function resetTimeout () {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(function () {
        ended(false)
      }, timeoutDelay)
    }
  }

  function done (result) {
    if (tempContext && typeof audioContext.close === 'function') {
      audioContext.close()
    }
    cb(result)
  }

  function hasNonZero (array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] > 0) return true
    }
    return false
  }

  function createNoise (seconds, sampleRate) {
    var totalSamples = Math.floor(sampleRate * seconds)
    totalSamples += 4 - (totalSamples % 4) // byte-align

    var samples = new Float32Array(totalSamples)
    for (var i = 0; i < totalSamples; i++) {
      samples[i] = 1 / 255
    }

    return {
      duration: seconds,
      length: totalSamples,
      numberOfChannels: 1,
      sampleRate: sampleRate,
      getChannelData: function () {
        return samples
      }
    }
  }
}
