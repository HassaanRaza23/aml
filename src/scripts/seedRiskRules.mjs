// scripts/seedRiskRules.mjs
import { createClient } from "@supabase/supabase-js";
import { riskRules } from "../data/riskRules.js";

// TODO: put your real values here or load from env
const supabaseUrl = process.env.SUPABASE_URL || "https://sjvuqphtunkneopkgoeb.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdnVxcGh0dW5rbmVvcGtnb2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTMzMjksImV4cCI6MjA3MDE2OTMyOX0.p-rc0Y7FmCzPs9-hTCXRix8CWPTKpfn1_S74PjztqxI";

const supabase = createClient(supabaseUrl, serviceRoleKey);

const slugify = (str) =>
  str
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

async function seed() {
  console.log("Seeding risk categories and rules...");

  for (const [categoryName, rules] of Object.entries(riskRules)) {
    const code = slugify(categoryName);

    // 1) Insert category (or get existing)
    const { data: categoryRow, error: catError } = await supabase
      .from("risk_categories")
      .upsert(
        {
          name: categoryName,
          code,
          rule_type: "ONBOARDING",
        },
        { onConflict: "code" }
      )
      .select()
      .single();

    if (catError) {
      console.error("Error inserting category", categoryName, catError);
      continue;
    }

    console.log(`Category: ${categoryName} (${categoryRow.id})`);

    // 2) Insert rules for this category
    for (const r of rules) {
      const { error: ruleError } = await supabase.from("risk_rules").insert({
        category_id: categoryRow.id,
        rule_text: r.rule,
        risk_score: r.score,
        risk_logic: (r.logic || "").toUpperCase(),
        is_active: true,
      });

      if (ruleError) {
        console.error("Error inserting rule", r.rule, ruleError);
      } else {
        console.log(`  -> inserted rule: ${r.rule}`);
      }
    }
  }

  console.log("Seeding completed.");
}

seed()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });