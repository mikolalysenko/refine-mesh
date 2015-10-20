'use strict'

module.exports = compute1Ring

function compute1Ring(numCells, cells, numVerts, counts, pointers, rings) {
  for(var i=0; i<numVerts; ++i) {
    counts[i] = 0
  }

  for(var j=0; j<3*numCells; ++j) {
    counts[cells[j]] += 2
  }

  var totalCount = 0
  for(var i=0; i<numVerts; ++i) {
    pointers[i] = totalCount
    totalCount += counts[i]
  }

  for(var i=0; i<numCells; ++i) {
    var a = cells[3*i]
    var b = cells[3*i+1]
    var c = cells[3*i+2]

    var pa = pointers[a]
    pointers[a] = pa + 2

    var pb = pointers[b]
    pointers[b] = pb + 2

    var pc = pointers[c]
    pointers[c] = pc + 2

    rings[pa]   = b
    rings[pa+1] = c

    rings[pb]   = a
    rings[pb+1] = c

    rings[pc]   = a
    rings[pc+1] = b
  }

  //Compact and sort vertex rings
  var ptr  = 0
  var optr = 0
  for(var i=0; i<numVerts; ++i) {
    var end     = pointers[i]
    var start   = ptr
    ptr         = end
    pointers[i] = optr

    //Insertion sort on i's ring
    for(var j=start; j<end; ++j) {
      var x = rings[j]
      for(var k=j; k>start; --k) {
        var y = rings[k-1]
        if(y <= x) {
          break
        }
        rings[k] = y
      }
      rings[k] = x
    }

    //Remove duplicates from i's ring and compact stream
    var last = -1
    var pptr = optr
    for(var j=start; j<end; ++j) {
      var x = rings[j]
      if(x !== last) {
        rings[optr++] = last = x
      }
    }

    counts[i] = optr - pptr
  }
}
