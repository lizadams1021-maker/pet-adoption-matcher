import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const databaseUrl = process.env.NEON_NEON_DATABASE_URL;

if (!databaseUrl) {
  console.error('NEON_NEON_DATABASE_URL is not defined in .env');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function cleanupData() {
  const cutoffDate = '2026-05-01T00:00:00Z';

  console.log(`Cleaning up data added before ${cutoffDate}...`);

  try {
    // 1. Delete applications for pets or users that will be deleted
    // To be safe, we delete applications associated with pets/users created before cutoff
    console.log('Deleting old applications...');
    const appsResult = await sql`
      DELETE FROM applications 
      WHERE applied_at < ${cutoffDate}
    `;
    console.log('Applications deleted.');

    // 2. Delete pets created before cutoff
    console.log('Deleting old pets...');
    const petsResult = await sql`
      DELETE FROM pets 
      WHERE created_at < ${cutoffDate}
    `;
    console.log('Pets deleted.');

    // 3. Delete users (rescues/adopters) created before cutoff
    console.log('Deleting old users...');
    const usersResult = await sql`
      DELETE FROM users 
      WHERE created_at < ${cutoffDate}
    `;
    console.log('Users deleted.');

    // 4. Delete adopters if they are in a separate table (as per lib/db.ts)
    console.log('Checking for adopters table...');
    try {
        await sql`
          DELETE FROM adopters 
          WHERE created_at < ${cutoffDate}
        `;
        console.log('Adopters deleted.');
    } catch (e) {
        console.log('Adopters table might not exist or already cleaned up through users.');
    }

    console.log('Cleanup completed successfully!');
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupData();
