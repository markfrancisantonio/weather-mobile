export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getIconUrl(icon, size = "4x") {
  if (!icon) return null;
  return `https://openweathermap.org/img/wn/${icon}@${size}.png`;
}

export function getBackgroundColor(description = "") {
  const desc = description.toLowerCase();

  if (desc.includes("cloud")) return "#dfe6ed";
  if (desc.includes("rain")) return "#a5c8ff";
  if (desc.includes("clear")) return "#fef5b8";

  return "#f0f4f8";
}
