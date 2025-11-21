import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UserStatsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Calculate professional statistics for public profile
     */
    async calculateProfessionalStats(userId: string) {
        // Verify user exists and is professional
        const user = await this.prisma.user.findUnique({
            where: { id: userId, deleted_at: null },
            select: { user_type: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Only calculate stats for professionals
        if (user.user_type !== 'professional' && user.user_type !== 'dual') {
            return null;
        }

        // Get completed matches count (project-based)
        const completedMatches = await this.prisma.match.count({
            where: {
                professional_id: userId,
                status: 'completed',
            },
        });

        // Get total matches (for completion rate)
        const totalMatches = await this.prisma.match.count({
            where: {
                professional_id: userId,
            },
        });

        // Get service matches (service-based)
        const completedServiceMatches = await this.prisma.serviceMatch.count({
            where: {
                professional_id: userId,
                status: 'completed',
            },
        });

        const totalServiceMatches = await this.prisma.serviceMatch.count({
            where: {
                professional_id: userId,
            },
        });

        // Calculate completion rate
        const allCompleted = completedMatches + completedServiceMatches;
        const allTotal = totalMatches + totalServiceMatches;
        const completionRate = allTotal > 0 ? Math.round((allCompleted / allTotal) * 100) : 0;

        // Get unique clients (repeat clients calculation)
        const uniqueClients = await this.prisma.match.groupBy({
            by: ['client_id'],
            where: {
                professional_id: userId,
            },
        });

        const uniqueServiceClients = await this.prisma.serviceMatch.groupBy({
            by: ['client_id'],
            where: {
                professional_id: userId,
            },
        });

        // Count clients with multiple matches (repeat clients)
        const clientMatchCounts = await this.prisma.match.groupBy({
            by: ['client_id'],
            where: {
                professional_id: userId,
            },
            _count: {
                id: true,
            },
        });

        const serviceClientMatchCounts = await this.prisma.serviceMatch.groupBy({
            by: ['client_id'],
            where: {
                professional_id: userId,
            },
            _count: {
                id: true,
            },
        });

        // Combine and count repeat clients
        const allClientCounts = [...clientMatchCounts, ...serviceClientMatchCounts];
        const repeatClients = allClientCounts.filter(c => c._count.id > 1).length;
        const totalUniqueClients = uniqueClients.length + uniqueServiceClients.length;
        const repeatClientRate = totalUniqueClients > 0 ? Math.round((repeatClients / totalUniqueClients) * 100) : 0;

        // Calculate average project value from accepted proposals
        const proposalsAvg = await this.prisma.proposal.aggregate({
            where: {
                professional_id: userId,
                status: 'accepted',
            },
            _avg: {
                quoted_price: true,
            },
        });

        // Return calculated stats
        return {
            completionRate,
            onTimeDelivery: 95, // Mock for now - would need delivery tracking
            repeatClients: repeatClientRate,
            avgProjectValue: Math.round(Number(proposalsAvg._avg.quoted_price) || 0),
            completedProjects: allCompleted,
            totalProjects: allTotal,
        };
    }
}
