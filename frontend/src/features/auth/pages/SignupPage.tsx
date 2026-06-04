import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../api/auth.service";
import { ROUTES } from "../../../shared/config/routes";

const SignupPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState<number>(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getErrorMessage = (err: unknown) => {
    if (typeof err === "object" && err !== null && "response" in err) {
      const e = err as { response?: { data?: { message?: string } } };
      return e.response?.data?.message || "Erreur lors de la création du compte";
    }

    return "Erreur lors de la création du compte";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!terms) {
      setError("Vous devez accepter les conditions générales.");
      return;
    }

    try {
      setLoading(true);

      await authService.register({
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        roleId,
        password,
      });

      setSuccess("Compte créé avec succès. Vous pouvez maintenant vous connecter.");

      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5fb] p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-[#13234b] lg:flex">
          <div className="relative z-10 flex flex-1 flex-col justify-between p-14 text-white">
            <div>
              <div className="mb-16 flex items-center gap-3 text-[17px] font-semibold">
                <div className="grid h-8 w-8 place-items-center rounded-md border border-white/30">
                  <span className="text-lg leading-none">⌂</span>
                </div>

                <span>Le Concierge</span>
              </div>

              <h1 className="max-w-[430px] text-5xl font-semibold leading-[1.08] tracking-tight">
                L’élégance du service, la puissance du digital.
              </h1>

              <p className="mt-8 max-w-[420px] text-lg leading-8 text-white/70">
                Centralisez vos opérations, améliorez l’expérience client et
                fluidifiez le travail de vos équipes.
              </p>
            </div>
          </div>
        </aside>

        <section className="flex items-center justify-center px-6 py-10 md:px-10">
          <div className="w-full max-w-[540px]">
            <div className="mb-10">
              <h2 className="text-[44px] font-semibold leading-[1.05] tracking-tight text-[#13234b]">
                Créer un compte professionnel
              </h2>

              <p className="mt-4 text-[16px] leading-7 text-slate-500">
                Remplissez les informations ci-dessous pour créer un accès.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-[#13234b]">
                    Nom
                  </label>

                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-[52px] w-full border border-slate-200 px-4 outline-none transition focus:border-[#13234b]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-[#13234b]">
                    Prénom
                  </label>

                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-[52px] w-full border border-slate-200 px-4 outline-none transition focus:border-[#13234b]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-[#13234b]">
                  Email professionnel
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[52px] w-full border border-slate-200 px-4 outline-none transition focus:border-[#13234b]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-[#13234b]">
                  Téléphone
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-[52px] w-full border border-slate-200 px-4 outline-none transition focus:border-[#13234b]"
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-[#13234b]">
                  Rôle
                </label>

                <select
                  value={roleId}
                  onChange={(e) => setRoleId(Number(e.target.value))}
                  className="h-[52px] w-full border border-slate-200 px-4 outline-none transition focus:border-[#13234b]"
                  required
                >
                  <option value={1}>Réception</option>
                  <option value={2}>Maintenance</option>
                  <option value={3}>Housekeeping</option>
                  <option value={4}>Administration</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-[#13234b]">
                    Mot de passe
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-[52px] w-full border border-slate-200 px-4 outline-none transition focus:border-[#13234b]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-[#13234b]">
                    Confirmation
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-[52px] w-full border border-slate-200 px-4 outline-none transition focus:border-[#13234b]"
                    required
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 text-[15px] text-slate-700">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />

                <span>
                  J’accepte les Conditions Générales et la Politique de
                  Confidentialité.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex h-[58px] w-full items-center justify-center rounded-full bg-[#13234b] text-[17px] font-medium text-white shadow-[0_18px_35px_rgba(19,35,75,0.28)] transition hover:translate-y-[-1px] hover:bg-[#0f1d3f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Création..." : "Créer un compte professionnel →"}
              </button>
            </form>

            <p className="mt-10 text-center text-[15px] text-slate-500">
              Déjà un compte ?{" "}
              <Link
                to={ROUTES.LOGIN}
                className="font-semibold text-[#13234b] hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SignupPage;