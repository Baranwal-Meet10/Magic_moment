import { supabase } from "./integrations/supabase/client";

async function main() {
  console.log("Checking buckets...");
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log("Buckets:", buckets, "Error:", bErr);

  console.log("Attempting to create bucket gift-images...");
  const { data: createData, error: createErr } = await supabase.storage.createBucket("gift-images", {
    public: true,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  console.log("Create Bucket Result:", createData, "Error:", createErr);
}

main().catch(console.error);
