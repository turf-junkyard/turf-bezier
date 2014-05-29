[![build status](https://secure.travis-ci.org/Turfjs/turf-bezier.png)](http://travis-ci.org/Turfjs/turf-bezier)

# turf-bezier

Takes a linestring and outputs a curved version of the line.

```js
var bezier = require('turf-bezier')
var linestring = require('turf-linestring')
var resolution = 5000
var intensity = .85
var lineIn = linestring([
      [
        -80.08724212646484,
        32.77428536643231
      ],
      [
        -80.03746032714844,
        32.84007757059952
      ],
      [
        -80.01548767089844,
        32.74512501406368
      ],
      [
        -79.95368957519531,
        32.850461360442424
      ]
    ])

var lineOut = bezier(lineIn, 5000, .85)
```
