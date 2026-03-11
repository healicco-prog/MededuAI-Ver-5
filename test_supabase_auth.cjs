const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yrelfdwkjtaidtoulwrj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWxmZHdranRhaWR0b3Vsd3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMDU3ODQsImV4cCI6MjA4ODY4MTc4NH0.FpFw_TINjRTeSRK54PFa-NoLa5R9ctx8y5h4_wmoBfk';

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey.length);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'narayanakdr@yahoo.co.in',
            password: 'wrongpassword' // just to see if we get an invalid credentials error instead of failed to fetch
        });
        
        if (error) {
            console.log('Auth Error:', error.message);
        } else {
            console.log('Auth Success?', data);
        }
    } catch (err) {
        console.error('Fetch exception:', err.message);
    }
}

testAuth();
