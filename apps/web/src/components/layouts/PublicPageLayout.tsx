import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Gift } from "lucide-react";
import { Button } from "../ui/button";

function PublicNavigation() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
      </Link>

      <nav className="hidden lg:flex items-center space-x-4">
        <Link to="/services" className="text-foreground/80 hover:text-primary transition-colors font-medium">Explorar Servicios</Link>
        <Link to="/pricing" className="text-foreground/80 hover:text-foreground transition-colors">Planes</Link>
        <Link to="/register?type=professional" className="text-foreground/80 hover:text-foreground transition-colors">Ofrecer Servicios</Link>
      </nav>

      <div className="flex items-center space-x-4">
        <Link to="/login"><Button variant="ghost" className="hover:glass-medium transition-all duration-300">Iniciar Sesión</Button></Link>
        <Link to="/register"><Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg"><Gift className="h-4 w-4 mr-2" />Únete Gratis</Button></Link>
      </div>
    </div>
    </motion.header >
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