#!/usr/bin/env node

/**
 * Apply Supabase migration script
 * Reads the migration file and executes it against your Supabase database
 * Usage: node scripts/apply-migration.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_KEY (use your admin key from Supabase dashboard)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  try {
    const migrationFile = path.join(
      __dirname,
      '../supabase/migrations/20251210000000_time_slots_constraints.sql'
    );

    if (!fs.existsSync(migrationFile)) {
      console.error(`❌ Migration file not found: ${migrationFile}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationFile, 'utf8');
    console.log(`📄 Applying migration: 20251210000000_time_slots_constraints.sql`);
    console.log('');

    // Use admin API to execute raw SQL
    const { data, error } = await supabase.rpc('exec', { sql }, { schema: 'extensions' });

    if (error) {
      // Try direct query execution via REST API
      console.log('📡 Attempting direct SQL execution via REST API...');
      const response = await fetch(`${SUPABASE_URL}/rest/v1/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed to execute SQL: ${response.status}`);
        console.error(errorText);
        process.exit(1);
      }

      console.log('✅ Migration applied successfully!');
      return;
    }

    console.log('✅ Migration applied successfully!');
    console.log('');
    console.log('Changes made:');
    console.log('  ✓ Enabled btree_gist extension');
    console.log('  ✓ Added capacity column to time_slots (non-destructive)');
    console.log('  ✓ Added exclusion constraint time_slots_no_overlap');
    console.log('  ✓ Created index time_slots_service_start_idx');
    console.log('  ✓ Created function bulk_create_time_slots');
  } catch (err) {
    console.error('❌ Error applying migration:', err.message);
    process.exit(1);
  }
}

applyMigration();
