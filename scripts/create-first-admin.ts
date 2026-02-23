import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createFirstAdmin() {
  try {
    console.log('\n🔐 Create First Admin User\n');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables');
      process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password (min 8 chars): ');
    
    if (!email || !password) {
      console.error('❌ Email and password are required');
      process.exit(1);
    }
    
    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      process.exit(1);
    }
    
    console.log('\n⏳ Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    console.log('⏳ Creating admin user in admin_users_main...');
    const { error: userError } = await supabase
      .from('admin_users_main')
      .insert({
        email: email,
        created_by: 'system',
        notes: 'First admin account'
      });
    
    if (userError) {
      console.error('❌ Error creating admin user:', userError.message);
      process.exit(1);
    }
    
    console.log('⏳ Storing admin password in admin_settings_main...');
    const { error: settingsError } = await supabase
      .from('admin_settings_main')
      .insert({
        setting_key: email,
        setting_value: passwordHash,
        updated_by: 'system'
      });
    
    if (settingsError) {
      console.error('❌ Error storing admin password:', settingsError.message);
      // Rollback
      await supabase.from('admin_users_main').delete().eq('email', email);
      process.exit(1);
    }
    
    console.log('\n✅ Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log('\n🎉 You can now login at /admin\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createFirstAdmin();
