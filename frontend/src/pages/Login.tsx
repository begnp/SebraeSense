import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../services/api";

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Erro ao realizar login"
        );
      }

      localStorage.setItem("token",data.access_token);
      localStorage.setItem("user_name",data.name);
      localStorage.setItem("user_email",data.email);

      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 w-96 p-6 border rounded-lg"
      >
        <h1 className="text-2xl font-bold">
          Login
        </h1>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="border p-2 rounded"
        />

        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded"
        >
          Entrar
        </button>

        <Link
          to="/register"
          className="text-blue-600"
        >
          Criar conta
        </Link>
      </form>
    </div>
  );
}