import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // 優先讀取私有環境變數，若無則讀取公開環境變數，最後 fallback（請在 Vercel 中設定）
    const targetUrl = process.env.SHEETS_API_URL 
      || process.env.NEXT_PUBLIC_SHEETS_API_URL
      || 'https://script.google.com/macros/s/AKfycbyWHtEu9A4hFKHVhfxrmifkNdRdG6NzHOkRhKqSG2QfMxpNVCCzqrlFownXotIfNgpZlg/exec';

    if (!targetUrl) {
      return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
    }

    // 伺服器端發送請求，無 CORS 限制
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      redirect: 'follow',
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      const errorText = await response.text();
      console.error('GAS Error:', errorText);
      return NextResponse.json({ error: 'Failed to write to Google Sheets', details: errorText }, { status: response.status });
    }
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
