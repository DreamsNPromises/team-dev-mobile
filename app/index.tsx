import { Link } from "expo-router";
import { Text, Pressable } from "react-native";

export default function Index() {
  return (
    <Link href="/login" asChild>
      <Pressable>
        <Text>Home</Text>
      </Pressable>
    </Link>
  )
}