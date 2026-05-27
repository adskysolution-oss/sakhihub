import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { successResponse, errorResponse } from '@/utils/response';
import { translateDynamicData } from '@/lib/server-translate';

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
    const lang = req.headers.get('x-language') || 'en';
    const fieldsToTranslate = ['title', 'shortDescription', 'description', 'highlights', 'benefits', 'features', 'bestFor'];

    if (slug) {
      const product = await Product.findOne({ slug, status: 'active', isVisible: true });
      if (!product) return errorResponse('Product not found', 404);
      
      const translatedProduct = await translateDynamicData(product, lang, fieldsToTranslate);
      return successResponse(translatedProduct);
    }

    const products = await Product.find({ status: 'active', isVisible: true }).sort({ createdAt: -1 });
    const translatedProducts = await translateDynamicData(products, lang, fieldsToTranslate);
    
    return successResponse(translatedProducts);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
