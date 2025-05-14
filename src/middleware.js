import { NextResponse } from 'next/server';
import { AUTH_STORAGE_KEY } from './constants';

export function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/api/shop')) {
    const authCookie = request.cookies.get(AUTH_STORAGE_KEY);
    if (!authCookie || !authCookie.value) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    try {
      const shopData = JSON.parse(authCookie.value);
      const shopIdMatch = request.nextUrl.pathname.match(/\/api\/shop\/(\d+)/);
      
      if (shopIdMatch && shopIdMatch[1] && shopIdMatch[1] !== shopData.id.toString()) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized access to shop data' }),
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid authentication data' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/shop/:path*']
}; 