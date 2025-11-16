# 🌦️ Weather Forecasting Mobile App  
*A React Native (Expo) mobile version of my Weather App project.*

This is the mobile adaptation of my earlier Weather Forecasting Web App, rebuilt using **React Native + Expo**.  
My goal was to create a clean, responsive, and easy-to-use interface that feels like a real mobile weather app — complete with cards, gradients, scrollable sections, and mobile-friendly UI patterns.

This project uses mobile-specific features like **geolocation** and local storage, and includes a smooth, polished design across all screens. Overall, this is a big upgrade from the web version and was fun to build.

---

## ⭐ Features

### **Current Weather**
- City + country  
- Temperature (°C/°F toggle)  
- Weather description  
- High-resolution icons (with automatic correction for night icons)  
- Smooth gradient weather card  
- Favorite button (⭐)

### **Hourly Forecast**
- Next 8 hours  
- Full-color icons  
- Scrollable horizontal layout  
- Clean card design  

### **5-Day Forecast (Next 4 Days)**
- Day labels (Mon, Tue, Wed…)  
- Averaged temperatures  
- Weather icons  
- Simple, readable layout  

### **Search Functionality**
- Search by city name  
- Auto-loads forecast  
- Saves your last search  
- Handles blank input & errors  
- Keyboard dismissing on search  

### **Use My Location**
- Gets current GPS coordinates  
- Fetches local weather instantly  
- Saves last location used  

### **Favorites Screen**
- Save any city  
- Auto-refresh on screen focus  
- Tap a city to jump back to Home  
- Remove button per city  
- Scrollable list  

### **Settings**
- Clear Favorites  
- Clear Last Search/Selection  
- Clean card UI for settings options  

---

## 📱 Mobile-Specific Features (for grading)
- **Geolocation (GPS)**  
- **AsyncStorage** for persisting favorites and last selection  
- **React Navigation** for screen transitions  
- **SafeAreaView** for proper layout on notched devices  
- **ScrollViews** for long lists  
- **Mobile-friendly UI spacing, cards, and layout patterns**  

This app was designed **for mobile first**, not just converted from web.

---

## 🛠️ Tech Stack

- **React Native (Expo)**  
- **expo-linear-gradient**  
- **React Navigation**  
- **OpenWeather API**  
- **AsyncStorage**  
- **JavaScript / JSX**

---

## 🔐 Environment Variables (.env)

Create a **.env** file:

```
EXPO_PUBLIC_WEATHER_API_KEY=your_api_key_here
```

Do NOT commit your real API key.

---

## 🚀 Installation & Running the App

```
git clone https://github.com/markfrancisantonio/weather-mobile.git
npm install
npx expo start
```

Use Expo Go or an emulator to run the app.

---

## 📝 Notes / Reflection

Building this mobile version helped me understand mobile layout patterns — Safe Areas, scrollables, gradients, and consistent card design.  
Geolocation and persistent storage made the app feel complete.

I'm happy with the final result. Open to feedback!
