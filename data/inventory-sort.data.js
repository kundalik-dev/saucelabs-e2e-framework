const priceSortCases = [
  {
    sortOrder: "lohi",
    direction: "Low to High",
    compare: (a, b) => a - b,
  },
  {
    sortOrder: "hilo",
    direction: "High to Low",
    compare: (a, b) => b - a,
  },
];

const nameSortCases = [
  {
    sortOrder: "az",
    direction: "Name(A to Z)",
    compare: (a, b) => a.localCompare(b),
  },
  {
    sortOrder: "za",
    direction: "Name(Z to A)",
    compare: (a, b) => b.localCompare(a),
  },
];
export { priceSortCases, nameSortCases };
