'use strict'

module.exports = collapseEdges

var pool = require('typedarray-pool')

function dist2(ax, ay, az, bx, by, bz) {
  return Math.pow(ax-bx, 2) + Math.pow(ay-by,2) + Math.pow(az-bz,2)
}

function collapseEdges(mesh, collapseBound) {
  var numCells  = mesh.numCells|0
  var cells     = mesh.cells
  var numVerts  = mesh.numVerts|0
  var verts     = mesh.verts

  var labels = pool.mallocInt32(numVerts)
  for(var i=0; i<numVerts; ++i) {
    labels[i] = -1
  }

  //Find short edges
  for(var i=0; i<numCells; ++i) {
    var a = cells[3*i]
    var b = cells[3*i+1]
    var c = cells[3*i+2]

    var la = labels[a]
    var lb = labels[b]
    var lc = labels[c]

    var ax = verts[3*a]
    var ay = verts[3*a+1]
    var az = verts[3*a+2]

    var bx = verts[3*b]
    var by = verts[3*b+1]
    var bz = verts[3*b+2]

    var cx = verts[3*c]
    var cy = verts[3*c+1]
    var cz = verts[3*c+2]

    if(la < 0 && lb < 0 &&
      dist2(ax, ay, az, bx, by, bz) < collapseBound) {
      labels[a] = la = b
      labels[b] = lb = a

      var x = Math.min(a,b)|0
      verts[3*x]   = 0.5 * (ax + bx)
      verts[3*x+1] = 0.5 * (ay + by)
      verts[3*x+2] = 0.5 * (az + bz)
    }

    if(lb < 0 && lc < 0 &&
      dist2(bx, by, bz, cx, cy, cz) < collapseBound) {
      labels[b] = lb = c
      labels[c] = lc = b

      var x = Math.min(b,c)|0
      verts[3*x]   = 0.5 * (bx + cx)
      verts[3*x+1] = 0.5 * (by + cy)
      verts[3*x+2] = 0.5 * (bz + cz)
    }

    if(lc < 0 && la < 0 &&
      dist2(cx, cy, cz, ax, ay, az) < collapseBound) {
      labels[c] = a
      labels[a] = c

      var x = Math.min(c,a)|0
      verts[3*x]   = 0.5 * (cx + ax)
      verts[3*x+1] = 0.5 * (cy + ay)
      verts[3*x+2] = 0.5 * (cz + az)
    }
  }

  //Compact vertices
  var vptr = 0
  for(var i=0; i<numVerts; ++i) {
    var l = labels[i]
    if(l < 0 || l > i) {
      labels[i] = vptr
      verts[3*vptr]   = verts[3*i]
      verts[3*vptr+1] = verts[3*i+1]
      verts[3*vptr+2] = verts[3*i+2]
      vptr += 1
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

  mesh.numVerts = vptr
  mesh.numCells = cptr

  pool.free(labels)
}
