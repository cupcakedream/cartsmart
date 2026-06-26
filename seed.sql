-- ============================================================
-- MealCart seed data — migrates your localStorage data to Neon
--
-- HOW TO RUN:
--   1. Open the Neon SQL Editor (console.neon.tech)
--   2. Replace 'YOUR_EMAIL_HERE' below with your sign-up email
--   3. Run the script
-- ============================================================

DO $$
DECLARE
  v_uid text := '8211b401-8dd6-4bdb-82af-b395540246d6';
BEGIN

  -- ── Ingredients ──────────────────────────────────────────

  INSERT INTO ingredients (id, user_id, name, department) VALUES
    ('b3102aae-4a90-4670-a067-779454a2c2cb', v_uid, 'Pesto',              'Pantry'),
    ('64fc96c6-c3ce-4ffa-b3f8-f231ace5c84f', v_uid, 'Brown Rice Pasta',   'Pantry'),
    ('057be02c-0ad0-477d-8c8c-68ec05d9913c', v_uid, 'Feta Cheese',        'Dairy & Eggs'),
    ('37039024-26dd-4ea0-bcff-2b5bedb7de37', v_uid, 'Black Olives',       'Pantry'),
    ('f9ed4d57-d944-4f85-a4cf-d5896cb98eed', v_uid, 'Ground Beef',        'Meat & Seafood'),
    ('d39e04b0-3aa6-48e7-90b4-2a12f62c3515', v_uid, 'Grated Cheese',      'Dairy & Eggs'),
    ('ad1483db-1713-4515-ae34-34378ae30425', v_uid, 'Brown Rice',         'Pantry'),
    ('08e5bfa9-f105-4da3-8218-9f7dc9b7d0b5', v_uid, 'Chipotle Seasoning', 'Pantry'),
    ('49e9bbf2-45bd-45bf-a112-d857113133fe', v_uid, 'Cottage Cheese',     'Dairy & Eggs'),
    ('b9ceeca5-a46b-4b58-a3ed-6a21775f312f', v_uid, 'Blueberries',        'Frozen'),
    ('97288365-089e-48b6-bd06-e4ac4ae0570a', v_uid, 'Honey',              'Pantry'),
    ('34654f4b-c50b-49de-b4b1-3d086b11661d', v_uid, 'Garbanzo Beans',     'Pantry'),
    ('d80c0ad8-592b-4fb3-942d-68b686b3b138', v_uid, 'Onions',             'Produce'),
    ('1295f1d0-242d-4059-a590-39a7f704200d', v_uid, 'Garlic',             'Produce'),
    ('963d1005-379f-4bb3-872a-40b7156e9363', v_uid, 'Ginger',             'Produce'),
    ('e5b72e52-7eec-451c-8897-54772ef66966', v_uid, 'Indian Spices',      'Pantry'),
    ('4de903cc-3907-4cb8-8320-91cf0f4f2e4e', v_uid, 'Tomato Sauce',       'Pantry'),
    ('2df32fb2-fe70-4dab-ae6d-d552fde6d3bf', v_uid, 'Turkey',             'Meat & Seafood'),
    ('b64ab04a-4c9a-4674-ad49-1b7c228b7a18', v_uid, 'Provologne',         'Dairy & Eggs'),
    ('ba7f780a-d5cf-4e11-a287-9b6f0aa90fe7', v_uid, 'Brown Mustard',      'Pantry'),
    ('358f6283-823b-4328-8a09-c52158c50d8b', v_uid, 'Wheat Bread',        'Pantry'),
    ('0d4d92f6-d619-4bef-9e59-36cb7b33003e', v_uid, 'Frozen Pizza',       'Frozen')
  ON CONFLICT (id) DO NOTHING;

  -- ── Meals ────────────────────────────────────────────────

  INSERT INTO meals (id, user_id, name, days_of_week) VALUES
    ('578fad50-9ce0-4ccd-b2a9-68905381bb74', v_uid, 'Mexican Beef & Rice',        '{}'),
    ('086a3d9a-41a7-445d-bba9-06a05748e672', v_uid, 'Cottage Cheese & Blueberries', '{"Monday","Tuesday","Wednesday"}'),
    ('06adbb55-ee01-4782-8b48-664b37d3f888', v_uid, 'Chana Masala',               '{"Monday","Thursday","Friday"}'),
    ('afe4721e-9a64-4a15-ae71-6af040e95122', v_uid, 'Turkey Sandwich & Chips',    '{"Monday","Tuesday","Thursday","Saturday"}'),
    ('e2dfa397-e898-4a50-a312-653b11ea6fe7', v_uid, 'Frozen Pizza',               '{"Wednesday"}')
  ON CONFLICT (id) DO NOTHING;

  -- ── Meal ingredients ─────────────────────────────────────

  INSERT INTO meal_ingredients (meal_id, ingredient_id, user_id) VALUES
    -- Mexican Beef & Rice
    ('578fad50-9ce0-4ccd-b2a9-68905381bb74', 'f9ed4d57-d944-4f85-a4cf-d5896cb98eed', v_uid),
    ('578fad50-9ce0-4ccd-b2a9-68905381bb74', 'ad1483db-1713-4515-ae34-34378ae30425', v_uid),
    ('578fad50-9ce0-4ccd-b2a9-68905381bb74', '08e5bfa9-f105-4da3-8218-9f7dc9b7d0b5', v_uid),
    -- Cottage Cheese & Blueberries
    ('086a3d9a-41a7-445d-bba9-06a05748e672', '49e9bbf2-45bd-45bf-a112-d857113133fe', v_uid),
    ('086a3d9a-41a7-445d-bba9-06a05748e672', 'b9ceeca5-a46b-4b58-a3ed-6a21775f312f', v_uid),
    ('086a3d9a-41a7-445d-bba9-06a05748e672', '97288365-089e-48b6-bd06-e4ac4ae0570a', v_uid),
    -- Chana Masala
    ('06adbb55-ee01-4782-8b48-664b37d3f888', '34654f4b-c50b-49de-b4b1-3d086b11661d', v_uid),
    ('06adbb55-ee01-4782-8b48-664b37d3f888', '1295f1d0-242d-4059-a590-39a7f704200d', v_uid),
    ('06adbb55-ee01-4782-8b48-664b37d3f888', 'd80c0ad8-592b-4fb3-942d-68b686b3b138', v_uid),
    ('06adbb55-ee01-4782-8b48-664b37d3f888', 'e5b72e52-7eec-451c-8897-54772ef66966', v_uid),
    ('06adbb55-ee01-4782-8b48-664b37d3f888', '963d1005-379f-4bb3-872a-40b7156e9363', v_uid),
    -- Turkey Sandwich & Chips
    ('afe4721e-9a64-4a15-ae71-6af040e95122', '2df32fb2-fe70-4dab-ae6d-d552fde6d3bf', v_uid),
    ('afe4721e-9a64-4a15-ae71-6af040e95122', 'b64ab04a-4c9a-4674-ad49-1b7c228b7a18', v_uid),
    ('afe4721e-9a64-4a15-ae71-6af040e95122', 'ba7f780a-d5cf-4e11-a287-9b6f0aa90fe7', v_uid),
    ('afe4721e-9a64-4a15-ae71-6af040e95122', '358f6283-823b-4328-8a09-c52158c50d8b', v_uid),
    -- Frozen Pizza
    ('e2dfa397-e898-4a50-a312-653b11ea6fe7', '0d4d92f6-d619-4bef-9e59-36cb7b33003e', v_uid)
  ON CONFLICT (meal_id, ingredient_id) DO NOTHING;

  -- ── Meal plans ───────────────────────────────────────────

  INSERT INTO meal_plans (id, user_id, name, meal_days, created_at, updated_at) VALUES
    (
      '9f9ccbcf-9037-4634-b1f9-4159dabc5005', v_uid, 'My meal plan',
      '{"086a3d9a-41a7-445d-bba9-06a05748e672":["Monday","Tuesday","Wednesday"],"06adbb55-ee01-4782-8b48-664b37d3f888":["Monday","Thursday","Friday"],"afe4721e-9a64-4a15-ae71-6af040e95122":["Monday","Tuesday","Thursday","Saturday"],"e2dfa397-e898-4a50-a312-653b11ea6fe7":["Wednesday"]}',
      '2026-06-25T18:53:35.131Z', '2026-06-25T18:53:35.131Z'
    ),
    (
      'd1bc3a4a-1f71-4730-ae29-04b97469f531', v_uid, 'New Meal Plan',
      '{"06adbb55-ee01-4782-8b48-664b37d3f888":["Thursday","Friday"],"086a3d9a-41a7-445d-bba9-06a05748e672":["Thursday"],"e2dfa397-e898-4a50-a312-653b11ea6fe7":["Friday"],"578fad50-9ce0-4ccd-b2a9-68905381bb74":["Thursday","Friday"]}',
      '2026-06-25T18:53:35.131Z', '2026-06-25T19:25:51.901Z'
    )
  ON CONFLICT (id) DO NOTHING;

  -- ── Shopping lists ───────────────────────────────────────

  INSERT INTO shopping_lists (id, user_id, name, created_at, updated_at) VALUES
    ('6aa86c34-47c5-46b0-ae5e-5e25247eb87b', v_uid, 'June 24 List',  '2026-06-24T16:20:15.695Z', '2026-06-25T18:34:06.869Z'),
    ('3e56e874-d7b6-44e1-bec5-a6417a4cc51c', v_uid, 'Party Shopping', '2026-06-24T16:21:41.936Z', '2026-06-24T17:34:50.973Z')
  ON CONFLICT (id) DO NOTHING;

  -- ── Shopping list ingredients ─────────────────────────────

  INSERT INTO shopping_list_ingredients (list_id, ingredient_id, user_id, checked) VALUES
    -- June 24 List (all unchecked)
    ('6aa86c34-47c5-46b0-ae5e-5e25247eb87b', 'b3102aae-4a90-4670-a067-779454a2c2cb', v_uid, false),
    ('6aa86c34-47c5-46b0-ae5e-5e25247eb87b', '64fc96c6-c3ce-4ffa-b3f8-f231ace5c84f', v_uid, false),
    ('6aa86c34-47c5-46b0-ae5e-5e25247eb87b', '057be02c-0ad0-477d-8c8c-68ec05d9913c', v_uid, false),
    ('6aa86c34-47c5-46b0-ae5e-5e25247eb87b', '37039024-26dd-4ea0-bcff-2b5bedb7de37', v_uid, false),
    ('6aa86c34-47c5-46b0-ae5e-5e25247eb87b', 'f9ed4d57-d944-4f85-a4cf-d5896cb98eed', v_uid, false),
    ('6aa86c34-47c5-46b0-ae5e-5e25247eb87b', '08e5bfa9-f105-4da3-8218-9f7dc9b7d0b5', v_uid, false),
    ('6aa86c34-47c5-46b0-ae5e-5e25247eb87b', '2df32fb2-fe70-4dab-ae6d-d552fde6d3bf', v_uid, false),
    ('6aa86c34-47c5-46b0-ae5e-5e25247eb87b', 'b64ab04a-4c9a-4674-ad49-1b7c228b7a18', v_uid, false),
    ('6aa86c34-47c5-46b0-ae5e-5e25247eb87b', 'ba7f780a-d5cf-4e11-a287-9b6f0aa90fe7', v_uid, false),
    ('6aa86c34-47c5-46b0-ae5e-5e25247eb87b', '358f6283-823b-4328-8a09-c52158c50d8b', v_uid, false),
    ('6aa86c34-47c5-46b0-ae5e-5e25247eb87b', '0d4d92f6-d619-4bef-9e59-36cb7b33003e', v_uid, false),
    -- Party Shopping (all unchecked)
    ('3e56e874-d7b6-44e1-bec5-a6417a4cc51c', 'b3102aae-4a90-4670-a067-779454a2c2cb', v_uid, false),
    ('3e56e874-d7b6-44e1-bec5-a6417a4cc51c', '64fc96c6-c3ce-4ffa-b3f8-f231ace5c84f', v_uid, false),
    ('3e56e874-d7b6-44e1-bec5-a6417a4cc51c', '057be02c-0ad0-477d-8c8c-68ec05d9913c', v_uid, false),
    ('3e56e874-d7b6-44e1-bec5-a6417a4cc51c', '37039024-26dd-4ea0-bcff-2b5bedb7de37', v_uid, false),
    ('3e56e874-d7b6-44e1-bec5-a6417a4cc51c', 'f9ed4d57-d944-4f85-a4cf-d5896cb98eed', v_uid, false),
    ('3e56e874-d7b6-44e1-bec5-a6417a4cc51c', 'ad1483db-1713-4515-ae34-34378ae30425', v_uid, false),
    ('3e56e874-d7b6-44e1-bec5-a6417a4cc51c', '08e5bfa9-f105-4da3-8218-9f7dc9b7d0b5', v_uid, false),
    ('3e56e874-d7b6-44e1-bec5-a6417a4cc51c', '34654f4b-c50b-49de-b4b1-3d086b11661d', v_uid, false),
    ('3e56e874-d7b6-44e1-bec5-a6417a4cc51c', '1295f1d0-242d-4059-a590-39a7f704200d', v_uid, false)
  ON CONFLICT (list_id, ingredient_id) DO NOTHING;

  -- ── User preferences ─────────────────────────────────────

  INSERT INTO user_preferences (user_id, current_shopping_list_id, current_meal_plan_id) VALUES
    (v_uid, '6aa86c34-47c5-46b0-ae5e-5e25247eb87b', 'd1bc3a4a-1f71-4730-ae29-04b97469f531')
  ON CONFLICT (user_id) DO UPDATE
    SET current_shopping_list_id = EXCLUDED.current_shopping_list_id,
        current_meal_plan_id     = EXCLUDED.current_meal_plan_id;

  RAISE NOTICE 'Seed complete for user %', v_uid;
END;
$$;
