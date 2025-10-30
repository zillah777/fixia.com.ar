import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

interface Profession {
  name: string;
}

// Profesiones comunes que se están buscando
const defaultProfessions: Profession[] = [
  { name: "Panaderos" },
  { name: "Albañiles" },
  { name: "Cocineros" },
  { name: "Mozos" },
  { name: "Electricistas" },
  { name: "Plomeros" },
  { name: "Peluqueros" },
  { name: "Jardineros" },
  { name: "Mecánicos" },
  { name: "Carpinteros" },
  { name: "Pintores" },
  { name: "Gasistas" },
  { name: "Niñeras" },
  { name: "Personal de Limpieza" },
  { name: "Técnicos en Refrigeración" }
];

export const ProfessionsTicker = memo(function ProfessionsTicker() {
  const [professions] = useState<Profession[]>(defaultProfessions);

  // Duplicamos la lista para crear el efecto infinito
  const tickerContent = [...professions, ...professions, ...professions];

  return (
    <div className="w-full bg-gradient-to-r from-primary/10 via-blue-500/10 to-primary/10 border-b border-primary/20 overflow-hidden h-7 flex items-center">
      <div className="relative w-full">
        <motion.div
          className="flex items-center whitespace-nowrap gap-8"
          animate={{
            x: [0, -100 / 3 + "%"]
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 60,
              ease: "linear"
            }
          }}
        >
          {tickerContent.map((profession, index) => (
            <div
              key={`${profession.name}-${index}`}
              className="flex items-center gap-2 text-xs font-medium text-primary/90"
            >
              <Briefcase className="h-3 w-3 text-primary" />
              <span className="inline-flex items-center">
                <span className="text-foreground/70">Se necesita:</span>
                <span className="ml-1.5 text-primary font-semibold">{profession.name}</span>
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
});
