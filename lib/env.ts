import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Load environment variables from .env file
 * This is a simple dotenv replacement that doesn't require external dependencies
 */
export function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env');
    const envFile = readFileSync(envPath, 'utf-8');
    
    // Parse .env file
    const lines = envFile.split('\n');
    
    for (const line of lines) {
      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith('#')) {
        continue;
      }
      
      // Parse key=value
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // Only set if not already defined
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.warn('Warning: Could not load .env file:', error instanceof Error ? error.message : error);
    return false;
  }
}

// Auto-load on import
loadEnv();
