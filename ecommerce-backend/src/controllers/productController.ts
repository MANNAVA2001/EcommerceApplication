// backend/src/controllers/productController.ts

import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Product, Category, ComparisonField, User } from '../config/database';
import { AuthRequest } from '../models/User';
import { IComparisonField, CategoryAttributes } from '../models/Category';
import { ProductAttributes, ProductCreationAttributes } from '../models/Product';
import { LoggerService } from '../services/loggerService';
import { ScraperService } from '../services/scraperService';
// updated with Products brower and management functionalities.
interface ProductRequestBody {
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  features: { [key: string]: any };
  images: string[];
  stockQuantity: number;
}
// Updated field validation and error handling.
// update ProductController to handle product management with better error handling and response structure.
// added Search and Comparison functionality.
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (req.query.categoryId && req.query.categoryId !== 'undefined' && req.query.categoryId !== 'null') {
      const categoryIdNum = parseInt(req.query.categoryId as string);
      if (!isNaN(categoryIdNum)) {
        where.categoryId = categoryIdNum;
      }
    }
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) {
        where.price[Op.gte] = parseFloat(req.query.minPrice as string);
      }
      if (req.query.maxPrice) {
        where.price[Op.lte] = parseFloat(req.query.maxPrice as string);
      }
    }
    if (req.query.query) {
      where[Op.or] = [
        { name: { [Op.like]: `%${req.query.query}%` } },
        { description: { [Op.like]: `%${req.query.query}%` } },
      ];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category' }],
      limit,
      offset,
    });

    res.status(200).json({
      totalProducts: count,
      products: rows.map(p => p.toJSON()),
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: (error as Error).message });
  }
};
// Handled the  social media sharing functionality.
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }],
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' }) as unknown as void;
    }
    res.status(200).json(product.toJSON());
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Failed to fetch product', error: (error as Error).message });
  }
};
// Handled the product creation with validation and error handling.
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, categoryId, features, images, stockQuantity } = req.body as ProductRequestBody;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Category not found' })as unknown as void;
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      categoryId,
      features: JSON.stringify(features || {}),
      images: JSON.stringify(images || []),
      stockQuantity,
      inStock: stockQuantity > 0,
    } as ProductCreationAttributes);
    res.status(201).json(newProduct.toJSON()); // Return toJSON()
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product', error: (error as Error).message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, features, images, stockQuantity } = req.body as Partial<ProductRequestBody>;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' }) as unknown as void;

    }

    const updateData: Partial<ProductAttributes> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (categoryId !== undefined) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Category not found' })as unknown as void;
      }
      updateData.categoryId = categoryId;
    }
    if (features !== undefined) {
      updateData.features = JSON.stringify(features);
    }
    if (images !== undefined) {
      updateData.images = JSON.stringify(images);
    }
    if (stockQuantity !== undefined) {
      updateData.stockQuantity = stockQuantity;
      updateData.inStock = stockQuantity > 0;
    }

    await product.update(updateData);
    res.status(200).json(product.toJSON()); // Return toJSON()
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product', error: (error as Error).message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' }) as unknown as void;
    }
    await product.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product', error: (error as Error).message });
  }
};

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, categoryId, minPrice, maxPrice } = req.query;

    const where: any = {};
    if (query) {
      where[Op.or] = [
        { name: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (minPrice) {
      where.price = { ...where.price, [Op.gte]: parseFloat(minPrice as string) };
    }
    if (maxPrice) {
      where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice as string) };
    }

    const products = await Product.findAll({
      where,
      include: [{ model: Category, as: 'category' }],
    });
    res.status(200).json(products.map(p => p.toJSON())); // Return toJSON()
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Failed to search products', error: (error as Error).message });
  }
};

export const compareProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productIds, categoryId } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({ message: 'At least 2 product IDs are required for comparison' }) as unknown as void;
    }
    if (!categoryId) {
      return res.status(400).json({ message: 'Category ID is required for comparison' }) as unknown as void;
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' }) as unknown as void;
    }

    const products = await Product.findAll({
      where: {
        id: { [Op.in]: productIds },
        categoryId: categoryId,
      },
      include: [{ model: Category, as: 'category' }],
    });

    if (products.length !== productIds.length) {
      // Some products were not found or did not belong to the specified category
      return res.status(404).json({ message: 'One or more products not found or do not belong to the specified category' }) as unknown as void;
    }
    const categoryJson = category.toJSON();
    if (typeof categoryJson.comparisonFields === 'string') {
        categoryJson.comparisonFields = JSON.parse(categoryJson.comparisonFields);
    }

    const productsJson = products.map(p => {
        const pJson = p.toJSON();
        if (typeof pJson.features === 'string') {
            pJson.features = JSON.parse(pJson.features);
        }
        if (typeof pJson.images === 'string') {
            pJson.images = JSON.parse(pJson.images);
        }
        return pJson;
    });

    res.status(200).json({
      category: categoryJson,
      products: productsJson,
    });
  } catch (error) {
    console.error('Error comparing products:', error);
    res.status(500).json({ message: 'Failed to compare products', error: (error as Error).message }) as unknown as void;
  }
};

export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit as string, 10) || 5;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' }) as unknown as void;
    }
    const productJson = product.toJSON();
    if (typeof productJson.features === 'string') {
        productJson.features = JSON.parse(productJson.features);
    }
    if (typeof productJson.images === 'string') {
        productJson.images = JSON.parse(productJson.images);
    }

    let recommendations: any[] = [];
    try {
      // Mocking the FastAPI call
      const fastapiServiceUrl = process.env.FASTAPI_RECOMMENDATION_URL || 'http://localhost:8000';
      const response = await fetch(`${fastapiServiceUrl}/recommendations/${productId}?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        recommendations = data.recommendations || [];
      } else {
        console.warn(`FastAPI recommendation service responded with status: ${response.status}`);
        // Fallback to simpler recommendations if service fails
        const fallbackProducts = await Product.findAll({
          where: {
            categoryId: product.categoryId,
            id: { [Op.ne]: product.id },
          },
          limit: limit,
          order: [['createdAt', 'DESC']],
        });
        recommendations = fallbackProducts.map(p => {
            const pJson = p.toJSON();
            if (typeof pJson.features === 'string') {
                pJson.features = JSON.parse(pJson.features);
            }
            if (typeof pJson.images === 'string') {
                pJson.images = JSON.parse(pJson.images);
            }
            return {
                ...pJson,
                similarity_score: 0.5,
            };
        });
      }
    } catch (fetchError) {
      console.error('Error fetching recommendations from external service, falling back:', fetchError);
      // Fallback to simpler recommendations if service is unreachable
      const fallbackProducts = await Product.findAll({
        where: {
          categoryId: product.categoryId,
          id: { [Op.ne]: product.id },
        },
        limit: limit,
        order: [['createdAt', 'DESC']],
      });
      recommendations = fallbackProducts.map(p => {
          const pJson = p.toJSON();
          if (typeof pJson.features === 'string') {
              pJson.features = JSON.parse(pJson.features);
          }
          if (typeof pJson.images === 'string') {
              pJson.images = JSON.parse(pJson.images);
          }
          return {
              ...pJson,
              similarity_score: 0.5,
          };
      });
    }
res.status(200).json({
      product: productJson,
      recommendations,
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Failed to get recommendations', error: (error as Error).message });
  }
};

const priceCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 3600000; // 1 hour in milliseconds
// fixed the issue and now share button is visible on product details page.
export const compareExternalPrices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: productId } = req.params;
    const { productName } = req.body;

    if (!productId || !productName) {
      return res.status(400).json({ message: 'Product ID and name are required' }) as unknown as void;
    }

    const cacheKey = `external_prices:${productId}`;
    const now = Date.now();
    
    const cachedEntry = priceCache.get(cacheKey);
    if (cachedEntry && (now - cachedEntry.timestamp) < CACHE_DURATION) {
      LoggerService.info('ExternalPriceService', 'Cache hit for external prices', { productId });
      return res.status(200).json({
        success: true,
        data: cachedEntry.data
      }) as unknown as void;
    }

    LoggerService.info('ExternalPriceService', 'Starting web scraping for external prices', { productId, productName });
    
    const scrapedData = await ScraperService.scrapeAllRetailers(productName);
    
    const retailerData = {
      productName,
      retailers: scrapedData
    };

    priceCache.set(cacheKey, {
      data: retailerData,
      timestamp: now
    });
    
    if (priceCache.size > 1000) {
      const cutoff = now - CACHE_DURATION;
      for (const [key, entry] of priceCache.entries()) {
        if (entry.timestamp < cutoff) {
          priceCache.delete(key);
        }
      }
    }

    LoggerService.info('ExternalPriceService', 'External prices cached in memory', { productId });

    res.status(200).json({
      success: true,
      data: retailerData
    });
  } catch (error) {
    LoggerService.error('ExternalPriceService', 'Failed to fetch external prices', error as Error, { productId: req.params.id });
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch external prices', 
      error: (error as Error).message 
    });
  }
};
