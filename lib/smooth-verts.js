'use strict'

module.exports = smoothVerts

var pool = require('typedarray-pool')

function smoothVerts(mesh, maxIters) {
  var numCells = mesh.numCells
  var cells    = mesh.cells
  var numVerts = mesh.numVerts
  var verts    = mesh.verts
  var normals  = mesh.normals

  var targets = pool.mallocFloat32(4 * numVerts)

  for(var iter=0; iter<maxIters; ++iter) {
    for(var i=0; i<4*numVerts; ++i) {
      targets[i] = 0
    }

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

      var px = ax + bx + cx
      var py = ay + by + cy
      var pz = az + bz + cz

      targets[4*a]   += px
      targets[4*a+1] += py
      targets[4*a+2] += pz
      targets[4*a+3] += 1

      targets[4*b]   += px
      targets[4*b+1] += py
      targets[4*b+2] += pz
      targets[4*b+3] += 1

      targets[4*c]   += px
      targets[4*c+1] += py
      targets[4*c+2] += pz
      targets[4*c+3] += 1
    }

    for(var i=0; i<numVerts; ++i) {

      var px = verts[3*i]
      var py = verts[3*i+1]
      var pz = verts[3*i+2]


      var qx = targets[4*i]
      var qy = targets[4*i+1]
      var qz = targets[4*i+2]
      var qw = targets[4*i+3]

      qw = 1/(3.0 * qw)
      qx *= qw
      qy *= qw
      qz *= qw

      var nx = normals[3*i]
      var ny = normals[3*i+1]
      var nz = normals[3*i+2]

      var l = (nx * (px - qx) + ny * (py - qy) + nz * (pz - qz))

      verts[3*i]   = qx + l * nx
      verts[3*i+1] = qy + l * ny
      verts[3*i+2] = qz + l * nz
    }
  }

  pool.free(targets)
}
