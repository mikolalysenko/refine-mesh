refine-mesh
===========
Iterative mesh refinement based on the technique in

* M. Botsch, L. Kobbelt. 2004 "[A Remeshing Approach to Multiresolution Modeling](http://www.researchgate.net/publication/221316497_A_Remeshing_Approach_to_Multiresolution_Modeling)" EUROGRAPHICS 2004

# Example

```javascript
```

# Install

```
npm i refine-mesh
```

# API

#### `var mesh = require('refine-mesh')(cells, positions, normals, length[, maxIter])`
Applies iterative mesh refinement to a cell complex

* `cells` are the faces of the mesh
* `positions` are the `[x,y,z]` coordinates of the mesh
* `normals` are the vertex normals
* `length` is the desired edge length
* `maxIters` is the maximum number of iterations to run

**Returns** An object with the following properties

* `cells` the faces of the resulting mesh
* `positions` vertex positions of result
* `normals` vertex normals of result

# License
(c) 2015 Mikola Lysenko. MIT License
