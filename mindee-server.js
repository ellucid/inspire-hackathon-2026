// Mindee Receipt Processing Server
// This server handles Mindee API calls securely on the backend

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// ES module dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Mindee API Key
const MINDEE_API_KEY = process.env.MINDEE_API_KEY || 'md_USZZOKv0rZHrsmd5Adp_h0CNnx-yFwSkJCq5vcGiVsI';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mindee Receipt Server is running' });
});

// Receipt upload and processing endpoint with Mindee
app.post('/api/scan-receipt', upload.single('receipt'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    console.log('📸 Processing receipt:', req.file.originalname);

    // Read the uploaded file
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // Process with Mindee API
    console.log('🔍 Sending to Mindee API...');
    
    // Create form data for Mindee
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('document', fileBuffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Call Mindee Receipt API v5
    const response = await axios.post(
      'https://api.mindee.net/v1/products/mindee/expense_receipts/v5/predict',
      formData,
      {
        headers: {
          'Authorization': MINDEE_API_KEY,
          ...formData.getHeaders()
        }
      }
    );

    console.log('✅ Mindee response received');

    // Extract data from Mindee response
    const prediction = response.data.document.inference.prediction;
    const lineItems = prediction.line_items || [];

    // Extract food items from line items
    const foodItems = lineItems.map(item => ({
      name: item.description || 'Unknown Item',
      quantity: parseFloat(item.quantity) || 1,
      price: parseFloat(item.unit_price) || 0,
      total: parseFloat(item.total_amount) || 0,
      category: classifyFoodCategory(item.description || ''),
      originalData: item
    }));

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Return parsed data
    res.json({
      success: true,
      receipt: {
        vendor: prediction.supplier_name?.value || 'Unknown Store',
        date: prediction.date?.value || new Date().toISOString().split('T')[0],
        total: prediction.total_amount?.value || 0,
        tax: prediction.total_tax?.value || 0,
        subtotal: prediction.total_net?.value || 0,
        currency: prediction.locale?.currency || 'USD',
      },
      items: foodItems,
      rawResponse: response.data // Include full Mindee response for debugging
    });

  } catch (error) {
    console.error('❌ Mindee API Error:', error.response?.data || error.message);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: 'Failed to process receipt',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

// Helper function to classify food categories
function classifyFoodCategory(description) {
  const descLower = description.toLowerCase();
  
  const categories = {
    'Fruits': ['banana', 'apple', 'orange', 'grape', 'strawberry', 'berry', 'melon', 'avocado'],
    'Vegetables': ['lettuce', 'tomato', 'carrot', 'onion', 'potato', 'spinach', 'broccoli', 'pepper', 'cucumber'],
    'Meat': ['chicken', 'beef', 'pork', 'turkey', 'bacon', 'sausage', 'ham'],
    'Seafood': ['fish', 'salmon', 'tuna', 'shrimp', 'crab'],
    'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg'],
    'Grains': ['bread', 'rice', 'pasta', 'cereal', 'flour', 'oat'],
    'Beverages': ['juice', 'soda', 'water', 'coffee', 'tea', 'drink'],
    'Snacks': ['chip', 'cookie', 'candy', 'cracker', 'snack'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => descLower.includes(keyword))) {
      return category;
    }
  }

  return 'Other';
}

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Mindee Receipt Server running on http://localhost:${PORT}`);
  console.log(`📝 Using Mindee API key for receipt processing`);
  console.log(`🔑 API Key: ${MINDEE_API_KEY.substring(0, 20)}...`);
});
