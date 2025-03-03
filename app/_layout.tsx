import { Stack } from "expo-router";
import { useFonts, Inter_700Bold, Inter_400Regular, Inter_800ExtraBold, Inter_600SemiBold } from "@expo-google-fonts/inter";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
    Inter_800ExtraBold,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) return null;

  return <Stack />;
}
