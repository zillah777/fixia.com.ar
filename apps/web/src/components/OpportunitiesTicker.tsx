import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface CategoryStat {
    category: string;
    slug: string;
    count: number;
}

export function OpportunitiesTicker() {
    const [categories, setCategories] = useState<CategoryStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const data = await api.get<CategoryStat[]>('/opportunities/categories-stats');

                // FILTRAR: Solo categorías con anuncios activos (count > 0)
                if (Array.isArray(data)) {
                    const activeCategories = data.filter(cat => cat && cat.count > 0);
                    setCategories(activeCategories);
                }
            } catch (error) {
                console.error('Error fetching category stats:', error);
                // En caso de error, no mostrar nada
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();

        // Actualizar cada 2 minutos
        const interval = setInterval(fetchCategories, 120000);
        return () => clearInterval(interval);
    }, []);

    // Si está cargando o no hay categorías con anuncios, no renderizar nada
    if (isLoading || categories.length === 0) {
        return null;
    }

    // Triplicar el contenido para efecto infinito suave
    const tickerContent = [...categories, ...categories, ...categories];

    return (
        <div className="opportunities-ticker-container">
            <div className="opportunities-ticker-track">
                {tickerContent.map((category, index) => (
                    <div key={`${category.slug}-${index}`} className="ticker-item">
                        <svg
                            className="ticker-icon"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                        <span className="ticker-text">
                            <span className="ticker-label">Se busca:</span>
                            <span className="ticker-category">{category.category}</span>
                            <span className="ticker-count">({category.count} {category.count === 1 ? 'anuncio' : 'anuncios'})</span>
                        </span>
                    </div>
                ))}
            </div>

            <style>{`
        .opportunities-ticker-container {
          width: 100%;
          background: linear-gradient(90deg, 
            hsl(var(--primary) / 0.1) 0%, 
            hsl(220 70% 50% / 0.1) 50%, 
            hsl(var(--primary) / 0.1) 100%
          );
          border-bottom: 1px solid hsl(var(--primary) / 0.2);
          overflow: hidden;
          height: 28px;
          display: flex;
          align-items: center;
          position: relative;
        }

        .opportunities-ticker-track {
          display: flex;
          align-items: center;
          gap: 2rem;
          white-space: nowrap;
          animation: ticker-scroll 60s linear infinite;
          will-change: transform;
        }

        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: hsl(var(--primary) / 0.9);
        }

        .ticker-icon {
          flex-shrink: 0;
          color: hsl(var(--primary));
        }

        .ticker-text {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
        }

        .ticker-label {
          color: hsl(var(--foreground) / 0.7);
        }

        .ticker-category {
          color: hsl(var(--primary));
          font-weight: 600;
        }

        .ticker-count {
          color: hsl(220 70% 50%);
          font-weight: 500;
        }

        /* Pausar animación al hover para mejor UX */
        .opportunities-ticker-container:hover .opportunities-ticker-track {
          animation-play-state: paused;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .opportunities-ticker-container {
            height: 24px;
          }
          
          .ticker-item {
            font-size: 0.6875rem;
          }
          
          .ticker-icon {
            width: 12px;
            height: 12px;
          }
        }
      `}</style>
        </div>
    );
}

export default OpportunitiesTicker;
