import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'certs') {
      const res = await fetch('https://signtools.ipaomtk.com/server-certificates.php?t=' + Date.now(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        cache: 'no-store'
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch certificates from backend: Status ${res.status}`);
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === 'status') {
      const job = searchParams.get('job');
      if (!job) {
        return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
      }

      const res = await fetch(`https://signtools.ipaomtk.com/remote-sign-status.php?job=${job}&t=` + Date.now(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        cache: 'no-store'
      });
      if (!res.ok) {
        throw new Error(`Failed to check job status: Status ${res.status}`);
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ success: false, error: 'Invalid GET action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in sign-proxy GET:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An internal error occurred in GET proxy' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'start') {
      const incomingFormData = await request.formData();
      const body = new URLSearchParams();
      incomingFormData.forEach((value, key) => {
        body.append(key, value.toString());
      });

      const res = await fetch('https://signtools.ipaomtk.com/remote-sign-start.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: body.toString(),
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error(`Failed to start remote signing: Status ${res.status}`);
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === 'merge') {
      const incomingFormData = await request.formData();
      const body = new FormData();
      incomingFormData.forEach((value, key) => {
        body.append(key, value);
      });

      const res = await fetch('https://signtools.ipaomtk.com/sign-merge.php', {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: body,
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error(`Failed to upload and sign: Status ${res.status}`);
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ success: false, error: 'Invalid POST action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in sign-proxy POST:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An internal error occurred in POST proxy' },
      { status: 500 }
    );
  }
}
