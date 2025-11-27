// dropdownOptions.js

// Direct Dropdown Arrays
export const customerTypes = ["Natural Person", "Legal Entities"];

export const professions = [
   "Blue Collar","Partner","Pink Collar", "Red Collar", "White Collar" 
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
  "Secondary property", "PLATINUM", "Audit", "Accountancy", "Consultancy", "Primary Property", "Company Service Provider"
];

// Legal Entity specific dropdown options
export const businessActivities = [
  "ACCESSORIES", "ACCESSORIES/SPARE PARTS TYRES", "Accounting", "Adult Entertainment", "Advertising, Marketing and PR", "Advocacy Organizations", "Aerospace and Defense", "AGENTS &amp;/OR DISTRIBUTORS", "AGRICULTURAL/PRODUCTREQUISITES", "Agriculture &amp; Mining Other", "AIR", "Air Couriers and Caro Services", "Aircraft", "AIRPORT", "Airport, Harbor, and Terminal Operations", "Alcoholic Beverages", "Alternative Energy Sources", "ALUMINIUM", "Amusement Parks and Attractions", "Apparel Wholesalers", "Apparel&amp;Accessories", "ARCHEIVE CLERK", "Architect &amp; Archivist", "Architecture, Engineering and Design", "Assistant", "Audio, Video and Photography", "AUDIO/VIDEO STUDIO", "Automobile Dealers", "Automobile Parts and Supplies", "Automobile Parts Wholesalers", "Automobiles, Boats and Motor Vehicles", "Automotive Repair and Maintenance", "BANK", "BEAUTY SHOPS", "Beer, Wine and Liquor Stores", "Beer, Wine and Liquor Wholesalers", "Biotechnology", "Blue Collar", "BOTTLED &amp; CANNED SOFT DRINKS", "BRICKS &amp; MARBLE", "Brokerage", "BROKERS", "BUILDING MATERIAL &amp; GYPSUM PROD", "BUILDING MATERIAL/MARBLE", "BUILDING PURCHASE", "BUILDING RENOVATION", "BUILDINGS", "Business", "BUSINESS CENTRES", "Business Services Other", "Cable and Television Providers", "CallCenters", "CAR RENTAL", "CAR WASH", "CARGO", "CargoHandling", "CATERING", "CEMENT", "CERAMICS &amp; SANITARY WARES", "Charitable Organizations and Foundations", "Chemicals and Petrochemicals", "Chemicals and Plastics Wholesalers", "CINEMA/THEATRE", "CIVIL &amp; GENERAL", "CIVIL/GENERAL", "Cleaner", "CLOTHING &amp; LEATHER", "Clothing and Shoe Stores", "CLUBS", "COFFEE SHOPS", "COLD STORES", "Colleges and Universities", "COMBINATION", "COMMERCIAL AGENTS", "COMMUNICATION SERVICES", "Company Holding Services", "Computer and Electronics Other", "COMPUTER EDUCATION CENTRES", "COMPUTER PROGRAMMING", "COMPUTERS &amp; RELATED PRODUCTS", "Computers, Parts and Repair", "Concrete, Glass and Building Materials", "Construction and Remodeling", "Construction Equipment and Supplies", "CONSULTANCY", "Consumer Electronics, Parts and Repair", "CONSUMER LOANS", "Consumer Services Other", "ConsumerProducts", "CONTRACTING", "Cosmetics", "COURIER", "CRAFTSMANSHIP", "CREDIT CARDS", "Credit Cards and Related Services", "Cruise Ship Operations", "CRYSTAL PRODUCTS TRADING", "DAIRY PRODUCTS", "Data Analytics, Management, and Internet", "Data and Records Management", "DENTAL CENTERS", "Department Stores", "DEPATMENT STORES", "DESIGNERS", "Diagnostic Laboratories", "Diamonds", "Diamonds, Pearls And Precious Stones Trading", "Diamonds, Precious Stones and Jewellery", "DISINFECTING", "Doctors and Health Care Practitioners", "DRILLING OF WELLS", "DRIVER", "E-Commerce and Internet Business", "Education", "ELECTRICAL", "ELECTRICITY", "ELECTRICITY GENERATION", "ELECTRONICS/ELECTRICAL APPLIANCES", "Elementary and Secondary Schools", "EMPLOYMENT AGENCIES", "ENGINEERING", "ENTERTAINMENT", "Entertainment&amp;Leisure", "EXCHANGE HOUSES", "EXHIBITION", "EXPLORATION", "FABRICS", "Facilities Management and Maintenance", "Farming and Mining Machinery and Equipment", "Farming and Ranching", "FERTILIZERS", "FINANCE COMPANIES", "FINANCIAL INSTITUTION", "FINANCIAL SERVICES", "FinancialServices", "FIRE EQUIPMENT", "FISHING SPORT REQUISITES", "Fishing, Hunting and Forestry and Logging", "FOOD", "Food and Dairy Product Manufacturing and Packaging", "Food,Beverage&amp;Tobacco", "FOODSTUFFS", "FOREIGN LABOR RECRUITMENT", "Freight Hauling (Rail and Truck)", "FRUITS &amp; VEGETABLES", "Fund Management", "Funeral Homes and Services", "FURNITURE &amp; WOOD", "Furniture Manufacturing", "Furniture Stores", "FURNITURE/CARPETS/CURTAINS", "Gambling and Gaming", "Garments &amp; Textites", "GAS", "GAS DISTRIBUTION", "GAS/PETROLEUM SERVICES", "Gasoline and Oil Refineries", "GENERAL MERCHANDISE", "General Trading", "GIFTS TRADING", "Gold &amp; DIamonds Trading Import &amp; export", "GOLD AND PRECIOUS METAL", "GOLD AND PRECIOUS METAL CASTING", "GOLD REFINERY", "GOLDSMITH", "GOVERNMENT", "Government Other", "Grocery", "hand Presser", "Hardware and Building Material Dealers", "Health, Pharmaceuticals, and Biotech Other", "HealthCare", "HEAVY EQUIPMENT", "HEAVY INDUSTRY", "Holding Activity", "Hospitals", "HOTEL &amp; RESTAURANTS", "Hotels", "HOUSE WIFE", "HOUSEHOLD ITEMS", "HOUSING &amp; ESTABLISHMENT", "HR and Recruiting Services", "IMPORTER/EXPORTER", "INDIVIDUALS", "INDUSTRIAL EQUIPMENT", "INDUSTRIAL GASES", "INDUSTRIAL MANUFACTURING", "Instruments and Controls", "INSURANCE", "Insurance and Risk Management", "INTERIOR DECORATION", "International Bodies and Organizations", "InternetPublishing", "INVESTMENT", "Investment Banking and Venture Capital", "INVESTMENT COMPANIES", "INVESTMENT FUNDS", "IRRIGATION", "IT and Network Services and Support", "Jewellery", "JEWELLERY TRADING", "Jewelry Precious Metal", "KITCHEN/SANITARY WARES", "LABOURE", "LAND", "LAND PURCHASE", "LANGUAGE TEACHING CENTRES", "Laundry and Dry Cleaning", "LEATHER &amp; LEATHER PRODCUTS", "Legal", "Lending and Mortgage", "Libraries, Archives and Museums", "LIQUIFIED GAS", "LIVE ANIMALS", "LOADING AND UNLOADING", "LUBRICANTS", "MACHINERY EQPT &amp; ELECTRICAL APPLIANCES", "MAIL ORDER", "MAIL/TELEGRAPH", "MAINT &amp; CLEANING AIRCONDITIONER", "MAINT &amp; CLEANING -REAL ESTATE", "MAINTENANCE", "MAINTENANCE &amp; CLEANING", "MALL/ SHOPPING CENTRE", "MALLS", "Management Consulting", "MARBLE CUTTING", "MARINE", "Marine and Inland Shipping", "MEAT/POULTRY/FISH", "Mechanic", "Media and Entertainment Other", "Medical Devices", "MEDICAL EQUIPMENT", "MEDICAL SECTOR", "Medical Supplies and Equipment", "Messenger", "Metal and Mineral Wholesalers", "METAL RELATED &amp; INDUSTRIAL PRDN", "Mining and Quarrying", "MINISTRIES", "MISCELLANEOUS SERVICES", "Motion Picture and Recording Producers", "Motion Picture Exhibitors", "Moving Companies and Services", "Music", "MUSIC TAPES/VIDEO CASSETTES/OTHERS", "National Government", "Network Security Products", "Networking equipment and Systems", "NEWSPAPER", "NewspaperPublishers", "Newspapers, Books, and Periodicals", "NONE", "NON-MANUFACTURED PRECIOUS METAL TRADING", "NOVELITIES TRADING", "Nurse", "OFFICE BUILDINGS", "Office Equipment and Suppliers Wholesalers", "Office Machinery and Equipment", "OFFICE MANAGER", "Office Supplies Stores", "OIL", "OIL &amp; GAS", "OIL FIELD MAINTENANCE", "OnlineAuctions", "OTHER ACTIVITES", "OTHER AMUSEMENT/RECREATION", "OTHER CLINICS", "OTHER CONSUMER LOANS", "OTHER CONTRACTING", "OTHER EDUCATIONAL SERVICES", "OTHER HOUSING", "OTHER PRODUCTION", "OTHER TRANSPORTATION", "OTHER TRDG ACTIVITIES", "OTHERS", "PACKAGING", "Painter", "PAPER &amp; ALLIED PRODUCTS", "Paper and Paper Products", "Parking Lots and Garage Management", "Participatory Sports and Recreation", "Partner", "Partner", "Passenger Airlines", "Payroll Services", "PEARLS AND PRECIOUS STONES TRADING", "PENS", "PensionFunds", "Performing Arts", "PERFUMES", "Peripherals Manufacturing", "Personal Care", "Personal Financial Planning and Private Banking", "Personal Health Care Products", "PERSONAL ITEMS", "PERSONAL SERVICES", "PETROCHEMICALS", "PETROL STATIONS", "PETROLEUM", "Petroleum Products Wholesalers", "PETROLEUM REFINERY", "PF/CASE BY CASE", "PF/GLOBAL LIMIT", "PHARMACIES", "PHOTO PRINTING/STUDIO", "Photofinishing Services", "PHOTOGRAPHY EQUIPMENT", "Pink Collar", "PLASTICS", "Plastics and Rubber Manufacturing", "Postal, Express Delivery and Couriers", "PRESSURED GAS", "PRINTING", "PRIVATE HOUSING", "PRIVATE SECTOR", "PrivateEquity", "PRODUCTION", "PRODUCTION &amp; MANUFACTURING", "PRODUCTION AND FILLING", "Property Leasing and Management", "PUBLIC SECTOR/LISTED CO", "PUBLIC UTILITIES", "PVT.BKG CUSTOMER", "RADIO", "Radio, Television Broadcasting", "READY MADE CLOTHES", "Real Estate Agents and Appraisers", "Real Estate and Construction Other", "Real Estate Investment and Development", "REAL ESTATE PURCH &amp; RENOVATION", "REAL ESTATE RETAIL  MANAGEMENT", "RealEstate", "Red Collar", "Religious Organizations", "Rental Cars", "REPAIR OF ELECTRICAL APPLIANCES", "RESIDENTIAL", "Residential and Long-term Care Facilities", "RESIDENTIAL BUILDINGWITH SHOPS", "Resorts and Casinos", "RESTAURANTS", "Restaurants and Bars", "Retail Others", "Retail&amp;Wholesale", "RETIRED", "RULING FAMILY", "SAFETY EQUIPMENT", "SALE PERSON", "SCHOOLS", "SCRAPES", "SEA", "Securities Agents and Brokers", "Securities&amp;CommodityExchanges", "Security Services", "Semiconductor and Microchip Manufacturing", "SENSITIVE BUSINESS", "Service Based Professional Client", "Sewage Treatment Facilities", "SEWERAGE", "Shipered", "SHOE REPAIR", "Shop Keeper", "SMALL SOUQS", "Soap&amp;Detergent", "SOCIAL &amp; PHILANTHROPIC SOCIETIES", "Social and Membership Organizations", "Software", "SPECIAL RESTRICTED ACCT", "Spectator Sports and Teams", "SPONSORING FOREIGN AGENTS", "SPORTS CLOTHES/EQUIPMENT", "Sports, Arts, and Recreation Instruction", "STAFF LOANS", "STATIONARY/BOOKSTORES", "STEEL", "STEEL &amp; ALLIED PRODUCTS", "Steel Industries and Steel contracting", "STUDENT", "SUPERMARKETS/GROCERIES", "SWEETS/BAKERIES", "TAILORING REQUIREMENTS", "TAILORS", "Taxi, Buses and Transit Systems", "Technical and Trade Schools", "Telecommunications Equipment and Accessories", "Telephone Service Providers and Carriers", "Test Preparation", "TESTING LABORATORIES", "Textiles, Apparel and Accessories", "Timber products ans Services", "TOOL &amp; WORKSHOP REQUISITES", "Tools, Hardware and Light Machinery", "TOYS", "Trade Groups and Labor Unions", "TRADING", "Trading in Computer Equiments and Others", "Trading of Jewellery and Accessories made of Gold and Silver", "Trading of raw Gold and Precious Metals", "Transportation", "Travel Agents and Services", "Travel, Recreations and Leisure Other", "Trucking", "Trust, Fiduciary, and Custody Activities", "UNDER SETTLEMENT-CONTRACTING", "UNDER SETTLEMENT-HOUSING &amp; EST", "UNDER SETTLEMENT-OTHERS", "UNDER SETTLEMENT-PERSONAL", "UNDER SETTLEMENT-PRODUCTION", "UNDER SETTLEMENT-SERVICES", "UNDER SETTLEMENT-TRADING", "Used Cars", "USED JEWELLERY TRADIN", "USED MERCHANDISE", "V.I.P", "V.V.I.P", "VEHICLE LOANS", "VEHICLE SERVICE GARAGES", "VEHICLES", "Veterinary Clinics and Services", "Video and Teleconferencing", "VIDEO CLUBS", "VILLAS", "Waiter", "Warehousing and Storage", "Waste Management and Recycling", "WATCH AND CLOCK AND SPARE PARTS TRADING", "WATCHES", "WATER", "WATER DISTRIBUTION", "WATER SUPPLY", "Water Treatment and Utilities", "Welder", "White Collar", "Wholesale and Distribution Other", "Wireless and Mobile", "YOUNG INVESTOR"
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
