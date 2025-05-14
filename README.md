# E-commerce Analytics Dashboard

A comprehensive analytics dashboard for e-commerce stores, built with Next.js and Redux.

## Features

- **Authentication**: Simple shop name-based authentication
- **Sales Analytics**: Track sales trends, revenue, and growth over time
- **Price Analytics**: Analyze price points and their impact on sales
- **Data Filtering**: Filter analytics by product and variant
- **Responsive Design**: Fully responsive UI that works on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: Next.js, React 19
- **State Management**: Redux Toolkit
- **Data Visualization**: Recharts
- **Styling**: Tailwind CSS
- **Database**: SQLite

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/ItsRoy69/Ecommerce-Analytics
cd ecommerce-analytics
```

2. Install dependencies
```
npm install
```

3. Run the development server
```
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### Authentication

```
POST /api/auth
```
- Request Body: `{ shopName: string }`
- Response: `{ success: boolean, shop: { id: number, name: string } }`

### Shop Data

```
GET /api/shop/[shopId]/data
```
- Response: `{ shop: object, products: array, variants: array, orders: array }`
