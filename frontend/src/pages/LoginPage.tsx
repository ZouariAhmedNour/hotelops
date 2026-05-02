import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuth } from "../contexts/useAuth";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await authService.login({
        email,
        password,
      });

      login(token, user);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const e = err as { response?: { data?: { message?: string } } };
        setError(e.response?.data?.message || "Erreur de connexion");
      } else {
        setError("Erreur de connexion");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5fb] p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-[#13234b] lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_40%),linear-gradient(180deg,rgba(8,12,28,0.15)_0%,rgba(8,12,28,0.65)_55%,rgba(8,12,28,0.95)_100%)]" />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,35,75,0.12)_0%,rgba(19,35,75,0.35)_45%,rgba(19,35,75,0.55)_100%)]" />

          <div className="relative z-10 flex flex-1 flex-col justify-between p-14 text-white">
            <div>
              <div className="mb-16 flex items-center gap-3 text-[17px] font-semibold">
                <div className="grid h-8 w-8 place-items-center rounded-md border border-white/30">
                  <span className="text-lg leading-none">⌂</span>
                </div>
                <span>L'Hôtelier Moderne</span>
              </div>

              <h1 className="max-w-[520px] text-5xl font-semibold leading-[1.08] tracking-tight">
                "L'excellence opérationnelle commence par une gestion invisible."
              </h1>

              <p className="mt-8 text-sm tracking-[0.35em] text-white/55">
                — VISION CONCIERGERIE 2024
              </p>
            </div>

            <div className="grid max-w-[560px] grid-cols-3 gap-6 border-t border-white/10 pt-10">
              <div>
                <div className="text-4xl font-semibold">98%</div>
                <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/55">
                  Taux de satisfaction
                </div>
              </div>
              <div>
                <div className="text-4xl font-semibold">1.2s</div>
                <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/55">
                  Temps de réponse
                </div>
              </div>
              <div>
                <div className="text-4xl font-semibold">24/7</div>
                <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/55">
                  Support expert
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex items-center justify-center px-6 py-10 md:px-10">
          <div className="w-full max-w-[470px]">
            <div className="mb-10">
              <h2 className="text-[44px] font-semibold leading-[1.05] tracking-tight text-[#13234b]">
                Bienvenue sur votre espace de gestion
              </h2>
              <p className="mt-4 text-[16px] leading-7 text-slate-500">
                Veuillez renseigner vos identifiants pour accéder au tableau de bord.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-[#13234b]">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@etablissement.com"
                  className="h-[52px] w-full rounded-none border border-slate-200 bg-white px-4 text-[15px] outline-none transition placeholder:text-slate-300 focus:border-[#13234b]"
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[13px] font-semibold uppercase tracking-wide text-[#13234b]">
                    Mot de passe
                  </label>
                  <a href="#" className="text-[13px] font-semibold text-[#13234b] hover:underline">
                    Mot de passe oublié ?
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-[52px] w-full rounded-none border border-slate-200 bg-white px-4 pr-12 text-[15px] outline-none transition placeholder:text-slate-300 focus:border-[#13234b]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-3 text-[15px] text-slate-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>Se souvenir de moi</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex h-[58px] w-full items-center justify-center rounded-full bg-[#13234b] text-[17px] font-medium text-white shadow-[0_18px_35px_rgba(19,35,75,0.28)] transition hover:translate-y-[-1px] hover:bg-[#0f1d3f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Connexion..." : "Se connecter →"}
              </button>
            </form>

            <div className="my-10 border-t border-slate-100" />

            <div>
              <p className="mb-6 text-[13px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Accès rapide par rôle
              </p>

              <div className="grid grid-cols-3 gap-3">
                {["Réception", "Étages", "Cuisine"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    className="flex h-[72px] flex-col items-center justify-center gap-1 rounded-2xl bg-[#f4f6fa] text-[#13234b] transition hover:bg-[#e9edf7]"
                  >
                    <span className="text-sm font-medium">{role}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-12 text-center text-[15px] text-slate-500">
              Nouveau sur la plateforme ?{" "}
              <Link to="/signup" className="font-semibold text-[#13234b] hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;