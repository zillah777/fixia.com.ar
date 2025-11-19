import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PhoneRevealService {
  private readonly PHONE_REVEAL_TOKEN_LENGTH = 32;
  private readonly PHONE_REVEAL_EXPIRY_HOURS = 24;

  constructor(private prisma: PrismaService) { }

  /**
   * Generate a secure one-time token for phone reveal
   */
  async generatePhoneRevealToken(
    matchId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Validate match exists and user is participant
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    if (match.client_id !== userId && match.professional_id !== userId) {
      throw new ForbiddenException('You are not a participant in this match');
    }

    if (match.status !== 'active') {
      throw new BadRequestException('Phone reveal only available for active matches');
    }

    // Get the opposite party's phone number
    const oppositePartyId = match.client_id === userId ? match.professional_id : match.client_id;
    const oppositeParty = await this.prisma.user.findUnique({
      where: { id: oppositePartyId },
      select: { whatsapp_number: true, phone: true },
    });

    if (!oppositeParty?.whatsapp_number && !oppositeParty?.phone) {
      throw new NotFoundException('Phone number not available for this user');
    }

    const phoneNumber = oppositeParty.whatsapp_number || oppositeParty.phone;

    // Generate secure token
    const token = crypto.randomBytes(this.PHONE_REVEAL_TOKEN_LENGTH).toString('hex');
    const tokenHash = this.hashToken(token);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.PHONE_REVEAL_EXPIRY_HOURS);

    // Encrypt phone number before storing
    const encryptedPhone = this.encryptPhone(phoneNumber);

    // Create reveal record
    const reveal = await this.prisma.phoneReveal.create({
      data: {
        match_id: matchId,
        user_id: userId,
        phone_number: encryptedPhone,
        token,
        token_hash: tokenHash,
        expires_at: expiresAt,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
      },
    });

    return {
      token: reveal.token,
      expiresAt: reveal.expires_at,
      message: 'Use this token to reveal the phone number',
    };
  }

  /**
   * Reveal phone number using one-time token
   */
  async revealPhone(
    matchId: string,
    token: string,
    userId: string,
  ): Promise<{ phoneNumber: string; maskedNumber: string }> {
    // Validate match
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    // Validate user is participant
    if (match.client_id !== userId && match.professional_id !== userId) {
      throw new ForbiddenException('You are not a participant in this match');
    }

    // Find reveal record with matching token
    const tokenHash = this.hashToken(token);
    const reveal = await this.prisma.phoneReveal.findFirst({
      where: {
        match_id: matchId,
        token_hash: tokenHash,
        expires_at: {
          gt: new Date(), // Token must not be expired
        },
        revealed_at: null, // Token must not have been used yet
      },
    });

    if (!reveal) {
      throw new BadRequestException('Invalid or expired reveal token');
    }

    // Decrypt phone number
    const decryptedPhone = this.decryptPhone(reveal.phone_number);

    // Mark token as used
    await this.prisma.phoneReveal.update({
      where: { id: reveal.id },
      data: { revealed_at: new Date() },
    });

    // Update match reveal stats
    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        phone_reveal_count: { increment: 1 },
        phone_revealed_at: new Date(),
      },
    });

    // Create audit log for security
    await this.logPhoneReveal(matchId, userId, reveal.ip_address, reveal.user_agent);

    return {
      phoneNumber: decryptedPhone,
      maskedNumber: this.maskPhoneNumber(decryptedPhone),
    };
  }

  /**
   * Get masked phone number for match (always available)
   */
  async getMaskedPhoneNumber(
    matchId: string,
    userId: string,
  ): Promise<{ maskedNumber: string; revealed: boolean }> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    if (match.client_id !== userId && match.professional_id !== userId) {
      throw new ForbiddenException('You are not a participant in this match');
    }

    // Get opposite party's phone
    const oppositePartyId = match.client_id === userId ? match.professional_id : match.client_id;
    const oppositeParty = await this.prisma.user.findUnique({
      where: { id: oppositePartyId },
      select: { whatsapp_number: true, phone: true },
    });

    const phoneNumber = oppositeParty?.whatsapp_number || oppositeParty?.phone;

    if (!phoneNumber) {
      throw new NotFoundException('Phone number not available');
    }

    // Check if already revealed
    const wasRevealed = match.phone_revealed_at != null;

    return {
      maskedNumber: this.maskPhoneNumber(phoneNumber),
      revealed: wasRevealed,
    };
  }

  /**
   * Get reveal history for a match
   */
  async getRevealHistory(matchId: string) {
    const reveals = await this.prisma.phoneReveal.findMany({
      where: { match_id: matchId },
      select: {
        id: true,
        user_id: true,
        revealed_at: true,
        expires_at: true,
        created_at: true,
        ip_address: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return reveals;
  }

  /**
   * Private utility functions
   */

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private maskPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    if (digits.length < 10) {
      return phone;
    }

    const start = digits.slice(0, 5);
    const end = digits.slice(-4);
    const middle = '*'.repeat(digits.length - 9);

    return `+${start} ${middle} ${end}`;
  }

  private encryptPhone(phone: string): string {
    const algorithm = 'aes-256-gcm';
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    const secretKey = Buffer.from(encryptionKey).slice(0, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    let encrypted = cipher.update(phone, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}.${authTag.toString('hex')}.${encrypted}`;
  }

  private decryptPhone(encryptedData: string): string {
    try {
      const algorithm = 'aes-256-gcm';
      const encryptionKey = process.env.ENCRYPTION_KEY;
      if (!encryptionKey) {
        throw new Error('ENCRYPTION_KEY environment variable is not set');
      }
      const secretKey = Buffer.from(encryptionKey).slice(0, 32);

      const [ivHex, authTagHex, ciphertext] = encryptedData.split('.');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new BadRequestException('Failed to decrypt phone number');
    }
  }

  private async logPhoneReveal(
    matchId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      await this.prisma.userActivity.create({
        data: {
          user_id: userId,
          action: 'phone_number_revealed',
          resource_type: 'match',
          resource_id: matchId,
          metadata: {
            ipAddress,
            userAgent,
          },
        },
      });
    } catch (error) {
      console.error('Failed to log phone reveal:', error);
    }
  }
}
