# 2D Transforms and Animation
Starter code using the HTML5 Canvas API

---

## Matrix Class API
Code includes file `matrix.js` used to create matrices

---


### Constructor
`Matrix(m, n)`

Creates a new *m×n* matrix (`m` rows and `n` columns) with 1's on the diagonal and 0's everywhere else

**Example:**

`let t = new Matrix(3, 3);`

**Result:**

$$t = \begin{bmatrix}1 & 0 & 0\\\0 & 1 & 0\\\0 & 0 & 1\end{bmatrix}$$

---


### Member variables
`rows` -- read only<br/>
number of rows in matrix

`columns` -- read only<br/>
number of columns in matrix

`values`<br/>
2D array of matrix values (can also set values using 1D array of length *m×n*)

**Example:**

```
t.values = [[1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]];
```
```
t.values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
```

**Result:**

$$t = \begin{bmatrix}1 & 2 & 3\\\4 & 5 & 6\\\7 & 8 & 9\end{bmatrix}$$

---


### Class Methods
`multiply(matrices)`

Mutliplies matrices (where `matrices` is an array of two or more `Matrix` objects). Returns `null` if matrices cannot be multiplied.

**Example:**
```
let t1 = new Matrix(3, 3);
t1.values = [[1, 0, -5],
             [0, 1, 10],
             [0, 0, 1]];
let t2 = new Matrix(3, 3);
t2.values = [[2, 0, 0],
             [0, 4, 0],
             [0, 0, 1]];
let t = Matrix.multiply([t2, t1]);
```

**Result:**

$$t = \begin{bmatrix}2 & 0 & -10\\\0 & 4 & 40\\\0 & 0 & 1\end{bmatrix}$$

---


### Methods
`determinant()`

Returns the determinant of the matrix (result is `null` if the determinant cannot be calculated)

**Example:**
```
let t = new Matrix(3, 3);
t.values = [[2, 0, -5],
            [0, 4, 10],
            [0, 0, 1]];
let det = t.determinant()
```

**Result:**

$$det = 8$$

---


`transpose()`

Returns the transpose of the matrix

**Example:**
```
let t = new Matrix(3, 3);
t.values = [[2, 0, -5],
            [0, 4, 10],
            [0, 0, 1]];
let t_tran = t.transpose()
```

**Result:**

$$t\\_tran = \begin{bmatrix}2 & 0 & 0\\\0 & 4 & 0\\\ -5 & 10 & 1\end{bmatrix}$$

---


`inverse()`

Returns the inverse of the matrix (result is `null` if the inverse cannot be calculated)

**Example:**
```
let t = new Matrix(3, 3);
t.values = [[2, 0, -5],
            [0, 4, 10],
            [0, 0, 1]];
let t_inv = t.inverse()
```

**Result:**

$$t\\_inv = \begin{bmatrix}0.5 & 0 & 2.5\\\0 & 0.25 & -2.5\\\0 & 0 & 1\end{bmatrix}$$
