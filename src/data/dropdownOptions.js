// dropdownOptions.js

// Direct Dropdown Arrays
export const customerTypes = ["Natural Person", "Legal Entities"];

export const professions = [
  "Pink Collar", "White Collar", "Blue Collar", "Red Collar", "Partner"
];

export const idTypes = ["Emirates ID", "Passport", "GCC National ID"];

export const pepOptions = ["Yes", "No"];

export const residencyStatuses = ["Resident", "Non-Resident"];

export const channelOptions = ["Face to Face", "Non Face to Face"];

export const genderOptions = ["Male", "Female"];

export const sourceOfWealth = ["Inheritance", "Dividend"];

export const sourceOfFunds = [
  "Salary", "Personal Savings", "End of Services Funds",
  "Loan from Friends and Family", "Loan from Financial Institutions",
  "Funds From Schemes and Raffles", "Funds from Dividend Payouts",
  "Other sources", "LOANS", "INVESTMENTS", "Bank Statement",
  "Bank - Cash withdrawal Slip", "Business Proceeds", "Bonuses",
  "Pension", "Retirement benefit payouts", "Interest income on bonds",
  "Dividend income", "Return on investments",
  "Proceeds of real-estate sale transaction", "Inheritance or gifts",
  "Winnings from lottery or casino", "Lawsuit settlement",
  "Divorce settlement", "Sale of artworks", "Sale of a fixed asset",
  "Sale of products and services", "Business income",
  "Sale of investments and properties", "Shares and securities",
  "Royalties", "Patents"
];

export const transactionProducts = [
  "Standard Project", "Capital Markets", "Commercial Dispute Resolution Notes",
  "Commercial", "Competition", "Corporate Intelligence", "Employment",
  "Criminal Litigation", "Gold Bars", "Silver Bars", "Gold Grains", "Silver Grains",
  "GOLD", "SILVER", "DIAMOND", "JEWELLERY", "OffPlan property",
  "Secondary property", "PLATINUM"
];

// Legal Entity specific dropdown options
export const businessActivities = [
  "Trading", "Manufacturing", "Services", "Real Estate", "Financial Services",
  "Technology", "Healthcare", "Education", "Consulting", "Retail", "Wholesale",
  "Construction", "Transportation", "Hospitality", "Agriculture", "Mining",
  "Energy", "Media", "Entertainment", "Other"
];

export const licenseTypes = [
  "Commercial License", "Industrial License", "Professional License", 
  "Civil Organization License", "Service License", "Trading License", 
  "Business License", "Certificate of Incorporation"
];

export const licenseCategories = [
  "Category A", "Category B", "Category C", "Category D", "Category E",
  "Special Category", "General Category", "Professional Category"
];

export const jurisdictions = [
  "UAE", "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Umm Al Quwain",
  "Ras Al Khaimah", "Fujairah", "Free Zone", "Offshore", "Other"
];

// Additional dropdown options for shareholders (existing)
export const entityTypes = ["Natural Person", "Legal Entities", "Trust"];
export const entityClassTypes = ["Class A", "Class B"];
export const trustTypes = ["Discretionary", "Charitable", "Purpose"];
export const trusteeTypes = ["Natural Person", "Legal Entities"];
export const yesNoOptions = ["Yes", "No"];

// Imports from other files
export { countries } from "./countries";        // Includes name, code, phone
export { occupations } from "./occupations";    // Large occupation list // Optional phone-only country list
