import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackblazeAuthResponse {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
}

interface BackblazeUploadUrlResponse {
  bucketId: string;
  uploadUrl: string;
  authorizationToken: string;
}

interface BackblazeUploadResponse {
  fileId: string;
  fileName: string;
  contentLength: number;
  contentType: string;
  fileInfo: Record<string, string>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    console.log('Starting query file upload process');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const keyId = Deno.env.get('BACKBLAZE_KEY_ID');
    const applicationKey = Deno.env.get('BACKBLAZE_APPLICATION_KEY');

    if (!keyId || !applicationKey) {
      console.error('Missing credentials - keyId:', !!keyId, 'applicationKey:', !!applicationKey);
      throw new Error('Backblaze credentials not configured');
    }

    // Validate credential format
    if (keyId.trim().length === 0 || applicationKey.trim().length === 0) {
      console.error('Empty credentials detected');
      throw new Error('Backblaze credentials are empty');
    }

    console.log('Using Key ID:', keyId.substring(0, 4) + '...');

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);

    // Step 1: Authorize with Backblaze B2
    console.log('Attempting Backblaze authorization...');
    
    const authResponse = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${keyId}:${applicationKey}`)}`,
      },
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('Backblaze auth failed!');
      console.error('Status:', authResponse.status, authResponse.statusText);
      console.error('Response:', errorText);
      
      let errorDetails = 'Authorization failed';
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.message || errorJson.code || 'Invalid credentials';
      } catch {
        errorDetails = errorText || 'Invalid credentials';
      }
      
      throw new Error(`Backblaze authorization failed (${authResponse.status}): ${errorDetails}. Please verify your Backblaze Key ID and Application Key are correct.`);
    }

    const authData: BackblazeAuthResponse = await authResponse.json();
    console.log('Backblaze authorization successful');

    // Step 2: Get upload URL
    const uploadUrlResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bucketId: 'be57f842775f62c69c95071a',
      }),
    });

    if (!uploadUrlResponse.ok) {
      throw new Error(`Failed to get upload URL: ${uploadUrlResponse.statusText}`);
    }

    const uploadUrlData: BackblazeUploadUrlResponse = await uploadUrlResponse.json();
    console.log('Got upload URL');

    // Step 3: Upload file to Backblaze B2 in "Query communication/" folder
    const fileBuffer = await file.arrayBuffer();
    const fileName = `Query communication/${Date.now()}-${file.name}`;
    
    const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': uploadUrlData.authorizationToken,
        'X-Bz-File-Name': encodeURIComponent(fileName),
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Length': fileBuffer.byteLength.toString(),
        'X-Bz-Content-Sha1': 'do_not_verify',
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload error:', errorText);
      throw new Error(`File upload failed: ${uploadResponse.statusText}`);
    }

    const uploadData: BackblazeUploadResponse = await uploadResponse.json();
    console.log(`File uploaded successfully: ${uploadData.fileId}`);

    // Step 4: Save file metadata to Supabase
    const downloadUrl = `${authData.downloadUrl}/file/babu-advocates/${uploadData.fileName}`;
    
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        b2_file_id: uploadData.fileId,
        b2_file_name: uploadData.fileName,
        download_url: downloadUrl,
        user_id: null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save file metadata: ${dbError.message}`);
    }

    console.log(`File metadata saved with ID: ${fileRecord.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        file: {
          name: file.name,
          url: downloadUrl,
          size: file.size,
          type: file.type || 'application/octet-stream',
          b2_file_id: uploadData.fileId,
          b2_file_name: uploadData.fileName,
          uploaded_at: new Date().toISOString()
        },
        message: 'Query file uploaded successfully to Backblaze B2'
      }),
      {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );

  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );
  }
});
