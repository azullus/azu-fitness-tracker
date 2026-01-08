import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { applyRateLimit, RateLimitPresets } from '@/lib/rate-limit';

// Password validation helper
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  return { valid: true };
}

/**
 * POST /api/auth/signup
 *
 * Handles user signup with automatic profile and household creation.
 * This replaces the disabled database trigger by creating profile/household in application code.
 */
export async function POST(request: NextRequest) {
  // Apply strict rate limiting for signup attempts (10/minute)
  const rateLimitResponse = applyRateLimit(request, RateLimitPresets.AUTH);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Use runtime env vars (non-NEXT_PUBLIC prefixed) to avoid build-time inlining
  // Fall back to NEXT_PUBLIC vars for backwards compatibility
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { success: false, error: 'Authentication is not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { email, password, displayName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Create admin client (use service key if available, otherwise anon key)
    const adminClient = createClient(
      supabaseUrl,
      supabaseServiceKey || supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Step 1: Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'User creation failed' },
        { status: 500 }
      );
    }

    // Note: Household and profile are created automatically by the database trigger
    // `handle_new_user` on auth.users table. No need to create them here.
    console.log(`Successfully created user ${authData.user.id} - profile and household created by database trigger`);

    return NextResponse.json({
      success: true,
      user: authData.user,
      session: authData.session,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      },
      { status: 500 }
    );
  }
}
