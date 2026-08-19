const url = 'https://exqggjypmirvgcuvnflk.supabase.co/storage/v1/object/gift-images/uploads/test.png';
const apiKey = 'sb_publishable_0IpbxfXluP9Uayt2Zbm14w_kYYEzxWF';

async function testDirectStorage() {
  console.log('Sending direct HTTP POST to storage endpoint:', url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'image/png'
      },
      body: Buffer.from('test data')
    });
    console.log('HTTP Status:', res.status);
    const text = await res.text();
    console.log('Response body:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testDirectStorage();
