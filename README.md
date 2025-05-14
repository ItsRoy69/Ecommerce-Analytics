# E-commerce Analytics Dashboard

A comprehensive analytics dashboard for e-commerce stores, built with Next.js and Redux.

[Ecommerce-Analytics.webm](https://github.com/user-attachments/assets/3595fc2f-7da0-4cdd-8f44-46e02585e79b)

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

## Assumptions Made

- **Data Structure**: The dashboard assumes a standard e-commerce data model with products, variants, and orders
- **User Roles**: All users have the same level of access to analytics data
- **Data Volume**: The application is optimized for small to medium-sized e-commerce stores
- **Browser Support**: Modern browsers with JavaScript enabled are required

## Design Decisions and Trade-offs

- **Shop-based Authentication**: Simple authentication system using shop names was chosen for ease of implementation and demo purposes, trading off security for simplicity
- **Client-side Filtering**: Data filtering is performed client-side to reduce server load and provide immediate feedback, with the trade-off of requiring more client resources
- **SQLite Database**: Chosen for simplicity and ease of setup, though may not scale well for very large datasets
- **Static Generation**: Pages are statically generated where possible to improve loading performance
- **Responsive UI**: Mobile-first design approach, ensuring usability across devices at the cost of some desktop-specific optimizations

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
