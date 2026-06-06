import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Erro ao cadastrar");
        return;
      }

      navigate("/login");
    } catch (err) {
      setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleRegister} className="flex flex-col gap-4 w-96 p-6 border rounded-lg">
        <h1 className="text-2xl font-bold">Cadastro</h1>

        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
          required
        />

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
          className="bg-green-600 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>

        <Link to="/login" className="text-blue-600 text-sm">
          Já tenho conta
        </Link>
      </form>
    </div>
  );
}