import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-white border-r p-4">
      <h1 className="text-xl font-bold mb-6">Le Concierge</h1>

      <nav className="space-y-2">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/tickets">Tickets</Link>
        <Link to="/users">Utilisateurs</Link>
      </nav>
    </div>
  );
};

export default Sidebar;