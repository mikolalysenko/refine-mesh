'use strict'

module.exports = calcNormals

function calcNormals(mesh) {
  var numCells = mesh.numCells
  var cells    = mesh.cells
  var numVerts = mesh.numVerts
  var verts    = mesh.verts
  var normals  = mesh.normals

  for(var i=0; i<3*numVerts; ++i) {
    normals[i] = 0
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

    var abx = ax - bx
    var aby = ay - by
    var abz = az - bz

    var cbx = cx - bx
    var cby = cx - by
    var cbz = cx - bz

    var nx = aby * cbz - abz * cby
    var ny = abz * cbx - abx * cbz
    var nz = abx * cby - aby * cbx

    normals[3*a]   += nx
    normals[3*a+1] += ny
    normals[3*a+2] += nz

    normals[3*b]   += nx
    normals[3*b+1] += ny
    normals[3*b+2] += nz

    normals[3*c]   += nx
    normals[3*c+1] += ny
    normals[3*c+2] += nz
  }

  for(var i=0; i<numVerts; ++i) {
    var nx = normals[3*i]
    var ny = normals[3*i+1]
    var nz = normals[3*i+2]
    var nl = 1/Math.sqrt(Math.pow(nx, 2) + Math.pow(ny, 2) + Math.pow(nz, 2))
    normals[3*i]   *= nl
    normals[3*i+1] *= nl
    normals[3*i+2] *= nl
  }
}
