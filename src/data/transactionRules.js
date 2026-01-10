export const transactionRules = {
  "PURPOSE": [
    {
      "rule": "PAR VALUE ",
      "score": 5,
      "logic": "high"
    },
    {
      "rule": "MARKET VALUE ",
      "score": 5,
      "logic": "high"
    }
  ],
  "": [],
  "Source Of Fund": [
    {
      "rule": "Salary ",
      "score": 1,
      "logic": "low"
    },
    {
      "rule": "Bank - Cash withdrawal Slip ",
      "score": 1,
      "logic": "low"
    },
    {
      "rule": "End of Services Funds ",
      "score": 1,
      "logic": "low"
    },
    {
      "rule": "Bank Statement ",
      "score": 1,
      "logic": "low"
    },
    {
      "rule": "LOANS ",
      "score": 1,
      "logic": "low"
    },
    {
      "rule": "Loan from Financial Institutions ",
      "score": 1,
      "logic": "low"
    },
    {
      "rule": "Funds from Dividend Payouts ",
      "score": 2,
      "logic": "medium_low"
    },
    {
      "rule": "Business Proceeds ",
      "score": 2,
      "logic": "medium_low"
    },
    {
      "rule": "Funds From Schemes and Raffles ",
      "score": 2,
      "logic": "medium_low"
    },
    {
      "rule": "Loan from Friends and Family ",
      "score": 4,
      "logic": "medium_high"
    },
    {
      "rule": "Personal Savings ",
      "score": 4,
      "logic": "medium_high"
    },
    {
      "rule": "Other sources ",
      "score": 4,
      "logic": "medium_high"
    },
    {
      "rule": "INVESTMENTS ",
      "score": 4,
      "logic": "medium_high"
    }
  ],
  "Amount": [
    {
      "rule": "1 - 54999.75 (Logic:AML POLICY - CID)",
      "score": 1,
      "logic": "low"
    },
    {
      "rule": "55000 - 99999.75 (Logic:AML POLICY - CDD)",
      "score": 2,
      "logic": "medium_low"
    },
    {
      "rule": "100000 - 200000 (Logic:AML POLICY - EDD)",
      "score": 4,
      "logic": "medium_high"
    },
    {
      "rule": "200001 - 50000000 (Logic:AML POLICY - EDD)",
      "score": 5,
      "logic": "high"
    }
  ],
  "Item Type": [
    {
      "rule": "ACCOUNTANCY (CONSULTANCY) ",
      "score": 1,
      "logic": "low"
    },
    {
      "rule": "GOLD ",
      "score": 4,
      "logic": "medium_high"
    }
  ],
  "Payment Mode": [
    {
      "rule": "Cash Transaction ",
      "score": 1,
      "logic": "low"
    },
    {
      "rule": "Exchange of Metal ",
      "score": 1,
      "logic": "low"
    },
    {
      "rule": "Bank Transfer ",
      "score": 4,
      "logic": "medium_high"
    }
  ],
  "Delivery Channel": [
    {
      "rule": "FACE TO FACE ",
      "score": 1,
      "logic": "low"
    },
    {
      "rule": "NON FACE TO FACE ",
      "score": 4,
      "logic": "medium_high"
    }
  ],
  "No. Of Transaction": [
    {
      "rule": "3 TRANSACTION ",
      "score": 1,
      "logic": "low"
    },
    {
      "rule": "10 TRANSACTION ",
      "score": 4,
      "logic": "medium_high"
    },
    {
      "rule": "7 TRANSACTION ",
      "score": 4,
      "logic": "medium_high"
    }
  ]
};
