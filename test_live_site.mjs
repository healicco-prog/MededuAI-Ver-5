async function test() {
  const response = await fetch('https://mededuai.com/dashboard/student', {
    headers: {
      Cookie: '__session=student',
      'x-middleware-prefetch': '1' // simulate nextjs client-side prefetch or rsc fetch
    },
    redirect: 'manual'
  });

  console.log('Status 1:', response.status);
  console.log('Location 1:', response.headers.get('location'));
  
  const response2 = await fetch('https://mededuai.com/dashboard/student/mentorship', {
    headers: {
      Cookie: '__session=student',
      'RSC': '1'
    },
    redirect: 'manual'
  });
  console.log('Status 2:', response2.status);
  console.log('Location 2:', response2.headers.get('location'));
}
test();
