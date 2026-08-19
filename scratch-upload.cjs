const { createClient } = require('@supabase/supabase-js');

const url = 'https://exqggjypmirvgcuvnflk.supabase.co';
const key = 'sb_publishable_0IpbxfXluP9Uayt2Zbm14w_kYYEzxWF';

const supabase = createClient(url, key, {
  global: {
    fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      headers.set('apikey', key);
      return fetch(input, { ...init, headers });
    }
  }
});

async function testUpload() {
  console.log('Testing image upload to gift-images storage bucket...');
  const testBuffer = Buffer.from('fake image content');
  const path = `uploads/test-${Date.now()}.png`;

  const { data, error } = await supabase.storage
    .from('gift-images')
    .upload(path, testBuffer, { contentType: 'image/png' });

  if (error) {
    console.error('Storage Upload Error:', error);
  } else {
    console.log('Storage Upload SUCCESS:', data);
  }
}

testUpload();
