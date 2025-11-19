import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Heart, Share2, MapPin, CheckCircle, Award, ArrowRight, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Service } from "../../types";

interface ServiceCardProps {
  service: Service;
  viewMode: 'grid' | 'list';
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function ServiceCard({ service, viewMode, isFavorite, onToggleFavorite }: ServiceCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(service.id);
    }
  };

  if (viewMode === "list") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.3 }}>
        <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 overflow-hidden">
          <div className="flex">
            <img src={service.image} alt={service.title} className="w-48 h-full object-cover" />
            <CardContent className="p-6 flex-1">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link to={`/services/${service.id}`}><h3 className="font-semibold hover:text-primary transition-colors cursor-pointer mb-2">{service.title}</h3></Link>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{service.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">${service.price.toLocaleString()}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="h-4 w-4 text-warning fill-current" />
                    <span className="font-medium">{service.rating}</span>
                    <span className="text-muted-foreground text-sm">({service.reviews})</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
      <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 overflow-hidden group h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          {service.featured && (
            <Badge className="absolute top-3 left-3 bg-warning/20 text-warning border-warning/30"><Award className="h-3 w-3 mr-1" />Destacado</Badge>
          )}
          <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-8 w-8 glass opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleFavoriteClick}>
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </Button>
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-background/80 backdrop-blur-sm text-xs">{service.category}</Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={service.professional.avatar} />
              <AvatarFallback>{service.professional.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium truncate">{service.professional.name}</span>
                {service.professional.verified && <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />}
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">{service.professional.level}</Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><Share2 className="h-4 w-4" /></Button>
          </div>

          <Link to={`/services/${service.id}`} className="flex-grow">
            <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer line-clamp-2">{service.title}</h3>
          </Link>

          <div className="flex flex-wrap gap-1">
            {service.tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="glass border-white/20 text-xs">{tag}</Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <span className="flex items-center"><Star className="h-3 w-3 mr-1 text-warning fill-current" />{service.rating} ({service.reviews})</span>
              {service.deliveryTime && <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{service.deliveryTime}</span>}
            </div>
            {service.professional.location && <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" />{service.professional.location.split(',')[0]}</span>}
          </div>

          <div className="flex items-center justify-between pt-3 mt-auto">
            <div className="flex items-center space-x-2">
              {service.originalPrice && service.originalPrice > service.price && (
                <span className="text-muted-foreground line-through text-sm">${service.originalPrice.toLocaleString()}</span>
              )}
              <span className="text-xl font-bold text-primary">${service.price.toLocaleString()}</span>
            </div>
            <Link to={`/services/${service.id}`}>
              <Button size="sm" className="liquid-gradient hover:opacity-90 transition-all duration-300">
                Ver Detalles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}