# Admin Panel Setup Instructions

## 1. Database Setup

Run the following SQL in your Supabase SQL Editor to create the admin tables:

```sql
-- Copy and paste the contents of db/admin_schema.sql
```

Or run the file directly in Supabase:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy the contents from `db/admin_schema.sql`
5. Run the query

## 2. Create First Admin User

After running the schema, you need to manually create the first admin user in the database:

### Option 1: Using Supabase Table Editor
1. Go to your Supabase project dashboard
2. Navigate to Table Editor
3. Select `admin_users_main` table
4. Click "Insert" → "Insert row"
5. Fill in:
   - **email**: your admin email
   - **password_hash**: You need to hash your password first using bcrypt

### Option 2: Using the Admin Creation Script

Create a temporary script to add your first admin:

```typescript
// Create a file: scripts/create-first-admin.ts
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createFirstAdmin() {
  const email = 'admin@example.com'; // Change this
  const password = 'your-secure-password'; // Change this
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  
  const { data, error } = await supabase
    .from('admin_users_main')
    .insert({
      email,
      password_hash: passwordHash,
      created_by: 'system',
      updated_by: 'system'
    })
    .select();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Admin created successfully:', data);
  }
}

createFirstAdmin();
```

Then run:
```bash
npx tsx scripts/create-first-admin.ts
```

### Option 3: Using Supabase SQL (Recommended for first setup)

Run this SQL query in Supabase SQL Editor after replacing the values:

```sql
-- First, you need to generate a password hash using bcrypt
-- Use an online bcrypt generator or the Node.js script above
-- Example: bcrypt hash of "YourPassword123!" with salt rounds 10

INSERT INTO admin_users_main (email, password_hash, created_by, updated_by)
VALUES (
  'your-email@example.com',  -- Replace with your email
  '$2a$10$EXAMPLE_HASH_HERE',  -- Replace with bcrypt hash of your password
  'system',
  'system'
);
```

## 3. Environment Variables

Make sure these environment variables are set:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (NOT the anon key!)

## 4. Access the Admin Panel

Navigate to: `https://yourdomain.com/admin`

Login with the email and password you created.

## 5. Managing Admins

Once logged in, you can:
- Add new admin users (with email and password)
- Remove admin users (cannot remove the last admin)
- View all admin users

## Security Notes

⚠️ **IMPORTANT SECURITY CONSIDERATIONS:**

1. **Service Role Key**: The admin panel uses the Supabase service role key to bypass Row Level Security. Keep this key secure and NEVER expose it to the client side.

2. **Password Requirements**: Passwords must be at least 8 characters long.

3. **Session Duration**: Admin sessions expire after 24 hours.

4. **Last Admin Protection**: The system prevents removing the last admin user.

5. **HTTPS Only**: Always use HTTPS in production to protect login credentials.

6. **Environment Variables**: Never commit your `.env` file to version control.

## Troubleshooting

### Cannot login
- Verify the email exists in `admin_users_main` table
- Check that the password hash was generated correctly
- Verify your Supabase credentials are correct

### Cannot add new admin
- Check browser console for errors
- Verify service role key has proper permissions
- Check that the email doesn't already exist

### RLS Policies
The admin tables have Row Level Security enabled and only allow access via the service role. This is intentional for security.
