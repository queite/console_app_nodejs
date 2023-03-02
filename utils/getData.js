const axios = require("axios");

async function getData() {
  const response = await axios.get(
    "https://datausa.io/api/data?drilldowns=Nation&measures=Population"
  );

  return response.data.data;
}

module.exports = getData;
