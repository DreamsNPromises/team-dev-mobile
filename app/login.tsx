import { Text, TextInput, TouchableOpacity, View, Image, StyleSheet } from "react-native";
import colors from "./constants/colors";

export default function LoginScreen() {
  return (
    <View style={styles.container}>

      <View style={styles.iconContainer}>
        <Image source={require('../assets/images/TsuIcon.png')} style={styles.icon} />

        <Text style={styles.iconText}>Tsu.InPass</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.welcomeText}>Добро пожаловать!</Text>

        <TextInput
          style={styles.input}
          placeholder="Логин"
          placeholderTextColor={'#8F9098'}
          //value={email}
          //onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Пароль"
          placeholderTextColor={'#8F9098'}
          //value={password}
          //onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} /*onPress={handleLogin}*/>
          <Text style={styles.buttonText}>Войти</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  iconContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    width: "100%",
    borderBottomLeftRadius: 75,
    borderBottomRightRadius: 75,
  },
  formContainer: {
    flex: 1,
    width: '100%',
    padding: 35,
    alignItems: 'flex-start',
  },
  icon: {
    width: 72,
    height: 72,
    resizeMode: "contain",
    margin: 20
  },
  welcomeText: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 20,
    marginBottom: 20,
    color: colors.text
  },
  iconText: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    color: "#fff",
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    width: '100%',
    height: 40,
    marginTop: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});