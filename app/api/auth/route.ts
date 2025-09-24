import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure the route is dynamic

const MASTER_KEY = 'Nitish';

export async function POST(request: NextRequest) {
  try {
    const { masterKey } = await request.json();

    if (!masterKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Master key is required',
        },
        { status: 400 }
      );
    }

    // Case-insensitive comparison
    if (masterKey.toLowerCase() === MASTER_KEY.toLowerCase()) {
      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid master key',
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Authentication failed due to server error',
      },
      { status: 500 }
    );
  }
}