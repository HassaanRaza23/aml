import { supabase } from '../config/supabase';

export const dashboardService = {
  // Get comprehensive dashboard statistics
  async getDashboardStats() {
    try {
      // Get all statistics in parallel
      const [
        customerStats,
        screeningStats,
        caseStats,
        reportStats,
        alertStats,
        riskStats,
        recentActivity
      ] = await Promise.all([
        this.getCustomerStats(),
        this.getScreeningStats(),
        this.getCaseStats(),
        this.getReportStats(),
        this.getAlertStats(),
        this.getRiskStats(),
        this.getRecentActivity()
      ]);

      return {
        success: true,
        data: {
          customerStats,
          screeningStats,
          caseStats,
          reportStats,
          alertStats,
          riskStats,
          recentActivity
        },
        error: null
      };

    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Get customer statistics
  async getCustomerStats() {
    try {
      // Total customers
      const { count: totalCustomers, error: totalError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Customers by risk level
      const { data: riskLevels, error: riskError } = await supabase
        .from('customers')
        .select('risk_level')
        .not('risk_level', 'is', null);

      if (riskError) throw riskError;

      const riskStats = riskLevels.reduce((acc, customer) => {
        acc[customer.risk_level] = (acc[customer.risk_level] || 0) + 1;
        return acc;
      }, {});

      // Recent customers (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: recentCustomers, error: recentError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      if (recentError) throw recentError;

      return {
        total: totalCustomers || 0,
        recent: recentCustomers || 0,
        riskLevels: riskStats
      };

    } catch (error) {
      console.error('Error getting customer stats:', error);
      return { total: 0, recent: 0, riskLevels: {} };
    }
  },

  // Get screening statistics
  async getScreeningStats() {
    try {
      // Total screenings
      const { count: totalScreenings, error: totalError } = await supabase
        .from('screening_logs')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Recent screenings (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: recentScreenings, error: recentError } = await supabase
        .from('screening_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      if (recentError) throw recentError;

      return {
        total: totalScreenings || 0,
        recent: recentScreenings || 0
      };

    } catch (error) {
      console.error('Error getting screening stats:', error);
      return { total: 0, recent: 0 };
    }
  },

  // Get case statistics
  async getCaseStats() {
    try {
      // Total cases
      const { count: totalCases, error: totalError } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Cases by status
      const { data: caseStatuses, error: statusError } = await supabase
        .from('cases')
        .select('status');

      if (statusError) throw statusError;

      const statusStats = caseStatuses.reduce((acc, case_) => {
        acc[case_.status] = (acc[case_.status] || 0) + 1;
        return acc;
      }, {});

      // Open cases
      const openCases = statusStats['Open'] || 0;
      const inProgressCases = statusStats['In Progress'] || 0;

      return {
        total: totalCases || 0,
        open: openCases,
        inProgress: inProgressCases,
        statusStats
      };

    } catch (error) {
      console.error('Error getting case stats:', error);
      return { total: 0, open: 0, inProgress: 0, statusStats: {} };
    }
  },

  // Get report statistics
  async getReportStats() {
    try {
      // Total reports
      const { count: totalReports, error: totalError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // SAR reports (Suspicious Activity Reports)
      const { count: sarReports, error: sarError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .ilike('report_type', '%suspicious%');

      if (sarError) throw sarError;

      // Recent reports (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: recentReports, error: recentError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .gte('generated_at', weekAgo.toISOString());

      if (recentError) throw recentError;

      return {
        total: totalReports || 0,
        sar: sarReports || 0,
        recent: recentReports || 0
      };

    } catch (error) {
      console.error('Error getting report stats:', error);
      return { total: 0, sar: 0, recent: 0 };
    }
  },

  // Get alert statistics
  async getAlertStats() {
    try {
      // Total alerts
      const { count: totalAlerts, error: totalError } = await supabase
        .from('transaction_alerts')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Pending alerts (not resolved)
      const { count: pendingAlerts, error: pendingError } = await supabase
        .from('transaction_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending');

      if (pendingError) throw pendingError;

      // Alerts by severity
      const { data: alertSeverities, error: severityError } = await supabase
        .from('transaction_alerts')
        .select('severity');

      if (severityError) throw severityError;

      const severityStats = alertSeverities.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {});

      // Alerts over time (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: alertsOverTime, error: timeError } = await supabase
        .from('transaction_alerts')
        .select('created_at')
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: true });

      if (timeError) throw timeError;

      // Group alerts by date
      const alertsByDate = alertsOverTime.reduce((acc, alert) => {
        const date = new Date(alert.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return {
        total: totalAlerts || 0,
        pending: pendingAlerts || 0,
        severityStats,
        alertsOverTime: Object.entries(alertsByDate).map(([date, count]) => ({ date, count }))
      };

    } catch (error) {
      console.error('Error getting alert stats:', error);
      return { 
        total: 0, 
        pending: 0, 
        severityStats: {}, 
        alertsOverTime: [] 
      };
    }
  },

  // Get risk statistics
  async getRiskStats() {
    try {
      // Get customers by risk level
      const { data: customers, error } = await supabase
        .from('customers')
        .select('risk_level')
        .not('risk_level', 'is', null);

      if (error) throw error;

      const riskStats = customers.reduce((acc, customer) => {
        acc[customer.risk_level] = (acc[customer.risk_level] || 0) + 1;
        return acc;
      }, {});

      // Convert to pie chart format
      const pieData = Object.entries(riskStats).map(([level, count]) => ({
        name: level,
        value: count
      }));

      return {
        riskLevels: riskStats,
        pieData
      };

    } catch (error) {
      console.error('Error getting risk stats:', error);
      return { riskLevels: {}, pieData: [] };
    }
  },

  // Get recent activity
  async getRecentActivity() {
    try {
      // Get recent system logs
      const { data: recentLogs, error } = await supabase
        .from('system_logs')
        .select(`
          *,
          users (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const activities = recentLogs.map(log => ({
        id: log.id,
        action: log.action,
        module: log.module,
        user: log.users ? `${log.users.first_name} ${log.users.last_name}` : 'System',
        timestamp: new Date(log.created_at).toLocaleString(),
        description: this.formatActivityDescription(log)
      }));

      return activities;

    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  },

  // Get high-risk customers
  async getHighRiskCustomers() {
    try {
      const { data: highRiskCustomers, error } = await supabase
        .from('customers')
        .select('first_name, last_name, risk_level, created_at')
        .eq('risk_level', 'High')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return highRiskCustomers.map(customer => ({
        name: `${customer.first_name} ${customer.last_name}`,
        riskLevel: customer.risk_level,
        created: new Date(customer.created_at).toLocaleDateString()
      }));

    } catch (error) {
      console.error('Error getting high-risk customers:', error);
      return [];
    }
  },

  // Get pending tasks
  async getPendingTasks() {
    try {
      const tasks = [];

      // Pending alerts
      const { count: pendingAlerts, error: alertsError } = await supabase
        .from('transaction_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending');

      if (!alertsError && pendingAlerts > 0) {
        tasks.push(`${pendingAlerts} alerts need manual review`);
      }

      // Pending KYC
      const { count: pendingKYC, error: kycError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('kyc_status', 'Pending');

      if (!kycError && pendingKYC > 0) {
        tasks.push(`${pendingKYC} customer KYC forms need verification`);
      }

      // Open cases
      const { count: openCases, error: casesError } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Open');

      if (!casesError && openCases > 0) {
        tasks.push(`${openCases} case(s) pending assignment`);
      }

      return tasks;

    } catch (error) {
      console.error('Error getting pending tasks:', error);
      return [];
    }
  },

  // Helper function to format activity description
  formatActivityDescription(log) {
    let description = `${log.action} in ${log.module}`;
    
    if (log.table_name) {
      description += ` (${log.table_name})`;
    }
    
    if (log.record_id) {
      description += ` - Record ID: ${log.record_id}`;
    }

    return description;
  }
};
