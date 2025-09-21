-- Add googleId column to users table for Google OAuth integration
ALTER TABLE users ADD COLUMN googleId VARCHAR(100) UNIQUE;

-- Make email and password nullable for Google OAuth users
ALTER TABLE users MODIFY COLUMN password VARCHAR(200) NULL;

-- Add index for better performance on googleId lookups
CREATE INDEX idx_users_googleId ON users(googleId);