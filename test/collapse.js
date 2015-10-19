'use strict'

var tape = require('tape')
var createMesh = require('../lib/mesh')
var collapseEdges = require('../lib/collapse-edges')

tape('collapse', function(t) {

  var mesh = createMesh([
    [0, 1, 2],
    [0, 2, 3],
    [0, 3, 4],
    [0, 4, 5],
    [0, 5, 6],
    [0, 6, 7],
    [0, 7, 8],
    [0, 8, 9],
    [1, 2, 10],
    [2, 3, 10],
    [3, 4, 10],
    [4, 5, 10],
    [5, 6, 10],
    [6, 7, 10],
    [7, 8, 10],
    [8, 9, 10]
  ], [
    [-1, 0,0],
    [ 0, 1,0],
    [ 0, 0.3,0],
    [ 0, 0.2,0],
    [ 0, 0.1,0],
    [ 0, 0.0,0],
    [ 0,-0.1,0],
    [ 0,-0.2,0],
    [ 0,-0.3,0],
    [ 0,-1,0],
    [ 1, 0, 0]
  ], [
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1]
  ])

  collapseEdges(mesh, 0.5)

  console.log(mesh.unpack())

  t.end()
})
