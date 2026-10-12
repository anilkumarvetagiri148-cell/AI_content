-- ============================================================================
-- CreatorConnect AI — Supabase SQL Seed Script (Demonstration Data)
-- Run after supabase/schema.sql in the Supabase SQL Editor
-- ============================================================================

INSERT INTO public.profiles (id, email, name, role, avatar_url, bio, location, languages, company_name, website, verified)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'aria.vance@creatorconnect.ai', 'Aria Vance', 'creator', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'Generative AI Film Director & Neural Visual Artist specializing in Runway Gen-3, Sora, and custom ComfyUI pipelines.', 'Los Angeles, USA', ARRAY['English', 'Spanish'], 'Vance Neural Cinema', 'https://ariavance.ai', true),
  ('11111111-1111-1111-1111-111111111102', 'kael.tanaka@creatorconnect.ai', 'Kael Tanaka', 'creator', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'Photorealistic AI Product Photographer & Custom LoRA Architect for D2C cosmetics and beverage brands.', 'Tokyo, Japan', ARRAY['English', 'Japanese'], 'Kael Studio Synth', 'https://kaeltanaka.studio', true),
  ('11111111-1111-1111-1111-111111111103', 'zoya.mehta@creatorconnect.ai', 'Zoya Mehta', 'creator', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', 'Virtual AI Influencer Architect & Character Consistency Specialist.', 'Mumbai, India', ARRAY['English', 'Hindi'], 'PersonaForge AI', 'https://personaforge.ai', true),
  ('22222222-2222-2222-2222-222222222201', 'brand@lumina-skincare.com', 'Sophia Chen', 'brand', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80', 'VP of Brand Marketing at Lumina Botanicals & NovaPulse Creative Agency.', 'San Francisco, USA', ARRAY['English'], 'Lumina Botanicals & NovaPulse', 'https://luminabotanicals.example.com', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.creator_profiles (creator_id, title, specialization, secondary_categories, skills, ai_tools, starting_price, availability, experience_years, experience_level, rating, review_count, completed_campaigns, featured)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'AI Commercial Film Director & Neural VFX Lead', 'AI Video Generation', ARRAY['AI Advertising Creatives', 'AI Storytelling'], ARRAY['Cinematic AI Video', 'Product Commercials', 'Color Grading', 'Prompt Choreography'], ARRAY['Runway Gen-3 Alpha', 'OpenAI Sora', 'ComfyUI', 'Flux.1 Pro'], 650.00, 'available', 6, 'expert', 4.95, 28, 34, true),
  ('11111111-1111-1111-1111-111111111102', 'Photorealistic AI Product Photographer & LoRA Specialist', 'AI Product Photography', ARRAY['AI Image Generation', 'AI Branding & Design'], ARRAY['Custom LoRA Training', 'Photorealistic Lighting', 'Cosmetics & Beverage Stills', '4K Upscaling'], ARRAY['Flux.1 Pro', 'Stable Diffusion XL', 'ComfyUI', 'Magnific AI'], 400.00, 'available', 5, 'expert', 4.92, 41, 52, true),
  ('11111111-1111-1111-1111-111111111103', 'Virtual AI Influencer & Digital Ambassador Architect', 'AI Influencers', ARRAY['AI Social Media Content', 'AI Video Generation'], ARRAY['Character Consistency', 'Virtual Brand Ambassadors', 'Lip-Sync Avatar Video'], ARRAY['Flux.1 Pro', 'ComfyUI', 'HeyGen', 'Kling AI'], 500.00, 'available', 4, 'senior', 4.88, 19, 24, true)
ON CONFLICT (creator_id) DO NOTHING;
