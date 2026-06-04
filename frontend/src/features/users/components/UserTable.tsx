import type { User } from "../../../shared/types/auth.types";

interface UserTableProps {
  users: User[];
}

const UserTable = ({ users }: UserTableProps) => {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-[0_2px_20px_rgba(15,23,42,0.06)]">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {["Nom", "Email", "Rôle", "Statut"].map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-sm font-medium text-slate-600"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 text-sm">
                {user.firstName} {user.lastName}
              </td>

              <td className="px-4 py-3 text-sm text-slate-500">
                {user.email}
              </td>

              <td className="px-4 py-3 text-sm">{user.role.name}</td>

              <td className="px-4 py-3 text-sm">
                {user.isActive ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Actif
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Inactif
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;