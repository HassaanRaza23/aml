# 🚀 AML Platform - Quick Start Guide

## ⚡ Get Your Platform Running in 5 Minutes!

### Step 1: Set Up Environment Variables
Create a `.env` file in your project root:

```bash
# Create .env file
touch .env
```

Add your Supabase credentials:
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 2: Get Your Supabase Credentials
1. Go to [supabase.com](https://supabase.com)
2. Open your project dashboard
3. Go to Settings → API
4. Copy the Project URL and anon key
5. Paste them in your `.env` file

### Step 3: Start the Application
```bash
npm start
```

### Step 4: Test the Integration
1. **Open your browser** to `http://localhost:3000`
2. **Go to Customer Onboarding** and create a test customer
3. **Check your Supabase dashboard** to see the data
4. **Verify risk scores** are calculated automatically
5. **Check if cases** are created for high-risk customers

## 🎯 What's Working Now

### ✅ Database Integration
- All tables are connected
- Real data is being saved
- Audit logs are working

### ✅ Risk Assessment
- File-based rules are active
- Risk scores are calculated automatically
- Cases are created for high-risk items

### ✅ Transaction Monitoring
- Transactions are recorded
- Risk assessment is performed
- Alerts are generated

### ✅ Screening
- Instant screening works
- Results are stored
- Matches trigger cases

### ✅ Case Management
- Cases are created automatically
- Case details are tracked
- Resolution workflow works

## 🔧 Quick Fixes

### If you get "Missing environment variables":
```bash
# Check your .env file exists
ls -la .env

# Make sure it has the right variables
cat .env
```

### If you get "Permission denied":
1. Check your Supabase RLS policies
2. Make sure your anon key is correct
3. Verify your project URL

### If the app doesn't start:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ **App starts** without errors
2. ✅ **Customer creation** saves to database
3. ✅ **Risk scores** appear automatically
4. ✅ **Cases are created** for high-risk items
5. ✅ **Audit logs** show all activities

## 🚀 Next Steps

1. **Add real data** - Create some test customers
2. **Test all modules** - Try screening and transactions
3. **Customize rules** - Modify risk rules in `src/data/`
4. **Add real APIs** - Replace simulated screening
5. **Deploy** - Move to production

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify your Supabase credentials
3. Ensure all tables were created successfully
4. Check the network tab for API calls

Your AML platform is now **LIVE** and ready for real AML workflows! 🎯
