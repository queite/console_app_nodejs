function populationSum(data) {
  const inicialYear = 2018;
  const endYear = 2020;

  const selectedYears = data.filter(
    (dt) => dt.Year >= inicialYear && dt.Year <= endYear
  );

  const totalPopulation = selectedYears.reduce((acc, curr) => {
    acc += curr.Population;
    return acc;
  }, 0);

  return totalPopulation;
}

module.exports = populationSum;
