'use strict'

var tape = require('tape')
var computeRings = require('../lib/compute-1-ring')

tape('1-ring', function(t) {

  var numCells = 2
  var numVerts = 6

  var cells = [
    0, 1, 2,
    2, 1, 3,
    1, 0, 4,
    0, 2, 5
  ]

  var pointers = new Array(numVerts)
  var counts   = new Array(numVerts)

  var rings = computeRings(numCells, cells, numVerts, counts, pointers)

  console.log(pointers, counts)
  console.log(rings.length)
  console.log([].slice.call(rings))

  for(var i=0; i<numVerts; ++i) {
    console.log(i, [].slice.call(rings, pointers[i], pointers[i]+counts[i]))
  }


  t.end()
})
