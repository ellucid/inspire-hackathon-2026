# Mindee Receipt Scanner Setup

## Overview
FreshKeep now uses **Mindee API** for intelligent receipt scanning. This integration automatically extracts food items, quantities, and prices from uploaded receipt photos.

## What is Mindee?
Mindee is a document parsing API that uses AI to extract structured data from receipts, invoices, and other documents. The Receipt API specifically identifies:
- Line items (food names and descriptions)
- Quantities
- Unit prices and totals
- Store name and date
- Tax and subtotal amounts

## Setup Complete ✅

### 1. API Key Configuration
Your Mindee API key is already configured in `.env`:
```bash
MINDEE_API_KEY=md_Vzv5jrmjAuic1dteoZJSLpuL52B0kX8P_nLy77QAjBY
```

### 2. Backend Server
The `mindee-server.js` backend is configured to:
- Accept receipt image uploads via POST to `/api/scan-receipt`
- Send images to Mindee Receipt API v5
- Parse the response and extract food items
- Automatically classify items into categories (Fruits, Vegetables, Meat, etc.)
- Return structured data to the frontend

### 3. Frontend Integration
`App.jsx` sends receipt images to the backend and:
- Matches extracted items against the food database
- Adds recognized items to your inventory
- Shows progress updates during scanning
- Displays the store name, date, and total

## Usage

### Running the App
```bash
# Start both frontend and backend together
npm run dev:all

# Or run them separately:
npm run dev       # Frontend on http://localhost:5173
npm run server    # Backend on http://localhost:3001
```

### Scanning a Receipt
1. Open FreshKeep in your browser (http://localhost:5174)
2. Click **"Scan Receipt"** button
3. Upload a receipt photo (JPG, PNG, or PDF)
4. Watch the progress bar as Mindee processes the image
5. Extracted food items are automatically added to your inventory

## API Details

### Mindee Receipt API v5
- **Endpoint**: `https://api.mindee.net/v1/products/mindee/expense_receipts/v5/predict`
- **Authentication**: Token-based (API key in Authorization header)
- **Supported Formats**: JPG, PNG, PDF, HEIC, TIFF
- **Max File Size**: 5MB
- **Response Time**: 1-3 seconds typical

### Response Structure
```json
{
  "document": {
    "inference": {
      "prediction": {
        "supplier_name": { "value": "Whole Foods" },
        "date": { "value": "2024-01-15" },
        "total_amount": { "value": 45.67 },
        "line_items": [
          {
            "description": "Organic Bananas",
            "quantity": 2,
            "unit_price": 0.69,
            "total_amount": 1.38
          }
        ]
      }
    }
  }
}
```

## Food Classification
The server automatically categorizes items:
- **Fruits**: banana, apple, orange, strawberry, etc.
- **Vegetables**: lettuce, tomato, carrot, broccoli, etc.
- **Meat**: chicken, beef, pork, turkey, etc.
- **Seafood**: fish, salmon, shrimp, tuna, etc.
- **Dairy**: milk, cheese, yogurt, eggs, butter, etc.
- **Grains**: bread, rice, pasta, cereal, etc.
- **Beverages**: juice, soda, coffee, tea, etc.
- **Snacks**: chips, cookies, candy, crackers, etc.

## Troubleshooting

### Receipt Not Scanning Properly
- Ensure the receipt image is clear and well-lit
- Make sure text is readable and not blurry
- Try a different image format (JPG works best)
- Check that the file size is under 5MB

### Server Connection Errors
```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Should return: {"status":"ok","message":"Mindee Receipt Server is running"}
```

### API Key Issues
If you see authentication errors:
1. Check `.env` file has correct API key
2. Restart the backend server: `npm run server`
3. Verify key starts with `md_` (Mindee format)

## Advantages of Mindee

### vs. Tesseract.js (OCR)
- ✅ **Better Accuracy**: AI-trained specifically for receipts
- ✅ **Structured Data**: Returns organized line items, not just text
- ✅ **No Client Processing**: Runs on Mindee servers (faster)
- ✅ **Auto-Classification**: Identifies quantities, prices automatically

### vs. Veryfi
- ✅ **Simpler Setup**: Only needs API key (no client ID/secret/username)
- ✅ **Free Tier**: 250 documents/month free
- ✅ **Good Documentation**: Well-documented REST API
- ✅ **Quick Integration**: Less complex authentication

## API Limits
- **Free Tier**: 250 documents per month
- **Rate Limit**: 10 requests per second
- **Retention**: Documents stored for 30 days

## Next Steps
Your receipt scanner is ready to use! Just upload a receipt photo and watch the magic happen. 🎉

For more information:
- [Mindee Documentation](https://developers.mindee.com/)
- [Receipt API Guide](https://developers.mindee.com/docs/receipt-ocr)
- [API Playground](https://platform.mindee.com/)
