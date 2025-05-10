## Environment Configuration

This project uses different environment files for different purposes:

### Environment Files

- `.env.example` - Template file showing all required environment variables (committed to git)
- `.env.local` - Local development overrides (git-ignored)
- `.env.development` - Development environment defaults (committed to git)
- `.env.production` - Production environment defaults (committed to git)

### Setting Up Your Environment

1. Copy `.env.example` to create your local environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the values in `.env.local` with your actual configuration

3. For production deployment (Vercel):
   - Go to Project Settings > Environment Variables
   - Add all required variables from `.env.example`
   - Make sure to set the environment to "Production"

### Required Environment Variables

#### Site Configuration
- `NEXT_PUBLIC_SITE_URL` - Your application's base URL

#### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

#### Google OAuth Configuration
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret

### Optional Environment Variables

The following variables are optional and only needed if you're using the respective features:

#### Analytics and Monitoring
- `NEXT_PUBLIC_ANALYTICS_ID` - For analytics tracking
- `NEXT_PUBLIC_SENTRY_DSN` - For error tracking

#### Feature Flags
- `NEXT_PUBLIC_ENABLE_FEATURE_X` - Control feature availability
- `NEXT_PUBLIC_ENABLE_FEATURE_Y` - Control feature availability

#### Email Configuration
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASSWORD` - SMTP password
- `SMTP_FROM` - Default sender email

### Security Notes

1. Never commit sensitive values to git
2. Keep `.env.local` in your `.gitignore`
3. Use different values for development and production
4. Regularly rotate secrets and API keys
5. Use environment-specific values in Vercel

### Troubleshooting

If you encounter environment-related issues:

1. Check that all required variables are set
2. Verify the values are correct for your environment
3. Make sure you're using the right environment file
4. Check Vercel's environment variables if deploying
5. Clear your browser cache if using `NEXT_PUBLIC_` variables 