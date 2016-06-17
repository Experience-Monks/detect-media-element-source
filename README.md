# detect-media-element-source

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Detects whether the browser correctly supports WebAudio's `createMediaElementSource()`, by playing a short looping noise segment and seeing whether signal is non-zero.

For example: Desktop Chrome/FF support media element sources, but mobile iOS 9.2 Safari does not. In unsupported browsers, you need to buffer and decode the entire audio file in order to use it with the WebAudio API.

##### Note :warning:

Because of the way the WebAudio and browser APIs are constantly in flux, this may not be a robust and long-term solution to detecting this feature. There is no reliable way to detect this feature across all browsers, except for actually watching the result of an AnalyserNode over your own `<audio>` source, and then falling back to a buffer source in such a case. However, that requires additional UX hurdles on mobile (for touch-to-play audio).

## Install

```sh
npm install detect-media-element-source --save
```

## Example

```js
var detectMedia = require('detect-media-element-source')

detectMedia(function (supported) {
  if (supported) {
    // ... audioContext.createMediaElementSource()
  } else {
    // ... audioContext.createBufferSource()
  }
})
```

## Usage

[![NPM](https://nodei.co/npm/detect-media-element-source.png)](https://www.npmjs.com/package/detect-media-element-source)

#### `detectMediaElementSource(cb, [audioContext], [timeoutDelay], [ignoreCache])`

Detects whether `createMediaElementSource` works as expected with the WebAudio API, calling `cb` with `true` if supported, `false` otherwise.

`audioContext` is optional (a new temporary context will be used) but encouraged.

`timeoutDelay` defaults to 250ms (550ms if userAgent shows Safari), but can be configured to allow the loop to play for a longer/shorter time before deciding the result.

## License

MIT, see [LICENSE.md](http://github.com/Jam3/detect-media-element-source/blob/master/LICENSE.md) for details.
