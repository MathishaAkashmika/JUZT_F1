import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LapsModule } from './laps/laps.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [LapsModule, SessionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
