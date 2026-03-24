import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './shared/database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GenerationModule } from './generation/generation.module';
import { ProjectsModule } from './projects/projects.module';
import { StoriesModule } from './stories/stories.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    PrismaModule,
    AuthModule,
    GenerationModule,
    ProjectsModule,
    StoriesModule,
    ThrottlerModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
