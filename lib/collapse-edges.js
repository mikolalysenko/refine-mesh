'use strict'

module.exports = collapseEdges

var pool = require('typedarray-pool')

function dist2(ax, ay, az, bx, by, bz) {
  return Math.pow(ax-bx, 2) + Math.pow(ay-by,2) + Math.pow(az-bz,2)
}

function collapseEdges(mesh, collapseBound, splitBound) {
  var numCells  = mesh.numCells|0
  var cells     = mesh.cells
  var numVerts  = mesh.numVerts|0
  var verts     = mesh.verts
  var normals   = mesh.normals

  var labels = pool.mallocInt32(numVerts)
  for(var i=0; i<numVerts; ++i) {
    labels[i] = -1
  }

  //Find short edges
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

    if(dist2(ax, ay, az, bx, by, bz) < collapseBound) {

      var x = Math.min(a,b)|0

      labels[a] = labels[b] = x

      verts[3*x]   = 0.5 * (ax + bx)
      verts[3*x+1] = 0.5 * (ay + by)
      verts[3*x+2] = 0.5 * (az + bz)

      var nax = normals[3*a]
      var nay = normals[3*a+1]
      var naz = normals[3*a+2]

      var nbx = normals[3*b]
      var nby = normals[3*b+1]
      var nbz = normals[3*b+2]

      var nx = 0.5 * (nax + nbx)
      var ny = 0.5 * (nay + nby)
      var nz = 0.5 * (naz + nbz)
      var nl = Math.pow(nx,2) + Math.pow(ny,2) + Math.pow(nz,2)

      if(nl > 1e-6) {
        nl = 1/Math.sqrt(nl)
        normals[3*x]   = nx * nl
        normals[3*x+1] = ny * nl
        normals[3*x+2] = nz * nl
      }

      continue
    }

    if(dist2(bx, by, bz, cx, cy, cz) < collapseBound) {

      var x = Math.min(b,c)|0

      labels[b] = labels[c] = x

      verts[3*x]   = 0.5 * (bx + cx)
      verts[3*x+1] = 0.5 * (by + cy)
      verts[3*x+2] = 0.5 * (bz + cz)

      var nbx = normals[3*b]
      var nby = normals[3*b+1]
      var nbz = normals[3*b+2]

      var ncx = normals[3*c]
      var ncy = normals[3*c+1]
      var ncz = normals[3*c+2]

      var nx = 0.5 * (nbx + ncx)
      var ny = 0.5 * (nby + ncy)
      var nz = 0.5 * (nbz + ncz)
      var nl = Math.pow(nx,2) + Math.pow(ny,2) + Math.pow(nz,2)

      if(nl > 1e-6) {
        nl = 1/Math.sqrt(nl)
        normals[3*x]   = nx * nl
        normals[3*x+1] = ny * nl
        normals[3*x+2] = nz * nl
      }

      continue
    }

    if(dist2(cx, cy, cz, ax, ay, az) < collapseBound) {

      var x = Math.min(c,a)|0

      labels[c] = labels[a] = x

      verts[3*x]   = 0.5 * (cx + ax)
      verts[3*x+1] = 0.5 * (cy + ay)
      verts[3*x+2] = 0.5 * (cz + az)

      var ncx = normals[3*c]
      var ncy = normals[3*c+1]
      var ncz = normals[3*c+2]

      var nax = normals[3*a]
      var nay = normals[3*a+1]
      var naz = normals[3*a+2]

      var nx = 0.5 * (ncx + nax)
      var ny = 0.5 * (ncy + nay)
      var nz = 0.5 * (ncz + naz)
      var nl = Math.pow(nx,2) + Math.pow(ny,2) + Math.pow(nz,2)

      if(nl > 1e-6) {
        nl = 1/Math.sqrt(nl)
        normals[3*x]   = nx * nl
        normals[3*x+1] = ny * nl
        normals[3*x+2] = nz * nl
      }

      continue
    }
  }

  //Compact vertices
  var vptr = 0
  for(var i=0; i<numVerts; ++i) {
    var l = labels[i]
    if(l < 0 || l === i) {
      labels[i] = vptr

      verts[3*vptr]     = verts[3*i]
      verts[3*vptr+1]   = verts[3*i+1]
      verts[3*vptr+2]   = verts[3*i+2]

      normals[3*vptr]   = normals[3*i]
      normals[3*vptr+1] = normals[3*i+1]
      normals[3*vptr+2] = normals[3*i+2]

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
