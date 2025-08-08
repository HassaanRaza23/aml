import { supabase } from '../config/supabase';
import { dbHelpers } from '../config/supabase';

export const activityLogService = {
  // Get all activity logs with optional filters
  async getActivityLogs(filters = {}) {
    try {
      let query = supabase
        .from('system_logs')
        .select(`
          *,
          users (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.user) {
        query = query.eq('user_id', filters.user);
      }
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate);
      }
      if (filters.toDate) {
        query = query.lte('created_at', filters.toDate);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching activity logs:', error);
        return { success: false, data: [], count: 0, error: error.message };
      }

      // Transform data to match the UI expectations
      const transformedData = data.map(log => ({
        id: log.id,
        timestamp: new Date(log.created_at).toLocaleString(),
        user: log.users ? `${log.users.first_name} ${log.users.last_name}` : 'System',
        action: log.action,
        module: log.module,
        details: this.formatLogDetails(log),
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        record_id: log.record_id,
        table_name: log.table_name
      }));

      return { 
        success: true, 
        data: transformedData, 
        count: count || transformedData.length,
        error: null 
      };

    } catch (error) {
      console.error('Error in getActivityLogs:', error);
      return { success: false, data: [], count: 0, error: error.message };
    }
  },

  // Get activity log by ID
  async getActivityLogById(logId) {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select(`
          *,
          users (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', logId)
        .single();

      if (error) {
        console.error('Error fetching activity log:', error);
        return { success: false, data: null, error: error.message };
      }

      const transformedLog = {
        id: data.id,
        timestamp: new Date(data.created_at).toLocaleString(),
        user: data.users ? `${data.users.first_name} ${data.users.last_name}` : 'System',
        action: data.action,
        module: data.module,
        details: this.formatLogDetails(data),
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        record_id: data.record_id,
        table_name: data.table_name,
        old_values: data.old_values,
        new_values: data.new_values
      };

      return { success: true, data: transformedLog, error: null };

    } catch (error) {
      console.error('Error in getActivityLogById:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Create a new activity log
  async createActivityLog(logData) {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .insert([logData])
        .select()
        .single();

      if (error) {
        console.error('Error creating activity log:', error);
        return { success: false, data: null, error: error.message };
      }

      return { success: true, data, error: null };

    } catch (error) {
      console.error('Error in createActivityLog:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Get activity log statistics
  async getActivityLogStats() {
    try {
      // Get total count
      const { count: totalCount, error: countError } = await supabase
        .from('system_logs')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error getting total count:', countError);
        return { success: false, data: null, error: countError.message };
      }

      // Get today's count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: todayCount, error: todayError } = await supabase
        .from('system_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      if (todayError) {
        console.error('Error getting today count:', todayError);
        return { success: false, data: null, error: todayError.message };
      }

      // Get this week's count
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: weekCount, error: weekError } = await supabase
        .from('system_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      if (weekError) {
        console.error('Error getting week count:', weekError);
        return { success: false, data: null, error: weekError.message };
      }

      // Get action counts
      const { data: actionCounts, error: actionError } = await supabase
        .from('system_logs')
        .select('action')
        .gte('created_at', weekAgo.toISOString());

      if (actionError) {
        console.error('Error getting action counts:', actionError);
        return { success: false, data: null, error: actionError.message };
      }

      const actionStats = actionCounts.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {});

      const stats = {
        total: totalCount || 0,
        today: todayCount || 0,
        thisWeek: weekCount || 0,
        actionStats
      };

      return { success: true, data: stats, error: null };

    } catch (error) {
      console.error('Error in getActivityLogStats:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Helper function to format log details
  formatLogDetails(log) {
    let details = `${log.action} in ${log.module}`;
    
    if (log.table_name) {
      details += ` (${log.table_name})`;
    }
    
    if (log.record_id) {
      details += ` - Record ID: ${log.record_id}`;
    }

    // Add more context based on old/new values
    if (log.old_values && log.new_values) {
      details += ' - Updated';
    } else if (log.new_values) {
      details += ' - Created';
    } else if (log.old_values) {
      details += ' - Deleted';
    }

    return details;
  }
};
