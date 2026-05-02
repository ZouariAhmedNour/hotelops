import Card from "../components/ui/Card";

const DashboardPage = () => {
  return (
    <div className="grid grid-cols-3 gap-6">
      <Card>
        <h3 className="text-sm text-gray-500">Tickets</h3>
        <p className="text-2xl font-bold">124</p>
      </Card>

      <Card>
        <h3 className="text-sm text-gray-500">Critiques</h3>
        <p className="text-2xl font-bold text-red-600">8</p>
      </Card>

      <Card>
        <h3 className="text-sm text-gray-500">En retard</h3>
        <p className="text-2xl font-bold text-orange-600">14</p>
      </Card>
    </div>
  );
};

export default DashboardPage;