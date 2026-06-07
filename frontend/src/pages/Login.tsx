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
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo — escuro com logo */}
      <div
        className="hidden md:flex w-1/2 flex-col justify-between p-12"
        style={{ backgroundColor: "#1A2530" }}
      >
        <div>
          <p className="text-xs font-bold tracking-widest text-[#4ECDC4] uppercase mb-1">
            SEBRAE
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight">
            <span className="text-[#4ECDC4]">S</span>ENSE
          </h1>
        </div>

        <div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Plataforma inteligente de monitoramento de clientes Sebrae em tempo real.
          </p>
        </div>
      </div>

      {/* Painel direito — claro com form */}
      <div
        className="flex w-full md:w-1/2 flex-col items-center justify-center p-8"
        style={{ backgroundColor: "#4ECDC4" }}
      >
        {/* Logo mobile */}
        <div className="md:hidden mb-8 text-center">
          <p className="text-xs font-bold tracking-widest text-[#1A2530] uppercase mb-1">
            SEBRAE
          </p>
          <h1 className="text-4xl font-black text-white tracking-tight">
            <span className="text-[#1A2530]">S</span>ENSE
          </h1>
        </div>

        <div className="w-full max-w-sm">
          <h2
            className="text-2xl font-bold mb-8 text-center"
            style={{ color: "#1A2530" }}
          >
            Entre na sua conta
          </h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ backgroundColor: "#D1EDE9" }}
            >
              <div className="flex flex-col gap-1">
                <label
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "#1A2530" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  placeholder="exemplo@sebrae.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white rounded-lg px-4 py-3 text-sm outline-none border-2 border-transparent focus:border-[#1A2530] transition-all"
                  style={{ color: "#1A2530" }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "#1A2530" }}
                >
                  Senha
                </label>
                <input
                  type="password"
                  placeholder="Insira sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white rounded-lg px-4 py-3 text-sm outline-none border-2 border-transparent focus:border-[#1A2530] transition-all"
                  style={{ color: "#1A2530" }}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-700 text-sm text-center bg-red-100 rounded-lg py-2 px-4">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between gap-4">
              <Link
                to="/register"
                className="text-sm text-[#1A2530] underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity"
              >
                Esqueci a senha
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: "#1A2530" }}
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}