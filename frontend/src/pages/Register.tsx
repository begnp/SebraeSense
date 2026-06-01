import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../services/api";

export function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Erro ao cadastrar"
        );
      }

      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-4 w-96 p-6 border rounded-lg"
      >
        <h1 className="text-2xl font-bold">
          Cadastro
        </h1>

        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="border p-2 rounded"
        />

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
          className="bg-green-600 text-white p-2 rounded"
        >
          Cadastrar
        </button>

        <Link
          to="/login"
          className="text-blue-600"
        >
          Já tenho conta
        </Link>
      </form>
    </div>
  );
}