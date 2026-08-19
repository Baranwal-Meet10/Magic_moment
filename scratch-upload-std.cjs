const { createClient } = require('@supabase/supabase-js');

const url = 'https://exqggjypmirvgcuvnflk.supabase.co';
const key = 'sb_publishable_0IpbxfXluP9Uayt2Zbm14w_kYYEzxWF';

// Test 1: Standard client (no custom fetch wrapper)
const supabaseStandard = createClient(url, key);

async function testUploadStandard() {
  console.log('Testing standard client storage upload...');
  const testBuffer = Buffer.from('fake image content');
  const path = `uploads/test-std-${Date.now()}.png`;

  const { data, error } = await supabaseStandard.storage
    .from('gift-images')
    .upload(path, testBuffer, { contentType: 'image/png' });

  if (error) {
    console.error('Standard Storage Upload Error:', error);
  } else {
    console.log('Standard Storage Upload SUCCESS:', data);
  }
}

testUploadStandard();
