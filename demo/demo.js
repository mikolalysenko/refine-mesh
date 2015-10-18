'use strict'

var viewer = require('mesh-viewer')()
var bunny = require('bunny')
var sc = require('simplicial-complex')
var refineMesh = require('../refine')

var meshes = []

viewer.on('viewer-init', function() {
  var data = refineMesh(bunny.cells, bunny.positions, 0.1, 1)
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
