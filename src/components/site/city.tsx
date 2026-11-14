import { createContext, useContext, useState, type ReactNode } from "react";
import type { City } from "@/data/catalog";

const Ctx = createContext<{ city: City; setCity: (c: City) => void }>({ city: "Noida", setCity: () => {} });
export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCity] = useState<City>("Noida");
  return <Ctx.Provider value={{ city, setCity }}>{children}</Ctx.Provider>;
}
export const useCity = () => useContext(Ctx);
