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
  var data = bunny
  data.normals = normals.vertexNormals(bunny.cells, bunny.positions)
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

  setInterval(function() {
    data = refineMesh(data.cells, data.positions, data.normals, 0.1, 1)
    meshes[0].update({
      cells: data.cells,
      positions: data.positions,
      pointSize: 4,
      meshColor: [0.5, 0.5, 0.5, 1],
      useCellNormals: true,
      cellNormals: normals.faceNormals(data.cells, data.positions)
    })
    meshes[1].update({
      cells: sc.skeleton(data.cells, 1).concat(mkVerts(data.positions.length)),
      positions: data.positions,
      pointSize: 3,
      lineWidth: 1,
      meshColor: [1, 1, 1, 1]
    })
  }, 1000)
})

viewer.on('gl-render', function() {
  meshes.forEach(function(mesh) {
    mesh.draw()
  })
})
