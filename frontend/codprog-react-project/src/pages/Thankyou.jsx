import React from "react";
import { Link } from "react-router-dom";

function Thankyou() {
  return (
    <div>
      <h1>thank you for purchasing the course.</h1>
      <h2>
        You can see the course in{" "}
        <Link to={"/my-courses"}>My courses page</Link>
      </h2>
    </div>
  );
}

export default Thankyou;
