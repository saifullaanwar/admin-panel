import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

// Gunakan require untuk menghindari error "This expression is not callable"
const session = require('express-session');

async function bootstrap() {
  // Menggunakan NestExpressApplication agar bisa memproses template HTML
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Konfigurasi Folder Public (untuk CSS/JS tambahan jika ada)
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // 2. Konfigurasi View Engine (EJS)
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  // 3. Konfigurasi Middleware Session
  // Ini memungkinkan server "mengingat" status login user
  app.use(
    session({
      secret: 'geologi-secret-key-123', // Kunci rahasia untuk enkripsi session
      resave: false,
      saveUninitialized: false,
      cookie: { 
        maxAge: 3600000, // Sesi expired dalam 1 jam (60 menit)
        httpOnly: true 
      },
    }),
  );

  await app.listen(3000);
  
  console.log('--------------------------------------------------');
  console.log('🚀 Aplikasi berjalan di: http://localhost:3000');
  console.log('✅ Status: Session Aktif & Database Terhubung');
  console.log('--------------------------------------------------');
}
bootstrap();