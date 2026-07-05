import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaModule } from '../../database/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
