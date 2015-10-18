'use strict'

var tape = require('tape')
var indexTopology = require('../lib/topology')
var bunny = require('bunny')
var normals = require('normals').vertexNormals
var createMesh = require('../lib/mesh')
var flipEdges = require('../lib/flip-edges')
var splitEdges = require('../lib/split-edges')

tape('bunny-flips', function(t) {

  var bmesh   = createMesh(bunny.cells, bunny.positions, normals(bunny.cells, bunny.positions))

  splitEdges(bmesh, 0)
  var corners = new Array(bmesh.numCells*3)
  var valence = new Array(bmesh.numVerts)
  indexTopology(bmesh.numCells, bmesh.cells, corners, bmesh.numVerts, valence)
  flipEdges(bmesh.numCells, bmesh.cells, corners, bmesh.numVerts, valence)

  var computedValence = new Int32Array(bmesh.numVerts)

  for(var i=0; i<bmesh.numCells; ++i) {
    for(var j=0; j<3; ++j) {
      computedValence[bmesh.cells[3*i+j]] += 1

      var op = corners[3*i+j]
      t.ok(op >= 0, 'bunny is manifold')

      if(op < 0) {
        continue
      }

      var oi = op>>2
      var oj = op&3

      var opop = corners[3*oi+oj]
      t.equals(opop>>2, i, 'opposite link ok ' + [i, j] + ' <-> ' + [oi, oj])
      t.equals(opop&3, j, 'opposite index ok')

      var ob = bmesh.cells[3*oi+((oj+1)%3)]
      var oc = bmesh.cells[3*oi+((oj+2)%3)]
      var fb = bmesh.cells[3* i+(( j+1)%3)]
      var fc = bmesh.cells[3* i+(( j+2)%3)]

      t.equals(Math.min(ob, oc), Math.min(fb, fc), 'edge ok')
      t.equals(Math.max(ob, oc), Math.max(fb, fc), 'edge ok')
    }
  }

  for(var i=0; i<bmesh.numVerts; ++i) {
    t.equals(valence[i], computedValence[i], 'valence ok')
  }

  t.end()
})
