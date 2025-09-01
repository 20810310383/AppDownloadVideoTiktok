// import { Tabs } from "expo-router";
// import React from "react";
// import { Ionicons } from "@expo/vector-icons";

// export default function TabsLayout() {
//   return (
//     <Tabs
//       screenOptions={{ headerShown: false, tabBarActiveTintColor: "#e11d48" }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Home",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="home" color={color} size={size} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="menu"
//         options={{
//           title: "Menu",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="menu" color={color} size={size} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }

// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { ThemeProvider } from "@/theme/ThemeProvider";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
