import { Redirect, router } from "expo-router";
import { useEffect } from "react";
import "react-native-gesture-handler";

export default function Index() {
  return <Redirect href="/login" />;
}