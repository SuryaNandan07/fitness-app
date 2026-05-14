import { router } from "expo-router";
import { useState } from "react";
import { apiRequest } from "../utils/api";
import { saveToken } from "../utils/authStorage";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin() {
        if (!email || !password) {
            Alert.alert("Missing details", "Please enter email and password");
            return;
        }

        try {
            const data = await apiRequest("/auth/login", "POST", {
                email,
                password,
            });

            await saveToken(data.token);

            Alert.alert("Success", "Login successful");
            router.replace("/");
        } catch (error: any) {
            Alert.alert("Login failed", error.message);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.card}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Login to continue your workout</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/signup")}>
                    <Text style={styles.linkText}>Don&apos;t have an account? Sign up</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
        justifyContent: "center",
        padding: 24,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 28,
        padding: 24,
    },
    title: {
        fontSize: 30,
        fontWeight: "900",
        color: "#111827",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: "#64748b",
        textAlign: "center",
        marginTop: 8,
        marginBottom: 28,
    },
    input: {
        backgroundColor: "#f1f5f9",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#111827",
        marginBottom: 14,
    },
    button: {
        backgroundColor: "#22c55e",
        paddingVertical: 15,
        borderRadius: 18,
        alignItems: "center",
        marginTop: 8,
        marginBottom: 18,
    },
    buttonText: {
        color: "white",
        fontSize: 17,
        fontWeight: "800",
    },
    linkText: {
        textAlign: "center",
        color: "#16a34a",
        fontSize: 15,
        fontWeight: "700",
    },
});