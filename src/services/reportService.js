import { supabase, handleSupabaseError, getCurrentUser, dbHelpers } from '../config/supabase'
import { reportGeneratorMock } from '../mocks'

export const reportService = {
  // Generate customer risk assessment report
  generateCustomerRiskAssessment: async (customerId) => {
    try {
      const user = await getCurrentUser()
      
      // Get customer data
      const customer = await dbHelpers.get('customers', customerId)
      
      // Generate report using mock generator
      const reportResult = await reportGeneratorMock.generateCustomerRiskAssessment({
        customerId: customer.id,
        fullName: customer.first_name + ' ' + customer.last_name,
        nationality: customer.nationality,
        entityType: customer.entity_type,
        riskScore: customer.risk_score,
        riskLevel: customer.risk_level
      })
      
      // Save report to database
      const reportPayload = {
        report_type: 'Customer Risk Assessment',
        customer_id: customerId,
        report_data: reportResult.data,
        report_template: reportResult.template,
        generated_by: user.id,
        generated_at: new Date().toISOString()
      }
      
      const report = await dbHelpers.insert('reports', reportPayload)
      
      return { ...report, ...reportResult }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Generate transaction monitoring report
  generateTransactionMonitoring: async (filters = {}) => {
    try {
      const user = await getCurrentUser()
      
      // Generate report using mock generator
      const reportResult = await reportGeneratorMock.generateTransactionMonitoring(filters)
      
      // Save report to database
      const reportPayload = {
        report_type: 'Transaction Monitoring',
        report_data: reportResult.data,
        report_template: reportResult.template,
        filters: filters,
        generated_by: user.id,
        generated_at: new Date().toISOString()
      }
      
      const report = await dbHelpers.insert('reports', reportPayload)
      
      return { ...report, ...reportResult }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Generate screening results report
  generateScreeningResults: async (screeningId) => {
    try {
      const user = await getCurrentUser()
      
      // Get screening data
      const screening = await dbHelpers.get('screenings', screeningId)
      const customer = await dbHelpers.get('customers', screening.customer_id)
      
      // Generate report using mock generator
      const reportResult = await reportGeneratorMock.generateScreeningResults({
        customerId: customer.id,
        customerName: customer.first_name + ' ' + customer.last_name,
        nationality: customer.nationality
      })
      
      // Save report to database
      const reportPayload = {
        report_type: 'Screening Results',
        screening_id: screeningId,
        customer_id: screening.customer_id,
        report_data: reportResult.data,
        report_template: reportResult.template,
        generated_by: user.id,
        generated_at: new Date().toISOString()
      }
      
      const report = await dbHelpers.insert('reports', reportPayload)
      
      return { ...report, ...reportResult }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Generate case management report
  generateCaseManagement: async (filters = {}) => {
    try {
      const user = await getCurrentUser()
      
      // Generate report using mock generator
      const reportResult = await reportGeneratorMock.generateCaseManagement(filters)
      
      // Save report to database
      const reportPayload = {
        report_type: 'Case Management',
        report_data: reportResult.data,
        report_template: reportResult.template,
        filters: filters,
        generated_by: user.id,
        generated_at: new Date().toISOString()
      }
      
      const report = await dbHelpers.insert('reports', reportPayload)
      
      return { ...report, ...reportResult }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Generate compliance dashboard report
  generateComplianceDashboard: async (filters = {}) => {
    try {
      const user = await getCurrentUser()
      
      // Generate report using mock generator
      const reportResult = await reportGeneratorMock.generateComplianceDashboard(filters)
      
      // Save report to database
      const reportPayload = {
        report_type: 'Compliance Dashboard',
        report_data: reportResult.data,
        report_template: reportResult.template,
        filters: filters,
        generated_by: user.id,
        generated_at: new Date().toISOString()
      }
      
      const report = await dbHelpers.insert('reports', reportPayload)
      
      return { ...report, ...reportResult }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Generate regulatory report (SAR/STR)
  generateRegulatoryReport: async (caseId) => {
    try {
      const user = await getCurrentUser()
      
      // Get case data
      const caseRecord = await dbHelpers.get('cases', caseId)
      const customer = await dbHelpers.get('customers', caseRecord.customer_id)
      
      // Generate report using mock generator
      const reportResult = await reportGeneratorMock.generateRegulatoryReport({
        customerName: customer.first_name + ' ' + customer.last_name,
        nationality: customer.nationality,
        dateOfBirth: customer.date_of_birth
      })
      
      // Save report to database
      const reportPayload = {
        report_type: 'Regulatory Report',
        case_id: caseId,
        customer_id: caseRecord.customer_id,
        report_data: reportResult.data,
        report_template: reportResult.template,
        generated_by: user.id,
        generated_at: new Date().toISOString()
      }
      
      const report = await dbHelpers.insert('reports', reportPayload)
      
      return { ...report, ...reportResult }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Generate audit trail report
  generateAuditTrail: async (filters = {}) => {
    try {
      const user = await getCurrentUser()
      
      // Generate report using mock generator
      const reportResult = await reportGeneratorMock.generateAuditTrail(filters)
      
      // Save report to database
      const reportPayload = {
        report_type: 'Audit Trail',
        report_data: reportResult.data,
        report_template: reportResult.template,
        filters: filters,
        generated_by: user.id,
        generated_at: new Date().toISOString()
      }
      
      const report = await dbHelpers.insert('reports', reportPayload)
      
      return { ...report, ...reportResult }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get reports list
  getReports: async (page = 1, limit = 50, filters = {}) => {
    try {
      const options = {
        page,
        limit,
        filters,
        orderBy: { column: 'generated_at', ascending: false }
      }
      
      const result = await dbHelpers.list('reports', options)
      return result
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get report by ID
  getReportById: async (id) => {
    try {
      return await dbHelpers.get('reports', id)
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Export report to PDF
  exportReportToPDF: async (reportId) => {
    try {
      const report = await reportService.getReportById(reportId)
      
      // This would integrate with a PDF generation library
      // For now, return the report data
      return {
        success: true,
        reportId: reportId,
        data: report,
        format: 'PDF',
        downloadUrl: `/api/reports/${reportId}/download`
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Export report to Excel
  exportReportToExcel: async (reportId) => {
    try {
      const report = await reportService.getReportById(reportId)
      
      // This would integrate with an Excel generation library
      // For now, return the report data
      return {
        success: true,
        reportId: reportId,
        data: report,
        format: 'Excel',
        downloadUrl: `/api/reports/${reportId}/download`
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get report statistics
  getReportStats: async () => {
    try {
      const { data: reports } = await supabase
        .from('reports')
        .select('*')
      
      const stats = {
        total: reports?.length || 0,
        byType: {
          'Customer Risk Assessment': reports?.filter(r => r.report_type === 'Customer Risk Assessment').length || 0,
          'Transaction Monitoring': reports?.filter(r => r.report_type === 'Transaction Monitoring').length || 0,
          'Screening Results': reports?.filter(r => r.report_type === 'Screening Results').length || 0,
          'Case Management': reports?.filter(r => r.report_type === 'Case Management').length || 0,
          'Compliance Dashboard': reports?.filter(r => r.report_type === 'Compliance Dashboard').length || 0,
          'Regulatory Report': reports?.filter(r => r.report_type === 'Regulatory Report').length || 0,
          'Audit Trail': reports?.filter(r => r.report_type === 'Audit Trail').length || 0
        },
        byDate: {
          today: reports?.filter(r => new Date(r.generated_at).toDateString() === new Date().toDateString()).length || 0,
          thisWeek: reports?.filter(r => {
            const reportDate = new Date(r.generated_at)
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return reportDate >= weekAgo
          }).length || 0,
          thisMonth: reports?.filter(r => {
            const reportDate = new Date(r.generated_at)
            const monthAgo = new Date()
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return reportDate >= monthAgo
          }).length || 0
        }
      }
      
      return stats
    } catch (error) {
      handleSupabaseError(error)
    }
  }
}
