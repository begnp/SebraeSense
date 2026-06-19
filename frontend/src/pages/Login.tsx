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
      const response = await fetch(import.meta.env.VITE_API_URL + "/api/auth/login", {
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
      {/* Left panel */}
      <div
        className="hidden md:flex w-1/2 flex-col items-center justify-center p-12"
        style={{ backgroundColor: "#14273E" }}
      >
        <Logo large />
      </div>

      {/* Right panel */}
      <div
        className="flex w-full md:w-1/2 flex-col items-center justify-center p-8 bg-gradient-to-br from-[#E2FDF8] to-[#C9F6EC]"
      >
        <div className="md:hidden mb-8 flex justify-center">
          <Logo light={false} />
        </div>

        <div className="w-full max-w-md flex flex-col items-center">
          <h2 className="text-[28px] font-extrabold mb-6 text-[#14273E]">
            Entre na sua conta
          </h2>

          <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
            <div className="bg-white rounded-[24px] p-8 sm:p-10 flex flex-col gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full">
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-semibold text-[#14273E]">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="exemplo@sebrae.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#E4F8F4] rounded-full px-5 py-3.5 text-sm text-[#14273E] outline-none transition-all placeholder-gray-400 focus:ring-2 focus:ring-[#52E0CB]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-semibold text-[#14273E]">
                  Senha
                </label>
                <input
                  type="password"
                  placeholder="Insira sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#E4F8F4] rounded-full px-5 py-3.5 text-sm text-[#14273E] outline-none transition-all placeholder-gray-400 focus:ring-2 focus:ring-[#52E0CB]"
                />
              </div>

              {error && (
                <p className="text-red-700 text-xs text-center bg-red-100/90 rounded-lg py-2 px-3 border border-red-200">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between w-full mt-2">
                <button
                  type="button"
                  onClick={() => alert("Função de recuperação de senha não implementada. Cadastre um novo usuário!")}
                  className="text-sm text-[#14273E] font-medium hover:underline transition-all cursor-pointer bg-transparent border-none outline-none"
                >
                  Esqueceu a senha?
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-full text-sm font-bold text-[#14273E] transition-all disabled:opacity-50 cursor-pointer shadow-md bg-[#52E0CB] hover:bg-[#45C9B5]"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </div>
            </div>

            <Link
              to="/register"
              className="text-sm text-[#14273E] font-medium hover:underline transition-all mt-6"
            >
              Não tem uma conta? Cadastre-se
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}