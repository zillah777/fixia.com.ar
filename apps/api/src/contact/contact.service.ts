import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private prisma: PrismaService) { }

  async submitContact(contactDto: ContactDto) {
    // Save contact message to database
    const contact = await this.prisma.contactMessage.create({
      data: {
        name: contactDto.name,
        email: contactDto.email,
        subject: contactDto.subject,
        message: contactDto.message,
        status: 'pending',
      },
    });

    this.logger.log(`New contact submission saved: ${contact.id} from ${contactDto.email}`);
    this.logger.log(`Subject: ${contactDto.subject}`);

    // TODO: Send email notification to admin
    // await this.emailService.sendContactNotification(contact);

    return {
      success: true,
      message: 'Tu mensaje ha sido enviado exitosamente. Te contactaremos pronto.',
      timestamp: contact.created_at.toISOString(),
    };
  }

  async getContactStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Query real statistics from database
    const [total, thisMonth, responded] = await Promise.all([
      this.prisma.contactMessage.count(),
      this.prisma.contactMessage.count({
        where: { created_at: { gte: firstDayOfMonth } },
      }),
      this.prisma.contactMessage.count({
        where: { status: 'responded' },
      }),
    ]);

    // Calculate average response time for responded messages
    const respondedMessages = await this.prisma.contactMessage.findMany({
      where: {
        status: 'responded',
        responded_at: { not: null },
      },
      select: {
        created_at: true,
        responded_at: true,
      },
    });

    const avgResponseTime = respondedMessages.length > 0
      ? respondedMessages.reduce((sum, msg) => {
        const diff = msg.responded_at.getTime() - msg.created_at.getTime();
        return sum + diff / (1000 * 60 * 60); // Convert to hours
      }, 0) / respondedMessages.length
      : 0;

    return {
      total_messages: total,
      messages_this_month: thisMonth,
      response_rate: total > 0 ? Math.round((responded / total) * 100) : 0,
      avg_response_time_hours: Math.round(avgResponseTime * 10) / 10,
    };
  }
}