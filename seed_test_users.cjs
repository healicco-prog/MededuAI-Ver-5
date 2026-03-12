const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedUser(email, password, name, role) {
  // 1. Check if user already exists
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }
  
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    console.log(`User ${email} already exists.`);
    // Enforce email_confirmed_at and password
    await supabase.auth.admin.updateUserById(existingUser.id, {
      email_confirm: true,
      password: password
    });
    
    // Ensure profile exists
    await supabase.from('profiles').upsert({
      id: existingUser.id,
      name: name,
      role: role
    });
    console.log(`Updated user ${email} and profile.`);
    return;
  }

  // 2. Create user with email_confirm: true
  console.log(`Creating user ${email}...`);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role }
  });

  if (error) {
    console.error(`Error creating user ${email}:`, error);
    return;
  }

  // 3. Create profile
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      name: name,
      role: role,
      created_at: new Date().toISOString()
    });
    
    if (profileError) {
      console.error(`Error creating profile for ${email}:`, profileError);
    } else {
      console.log(`Successfully created verified user test account: ${email} (${role})`);
    }
  }
}

async function run() {
  await seedUser('student@mededu.ai', 'password123', 'Test Student', 'student');
  await seedUser('deptadmin_test@example.com', 'ValidPassword123!', 'Department Head Test', 'deptadmin');
  await seedUser('instadmin_test@example.com', 'ValidPassword123!', 'Institution Head Test', 'instadmin');
  await seedUser('narayanakdr@yahoo.co.in', '111111', 'Dr Narayana K', 'teacher');
  console.log('Seeding complete.');
}

run();
