# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Lost-and-found features

- Set the backend `FRONTEND_URL` to the deployed app URL and add that URL to the Supabase Auth redirect allow list for password recovery emails.
- The admin panel is enabled for profiles whose `role` is `admin`/`administrator` or whose `is_admin` field is `true`. The backend checks the same profile before allowing admins to delete other users' reports.
- Before using item chats, run [`backend/supabase/migrations/20261020_item_chat.sql`](./backend/supabase/migrations/20261020_item_chat.sql) against the Supabase database (for example, paste it into the Supabase Dashboard SQL Editor and run it). If the app reports that `chat_threads` is missing from the schema cache, apply this migration and retry. Chat is tied to an item and only its owner and the conversation starter can read or send messages. Messages refresh every three seconds; location sharing asks for the browser's location permission and sends coordinates only after the user chooses to attach them.
- For profile-photo storage, also run [`backend/supabase/migrations/20261021_profile_avatar.sql`](./backend/supabase/migrations/20261021_profile_avatar.sql) to add the `profiles.avatar_url` column. Profile photos use the existing `item-images` Supabase Storage bucket.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
