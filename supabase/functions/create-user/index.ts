import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@1.30.0";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

// Load environment variables from the .env file
config({ export: true });

// Fetch environment variables and ensure they are defined
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing necessary environment variables: EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Extract user data from request body
    const { data } = await req.json();
    const {
      id,
      email_addresses,
      first_name,
      last_name,
      image_url,
      created_at,
      updated_at,
    } = data;

    const email = email_addresses[0].email_address;

    // Insert data into Supabase
    const { data: insertedData, error } = await supabase
      .from("users")
      .insert({
        user_id: id,
        email,
        profile_picture: image_url,
        full_name: `${first_name} ${last_name}`,
        created_at: new Date(created_at).toISOString(),
        updated_at: new Date(updated_at).toISOString(),
      });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify(insertedData), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    });
  } catch (err) {
    console.log(err);

    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error occurred",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});

// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@1.30.0";

// // Fetch environment variables and ensure they are defined
// const supabaseUrl = Deno.env.get("EXPO_PUBLIC_SUPABASE_URL")!;
// const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// if (!supabaseUrl || !supabaseServiceKey) {
//   throw new Error(
//     "Missing necessary environment variables: EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
//   );
// }

// // Initialize Supabase client
// const supabase = createClient(supabaseUrl, supabaseServiceKey);

// serve(async (req: Request) => {
//   if (req.method !== "POST") {
//     return new Response("Method not allowed", { status: 405 });
//   }

//   try {
//     const { id, email_addresses, first_name, image_url } = await req.json();
//     const email = email_addresses[0].email_address;

//     // Insert data into Supabase
//     const { data, error } = await supabase
//       .from("users")
//       .insert({ id, email, avatar_url: image_url, first_name });

//     if (error) {
//       return new Response(JSON.stringify({ error: error.message }), {
//         status: 400,
//       });
//     }

//     return new Response(JSON.stringify(data), {
//       headers: { "Content-Type": "application/json" },
//       status: 201,
//     });
//   } catch (err) {
//     console.log(err);

//     // Ensure err is treated as an Error object
//     const errorMessage = err instanceof Error
//       ? err.message
//       : "Unknown error occurred";

//     return new Response(JSON.stringify({ error: errorMessage }), {
//       headers: { "Content-Type": "application/json" },
//       status: 400,
//     });
//   }
// });

// // import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// // import { createClient } from "https://esm.sh/@supabase/supabase-js@1.30.0";

// // const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
// // const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// // const supabase = createClient(supabaseUrl, supabaseServiceKey);

// // serve(async (req: Request) => {
// //   if (req.method !== "POST") {
// //     return new Response("Method not allowed", { status: 405 });
// //   }

// //   try {
// //     const { id, email_addresses, first_name, image_url } =
// //       (await req.json()).data;
// //     const email = email_addresses[0].email_address;

// //     const { data, error } = await supabase
// //       .from("users")
// //       .insert({ id, email, avatar_url: image_url, first_name });

// //     if (error) {
// //       return new Response(JSON.stringify(error), { status: 400 });
// //     }

// //     return new Response(JSON.stringify(data), {
// //       headers: { "Content-Type": "application/json" },
// //       status: 201,
// //     });
// //   } catch (err) {
// //     console.log(err);

// //     return new Response(JSON.stringify({ error: err.message }), {
// //       headers: { "Content-Type": "application/json" },
// //       status: 400,
// //     });
// //   }
// // });
