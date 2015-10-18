'use strict'

var tape = require('tape')
var createMesh = require('../lib/mesh')
var collapseEdges = require('../lib/collapse-edges')

tape('collapse', function(t) {

  var mesh = createMesh([
    [0, 1, 2],
    [0, 2, 3],
    [0, 3, 4],
    [1, 2, 5],
    [2, 3, 5],
    [3, 4, 5]
  ], [
    [-1, 0,0],
    [ 0, 1,0],
    [ 0, 0.25,0],
    [ 0,-0.25,0],
    [ 0,-1,0],
    [ 1, 0, 0]
  ])

  collapseEdges(mesh, 0.5)

  console.log(mesh.unpack())

  t.end()
})
