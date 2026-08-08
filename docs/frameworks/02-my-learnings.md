# My Learings

- Combined multiple imports into single file imports for easy maintains
- for pages created `pages-export.js` and for data created `static-data.js` to export file and import it into different test files
- we can validate `array` using `toEqual` assertion which is not auto waits so use for static datas which are pre-fetched or stored.

### sorting array in a-z and z-a

```js
const products = [
  "Sauce Labs Onesie",
  "Sauce Labs Backpack",
  "Sauce Labs Bike Light",
];

// Sort A to Z
const sortedAZ = [...products].sort((a, b) => a.localeCompare(b));

// Sort Z to A
const sortedZA = [...products].sort((a, b) => b.localeCompare(a));

console.log(sortedAZ);
// Output: ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Onesie']
```

### sorting numbered array asc-desc or lohi-hilo

- to sorting array if it is going to use again somewhere then use `toSorted` instead of `sort` method as
  - `toSorted` is non-mutating
  - `sort` is mutating method
- mutatating means changes original array values
- `sort` is efficient orver `toSort`

```js
const products = [56.33, 7.99, 25.99, 15.34, 34.99];

// Sort asc
const sortedAsc = [...products].toSort((a, b) => a - b);

// Sort desc
const sortedDesc = [...products].sort((a, b) => b - a);

console.log(sortedAsc);
// Output: [ 7.99, 15.34, 25.99, 34.99, 56.33]
```
