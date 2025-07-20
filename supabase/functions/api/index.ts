import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse the URL to get the path
    const url = new URL(req.url)
    const path = url.pathname

    // Health check endpoint - no auth required
    if (path === '/api/health') {
      return new Response(
        JSON.stringify({
          status: 'OK',
          message: 'Gift Tracker API is running on Supabase Edge Functions',
          timestamp: new Date().toISOString(),
          environment: 'production',
          version: '1.0.0',
          server: 'Supabase Edge Functions',
          path: path,
          deployed: true
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Test endpoint - no auth required
    if (path === '/api/test') {
      return new Response(
        JSON.stringify({
          message: 'Server is working! - Supabase Edge Functions',
          method: req.method,
          url: req.url,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          server: 'Supabase Edge Functions',
          path: path,
          deployed: true
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Gift endpoints - no auth required for testing
    if (path === '/api/gifts') {
      if (req.method === 'GET') {
        // Get all gifts
        return new Response(
          JSON.stringify({
            gifts: [],
            message: 'Gifts endpoint - GET',
            timestamp: new Date().toISOString(),
            server: 'Supabase Edge Functions',
            deployed: true
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        )
      }
      
      if (req.method === 'POST') {
        // Create new gift
        const body = await req.json()
        return new Response(
          JSON.stringify({
            message: 'Gift created successfully',
            gift: body,
            timestamp: new Date().toISOString(),
            server: 'Supabase Edge Functions',
            deployed: true
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        )
      }
    }

    // Default response for unknown endpoints
    return new Response(
      JSON.stringify({
        error: 'Not Found',
        message: 'Endpoint not found',
        availableEndpoints: ['/api/health', '/api/test', '/api/gifts'],
        version: '1.0.0',
        server: 'Supabase Edge Functions',
        path: path,
        deployed: true
      }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString(),
        server: 'Supabase Edge Functions',
        deployed: true
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
}) 