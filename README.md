# detect-media-element-source

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Detects whether the browser correctly supports WebAudio's `createMediaElementSource()`, by playing a short looping noise segment and seeing whether signal is non-zero.

For example: Desktop Chrome/FF support media element sources, but mobile iOS 9.2 Safari does not. In unsupported browsers, you need to buffer and decode the entire audio file in order to use it with the WebAudio API.

The result is peristed in `localStorage` in order to fix a [Chrome DataURI caching issue](https://code.google.com/p/chromium/issues/detail?id=562214).

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

`timeoutDelay` defaults to 250ms, but can be configured to allow the loop to play for a longer/shorter time before deciding the result.

If `ignoreCache` is specified, the function will not read or write from localStorage. This exists specifically to fix a recent Chrome issue, and the functionality may be removed in later versions of this module.

## License

MIT, see [LICENSE.md](http://github.com/Jam3/detect-media-element-source/blob/master/LICENSE.md) for details.
