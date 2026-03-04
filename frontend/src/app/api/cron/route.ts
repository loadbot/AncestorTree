import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  
  // 1. Check if the environment variable even exists in the Vercel container
  if (!secret) {
    console.error('CRON_SECRET environment variable is not defined in Vercel.');
    return new Response('Server Configuration Error', { status: 500 });
  }

  // 2. Security check
  if (authHeader !== `Bearer ${secret}`) {
    console.warn('Unauthorized attempt with header:', authHeader);
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Activity ping
    const { error } = await supabase
      .from('clan_settings')
      .select('clan_name')
      .limit(1);

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Database kept alive." 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Database Ping Failed:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
