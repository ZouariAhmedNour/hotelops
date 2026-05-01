import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuth } from "../contexts/useAuth";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await authService.login({ email, password });

      login(token, user);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const e = err as {
          response?: { data?: { message?: string } };
        };

        setError(e.response?.data?.message || "Erreur de connexion");
      } else {
        setError("Erreur de connexion");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Maintenance Hôtelière
        </h1>
        <h2 className="text-lg text-gray-600 text-center mb-6">Connexion</h2>
        {error && (
          <div
            className="bg-red-50 border border-red-300 text-red-700 p-3
rounded mb-4"
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-
1"
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2
focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2
focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-
blue-700 disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default LoginPage;
