import { useAuth } from "../../contexts/useAuth";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <div className="bg-white border-b p-4 flex justify-between">
      <h2 className="font-semibold">Dashboard</h2>

      <div className="flex gap-3 items-center">
        <span>{user?.firstName}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

export default Header;