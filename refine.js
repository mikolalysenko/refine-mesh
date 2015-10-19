'use strict'

module.exports = refineMesh
module.exports.packed = refinePackedMesh

var createMesh    = require('./lib/mesh')
var avgEdgeLength = require('./lib/average-edge-length')
var splitEdges    = require('./lib/split-edges')
var collapseEdges = require('./lib/collapse-edges')
var flipEdges     = require('./lib/flip-edges')
var smoothVerts   = require('./lib/smooth-verts')
var calcNormals   = require('./lib/calc-normals')

function refinePackedMesh(
    mesh,
    edgeLength,
    smoothRate,
    maxIters,
    maxSplitIters,
    maxCollapseIters,
    maxFlipIters,
    smoothIters) {

  smoothRate = Math.max(Math.min(smoothRate, 1.0), 0.001)

  var splitBound    = Math.pow(1.25 * edgeLength, 2)
  var collapseBound = Math.pow(0.75 * edgeLength, 2)
  var smoothBound   = Math.pow(0.01 * edgeLength / smoothRate, 2)

  var changed = true
  for(var i=0; changed && i<maxIters; ++i) {
    changed = false
    changed = splitEdges(mesh, splitBound, maxSplitIters) || changed
    changed = collapseEdges(mesh,
                  collapseBound,
                  splitBound,
                  maxCollapseIters) || changed
    changed = flipEdges(mesh, maxFlipIters) || changed
    changed = smoothVerts(mesh, smoothIters, smoothBound, smoothRate) || changed
  }
}

function refineMesh(cells, positions, normals, options) {
  options = options || {}

  //Pack mesh data
  var mesh = createMesh(cells, positions, normals)

  //Run refinement
  refinePackedMesh(
    mesh,
    options.edgeLength    || avgEdgeLength(mesh),
    options.smoothRate    || 0.95,
    options.maxIters      || 5,
    options.splitIters    || 10,
    options.collapseIters || 10,
    options.flipIters     || 10,
    options.smoothIters   || 20)

  //Unpack working mesh data
  var result = mesh.unpack()
  mesh.dispose()
  return result
}
