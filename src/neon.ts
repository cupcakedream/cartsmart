import { createClient } from '@neondatabase/neon-js';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters';

export const neon = createClient({
  auth: {
    adapter: BetterAuthReactAdapter(),
    url: import.meta.env.VITE_NEON_AUTH_URL as string,
  },
  dataApi: {
    url: import.meta.env.VITE_NEON_DATA_API_URL as string,
  },
});
