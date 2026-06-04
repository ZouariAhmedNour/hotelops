import Card from "../../../shared/components/ui/Card";

const UsersPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Administration
        </p>

        <h1 className="mt-2 text-4xl font-semibold text-[#13234b]">
          Ressources Humaines
        </h1>

        <p className="mt-2 text-slate-500">
          Gestion des utilisateurs, rôles et accès.
        </p>
      </div>

      <Card className="p-6">
        <p className="text-slate-500">
          La liste des utilisateurs sera connectée à l’API `/users`.
        </p>
      </Card>
    </div>
  );
};

export default UsersPage;