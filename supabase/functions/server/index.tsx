import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Debug middleware to see what's happening
app.use('*', async (c, next) => {
  console.log(`[Request] ${c.req.method} ${c.req.url}`);
  console.log(`[Path] ${c.req.path}`);
  await next();
});

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase Storage bucket on startup
const bucketName = "make-81a36db4-artworks";
(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false });
      console.log(`Created storage bucket: ${bucketName}`);
    }
  } catch (err) {
    console.error("Bucket initialization error:", err);
  }
})();

// Helper function to verify user authentication
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    return { user: null, error: "No authorization header" };
  }
  const accessToken = authHeader.split(' ')[1];

  // Check if session exists in KV store
  const session = await kv.get(`session_${accessToken}`);

  if (!session) {
    return { user: null, error: "Unauthorized" };
  }

  return { user: { username: session.username }, error: null };
}

// Define the core routes in a separate Hono instance
const routes = new Hono();

// Health check endpoint
routes.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Login endpoint
routes.post("/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    console.log(`Login attempt for user: ${username}`);

    // Get stored credentials from KV store
    const storedCreds = await kv.get("admin_credentials");

    // If no credentials exist, set default ones
    if (!storedCreds) {
      await kv.set("admin_credentials", {
        username: "admin",
        password: "admin123"
      });
      console.log("Default admin credentials created: admin/admin123");
    }

    const credentials = storedCreds || { username: "admin", password: "admin123" };

    if (username === credentials.username && password === credentials.password) {
      // Generate a simple session token
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await kv.set(`session_${sessionToken}`, {
        username,
        createdAt: new Date().toISOString()
      });

      console.log(`Login successful: ${username}`);
      return c.json({
        accessToken: sessionToken,
        username
      });
    } else {
      console.log(`Login failed: Invalid credentials for ${username}`);
      return c.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, 401);
    }
  } catch (error) {
    console.log(`Login exception: ${error}`);
    return c.json({ error: "로그인에 실패했습니다." }, 500);
  }
});

// Logout endpoint
routes.post("/logout", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (accessToken) {
      await kv.del(`session_${accessToken}`);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Logout exception: ${error}`);
    return c.json({ error: "로그아웃에 실패했습니다." }, 500);
  }
});

// Create artwork endpoint (requires auth)
routes.post("/artworks", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    if (authError) {
      return c.json({ error: authError }, 401);
    }

    const formData = await c.req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const year = parseInt(formData.get('year') as string);
    const imageFile = formData.get('image') as File;

    if (!title || !description || !year || !imageFile) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Upload image to Supabase Storage
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${year}/${fileName}`;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const imageBuffer = await imageFile.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, imageBuffer, {
        contentType: imageFile.type,
      });

    if (uploadError) {
      console.log(`Image upload error: ${uploadError.message}`);
      return c.json({ error: "Failed to upload image" }, 500);
    }

    // Create signed URL for the image (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 31536000);

    // Save artwork metadata to KV store
    const artworkId = `artwork_${Date.now()}`;
    const artwork = {
      id: artworkId,
      title,
      description,
      year,
      imageUrl: signedUrlData?.signedUrl,
      imagePath: filePath,
      createdAt: new Date().toISOString(),
    };

    await kv.set(artworkId, artwork);

    console.log(`Artwork created successfully: ${artworkId}`);
    return c.json(artwork);
  } catch (error) {
    console.log(`Create artwork exception: ${error}`);
    return c.json({ error: "Failed to create artwork" }, 500);
  }
});

// Get artworks by year
routes.get("/artworks/:year", async (c) => {
  try {
    const year = c.req.param('year');
    const allArtworks = await kv.getByPrefix("artwork_");

    const filteredArtworks = allArtworks
      .filter((artwork) => artwork.year === parseInt(year))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json(filteredArtworks);
  } catch (error) {
    console.log(`Get artworks error: ${error}`);
    return c.json({ error: "Failed to fetch artworks" }, 500);
  }
});

// Get single artwork by ID
routes.get("/artwork/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const artwork = await kv.get(id);

    if (!artwork) {
      return c.json({ error: "Artwork not found" }, 404);
    }

    return c.json(artwork);
  } catch (error) {
    console.log(`Get artwork error: ${error}`);
    return c.json({ error: "Failed to fetch artwork" }, 500);
  }
});

// Get all years that have artworks
routes.get("/years", async (c) => {
  try {
    const allArtworks = await kv.getByPrefix("artwork_");
    const years = [...new Set(allArtworks.map((a) => a.year))].sort((a, b) => b - a);

    return c.json(years);
  } catch (error) {
    console.log(`Get years error: ${error}`);
    return c.json({ error: "Failed to fetch years" }, 500);
  }
});

// Mount the routes under all possible prefixes
const functionName = "make-server-81a36db4";
app.route(`/functions/v1/${functionName}`, routes);
app.route(`/${functionName}`, routes);
app.route("/", routes);

// Fallback for 404
app.notFound((c) => {
  console.log(`[404] ${c.req.method} ${c.req.path}`);
  return c.json({ 
    error: "Not Found", 
    method: c.req.method,
    path: c.req.path,
    suggestion: "Check your route definitions and prefixes"
  }, 404);
});

Deno.serve(app.fetch);