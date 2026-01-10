// Transaction Activity Rules Dropdown Options
// This file contains all dropdown options for the Transaction Activity Rules form

export const transactionTypeOptions = [
  { value: "Any", label: "Any" },
  { value: "Transaction", label: "Transaction" },
];

export const parameterOptions = [
  { value: "Any", label: "Any" },
  { value: "High Risk Country", label: "High Risk Country" },
  { value: "High Risk Nationality", label: "High Risk Nationality" },
  { value: "Cash Payment", label: "Cash Payment" },
  { value: "Id Expired", label: "Id Expired" },
  { value: "Sanction Match", label: "Sanction Match" },
  { value: "High Risk Business Activity / Profession", label: "High Risk Business Activity / Profession" },
  { value: "High Risk", label: "High Risk" },
  { value: "Match in UN List or Local List", label: "Match in UN List or Local List" },
  { value: "Non Resident", label: "Non Resident" },
  { value: "Done By High Risk Nationality", label: "Done By High Risk Nationality" },
  { value: "High Value Cash Transaction - Individual", label: "High Value Cash Transaction - Individual" },
  { value: "High Value Cash Transaction - Corporate", label: "High Value Cash Transaction - Corporate" },
  { value: "High Value Cumulative - Individual 30 Days", label: "High Value Cumulative - Individual 30 Days" },
  { value: "High Value Cumulative - Corporate 30 Days", label: "High Value Cumulative - Corporate 30 Days" },
  { value: "High Value Cumulative - Individual 90 Days", label: "High Value Cumulative - Individual 90 Days" },
  { value: "High Value Cumulative - Corporate 90 Days", label: "High Value Cumulative - Corporate 90 Days" },
  { value: "Transaction Count Individual", label: "Transaction Count Individual" },
  { value: "Transaction Count Corporate", label: "Transaction Count Corporate" },
  { value: "Customer Red Flagged", label: "Customer Red Flagged" },
  { value: "Splitting of Transactions", label: "Splitting of Transactions" },
  { value: "Gold Exchange Above Limit ", label: "Gold Exchange Above Limit " },
  { value: "PEP/FPEP Individual Transactions", label: "PEP/FPEP Individual Transactions" },
  { value: "PEP/FPEP UBO Transactions", label: "PEP/FPEP UBO Transactions" },
  { value: "Below the Radar", label: "Below the Radar" },
  { value: "Purpose Of Txn - Gift", label: "Purpose Of Txn - Gift" },
  { value: "Customers Reported - STR/ISTR", label: "Customers Reported - STR/ISTR" },
  { value: "Customer in Internal Watchlist", label: "Customer in Internal Watchlist" },
];

export const countMatchTypeOptions = [
  { value: "Equal To", label: "Equal To" },
  { value: "Not Equal To", label: "Not Equal To" },
  { value: "Greater Than", label: "Greater Than" },
  { value: "Less Than", label: "Less Than" },
  { value: "Greater Than or Equal To", label: "Greater Than or Equal To" },
  { value: "Less Than or Equal To", label: "Less Than or Equal To" },
];

export const thresholdMatchTypeOptions = [
  { value: "Equal To", label: "Equal To" },
  { value: "Not Equal To", label: "Not Equal To" },
  { value: "Greater Than", label: "Greater Than" },
  { value: "Less Than", label: "Less Than" },
  { value: "Greater Than or Equal To", label: "Greater Than or Equal To" },
  { value: "Less Than or Equal To", label: "Less Than or Equal To" },
  { value: "Each Transaction Equal to", label: "Each Transaction Equal to" },
  { value: "Each Transaction Not Equal to", label: "Each Transaction Not Equal to" },
  { value: "Each Transaction Greater Than", label: "Each Transaction Greater Than" },
  { value: "Each Transaction Less Than", label: "Each Transaction Less Than" },
  { value: "Each Transaction Greater Than or Equal to", label: "Each Transaction Greater Than or Equal to" },
  { value: "Each Transaction Less Than or Equal to", label: "Each Transaction Less Than or Equal to" },
];

export const frequencyOptions = [
  { value: "Current Transaction", label: "Current Transaction" },
  { value: "Day", label: "Day" },
  { value: "7 Days", label: "7 Days" },
  { value: "30 Days", label: "30 Days" },
  { value: "90 Days", label: "90 Days" },
  { value: "365 Days (Year)", label: "365 Days (Year)" },
];

export const statusOptions = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

