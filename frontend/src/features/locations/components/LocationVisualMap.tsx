import type { HotelLocation } from "../api/locationApi";

interface Props {
  locations: HotelLocation[];
  onSelect: (location: HotelLocation) => void;
}

const typeClasses: Record<string, string> = {
  ROOM: "bg-blue-50 text-blue-700 border-blue-100",
  FLOOR: "bg-indigo-50 text-indigo-700 border-indigo-100",
  COMMON_AREA: "bg-violet-50 text-violet-700 border-violet-100",
  SERVICE_AREA: "bg-orange-50 text-orange-700 border-orange-100",
  OUTDOOR: "bg-emerald-50 text-emerald-700 border-emerald-100",
  PARKING: "bg-slate-100 text-slate-700 border-slate-200",
  OTHER: "bg-gray-50 text-gray-700 border-gray-100",
};

const LocationVisualMap = ({ locations, onSelect }: Props) => {
  const groups = locations.reduce<Record<string, HotelLocation[]>>(
    (acc, location) => {
      const floor = location.floor || "Non classé";

      if (!acc[floor]) {
        acc[floor] = [];
      }

      acc[floor].push(location);
      return acc;
    },
    {}
  );

  const floors = Object.keys(groups).sort((a, b) => {
    if (a === "RDC") return -1;
    if (b === "RDC") return 1;
    if (a === "Extérieur") return 1;
    if (b === "Extérieur") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      {floors.map((floor) => (
        <div
          key={floor}
          className="rounded-[30px] border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-[#13234b]">
                {floor === "Non classé" ? "Endroits non classés" : `Étage ${floor}`}
              </h3>

              <p className="text-sm text-slate-500">
                {groups[floor].length} endroit(s)
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groups[floor].map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => onSelect(location)}
                className={[
                  "rounded-2xl border p-4 text-left transition hover:-translate-y-1 hover:shadow-md",
                  typeClasses[location.type] ?? typeClasses.OTHER,
                ].join(" ")}
              >
                <p className="font-semibold">{location.name}</p>

                <p className="mt-1 text-xs opacity-80">
                  {location.code}
                </p>

                <p className="mt-3 text-xs opacity-80">
                  {location.zone || "Sans zone"}
                </p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LocationVisualMap;