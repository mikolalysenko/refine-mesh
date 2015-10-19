'use strict'

var tape = require('tape')
var createMesh = require('../lib/mesh')
var splitEdges = require('../lib/split-edges')

tape('split', function(t) {

  var mesh = createMesh([
    [0,1,2],
    [2,1,3],
    [1,0,4],
    [0,2,5]
  ], [
    [0,0,0],
    [1,0,0],
    [0,1,0],
    [0,-1,0],
    [-1,0,0],
    [1, 1,0]
  ], [
    [0,0,1],
    [0,0,1],
    [0,0,1],
    [0,0,1],
    [0,0,1],
    [0,0,1],
    [0,0,1],
    [0,0,1],
    [0,0,1]
  ])

  splitEdges(mesh, 0)

  console.log(mesh.unpack())

  t.end()
})
