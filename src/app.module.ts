import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity'; // Import entity Product yang baru

@Module({
  imports: [
    // 1. Konfigurasi Koneksi Database Utama
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Geologi14!', 
      database: 'db_nest_mvc',
      // Masukkan semua entity ke dalam array ini
      entities: [Category, Product], 
      autoLoadEntities: true,
      synchronize: true, // Sinkronisasi otomatis agar tabel 'products' dibuat
    }),

    // 2. Daftarkan Repository agar bisa di-Inject di Controller
    // Kita tambahkan Product di dalam array forFeature
    TypeOrmModule.forFeature([Category, Product]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}