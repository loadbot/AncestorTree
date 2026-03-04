import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * This route is triggered by Vercel Cron.
 * It bypasses the UI login by using the Supabase Service Role Key.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Unauthorized cron attempt blocked');
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('clan_settings')
      .select('clan_name')
      .limit(1);

    if (error) {
      throw error;
    }

    console.log('Keep-alive success: Database pinged successfully.');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Activity recorded, project will not pause.",
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (err: any) {
    console.error('Cron Ping Failed:', err.message);
    return new Response(
      JSON.stringify({ error: err.message }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
