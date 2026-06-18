import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from '../components/layout/Logo';

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
      const response = await fetch("http://sebraesense-api.onrender.com/api/auth/register", {
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

      {/* Right panel — vibrant cyan with register card */}
      <div
        className="flex w-full md:w-1/2 flex-col items-center justify-center p-8 bg-[#3CDAB6]"
      >
        {/* Mobile logo (visible only on small screens) */}
        <div className="md:hidden mb-6 flex justify-center">
          <Logo light={true} />
        </div>

        <div className="w-full max-w-sm flex flex-col items-center">
          {/* Header text outside of the register card */}
          <h2 className="text-2xl font-bold mb-6 text-[#0E1B2B]">
            Crie sua conta
          </h2>

          {/* Register Form Card */}
          <form onSubmit={handleRegister} className="w-full flex flex-col gap-6 items-center">
            <div className="bg-[#D9D9D9] rounded-[24px] p-8 flex flex-col gap-5 shadow-lg border border-transparent w-full">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#0E1B2B]">
                  Nome
                </label>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white rounded-lg px-4 py-3 text-sm text-[#0E1B2B] outline-none border border-transparent focus:border-[#0E1B2B] transition-all placeholder-gray-400"
                />
              </div>

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
                  placeholder="Crie uma senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white rounded-lg px-4 py-3 text-sm text-[#0E1B2B] outline-none border border-transparent focus:border-[#0E1B2B] transition-all placeholder-gray-400"
                />
              </div>

              {error && (
                <p className="text-red-700 text-xs text-center bg-red-100/90 rounded-lg py-2 px-3 border border-red-200 mt-2">
                  {error}
                </p>
              )}

              {/* Action Buttons inside the gray card */}
              <div className="flex items-center justify-between w-full mt-4">
                <Link
                  to="/login"
                  className="text-sm text-[#0E1B2B] font-bold hover:underline transition-all cursor-pointer"
                >
                  Já tenho conta
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 cursor-pointer shadow-md bg-[#0E1B2B] hover:bg-[#152a42]"
                >
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}