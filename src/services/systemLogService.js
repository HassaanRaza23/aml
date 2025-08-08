import { supabase } from '../config/supabase';

export const systemLogService = {
  // Get all system logs with optional filters
  async getSystemLogs(filters = {}) {
    try {
      // For now, we'll use the system_logs table but filter for system events
      // In a real implementation, you might have a separate system_events table
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
      if (filters.status) {
        // Map status to action types
        const statusMap = {
          'Success': ['Completed', 'Success', 'Finished'],
          'Failed': ['Failed', 'Error', 'Exception'],
          'In Progress': ['Started', 'Running', 'Processing']
        };
        if (statusMap[filters.status]) {
          query = query.in('action', statusMap[filters.status]);
        }
      }
      
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      if (filters.eventType) {
        query = query.ilike('action', `%${filters.eventType}%`);
      }

      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate);
      }
      
      if (filters.toDate) {
        query = query.lte('created_at', filters.toDate);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching system logs:', error);
        return { success: false, data: [], count: 0, error: error.message };
      }

      // Transform data to match the UI expectations
      const transformedData = data.map(log => ({
        id: log.id,
        eventType: this.formatEventType(log.action),
        description: this.formatDescription(log),
        timestamp: new Date(log.created_at).toLocaleString(),
        status: this.determineStatus(log.action),
        triggerType: this.determineTriggerType(log),
        module: log.module,
        user: log.users ? `${log.users.first_name} ${log.users.last_name}` : 'System',
        ip_address: log.ip_address,
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
      console.error('Error in getSystemLogs:', error);
      return { success: false, data: [], count: 0, error: error.message };
    }
  },

  // Get system log by ID
  async getSystemLogById(logId) {
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
        console.error('Error fetching system log:', error);
        return { success: false, data: null, error: error.message };
      }

      const transformedLog = {
        id: data.id,
        eventType: this.formatEventType(data.action),
        description: this.formatDescription(data),
        timestamp: new Date(data.created_at).toLocaleString(),
        status: this.determineStatus(data.action),
        triggerType: this.determineTriggerType(data),
        module: data.module,
        user: data.users ? `${data.users.first_name} ${data.users.last_name}` : 'System',
        ip_address: data.ip_address,
        record_id: data.record_id,
        table_name: data.table_name,
        old_values: data.old_values,
        new_values: data.new_values
      };

      return { success: true, data: transformedLog, error: null };

    } catch (error) {
      console.error('Error in getSystemLogById:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Create a new system log
  async createSystemLog(logData) {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .insert([logData])
        .select()
        .single();

      if (error) {
        console.error('Error creating system log:', error);
        return { success: false, data: null, error: error.message };
      }

      return { success: true, data, error: null };

    } catch (error) {
      console.error('Error in createSystemLog:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Get system log statistics
  async getSystemLogStats() {
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

      // Get status counts
      const { data: actionCounts, error: actionError } = await supabase
        .from('system_logs')
        .select('action')
        .gte('created_at', weekAgo.toISOString());

      if (actionError) {
        console.error('Error getting action counts:', actionError);
        return { success: false, data: null, error: actionError.message };
      }

      const statusStats = actionCounts.reduce((acc, log) => {
        const status = this.determineStatus(log.action);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const stats = {
        total: totalCount || 0,
        today: todayCount || 0,
        thisWeek: weekCount || 0,
        statusStats
      };

      return { success: true, data: stats, error: null };

    } catch (error) {
      console.error('Error in getSystemLogStats:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Helper functions
  formatEventType(action) {
    // Map action to event type
    const eventTypeMap = {
      'Created': 'Record Creation',
      'Updated': 'Record Update',
      'Deleted': 'Record Deletion',
      'Submitted': 'Report Submission',
      'Auto-Flagged': 'Automated Flagging',
      'Assessed': 'Risk Assessment',
      'Flagged': 'Transaction Flagging',
      'Login': 'User Login',
      'Logout': 'User Logout',
      'Screening': 'Screening Process',
      'Monitoring': 'Transaction Monitoring'
    };
    
    return eventTypeMap[action] || action;
  },

  formatDescription(log) {
    let description = `${log.action} in ${log.module}`;
    
    if (log.table_name) {
      description += ` (${log.table_name})`;
    }
    
    if (log.record_id) {
      description += ` - Record ID: ${log.record_id}`;
    }

    // Add more context based on old/new values
    if (log.old_values && log.new_values) {
      description += ' - Updated';
    } else if (log.new_values) {
      description += ' - Created';
    } else if (log.old_values) {
      description += ' - Deleted';
    }

    return description;
  },

  determineStatus(action) {
    // Map action to status
    const statusMap = {
      'Created': 'Success',
      'Updated': 'Success',
      'Deleted': 'Success',
      'Submitted': 'Success',
      'Auto-Flagged': 'Success',
      'Assessed': 'Success',
      'Flagged': 'Success',
      'Login': 'Success',
      'Logout': 'Success',
      'Screening': 'In Progress',
      'Monitoring': 'In Progress'
    };
    
    return statusMap[action] || 'Success';
  },

  determineTriggerType(log) {
    // Determine if it's automated or manual
    const automatedActions = ['Auto-Flagged', 'Screening', 'Monitoring'];
    const scheduledActions = ['Assessed', 'Created', 'Updated'];
    
    if (automatedActions.includes(log.action)) {
      return 'Auto';
    } else if (scheduledActions.includes(log.action)) {
      return 'Scheduled';
    } else {
      return 'Manual';
    }
  }
};
