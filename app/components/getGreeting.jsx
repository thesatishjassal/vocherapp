import React from "react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "🌞 Good Morning!";
  } else if (hour >= 12 && hour < 17) {
    return "🌤️ Good Afternoon!";
  } else if (hour >= 17 && hour < 21) {
    return "🌆 Good Evening!";
  } else {
    return "🌙 Good Night!";
  }
};

const DynamicGreeting = () => {
  return <h6>{getGreeting()}</h6>;
};

export default DynamicGreeting;
