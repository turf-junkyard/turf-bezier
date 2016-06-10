var bezier = require('./'),
  test = require('tape'),
  fs = require('fs');

test('bezier', function(t) {
    var lineIn = JSON.parse(fs.readFileSync(__dirname+'/fixture/bezierIn.geojson'));
    var syncLineOut = bezier(lineIn, 5000, .985);
    if (syncLineOut instanceof Error) throw syncLineOut;
    console.log('%j', syncLineOut)
    t.ok(syncLineOut);
    t.ok(syncLineOut.geometry.coordinates);
    t.equal(syncLineOut.geometry.coordinates.length, 250);
    t.end();
})

test('bezier polygon', function(t) {
  var lineIn = JSON.parse(fs.readFileSync(__dirname+'/fixture/polygonIn.geojson'));
  var syncLineOut = bezier(lineIn, 5000, .85);
  if (syncLineOut instanceof Error) throw syncLineOut;
  console.log('%j', syncLineOut)
  t.ok(syncLineOut);
  t.ok(syncLineOut.geometry.coordinates);
  t.end();
})

test('bezier polygon with hole', function(t) {
  var lineIn = JSON.parse(fs.readFileSync(__dirname+'/fixture/polygon-with-holeIn.geojson'));
  var syncLineOut = bezier(lineIn, 5000, .85);
  if (syncLineOut instanceof Error) throw syncLineOut;
  console.log('%j', syncLineOut)
  t.ok(syncLineOut);
  t.ok(syncLineOut.geometry.coordinates);
  t.end();
})

test('bezier multipolygon', function(t) {
  var lineIn = JSON.parse(fs.readFileSync(__dirname+'/fixture/multipolygonIn.geojson'));
  var syncLineOut = bezier(lineIn, 5000, .85);
  if (syncLineOut instanceof Error) throw syncLineOut;
  console.log('%j', syncLineOut)
  t.ok(syncLineOut);
  t.ok(syncLineOut.geometry.coordinates);
  t.end();
})