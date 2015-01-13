var linestring = require('turf-linestring');
var Spline = require('./spline.js');

/**
 * Takes a {@link LineString} geometry returns outputs a curved version of the line
 * by applying a [Bezier spline](http://en.wikipedia.org/wiki/B%C3%A9zier_spline)
 * algorithm.
 *
 * The bezier spline implementation is by [Leszek Rybicki](http://leszek.rybicki.cc/).
 *
 * @module turf/bezier
 * @param {LineString} line
 * @param {number=10000} resolution time in milliseconds between points
 * @param {number=0.85} sharpness a measure of how curvy the path should be between splines
 * @returns {LineString} curved line
 * @example
 * var line = turf.linestring([
 *   [-76.09130859375, 18.427501971948608],
 *   [-76.695556640625, 18.729501999072138],
 *   [-76.552734375, 19.40443049681278],
 *   [-74.619140625, 19.134789188332523],
 *   [-73.65234375, 20.076570104545173],
 *   [-73.157958984375, 20.210656234489853]], {
 *      stroke: '#f00'
 *   });
 * var curved = turf.bezier(line);
 * curved.properties = { stroke: '#0f0' };
 * var result = turf.featurecollection([line, curved]);
 * //=result
 */
module.exports = function(line, resolution, sharpness){
  var lineOut = linestring([]);

  lineOut.properties = line.properties;
  var pts = line.geometry.coordinates.map(function(pt){
    return {x: pt[0], y: pt[1]};
  });

  var spline = new Spline({
    points: pts,
    duration: resolution,
    sharpness: sharpness
  });
  for (var i=0; i<spline.duration; i+=10) {
    var pos = spline.pos(i);
    if (Math.floor(i/100)%2===0) {
        lineOut.geometry.coordinates.push([pos.x, pos.y]);
    }
  }

  return lineOut;
};
