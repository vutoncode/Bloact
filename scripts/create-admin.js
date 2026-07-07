const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: 'tuna@admin.com',
    password: 'tuna12345',
    email_confirm: true,
    user_metadata: {
      display_name: 'Admin Tuna'
    }
  });

  if (userError) {
    console.error('Error creating user:', userError.message);
    return;
  }

  const userId = userData.user.id;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      username: 'tuna-admin',
      role: 'admin'
    })
    .eq('id', userId);

  if (profileError) {
    console.error('Error updating profile:', profileError.message);
    return;
  }

  console.log('Admin user created successfully');
}

main();
