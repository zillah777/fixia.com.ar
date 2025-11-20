import { useMemo } from 'react';
import { ServiceCard } from './ServiceCard';
import type { Service } from '@/types';

/**
 * Privacy-Enhanced Service Card
 * 
 * Wraps ServiceCard with privacy filtering for professional data.
 * Hides sensitive info (full name, contact details) until match is created.
 */

interface PrivateServiceCardProps {
    service: Service;
    hasMatch?: boolean;
    viewMode?: 'grid' | 'list';
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
}

export function PrivateServiceCard({
    service,
    hasMatch = false,
    viewMode = 'grid',
    isFavorite,
    onToggleFavorite,
}: PrivateServiceCardProps) {
    const sanitizedService = useMemo(() => {
        if (hasMatch) {
            return service;
        }

        return {
            ...service,
            professional: {
                ...service.professional,
                name: getFirstName(service.professional.name),
                location: getCityOnly(service.professional.location),
            },
        };
    }, [service, hasMatch]);

    return (
        <ServiceCard
            service={sanitizedService}
            viewMode={viewMode}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
        />
    );
}

function getFirstName(fullName?: string): string {
    if (!fullName) return 'Profesional';
    const parts = fullName.trim().split(' ');
    return parts[0] || 'Profesional';
}

function getCityOnly(location?: string): string {
    if (!location) return '';
    const parts = location.split(',');
    return parts[0]?.trim() || location;
}
