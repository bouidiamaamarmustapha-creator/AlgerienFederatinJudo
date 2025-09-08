/*
      # Storage Policies for League Logos

      1. Purpose
        - Configures policies for the 'league-logos' storage bucket.
        - Allows authenticated users to upload objects to the 'league-logos' bucket.
        - Allows public read access to objects in the 'league-logos' bucket.

      2. SQL Commands
        - `CREATE POLICY "Allow uploads for authenticated users"`: Creates a policy allowing authenticated users to upload objects to the 'league-logos' bucket if it doesn't already exist.
        - `CREATE POLICY "Allow public read"`: Creates a policy allowing public read access to objects in the 'league-logos' bucket if it doesn't already exist.

      3. Security Considerations
        - This configuration allows authenticated users to upload files to the 'league-logos' bucket.
        - Public read access is granted to objects in the 'league-logos' bucket.
      */

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow uploads for authenticated users') THEN
        CREATE POLICY "Allow uploads for authenticated users"
        ON storage.objects
        FOR INSERT
        WITH CHECK (bucket_id = 'league-logos' AND auth.role() = 'authenticated');
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read') THEN
        CREATE POLICY "Allow public read"
        ON storage.objects
        FOR SELECT
        USING (bucket_id = 'league-logos');
      END IF;
    END $$;
