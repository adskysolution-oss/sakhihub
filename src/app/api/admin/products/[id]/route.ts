import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { successResponse, errorResponse } from '@/utils/response';
import { uploadFile } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    if (process.env.NODE_ENV === 'development') {
      const mongoose = require('mongoose');
      delete mongoose.models.Product;
    }
    const Product = require('@/models/Product').default;

    const { id } = await params;
    const product = await Product.findById(id);
    if (!product) return errorResponse('Product not found', 404);
    return successResponse(product);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    if (process.env.NODE_ENV === 'development') {
      const mongoose = require('mongoose');
      delete mongoose.models.Product;
    }
    const Product = require('@/models/Product').default;

    const { id } = await params;
    const body = await req.json();

    const filterEmpty = (arr: any) => Array.isArray(arr) ? arr.filter((x: any) => typeof x === 'string' && x.trim() !== '') : [];

    if (body.highlights) body.highlights = filterEmpty(body.highlights);
    if (body.benefits) body.benefits = filterEmpty(body.benefits);
    if (body.features) body.features = filterEmpty(body.features);
    if (body.bestFor) body.bestFor = filterEmpty(body.bestFor);

    // Handle image upload if provided as base64 and it's new
    if (body.posterImage && body.posterImage.startsWith('data:')) {
      const uploadRes = await uploadFile(body.posterImage, 'products', { uploadedFor: 'productPosterUpdate' });
      body.posterImage = uploadRes.url;
    }

    const product = await Product.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });
    if (!product) return errorResponse('Product not found', 404);

    return successResponse(product, 'Product updated successfully');
  } catch (err: any) {
    console.error("Product Update Error:", err);
    return errorResponse(err.message || "Failed to update product", 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    
    if (process.env.NODE_ENV === 'development') {
      const mongoose = require('mongoose');
      delete mongoose.models.Product;
    }
    const Product = require('@/models/Product').default;

    const product = await Product.findByIdAndDelete(id);
    if (!product) return errorResponse('Product not found', 404);
    return successResponse(null, 'Product deleted successfully');
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
