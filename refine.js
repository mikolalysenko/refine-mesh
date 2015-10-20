'use strict'

module.exports = refineMesh
module.exports.packed = refinePackedMesh

var createMesh    = require('./lib/mesh')
var avgEdgeLength = require('./lib/average-edge-length')
var splitEdges    = require('./lib/split-edges')
var collapseEdges = require('./lib/collapse-edges')
var flipEdges     = require('./lib/flip-edges')
var smoothVerts   = require('./lib/smooth-verts')

function refinePackedMesh(mesh, options) {
  options = options || {}

  var edgeLength    = options.edgeLength    || avgEdgeLength(mesh)
  var smoothRate    = options.smoothRate    || 0.95
  smoothRate = Math.max(Math.min(smoothRate, 1.0), 0.001)

  var splitBound    = Math.pow(1.25 * edgeLength, 2)
  var collapseBound = Math.pow(0.75 * edgeLength, 2)

  var maxIters      = options.maxIters      || 5
  var splitIters    = options.splitIters    || 10
  var collapseIters = options.collapseIters || 10
  var flipIters     = options.flipIters     || 10
  var smoothIters   = options.smoothIters   || 20

  var minSplit    = Math.max(options.minSplit || 0, 0)|0
  var minCollapse = Math.max(options.minCollapse || 0, 0)|0
  var minFlip     = Math.max(options.minFlip || 0, 0)|0
  var minSmooth   = Math.pow(Math.max(options.minSmooth ||
                        (0.05 * edgeLength / smoothRate), 0), 2)

  var changed = true
  for(var i=0; changed && i<maxIters; ++i) {
    changed = false
    changed = splitEdges(
                  mesh,
                  splitBound,
                  splitIters,
                  minSplit) || changed
    changed = collapseEdges(
                  mesh,
                  collapseBound,
                  splitBound,
                  collapseIters,
                  minCollapse) || changed
    changed = flipEdges(
                  mesh,
                  flipIters,
                  minFlip) || changed
    changed = smoothVerts(
                  mesh,
                  smoothRate,
                  smoothIters,
                  minSmooth) || changed
  }
}

function refineMesh(cells, positions, normals, options) {
  var mesh = createMesh(cells, positions, normals)

  refinePackedMesh(mesh, options)

  var result = mesh.unpack()
  mesh.dispose()
  return result
}
