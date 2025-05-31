import Cors from 'cors';
import { NextResponse } from 'next/server';

// Konfiguracija CORS
const cors = Cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

export function middleware(req) {
  const token = req.cookies.get('token');
  const url = req.nextUrl.clone();

  // CORS middleware
  if (req.method === 'OPTIONS') {
    return NextResponse.json({ message: 'CORS preflight passed.' });
  }

  // Proveri za admin rutu
  if (!token && url.pathname.startsWith('/admin')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
