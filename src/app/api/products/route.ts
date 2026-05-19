import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    if (process.env.NODE_ENV === 'development') {
      const mongoose = require('mongoose');
      delete mongoose.models.Product;
    }
    const Product = require('@/models/Product').default;

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const product = await Product.findOne({ slug, status: 'active', isVisible: true });
      if (!product) return errorResponse('Product not found', 404);
      return successResponse(product);
    }

    const products = await Product.find({ status: 'active', isVisible: true }).sort({ createdAt: -1 });
    return successResponse(products);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
