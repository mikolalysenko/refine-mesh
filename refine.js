'use strict'

module.exports = refineMesh
module.exports.packed = refinePackedMesh

var pool      = require('typedarray-pool')
var nextPow2  = require('next-pow-2')

var createMesh    = require('./lib/mesh')
var topoIndex     = require('./lib/topology')
var splitEdges    = require('./lib/split-edges')
var collapseEdges = require('./lib/collapse-edges')
var flipEdges     = require('./lib/flip-edges')
var smoothVerts   = require('./lib/smooth-verts')
var calcNormals   = require('./lib/calc-normals')

function realloc(array, capacity) {
  if(array.length >= capacity) {
    return array
  }
  pool.free(array)
  return pool.mallocInt32(nextPow2(capacity))
}

function refinePackedMesh(mesh, edgeLength, numIters) {
  var collapseBound = Math.pow(0.75 * edgeLength, 2)
  var splitBound    = Math.pow(1.25 * edgeLength, 2)

  var corners = pool.mallocInt32(nextPow2(6 * mesh.numCells))
  var valence = pool.mallocInt32(nextPow2(2 * mesh.numVerts))
  for(var i=0; i<numIters; ++i) {
    splitEdges(mesh, splitBound)

    collapseEdges(mesh, collapseBound, splitBound)

    corners = realloc(corners, 3 * mesh.numCells)
    valence = realloc(valence, mesh.numVerts)
    topoIndex(mesh.numCells, mesh.cells, corners, mesh.numVerts, valence)

    flipEdges(mesh.numCells, mesh.cells, corners, mesh.numVerts, valence)

    //smoothVerts(mesh)

    //calcNormals(mesh)
  }

  pool.free(corners)
  pool.free(valence)
}

function refineMesh(cells, positions, normals, edgeLength, numIters) {
  //Pack mesh data
  var mesh = createMesh(cells, positions, normals)

  //Run refinement
  refinePackedMesh(mesh, edgeLength, numIters)

  //Unpack working mesh data
  var result = mesh.unpack()
  mesh.dispose()
  return result
}
