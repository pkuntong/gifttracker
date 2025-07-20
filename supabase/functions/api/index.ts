import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

// Initialize Supabase client
const supabaseUrl = 'https://jnhucgyztokoffzwiegj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaHVjZ3l6dG9rb2ZmendpZWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NzI0MTcsImV4cCI6MjA2ODU0ODQxN30.2M01OqtHmBv4CBqAw3pjTK7oysxnB_xJEXG3m2ENOn8'

const supabase = createClient(supabaseUrl, supabaseKey)

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

    // People endpoints
    if (path === '/api/people') {
      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('people')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          return new Response(
            JSON.stringify({
              error: 'Database error',
              message: error.message,
              timestamp: new Date().toISOString(),
              server: 'Supabase Edge Functions'
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

        return new Response(
          JSON.stringify({
            people: data || [],
            message: 'People retrieved successfully',
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
        const body = await req.json()
        const { data, error } = await supabase
          .from('people')
          .insert([body])
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({
              error: 'Database error',
              message: error.message,
              timestamp: new Date().toISOString(),
              server: 'Supabase Edge Functions'
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
        
        return new Response(
          JSON.stringify({
            person: data,
            message: 'Person created successfully',
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

    // Gift endpoints
    if (path === '/api/gifts') {
      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('gifts')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          return new Response(
            JSON.stringify({
              error: 'Database error',
              message: error.message,
              timestamp: new Date().toISOString(),
              server: 'Supabase Edge Functions'
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

        return new Response(
          JSON.stringify({
            gifts: data || [],
            message: 'Gifts retrieved successfully',
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
        const body = await req.json()
        const { data, error } = await supabase
          .from('gifts')
          .insert([body])
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({
              error: 'Database error',
              message: error.message,
              timestamp: new Date().toISOString(),
              server: 'Supabase Edge Functions'
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
        
        return new Response(
          JSON.stringify({
            gift: data,
            message: 'Gift created successfully',
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

    // Occasion endpoints
    if (path === '/api/occasions') {
      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('occasions')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          return new Response(
            JSON.stringify({
              error: 'Database error',
              message: error.message,
              timestamp: new Date().toISOString(),
              server: 'Supabase Edge Functions'
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

        return new Response(
          JSON.stringify({
            occasions: data || [],
            message: 'Occasions retrieved successfully',
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
        const body = await req.json()
        const { data, error } = await supabase
          .from('occasions')
          .insert([body])
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({
              error: 'Database error',
              message: error.message,
              timestamp: new Date().toISOString(),
              server: 'Supabase Edge Functions'
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
        
        return new Response(
          JSON.stringify({
            occasion: data,
            message: 'Occasion created successfully',
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

    // Budget endpoints
    if (path === '/api/budgets') {
      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          return new Response(
            JSON.stringify({
              error: 'Database error',
              message: error.message,
              timestamp: new Date().toISOString(),
              server: 'Supabase Edge Functions'
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

        return new Response(
          JSON.stringify({
            budgets: data || [],
            message: 'Budgets retrieved successfully',
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
        const body = await req.json()
        const { data, error } = await supabase
          .from('budgets')
          .insert([body])
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({
              error: 'Database error',
              message: error.message,
              timestamp: new Date().toISOString(),
              server: 'Supabase Edge Functions'
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
        
        return new Response(
          JSON.stringify({
            budget: data,
            message: 'Budget created successfully',
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

    // Family endpoints
    if (path === '/api/families') {
      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('families')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          return new Response(
            JSON.stringify({
              error: 'Database error',
              message: error.message,
              timestamp: new Date().toISOString(),
              server: 'Supabase Edge Functions'
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

        return new Response(
          JSON.stringify({
            families: data || [],
            message: 'Families retrieved successfully',
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
        const body = await req.json()
        const { data, error } = await supabase
          .from('families')
          .insert([body])
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({
              error: 'Database error',
              message: error.message,
              timestamp: new Date().toISOString(),
              server: 'Supabase Edge Functions'
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
        
        return new Response(
          JSON.stringify({
            family: data,
            message: 'Family created successfully',
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

    // Analytics endpoint
    if (path === '/api/analytics') {
      if (req.method === 'GET') {
        // Get detailed stats
        const { data: gifts } = await supabase.from('gifts').select('status')
        const { data: people } = await supabase.from('people').select('*')
        const { data: budgets } = await supabase.from('budgets').select('amount')
        const { data: occasions } = await supabase.from('occasions').select('date')

        return new Response(
          JSON.stringify({
            giftStats: {
              total: gifts?.length || 0,
              purchased: gifts?.filter(g => g.status === 'purchased').length || 0,
              pending: gifts?.filter(g => g.status === 'pending').length || 0
            },
            peopleStats: {
              total: people?.length || 0,
              active: people?.length || 0 // Assuming all people are active for now
            },
            budgetStats: {
              total: budgets?.length || 0,
              totalAmount: budgets?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0
            },
            occasionStats: {
              total: occasions?.length || 0,
              upcoming: occasions?.filter(o => new Date(o.date) > new Date()).length || 0
            },
            message: 'Analytics retrieved successfully',
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
        availableEndpoints: [
          '/api/health', 
          '/api/test', 
          '/api/people', 
          '/api/gifts', 
          '/api/occasions', 
          '/api/budgets', 
          '/api/families',
          '/api/analytics'
        ],
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