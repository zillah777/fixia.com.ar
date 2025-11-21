import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  Search, SlidersHorizontal, Grid3X3, List, ArrowRight
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Slider } from "../components/ui/slider";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { useServices } from "../hooks/useServices";
import { toast } from "sonner";
import { PublicPageLayout } from "../components/layouts/PublicPageLayout";
import { ServiceCard } from "../components/services/ServiceCard";

const categories = [
  "Todos",
  "Desarrollo Web",
  "Diseño Gráfico",
  "Desarrollo Móvil",
  "Marketing Digital",
  "Video y Animación",
  "Ciberseguridad",
  "Redacción",
  "Traducción",
  "Consultoría"
];

const sortOptions = [
  { label: "Más relevantes", value: "relevance" },
  { label: "Precio: menor a mayor", value: "price_asc" },
  { label: "Precio: mayor a menor", value: "price_desc" },
  { label: "Mejor valorados", value: "rating" },
  { label: "Más vendidos", value: "popular" },
  { label: "Más recientes", value: "newest" }
];

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
} // NOTE: This component is specific to this page, so it's fine to keep it here.

function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode
}: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-6">
      {/* Main Search */}
      <div className="relative">
        <div className="flex glass rounded-2xl p-2 border-white/20">
          <div className="flex-1 flex items-center">
            <Search className="h-5 w-5 text-muted-foreground ml-4 mr-3" />
            <Input
              placeholder="¿Qué servicio necesitas? Ej: Diseño de logo, desarrollo web..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
          <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-8">
            Buscar
          </Button>
        </div>
      </div>

      {/* Quick Filters and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 6).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category
                ? "liquid-gradient hover:opacity-90"
                : "glass border-white/20 hover:glass-medium"
              }
            >
              {category}
            </Button>
          ))}

          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            {/* @ts-expect-error - SheetTrigger asChild is valid but TypeScript doesn't recognize it */}
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="glass border-white/20 hover:glass-medium">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Más Filtros
              </Button>
            </SheetTrigger>
            <SheetContent className="glass border-white/10 w-80">
              <SheetHeader>
                <SheetTitle>Filtros Avanzados</SheetTitle>
                <SheetDescription>
                  Personaliza tu búsqueda para encontrar el servicio perfecto
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <label className="font-medium">Rango de Precio</label>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={3000}
                      min={0}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Professional Level */}
                <div className="space-y-3">
                  <label className="font-medium">Nivel del Profesional</label>
                  <div className="space-y-2">
                    {["Rising Talent", "Pro", "Expert", "Top Rated", "Top Rated Plus"].map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox id={level} />
                        <label htmlFor={level} className="text-sm">{level}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Delivery Time */}
                <div className="space-y-3">
                  <label className="font-medium">Tiempo de Entrega</label>
                  <Select>
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue placeholder="Seleccionar tiempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-7">1-7 días</SelectItem>
                      <SelectItem value="8-14">1-2 semanas</SelectItem>
                      <SelectItem value="15-30">2-4 semanas</SelectItem>
                      <SelectItem value="30+">Más de 1 mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Sort and View Controls */}
        <div className="flex items-center space-x-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 glass border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex glass rounded-lg p-1 border-white/20">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "liquid-gradient" : "hover:glass-medium"}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "liquid-gradient" : "hover:glass-medium"}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("grid");

  const {
    data: filteredServices,
    isLoading
  } = useServices({
    searchQuery,
    selectedCategory,
    priceRange,
    sortBy,
  });

  // Proporciona un array vacío como fallback mientras los datos cargan
  // para evitar errores en los métodos .map y .length
  const services = filteredServices ?? [];

  return (
    <PublicPageLayout>
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
            Explora Servicios Profesionales
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre profesionales altamente calificados y servicios únicos.
            Tu próximo proyecto está a un clic de distancia.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <SearchAndFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </motion.div>

        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">
              {isLoading ? "Buscando..." : `${services.length} servicios encontrados`}
            </h2>
            {selectedCategory !== "Todos" && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {selectedCategory}
              </Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Mostrando {services.length} servicios
          </div>
        </motion.div>

        {/* Services Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={viewMode === "grid"
            ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-6"
          }
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <ServiceCard
                service={service as any}
                viewMode={viewMode as 'grid' | 'list'}
                isFavorite={false}
                onToggleFavorite={() => toast.info('Funcionalidad de favoritos en desarrollo')}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Load More */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <Button
              variant="outline" className="glass border-white/20 hover:glass-medium"
              onClick={() => toast.info('Funcionalidad de paginación en desarrollo.')}
            >
              Cargar Más Servicios
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && services.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="glass rounded-2xl p-12 max-w-lg mx-auto">
              <div className="h-16 w-16 liquid-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">No encontramos servicios</h3>
              <p className="text-muted-foreground mb-6">
                Intenta ajustar tus filtros o buscar con términos diferentes
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Todos");
                  setPriceRange([0, 3000]);
                }}
                className="liquid-gradient hover:opacity-90"
              >
                Limpiar Filtros
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </PublicPageLayout>
  );
}