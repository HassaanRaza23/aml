import { supabase } from '../config/supabase';

export const verificationService = {
  // Save verification checks for a customer
  async saveVerificationChecks(customerId, verificationChecks) {
    try {
      const { data: user } = await supabase.auth.getUser();
      const userId = user?.user?.id || '00000000-0000-0000-0000-000000000001'; // Demo user fallback

      // First, delete existing checks for this customer
      const { error: deleteError } = await supabase
        .from('customer_verification_checks')
        .delete()
        .eq('customer_id', customerId);

      if (deleteError) {
        console.error('Error deleting existing checks:', deleteError);
        return { success: false, error: deleteError.message };
      }

      // Prepare checks data for insertion
      const checksToInsert = Object.entries(verificationChecks)
        .filter(([_, check]) => check.answer) // Only insert checks that have been answered
        .map(([checkType, check]) => ({
          customer_id: customerId,
          check_type: checkType,
          check_question: check.question || this.getQuestionByType(checkType),
          answer: check.answer,
          notes: check.notes || null,
          checked_by: userId,
          checked_at: new Date().toISOString()
        }));

      if (checksToInsert.length === 0) {
        return { success: true, data: [], message: 'No verification checks to save' };
      }

      // Insert new checks
      const { data, error } = await supabase
        .from('customer_verification_checks')
        .insert(checksToInsert)
        .select();

      if (error) {
        console.error('Error saving verification checks:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data, message: 'Verification checks saved successfully' };
    } catch (error) {
      console.error('Error in saveVerificationChecks:', error);
      return { success: false, error: error.message };
    }
  },

  // Load verification checks for a customer
  async loadVerificationChecks(customerId) {
    try {
      const { data, error } = await supabase
        .from('customer_verification_checks')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading verification checks:', error);
        return { success: false, error: error.message };
      }

      // Transform data to match the expected format
      const verificationChecks = {};
      data.forEach(check => {
        verificationChecks[check.check_type] = {
          answer: check.answer,
          notes: check.notes || '',
          question: check.check_question
        };
      });

      return { success: true, data: verificationChecks };
    } catch (error) {
      console.error('Error in loadVerificationChecks:', error);
      return { success: false, error: error.message };
    }
  },

  // Get question text by check type
  getQuestionByType(checkType) {
    const questions = {
      adverseMedia: "1. Any adverse media or criminal records found?",
      sanctionsMatch: "2. Any sanctions list matches or watchlist hits?",
      sourceOfFunds: "3. Source of Funds — Are they legitimate and verifiable?",
      sourceOfWealth: "4. Source of Wealth — Sufficient evidence or rationale provided?",
      documentAuthenticity: "5. Are all submitted documents authentic and valid?",
      identityVerified: "6. Has identity been verified against reliable sources?",
      pepCheck: "7. Is the individual a politically exposed person (PEP)?",
      elevatedRisk: "8. Any elevated risk indicators that require EDD?"
    };
    return questions[checkType] || checkType;
  },

  // Get all question types and their default questions
  getDefaultQuestions() {
    return [
      {
        label: "1. Any adverse media or criminal records found?",
        key: "adverseMedia",
      },
      {
        label: "2. Any sanctions list matches or watchlist hits?",
        key: "sanctionsMatch",
      },
      {
        label: "3. Source of Funds — Are they legitimate and verifiable?",
        key: "sourceOfFunds",
      },
      {
        label: "4. Source of Wealth — Sufficient evidence or rationale provided?",
        key: "sourceOfWealth",
      },
      {
        label: "5. Are all submitted documents authentic and valid?",
        key: "documentAuthenticity",
      },
      {
        label: "6. Has identity been verified against reliable sources?",
        key: "identityVerified",
      },
      {
        label: "7. Is the individual a politically exposed person (PEP)?",
        key: "pepCheck",
      },
      {
        label: "8. Any elevated risk indicators that require EDD?",
        key: "elevatedRisk",
      }
    ];
  }
};
