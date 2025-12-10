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

  // Get all question types and their default questions based on due diligence level
  getDefaultQuestions(dueDiligenceLevel = "Simplified Customer Due Diligence") {
    // Define questions for each due diligence level
    const allQuestions = {
      "Simplified Customer Due Diligence": [
        {
          type: "heading",
          label: "Background checks:",
        },
        {
          label: "1. Has a Google search been conducted in order to check any adverse media news?",
          key: "googleSearchAdverseMedia",
        },
        {
          label: "2. Have the directors, shareholders and beneficial owners been screened?",
          key: "directorsShareholdersScreened",
        },
        {
          label: "3. Are there any adverse report on the client or any of its principals?",
          key: "adverseReport",
        },
        {
          type: "heading",
          label: "Source of funds/source of wealth:",
        },
        {
          label: "4. Has the source of funds been determined?",
          key: "sourceOfFundsDetermined",
        },
        {
          label: "5. Has the source of wealth of the client been determined?",
          key: "sourceOfWealthDetermined",
        }
      ],
      "Customer Due Diligence": [
        {
          type: "heading",
          label: "Background checks:",
        },
        {
          label: "1. Have the directors, shareholders and beneficial owners been screened?",
          key: "directorsShareholdersScreened",
        },
        {
          label: "2. Has a Google search been conducted in order to check any adverse media news?",
          key: "googleSearchAdverseMedia",
        },
        {
          label: "3. Are there any adverse report on the client or any of its principals?",
          key: "adverseReport",
        },
        {
          label: "4. Have the negative allegations been assessed",
          key: "negativeAllegationsAssessed",
        },
        {
          label: "5. Has the Compliance Officer been informed of the adverse report?",
          key: "complianceOfficerInformed",
        },
        {
          type: "heading",
          label: "Body Corporate:",
        },
        {
          label: "6. the full name of the Body Corporate and any trading name?",
          key: "bodyCorporateFullName",
        },
        {
          label: "7. the address of its registered office and, if different, its principal place of business?",
          key: "bodyCorporateAddress",
        },
        {
          label: "8. the date and place of incorporation or registration?",
          key: "bodyCorporateIncorporationDate",
        },
        {
          label: "9. the incorporation number or business registration number?",
          key: "bodyCorporateRegistrationNumber",
        },
        {
          label: "10. certificate of incorporation or certificate of registration?",
          key: "bodyCorporateCertificate",
        },
        {
          label: "11. memorandum and articles of association?",
          key: "bodyCorporateMemorandum",
        },
        {
          label: "12. the full names of the members and persons exercising a senior management position?",
          key: "bodyCorporateMembers",
        },
        {
          type: "heading",
          label: "Foundations:",
        },
        {
          label: "13. the founder?",
          key: "foundationFounder",
        },
        {
          label: "14. the foundation council members?",
          key: "foundationCouncilMembers",
        },
        {
          label: "15. the guardian, if any?",
          key: "foundationGuardian",
        },
        {
          label: "16. each beneficiary of the foundation?",
          key: "foundationBeneficiaries",
        },
        {
          label: "17. any natural person who has control over the foundation?",
          key: "foundationControlPersons",
        },
        {
          type: "heading",
          label: "Individual:",
        },
        {
          label: "18. full name (including any alias)?",
          key: "individualFullName",
        },
        {
          label: "19. date of birth?",
          key: "individualDateOfBirth",
        },
        {
          label: "20. unique identification number?",
          key: "individualIdNumber",
        },
        {
          label: "21. nationality?",
          key: "individualNationality",
        },
        {
          label: "22. legal domicile?",
          key: "individualLegalDomicile",
        },
        {
          label: "23. current residential address based on a recent utility bill?",
          key: "individualResidentialAddress",
        },
        {
          label: "24. Occupation?",
          key: "individualOccupation",
        },
        {
          type: "heading",
          label: "Source of funds/source of wealth:",
        },
        {
          label: "25. Has the source of funds been determined?",
          key: "sourceOfFundsDetermined",
        },
        {
          label: "26. Has the source of wealth of the client been determined?",
          key: "sourceOfWealthDetermined",
        },
        {
          type: "heading",
          label: "Trust:",
        },
        {
          label: "27. the settlor of the trust?",
          key: "trustSettlor",
        },
        {
          label: "28. any other trustee(s)?",
          key: "trustTrustees",
        },
        {
          label: "29. each beneficiary of the trust?",
          key: "trustBeneficiaries",
        },
        {
          label: "30. any natural person who has control over the trust?",
          key: "trustControlPersons",
        }
      ],
      "Enhanced Customer Due Diligence": [
        {
          type: "heading",
          label: "Adverse Media and Negative Check:",
        },
        {
          label: "1. Has his identity been obtained from reliable, credible and independent documents?",
          key: "identityFromReliableDocuments",
        },
        {
          label: "2. Have the directors, shareholders and beneficial owners been screened?",
          key: "directorsShareholdersScreened",
        },
        {
          label: "3. Has the beneficial owner's identity been verified?",
          key: "beneficialOwnerIdentityVerified",
        },
        {
          label: "4. Has an online search been conducted on the family members or known associates?",
          key: "onlineSearchFamilyAssociates",
        },
        {
          type: "heading",
          label: "Obtain Additional Identifying Information:",
        },
        {
          label: "5. Has the beneficial owner's identity been verified?",
          key: "beneficialOwnerIdentityVerified2",
        },
        {
          label: "6. Has information about his family members and close business partners been obtained?",
          key: "familyBusinessPartnersInfo",
        },
        {
          label: "7. Has more information about the client and the nature and purpose of the business relationship been obtained?",
          key: "clientBusinessRelationshipInfo",
        },
        {
          label: "8. Are the client's files kept up to date?",
          key: "clientFilesUpToDate",
        },
        {
          type: "heading",
          label: "Politically Exposed Person:",
        },
        {
          label: "9. Is the beneficial owner a Politically Exposed Person (PEP)?",
          key: "beneficialOwnerPEP",
        },
        {
          type: "heading",
          label: "Public Record Due Diligence:",
        },
        {
          label: "10. Has a detailed online research on the beneficial owner been conducted?",
          key: "detailedOnlineResearchBeneficialOwner",
        },
        {
          type: "heading",
          label: "Ultimate Beneficial Ownership (UBO):",
        },
        {
          label: "11. Public Record Due Diligence",
          key: "uboPublicRecordDueDiligence",
        }
      ]
    };

    // Return questions for the specified level, or default to Simplified if level not found
    return allQuestions[dueDiligenceLevel] || allQuestions["Simplified Customer Due Diligence"];
  }
};
