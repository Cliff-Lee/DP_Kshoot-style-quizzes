# Cross-device live PIN verification

MathPulse stores live game PINs in `public.quiz_sessions` and quick-play students in `public.session_participants`. The lobby state is `waiting`; after the teacher starts the first question it becomes `live`; ending the quiz sets it to `ended`.

## One-time deployment

1. Link the repository to the intended Supabase project.
2. Apply all migrations, including `202607240001_cross_device_live_sessions.sql`:

   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

3. In GitHub repository settings, add Actions secrets named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Run the **Deploy MathPulse to GitHub Pages** workflow or push to `main`.
5. Confirm the deployed teacher shell says **Supabase connected**, not **Local demo data**.

## Teacher insert check

1. Sign in as a teacher on the deployed site.
2. Open a saved quiz and choose **Create game PIN**.
3. In the Supabase SQL editor, replace the sample PIN and run:

   ```sql
   select id,pin,status,quiz_id,teacher_id,class_id,created_at,updated_at
   from public.quiz_sessions
   where pin='189412';
   ```

The row must exist before the browser enters the lobby. Its status is initially `waiting`.

## Incognito or phone join check

1. Open the exact QR URL in an incognito window or on a phone:

   `https://cliff-lee.github.io/DP_Kshoot-style-quizzes/#/play/189412`

2. Enter a nickname and join.
3. Confirm the teacher lobby roster updates.
4. In the SQL editor, run:

   ```sql
   select participant.id,participant.session_id,participant.nickname,participant.joined_at
   from public.session_participants participant
   join public.quiz_sessions session on session.id=participant.session_id
   where session.pin='189412'
   order by participant.joined_at;
   ```

The nickname should appear as a new participant linked to the `quiz_sessions` row.

## Error and ending checks

- Enter an unused PIN: the app should show **Game not found**.
- End the teacher session and try the same PIN in a fresh private window: the app should show **Game has ended**.
- If RLS rejects the request, the app shows **Supabase permission error** and logs the Supabase code and hint.
- If the migration/function is missing, the app shows **Live game database error**.
- If the device cannot reach Supabase, the app shows **Could not connect to live game**.

To verify the ended state:

```sql
select pin,status,ended_at,updated_at
from public.quiz_sessions
where pin='189412';
```

Do not test cross-device behavior while the shell says **Local demo data**. Local mode intentionally uses browser storage and is only intended for single-browser product evaluation.
