import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Gift } from "lucide-react";
import { Button } from "../ui/button";

function PublicNavigation() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link to="/" className="flex items-center space-x-3">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="h-10 w-10 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Fixia" className="h-full w-full object-contain" />
            </div>
            <div className="absolute -inset-1 liquid-gradient rounded-xl blur opacity-20 animate-pulse-slow"></div>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold tracking-tight">Fixia</span>
            <span className="text-xs text-muted-foreground -mt-1">Conecta. Confía. Resuelve.</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center space-x-8">
          <Link to="/services" className="text-foreground hover:text-primary transition-colors font-medium">
            Explorar Servicios
          </Link>
          <Link to="/pricing" className="text-foreground/80 hover:text-foreground transition-colors">
            Planes
          </Link>
          <Link to="/how-it-works" className="text-foreground/80 hover:text-foreground transition-colors">
            Cómo Funciona
          </Link>
          <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors">
            Sobre Nosotros
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link to="/login"><Button variant="ghost" className="hover:glass-medium transition-all duration-300">Iniciar Sesión</Button></Link>
          <Link to="/register"><Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg"><Gift className="h-4 w-4 mr-2" />Únete Gratis</Button></Link>
        </div>
      </div>
    </motion.header>
  );
}

export function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />
      {children}
    </div>
  );
}