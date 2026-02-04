import { Controller, Get, Post, Body, Redirect, Query, Session, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';

// Import express sebagai namespace untuk menghindari error TS1272
import * as express from 'express';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  @Get()
  async root(
    @Query('search') search: string, 
    @Session() session: Record<string, any>,
    @Res() res: express.Response 
  ) {
    // 1. CEK STATUS LOGIN
    if (!session.isLoggedIn) {
      // Pastikan variabel error dikirim sebagai null jika baru pertama buka
      return res.render('login', { title: 'Login Admin', error: null });
    }

    // 2. JIKA SUDAH LOGIN, AMBIL DATA KATEGORI
    const categories = await this.categoryRepo.find({ order: { id: 'ASC' } });
    
    // 3. LOGIKA PENCARIAN PRODUK
    let queryOptions: any = { 
      relations: ['category'], 
      order: { id: 'ASC' } 
    };

    if (search) {
      queryOptions.where = { name: ILike(`%${search}%`) };
    }

    const products = await this.productRepo.find(queryOptions);
    
    // 4. RENDER HALAMAN UTAMA
    return res.render('index', { 
      title: 'Admin Panel',
      categories: categories,
      products: products,
      search: search 
    });
  }

  // --- LOGIKA AUTH (LOGIN/LOGOUT) ---

  @Post('login')
  async handleLogin(
    @Body('password') password: string, 
    @Session() session: Record<string, any>,
    @Res() res: express.Response // Gunakan Res untuk menangani error secara manual
  ) {
    if (password === 'admin123') {
      session.isLoggedIn = true;
      console.log('Login berhasil!');
      return res.redirect('/'); // Berhasil: Lempar ke dashboard
    } else {
      console.log('Password salah!');
      // Gagal: Tampilkan kembali halaman login dengan pesan error
      return res.render('login', { 
        title: 'Login Admin', 
        error: 'Password salah! Silakan coba lagi.' 
      });
    }
  }

  @Get('logout')
  @Redirect('/')
  async logout(@Session() session: Record<string, any>) {
    session.destroy((err) => {
        if(err) console.log('Gagal menghapus session:', err);
    });
    console.log('User telah logout');
  }

  // --- LOGIKA KATEGORI ---

  @Post('add-category')
  @Redirect('/')
  async addCategory(@Body('name') name: string) {
    await this.categoryRepo.save({ name });
  }

  @Post('delete-category')
  @Redirect('/') 
  async deleteCategory(@Body('id') id: number) {
    await this.categoryRepo.delete(id);
  }

  @Post('edit-category')
  @Redirect('/') 
  async editCategory(@Body('id') id: number, @Body('name') name: string) {
    await this.categoryRepo.update(id, { name });
  }

  // --- LOGIKA PRODUK ---

  @Post('add-product')
  @Redirect('/')
  async addProduct(
    @Body('name') name: string,
    @Body('price') price: number,
    @Body('stock') stock: number,
    @Body('categoryId') categoryId: number,
  ) {
    await this.productRepo.save({
      name,
      price,
      stock,
      category: { id: categoryId } 
    });
  }

  @Post('delete-product')
  @Redirect('/')
  async deleteProduct(@Body('id') id: number) {
    await this.productRepo.delete(id);
  }
}