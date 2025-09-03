import { Controller, Post, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma.service';

@ApiTags('Migration Cleanup')
@Controller('admin/migration-cleanup')
export class MigrationCleanupController {
  private readonly logger = new Logger(MigrationCleanupController.name);
  
  constructor(private prisma: PrismaService) {}

  @Post('reset-migration-state')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset failed migration state in Prisma' })
  async resetMigrationState() {
    this.logger.warn('🔄 Resetting migration state for failed security migration...');
    
    try {
      // Delete the failed migration record from _prisma_migrations table
      await this.prisma.$executeRaw`
        DELETE FROM "_prisma_migrations" 
        WHERE "migration_name" = '20250903000000_add_security_features'
      `;
      
      this.logger.log('✅ Failed migration record removed from _prisma_migrations');

      // Check if the actual database changes were applied
      const columnsCheck = await this.prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN ('failed_login_attempts', 'locked_until')
      `;

      const tableCheck = await this.prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'password_history'
      `;

      const hasSecurityColumns = Array.isArray(columnsCheck) && columnsCheck.length >= 2;
      const hasPasswordHistoryTable = Array.isArray(tableCheck) && tableCheck.length > 0;

      this.logger.log(`Security columns exist: ${hasSecurityColumns}`);
      this.logger.log(`Password history table exists: ${hasPasswordHistoryTable}`);

      if (hasSecurityColumns && hasPasswordHistoryTable) {
        // If database changes exist, mark migration as successful
        await this.prisma.$executeRaw`
          INSERT INTO "_prisma_migrations" (
            id, 
            checksum, 
            finished_at, 
            migration_name, 
            logs, 
            rolled_back_at, 
            started_at, 
            applied_steps_count
          )
          VALUES (
            '20250903000000_add_security_features',
            '${Buffer.from('security migration cleanup').toString('hex')}',
            NOW(),
            '20250903000000_add_security_features',
            'Migration state reset - database changes already applied',
            NULL,
            NOW(),
            5
          )
        `;
        
        this.logger.log('✅ Migration marked as successfully completed');
        
        return {
          status: 'success',
          message: 'Migration state reset successfully - database changes were already applied',
          databaseState: {
            hasSecurityColumns: true,
            hasPasswordHistoryTable: true,
            migrationRecorded: true
          },
          timestamp: new Date().toISOString(),
        };
      } else {
        this.logger.log('⚠️ Database changes not found - migration needs to be re-executed');
        
        return {
          status: 'success',
          message: 'Failed migration record cleaned - database changes need to be re-applied',
          databaseState: {
            hasSecurityColumns: false,
            hasPasswordHistoryTable: false,
            migrationRecorded: false,
            requiresReExecution: true
          },
          timestamp: new Date().toISOString(),
        };
      }

    } catch (error) {
      this.logger.error('❌ Migration state reset failed:', error);
      
      return {
        status: 'error',
        message: 'Migration state reset failed: ' + error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}