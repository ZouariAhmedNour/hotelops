import type { ReactNode } from "react";
import { AuthProvider } from "../../features/auth/contexts/AuthProvider";

interface AppProvidersProps {
  children: ReactNode;
}

const AppProviders = ({ children }: AppProvidersProps) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default AppProviders;