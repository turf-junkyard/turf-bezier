'use strict'

var linestring = require('turf-linestring');
var multilinestring = require('turf-multilinestring');
var polygon = require('turf-polygon');
var multipolygon = require('turf-multipolygon');

var Spline = require('./spline.js');
var isLinearRing = require('./geojsonutil.js').isLinearRing

/**
 * Takes a {@link LineString|line} and returns a curved version
 * by applying a [Bezier spline](http://en.wikipedia.org/wiki/B%C3%A9zier_spline)
 * algorithm.
 *
 * The bezier spline implementation is by [Leszek Rybicki](http://leszek.rybicki.cc/).
 *
 * @module turf/bezier
 * @category transformation
 * @param {Feature<LineString>} line input LineString
 * @param {Number} [resolution=10000] time in milliseconds between points
 * @param {Number} [sharpness=0.85] a measure of how curvy the path should be between splines
 * @returns {Feature<LineString>} curved line
 * @example
 * var line = {
 *   "type": "Feature",
 *   "properties": {
 *     "stroke": "#f00"
 *   },
 *   "geometry": {
 *     "type": "LineString",
 *     "coordinates": [
 *       [-76.091308, 18.427501],
 *       [-76.695556, 18.729501],
 *       [-76.552734, 19.40443],
 *       [-74.61914, 19.134789],
 *       [-73.652343, 20.07657],
 *       [-73.157958, 20.210656]
 *     ]
 *   }
 * };
 *
 * var curved = turf.bezier(line);
 * curved.properties = { stroke: '#0f0' };
 *
 * var result = {
 *   "type": "FeatureCollection",
 *   "features": [line, curved]
 * };
 *
 * //=result
 */
module.exports = function(feature, resolution, sharpness) {
  var type = feature.geometry.type;

  if (type === 'LineString') {
    return linestring(_bezier(feature.geometry.coordinates, resolution, sharpness), feature.properties);
  }
  
  if (type === 'MultiLineString') {
    var lines = feature.geometry.coordinates.map(function(line) { 
      return_bezier(line, resolution, sharpness)
    })
    return multilinestring(lines, feature.properties)
  }
  
  if (type === 'Polygon') {
    var rings = feature.geometry.coordinates.map(function(ring) { 
      return _bezier(ring, resolution, sharpness)
    })
    return polygon(rings, feature.properties)
  }
  
  if (type === 'MultiPolygon') {
    let polygons = feature.geometry.coordinates.map(function(polygon) {
      return polygon.map(function(ring) { 
        return _bezier(ring, resolution, sharpness)
      })
    })
    return multipolygon(polygons, feature.properties)
  }
}

function _bezier(points, resolution, sharpness) {
  var coords = [];

  var pts = points.map(function(pt) {
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
        coords.push([pos.x, pos.y]);
    }
  }
  
  if (isLinearRing(points)) {
    coords.push(coords[0])
  }
  return coords;  
}
