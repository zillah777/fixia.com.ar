import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { api } from "@/lib/api";

interface CategoryStat {
  category: string;
  slug: string;
  count: number;
}

// Profesiones comunes que se están buscando (fallback)
const defaultProfessions: CategoryStat[] = [
  { category: "Panaderos", slug: "panaderos", count: 0 },
  { category: "Albañiles", slug: "albaniles", count: 0 },
  { category: "Cocineros", slug: "cocineros", count: 0 },
  { category: "Mozos", slug: "mozos", count: 0 },
  { category: "Electricistas", slug: "electricistas", count: 0 },
  { category: "Plomeros", slug: "plomeros", count: 0 },
  { category: "Peluqueros", slug: "peluqueros", count: 0 },
  { category: "Jardineros", slug: "jardineros", count: 0 },
  { category: "Mecánicos", slug: "mecanicos", count: 0 },
  { category: "Carpinteros", slug: "carpinteros", count: 0 },
  { category: "Pintores", slug: "pintores", count: 0 },
  { category: "Gasistas", slug: "gasistas", count: 0 },
  { category: "Niñeras", slug: "nineras", count: 0 },
  { category: "Personal de Limpieza", slug: "limpieza", count: 0 },
  { category: "Técnicos en Refrigeración", slug: "refrigeracion", count: 0 }
];

export const ProfessionsTicker = memo(function ProfessionsTicker() {
  const [categories, setCategories] = useState<CategoryStat[]>(defaultProfessions);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get<CategoryStat[]>('/opportunities/categories-stats');
        if (data && data.length > 0) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching category stats:', error);
        // Keep default professions on error
      }
    };

    fetchCategories();
  }, []);

  // Duplicamos la lista para crear el efecto infinito
  const tickerContent = [...categories, ...categories, ...categories];

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
              duration: 25,
              ease: "linear"
            }
          }}
        >
          {tickerContent.map((category, index) => (
            <div
              key={`${category.slug}-${index}`}
              className="flex items-center gap-2 text-xs font-medium text-primary/90"
            >
              <Briefcase className="h-3 w-3 text-primary" />
              <span className="inline-flex items-center">
                <span className="text-foreground/70">Se necesita:</span>
                <span className="ml-1.5 text-primary font-semibold">
                  {category.category}
                  {category.count > 0 && (
                    <span className="ml-1 text-blue-400">({category.count} anuncios)</span>
                  )}
                </span>
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
});
