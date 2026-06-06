import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Erro ao realizar login");
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_name", data.name);
      localStorage.setItem("user_email", data.email);
      navigate("/");
    } catch (err) {
      setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-96 p-6 border rounded-lg">
        <h1 className="text-2xl font-bold">Login</h1>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <Link to="/register" className="text-blue-600 text-sm">
          Criar conta
        </Link>
      </form>
    </div>
  );
}