import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Cette route est obsolète. Veuillez utiliser NextAuth.' },
    { status: 410 }
  );
}
