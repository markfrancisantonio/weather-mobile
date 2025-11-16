export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getIconUrl(icon, size = "4x") {
  if (!icon) return null;
  if (icon === "01n") icon = "01d";
  return `https://openweathermap.org/img/wn/${icon}@${size}.png`;
}

export function getBackgroundColor(description = "") {
  const desc = description.toLowerCase();

  if (desc.includes("cloud")) return "#dfe6ed";
  if (desc.includes("rain")) return "#a5c8ff";
  if (desc.includes("clear")) return "#fef5b8";

  return "#f0f4f8";
}

export function groupForecastIntoDays(list, unit) {
  if (!list || list.length === 0) return [];

  const days = {};

  list.forEach((entry) => {
    const date = new Date(entry.dt * 1000);
    const key = date.toISOString().slice(0, 10); // "YYYY-MM-DD"

    if (!days[key]) {
      days[key] = {
        temps: [],
      };
    }

    days[key].temps.push(entry.main.temp);
  });

  const result = Object.keys(days)
    .slice(1, 6)
    .map((date) => {
      const temps = days[date].temps;
      const avg = temps.reduce((a, b) => a + b, 0) / temps.length;

      const entry = list.find((e) => {
        const d = new Date(e.dt * 1000).toISOString().slice(0, 10);
        return d === date;
      });

      const icon = entry?.weather?.[0]?.icon || null;

      const weekday = new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
      });

      return {
        date: weekday,
        temp: `${Math.round(avg)}°${unit === "metric" ? "C" : "F"}`,
        icon,
      };
    });

  return result;
}
