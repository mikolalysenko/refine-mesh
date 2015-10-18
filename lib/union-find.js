'use strict'

var pool = require('typedarray-pool')

module.exports = UnionFind

function UnionFind(count) {
  this.roots = pool.malloc(count)
  this.ranks = pool.malloc(count)

  for(var i=0; i<count; ++i) {
    this.roots[i] = i
    this.ranks[i] = 0
  }
}

var proto = UnionFind.prototype

proto.find = function(x) {
  var x0 = x
  var roots = this.roots
  while(roots[x] !== x) {
    x = roots[x]
  }
  while(roots[x0] !== x) {
    var y = roots[x0]
    roots[x0] = x
    x0 = y
  }
  return x
}

proto.link = function(x, y) {
  var xr = this.find(x)
    , yr = this.find(y)
  if(xr === yr) {
    return
  }
  var ranks = this.ranks
    , roots = this.roots
    , xd    = ranks[xr]
    , yd    = ranks[yr]
  if(xd < yd) {
    roots[xr] = yr
  } else if(yd < xd) {
    roots[yr] = xr
  } else {
    roots[yr] = xr
    ++ranks[xr]
  }
}

proto.dispose = function() {
  pool.free(this.roots)
  pool.free(this.ranks)
}
