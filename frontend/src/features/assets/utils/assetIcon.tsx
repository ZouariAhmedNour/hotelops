import {
  AirVent,
  ArrowUpDown,
  Bed,
  Camera,
  CookingPot,
  DoorOpen,
  Droplets,
  Fan,
  Flame,
  FlaskConical,
  Key,
  Lamp,
  Lightbulb,
  Monitor,
  PackageSearch,
  Phone,
  Plug,
  Power,
  Refrigerator,
  Router,
  Settings2,
  ShieldAlert,
  ShowerHead,
  Thermometer,
  Tv,
  Waves,
  Wifi,
  Wind,
} from "lucide-react";

type AssetIconProps = {
  icon?: string | null;
  size?: number;
  className?: string;
};

export const AssetIcon = ({
  icon,
  size = 20,
  className,
}: AssetIconProps) => {
  switch (icon) {
    case "TV":
    case "Tv":
      return <Tv size={size} className={className} />;

    case "REMOTE":
    case "Remote":
      return <Monitor size={size} className={className} />;

    case "AIR_CONDITIONER":
    case "AirVent":
      return <AirVent size={size} className={className} />;

    case "THERMOSTAT":
    case "Thermometer":
      return <Thermometer size={size} className={className} />;

    case "TELEPHONE":
    case "Phone":
      return <Phone size={size} className={className} />;

    case "LAMP":
    case "LampDesk":
      return <Lamp size={size} className={className} />;

    case "ELECTRICAL_OUTLET":
    case "PlugZap":
      return <Plug size={size} className={className} />;

    case "POWER_SUPPLY":
    case "BatteryCharging":
      return <Power size={size} className={className} />;

    case "MAGNETIC_LOCK":
    case "KeyRound":
    case "LockKeyhole":
      return <Key size={size} className={className} />;

    case "DOOR":
    case "DoorOpen":
      return <DoorOpen size={size} className={className} />;

    case "WINDOW":
    case "PanelsTopLeft":
      return <Monitor size={size} className={className} />;

    case "CURTAIN":
    case "Blinds":
      return <Settings2 size={size} className={className} />;

    case "BED":
    case "BedDouble":
      return <Bed size={size} className={className} />;

    case "MINIBAR":
    case "KITCHEN_FRIDGE":
    case "Refrigerator":
      return <Refrigerator size={size} className={className} />;

    case "SHOWER":
    case "ShowerHead":
      return <ShowerHead size={size} className={className} />;

    case "WASHBASIN":
    case "Waves":
      return <Waves size={size} className={className} />;

    case "TOILET":
    case "Bath":
      return <ShowerHead size={size} className={className} />;

    case "FAUCET":
    case "Droplets":
      return <Droplets size={size} className={className} />;

    case "WATER_HEATER":
    case "GAS_STOVE":
    case "Flame":
      return <Flame size={size} className={className} />;

    case "ELEVATOR":
    case "ArrowUpDown":
      return <ArrowUpDown size={size} className={className} />;

    case "POOL_PUMP":
      return <Waves size={size} className={className} />;

    case "POOL_LIGHT":
    case "Lightbulb":
      return <Lightbulb size={size} className={className} />;

    case "POOL_WATER_TREATMENT":
    case "FlaskConical":
      return <FlaskConical size={size} className={className} />;

    case "ELECTRICAL_PANEL":
    case "PanelTop":
      return <Settings2 size={size} className={className} />;

    case "OVEN":
    case "CookingPot":
      return <CookingPot size={size} className={className} />;

    case "KITCHEN_HOOD":
    case "Fan":
      return <Fan size={size} className={className} />;

    case "WASHING_MACHINE":
    case "WashingMachine":
      return <Settings2 size={size} className={className} />;

    case "DRYER":
    case "Wind":
      return <Wind size={size} className={className} />;

    case "CCTV_CAMERA":
    case "Cctv":
      return <Camera size={size} className={className} />;

    case "SMOKE_DETECTOR":
    case "AlarmSmoke":
    case "FIRE_EXTINGUISHER":
    case "FireExtinguisher":
    case "FIRE_ALARM_PANEL":
    case "Siren":
      return <ShieldAlert size={size} className={className} />;

    case "WIFI_ROUTER":
    case "Router":
      return <Router size={size} className={className} />;

    case "WIFI_ACCESS_POINT":
    case "Wifi":
      return <Wifi size={size} className={className} />;

    default:
      return <PackageSearch size={size} className={className} />;
  }
};