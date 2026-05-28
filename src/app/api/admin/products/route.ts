import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { successResponse, errorResponse } from '@/utils/response';
import { uploadFile } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    if (process.env.NODE_ENV === 'development') {
      const mongoose = require('mongoose');
      delete mongoose.models.Product;
    }
    const Product = require('@/models/Product').default;

    const products = await Product.find().sort({ createdAt: -1 });
    return successResponse(products);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    if (process.env.NODE_ENV === 'development') {
      const mongoose = require('mongoose');
      delete mongoose.models.Product;
    }
    const Product = require('@/models/Product').default;

    const body = await req.json();

    // Filter empty strings from list inputs
    const filterEmpty = (arr: any) => Array.isArray(arr) ? arr.filter((x: any) => typeof x === 'string' && x.trim() !== '') : [];

    body.highlights = filterEmpty(body.highlights);
    body.benefits = filterEmpty(body.benefits);
    body.features = filterEmpty(body.features);
    body.bestFor = filterEmpty(body.bestFor);

    // Handle image upload
    if (body.posterImage && body.posterImage.startsWith('data:')) {
      const uploadRes = await uploadFile(body.posterImage, 'products', { uploadedFor: 'productPoster' });
      body.posterImage = uploadRes.url;
    }

    const product = await Product.create(body);
    return successResponse(product, 'Product created successfully', 201);
  } catch (err: any) {
    console.error("Product Creation Error:", err);
    if (err.code === 11000) {
      return errorResponse('A product with this title already exists', 400);
    }
    return errorResponse(err.message || "Failed to create product", 400);
  }
}
