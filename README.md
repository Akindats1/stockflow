# 🏪 StockFlow - Modern Inventory Management & POS System

A professional, full-featured inventory management and point-of-sale system built for small retail stores. Manage products, track sales, generate QR codes, and streamline your business operations with this beautiful, modern web application.

![StockFlow Banner](./public/images/banner.png)

## ✨ Features

### 📦 Inventory Management
- **Product Management**: Add, edit, and delete products with detailed information
- **Category Organization**: Organize products into customizable categories
- **Stock Tracking**: Real-time stock level monitoring with low-stock alerts
- **QR Code Generation**: Generate unique QR codes for each product
- **Product Images**: Visual product representation for easy identification

### 🛒 Point of Sale (POS)
- **Quick Product Search**: Fast product lookup by name or SKU
- **QR Code Scanning**: Scan product QR codes for instant cart addition
- **Category Filtering**: Filter products by category for faster checkout
- **Real-time Cart**: Dynamic cart with quantity adjustment
- **Multiple Payment Methods**: Support for cash and card payments

### 📊 Sales Analytics
- **Dashboard Overview**: Key metrics at a glance
- **Sales History**: Complete transaction history with detailed information
- **Revenue Tracking**: Monitor total revenue and daily sales
- **Top Products**: Identify best-selling items
- **Low Stock Alerts**: Proactive inventory management

### 🎨 Modern Design
- **Glassmorphism UI**: Beautiful, modern interface with glass-effect cards
- **Dark Theme**: Eye-friendly dark mode design
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Polished micro-interactions and transitions
- **Professional Typography**: Clean, readable fonts

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: CSS with custom properties and modern layouts
- **QR Codes**: 
  - Generation: [qrcode](https://www.npmjs.com/package/qrcode)
  - Scanning: [html5-qrcode](https://www.npmjs.com/package/html5-qrcode)
- **Deployment**: [Vercel](https://vercel.com/)

## 📋 Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stockflow.git
   cd stockflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp env.example.txt .env.local
   ```
   Update the values in `.env.local` as needed.

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
npm run build
npm run start
```

## 🌐 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/stockflow)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables** (in Vercel Dashboard)
   - Go to your project settings
   - Add the environment variables from `env.example.txt`
   - Redeploy the project

### Deploy via GitHub

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables
6. Deploy!

## 📱 Progressive Web App (PWA)

StockFlow can be installed as a PWA on supported devices:
- Desktop: Click the install icon in your browser's address bar
- Mobile: Add to Home Screen from your browser menu

## 🎯 Usage Guide

### Adding Products
1. Navigate to the "Products" page
2. Click "Add Product"
3. Fill in product details (name, SKU, category, price, stock)
4. Save the product

### Generating QR Codes
1. Go to the "Products" page
2. Click the QR code icon on any product card
3. View the generated QR code
4. Download the QR code as an image

### Making a Sale
1. Navigate to "Point of Sale"
2. Search or browse products
3. Click products to add them to cart
4. Adjust quantities as needed
5. Choose payment method (Cash or Card)
6. Complete the sale

### Scanning QR Codes
1. In the POS view, click "Scan QR"
2. Allow camera access
3. Point camera at product QR code
4. Product is automatically added to cart

## 🔒 Security Features

- Content Security Policy headers
- XSS protection
- Clickjacking prevention (X-Frame-Options)
- MIME-type sniffing protection
- Secure referrer policy

## ⚡ Performance Optimizations

- Next.js App Router for optimal performance
- Image optimization with Next/Image
- Automatic code splitting
- Production build minification
- Console removal in production
- Compression enabled
- Optimized fonts and assets

## 🗺️ Roadmap

- [ ] Backend integration with database (PostgreSQL/SQLite)
- [ ] Multi-user support with authentication
- [ ] Advanced analytics and reporting
- [ ] Export data to CSV/PDF
- [ ] Barcode scanner support
- [ ] Receipt printing
- [ ] Inventory alerts via email/SMS
- [ ] Multi-store management
- [ ] API for third-party integrations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Next.js team for an amazing framework
- Vercel for seamless deployment
- The open-source community

## 📞 Support

For support, email support@stockflow.com or create an issue in this repository.

---

**Made with ❤️ for small business owners**
