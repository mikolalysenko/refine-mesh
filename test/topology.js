'use strict'

var tape = require('tape')
var indexTopology = require('../lib/topology')

tape('topology', function(t) {

  var cells = [
    0, 1, 2,
    1, 2, 3,
    2, 3, 4,
    1, 0, 5,
    0, 2, 6
  ]

  var valence = new Array(7)
  var corners = new Array(cells.length)


  indexTopology(5, cells, corners, 7, valence)
/*
  console.log(cells)
  console.log(valence)
  console.log(corners)
*/
  t.end()
})

var bunny = require('bunny')
var createMesh = require('../lib/mesh')

tape('bunny-topology', function(t) {

  var bmesh   = createMesh(bunny.cells, bunny.positions)
  var corners = new Array(bmesh.numCells*3)
  var valence = new Array(bmesh.numVerts)

  indexTopology(bmesh.numCells, bmesh.cells, corners, bmesh.numVerts, valence)

  var computedValence = new Int32Array(bmesh.numVerts)

  for(var i=0; i<bmesh.numCells; ++i) {
    for(var j=0; j<3; ++j) {

      computedValence[bmesh.cells[3*i+j]] += 1
      continue

      var op = corners[3*i+j]
      t.ok(op >= 0, 'bunny is manifold')

      if(op < 0) {
        continue
      }

      var oi = op>>2
      var oj = op&3

      var opop = corners[3*oi+oj]
      t.equals(opop>>2, i, 'opposite link ok')
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
    t.equals(valence[i], computedValence[i]-1, 'valence of vertex ' + i + ' consistent')
  }

  t.end()
})
