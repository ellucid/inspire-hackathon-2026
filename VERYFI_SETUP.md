# FreshKeep - Veryfi Receipt Scanner Setup

## 🚀 Veryfi Integration

FreshKeep now uses **Veryfi's industry-leading AI** for receipt scanning and parsing!

### ✨ What Veryfi Provides:

- **99.8% accuracy** in receipt data extraction
- Automatic line item detection
- Price and quantity extraction
- Vendor/store identification
- Tax and total calculation
- Date parsing
- Multi-format support (JPG, PNG, PDF, etc.)
- Real-time processing

---

## 📋 Setup Instructions

### Step 1: Get Veryfi API Credentials

1. Go to [Veryfi Hub](https://hub.veryfi.com/)
2. Create a free account
3. Navigate to **Settings** → **API Keys**
4. Copy your credentials:
   - Client ID
   - Client Secret
   - Username
   - API Key

### Step 2: Configure Environment Variables

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Veryfi credentials:
   ```bash
   VERYFI_CLIENT_ID=your_client_id_here
   VERYFI_CLIENT_SECRET=your_client_secret_here
   VERYFI_USERNAME=your_username_here
   VERYFI_API_KEY=your_api_key_here
   PORT=3001
   ```

### Step 3: Install Dependencies

```bash
npm install
```

This installs:
- `@veryfi/veryfi-sdk` - Official Veryfi SDK
- `express` - Backend server
- `cors` - Cross-origin requests
- `multer` - File upload handling
- `axios` - HTTP client
- `concurrently` - Run multiple scripts

### Step 4: Start Both Servers

**Option A: Run both servers together (recommended)**
```bash
npm run dev:all
```

This runs:
- Frontend (Vite): `http://localhost:5173`
- Backend (Veryfi): `http://localhost:3001`

**Option B: Run servers separately**

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend:
```bash
npm run server
```

---

## 🎯 How It Works

### Architecture

```
┌─────────────┐      ┌──────────────┐      ┌────────────────┐
│   React     │      │   Express    │      │    Veryfi      │
│  Frontend   │─────▶│   Backend    │─────▶│      API       │
│  (Port      │      │   Server     │      │  (Cloud)       │
│   5173)     │      │  (Port 3001) │      │                │
└─────────────┘      └──────────────┘      └────────────────┘
     Upload              Proxy                  Process
     Receipt            Request                 Receipt
                        Securely               & Extract
```

### Flow

1. **User uploads receipt** (JPG/PNG) in the React frontend
2. **Frontend sends** to Express backend at `localhost:3001`
3. **Backend receives** file and converts to base64
4. **Veryfi SDK** sends to Veryfi Cloud API
5. **Veryfi processes** receipt with AI (2-5 seconds)
6. **Backend receives** structured JSON data
7. **Backend parses** line items and filters food products
8. **Frontend displays** matched food items for review

---

## 📊 What Data Veryfi Extracts

```json
{
  "vendor": "Whole Foods Market",
  "date": "2026-01-31",
  "total": 47.23,
  "tax": 3.42,
  "subtotal": 43.81,
  "line_items": [
    {
      "description": "Organic Bananas",
      "quantity": 2.5,
      "price": 0.99,
      "total": 2.48
    },
    {
      "description": "Whole Milk Gallon",
      "quantity": 1,
      "price": 4.99,
      "total": 4.99
    }
  ]
}
```

---

## 🔧 API Endpoints

### Backend Server

**Health Check**
```
GET http://localhost:3001/api/health
```

**Scan Receipt**
```
POST http://localhost:3001/api/scan-receipt
Content-Type: multipart/form-data

Body: { receipt: <file> }
```

**Response:**
```json
{
  "success": true,
  "receipt": {
    "vendor": "Store Name",
    "date": "2026-01-31",
    "total": 47.23,
    "tax": 3.42,
    "subtotal": 43.81
  },
  "items": [
    {
      "name": "Bananas",
      "quantity": "2.5 units",
      "price": "$2.48",
      "category": "Fruits",
      "confidence": "high"
    }
  ]
}
```

---

## 🎨 Features

### Frontend (React)
- ✅ Drag & drop or click to upload
- ✅ Real-time progress tracking (0-100%)
- ✅ Stage-based status messages
- ✅ Food item matching with database
- ✅ Confidence scoring
- ✅ Price display
- ✅ Editable quantities and storage
- ✅ Raw data viewer for debugging

### Backend (Express)
- ✅ Secure API key handling
- ✅ File upload with Multer
- ✅ Base64 encoding for Veryfi
- ✅ Automatic cleanup of temp files
- ✅ Food category classification
- ✅ Error handling & logging
- ✅ CORS enabled for frontend

---

## 🐛 Troubleshooting

### "Cannot connect to Veryfi server"
**Solution:** Make sure the backend server is running on port 3001
```bash
npm run server
```

### "Veryfi authentication failed"
**Solution:** Check your API credentials in `.env` file

### "No food items detected"
**Possible causes:**
- Receipt doesn't contain grocery items
- Image quality is too low
- Receipt is upside down or sideways

**Tips:**
- Use clear, well-lit photos
- Make sure text is readable
- Receipt should be flat (not crumpled)
- Try rotating the image

### Port 3001 already in use
**Solution:** Change the port in `.env`:
```bash
PORT=3002
```
Then update the frontend URL in `src/App.jsx`:
```javascript
const response = await axios.post('http://localhost:3002/api/scan-receipt', ...
```

---

## 📈 Veryfi vs. Other OCR Solutions

| Feature | Veryfi | Tesseract | Google Vision |
|---------|--------|-----------|---------------|
| Accuracy | 99.8% | ~85% | ~95% |
| Line Items | ✅ Auto | ❌ Manual | ⚠️ Semi-auto |
| Prices | ✅ Structured | ❌ Text only | ⚠️ Text only |
| Vendor ID | ✅ | ❌ | ❌ |
| Tax/Total | ✅ Calculated | ❌ | ❌ |
| Speed | 2-5s | 5-10s | 1-3s |
| Setup | API Key | Library | API Key + Billing |

---

## 💰 Veryfi Pricing

- **Free Tier**: 100 documents/month
- **Perfect for**: Development, testing, personal use
- **Upgrade options**: Available for production use

Sign up at [veryfi.com](https://www.veryfi.com/)

---

## 🔐 Security Notes

- ✅ API keys stored server-side only (never exposed to client)
- ✅ Environment variables for sensitive data
- ✅ Temporary files deleted after processing
- ✅ CORS configured for localhost only
- ⚠️ For production: Add authentication, rate limiting, HTTPS

---

## 📝 Example Usage

1. **Start servers**: `npm run dev:all`
2. **Open app**: `http://localhost:5173`
3. **Go to**: Food Inventory → Add Food → Scan Receipt
4. **Upload**: grocery receipt photo
5. **Wait**: 2-5 seconds for Veryfi processing
6. **Review**: detected food items with prices
7. **Select**: which items to add
8. **Confirm**: items added to inventory!

---

## 🎓 Learn More

- [Veryfi Documentation](https://docs.veryfi.com/)
- [Veryfi API Reference](https://docs.veryfi.com/api/receipts-invoices/)
- [Node.js SDK Guide](https://github.com/veryfi/veryfi-nodejs)

---

## 🆘 Support

Having issues? Check:
1. Console logs in browser (F12)
2. Terminal output for backend errors
3. `.env` file has correct credentials
4. Both servers are running
5. Receipt image is clear and readable

---

**Happy scanning with Veryfi! 🎉**
