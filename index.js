var once = require('once')
var STORAGE_KEY = 'detect-media-element-source-result'

module.exports = detectMediaElementSource
function detectMediaElementSource (cb, audioContext, timeoutDelay, ignoreCache) {
  if (typeof cb !== 'function') {
    throw new TypeError('must specify a callback function')
  }

  var AudioCtor = window.AudioContext || window.webkitAudioContext
  if (!AudioCtor) { // no WebAudio support
    return process.nextTick(function () {
      cb(false)
    })
  }

  // Horribly ugly Chrome-specific hack until the following bug is fixed:
  // https://code.google.com/p/chromium/issues/detail?id=562214
  if (!ignoreCache && String(window.localStorage.getItem(STORAGE_KEY)) === 'true') {
    return process.nextTick(function () {
      cb(true)
    })
  }

  var tempContext = false
  if (!audioContext) {
    tempContext = true
    audioContext = new AudioCtor()
  }

  timeoutDelay = typeof timeoutDelay === 'number' ? timeoutDelay : 250

  var audio = new window.Audio()
  var node = audioContext.createMediaElementSource(audio)
  var analyser = audioContext.createAnalyser()
  node.connect(analyser)

  var interval, timeout
  var ended = once(function (result) {
    clearInterval(interval)
    clearTimeout(timeout)
    audio.pause()
    audio.src = ''
    node.disconnect()
    if (!ignoreCache) {
      window.localStorage.setItem(STORAGE_KEY, String(result))
    }
    done(result)
  })

  timeout = setTimeout(function () {
    ended(false)
  }, timeoutDelay)

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

  audio.loop = true
  audio.crossOrigin = 'Anonymous'
  audio.src = getDataUri()
  audio.load()
  audio.play()

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
}

function getDataUri () {
  return 'data:audio/mpeg;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACiwCOjo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6O//////////////////////////////////////////////////////////////////8AAAAKTEFNRTMuOThyBF8AAAAAAAAAABQgJAaUQQABmgAAAovlBTTIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sgxAAAApQBmeAAACESBK64l5ghCwAAAAAAAAOAL////////h71g+D71UzmwqFq6AFgSBzA5gcwSIeouRpK0uKpR5smgoUFdBQZ/goKd/+EgoK7kUFBf/8QUFCn/9ooKC/iCiv6Cu///IKCQUUqTEFNRTMuOTguMqqqqqqqqqqqqv/7EMQJg8AAAaQAAAAgAAA0gAAABKq'
}
