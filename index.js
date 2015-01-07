// code modded from here:
//https://github.com/leszekr/bezier-spline-js/blob/master/bezier-spline.js
var t = {};
t.linestring = require('turf-linestring');
var Spline = require('./spline.js');

/**
 * Takes a {@link LineString} and outputs a curved version of the line.
 *
 * @module turf/bezier
 * @param {LineString} line
 * @param {number} resolution
 * @param {number} intensity
 * @returns {LineString} curved line
 */
module.exports = function(line, resolution, intensity){
  var lineOut = t.linestring([]);

  lineOut.properties = line.properties;
  pts = [];
  pts = line.geometry.coordinates.map(function(pt){
    return {x: pt[0], y: pt[1]};
  })

  var spline = new Spline({
    points: pts,
    duration: resolution,
    sharpness: intensity,
  });
  for(var i=0; i<spline.duration; i+=10){
    var pos = spline.pos(i); //bezier(i/max,p1, c1, c2, p2);
    if(Math.floor(i/100)%2==0) lineOut.geometry.coordinates.push([pos.x, pos.y]);
  }

  return lineOut;
}
