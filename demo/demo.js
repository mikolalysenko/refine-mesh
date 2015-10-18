'use strict'

var viewer = require('mesh-viewer')()
var bunny = require('bunny')
var sc = require('simplicial-complex')
var vertexNormals = require('normals').vertexNormals
var refineMesh = require('../refine')

var meshes = []

viewer.on('viewer-init', function() {
  var normals = vertexNormals(bunny.cells, bunny.positions)
  var data = refineMesh(bunny.cells, bunny.positions, normals, 0.1, 2)
  meshes.push(viewer.createMesh({
    cells: sc.skeleton(data.cells, 1),
    //cells: data.cells,
    positions: data.positions,
    meshColor: [1, 0, 0, 1]
  }))

  //meshes.push(viewer.createMesh(bunny))
})

viewer.on('gl-render', function() {
  meshes.forEach(function(mesh) {
    mesh.draw()
  })
})
