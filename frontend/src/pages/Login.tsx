import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from '../components/layout/Logo';

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
    <div className="min-h-screen flex font-sans">
      {/* Left panel — dark blue/slate with Sebrae Sense logo */}
      <div
        className="hidden md:flex w-1/2 flex-col justify-between p-12"
        style={{ backgroundColor: "#0E1B2B" }}
      >
        <div>
          <Logo />
        </div>

        <div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Plataforma inteligente de monitoramento de clientes Sebrae em tempo real.
          </p>
        </div>
      </div>

      {/* Right panel — vibrant cyan with login card */}
      <div
        className="flex w-full md:w-1/2 flex-col items-center justify-center p-8 bg-[#3CDAB6]"
      >
        {/* Mobile logo (visible only on small screens) */}
        <div className="md:hidden mb-6 flex justify-center">
          <Logo light={true} />
        </div>

        <div className="w-full max-w-sm flex flex-col items-center">
          {/* Header text outside of the login card */}
          <h2 className="text-2xl font-bold mb-6 text-[#0E1B2B]">
            Entre na sua conta
          </h2>

          {/* Login Form Card */}
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
            <div className="bg-[#D9D9D9] rounded-[24px] p-8 flex flex-col gap-5 shadow-lg border border-transparent">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#0E1B2B]">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="exemplo@sebrae.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white rounded-lg px-4 py-3 text-sm text-[#0E1B2B] outline-none border border-transparent focus:border-[#0E1B2B] transition-all placeholder-gray-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#0E1B2B]">
                  Senha
                </label>
                <input
                  type="password"
                  placeholder="Insira sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white rounded-lg px-4 py-3 text-sm text-[#0E1B2B] outline-none border border-transparent focus:border-[#0E1B2B] transition-all placeholder-gray-400"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-700 text-sm text-center bg-red-100/80 rounded-lg py-2 px-4 border border-red-200">
                {error}
              </p>
            )}

            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex items-center justify-between w-full px-2">
                <button
                  type="button"
                  onClick={() => alert("Função de recuperação de senha não implementada. Cadastre um novo usuário!")}
                  className="text-xs text-[#0E1B2B] font-bold hover:underline transition-all cursor-pointer bg-transparent border-none outline-none"
                >
                  Esqueci a senha
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 cursor-pointer shadow-md bg-[#0E1B2B] hover:bg-[#152a42]"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </div>

              <Link
                to="/register"
                className="text-xs text-[#0E1B2B] font-bold hover:underline transition-all mt-2"
              >
                Não tem uma conta? Cadastre-se
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}