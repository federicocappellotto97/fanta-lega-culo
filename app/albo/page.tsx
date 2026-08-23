import { ALBO_D_ORO, getMedagliere } from "@/lib/data/halloffame";
import AlboTabs from "./AlboTabs";

export const metadata = { title: "Albo d'oro" };

export default function AlboPage() {
  return (
    <AlboTabs
      editions={[...ALBO_D_ORO].reverse()}
      medagliere={getMedagliere()}
    />
  );
}
