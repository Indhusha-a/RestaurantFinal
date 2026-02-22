import React, { useEffect, useState } from "react";
import API from "../services/api";   

function Recommendations() {

  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    console.log("Recommendations page loaded");

    API.cf.getRecommendations()
      .then((res) => {
        console.log("Backend response:", res);
        setRestaurants(res);
      })
      .catch((err) => {
        console.error("Error:", err);
      });

  }, []);

  return (
    <div>
      <h1>Recommendations</h1>
      <p>Total: {restaurants.length}</p>
    </div>
  );
}

export default Recommendations;