'use strict'

module.exports = collapseEdges

var pool = require('typedarray-pool')
var computeRings = require('./compute-1-ring')

function dist2(ax, ay, az, bx, by, bz) {
  return Math.pow(ax-bx, 2) + Math.pow(ay-by,2) + Math.pow(az-bz,2)
}

function badEdge(limit, ax, ay, az, ptr, len, verts, rings, labels) {
  for(var i=0; i<len; ++i) {
    var v = rings[ptr + i]
    if(labels[v] >= 0 ||
        dist2(ax, ay, az,
          verts[3*v],
          verts[3*v+1],
          verts[3*v+2]) >= limit) {
      return true
    }
  }
  return false
}

function collapse(
  verts, normals,
  labels,
  ringPointers, ringCounts, rings,
  collapseBound, splitBound,
  a, b,
  ax,  ay,  az,
  bx,  by,  bz,
  nax, nay, naz,
  nbx, nby, nbz) {

  if(dist2(ax, ay, az, bx, by, bz) > collapseBound) {
    return false
  }

  var aptr = ringPointers[a]
  var alen = ringCounts[a]
  var bptr = ringPointers[b]
  var blen = ringCounts[b]

  var mx = 0.5 * (ax + bx)
  var my = 0.5 * (ay + by)
  var mz = 0.5 * (az + bz)

  //Check for non-manifold edge
  var ii = 0
  var jj = 0
  var intersect = 0
  while(ii < alen && jj < blen) {
    var an = rings[ii+aptr]
    var bn = rings[jj+bptr]
    if(an === bn) {
      if(++intersect > 2) {
        //If more than 2 verts intersect, don't collapse to avoid making non-manifold flap
        return false
      }
      ii += 1
      jj += 1
    } else if(an < bn) {
      ii += 1
    } else {
      jj += 1
    }
  }

  if(badEdge(splitBound, mx, my, mz, aptr, alen, verts, rings, labels) ||
     badEdge(splitBound, mx, my, mz, bptr, blen, verts, rings, labels)) {
    return false
  }

  //Check vertex normals
  var nx = 0.5 * (nax + nbx)
  var ny = 0.5 * (nay + nby)
  var nz = 0.5 * (naz + nbz)
  var nl = Math.pow(nx,2) + Math.pow(ny,2) + Math.pow(nz,2)

  //If normals are too far apart, don't collapse
  if(nl < 0.1) {
    return false
  }

  var x = Math.min(a,b)|0

  labels[a] = labels[b] = x

  verts[3*x]   = mx
  verts[3*x+1] = my
  verts[3*x+2] = mz

  nl = 1/Math.sqrt(nl)
  normals[3*x]   = nx * nl
  normals[3*x+1] = ny * nl
  normals[3*x+2] = nz * nl

  return true
}


function collapseEdges(mesh, collapseBound, splitBound, maxIters) {
  var numCells  = mesh.numCells|0
  var cells     = mesh.cells
  var numVerts  = mesh.numVerts|0
  var verts     = mesh.verts
  var normals   = mesh.normals

  var ringPointers = pool.mallocInt32(numVerts)
  var ringCounts   = pool.mallocInt32(numVerts)
  var rings        = pool.mallocInt32(6 * numCells)


  for(var iter=0; iter<maxIters; ++iter) {
    computeRings(numCells, cells, numVerts, ringCounts, ringPointers, rings)

    var labels = pool.mallocInt32(numVerts)
    for(var i=0; i<numVerts; ++i) {
      labels[i] = -1
    }

    //Find short edges
    var collapseCount = 0

    for(var i=0; i<numCells; ++i) {
      var a  = cells[3*i]
      var b  = cells[3*i+1]
      var c  = cells[3*i+2]

      var la = labels[a]
      var lb = labels[b]
      var lc = labels[c]

      if(la >= 0 || lb >= 0 || lc >= 0) {
        continue
      }

      var ax = verts[3*a]
      var ay = verts[3*a+1]
      var az = verts[3*a+2]

      var bx = verts[3*b]
      var by = verts[3*b+1]
      var bz = verts[3*b+2]

      var cx = verts[3*c]
      var cy = verts[3*c+1]
      var cz = verts[3*c+2]

      var nax = normals[3*a]
      var nay = normals[3*a+1]
      var naz = normals[3*a+2]

      var nbx = normals[3*b]
      var nby = normals[3*b+1]
      var nbz = normals[3*b+2]

      var ncx = normals[3*c]
      var ncy = normals[3*c+1]
      var ncz = normals[3*c+2]

      if(collapse(
          verts, normals,
          labels,
          ringPointers, ringCounts, rings,
          collapseBound, splitBound,
          a, b,
          ax, ay, az,
          bx, by, bz,
          nax, nay, naz,
          nbx, nby, nbz) ||
        collapse(
          verts, normals,
          labels,
          ringPointers, ringCounts, rings,
          collapseBound, splitBound,
          b, c,
          bx, by, bz,
          cx, cy, cz,
          nbx, nby, nbz,
          ncx, ncy, ncz) ||
        collapse(
          verts, normals,
          labels,
          ringPointers, ringCounts, rings,
          collapseBound, splitBound,
          c, a,
          cx, cy, cz,
          ax, ay, az,
          ncx, ncy, ncz,
          nax, nay, naz)) {
        collapseCount += 1
      }
    }

    if(collapseCount === 0) {
      break
    }

    //Compact vertices
    var vptr = 0
    for(var i=0; i<numVerts; ++i) {
      var l = labels[i]
      if(l < 0 || l === i) {
        if(ringCounts[i] > 0) {
          labels[i] = vptr

          verts[3*vptr]     = verts[3*i]
          verts[3*vptr+1]   = verts[3*i+1]
          verts[3*vptr+2]   = verts[3*i+2]

          normals[3*vptr]   = normals[3*i]
          normals[3*vptr+1] = normals[3*i+1]
          normals[3*vptr+2] = normals[3*i+2]

          vptr += 1
        }
      } else {
        labels[i] = labels[l]
      }
    }

    //Collapse degenerate cells and compact
    var cptr = 0
    for(var i=0; i<numCells; ++i) {
      var a = labels[cells[3*i]]
      var b = labels[cells[3*i+1]]
      var c = labels[cells[3*i+2]]

      if(a !== b && b !== c && c !== a) {
        cells[3*cptr]   = a
        cells[3*cptr+1] = b
        cells[3*cptr+2] = c
        cptr += 1
      }
    }

    mesh.numVerts = numVerts = vptr
    mesh.numCells = numCells = cptr
  }

  pool.free(labels)
  pool.free(ringCounts)
  pool.free(ringPointers)
  pool.free(rings)

  return iter > 0
}
