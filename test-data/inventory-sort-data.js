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
    compare: (a, b) => a.localeCompare(b),
  },
  {
    sortOrder: "za",
    direction: "Name(Z to A)",
    compare: (a, b) => b.localeCompare(a),
  },
];

export { priceSortCases, nameSortCases };
