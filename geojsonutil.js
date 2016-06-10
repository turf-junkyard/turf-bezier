'use strict'

exports.isLinearRing = function (points) {
  return points.length >= 4 && arrEqual(points[0], points[points.length - 1])
}

function arrEqual (a1, a2) {
  if (!a1 || !a2 || a1.length !== a2.length) {
    return false
  }
  for (var i in a1) {
    if (a1[i] !== a2[i]) {
      return false
    }
  }
  return true
}
