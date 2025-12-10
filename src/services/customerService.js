import { supabase, handleSupabaseError, getCurrentUser, dbHelpers } from '../config/supabase'
import { calculateRiskScore } from '../utils/riskCalculation'

export const customerService = {
  // Create a new customer
  createCustomer: async (customerData) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock customer creation (Supabase not configured)')
        
        // Calculate risk score
        const riskResult = await calculateRiskScore(customerData)
        
        // Create mock customer data
        const mockCustomer = {
          id: 'mock-' + Date.now(),
          ...customerData,
          risk_score: riskResult.score,
          risk_level: riskResult.level,
          kyc_status: 'Pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        return { 
          success: true, 
          data: mockCustomer,
          message: 'Customer created successfully (Mock Mode)'
        }
      }
      
      console.log('🔗 Creating customer in real Supabase database...')
      
      // Real Supabase implementation
      // Note: created_by and updated_by are removed since they require valid user IDs
      
      // Prepare customer payload
      const customerPayload = {
        ...customerData,
        created_at: new Date().toISOString()
      }
      
      // Insert customer
      const customer = await dbHelpers.insert('customers', customerPayload)
      
      // Insert related data if provided
      if (customerData.shareholders && customerData.shareholders.length > 0) {
        const shareholdersData = customerData.shareholders.map(shareholder => ({
          customer_id: customer.id,
          ...shareholder
        }))
        await supabase.from('customer_shareholders').insert(shareholdersData)
      }
      
      if (customerData.directors && customerData.directors.length > 0) {
        const directorsData = customerData.directors.map(director => ({
          customer_id: customer.id,
          ...director
        }))
        await supabase.from('customer_directors').insert(directorsData)
      }
      
      if (customerData.bank_details && customerData.bank_details.length > 0) {
        const bankDetailsData = customerData.bank_details.map(bank => ({
          customer_id: customer.id,
          ...bank
        }))
        await supabase.from('customer_bank_details').insert(bankDetailsData)
      }
      
      if (customerData.ubos && customerData.ubos.length > 0) {
        const ubosData = customerData.ubos.map(ubo => ({
          customer_id: customer.id,
          ...ubo
        }))
        await supabase.from('customer_ubos').insert(ubosData)
      }
      
      return { 
        success: true, 
        data: customer,
        message: 'Customer created successfully'
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to create customer'
      }
    }
  },

  // Get customers with pagination and filtering
  getCustomers: async (page = 1, limit = 50, filters = {}) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock customer list (Supabase not configured)')
        
        // Return mock customer data
        const mockCustomers = [
          {
            id: 'mock-1',
            customer_type: 'Natural Person',
            email: 'john.doe@example.com',
            risk_score: 25,
            risk_level: 'Low',
            kyc_status: 'Pending',
            created_at: new Date().toISOString(),
            natural_person_details: {
              firstName: 'John',
              lastName: 'Doe'
            }
          },
          {
            id: 'mock-2',
            customer_type: 'Legal Entities',
            email: 'jane.smith@example.com',
            risk_score: 65,
            risk_level: 'Medium',
            kyc_status: 'Approved',
            created_at: new Date().toISOString(),
            legal_entity_details: {
              legalName: 'Jane Smith Corp'
            }
          }
        ]
        
        return { 
          success: true,
          data: mockCustomers, 
          count: mockCustomers.length 
        }
      }
      
      console.log('🔗 Fetching customers from real Supabase database...')
      
      // Fetch customers with their detail data
      const { data: customers, error } = await supabase
        .from('customers')
        .select(`
          *,
          natural_person_details(*),
          legal_entity_details(*)
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)
      
      if (error) {
        throw new Error(error.message)
      }
      
      console.log('🔍 Raw customers data:', customers);
      
      // If no detail data is returned, try to fetch it separately
      if (customers && customers.length > 0) {
        const customerIds = customers.map(c => c.id);
        
        // Fetch natural person details
        const { data: naturalPersonDetails, error: npError } = await supabase
          .from('natural_person_details')
          .select('*')
          .in('customer_id', customerIds);
        
        if (npError) {
          console.warn('⚠️ Error fetching natural person details:', npError);
        } else {
          console.log('👤 Natural person details:', naturalPersonDetails);
        }
        
        // Fetch legal entity details
        const { data: legalEntityDetails, error: leError } = await supabase
          .from('legal_entity_details')
          .select('*')
          .in('customer_id', customerIds);
        
        if (leError) {
          console.warn('⚠️ Error fetching legal entity details:', leError);
        } else {
          console.log('🏢 Legal entity details:', legalEntityDetails);
        }
        
        // Merge the data manually if the join didn't work
        if (naturalPersonDetails || legalEntityDetails) {
          customers.forEach(customer => {
            if (customer.customer_type === 'Natural Person') {
              const details = naturalPersonDetails?.find(d => d.customer_id === customer.id);
              if (details) {
                customer.natural_person_details = details;
              }
            } else if (customer.customer_type === 'Legal Entities') {
              const details = legalEntityDetails?.find(d => d.customer_id === customer.id);
              if (details) {
                customer.legal_entity_details = details;
              }
            }
          });
        }
      }
      
      // Get total count
      const { count } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
      
      return { 
        success: true,
        data: customers || [],
        count: count || 0
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to fetch customers'
      }
    }
  },

  // Get customer by ID with all related data
  getCustomerById: async (id) => {
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .select(`
          *,
          natural_person_details(*),
          legal_entity_details(*),
          customer_directors(*),
          customer_bank_details(*),
          customer_ubos(*)
        `)
        .eq('id', id)
        .single()
      
      if (error) handleSupabaseError(error)
      
      // If no detail data is returned, try to fetch it separately
      if (customer && !customer.natural_person_details && !customer.legal_entity_details) {
        if (customer.customer_type === 'Natural Person') {
          const { data: details, error: npError } = await supabase
            .from('natural_person_details')
            .select('*')
            .eq('customer_id', id)
            .single();
          
          if (!npError && details) {
            customer.natural_person_details = details;
          }
        } else if (customer.customer_type === 'Legal Entities') {
          const { data: details, error: leError } = await supabase
            .from('legal_entity_details')
            .select('*')
            .eq('customer_id', id)
            .single();
          
          if (!leError && details) {
            customer.legal_entity_details = details;
          }
        }
      }
      
      // Fetch shareholders using the new normalized structure
      if (customer) {
        try {
          console.log('🔍 Fetching shareholders for customer:', id);
          
          // Get main shareholders data
          const { data: mainShareholders, error: mainError } = await supabase
            .from('customer_shareholders')
            .select('*')
            .eq('customer_id', id);

          console.log('🔍 Main shareholders result:', { mainShareholders, mainError });

          if (mainError) {
            console.error('👥 Error fetching main shareholders:', mainError)
            customer.shareholders = [];
          } else if (!mainShareholders || mainShareholders.length === 0) {
            customer.shareholders = [];
          } else {
            // Fetch details for each shareholder type and combine
            const shareholdersWithDetails = [];
            
            for (const mainShareholder of mainShareholders) {
              let shareholderData = {
                id: mainShareholder.id,
                type: mainShareholder.entity_type,
                shareholding: mainShareholder.shareholding_percentage
              };

              if (mainShareholder.entity_type === 'Natural Person') {
                const { data: naturalPersonDetails, error: detailError } = await supabase
                  .from('shareholder_natural_person_details')
                  .select('*')
                  .eq('shareholder_id', mainShareholder.id)
                  .single();

                if (!detailError && naturalPersonDetails) {
                  shareholderData = {
                    ...shareholderData,
                    fullName: naturalPersonDetails.full_name,
                    alias: naturalPersonDetails.alias,
                    countryOfResidence: naturalPersonDetails.country_of_residence,
                    nationality: naturalPersonDetails.nationality,
                    dateOfBirth: naturalPersonDetails.date_of_birth,
                    placeOfBirth: naturalPersonDetails.place_of_birth,
                    phone: naturalPersonDetails.phone,
                    email: naturalPersonDetails.email,
                    address: naturalPersonDetails.address,
                    sourceOfFunds: naturalPersonDetails.source_of_funds,
                    sourceOfWealth: naturalPersonDetails.source_of_wealth,
                    occupation: naturalPersonDetails.occupation,
                    expectedIncome: naturalPersonDetails.expected_income_range,
                    pep: naturalPersonDetails.pep_status,
                    dualNationality: naturalPersonDetails.dual_nationality,
                    isDirector: naturalPersonDetails.is_director,
                    isUbo: naturalPersonDetails.is_ubo
                  };
                }

              } else if (mainShareholder.entity_type === 'Legal Entities') {
                const { data: legalEntityDetails, error: detailError } = await supabase
                  .from('shareholder_legal_entity_details')
                  .select('*')
                  .eq('shareholder_id', mainShareholder.id)
                  .single();

                if (!detailError && legalEntityDetails) {
                  shareholderData = {
                    ...shareholderData,
                    legalName: legalEntityDetails.legal_name,
                    alias: legalEntityDetails.alias,
                    dateOfIncorporation: legalEntityDetails.date_of_incorporation,
                    countryOfIncorporation: legalEntityDetails.country_of_incorporation,
                    entityClass: legalEntityDetails.entity_class,
                    licenseType: legalEntityDetails.license_type,
                    licenseNumber: legalEntityDetails.license_number,
                    licenseIssueDate: legalEntityDetails.license_issue_date,
                    licenseExpiryDate: legalEntityDetails.license_expiry_date,
                    businessActivity: legalEntityDetails.business_activity,
                    countriesOfOperation: legalEntityDetails.countries_of_operation,
                    countriesSourceOfFunds: legalEntityDetails.countries_source_of_funds,
                    sourceOfFunds: legalEntityDetails.source_of_funds,
                    registeredOfficeAddress: legalEntityDetails.registered_office_address,
                    email: legalEntityDetails.email,
                    phone: legalEntityDetails.phone,
                    otherDetails: legalEntityDetails.other_details
                  };
                }

              } else if (mainShareholder.entity_type === 'Trust') {
                const { data: trustDetails, error: detailError } = await supabase
                  .from('shareholder_trust_details')
                  .select('*')
                  .eq('shareholder_id', mainShareholder.id)
                  .single();

                if (!detailError && trustDetails) {
                  shareholderData = {
                    ...shareholderData,
                    trustName: trustDetails.trust_name,
                    alias: trustDetails.alias,
                    trustRegistered: trustDetails.trust_registered,
                    trustType: trustDetails.trust_type,
                    jurisdictionOfLaw: trustDetails.jurisdiction_of_law,
                    registeredAddress: trustDetails.registered_address,
                    trusteeName: trustDetails.trustee_name,
                    trusteeType: trustDetails.trustee_type
                  };
                }
              }

              shareholdersWithDetails.push(shareholderData);
            }

            customer.shareholders = shareholdersWithDetails;
          }
        } catch (error) {
          console.error('Error fetching shareholders:', error);
          customer.shareholders = [];
        }
      }

      // Fetch UBOs for the customer
      if (customer) {
        try {
          console.log('👤 Fetching UBOs for customer:', id);
          
          console.log('👤 Querying customer_ubos table for customer_id:', id);
          const { data: ubos, error: ubosError } = await supabase
            .from('customer_ubos')
            .select('*')
            .eq('customer_id', id)
            .order('created_at', { ascending: true });

          console.log('👤 UBOs result:', { ubos, ubosError });
          if (ubos && ubos.length > 0) {
            console.log('👤 Raw UBO from database:', ubos[0]);
            console.log('👤 Raw UBO fields:', Object.keys(ubos[0]));
            console.log('👤 Raw UBO values:', Object.values(ubos[0]));
          }

          if (ubosError) {
            console.error('👤 Error fetching UBOs:', ubosError);
            customer.ubos = [];
          } else if (!ubos || ubos.length === 0) {
            customer.ubos = [];
          } else {
            // Transform database fields to frontend format
            const transformedUbos = ubos.map(ubo => ({
              id: ubo.id,
              fullName: ubo.full_name || '',
              alias: ubo.alias || '',
              countryOfResidence: ubo.country_of_residence || '',
              nationality: ubo.nationality || '',
              dateOfBirth: ubo.date_of_birth || '',
              placeOfBirth: ubo.place_of_birth || '',
              phone: ubo.phone || '',
              email: ubo.email || '',
              address: ubo.address || '',
              sourceOfFunds: ubo.source_of_funds || '',
              sourceOfWealth: ubo.source_of_wealth || '',
              occupation: ubo.occupation || '',
              expectedIncome: ubo.expected_income || '',
              pep: ubo.pep || '',
              shareholding: ubo.shareholding ? ubo.shareholding.toString() : '',
              dualNationality: ubo.dual_nationality || ''
            }));

            customer.ubos = transformedUbos;
            console.log('👤 Transformed UBOs:', customer.ubos);
            if (transformedUbos.length > 0) {
              console.log('👤 Transformed UBO fields:', Object.keys(transformedUbos[0]));
              console.log('👤 Transformed UBO values:', Object.values(transformedUbos[0]));
            }
          }
        } catch (error) {
          console.error('Error fetching UBOs:', error);
          customer.ubos = [];
        }
      }
      
      return customer
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Update customer
  updateCustomer: async (id, updateData) => {
    try {
      // Note: updated_by is removed since it requires a valid user ID
      
      // Build main customer data only from fields that are actually provided
      const mainCustomerData = {
        updated_at: new Date().toISOString()
      };

      // Core customer fields (used by onboarding / edit flows)
      if (Object.prototype.hasOwnProperty.call(updateData, 'core_system_id')) {
        mainCustomerData.core_system_id = updateData.core_system_id;
      }
      if (Object.prototype.hasOwnProperty.call(updateData, 'customer_type')) {
        mainCustomerData.customer_type = updateData.customer_type;
      }
      if (Object.prototype.hasOwnProperty.call(updateData, 'email')) {
        mainCustomerData.email = updateData.email;
      }
      if (Object.prototype.hasOwnProperty.call(updateData, 'phone')) {
        mainCustomerData.phone = updateData.phone;
      }
      if (Object.prototype.hasOwnProperty.call(updateData, 'channel')) {
        mainCustomerData.channel = updateData.channel;
      }
      if (Object.prototype.hasOwnProperty.call(updateData, 'transaction_product')) {
        mainCustomerData.transaction_product = updateData.transaction_product;
      }
      if (Object.prototype.hasOwnProperty.call(updateData, 'transaction_amount_limit')) {
        mainCustomerData.transaction_amount_limit = updateData.transaction_amount_limit;
      }
      if (Object.prototype.hasOwnProperty.call(updateData, 'transaction_limit')) {
        mainCustomerData.transaction_limit = updateData.transaction_limit;
      }

      // KYC-related fields (used by KYCDetails page)
      if (Object.prototype.hasOwnProperty.call(updateData, 'kyc_status')) {
        mainCustomerData.kyc_status = updateData.kyc_status;
      }
      if (Object.prototype.hasOwnProperty.call(updateData, 'kyc_remarks')) {
        mainCustomerData.kyc_remarks = updateData.kyc_remarks;
      }
      if (Object.prototype.hasOwnProperty.call(updateData, 'due_diligence_level')) {
        mainCustomerData.due_diligence_level = updateData.due_diligence_level;
      }
      
      // Update main customer table
      const result = await dbHelpers.update('customers', id, mainCustomerData)
      
      // Update detail tables based on customer type
      if (updateData.customer_type === 'Natural Person') {
        const naturalPersonData = {
          profession: updateData.profession,
          firstname: updateData.firstname,
          lastname: updateData.lastname,
          alias: updateData.alias,
          dateofbirth: updateData.dateofbirth,
          nationality: updateData.nationality,
          residencystatus: updateData.residencyStatus,
          idtype: updateData.idType,
          idnumber: updateData.idNumber,
          issuedate: updateData.issueDate,
          expirydate: updateData.expiryDate,
          isdualnationality: updateData.isDualNationality,
          dualnationality: updateData.isDualNationality ? updateData.dualNationality : null,
          dualpassportnumber: updateData.isDualNationality ? updateData.dualPassportNumber : null,
          dualpassportissuedate: updateData.isDualNationality ? updateData.dualPassportIssueDate : null,
          dualpassportexpirydate: updateData.isDualNationality ? updateData.dualPassportExpiryDate : null,
          countryofbirth: updateData.countryOfBirth,
          address: updateData.address,
          occupation: updateData.occupation,
          sourceofwealth: updateData.sourceOfWealth,
          pep: updateData.pep,
          sourceoffunds: updateData.sourceOfFunds,
          pobox: updateData.poBox,
          gender: updateData.gender,
          employer: updateData.employer
        }
        
        // Check if natural person details exist
        const { data: existingDetails } = await supabase
          .from('natural_person_details')
          .select('customer_id')
          .eq('customer_id', id)
          .single()
        
        if (existingDetails) {
          await supabase
            .from('natural_person_details')
            .update(naturalPersonData)
            .eq('customer_id', id)
        } else {
          await supabase
            .from('natural_person_details')
            .insert({ customer_id: id, ...naturalPersonData })
        }
      } else if (updateData.customer_type === 'Legal Entities') {
        const legalEntityData = {
          businessactivity: Array.isArray(updateData.businessactivity) ? JSON.stringify(updateData.businessactivity) : updateData.businessactivity,
          legalname: updateData.legalname,
          alias: updateData.alias,
          dateofincorporation: updateData.dateofincorporation || null,
          countryofincorporation: updateData.countryofincorporation,
          licensetype: updateData.licensetype,
          licensenumber: updateData.licensenumber,
          licenseissuedate: updateData.licenseissuedate || null,
          licenseexpirydate: updateData.licenseexpirydate || null,
          registeredofficeaddress: updateData.registeredofficeaddress,
          city: updateData.city,
          countriessourceoffunds: Array.isArray(updateData.countriessourceoffunds) ? JSON.stringify(updateData.countriessourceoffunds) : updateData.countriessourceoffunds,
          managementcompany: updateData.managementcompany,
          countriesofoperation: Array.isArray(updateData.countriesofoperation) ? JSON.stringify(updateData.countriesofoperation) : updateData.countriesofoperation,
          jurisdiction: updateData.jurisdiction,
          sourceoffunds: updateData.sourceoffunds,
          residencystatus: updateData.residencystatus,
          licensingauthority: updateData.licensingauthority,
          trn: updateData.trn,
          licensecategory: updateData.licensecategory,
          addressexpirydate: updateData.addressexpirydate || null
        }
        
        // Check if legal entity details exist
        const { data: existingDetails } = await supabase
          .from('legal_entity_details')
          .select('customer_id')
          .eq('customer_id', id)
          .single()
        
        if (existingDetails) {
          await supabase
            .from('legal_entity_details')
            .update(legalEntityData)
            .eq('customer_id', id)
        } else {
          await supabase
            .from('legal_entity_details')
            .insert({ customer_id: id, ...legalEntityData })
        }
      }
      
      // Update expandable sections data
      // Handle shareholders with new normalized structure
      if (updateData.shareholders && updateData.shareholders.length > 0) {
        // Get existing shareholders to update them
        const { data: existingShareholders } = await supabase
          .from('customer_shareholders')
          .select('id')
          .eq('customer_id', id);
        
        // Update existing shareholders or insert new ones
        for (let i = 0; i < updateData.shareholders.length; i++) {
          const shareholder = updateData.shareholders[i];
          
          // Main shareholder data
          const mainShareholderData = {
            customer_id: id,
            entity_type: shareholder.type,
            shareholding_percentage: shareholder.shareholding || null
          };
          
          if (existingShareholders && existingShareholders[i]) {
            // Update existing main shareholder record
            await supabase
              .from('customer_shareholders')
              .update(mainShareholderData)
              .eq('id', existingShareholders[i].id);
            
            const shareholderId = existingShareholders[i].id;
            
            // Update type-specific details
            if (shareholder.type === 'Natural Person') {
              const naturalPersonData = {
                full_name: shareholder.fullName,
                alias: shareholder.alias,
                country_of_residence: shareholder.countryOfResidence,
                nationality: shareholder.nationality,
                date_of_birth: shareholder.dateOfBirth || null,
                place_of_birth: shareholder.placeOfBirth,
                phone: shareholder.phone,
                email: shareholder.email,
                address: shareholder.address,
                source_of_funds: shareholder.sourceOfFunds,
                source_of_wealth: shareholder.sourceOfWealth,
                occupation: shareholder.occupation,
                expected_income_range: shareholder.expectedIncome,
                pep_status: shareholder.pep,
                dual_nationality: shareholder.dualNationality,
                is_director: shareholder.isDirector,
                is_ubo: shareholder.isUbo
              };
              
              // Check if natural person details exist
              const { data: existingDetails } = await supabase
                .from('shareholder_natural_person_details')
                .select('id')
                .eq('shareholder_id', shareholderId)
                .single();
              
              if (existingDetails) {
                await supabase
                  .from('shareholder_natural_person_details')
                  .update(naturalPersonData)
                  .eq('shareholder_id', shareholderId);
              } else {
                await supabase
                  .from('shareholder_natural_person_details')
                  .insert({ shareholder_id: shareholderId, ...naturalPersonData });
              }
              
            } else if (shareholder.type === 'Legal Entities') {
              const legalEntityData = {
                legal_name: shareholder.legalName,
                alias: shareholder.alias,
                date_of_incorporation: shareholder.dateOfIncorporation || null,
                country_of_incorporation: shareholder.countryOfIncorporation,
                entity_class: shareholder.entityClass,
                license_type: shareholder.licenseType,
                license_number: shareholder.licenseNumber,
                license_issue_date: shareholder.licenseIssueDate || null,
                license_expiry_date: shareholder.licenseExpiryDate || null,
                business_activity: Array.isArray(shareholder.businessActivity) 
                  ? JSON.stringify(shareholder.businessActivity) 
                  : shareholder.businessActivity,
                countries_of_operation: Array.isArray(shareholder.countriesOfOperation) 
                  ? JSON.stringify(shareholder.countriesOfOperation) 
                  : shareholder.countriesOfOperation,
                countries_source_of_funds: Array.isArray(shareholder.countriesSourceOfFunds) 
                  ? JSON.stringify(shareholder.countriesSourceOfFunds) 
                  : shareholder.countriesSourceOfFunds,
                source_of_funds: shareholder.sourceOfFunds,
                registered_office_address: shareholder.registeredOfficeAddress,
                email: shareholder.email,
                phone: shareholder.phone,
                other_details: shareholder.otherDetails
              };
              
              // Check if legal entity details exist
              const { data: existingDetails } = await supabase
                .from('shareholder_legal_entity_details')
                .select('id')
                .eq('shareholder_id', shareholderId)
                .single();
              
              if (existingDetails) {
                await supabase
                  .from('shareholder_legal_entity_details')
                  .update(legalEntityData)
                  .eq('shareholder_id', shareholderId);
              } else {
                await supabase
                  .from('shareholder_legal_entity_details')
                  .insert({ shareholder_id: shareholderId, ...legalEntityData });
              }
              
            } else if (shareholder.type === 'Trust') {
              const trustData = {
                trust_name: shareholder.trustName,
                alias: shareholder.alias,
                trust_registered: shareholder.trustRegistered,
                trust_type: shareholder.trustType,
                jurisdiction_of_law: shareholder.jurisdictionOfLaw,
                registered_address: shareholder.registeredAddress,
                trustee_name: shareholder.trusteeName,
                trustee_type: shareholder.trusteeType
              };
              
              // Check if trust details exist
              const { data: existingDetails } = await supabase
                .from('shareholder_trust_details')
                .select('id')
                .eq('shareholder_id', shareholderId)
                .single();
              
              if (existingDetails) {
                await supabase
                  .from('shareholder_trust_details')
                  .update(trustData)
                  .eq('shareholder_id', shareholderId);
              } else {
                await supabase
                  .from('shareholder_trust_details')
                  .insert({ shareholder_id: shareholderId, ...trustData });
              }
            }
            
          } else {
            // Insert new shareholder
            const mainResult = await supabase
              .from('customer_shareholders')
              .insert(mainShareholderData)
              .select()
              .single();
            
            if (mainResult.error) {
              console.error('Error inserting new shareholder:', mainResult.error);
              continue;
            }
            
            const shareholderId = mainResult.data.id;
            
            // Insert type-specific details
            if (shareholder.type === 'Natural Person') {
              const naturalPersonData = {
                shareholder_id: shareholderId,
                full_name: shareholder.fullName,
                alias: shareholder.alias,
                country_of_residence: shareholder.countryOfResidence,
                nationality: shareholder.nationality,
                date_of_birth: shareholder.dateOfBirth || null,
                place_of_birth: shareholder.placeOfBirth,
                phone: shareholder.phone,
                email: shareholder.email,
                address: shareholder.address,
                source_of_funds: shareholder.sourceOfFunds,
                source_of_wealth: shareholder.sourceOfWealth,
                occupation: shareholder.occupation,
                expected_income_range: shareholder.expectedIncome,
                pep_status: shareholder.pep,
                dual_nationality: shareholder.dualNationality,
                is_director: shareholder.isDirector,
                is_ubo: shareholder.isUbo
              };
              
              await supabase
                .from('shareholder_natural_person_details')
                .insert(naturalPersonData);
                
            } else if (shareholder.type === 'Legal Entities') {
              const legalEntityData = {
                shareholder_id: shareholderId,
                legal_name: shareholder.legalName,
                alias: shareholder.alias,
                date_of_incorporation: shareholder.dateOfIncorporation || null,
                country_of_incorporation: shareholder.countryOfIncorporation,
                entity_class: shareholder.entityClass,
                license_type: shareholder.licenseType,
                license_number: shareholder.licenseNumber,
                license_issue_date: shareholder.licenseIssueDate || null,
                license_expiry_date: shareholder.licenseExpiryDate || null,
                business_activity: Array.isArray(shareholder.businessActivity) 
                  ? JSON.stringify(shareholder.businessActivity) 
                  : shareholder.businessActivity,
                countries_of_operation: Array.isArray(shareholder.countriesOfOperation) 
                  ? JSON.stringify(shareholder.countriesOfOperation) 
                  : shareholder.countriesOfOperation,
                countries_source_of_funds: Array.isArray(shareholder.countriesSourceOfFunds) 
                  ? JSON.stringify(shareholder.countriesSourceOfFunds) 
                  : shareholder.countriesSourceOfFunds,
                source_of_funds: shareholder.sourceOfFunds,
                registered_office_address: shareholder.registeredOfficeAddress,
                email: shareholder.email,
                phone: shareholder.phone,
                other_details: shareholder.otherDetails
              };
              
              await supabase
                .from('shareholder_legal_entity_details')
                .insert(legalEntityData);
                
            } else if (shareholder.type === 'Trust') {
              const trustData = {
                shareholder_id: shareholderId,
                trust_name: shareholder.trustName,
                alias: shareholder.alias,
                trust_registered: shareholder.trustRegistered,
                trust_type: shareholder.trustType,
                jurisdiction_of_law: shareholder.jurisdictionOfLaw,
                registered_address: shareholder.registeredAddress,
                trustee_name: shareholder.trusteeName,
                trustee_type: shareholder.trusteeType
              };
              
              await supabase
                .from('shareholder_trust_details')
                .insert(trustData);
            }
          }
        }
        
        // Remove extra shareholders if we have fewer now
        if (existingShareholders && existingShareholders.length > updateData.shareholders.length) {
          const extraIds = existingShareholders
            .slice(updateData.shareholders.length)
            .map(s => s.id);
          
          // Delete from detail tables first (due to foreign key constraints)
          for (const extraId of extraIds) {
            await supabase
              .from('shareholder_natural_person_details')
              .delete()
              .eq('shareholder_id', extraId);
            await supabase
              .from('shareholder_legal_entity_details')
              .delete()
              .eq('shareholder_id', extraId);
            await supabase
              .from('shareholder_trust_details')
              .delete()
              .eq('shareholder_id', extraId);
          }
          
          // Then delete from main table
          await supabase
            .from('customer_shareholders')
            .delete()
            .in('id', extraIds);
        }
      } else {
        // If no shareholders, delete all existing ones
        // Delete from detail tables first
        const { data: existingShareholders } = await supabase
          .from('customer_shareholders')
          .select('id')
          .eq('customer_id', id);
        
        if (existingShareholders && existingShareholders.length > 0) {
          for (const shareholder of existingShareholders) {
            await supabase
              .from('shareholder_natural_person_details')
              .delete()
              .eq('shareholder_id', shareholder.id);
            await supabase
              .from('shareholder_legal_entity_details')
              .delete()
              .eq('shareholder_id', shareholder.id);
            await supabase
              .from('shareholder_trust_details')
              .delete()
              .eq('shareholder_id', shareholder.id);
          }
        }
        
        // Then delete from main table
        await supabase.from('customer_shareholders').delete().eq('customer_id', id);
      }
      
      // Handle directors
      if (updateData.directors && updateData.directors.length > 0) {
        // Get existing directors to update them
        const { data: existingDirectors } = await supabase
          .from('customer_directors')
          .select('id')
          .eq('customer_id', id);
        
        // Update existing directors or insert new ones
        for (let i = 0; i < updateData.directors.length; i++) {
          const director = updateData.directors[i];
          const directorData = {
            customer_id: id,
            first_name: director.firstName,
            alias: director.alias,
            last_name: director.lastName,
            country_of_residence: director.countryOfResidence,
            nationality: director.nationality,
            date_of_birth: director.dateOfBirth,
            phone: director.phone,
            place_of_birth: director.placeOfBirth,
            email: director.email,
            address: director.address,
            city: director.city,
            occupation: director.occupation,
            pep_status: director.pepStatus,
            is_ceo: director.isCeo,
            is_representative: director.isRepresentative,
            dual_nationality: director.dualNationality
          };
          
          if (existingDirectors && existingDirectors[i]) {
            // Update existing record
            await supabase
              .from('customer_directors')
              .update(directorData)
              .eq('id', existingDirectors[i].id);
          } else {
            // Insert new record
            await supabase
              .from('customer_directors')
              .insert(directorData);
          }
        }
        
        // Remove extra directors if we have fewer now
        if (existingDirectors && existingDirectors.length > updateData.directors.length) {
          const extraIds = existingDirectors
            .slice(updateData.directors.length)
            .map(d => d.id);
          await supabase
            .from('customer_directors')
            .delete()
            .in('id', extraIds);
        }
      } else {
        // If no directors, delete all existing ones
        await supabase.from('customer_directors').delete().eq('customer_id', id);
      }
      
      // Handle bank details
      if (updateData.bankDetails && updateData.bankDetails.length > 0) {
        // Get existing bank details to update them
        const { data: existingBankDetails } = await supabase
          .from('customer_bank_details')
          .select('id')
          .eq('customer_id', id);
        
        // Update existing bank details or insert new ones
        for (let i = 0; i < updateData.bankDetails.length; i++) {
          const bank = updateData.bankDetails[i];
          const bankData = {
            customer_id: id,
            bank_name: bank.bankName,
            alias: bank.alias,
            account_type: bank.accountType,
            currency: bank.currency,
            bank_account_details: bank.bankAccountDetails,
            account_number: bank.accountNumber,
            iban: bank.iban,
            swift: bank.swift,
            mode_of_signatory: bank.modeOfSignatory,
            internet_banking: bank.internetBanking,
            bank_signatories: bank.bankSignatories
          };
          
          if (existingBankDetails && existingBankDetails[i]) {
            // Update existing record
            await supabase
              .from('customer_bank_details')
              .update(bankData)
              .eq('id', existingBankDetails[i].id);
          } else {
            // Insert new record
            await supabase
              .from('customer_bank_details')
              .insert(bankData);
          }
        }
        
        // Remove extra bank details if we have fewer now
        if (existingBankDetails && existingBankDetails.length > updateData.bankDetails.length) {
          const extraIds = existingBankDetails
            .slice(updateData.bankDetails.length)
            .map(b => b.id);
          await supabase
            .from('customer_bank_details')
            .delete()
            .in('id', extraIds);
        }
      } else {
        // If no bank details, delete all existing ones
        await supabase.from('customer_bank_details').delete().eq('customer_id', id);
      }
      
      // Handle UBOs
      if (updateData.ubos && updateData.ubos.length > 0) {
        // Get existing UBOs to update them
        const { data: existingUbos } = await supabase
          .from('customer_ubos')
          .select('id')
          .eq('customer_id', id);
        
        // Update existing UBOs or insert new ones
        for (let i = 0; i < updateData.ubos.length; i++) {
          const ubo = updateData.ubos[i];
          const uboData = {
            customer_id: id,
            full_name: ubo.fullName || '',
            alias: ubo.alias || '',
            country_of_residence: ubo.countryOfResidence || '',
            nationality: ubo.nationality || '',
            date_of_birth: ubo.dateOfBirth || null,
            place_of_birth: ubo.placeOfBirth || '',
            phone: ubo.phone || '',
            email: ubo.email || '',
            address: ubo.address || '',
            source_of_funds: ubo.sourceOfFunds || '',
            source_of_wealth: ubo.sourceOfWealth || '',
            occupation: ubo.occupation || '',
            expected_income: ubo.expectedIncome || '',
            pep: ubo.pep || '',
            shareholding: ubo.shareholding ? parseFloat(ubo.shareholding) : null,
            dual_nationality: ubo.dualNationality || ''
          };
          
          if (existingUbos && existingUbos[i]) {
            // Update existing record
            await supabase
              .from('customer_ubos')
              .update(uboData)
              .eq('id', existingUbos[i].id);
          } else {
            // Insert new record
            await supabase
              .from('customer_ubos')
              .insert(uboData);
          }
        }
        
        // Remove extra UBOs if we have fewer now
        if (existingUbos && existingUbos.length > updateData.ubos.length) {
          const extraIds = existingUbos
            .slice(updateData.ubos.length)
            .map(u => u.id);
          await supabase
            .from('customer_ubos')
            .delete()
            .in('id', extraIds);
        }
      } else {
        // If no UBOs, delete all existing ones
        await supabase.from('customer_ubos').delete().eq('customer_id', id);
      }
      
      // Recalculate risk score
      const customer = await customerService.getCustomerById(id)
      const riskResult = await calculateRiskScore(customer)
      
      // Update risk score
      await dbHelpers.update('customers', id, {
        risk_score: riskResult.score,
        risk_level: riskResult.level
      })
      
      return { success: true, data: result, message: 'Customer updated successfully' }
    } catch (error) {
      console.error('Error updating customer:', error)
      return { success: false, error: error.message || 'Failed to update customer' }
    }
  },

  // Update KYC status
  updateKYCStatus: async (customerId, kycData) => {
    try {
      const user = await getCurrentUser()
      
      // Update KYC details
      const kycPayload = {
        customer_id: customerId,
        ...kycData,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }
      
      // Check if KYC record exists
      const { data: existingKYC } = await supabase
        .from('kyc_details')
        .select('id')
        .eq('customer_id', customerId)
        .single()
      
      if (existingKYC) {
        await dbHelpers.update('kyc_details', existingKYC.id, kycPayload)
      } else {
        await dbHelpers.insert('kyc_details', kycPayload)
      }
      
      // Log KYC status change
      await supabase.from('kyc_status_logs').insert({
        customer_id: customerId,
        status: kycData.status,
        reason: kycData.reason || '',
        updated_by: user.id,
        created_at: new Date().toISOString()
      })
      
      return { success: true, message: 'KYC status updated successfully' }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Update risk profile
  updateRiskProfile: async (customerId, riskData) => {
    try {
      const user = await getCurrentUser()
      
      const riskPayload = {
        customer_id: customerId,
        ...riskData,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }
      
      // Check if risk override exists
      const { data: existingRisk } = await supabase
        .from('risk_profile_overrides')
        .select('id')
        .eq('customer_id', customerId)
        .single()
      
      if (existingRisk) {
        await dbHelpers.update('risk_profile_overrides', existingRisk.id, riskPayload)
      } else {
        await dbHelpers.insert('risk_profile_overrides', riskPayload)
      }
      
      return { success: true, message: 'Risk profile updated successfully' }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get customer statistics
  getCustomerStats: async () => {
    try {
      const { data: totalCustomers } = await supabase
        .from('customers')
        .select('id', { count: 'exact' })
      
      const { data: riskDistribution } = await supabase
        .from('customers')
        .select('risk_level')
      
      const stats = {
        total: totalCustomers?.length || 0,
        byRiskLevel: {
          Low: riskDistribution?.filter(c => c.risk_level === 'Low').length || 0,
          Medium: riskDistribution?.filter(c => c.risk_level === 'Medium').length || 0,
          High: riskDistribution?.filter(c => c.risk_level === 'High').length || 0
        },
        byStatus: {
          Active: riskDistribution?.filter(c => c.status === 'Active').length || 0,
          Inactive: riskDistribution?.filter(c => c.status === 'Inactive').length || 0
        }
      }
      
      return stats
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Search customers
  searchCustomers: async (searchTerm, filters = {}) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock customer search (Supabase not configured)')
        
        // Return mock customer data that matches search term
        const mockCustomers = [
          {
            id: 'mock-1',
            first_name: 'John',
            last_name: 'Doe',
            customer_type: 'Natural Person',
            email: 'john.doe@example.com',
            risk_score: 25,
            risk_level: 'Low',
            kyc_status: 'Pending',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-2',
            first_name: 'Jane',
            last_name: 'Smith',
            customer_type: 'Natural Person',
            email: 'jane.smith@example.com',
            risk_score: 65,
            risk_level: 'Medium',
            kyc_status: 'Approved',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-3',
            first_name: 'Michael',
            last_name: 'Johnson',
            customer_type: 'Legal Entities',
            email: 'michael.johnson@example.com',
            risk_score: 85,
            risk_level: 'High',
            kyc_status: 'Under Review',
            created_at: new Date().toISOString()
          }
        ]
        
        // Filter mock customers based on search term
        const filteredCustomers = mockCustomers.filter(customer => 
          customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        
        return { 
          success: true,
          data: filteredCustomers
        }
      }
      
      console.log('🔗 Searching customers in real Supabase database...')
      
      let query = supabase
        .from('customers')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      
      // Add additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value)
        }
      })
      
      const { data: customers, error } = await query
      
      if (error) {
        console.error('Supabase search error:', error)
        return { success: false, error: error.message }
      }
      
      return { 
        success: true,
        data: customers || []
      }
    } catch (error) {
      console.error('Error searching customers:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to search customers'
      }
    }
  },

  // Re-evaluate risk scores for all customers
  reEvaluateAllRiskScores: async () => {
    try {
      console.log('🔄 Starting risk score re-evaluation for all customers...')
      
      // Fetch all customers with pagination to handle large datasets
      let allCustomers = []
      let page = 1
      const pageSize = 1000
      let hasMore = true
      
      while (hasMore) {
        const result = await customerService.getCustomers(page, pageSize)
        if (!result.success) {
          console.error(`Error fetching customers page ${page}:`, result.error)
          break
        }
        
        if (result.data && result.data.length > 0) {
          allCustomers = [...allCustomers, ...result.data]
          hasMore = result.data.length === pageSize
          page++
        } else {
          hasMore = false
        }
      }
      
      if (allCustomers.length === 0) {
        return { 
          success: true, 
          message: 'No customers found to re-evaluate',
          updatedCount: 0,
          errorCount: 0
        }
      }
      
      console.log(`📊 Found ${allCustomers.length} customers to re-evaluate`)
      
      let updatedCount = 0
      let errorCount = 0
      
      // Re-evaluate each customer with complete data
      for (const customer of allCustomers) {
        try {
          // Fetch complete customer data including all related sections (shareholders, directors, etc.)
          const completeCustomerData = await customerService.getCustomerById(customer.id)
          
          if (!completeCustomerData) {
            console.warn(`⚠️ Could not fetch complete data for customer ${customer.id}`)
            errorCount++
            continue
          }
          
          // Use calculateAndUpdateRiskScore which handles complete calculation and DB update
          const riskResult = await customerService.calculateAndUpdateRiskScore(
            customer.id,
            completeCustomerData
          )
          
          if (riskResult.success) {
            updatedCount++
            console.log(`✅ Updated customer ${customer.id}: Risk Score=${riskResult.data.risk_score}, Level=${riskResult.data.risk_level}`)
          } else {
            console.error(`❌ Failed to update customer ${customer.id}:`, riskResult.error)
            errorCount++
          }
        } catch (error) {
          console.error(`❌ Error processing customer ${customer.id}:`, error)
          errorCount++
        }
      }
      
      console.log(`✅ Risk re-evaluation completed: ${updatedCount} updated, ${errorCount} errors`)
      
      return { 
        success: true, 
        message: `Re-evaluated ${allCustomers.length} customers: ${updatedCount} updated successfully, ${errorCount} errors`,
        updatedCount,
        errorCount,
        totalCustomers: allCustomers.length
      }
    } catch (error) {
      console.error('Error in risk re-evaluation:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to re-evaluate risk scores'
      }
    }
  },

  // Re-evaluate risk score for a single customer
  reEvaluateCustomerRiskScore: async (customerId) => {
    try {
      const customer = await customerService.getCustomerById(customerId)
      if (!customer) {
        return { success: false, error: 'Customer not found' }
      }
      
      // Calculate new risk score with updated rules
      const riskResult = await calculateRiskScore(customer)
      
      // Update customer with new risk score
      await customerService.updateCustomer(customerId, {
        risk_score: riskResult.score,
        risk_level: riskResult.level
      })
      
      return { 
        success: true, 
        message: 'Risk score updated successfully',
        data: { risk_score: riskResult.score, risk_level: riskResult.level }
      }
    } catch (error) {
      console.error('Error re-evaluating customer risk score:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to re-evaluate risk score'
      }
    }
  },

  // Save natural person details to the new normalized table
  saveNaturalPersonDetails: async (customerId, detailData) => {
    try {
      console.log('💾 Saving natural person details for customer:', customerId)
      
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock natural person details save (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, message: 'Natural person details saved successfully (Mock Mode)' }
      }
      
      // Real Supabase implementation
      const detailPayload = {
        customer_id: customerId,
        ...detailData
      }
      
      const result = await supabase
        .from('natural_person_details')
        .insert(detailPayload)
        .select()
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      return { 
        success: true, 
        data: result.data[0],
        message: 'Natural person details saved successfully'
      }
    } catch (error) {
      console.error('Error saving natural person details:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to save natural person details'
      }
    }
  },

  // Save legal entity details to the new normalized table
  saveLegalEntityDetails: async (customerId, detailData) => {
    try {
      console.log('💾 Saving legal entity details for customer:', customerId)
      console.log('💾 Detail data received:', detailData)
      console.log('💾 Detail data type:', typeof detailData)
      console.log('💾 Detail data keys:', Object.keys(detailData))
      
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock legal entity details save (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, message: 'Legal entity details saved successfully (Mock Mode)' }
      }
      
      // Real Supabase implementation
      const detailPayload = {
        customer_id: customerId,
        ...detailData
      }
      
      console.log('💾 Final payload to insert:', detailPayload)
      
      const result = await supabase
        .from('legal_entity_details')
        .insert(detailPayload)
        .select()
      
      console.log('💾 Supabase insert result:', result)
      
      if (result.error) {
        console.error('💾 Supabase insert error:', result.error)
        throw new Error(result.error.message)
      }
      
      return { 
        success: true, 
        data: result.data[0],
        message: 'Legal entity details saved successfully'
      }
    } catch (error) {
      console.error('Error saving legal entity details:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to save legal entity details'
      }
    }
  },

  // Get natural person details by customer ID
  getNaturalPersonDetails: async (customerId) => {
    try {
      console.log('🔍 Fetching natural person details for customer:', customerId)
      
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock natural person details fetch (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return {
          firstname: 'John',
          lastname: 'Doe',
          nationality: 'US',
          profession: 'Engineer',
          idtype: 'Passport',
          idnumber: '123456789',
          sourceofwealth: 'Employment',
          sourceoffunds: 'Salary',
          pep: 'No',
          residencystatus: 'Resident',
          gender: 'Male'
        }
      }
      
      // Real Supabase implementation
      const { data, error } = await supabase
        .from('natural_person_details')
        .select('*')
        .eq('customer_id', customerId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          console.log('🔍 No natural person details found for customer:', customerId)
          return null
        }
        throw new Error(error.message)
      }
      
      console.log('🔍 Natural person details fetched:', data)
      return data
    } catch (error) {
      console.error('Error fetching natural person details:', error)
      return null
    }
  },

  // Get legal entity details by customer ID
  getLegalEntityDetails: async (customerId) => {
    try {
      console.log('🔍 Fetching legal entity details for customer:', customerId)
      
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock legal entity details fetch (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return {
          legalname: 'Acme Corp',
          alias: 'ACME',
          jurisdiction: 'US',
          businessactivity: 'Technology',
          sourceoffunds: 'Business Operations',
          residencystatus: 'Domestic'
        }
      }
      
      // Real Supabase implementation
      const { data, error } = await supabase
        .from('legal_entity_details')
        .select('*')
        .eq('customer_id', customerId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          console.log('🔍 No legal entity details found for customer:', customerId)
          return null
        }
        throw new Error(error.message)
      }
      
      console.log('🔍 Legal entity details fetched:', data)
      return data
    } catch (error) {
      console.error('Error fetching legal entity details:', error)
      return null
    }
  },

  // Get a single shareholder by ID from normalized structure
  getShareholderById: async (shareholderId) => {
    try {
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock shareholder fetch (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, data: null, message: 'Shareholder fetched successfully (Mock Mode)' }
      }

      // Fetch main shareholder data
      const { data: mainShareholder, error: mainError } = await supabase
        .from('customer_shareholders')
        .select('*')
        .eq('id', shareholderId)
        .single();

      if (mainError) {
        console.error('👥 Error fetching main shareholder:', mainError)
        throw new Error(`Failed to fetch main shareholder: ${mainError.message}`)
      }

      if (!mainShareholder) {
        return { success: true, data: null, message: 'Shareholder not found' }
      }

      // Start with main shareholder data
      let shareholderData = {
        id: mainShareholder.id,
        type: mainShareholder.entity_type,
        shareholding: mainShareholder.shareholding_percentage
      };

      // Fetch details based on entity type
      if (mainShareholder.entity_type === 'Natural Person') {
        const { data: naturalPersonDetails, error: detailError } = await supabase
          .from('shareholder_natural_person_details')
          .select('*')
          .eq('shareholder_id', mainShareholder.id)
          .single();

        if (detailError) {
          console.error('👥 Error fetching natural person details:', detailError)
        } else if (naturalPersonDetails) {
          shareholderData = {
            ...shareholderData,
            fullName: naturalPersonDetails.full_name,
            alias: naturalPersonDetails.alias,
            countryOfResidence: naturalPersonDetails.country_of_residence,
            nationality: naturalPersonDetails.nationality,
            dateOfBirth: naturalPersonDetails.date_of_birth,
            placeOfBirth: naturalPersonDetails.place_of_birth,
            phone: naturalPersonDetails.phone,
            email: naturalPersonDetails.email,
            address: naturalPersonDetails.address,
            sourceOfFunds: naturalPersonDetails.source_of_funds,
            sourceOfWealth: naturalPersonDetails.source_of_wealth,
            occupation: naturalPersonDetails.occupation,
            expectedIncome: naturalPersonDetails.expected_income_range,
            pep: naturalPersonDetails.pep_status,
            // Dual nationality & passport details
            isDualNationality: naturalPersonDetails.is_dual_nationality,
            dualNationalityCountry: naturalPersonDetails.dual_nationality,
            dualNationality: naturalPersonDetails.dual_nationality,
            dualPassportNumber: naturalPersonDetails.dual_passport_number,
            dualPassportIssueDate: naturalPersonDetails.dual_passport_issue_date,
            dualPassportExpiryDate: naturalPersonDetails.dual_passport_expiry_date,
            // ID details
            idType: naturalPersonDetails.id_type,
            idNumber: naturalPersonDetails.id_number,
            idIssueDate: naturalPersonDetails.id_issue_date,
            idExpiryDate: naturalPersonDetails.id_expiry_date,
            isDirector: naturalPersonDetails.is_director,
            isUbo: naturalPersonDetails.is_ubo
          };
        }

      } else if (mainShareholder.entity_type === 'Legal Entities') {
        const { data: legalEntityDetails, error: detailError } = await supabase
          .from('shareholder_legal_entity_details')
          .select('*')
          .eq('shareholder_id', mainShareholder.id)
          .single();

        if (detailError) {
          console.error('👥 Error fetching legal entity details:', detailError)
        } else if (legalEntityDetails) {
          shareholderData = {
            ...shareholderData,
            legalName: legalEntityDetails.legal_name,
            alias: legalEntityDetails.alias,
            dateOfIncorporation: legalEntityDetails.date_of_incorporation,
            countryOfIncorporation: legalEntityDetails.country_of_incorporation,
            entityClass: legalEntityDetails.entity_class,
            licenseType: legalEntityDetails.license_type,
            licenseNumber: legalEntityDetails.license_number,
            licenseIssueDate: legalEntityDetails.license_issue_date,
            licenseExpiryDate: legalEntityDetails.license_expiry_date,
            businessActivity: legalEntityDetails.business_activity,
            countriesOfOperation: legalEntityDetails.countries_of_operation,
            countriesSourceOfFunds: legalEntityDetails.countries_source_of_funds,
            sourceOfFunds: legalEntityDetails.source_of_funds,
            registeredOfficeAddress: legalEntityDetails.registered_office_address,
            email: legalEntityDetails.email,
            phone: legalEntityDetails.phone,
            otherDetails: legalEntityDetails.other_details
          };
        }

      } else if (mainShareholder.entity_type === 'Trust') {
        const { data: trustDetails, error: detailError } = await supabase
          .from('shareholder_trust_details')
          .select('*')
          .eq('shareholder_id', mainShareholder.id)
          .single();

        if (detailError) {
          console.error('👥 Error fetching trust details:', detailError)
        } else if (trustDetails) {
          shareholderData = {
            ...shareholderData,
            trustName: trustDetails.trust_name,
            alias: trustDetails.alias,
            trustRegistered: trustDetails.trust_registered,
            trustType: trustDetails.trust_type,
            jurisdictionOfLaw: trustDetails.jurisdiction_of_law,
            registeredAddress: trustDetails.registered_address,
            trusteeName: trustDetails.trustee_name,
            trusteeType: trustDetails.trustee_type
          };
        }
      }

      return { 
        success: true, 
        data: shareholderData,
        message: 'Shareholder fetched successfully from normalized structure'
      }

    } catch (error) {
      console.error('Error fetching shareholder:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to fetch shareholder'
      }
    }
  },

  // Get shareholders from normalized structure
  getShareholders: async (customerId) => {
    try {
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock shareholders fetch (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, data: [], message: 'Shareholders fetched successfully (Mock Mode)' }
      }

      // Fetch main shareholders data
      const { data: mainShareholders, error: mainError } = await supabase
        .from('customer_shareholders')
        .select('*')
        .eq('customer_id', customerId);

      if (mainError) {
        console.error('👥 Error fetching main shareholders:', mainError)
        throw new Error(`Failed to fetch main shareholders: ${mainError.message}`)
      }

      if (!mainShareholders || mainShareholders.length === 0) {
        return { success: true, data: [], message: 'No shareholders found' }
      }

      // Fetch details for each shareholder type and combine
      const shareholdersWithDetails = [];
      
      for (const mainShareholder of mainShareholders) {
        let shareholderData = {
          id: mainShareholder.id,
          type: mainShareholder.entity_type,
          shareholding: mainShareholder.shareholding_percentage
        };

        if (mainShareholder.entity_type === 'Natural Person') {
          const { data: naturalPersonDetails, error: detailError } = await supabase
            .from('shareholder_natural_person_details')
            .select('*')
            .eq('shareholder_id', mainShareholder.id)
            .single();

          if (detailError) {
            console.error('👥 Error fetching natural person details:', detailError)
            continue; // Skip this shareholder if details can't be fetched
          }

          if (naturalPersonDetails) {
            shareholderData = {
              ...shareholderData,
              fullName: naturalPersonDetails.full_name,
              alias: naturalPersonDetails.alias,
              countryOfResidence: naturalPersonDetails.country_of_residence,
              nationality: naturalPersonDetails.nationality,
              dateOfBirth: naturalPersonDetails.date_of_birth,
              placeOfBirth: naturalPersonDetails.place_of_birth,
              phone: naturalPersonDetails.phone,
              email: naturalPersonDetails.email,
              address: naturalPersonDetails.address,
              sourceOfFunds: naturalPersonDetails.source_of_funds,
              sourceOfWealth: naturalPersonDetails.source_of_wealth,
              occupation: naturalPersonDetails.occupation,
              expectedIncome: naturalPersonDetails.expected_income_range,
              pep: naturalPersonDetails.pep_status,
              // Dual nationality & passport details
              isDualNationality: naturalPersonDetails.is_dual_nationality,
              dualNationalityCountry: naturalPersonDetails.dual_nationality,
              dualNationality: naturalPersonDetails.dual_nationality,
              dualPassportNumber: naturalPersonDetails.dual_passport_number,
              dualPassportIssueDate: naturalPersonDetails.dual_passport_issue_date,
              dualPassportExpiryDate: naturalPersonDetails.dual_passport_expiry_date,
              // ID details
              idType: naturalPersonDetails.id_type,
              idNumber: naturalPersonDetails.id_number,
              idIssueDate: naturalPersonDetails.id_issue_date,
              idExpiryDate: naturalPersonDetails.id_expiry_date,
              isDirector: naturalPersonDetails.is_director,
              isUbo: naturalPersonDetails.is_ubo
            };
          }

        } else if (mainShareholder.entity_type === 'Legal Entities') {
          const { data: legalEntityDetails, error: detailError } = await supabase
            .from('shareholder_legal_entity_details')
            .select('*')
            .eq('shareholder_id', mainShareholder.id)
            .single();

          if (detailError) {
            console.error('👥 Error fetching legal entity details:', detailError)
            continue;
          }

          console.log('🔍 Legal Entity details fetched:', legalEntityDetails);

          if (legalEntityDetails) {
            shareholderData = {
              ...shareholderData,
              legalName: legalEntityDetails.legal_name,
              alias: legalEntityDetails.alias,
              dateOfIncorporation: legalEntityDetails.date_of_incorporation,
              countryOfIncorporation: legalEntityDetails.country_of_incorporation,
              entityClass: legalEntityDetails.entity_class,
              licenseType: legalEntityDetails.license_type,
              licenseNumber: legalEntityDetails.license_number,
              licenseIssueDate: legalEntityDetails.license_issue_date,
              licenseExpiryDate: legalEntityDetails.license_expiry_date,
              businessActivity: (() => {
                try {
                  const parsed = typeof legalEntityDetails.business_activity === 'string' && legalEntityDetails.business_activity
                    ? JSON.parse(legalEntityDetails.business_activity)
                    : legalEntityDetails.business_activity;
                  return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
                } catch (e) {
                  return legalEntityDetails.business_activity ? [legalEntityDetails.business_activity] : [];
                }
              })(),
              countriesOfOperation: (() => {
                try {
                  const parsed = typeof legalEntityDetails.countries_of_operation === 'string' && legalEntityDetails.countries_of_operation
                    ? JSON.parse(legalEntityDetails.countries_of_operation)
                    : legalEntityDetails.countries_of_operation;
                  return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
                } catch (e) {
                  return legalEntityDetails.countries_of_operation ? [legalEntityDetails.countries_of_operation] : [];
                }
              })(),
              countriesSourceOfFunds: (() => {
                try {
                  const parsed = typeof legalEntityDetails.countries_source_of_funds === 'string' && legalEntityDetails.countries_source_of_funds
                    ? JSON.parse(legalEntityDetails.countries_source_of_funds)
                    : legalEntityDetails.countries_source_of_funds;
                  return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
                } catch (e) {
                  return legalEntityDetails.countries_source_of_funds ? [legalEntityDetails.countries_source_of_funds] : [];
                }
              })(),
              sourceOfFunds: legalEntityDetails.source_of_funds,
              registeredOfficeAddress: legalEntityDetails.registered_office_address,
              email: legalEntityDetails.email,
              phone: legalEntityDetails.phone,
              otherDetails: legalEntityDetails.other_details
            };
            
            console.log('🔍 Legal Entity shareholderData after mapping:', shareholderData);
          }

        } else if (mainShareholder.entity_type === 'Trust') {
          const { data: trustDetails, error: detailError } = await supabase
            .from('shareholder_trust_details')
            .select('*')
            .eq('shareholder_id', mainShareholder.id)
            .single();

          if (detailError) {
            console.error('👥 Error fetching trust details:', detailError)
            continue;
          }

          console.log('🔍 Trust details fetched:', trustDetails);

          if (trustDetails) {
            shareholderData = {
              ...shareholderData,
              trustName: trustDetails.trust_name,
              alias: trustDetails.alias,
              trustRegistered: trustDetails.trust_registered,
              trustType: trustDetails.trust_type,
              jurisdictionOfLaw: trustDetails.jurisdiction_of_law,
              registeredAddress: trustDetails.registered_address,
              trusteeName: trustDetails.trustee_name,
              trusteeType: trustDetails.trustee_type
            };
            
            console.log('🔍 Trust shareholderData after mapping:', shareholderData);
          }
        }

        shareholdersWithDetails.push(shareholderData);
      }

      return { 
        success: true, 
        data: shareholdersWithDetails,
        message: 'Shareholders fetched successfully from normalized structure'
      }

    } catch (error) {
      console.error('Error fetching shareholders:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to fetch shareholders'
      }
    }
  },

  // Save shareholders data to normalized structure
  saveShareholders: async (customerId, shareholders) => {
    try {
      console.log('👥 Saving shareholders for customer:', customerId)
      console.log('👥 Shareholders data:', shareholders)
      
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock shareholders save (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, message: 'Shareholders saved successfully (Mock Mode)' }
      }
      
      if (!shareholders || shareholders.length === 0) {
        return { success: true, message: 'No shareholders to save' }
      }
      
      // Save each shareholder to the normalized structure
      for (const shareholder of shareholders) {
        // 1. Insert into main customer_shareholders table
        const mainShareholderData = {
          customer_id: customerId,
          entity_type: shareholder.type,
          shareholding_percentage: shareholder.shareholding || null
        };
        
        const mainResult = await supabase
          .from('customer_shareholders')
          .insert(mainShareholderData)
          .select()
          .single();
        
        if (mainResult.error) {
          console.error('👥 Error inserting main shareholder:', mainResult.error)
          throw new Error(`Failed to insert main shareholder: ${mainResult.error.message}`)
        }
        
        const shareholderId = mainResult.data.id;
        console.log('👥 Main shareholder inserted with ID:', shareholderId);
        
        // 2. Insert into type-specific detail table
        if (shareholder.type === 'Natural Person') {
          const naturalPersonData = {
            shareholder_id: shareholderId,
            full_name: shareholder.fullName,
            alias: shareholder.alias,
            country_of_residence: shareholder.countryOfResidence,
            nationality: shareholder.nationality,
            date_of_birth: shareholder.dateOfBirth || null,
            place_of_birth: shareholder.placeOfBirth,
            phone: shareholder.phone,
            email: shareholder.email,
            address: shareholder.address,
            source_of_funds: shareholder.sourceOfFunds,
            source_of_wealth: shareholder.sourceOfWealth,
            occupation: shareholder.occupation,
            expected_income_range: shareholder.expectedIncome,
            pep_status: shareholder.pep,
            // Dual nationality & passport details
            dual_nationality: shareholder.dualNationalityCountry || shareholder.dualNationality || null,
            is_dual_nationality: shareholder.isDualNationality || false,
            dual_passport_number: shareholder.dualPassportNumber || null,
            dual_passport_issue_date: shareholder.dualPassportIssueDate || null,
            dual_passport_expiry_date: shareholder.dualPassportExpiryDate || null,
            // ID details
            id_type: shareholder.idType || null,
            id_number: shareholder.idNumber || null,
            id_issue_date: shareholder.idIssueDate || null,
            id_expiry_date: shareholder.idExpiryDate || null,
            // Flags
            is_director: shareholder.isDirector,
            is_ubo: shareholder.isUbo
          };
          
          const detailResult = await supabase
            .from('shareholder_natural_person_details')
            .insert(naturalPersonData);
          
          if (detailResult.error) {
            console.error('👥 Error inserting natural person details:', detailResult.error)
            throw new Error(`Failed to insert natural person details: ${detailResult.error.message}`)
          }
          
        } else if (shareholder.type === 'Legal Entities') {
          const legalEntityData = {
            shareholder_id: shareholderId,
            legal_name: shareholder.legalName,
            alias: shareholder.alias,
            date_of_incorporation: shareholder.dateOfIncorporation || null,
            country_of_incorporation: shareholder.countryOfIncorporation,
            entity_class: shareholder.entityClass,
            license_type: shareholder.licenseType,
            license_number: shareholder.licenseNumber,
            license_issue_date: shareholder.licenseIssueDate || null,
            license_expiry_date: shareholder.licenseExpiryDate || null,
            business_activity: Array.isArray(shareholder.businessActivity) 
              ? JSON.stringify(shareholder.businessActivity) 
              : shareholder.businessActivity,
            countries_of_operation: Array.isArray(shareholder.countriesOfOperation) 
              ? JSON.stringify(shareholder.countriesOfOperation) 
              : shareholder.countriesOfOperation,
            countries_source_of_funds: Array.isArray(shareholder.countriesSourceOfFunds) 
              ? JSON.stringify(shareholder.countriesSourceOfFunds) 
              : shareholder.countriesSourceOfFunds,
            source_of_funds: shareholder.sourceOfFunds,
            registered_office_address: shareholder.registeredOfficeAddress,
            email: shareholder.email,
            phone: shareholder.phone,
            other_details: shareholder.otherDetails
          };
          
          const detailResult = await supabase
            .from('shareholder_legal_entity_details')
            .insert(legalEntityData);
          
          if (detailResult.error) {
            console.error('👥 Error inserting legal entity details:', detailResult.error)
            throw new Error(`Failed to insert legal entity details: ${detailResult.error.message}`)
          }
          
        } else if (shareholder.type === 'Trust') {
          const trustData = {
            shareholder_id: shareholderId,
            trust_name: shareholder.trustName,
            alias: shareholder.alias,
            trust_registered: shareholder.trustRegistered,
            trust_type: shareholder.trustType,
            jurisdiction_of_law: shareholder.jurisdictionOfLaw,
            registered_address: shareholder.registeredAddress,
            trustee_name: shareholder.trusteeName,
            trustee_type: shareholder.trusteeType
          };
          
          const detailResult = await supabase
            .from('shareholder_trust_details')
            .insert(trustData);
          
          if (detailResult.error) {
            console.error('👥 Error inserting trust details:', detailResult.error)
            throw new Error(`Failed to insert trust details: ${detailResult.error.message}`)
          }
        }
      }
      
      return { 
        success: true, 
        message: 'Shareholders saved successfully to normalized structure'
      }
    } catch (error) {
      console.error('Error saving shareholders:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to save shareholders'
      }
    }
  },

  // Delete a single shareholder by ID
  deleteShareholderById: async (shareholderId) => {
    try {
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock shareholder delete (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, message: 'Shareholder deleted successfully (Mock Mode)' }
      }

      // First, get the shareholder type to know which detail table to delete from
      const { data: mainShareholder, error: fetchError } = await supabase
        .from('customer_shareholders')
        .select('entity_type')
        .eq('id', shareholderId)
        .single();

      if (fetchError) {
        console.error('👥 Error fetching shareholder for deletion:', fetchError)
        throw new Error(`Failed to fetch shareholder for deletion: ${fetchError.message}`)
      }

      // Delete from detail table first (due to foreign key constraints)
      if (mainShareholder.entity_type === 'Natural Person') {
        const { error: detailError } = await supabase
          .from('shareholder_natural_person_details')
          .delete()
          .eq('shareholder_id', shareholderId);
        
        if (detailError) {
          console.error('👥 Error deleting natural person details:', detailError)
          throw new Error(`Failed to delete natural person details: ${detailError.message}`)
        }
      } else if (mainShareholder.entity_type === 'Legal Entities') {
        const { error: detailError } = await supabase
          .from('shareholder_legal_entity_details')
          .delete()
          .eq('shareholder_id', shareholderId);
        
        if (detailError) {
          console.error('👥 Error deleting legal entity details:', detailError)
          throw new Error(`Failed to delete legal entity details: ${detailError.message}`)
        }
      } else if (mainShareholder.entity_type === 'Trust') {
        const { error: detailError } = await supabase
          .from('shareholder_trust_details')
          .delete()
          .eq('shareholder_id', shareholderId);
        
        if (detailError) {
          console.error('👥 Error deleting trust details:', detailError)
          throw new Error(`Failed to delete trust details: ${detailError.message}`)
        }
      }

      // Then delete from main table
      const { error: deleteError } = await supabase
        .from('customer_shareholders')
        .delete()
        .eq('id', shareholderId);

      if (deleteError) {
        console.error('👥 Error deleting main shareholder:', deleteError)
        throw new Error(`Failed to delete main shareholder: ${deleteError.message}`)
      }

      return { 
        success: true, 
        message: 'Shareholder deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting shareholder:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to delete shareholder'
      }
    }
  },

  // Delete shareholders for a customer
  deleteShareholders: async (customerId) => {
    try {
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock shareholders delete (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, message: 'Shareholders deleted successfully (Mock Mode)' }
      }

      // Get existing shareholders to delete from detail tables first
      const { data: existingShareholders, error: fetchError } = await supabase
        .from('customer_shareholders')
        .select('id')
        .eq('customer_id', customerId);

      if (fetchError) {
        console.error('👥 Error fetching shareholders for deletion:', fetchError)
        throw new Error(`Failed to fetch shareholders for deletion: ${fetchError.message}`)
      }

      if (existingShareholders && existingShareholders.length > 0) {
        // Delete from detail tables first (due to foreign key constraints)
        for (const shareholder of existingShareholders) {
          await supabase
            .from('shareholder_natural_person_details')
            .delete()
            .eq('shareholder_id', shareholder.id);
          await supabase
            .from('shareholder_legal_entity_details')
            .delete()
            .eq('shareholder_id', shareholder.id);
          await supabase
            .from('shareholder_trust_details')
            .delete()
            .eq('shareholder_id', shareholder.id);
        }
      }

      // Then delete from main table
      const { error: deleteError } = await supabase
        .from('customer_shareholders')
        .delete()
        .eq('customer_id', customerId);

      if (deleteError) {
        console.error('👥 Error deleting main shareholders:', deleteError)
        throw new Error(`Failed to delete main shareholders: ${deleteError.message}`)
      }

      return { 
        success: true, 
        message: 'Shareholders deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting shareholders:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to delete shareholders'
      }
    }
  },

  // Get directors for a customer
  getDirectors: async (customerId) => {
    try {
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock directors fetch (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, data: [], message: 'Directors fetched successfully (Mock Mode)' }
      }

      const { data: directors, error } = await supabase
        .from('customer_directors')
        .select('*')
        .eq('customer_id', customerId);

      if (error) {
        console.error('👔 Error fetching directors:', error)
        throw new Error(`Failed to fetch directors: ${error.message}`)
      }

      // Transform database fields to frontend format
      const transformedDirectors = directors.map(director => ({
        id: director.id,
        firstName: director.first_name,
        alias: director.alias,
        lastName: director.last_name,
        countryOfResidence: director.country_of_residence,
        nationality: director.nationality,
        dateOfBirth: director.date_of_birth,
        phone: director.phone,
        placeOfBirth: director.place_of_birth,
        email: director.email,
        address: director.address,
        city: director.city,
        occupation: director.occupation,
        pepStatus: director.pep_status,
        isCeo: director.is_ceo,
        isRepresentative: director.is_representative,
        dualNationality: director.dual_nationality
      }));

      return { 
        success: true, 
        data: transformedDirectors,
        message: 'Directors fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching directors:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to fetch directors'
      }
    }
  },

  // Get a single director by ID
  getDirectorById: async (directorId) => {
    try {
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock director fetch (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, data: {}, message: 'Director fetched successfully (Mock Mode)' }
      }

      const { data: director, error } = await supabase
        .from('customer_directors')
        .select('*')
        .eq('id', directorId)
        .single();

      if (error) {
        console.error('👔 Error fetching director:', error)
        throw new Error(`Failed to fetch director: ${error.message}`)
      }

      // Transform database fields to frontend format
      const transformedDirector = {
        id: director.id,
        firstName: director.first_name,
        alias: director.alias,
        lastName: director.last_name,
        countryOfResidence: director.country_of_residence,
        nationality: director.nationality,
        dateOfBirth: director.date_of_birth,
        phone: director.phone,
        placeOfBirth: director.place_of_birth,
        email: director.email,
        address: director.address,
        city: director.city,
        occupation: director.occupation,
        pepStatus: director.pep_status,
        isCeo: director.is_ceo,
        isRepresentative: director.is_representative,
        dualNationality: director.dual_nationality
      };

      return { 
        success: true, 
        data: transformedDirector,
        message: 'Director fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching director:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to fetch director'
      }
    }
  },

  // Delete a single director by ID
  deleteDirectorById: async (directorId) => {
    try {
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock director delete (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, message: 'Director deleted successfully (Mock Mode)' }
      }

      const { error } = await supabase
        .from('customer_directors')
        .delete()
        .eq('id', directorId);

      if (error) {
        console.error('👔 Error deleting director:', error)
        throw new Error(`Failed to delete director: ${error.message}`)
      }

      return { 
        success: true, 
        message: 'Director deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting director:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to delete director'
      }
    }
  },

  // Save directors data
  saveDirectors: async (customerId, directors) => {
    try {
      console.log('👔 Saving directors for customer:', customerId)
      console.log('👔 Directors data:', directors)
      console.log('👔 First director fields:', directors[0] ? Object.keys(directors[0]) : 'No directors')
      console.log('👔 First director values:', directors[0] ? Object.values(directors[0]) : 'No directors')
      
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock directors save (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, message: 'Directors saved successfully (Mock Mode)' }
      }
      
      if (!directors || directors.length === 0) {
        return { success: true, message: 'No directors to save' }
      }
      
      // Real Supabase implementation
      const directorsPayload = directors.map(director => ({
        customer_id: customerId,
        first_name: director.firstName,
        last_name: director.lastName,
        alias: director.alias,
        country_of_residence: director.countryOfResidence,
        nationality: director.nationality,
        date_of_birth: director.dateOfBirth || null,
        phone: director.phone,
        place_of_birth: director.placeOfBirth,
        email: director.email,
        address: director.address,
        city: director.city,
        occupation: director.occupation,
        pep_status: director.pepStatus,
        is_ceo: director.isCeo,
        is_representative: director.isRepresentative,
        dual_nationality: director.dualNationality
      }))
      
      console.log('👔 Final directors payload:', directorsPayload)
      
      const result = await supabase
        .from('customer_directors')
        .insert(directorsPayload)
        .select()
      
      console.log('👔 Supabase insert result:', result)
      
      if (result.error) {
        console.error('👔 Supabase insert error:', result.error)
        throw new Error(result.error.message)
      }
      
      return { 
        success: true, 
        data: result.data,
        message: 'Directors saved successfully'
      }
    } catch (error) {
      console.error('Error saving directors:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to save directors'
      }
    }
  },

  // Save bank details data
  saveBankDetails: async (customerId, bankDetails) => {
    try {
      console.log('🏦 Saving bank details for customer:', customerId)
      console.log('🏦 Bank details data:', bankDetails)
      console.log('🏦 First bank detail fields:', bankDetails[0] ? Object.keys(bankDetails[0]) : 'No bank details')
      console.log('🏦 First bank detail values:', bankDetails[0] ? Object.values(bankDetails[0]) : 'No bank details')
      
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock bank details save (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, message: 'Bank details saved successfully (Mock Mode)' }
      }
      
      if (!bankDetails || bankDetails.length === 0) {
        return { success: true, message: 'No bank details to save' }
      }
      
      // Real Supabase implementation
      const bankDetailsPayload = bankDetails.map(bankDetail => ({
        customer_id: customerId,
        bank_name: bankDetail.bankName,
        alias: bankDetail.alias,
        account_type: bankDetail.accountType,
        currency: bankDetail.currency,
        bank_account_details: bankDetail.bankAccountDetails,
        account_number: bankDetail.accountNumber,
        iban: bankDetail.iban,
        swift: bankDetail.swift,
        mode_of_signatory: bankDetail.modeOfSignatory,
        internet_banking: bankDetail.internetBanking,
        bank_signatories: bankDetail.bankSignatories
      }))
      
      console.log('🏦 Final bank details payload:', bankDetailsPayload)
      
      const result = await supabase
        .from('customer_bank_details')
        .insert(bankDetailsPayload)
        .select()
      
      console.log('🏦 Supabase insert result:', result)
      
      if (result.error) {
        console.error('🏦 Supabase insert error:', result.error)
        throw new Error(result.error.message)
      }
      
      return { 
        success: true, 
        data: result.data,
        message: 'Bank details saved successfully'
      }
    } catch (error) {
      console.error('Error saving bank details:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to save bank details'
      }
    }
  },

  // Get bank details by customer ID
  getBankDetails: async (customerId) => {
    try {
      console.log('🏦 Fetching bank details for customer:', customerId)
      
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock bank details fetch (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return {
          success: true,
          data: [
            {
              bank_name: 'Mock Bank',
              account_type: 'Savings',
              currency: 'USD',
              account_number: '1234567890',
              iban: 'US12345678901234567890',
              swift: 'MOCKUS33',
              mode_of_signatory: 'Single',
              internet_banking: true
            }
          ]
        }
      }
      
      // Real Supabase implementation
      const { data, error } = await supabase
        .from('customer_bank_details')
        .select('*')
        .eq('customer_id', customerId)
      
      if (error) {
        throw new Error(error.message)
      }
      
      console.log('🏦 Bank details fetched:', data)
      return { 
        success: true, 
        data: data || []
      }
    } catch (error) {
      console.error('Error fetching bank details:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to fetch bank details'
      }
    }
  },

  // Save UBOs data
  saveUbos: async (customerId, ubos) => {
    try {
      console.log('👤 Saving UBOs for customer:', customerId)
      console.log('👤 UBOs data:', ubos)
      
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock UBOs save (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, message: 'UBOs saved successfully (Mock Mode)' }
      }
      
      if (!ubos || ubos.length === 0) {
        return { success: true, message: 'No UBOs to save' }
      }
      
      // Real Supabase implementation
      const ubosPayload = ubos.map(ubo => ({
        customer_id: customerId,
        full_name: ubo.fullName || '',
        alias: ubo.alias || '',
        country_of_residence: ubo.countryOfResidence || '',
        nationality: ubo.nationality || '',
        date_of_birth: ubo.dateOfBirth || null,
        place_of_birth: ubo.placeOfBirth || '',
        phone: ubo.phone || '',
        email: ubo.email || '',
        address: ubo.address || '',
        source_of_funds: ubo.sourceOfFunds || '',
        source_of_wealth: ubo.sourceOfWealth || '',
        occupation: ubo.occupation || '',
        expected_income: ubo.expectedIncome || '',
        pep: ubo.pep || '',
        shareholding: ubo.shareholding ? parseFloat(ubo.shareholding) : null,
        dual_nationality: ubo.dualNationality || ''
      }))
      
      console.log('👤 Final UBOs payload:', ubosPayload)
      
      const result = await supabase
        .from('customer_ubos')
        .insert(ubosPayload)
        .select()
      
      console.log('👤 Supabase insert result:', result)
      
      if (result.error) {
        console.error('👤 Supabase insert error:', result.error)
        throw new Error(result.error.message)
      }
      
      return { 
        success: true, 
        data: result.data,
        message: 'UBOs saved successfully'
      }
    } catch (error) {
      console.error('Error saving UBOs:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to save UBOs'
      }
    }
  },

  // Get UBOs for a customer
  getUbos: async (customerId) => {
    try {
      console.log('👤 Fetching UBOs for customer:', customerId)
      
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock UBOs fetch (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, data: [], message: 'Mock UBOs fetched (Mock Mode)' }
      }
      
      const { data: ubos, error } = await supabase
        .from('customer_ubos')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('👤 Error fetching UBOs:', error)
        throw new Error(error.message)
      }
      
      // Transform database fields to frontend format
      const transformedUbos = ubos.map(ubo => ({
        id: ubo.id,
        fullName: ubo.full_name || '',
        alias: ubo.alias || '',
        countryOfResidence: ubo.country_of_residence || '',
        nationality: ubo.nationality || '',
        dateOfBirth: ubo.date_of_birth || '',
        placeOfBirth: ubo.place_of_birth || '',
        phone: ubo.phone || '',
        email: ubo.email || '',
        address: ubo.address || '',
        sourceOfFunds: ubo.source_of_funds || '',
        sourceOfWealth: ubo.source_of_wealth || '',
        occupation: ubo.occupation || '',
        expectedIncome: ubo.expected_income || '',
        pep: ubo.pep || '',
        shareholding: ubo.shareholding || '',
        dualNationality: ubo.dual_nationality || ''
      }))
      
      console.log('👤 Transformed UBOs:', transformedUbos)
      
      return { 
        success: true, 
        data: transformedUbos,
        message: 'UBOs fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching UBOs:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to fetch UBOs'
      }
    }
  },

  // Get UBO by ID
  getUboById: async (uboId) => {
    try {
      console.log('👤 Fetching UBO by ID:', uboId)
      
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock UBO fetch (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, data: null, message: 'Mock UBO fetched (Mock Mode)' }
      }
      
      const { data: ubo, error } = await supabase
        .from('customer_ubos')
        .select('*')
        .eq('id', uboId)
        .single()
      
      if (error) {
        console.error('👤 Error fetching UBO:', error)
        throw new Error(error.message)
      }
      
      if (!ubo) {
        return { success: false, error: 'UBO not found' }
      }
      
      // Transform database fields to frontend format
      const transformedUbo = {
        id: ubo.id,
        fullName: ubo.full_name || '',
        alias: ubo.alias || '',
        countryOfResidence: ubo.country_of_residence || '',
        nationality: ubo.nationality || '',
        dateOfBirth: ubo.date_of_birth || '',
        placeOfBirth: ubo.place_of_birth || '',
        phone: ubo.phone || '',
        email: ubo.email || '',
        address: ubo.address || '',
        sourceOfFunds: ubo.source_of_funds || '',
        sourceOfWealth: ubo.source_of_wealth || '',
        occupation: ubo.occupation || '',
        expectedIncome: ubo.expected_income || '',
        pep: ubo.pep || '',
        shareholding: ubo.shareholding ? ubo.shareholding.toString() : '',
        dualNationality: ubo.dual_nationality || ''
      }
      
      return { 
        success: true, 
        data: transformedUbo,
        message: 'UBO fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching UBO:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to fetch UBO'
      }
    }
  },

  // Delete UBO by ID
  deleteUboById: async (uboId) => {
    try {
      console.log('👤 Deleting UBO by ID:', uboId)
      
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock UBO delete (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, message: 'UBO deleted successfully (Mock Mode)' }
      }
      
      const { error } = await supabase
        .from('customer_ubos')
        .delete()
        .eq('id', uboId)
      
      if (error) {
        console.error('👤 Error deleting UBO:', error)
        throw new Error(error.message)
      }
      
      return { 
        success: true, 
        message: 'UBO deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting UBO:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to delete UBO'
      }
    }
  },

  // Check if core system ID already exists
  checkCoreSystemIdExists: async (coreSystemId) => {
    try {
      console.log('🔍 Checking if core system ID exists:', coreSystemId)
      
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock core system ID check (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 300))
        return { exists: false, message: 'Mock mode - assuming ID is unique' }
      }
      
      // Real Supabase implementation
      const { data, error } = await supabase
        .from('customers')
        .select('id')
        .eq('core_system_id', coreSystemId)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(error.message)
      }
      
      const exists = !!data
      
      return { 
        exists, 
        message: exists ? 'Core System ID already exists' : 'Core System ID is available'
      }
    } catch (error) {
      console.error('Error checking core system ID:', error)
      return { 
        exists: false, 
        error: error.message || 'Failed to check core system ID'
      }
    }
  },

  // Calculate and update risk score with complete customer data
  calculateAndUpdateRiskScore: async (customerId, completeCustomerData) => {
    try {
      console.log('🔄 Calculating risk score for customer:', customerId)
      console.log('📊 Customer data structure:', {
        customerType: completeCustomerData?.customer_type,
        hasNaturalPersonDetails: !!completeCustomerData?.natural_person_details,
        hasLegalEntityDetails: !!completeCustomerData?.legal_entity_details,
        hasShareholders: !!(completeCustomerData?.shareholders && completeCustomerData.shareholders.length > 0)
      })
      
      // Transform nested data structure to flat structure expected by calculateRiskScore
      let flattenedData = {
        customerType: completeCustomerData.customer_type || completeCustomerData.customer_type,
        customer_type: completeCustomerData.customer_type,
        ...completeCustomerData
      }
      
      // Flatten natural person details
      if (completeCustomerData.natural_person_details) {
        const np = completeCustomerData.natural_person_details
        flattenedData = {
          ...flattenedData,
          profession: np.profession,
          nationality: np.nationality,
          residencyStatus: np.residencystatus || np.residency_status,
          dualNationality: np.dualinationality || np.dual_nationality,
          isDualNationality: np.isdualnationality || np.is_dual_nationality,
          occupation: np.occupation,
          pep: np.pep || np.pep_status,
          countryOfBirth: np.countryofbirth || np.country_of_birth,
          sourceOfFunds: np.sourceoffunds || np.source_of_funds
        }
      }
      
      // Flatten legal entity details
      if (completeCustomerData.legal_entity_details) {
        const le = completeCustomerData.legal_entity_details
        flattenedData = {
          ...flattenedData,
          businessActivity: le.businessactivity || le.business_activity,
          countryOfIncorporation: le.countryofincorporation || le.country_of_incorporation,
          licenseType: le.licensetype || le.license_type,
          countriesSourceOfFunds: le.countriessourceoffunds || le.countries_source_of_funds,
          countriesOfOperation: le.countriesofoperation || le.countries_of_operation,
          jurisdiction: le.jurisdiction,
          sourceOfFunds: le.sourceoffunds || le.source_of_funds,
          residencyStatus: le.residencystatus || le.residency_status,
          licenseCategory: le.licensecategory || le.license_category
        }
      }
      
      // Transform shareholders to expected format
      if (completeCustomerData.shareholders && Array.isArray(completeCustomerData.shareholders)) {
        flattenedData.shareholders = completeCustomerData.shareholders.map(sh => {
          const shareholder = {
            shareholderType: sh.type || sh.entity_type,
            type: sh.type || sh.entity_type,
            entity_type: sh.entity_type || sh.type,
            ...sh
          }
          
          // Add natural person shareholder fields
          if (sh.type === 'Natural Person' || sh.entity_type === 'Natural Person') {
            shareholder.countryOfResidence = sh.countryOfResidence || sh.country_of_residence
            shareholder.nationality = sh.nationality
            shareholder.placeOfBirth = sh.placeOfBirth || sh.place_of_birth
            shareholder.dualNationality = sh.dualNationality || sh.dual_nationality
            shareholder.isDualNationality = sh.isDualNationality || sh.is_dual_nationality
            shareholder.occupation = sh.occupation
            shareholder.pep = sh.pep || sh.pep_status
            shareholder.sourceOfFunds = sh.sourceOfFunds || sh.source_of_funds
          }
          
          // Add legal entity shareholder fields
          if (sh.type === 'Legal Entities' || sh.entity_type === 'Legal Entities') {
            shareholder.businessActivity = sh.businessActivity || sh.business_activity
            shareholder.countryOfIncorporation = sh.countryOfIncorporation || sh.country_of_incorporation
            shareholder.licenseType = sh.licenseType || sh.license_type
            shareholder.countriesSourceOfFunds = sh.countriesSourceOfFunds || sh.countries_source_of_funds
            shareholder.countriesOfOperation = sh.countriesOfOperation || sh.countries_of_operation
            shareholder.sourceOfFunds = sh.sourceOfFunds || sh.source_of_funds
          }
          
          return shareholder
        })
      }
      
      console.log('📋 Flattened data for risk calculation:', {
        customerType: flattenedData.customerType || flattenedData.customer_type,
        hasShareholders: !!(flattenedData.shareholders && flattenedData.shareholders.length > 0),
        sampleFields: {
          nationality: flattenedData.nationality,
          occupation: flattenedData.occupation,
          businessActivity: flattenedData.businessActivity
        }
      })
      
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock risk calculation (Supabase not configured)')
        const riskResult = await calculateRiskScore(flattenedData)
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        return { 
          success: true, 
          data: { risk_score: riskResult.score, risk_level: riskResult.level },
          message: 'Risk score calculated successfully (Mock Mode)'
        }
      }
      
      // Real Supabase implementation
      const riskResult = await calculateRiskScore(flattenedData)
      
      console.log('📊 Risk calculation result:', {
        score: riskResult.score,
        level: riskResult.level,
        triggeredRules: riskResult.triggeredRules?.length || 0
      })
      
      // Determine due diligence level based on risk level
      // Low, Medium Low, or Medium → Simplified Customer Due Diligence
      // Medium High → Customer Due Diligence
      // High → Enhanced Customer Due Diligence
      let dueDiligenceLevel = 'Simplified Customer Due Diligence'
      
      const riskLevel = riskResult.level
      if (riskLevel === 'High') {
        dueDiligenceLevel = 'Enhanced Customer Due Diligence'
      } else if (riskLevel === 'Medium High') {
        dueDiligenceLevel = 'Customer Due Diligence'
      } else if (riskLevel === 'Low' || riskLevel === 'Medium Low' || riskLevel === 'Medium') {
        dueDiligenceLevel = 'Simplified Customer Due Diligence'
      }
      
      // Update customer with calculated values (keeping KYC status as Pending)
      // Round risk score to 2 decimal places for storage (database column is NUMERIC(5,2))
      const roundedScore = Math.round(riskResult.score * 100) / 100
      
      const updateData = {
        risk_score: roundedScore,
        risk_level: riskResult.level,
        due_diligence_level: dueDiligenceLevel,
        updated_at: new Date().toISOString()
      }
      
      console.log('💾 Updating customer with risk data:', updateData)
      
      const result = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', customerId)
        .select()
      
      if (result.error) {
        console.error('❌ Database update error:', result.error)
        throw new Error(result.error.message)
      }
      
      console.log('✅ Customer updated successfully:', result.data?.[0])
      
      return { 
        success: true, 
        data: updateData,
        message: 'Risk score calculated and updated successfully'
      }
    } catch (error) {
      console.error('Error calculating and updating risk score:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to calculate and update risk score'
      }
    }
  },

  // Delete customer and all related data
  deleteCustomer: async (customerId) => {
    try {
      console.log('🗑️ Deleting customer and all related data:', customerId)
      
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation
        console.log('🔧 Using mock customer deletion (Supabase not configured)')
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        return { 
          success: true, 
          message: 'Customer deleted successfully (Mock Mode)'
        }
      }
      
      // Real Supabase implementation - Intelligent approach
      // First, check what data actually exists for this customer
      
      // 1. Get customer type and check what data exists
      const { data: customer, error: customerFetchError } = await supabase
        .from('customers')
        .select('customer_type')
        .eq('id', customerId)
        .single()
      
      if (customerFetchError) {
        console.error('Error fetching customer type:', customerFetchError)
        throw new Error(`Failed to fetch customer type: ${customerFetchError.message}`)
      }
      
      console.log('🔍 Customer type:', customer.customer_type)
      
      // 2. Check if customer has UBOs
      const { data: uboCheck, error: uboCheckError } = await supabase
        .from('customer_ubos')
        .select('id')
        .eq('customer_id', customerId)
        .limit(1)
      
      if (uboCheckError) {
        console.error('Error checking UBOs:', uboCheckError)
        throw new Error(`Failed to check UBOs: ${uboCheckError.message}`)
      }
      
      const hasUbos = uboCheck && uboCheck.length > 0
      console.log('🔍 Customer has UBOs:', hasUbos)
      
      // 3. Check if customer has shareholders
      const { data: shareholderCheck, error: shareholderCheckError } = await supabase
        .from('customer_shareholders')
        .select('id')
        .eq('customer_id', customerId)
        .limit(1)
      
      if (shareholderCheckError) {
        console.error('Error checking shareholders:', shareholderCheckError)
        throw new Error(`Failed to check shareholders: ${shareholderCheckError.message}`)
      }
      
      const hasShareholders = shareholderCheck && shareholderCheck.length > 0
      console.log('🔍 Customer has shareholders:', hasShareholders)
      
      // 4. Check if customer has directors
      const { data: directorCheck, error: directorCheckError } = await supabase
        .from('customer_directors')
        .select('id')
        .eq('customer_id', customerId)
        .limit(1)
      
      if (directorCheckError) {
        console.error('Error checking directors:', directorCheckError)
        throw new Error(`Failed to check directors: ${directorCheckError.message}`)
      }
      
      const hasDirectors = directorCheck && directorCheck.length > 0
      console.log('🔍 Customer has directors:', hasDirectors)
      
      // 5. Check if customer has bank details
      const { data: bankCheck, error: bankCheckError } = await supabase
        .from('customer_bank_details')
        .select('id')
        .eq('customer_id', customerId)
        .limit(1)
      
      if (bankCheckError) {
        console.error('Error checking bank details:', bankCheckError)
        throw new Error(`Failed to check bank details: ${bankCheckError.message}`)
      }
      
      const hasBankDetails = bankCheck && bankCheck.length > 0
      console.log('🔍 Customer has bank details:', hasBankDetails)
      
      // Now proceed with intelligent deletion based on what exists
      
      // 6. Delete UBOs only if they exist
      if (hasUbos) {
        console.log('🗑️ Deleting UBOs...')
        const { error: uboError } = await supabase
          .from('customer_ubos')
          .delete()
          .eq('customer_id', customerId)
        
        if (uboError) {
          console.error('Error deleting UBOs:', uboError)
          throw new Error(`Failed to delete UBOs: ${uboError.message}`)
        }
        console.log('✅ UBOs deleted successfully')
      } else {
        console.log('⏭️ Skipping UBOs deletion - no UBOs exist')
      }
      
      // 7. Delete bank details only if they exist
      if (hasBankDetails) {
        console.log('🗑️ Deleting bank details...')
        const { error: bankError } = await supabase
          .from('customer_bank_details')
          .delete()
          .eq('customer_id', customerId)
        
        if (bankError) {
          console.error('Error deleting bank details:', bankError)
          throw new Error(`Failed to delete bank details: ${bankError.message}`)
        }
        console.log('✅ Bank details deleted successfully')
      } else {
        console.log('⏭️ Skipping bank details deletion - no bank details exist')
      }
      
      // 8. Delete directors only if they exist
      if (hasDirectors) {
        console.log('🗑️ Deleting directors...')
        const { error: directorError } = await supabase
          .from('customer_directors')
          .delete()
          .eq('customer_id', customerId)
        
        if (directorError) {
          console.error('Error deleting directors:', directorError)
          throw new Error(`Failed to delete directors: ${directorError.message}`)
        }
        console.log('✅ Directors deleted successfully')
      } else {
        console.log('⏭️ Skipping directors deletion - no directors exist')
      }
      
      // 9. Delete shareholders and their details only if they exist
      if (hasShareholders) {
        console.log('🗑️ Deleting shareholders and details...')
        
        // Get all shareholder IDs for this customer
        const { data: shareholders, error: shareholderFetchError } = await supabase
          .from('customer_shareholders')
          .select('id')
          .eq('customer_id', customerId)
        
        if (shareholderFetchError) {
          console.error('Error fetching shareholders:', shareholderFetchError)
          throw new Error(`Failed to fetch shareholders: ${shareholderFetchError.message}`)
        }
        
        if (shareholders && shareholders.length > 0) {
          const shareholderIds = shareholders.map(s => s.id)
          console.log(`🔍 Found ${shareholders.length} shareholders to delete`)
          
          // Delete shareholder detail records first
          // Delete natural person details
          const { error: npError } = await supabase
            .from('shareholder_natural_person_details')
            .delete()
            .in('shareholder_id', shareholderIds)
          
          if (npError) {
            console.error('Error deleting natural person details:', npError)
            throw new Error(`Failed to delete natural person details: ${npError.message}`)
          }
          console.log('✅ Shareholder natural person details deleted')
          
          // Delete legal entity details
          const { error: leError } = await supabase
            .from('shareholder_legal_entity_details')
            .delete()
            .in('shareholder_id', shareholderIds)
          
          if (leError) {
            console.error('Error deleting legal entity details:', leError)
            throw new Error(`Failed to delete legal entity details: ${leError.message}`)
          }
          console.log('✅ Shareholder legal entity details deleted')
          
          // Delete trust details
          const { error: trustError } = await supabase
            .from('shareholder_trust_details')
            .delete()
            .in('shareholder_id', shareholderIds)
          
          if (trustError) {
            console.error('Error deleting trust details:', trustError)
            throw new Error(`Failed to delete trust details: ${trustError.message}`)
          }
          console.log('✅ Shareholder trust details deleted')
        }
        
        // Now delete the main shareholder records
        const { error: shareholderError } = await supabase
          .from('customer_shareholders')
          .delete()
          .eq('customer_id', customerId)
        
        if (shareholderError) {
          console.error('Error deleting shareholders:', shareholderError)
          throw new Error(`Failed to delete shareholders: ${shareholderError.message}`)
        }
        console.log('✅ Main shareholder records deleted')
      } else {
        console.log('⏭️ Skipping shareholders deletion - no shareholders exist')
      }
      
      // 10. Delete customer detail records based on customer type
      if (customer.customer_type === 'Natural Person') {
        console.log('🗑️ Deleting natural person details...')
        const { error: npDetailError } = await supabase
          .from('natural_person_details')
          .delete()
          .eq('customer_id', customerId)
        
        if (npDetailError) {
          console.error('Error deleting natural person details:', npDetailError)
          throw new Error(`Failed to delete natural person details: ${npDetailError.message}`)
        }
        console.log('✅ Natural person details deleted')
      } else if (customer.customer_type === 'Legal Entities') {
        console.log('🗑️ Deleting legal entity details...')
        const { error: leDetailError } = await supabase
          .from('legal_entity_details')
          .delete()
          .eq('customer_id', customerId)
        
        if (leDetailError) {
          console.error('Error deleting legal entity details:', leDetailError)
          throw new Error(`Failed to delete legal entity details: ${leDetailError.message}`)
        }
        console.log('✅ Legal entity details deleted')
      } else {
        console.log('⚠️ Unknown customer type:', customer.customer_type)
      }
      
      // 11. Finally, delete the main customer record
      console.log('🗑️ Deleting main customer record...')
      const { error: customerError } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)
      
      if (customerError) {
        console.error('Error deleting customer:', customerError)
        throw new Error(`Failed to delete customer: ${customerError.message}`)
      }
      console.log('✅ Main customer record deleted')
      
      console.log('🎉 Customer and all related data deleted successfully!')
      
      return { 
        success: true, 
        message: 'Customer and all related data deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to delete customer'
      }
    }
  }
}
