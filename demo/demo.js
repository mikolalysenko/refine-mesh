'use strict'

var viewer = require('mesh-viewer')({
  clearColor: [0,0,0,1]
})
var bunny = require('bunny')
var sc = require('simplicial-complex')
var normals = require('normals')
var refineMesh = require('../refine')

var meshes = []

function mkVerts(count) {
  var result = new Array(count)
  for(var i=0; i<count; ++i) {
    result[i] = [i]
  }
  return result
}

viewer.on('viewer-init', function() {
  var vnormals = normals.vertexNormals(bunny.cells, bunny.positions)
  var data = refineMesh(bunny.cells, bunny.positions, vnormals, 0.001, 3)
  meshes.push(viewer.createMesh({
    cells: data.cells,
    positions: data.positions,
    pointSize: 4,
    meshColor: [0.5, 0.5, 0.5, 1],
    useCellNormals: true,
    cellNormals: normals.faceNormals(data.cells, data.positions)
  }))
  meshes.push(viewer.createMesh({
    cells: sc.skeleton(data.cells, 1).concat(mkVerts(data.positions.length)),
    positions: data.positions,
    pointSize: 3,
    lineWidth: 1,
    meshColor: [1, 1, 1, 1]
  }))
})

viewer.on('gl-render', function() {
  //gl.enable(gl.BLEND)
  //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  meshes.forEach(function(mesh) {
    mesh.draw()
  })
})
