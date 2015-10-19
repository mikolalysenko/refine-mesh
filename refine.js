'use strict'

module.exports = refineMesh
module.exports.packed = refinePackedMesh

var createMesh    = require('./lib/mesh')
var splitEdges    = require('./lib/split-edges')
var collapseEdges = require('./lib/collapse-edges')
var flipEdges     = require('./lib/flip-edges')
var smoothVerts   = require('./lib/smooth-verts')
var calcNormals   = require('./lib/calc-normals')

function refinePackedMesh(
    mesh,
    edgeLength,
    maxIters,
    maxCollapseIters,
    maxFlipIters,
    smoothIters) {

  var collapseBound    = Math.pow(0.75 * edgeLength, 2)
  var splitBound       = Math.pow(1.25 * edgeLength, 2)

  var changed = true
  for(var i=0; changed && i<maxIters; ++i) {
    changed = false
    changed = splitEdges(mesh, splitBound) || changed
    changed = collapseEdges(mesh,
                  collapseBound,
                  splitBound,
                  maxCollapseIters) || changed
    changed = flipEdges(mesh, maxFlipIters) || changed
    changed = smoothVerts(mesh, smoothIters) || changed

    if(changed) {
      calcNormals(mesh)
    }
  }
}

function refineMesh(cells, positions, normals, edgeLength, numIters) {
  //Pack mesh data
  var mesh = createMesh(cells, positions, normals)

  //Run refinement
  refinePackedMesh(
    mesh,
    edgeLength,
    numIters,
    10,
    10,
    20)

  //Unpack working mesh data
  var result = mesh.unpack()
  mesh.dispose()
  return result
}
