import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "index") {
            return <Feather name="home" size={size} color={color} />;
          } else if (route.name === "treinos") {
            return <FontAwesome5 name="dumbbell" size={size} color={color} />;
          } else if (route.name === "perfil") {
            return <Feather name="user" size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: "#1E90FF",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    />
  );
}
