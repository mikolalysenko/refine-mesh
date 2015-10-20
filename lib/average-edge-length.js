'use strict'

module.exports = averageEdgeLength

var pool    = require('typedarray-pool')
var ndarray = require('ndarray')
var ndsort  = require('ndarray-sort')

function dist2(ax, ay, az, bx, by, bz) {
  return Math.pow(ax-bx, 2) + Math.pow(ay-by,2) + Math.pow(az-bz,2)
}

function averageEdgeLength(mesh) {
  var numCells  = mesh.numCells
  var cells     = mesh.cells
  var verts     = mesh.verts

  var edgeLengths = pool.mallocFloat32(3 * numCells)
  for(var i=0; i<numCells; ++i) {
    var a = cells[3*i]
    var b = cells[3*i+1]
    var c = cells[3*i+2]

    var ax = verts[3*a]
    var ay = verts[3*a+1]
    var az = verts[3*a+2]

    var bx = verts[3*b]
    var by = verts[3*b+1]
    var bz = verts[3*b+2]

    var cx = verts[3*c]
    var cy = verts[3*c+1]
    var cz = verts[3*c+2]

    edgeLengths[3*i]   = dist2(ax, ay, az, bx, by, bz)
    edgeLengths[3*i+1] = dist2(bx, by, bz, cx, cy, cz)
    edgeLengths[3*i+2] = dist2(cx, cy, cz, ax, ay, az)
  }

  ndsort(ndarray(edgeLengths))
  var midLength = edgeLengths[edgeLengths.length>>1]

  pool.free(edgeLengths)

  return Math.sqrt(midLength)
}
