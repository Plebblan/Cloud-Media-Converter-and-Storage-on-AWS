import { useState } from "react";
import { Cloud } from "lucide-react";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log({ email, password });

        // Replace with API call later
        if (onLogin) {
            onLogin();
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass-panel">

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: 20
                    }}
                >
                    <div
                        style={{
                            width: 70,
                            height: 70,
                            borderRadius: 18,
                            background:
                                "linear-gradient(135deg, var(--primary-cyan), var(--primary-purple))",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            boxShadow: "0 8px 30px rgba(0,242,254,.35)"
                        }}
                    >
                        <Cloud size={36} color="#050b14" />
                    </div>
                </div>

                <h1 style={{ textAlign: "center" }}>
                    CloudConvert <span className="gradient-text">Pro</span>
                </h1>

                <p
                    style={{
                        textAlign: "center",
                        color: "var(--text-muted)",
                        marginBottom: 30
                    }}
                >
                    Sign in to access your cloud storage
                </p>

                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 18
                    }}
                >
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        className="btn btn-primary"
                        type="submit"
                        style={{ justifyContent: "center" }}
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}