# Phase 2: Database Schema & RPC Hardening

## Goal
Ensure Supabase stored procedures and API endpoints permit all 12 themes without throwing `invalid theme` SQL exceptions, and implement client-side defensive fallbacks.

## Requirements
1. **Migration SQL**:
   - Location: `supabase/migration/20261118210000_expand_theme_whitelist.sql`
   - Content: Update `create_gift` function to allow all 12 themes:
     ```sql
     IF _theme NOT IN (
       'birthday', 'love', 'thanks', 'holiday', 'welcome',
       'congrats', 'celestial', 'ocean', 'party', 'romance',
       'botanical', 'sunset'
     ) THEN
       RAISE EXCEPTION 'invalid theme';
     END IF;
     ```
2. **Defensive Client Fallback in `create.tsx`**:
   - If calling `create_gift` fails with an invalid theme error from an outdated remote database, retry automatically or fall back gracefully to a standard theme (or provide friendly feedback) to prevent user blockage.
