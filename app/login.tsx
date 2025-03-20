import { Text, TextInput, TouchableOpacity, View, Image, StyleSheet, useWindowDimensions, Platform } from "react-native";
import colors from "./constants/colors";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, FadeIn, FadeInUp, BounceInUp, FadeInDown } from "react-native-reanimated";
import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router } from "expo-router";
import api from "./api/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  //const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { height } = useWindowDimensions();

  const formHeight = useSharedValue(height * 0.5);
  const formPadding = useSharedValue(35);
  const borderRadius = useSharedValue(75);

  const iconStyle = useAnimatedStyle(() => ({
    borderBottomLeftRadius: borderRadius.value,
    borderBottomRightRadius: borderRadius.value,
  }));

  const formStyle = useAnimatedStyle(() => ({
    height: formHeight.value,
    paddingTop: formPadding.value,
    paddingBottom: formPadding.value,
  }));

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/account/login', {
        email,
        password,
      });

      const { token } = response.data;

      console.log(response.data)

      await AsyncStorage.setItem('token', token);

      formHeight.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) });
      formPadding.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) });
      borderRadius.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) });

      setTimeout(() => {
        router.replace("/requests");
      }, 1000);

    } catch (error: any) {
      console.error("Ошибка при логине:", error);

      if (error.response) {
        // Сервер ответил с ошибкой
        setError("Неверный email или пароль");
      } else if (error.request) {
        // Нет ответа от сервера
        setError("Нет ответа от сервера. Проверьте подключение");
      } else {
        // Ошибка при настройке запроса
        setError("Произошла ошибка при отправке запроса");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}>

      <Animated.View entering={FadeInUp.delay(300).duration(300)} style={[styles.icon_container, iconStyle]}>
        <Image source={require('../assets/images/tsu-icon.png')} style={styles.icon} />
        <Text style={styles.icon_text}>Tsu.InPass</Text>
      </Animated.View>

      <Animated.View style={[styles.form_container, formStyle]}>
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <Text style={styles.welcome_text}>Добро пожаловать!</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).springify()} style={{ width: "100%" }}>
          <TextInput
            style={styles.input}
            placeholder="Логин"
            placeholderTextColor={'#8F9098'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).springify()} style={{ width: "100%" }}>
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            placeholderTextColor={'#8F9098'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()} style={{ width: "100%" }}>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.button_text}>Войти</Text>
          </TouchableOpacity>

          {error && (
            <Text style={styles.error_text}>{error}</Text>
          )}
        </Animated.View>

      </Animated.View>
    </KeyboardAwareScrollView >
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  icon_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    width: "100%",
    paddingBottom: "20%",
    paddingTop: "20%",
  },
  form_container: {
    width: '100%',
    padding: 35,
    alignItems: 'flex-start',
  },
  icon: {
    width: 72,
    height: 72,
    resizeMode: "contain",
    //margin: 20,
    //marginTop: "20%",
  },
  welcome_text: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 22,
    marginBottom: 20,
    color: colors.text
  },
  icon_text: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    color: "#fff",
    letterSpacing: 2,
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    fontFamily: "Inter_400Regular",
  },
  button: {
    width: '100%',
    height: 45,
    marginTop: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  button_text: {
    color: '#fff',
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  error_text: {
    color: colors.danger,
    marginTop: 10,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
});