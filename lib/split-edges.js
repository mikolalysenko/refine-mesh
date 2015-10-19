'use strict'

module.exports = splitEdges

var pool     = require('typedarray-pool')
var ndarray  = require('ndarray')
var ndsort   = require('ndarray-sort')
var nextPow2 = require('next-pow-2')

var EDGE_SIZE = 3

function dist2(ax, ay, az, bx, by, bz) {
  return Math.pow(ax-bx, 2) + Math.pow(ay-by,2) + Math.pow(az-bz,2)
}

function reserve(array, capacity, used) {
  if(array.length >= capacity) {
    return array
  }
  capacity = nextPow2(capacity)
  var next = pool.mallocFloat32(capacity)
  for(var i=0; i<used; ++i) {
    next[i] = array[i]
  }
  pool.free(array)
  return next
}

function edgeIndex(cells, x, a, b) {
  for(var i=0; i<3; ++i) {
    var c = cells[3*x + i]
    if(c !== a && c !== b) {
      return i
    }
  }
  return -1
}

var SPLIT_ARRAY = [-1, -1, -1, -1, -1]

function splitEdges(mesh, splitBound, maxIters) {
  for(var iter=0; iter<maxIters; ++iter) {
    var numCells = mesh.numCells
    var cells    = mesh.cells
    var numVerts = mesh.numVerts
    var verts    = mesh.verts
    var normals  = mesh.normals

    var maxEdges = 3 * numCells
    var ePtr = 0
    var edges = pool.mallocInt32(maxEdges * EDGE_SIZE)

    //Generate a list of all edges which must be split
    for(var i=0; i<numCells; ++i) {
      var a = cells[3*i]
      var b = cells[3*i+1]
      var c = cells[3*i+2]

      var ax = verts[3*a]
      var ay = verts[3*a+1]
      var az = verts[3*a+2]

      var bx = verts[3*b]
      var by = verts[3*b+1]
      var bz = verts[3*b+2]

      var cx = verts[3*c]
      var cy = verts[3*c+1]
      var cz = verts[3*c+2]

      if(dist2(ax, ay, az, bx, by, bz) > splitBound) {
        edges[ePtr++] = Math.min(a, b)
        edges[ePtr++] = Math.max(a, b)
        edges[ePtr++] = i
      }

      if(dist2(bx, by, bz, cx, cy, cz) > splitBound) {
        edges[ePtr++] = Math.min(b, c)
        edges[ePtr++] = Math.max(b, c)
        edges[ePtr++] = i
      }

      if(dist2(cx, cy, cz, ax, ay, az) > splitBound) {
        edges[ePtr++] = Math.min(c, a)
        edges[ePtr++] = Math.max(c, a)
        edges[ePtr++] = i
      }
    }

    if(!ePtr) {
      pool.free(edges)
      return iter > 0
    }

    //sort edges by their vertices
    var numSplits = (ePtr / EDGE_SIZE)|0
    ndsort(ndarray(edges, [numSplits, EDGE_SIZE], [EDGE_SIZE, 1], 0))

    //again, this upper bound is crude
    verts   = reserve(verts,   3 * (numSplits + numVerts), 3 * numVerts)
    normals = reserve(normals, 3 * (numSplits + numVerts), 3 * numVerts)

    //Pass 3: (edges) split edges, log splits into vertex stream
    var splitPtr = 0

    var pa = -1
    var pb = -1
    var pf = -1
    for(var i=0; i<ePtr; i+=EDGE_SIZE) {
      var a = edges[i]
      var b = edges[i+1]
      var f = edges[i+2]

      if(a === pa && b === pb) {
        var vptr = numVerts++
        verts[3*vptr]   = 0.5 * (verts[3*a]   + verts[3*b])
        verts[3*vptr+1] = 0.5 * (verts[3*a+1] + verts[3*b+1])
        verts[3*vptr+2] = 0.5 * (verts[3*a+2] + verts[3*b+2])

        var nax = normals[3*a]
        var nay = normals[3*a+1]
        var naz = normals[3*a+2]
        var nx = 0.5 * (nax + normals[3*b])
        var ny = 0.5 * (nay + normals[3*b+1])
        var nz = 0.5 * (naz + normals[3*b+2])
        var nl = Math.pow(nx,2) + Math.pow(ny,2) + Math.pow(nz,2)

        if(nl > 1e-6) {
          nl = 1/Math.sqrt(nl)
          normals[3*vptr]   = nx * nl
          normals[3*vptr+1] = ny * nl
          normals[3*vptr+2] = nz * nl
        } else {
          normals[3*vptr]   = nax
          normals[3*vptr+1] = nay
          normals[3*vptr+2] = naz
        }

        edges[splitPtr++] = 4*f  + edgeIndex(cells, f, a, b)
        edges[splitPtr++] = vptr

        edges[splitPtr++] = 4*pf + edgeIndex(cells, pf, a, b)
        edges[splitPtr++] = vptr
      }

      pa = a
      pb = b
      pf = f
    }

    var splitCount = (splitPtr/2)|0
    
    if(splitCount === 0) {
      pool.free(edges)
      return iter > 0
    }

    //sort edges by cell id
    ndsort(ndarray(edges, [splitCount, 2], [2, 1], 0))

    //Apply splits to cells
    var cPtr = 0
    var outCells = pool.mallocInt32(nextPow2(3 * (numCells + splitCount)))
    var sPtr = 0
    for(var i=0; i<numCells; ++i) {

      if(sPtr >= numSplits || (edges[2*sPtr]>>2) !== i) {
        outCells[cPtr++] = cells[3*i]
        outCells[cPtr++] = cells[3*i+1]
        outCells[cPtr++] = cells[3*i+2]
        continue
      }

      //Sort of messy, need to handle case of multiple splits per cell

      SPLIT_ARRAY[0] = cells[3*i+1]
      SPLIT_ARRAY[1] = -1
      SPLIT_ARRAY[2] = cells[3*i+2]
      SPLIT_ARRAY[3] = -1
      SPLIT_ARRAY[4] = cells[3*i]
      SPLIT_ARRAY[5] = -1

      var idx = 0
      while(sPtr < splitCount) {
        var head = edges[2*sPtr]
        if((head>>2) !== i) {
          break
        }
        idx = 1 + 2*(head&3)
        SPLIT_ARRAY[idx] = edges[2*sPtr+1]
        sPtr += 1
      }

      //Triangulate SPLIT_ARRAY starting from base cell IDX
      var lastIdx  = -1
      var startIdx = SPLIT_ARRAY[idx]
      for(var j=1; j<6; ++j) {
        var oppIdx = SPLIT_ARRAY[(j + idx) % 6]
        if(oppIdx < 0) {
          continue
        }
        if(lastIdx >= 0) {
          outCells[cPtr++] = startIdx
          outCells[cPtr++] = lastIdx
          outCells[cPtr++] = oppIdx
        }
        lastIdx = oppIdx
      }
    }

    mesh.numVerts = numVerts
    mesh.verts    = verts
    mesh.numCells = (cPtr/3)|0
    mesh.cells    = outCells
    mesh.normals  = normals

    pool.free(cells)
    pool.free(edges)
  }

  return iter > 0
}
