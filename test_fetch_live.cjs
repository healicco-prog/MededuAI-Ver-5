const https = require('https');

https.get('https://gen-lang-client-0600101930.web.app/login', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('Got response code:', res.statusCode);
    const match = data.match(/NEXT_PUBLIC_SUPABASE_URL[^\w]/);
    if (match) {
      console.log('Found NEXT_PUBLIC_SUPABASE_URL in source code!');
    } else {
      console.log('Did NOT find NEXT_PUBLIC_SUPABASE_URL in source code.');
    }
    const keyMatch = data.match(/yrelfdwkjtaidtoulwrj/);
    if (keyMatch) {
       console.log('Found project ref yrelfdwkjtaidtoulwrj in source code!');
    } else {
       console.log('Did NOT find project ref in source code.');
    }
  });
}).on('error', (err) => {
  console.log('Error fetching:', err.message);
});
