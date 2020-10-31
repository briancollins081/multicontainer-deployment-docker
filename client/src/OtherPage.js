import React from "react";
import { Link } from "react-router-dom";

const OtherPage = () => {
  return (
    <div>
      This another page of the calculator
      <Link to="/">Go Back Home</Link>
    </div>
  );
};

export default OtherPage;
