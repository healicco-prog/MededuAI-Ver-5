import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    let rawValue = values.join('=').trim().replace(/"/g, '').replace(/\r/g, '');
    if (rawValue.includes(' # ')) {
      rawValue = rawValue.split(' # ')[0].trim();
    }
    env[key.trim()] = rawValue;
  }
});

console.log("Using URL:", env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Using Key length:", env.SUPABASE_SERVICE_ROLE_KEY?.length);

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function setupAdmins() {
  const admins = [
    {
      email: 'katakepradeep11@gmail.com',
      password: 'User-Akash@2026',
      role: 'master_admin',
      name: 'Katake Pradeep (Master)'
    },
    {
      email: 'drnarayanak@gmail.com',
      password: 'Tata-Vidhya-Narayana-2026',
      role: 'super_admin',
      name: 'Dr. Narayana K (Super)'
    }
  ];

  for (const admin of admins) {
    console.log(`Setting up ${admin.email}...`);
    // Create or update user
    let { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
        console.error("List users error:", listError);
        return;
    }
    
    let user = users?.find(u => u.email === admin.email);
    
    if (!user) {
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true,
        user_metadata: { role: admin.role, full_name: admin.name }
      });
      if (createError) {
        console.error("Failed to create user:", createError);
        continue;
      }
      user = createData.user;
      console.log("User created.");
    } else {
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: admin.password, user_metadata: { role: admin.role, full_name: admin.name } }
      );
      if (updateError) {
        console.error("Failed to update user:", updateError);
        continue;
      }
      user = updateData.user;
      console.log("User updated.");
    }

    // Ensure profiles table has correct role
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update({ role: admin.role })
      .eq('id', user.id);
      
    // Ensure users table has correct role
    const { error: usersErr } = await supabaseAdmin
      .from('users')
      .update({ role: admin.role, full_name: admin.name })
      .eq('id', user.id);
      
    console.log(`Finished ${admin.email}`);
  }
}

setupAdmins();
