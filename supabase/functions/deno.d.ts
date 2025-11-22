/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// Deno global types
declare const Deno: {
	env: {
		get(key: string): string | undefined;
	};
	serve(handler: (req: Request) => Response | Promise<Response>): void;
};

// JSR types for @supabase/supabase-js - redirect to npm package
declare module 'jsr:@supabase/supabase-js@2' {
	export * from '@supabase/supabase-js';
}

// JSR types for edge-runtime - this file provides Deno types
declare module 'jsr:@supabase/functions-js/edge-runtime.d.ts' {
	// Types are provided by the reference above
}
