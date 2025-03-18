import React from "react";

const Button = ({ text, onClick }) => {
  return (
    <button onClick={onClick} className="bg-gray-800 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-700 transition-all">
      {text}
    </button>
  );
};

export default Button;
