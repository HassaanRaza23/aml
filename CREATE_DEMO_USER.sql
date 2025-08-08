-- Create a demo user for testing purposes
INSERT INTO users (id, email, first_name, last_name, role, is_active, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'demo@company.com',
    'Demo',
    'User',
    'analyst',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;
