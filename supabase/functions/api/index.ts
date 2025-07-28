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
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      }
    })
  }

  // Get the authorization header
  const authHeader = req.headers.get('authorization')
  
  // DEVELOPMENT MODE: Allow requests with our dummy token or no token
  if (!authHeader || authHeader === 'Bearer development-token-bypass') {
    console.log('Development mode: Allowing request with dummy token or no token')
  } else {
    // In production, you would verify the JWT token here
    console.log('Production mode: Would verify JWT token here')
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
          version: '2.0.0',
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
          version: '2.0.0',
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



    // User validation endpoint - PUBLIC (no auth required, validates token)
    if (path === '/api/user/validate') {
      if (req.method === 'GET') {
        try {
          // Get the user from Supabase auth
          const { data: { user }, error } = await supabase.auth.getUser()
          
          if (error || !user) {
            return new Response(
              JSON.stringify({
                error: 'Authentication failed',
                message: 'Invalid or missing authentication token',
                timestamp: new Date().toISOString(),
                server: 'Supabase Edge Functions'
              }),
              {
                status: 401,
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json',
                },
              }
            )
          }

          return new Response(
            JSON.stringify({
              user: {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || user.email,
                created_at: user.created_at,
                updated_at: user.updated_at
              },
              message: 'User validated successfully',
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
        } catch (err) {
          return new Response(
            JSON.stringify({
              error: 'Validation failed',
              message: err instanceof Error ? err.message : 'Unknown error occurred',
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
      }
    }

    // Contact form endpoint - PUBLIC (no auth required)
    if (path === '/api/contact') {
      if (req.method === 'POST') {
        const body = await req.json()
        const { name, email, subject, message } = body

        // Validate required fields
        if (!name || !email || !subject || !message) {
          return new Response(
            JSON.stringify({
              error: 'Missing required fields',
              message: 'Please fill in all required fields',
              timestamp: new Date().toISOString(),
              server: 'Supabase Edge Functions'
            }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          )
        }

        // Here you would typically send the email to paudcin@gmail.com
        // For now, we'll log the contact form submission
        console.log('Contact form submission:', {
          name,
          email,
          subject,
          message,
          timestamp: new Date().toISOString()
        })

        return new Response(
          JSON.stringify({
            message: 'Contact form submitted successfully',
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

    // Registration endpoint - PUBLIC (no auth required)
    if (path === '/api/auth/register') {
      if (req.method === 'POST') {
        try {
          const body = await req.json()
          const { email, password, name } = body

          // Log the registration attempt
          console.log('Registration attempt:', {
            email: email,
            emailType: typeof email,
            emailLength: email?.length,
            name: name,
            hasPassword: !!password,
            passwordLength: password?.length,
            timestamp: new Date().toISOString()
          })

          // Basic validation
          if (!email || !password || !name) {
            return new Response(
              JSON.stringify({
                error: 'Missing required fields',
                message: 'Email, password, and name are required',
                timestamp: new Date().toISOString(),
                server: 'Supabase Edge Functions'
              }),
              {
                status: 400,
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json',
                },
              }
            )
          }

          // Basic email format check (very basic)
          if (!email || !email.includes('@') || !email.includes('.')) {
            return new Response(
              JSON.stringify({
                error: 'Invalid email format',
                message: 'Please enter a valid email address',
                timestamp: new Date().toISOString(),
                server: 'Supabase Edge Functions'
              }),
              {
                status: 400,
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json',
                },
              }
            )
          }

          console.log('About to call Supabase auth.signUp with:', {
            email: email,
            passwordLength: password?.length,
            name: name
          })

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name
              }
            }
          })

          if (error) {
            console.log('Supabase registration error:', error)
            console.log('Error details:', {
              code: error.status,
              message: error.message,
              name: error.name
            })
            
            // Provide more specific error messages
            let errorMessage = error.message
            if (error.message.includes('email')) {
              errorMessage = 'Please enter a valid email address'
            } else if (error.message.includes('password')) {
              errorMessage = 'Password must be at least 6 characters long'
            } else if (error.message.includes('already')) {
              errorMessage = 'An account with this email already exists'
            }
            
            return new Response(
              JSON.stringify({
                error: 'Registration failed',
                message: errorMessage,
                timestamp: new Date().toISOString(),
                server: 'Supabase Edge Functions'
              }),
              {
                status: 400,
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json',
                },
              }
            )
          }

          console.log('Registration successful:', {
            userId: data.user?.id,
            email: data.user?.email,
            timestamp: new Date().toISOString()
          })

          return new Response(
            JSON.stringify({
              user: data.user,
              session: data.session,
              message: 'Registration successful',
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
        } catch (err) {
          console.log('Registration endpoint error:', err)
          return new Response(
            JSON.stringify({
              error: 'Registration failed',
              message: err instanceof Error ? err.message : 'Unknown error occurred',
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
      }
    }

    // Authentication endpoints
    if (path === '/api/auth/login') {
      if (req.method === 'POST') {
        const body = await req.json()
        const { email, password } = body

        // Real Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          return new Response(
            JSON.stringify({
              error: 'Authentication failed',
              message: error.message,
              timestamp: new Date().toISOString(),
              server: 'Supabase Edge Functions'
            }),
            {
              status: 401,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          )
        }

        return new Response(
          JSON.stringify({
            user: data.user,
            session: data.session,
            message: 'Login successful',
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

    if (path === '/api/auth/logout') {
      if (req.method === 'POST') {
        const { error } = await supabase.auth.signOut()

        if (error) {
          return new Response(
            JSON.stringify({
              error: 'Logout failed',
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
            message: 'Logout successful',
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

    // Individual People endpoints (must come before the main people endpoint)
    if (path.match(/^\/api\/people\/[^\/]+$/)) {
      const urlParts = path.split('/')
      const personId = urlParts[urlParts.length - 1]
      
      if (req.method === 'PUT') {
        const body = await req.json()
        
        const { data, error } = await supabase
          .from('people')
          .update(body)
          .eq('id', personId)
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
            message: 'Person updated successfully',
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
      
      if (req.method === 'DELETE') {
        const { error } = await supabase
          .from('people')
          .delete()
          .eq('id', personId)

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
            message: 'Person deleted successfully',
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

        // Transform field names from snake_case to camelCase for frontend
        const transformedData = (data || []).map((gift: any) => ({
          ...gift,
          recipientId: gift.recipient_id,
          occasionId: gift.occasion_id
        }))
        
        return new Response(
          JSON.stringify({
            gifts: transformedData,
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
        
        // Transform field names from camelCase to snake_case
        const transformedBody = {
          ...body,
          recipient_id: body.recipientId || null,
          occasion_id: body.occasionId || null,
          price: body.price || null
        }
        
        // Remove the camelCase fields to avoid conflicts
        delete transformedBody.recipientId
        delete transformedBody.occasionId
        
        console.log('Inserting gift with data:', transformedBody)
        
        const { data, error } = await supabase
          .from('gifts')
          .insert([transformedBody])
          .select()
          .single()

        if (error) {
          console.error('Database error:', error)
          return new Response(
            JSON.stringify({
              error: 'Database error',
              message: error.message,
              details: error.details,
              hint: error.hint,
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

    // Individual gift endpoints (PUT, DELETE)
    if (path.startsWith('/api/gifts/') && path.split('/').length === 4) {
      const giftId = path.split('/')[3]
      
      if (req.method === 'PUT') {
        const body = await req.json()
        
        // Transform field names from camelCase to snake_case
        const transformedBody = {
          ...body,
          recipient_id: body.recipientId || null,
          occasion_id: body.occasionId || null,
          price: body.price || null
        }
        
        // Remove the camelCase fields to avoid conflicts
        delete transformedBody.recipientId
        delete transformedBody.occasionId
        
        const { data, error } = await supabase
          .from('gifts')
          .update(transformedBody)
          .eq('id', giftId)
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
            message: 'Gift updated successfully',
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
      
      if (req.method === 'DELETE') {
        const { error } = await supabase
          .from('gifts')
          .delete()
          .eq('id', giftId)

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
            message: 'Gift deleted successfully',
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

        // Transform snake_case to camelCase for frontend
        const transformedData = (data || []).map((occasion: any) => ({
          ...occasion,
          personId: occasion.person_id
        }))

        return new Response(
          JSON.stringify({
            occasions: transformedData,
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
        
        // Transform camelCase to snake_case for database
        const transformedBody = {
          ...body,
          person_id: body.personId || null,
          budget: body.budget || null
        }
        delete transformedBody.personId
        
        const { data, error } = await supabase
          .from('occasions')
          .insert([transformedBody])
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

    // Individual Occasions endpoints (must come before the main occasions endpoint)
    if (path.match(/^\/api\/occasions\/[^\/]+$/)) {
      const urlParts = path.split('/')
      const occasionId = urlParts[urlParts.length - 1]
      
      if (req.method === 'PUT') {
        const body = await req.json()
        
        // Transform camelCase to snake_case for database
        const transformedBody = {
          ...body,
          person_id: body.personId || null,
          budget: body.budget || null
        }
        delete transformedBody.personId
        
        const { data, error } = await supabase
          .from('occasions')
          .update(transformedBody)
          .eq('id', occasionId)
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
            message: 'Occasion updated successfully',
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
      
      if (req.method === 'DELETE') {
        const { error } = await supabase
          .from('occasions')
          .delete()
          .eq('id', occasionId)

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
            message: 'Occasion deleted successfully',
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

    // Search endpoint
    if (path === '/api/search') {
      if (req.method === 'POST') {
        const body = await req.json()
        const { query, type } = body

        let results: any[] = []

        if (type === 'people' || !type) {
          const { data: people } = await supabase
            .from('people')
            .select('*')
            .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
          
          if (people) results.push(...people)
        }

        if (type === 'gifts' || !type) {
          const { data: gifts } = await supabase
            .from('gifts')
            .select('*')
            .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          
          if (gifts) results.push(...gifts)
        }

        return new Response(
          JSON.stringify({
            results,
            query,
            type,
            message: 'Search completed successfully',
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

    // Gift Recommendations endpoint
    if (path === '/api/recommendations') {
      if (req.method === 'POST') {
        const body = await req.json()
        const { personId, occasion, budget, interests } = body

        // Mock recommendation logic - in a real app, this would use AI or ML
        const recommendations = [
          {
            id: 'rec1',
            name: 'Personalized Photo Book',
            description: 'A beautiful photo book with memories',
            price: 50,
            category: 'Personal',
            reason: 'Great for preserving memories',
            rating: 4.5
          },
          {
            id: 'rec2',
            name: 'Wireless Headphones',
            description: 'High-quality wireless headphones',
            price: 150,
            category: 'Technology',
            reason: 'Popular tech gift',
            rating: 4.3
          },
          {
            id: 'rec3',
            name: 'Gourmet Food Basket',
            description: 'Premium selection of gourmet foods',
            price: 75,
            category: 'Food & Drink',
            reason: 'Delicious and thoughtful',
            rating: 4.2
          },
          {
            id: 'rec4',
            name: 'Spa Gift Certificate',
            description: 'Relaxing spa experience',
            price: 100,
            category: 'Wellness',
            reason: 'Perfect for relaxation',
            rating: 4.4
          },
          {
            id: 'rec5',
            name: 'Custom Jewelry',
            description: 'Personalized jewelry piece',
            price: 200,
            category: 'Fashion',
            reason: 'Unique and meaningful',
            rating: 4.6
          }
        ]

        // Filter by budget if provided
        let filteredRecommendations = recommendations
        if (budget) {
          filteredRecommendations = recommendations.filter(rec => rec.price <= budget)
        }

        // Sort by rating
        filteredRecommendations.sort((a, b) => b.rating - a.rating)

        return new Response(
          JSON.stringify({
            recommendations: filteredRecommendations,
            personId,
            occasion,
            budget,
            interests,
            message: 'Gift recommendations generated successfully',
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

    // Reminders endpoint
    if (path === '/api/reminders') {
      if (req.method === 'GET') {
        // Get upcoming occasions and gifts
        const { data: occasions } = await supabase
          .from('occasions')
          .select('*')
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true })
          .limit(10)

        const { data: gifts } = await supabase
          .from('gifts')
          .select('*')
          .eq('status', 'planned')
          .order('created_at', { ascending: false })
          .limit(10)

        const reminders = [
          ...(occasions || []).map(occasion => ({
            type: 'occasion',
            title: `Upcoming: ${occasion.name}`,
            date: occasion.date,
            description: occasion.description,
            id: occasion.id
          })),
          ...(gifts || []).map(gift => ({
            type: 'gift',
            title: `Gift needed: ${gift.name}`,
            date: null,
            description: gift.description,
            id: gift.id
          }))
        ]

        return new Response(
          JSON.stringify({
            reminders,
            message: 'Reminders retrieved successfully',
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

    // Data Export endpoint
    if (path === '/api/export') {
      if (req.method === 'GET') {
        const params = new URLSearchParams(url.search)
        const format = params.get('format') || 'json'

        // Get all data
        const [peopleResult, giftsResult, occasionsResult, budgetsResult] = await Promise.all([
          supabase.from('people').select('*'),
          supabase.from('gifts').select('*'),
          supabase.from('occasions').select('*'),
          supabase.from('budgets').select('*')
        ])

        const exportData = {
          people: peopleResult.data || [],
          gifts: giftsResult.data || [],
          occasions: occasionsResult.data || [],
          budgets: budgetsResult.data || [],
          exportDate: new Date().toISOString(),
          version: '2.0.0'
        }

        if (format === 'csv') {
          // Convert to CSV format
          const csvData = convertToCSV(exportData)
          return new Response(
            csvData,
            {
              headers: {
                ...corsHeaders,
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="gift-tracker-export.csv"'
              },
            }
          )
        }

        return new Response(
          JSON.stringify(exportData),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        )
      }
    }

    // Data Import endpoint
    if (path === '/api/import') {
      if (req.method === 'POST') {
        const body = await req.json()
        const { data, overwrite = false } = body

        const results = {
          imported: { people: 0, gifts: 0, occasions: 0, budgets: 0 },
          errors: [],
          message: 'Import completed'
        }

        try {
          // Import people
          if (data.people && data.people.length > 0) {
            const { error } = await supabase
              .from('people')
              .upsert(data.people, { onConflict: 'id' })
            
            if (error) {
              results.errors.push(`People import error: ${error.message}`)
            } else {
              results.imported.people = data.people.length
            }
          }

          // Import gifts
          if (data.gifts && data.gifts.length > 0) {
            const { error } = await supabase
              .from('gifts')
              .upsert(data.gifts, { onConflict: 'id' })
            
            if (error) {
              results.errors.push(`Gifts import error: ${error.message}`)
            } else {
              results.imported.gifts = data.gifts.length
            }
          }

          // Import occasions
          if (data.occasions && data.occasions.length > 0) {
            const { error } = await supabase
              .from('occasions')
              .upsert(data.occasions, { onConflict: 'id' })
            
            if (error) {
              results.errors.push(`Occasions import error: ${error.message}`)
            } else {
              results.imported.occasions = data.occasions.length
            }
          }

          // Import budgets
          if (data.budgets && data.budgets.length > 0) {
            const { error } = await supabase
              .from('budgets')
              .upsert(data.budgets, { onConflict: 'id' })
            
            if (error) {
              results.errors.push(`Budgets import error: ${error.message}`)
            } else {
              results.imported.budgets = data.budgets.length
            }
          }

        } catch (error) {
          results.errors.push(`General import error: ${error.message}`)
        }

        return new Response(
          JSON.stringify({
            ...results,
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

    // Helper function to convert data to CSV
    function convertToCSV(data: any) {
      const csvRows = []
      
      // Add headers
      csvRows.push('Type,ID,Name,Description,Price,Date,Status')
      
      // Add people
      data.people.forEach((person: any) => {
        csvRows.push(`Person,${person.id},"${person.name}","${person.relationship || ''}","","${person.birthday || ''}","active"`)
      })
      
      // Add gifts
      data.gifts.forEach((gift: any) => {
        csvRows.push(`Gift,${gift.id},"${gift.name}","${gift.description || ''}","${gift.price || ''}","","${gift.status || 'planned'}"`)
      })
      
      // Add occasions
      data.occasions.forEach((occasion: any) => {
        csvRows.push(`Occasion,${occasion.id},"${occasion.name}","${occasion.description || ''}","","${occasion.date}","upcoming"`)
      })
      
      return csvRows.join('\n')
    }

    // Reports endpoints
    if (path === '/api/reports') {
      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('reports')
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
            reports: data || [],
            message: 'Reports retrieved successfully',
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
        
        // Transform camelCase to snake_case for database
        const transformedBody = {
          title: body.title,
          description: body.description,
          type: body.type,
          filters: body.filters || {},
          data: body.data || {},
          is_scheduled: body.isScheduled || false,
          schedule_frequency: body.scheduleFrequency || 'monthly'
        }
        
        const { data, error } = await supabase
          .from('reports')
          .insert([transformedBody])
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
            report: data,
            message: 'Report created successfully',
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

    // Individual Reports endpoints
    if (path.match(/^\/api\/reports\/[^\/]+$/)) {
      const urlParts = path.split('/')
      const reportId = urlParts[urlParts.length - 1]
      
      if (req.method === 'DELETE') {
        const { error } = await supabase
          .from('reports')
          .delete()
          .eq('id', reportId)

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
            message: 'Report deleted successfully',
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

    // Report Export endpoint
    if (path.match(/^\/api\/reports\/[^\/]+\/export$/)) {
      const urlParts = path.split('/')
      const reportId = urlParts[urlParts.length - 2]
      const format = new URL(req.url).searchParams.get('format') || 'json'
      
      // Get the report data from database
      const { data: reportData, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
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
      
      let content: string
      let contentType: string
      
      if (format === 'csv') {
        // Generate CSV content
        content = `Report ID,Title,Description,Type,Created At\n${reportData.id},"${reportData.title}","${reportData.description || ''}","${reportData.type}","${reportData.created_at}"`
        contentType = 'text/csv'
      } else if (format === 'pdf') {
        // For now, return a simple text report that can be opened
        // In a production environment, you would use a proper PDF generation library
        content = `
REPORT: ${reportData.title}
=====================================

Report ID: ${reportData.id}
Type: ${reportData.type}
Description: ${reportData.description || 'No description'}
Created: ${new Date(reportData.created_at).toLocaleDateString()}

REPORT CONTENT
==============
This is a sample report content. In a real implementation, 
this would contain the actual report data and analytics.

Generated by GiftTracker
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
        `
        contentType = 'text/plain'
      } else {
        // JSON format
        content = JSON.stringify({
          reportId: reportData.id,
          title: reportData.title,
          description: reportData.description,
          type: reportData.type,
          filters: reportData.filters,
          data: reportData.data,
          created_at: reportData.created_at,
          format: 'json',
          timestamp: new Date().toISOString(),
          server: 'Supabase Edge Functions',
          deployed: true
        })
        contentType = 'application/json'
      }
      
      return new Response(
        content,
        {
          headers: {
            ...corsHeaders,
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="report-${reportId}.${format === 'pdf' ? 'txt' : format}"`,
          },
        }
      )
    }

    // Invoices endpoint
    if (path === '/api/invoices') {
      if (req.method === 'GET') {
        // Return mock invoices data
        const mockInvoices = [
          {
            id: 'inv_001',
            amount: 999,
            currency: 'usd',
            status: 'paid',
            date: new Date('2025-07-22').toISOString(),
            description: 'Premium Plan - July 2025'
          },
          {
            id: 'inv_002',
            amount: 1999,
            currency: 'usd',
            status: 'paid',
            date: new Date('2025-06-22').toISOString(),
            description: 'Family Plan - June 2025'
          }
        ]
        
        return new Response(
          JSON.stringify({
            invoices: mockInvoices,
            message: 'Invoices retrieved successfully',
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

    // Usage endpoint
    if (path === '/api/usage') {
      if (req.method === 'GET') {
        // Return mock usage data
        const mockUsage = {
          gifts: 45,
          recipients: 12,
          recommendations: 8,
          storage: 0.5,
          limits: {
            gifts: -1,
            people: -1,
            occasions: -1,
            recipients: -1,
            recommendations: -1
          }
        }
        
        return new Response(
          JSON.stringify({
            usage: mockUsage,
            message: 'Usage data retrieved successfully',
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

    // Profile management endpoint
    if (path === '/api/profile') {
      if (req.method === 'PUT') {
        const body = await req.json()
        const { name, email, password } = body

        // Mock profile update response
        const updatedUser = {
          id: 'mock-user-id',
          name: name || 'Demo User',
          email: email || 'demo@example.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // If password was provided, simulate password change
        if (password) {
          console.log('Password change requested (mock)')
          // In a real app, you would hash and update the password in the database
        }

        return new Response(
          JSON.stringify({
            message: 'Profile updated successfully',
            user: updatedUser,
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

    // Preferences management endpoint
    if (path === '/api/preferences') {
      if (req.method === 'PUT') {
        const body = await req.json()
        const { currency, timezone, theme, notifications, language } = body

        // Mock preferences update response
        return new Response(
          JSON.stringify({
            message: 'Preferences updated successfully',
            preferences: {
              currency: currency || 'USD',
              timezone: timezone || 'UTC',
              theme: theme || 'system',
              notifications: notifications !== false,
              language: language || 'en'
            },
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

    // Subscription cancellation endpoint
    if (path.match(/^\/api\/subscriptions\/[^\/]+\/cancel$/)) {
      if (req.method === 'POST') {
        return new Response(
          JSON.stringify({
            message: 'Subscription cancelled successfully',
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
          '/api/contact',
          '/api/auth/login',
          '/api/auth/register',
          '/api/auth/logout',
          '/api/people', 
          '/api/gifts', 
          '/api/occasions', 
          '/api/budgets', 
          '/api/families',
          '/api/analytics',
          '/api/search',
          '/api/recommendations',
          '/api/reminders',
          '/api/export',
          '/api/import',
          '/api/profile',
          '/api/preferences'
        ],
        version: '2.0.0',
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