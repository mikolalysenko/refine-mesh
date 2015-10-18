'use strict'

module.exports = computeTopology

var pool    = require('typedarray-pool')
var ndarray = require('ndarray')
var ndsort  = require('ndarray-sort')

function computeTopology(numCells, cells, corners, numVerts, valence) {

  //Clear valence array
  for(var i=0; i<numVerts; ++i) {
    valence[i] = 0
  }

  //Clear corner array
  for(var i=0; i<3*numCells; ++i) {
    corners[i] = -1
  }

  var maxEdges = 3 * numCells
  var edges = pool.mallocInt32(3 * maxEdges)
  var eptr = 0
  for(var i=0; i<numCells; ++i) {
    var a = cells[3*i]
    var b = cells[3*i+1]
    var c = cells[3*i+2]

    edges[eptr++] = Math.min(a,b)|0
    edges[eptr++] = Math.max(a,b)|0
    edges[eptr++] = 4*i+2

    edges[eptr++] = Math.min(b,c)|0
    edges[eptr++] = Math.max(b,c)|0
    edges[eptr++] = 4*i

    edges[eptr++] = Math.min(c,a)|0
    edges[eptr++] = Math.max(c,a)|0
    edges[eptr++] = 4*i+1
  }

  var numEdges = (eptr/3)|0
  ndsort(ndarray(edges, [numEdges, 3], [3, 1], 0))

  var pa = -1
  var pb = -1
  var pf = -1
  for(var i=0; i<numEdges; ++i) {
    var a = edges[3*i]
    var b = edges[3*i+1]
    var f = edges[3*i+2]

    if(a === pa && b === pb) {
      var x0 = f>>2
      var x1 = f&3
      var y0 = pf>>2
      var y1 = pf&3
      corners[3*x0 + x1] = pf
      corners[3*y0 + y1] = f
    } else if(pa >= 0) {
      valence[pa] += 1
      valence[pb] += 1
    }

    pa = a
    pb = b
    pf = f
  }

  if(pa >= 0) {
    valence[pa] += 1
    valence[pb] += 1
  }

  pool.free(edges)
}
