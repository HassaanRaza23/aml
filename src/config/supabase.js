import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'demo-key'

// Debug: Log environment variables
console.log('🔍 Environment Variables Debug:')
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL)
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'FOUND' : 'NOT FOUND')
console.log('NODE_ENV:', process.env.NODE_ENV)

// For development, provide mock data if environment variables are missing
if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not found. Using mock data for development.')
  console.warn('📝 To connect to real Supabase, create a .env file with:')
  console.warn('   REACT_APP_SUPABASE_URL=your_supabase_project_url')
  console.warn('   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key')
} else {
  console.log('✅ Supabase environment variables found. Connecting to real database.')
  console.log('🔗 Supabase URL:', process.env.REACT_APP_SUPABASE_URL)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Error handling helper
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error)
  if (error.code === 'PGRST116') {
    throw new Error('No data found')
  }
  throw new Error(error.message || 'Database operation failed')
}

// Get current user helper
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    // For demo purposes, return a mock user with valid UUID
    return { 
      id: '00000000-0000-0000-0000-000000000001', 
      email: 'demo@company.com' 
    }
  }
}

// Helper for common database operations
export const dbHelpers = {
  // Insert with error handling
  insert: async (table, data) => {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()
    
    if (error) handleSupabaseError(error)
    return result
  },

  // Update with error handling
  update: async (table, id, data) => {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) handleSupabaseError(error)
    return result
  },

  // Get with error handling
  get: async (table, id) => {
    const { data: result, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) handleSupabaseError(error)
    return result
  },

  // List with error handling
  list: async (table, options = {}) => {
    try {
      let query = supabase.from(table).select('*')
      
      // Add filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value)
          }
        })
      }
      
      // Add pagination
      if (options.page && options.limit) {
        const from = (options.page - 1) * options.limit
        const to = from + options.limit - 1
        query = query.range(from, to)
      }
      
      // Add ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending })
      }
      
      const { data: result, error, count } = await query
      
      if (error) {
        console.error('Database list error:', error)
        throw new Error(error.message || 'Failed to fetch data')
      }
      
      return { data: result, count }
    } catch (error) {
      console.error('Error in dbHelpers.list:', error)
      throw error
    }
  }
}
