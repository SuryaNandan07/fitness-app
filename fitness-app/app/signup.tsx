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

export default function SignupScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSignup() {
        if (!name || !email || !password) {
            Alert.alert("Missing details", "Please fill all fields");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Weak password", "Password must be at least 6 characters");
            return;
        }

        try {
            const data = await apiRequest("/auth/signup", "POST", {
                name,
                email,
                password,
            });

            await saveToken(data.token);

            Alert.alert("Success", "Signup successful");
            router.replace("/");
        } catch (error: any) {
            Alert.alert("Signup failed", error.message);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.card}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Start tracking your fitness journey</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#94a3b8"
                    value={name}
                    onChangeText={setName}
                />

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

                <TouchableOpacity style={styles.button} onPress={handleSignup}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/login")}>
                    <Text style={styles.linkText}>Already have an account? Login</Text>
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