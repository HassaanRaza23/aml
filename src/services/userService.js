import { supabase, handleSupabaseError, getCurrentUser, dbHelpers } from '../config/supabase'

export const userService = {
  // User authentication
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // User sign up
  signUp: async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get users list (for admin)
  getUsers: async (page = 1, limit = 50, filters = {}) => {
    try {
      const options = {
        page,
        limit,
        filters,
        orderBy: { column: 'created_at', ascending: false }
      }
      
      const result = await dbHelpers.list('users', options)
      return result
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      return await dbHelpers.get('users', id)
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Create user (admin only)
  createUser: async (userData) => {
    try {
      const user = await getCurrentUser()
      
      const userPayload = {
        ...userData,
        created_by: user.id,
        created_at: new Date().toISOString()
      }
      
      return await dbHelpers.insert('users', userPayload)
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Update user
  updateUser: async (id, updateData) => {
    try {
      const currentUser = await getCurrentUser()
      
      const updatePayload = {
        ...updateData,
        updated_by: currentUser.id,
        updated_at: new Date().toISOString()
      }
      
      return await dbHelpers.update('users', id, updatePayload)
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
      
      if (error) handleSupabaseError(error)
      return { success: true, message: 'User deleted successfully' }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    try {
      const currentUser = await getCurrentUser()
      
      const updatePayload = {
        role: role,
        updated_by: currentUser.id,
        updated_at: new Date().toISOString()
      }
      
      return await dbHelpers.update('users', userId, updatePayload)
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get user permissions
  getUserPermissions: async (userId) => {
    try {
      const user = await userService.getUserById(userId)
      
      // Define permissions based on role
      const permissions = {
        admin: {
          customers: ['read', 'write', 'delete'],
          transactions: ['read', 'write', 'delete'],
          screenings: ['read', 'write', 'delete'],
          cases: ['read', 'write', 'delete'],
          reports: ['read', 'write', 'delete'],
          users: ['read', 'write', 'delete'],
          settings: ['read', 'write']
        },
        manager: {
          customers: ['read', 'write'],
          transactions: ['read', 'write'],
          screenings: ['read', 'write'],
          cases: ['read', 'write'],
          reports: ['read', 'write'],
          users: ['read'],
          settings: ['read']
        },
        analyst: {
          customers: ['read'],
          transactions: ['read', 'write'],
          screenings: ['read', 'write'],
          cases: ['read', 'write'],
          reports: ['read'],
          users: [],
          settings: []
        },
        viewer: {
          customers: ['read'],
          transactions: ['read'],
          screenings: ['read'],
          cases: ['read'],
          reports: ['read'],
          users: [],
          settings: []
        }
      }
      
      return permissions[user.role] || permissions.viewer
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Check if user has permission
  hasPermission: async (userId, resource, action) => {
    try {
      const permissions = await userService.getUserPermissions(userId)
      return permissions[resource]?.includes(action) || false
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const { data: users } = await supabase
        .from('users')
        .select('*')
      
      const stats = {
        total: users?.length || 0,
        byRole: {
          admin: users?.filter(u => u.role === 'admin').length || 0,
          manager: users?.filter(u => u.role === 'manager').length || 0,
          analyst: users?.filter(u => u.role === 'analyst').length || 0,
          viewer: users?.filter(u => u.role === 'viewer').length || 0
        },
        byStatus: {
          active: users?.filter(u => u.status === 'active').length || 0,
          inactive: users?.filter(u => u.status === 'inactive').length || 0
        },
        recentLogins: users?.filter(u => {
          const lastLogin = new Date(u.last_login_at || 0)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return lastLogin >= weekAgo
        }).length || 0
      }
      
      return stats
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Update user settings
  updateUserSettings: async (userId, settings) => {
    try {
      const currentUser = await getCurrentUser()
      
      const updatePayload = {
        settings: settings,
        updated_by: currentUser.id,
        updated_at: new Date().toISOString()
      }
      
      return await dbHelpers.update('users', userId, updatePayload)
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get user settings
  getUserSettings: async (userId) => {
    try {
      const user = await userService.getUserById(userId)
      return user.settings || {}
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Reset user password
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      return { success: true, message: 'Password reset email sent' }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Update password
  updatePassword: async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
      return { success: true, message: 'Password updated successfully' }
    } catch (error) {
      handleSupabaseError(error)
    }
  }
}
