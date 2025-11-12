// Convert Celsius <-> Fahrenheit
export const cToF = (c) => (c * 9) / 5 + 32;
export const fToC = (f) => ((f - 32) * 5) / 9;

// Given a temperature in °C and a selected unit, return a rounded value
export const formatTemp = (tempC, unit = "metric") =>
  unit === "metric" ? Math.round(tempC) : Math.round(cToF(tempC));
