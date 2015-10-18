'use strict'

var pool      = require('typedarray-pool')
var nextPow2  = require('next-pow-2')

module.exports = createMesh

function Mesh(numCells, cells, numVerts, verts, normals) {
  this.numCells = numCells
  this.cells    = cells
  this.numVerts = numVerts
  this.verts    = verts
  this.normals  = normals
}

var proto = Mesh.prototype

function unpackTriples(count, data) {
  var unpacked = new Array(count)
  for(var i=0; i<count; ++i) {
    unpacked[i] = [
      data[3*i],
      data[3*i+1],
      data[3*i+2]
    ]
  }
  return unpacked
}

proto.unpack = function() {
  return {
    cells:     unpackTriples(this.numCells, this.cells),
    positions: unpackTriples(this.numVerts, this.verts),
    normals:   unpackTriples(this.numVerts, this.normals)
  }
}

proto.dispose = function() {
  pool.free(this.cells)
  pool.free(this.verts)
  pool.free(this.normals)
}

function packCells(cells) {
  var n = cells.length
  var result = pool.mallocInt32(nextPow2(3 * n))
  var ptr = 0
  for(var i=0; i<n; ++i) {
    var c = cells[i]
    for(var j=0; j<3; ++j) {
      result[ptr++] = c[j]
    }
  }
  return result
}

function packVerts(positions) {
  var n = positions.length
  var result = pool.mallocFloat32(nextPow2(3 * n))
  var ptr = 0
  for(var i=0; i<n; ++i) {
    var p = positions[i]
    for(var j=0; j<3; ++j) {
      result[ptr++] = p[j]
    }
  }
  return result
}


function createMesh(cells, positions, normals) {
  return new Mesh(
    cells.length,     packCells(cells),
    positions.length, packVerts(positions), packVerts(normals))
}
