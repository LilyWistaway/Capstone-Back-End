-- Wistaway Mini (Backend) - Seed Data
-- NOTE: Categories are placeholders. We will replace these with researched, investor-resonant names.

INSERT INTO categories (name) VALUES
  ('Cozy Cabins'),
  ('Artistic Getaways'),
  ('Beach Vacation'),
  ('Ski Vacation'),
  ('Wellness Retreat');

-- Lodging properties: 15 per category maximum.
-- For now, seed 3 per category (15 total) to validate schema quickly.
-- We will expand to up to 15 per category once categories are finalized.

INSERT INTO lodging_properties (
  name, location, description, category_id, budget_tier, best_season, typical_stay_days, image_url
) VALUES
  -- Cozy Cabins (category_id 1)
  ('Pine Hollow Cabin', 'Colorado, USA', 'A quiet cabin tucked into pine forest with a wood stove and hot tub.', 1, 2, 'winter', 3, NULL),
  ('Maple Ridge Lodge', 'Vermont, USA', 'A cozy, design-forward lodge near trails and small towns.', 1, 2, 'fall', 4, NULL),
  ('Riverside Tiny Cabin', 'Oregon, USA', 'Minimalist tiny cabin with river views and outdoor soaking tub.', 1, 2, 'spring', 3, NULL),

  -- Artistic Getaways (category_id 2)
  ('Studio House Retreat', 'Santa Fe, USA', 'An art-filled property with studio space and desert light.', 2, 3, 'spring', 4, NULL),
  ('Gallery Loft Stay', 'Lisbon, Portugal', 'A loft above a small gallery, walkable to cafes and museums.', 2, 2, 'spring', 5, NULL),
  ('Writers Cottage', 'Edinburgh, Scotland', 'A quiet cottage designed for reading, writing, and long walks.', 2, 2, 'fall', 4, NULL),

  -- Beach Vacation (category_id 3)
  ('Sea Glass Bungalow', 'Tulum, Mexico', 'A breezy bungalow near the beach with simple luxury.', 3, 3, 'winter', 5, NULL),
  ('Coral Cove Villa', 'Maui, USA', 'A villa with ocean views and easy access to beaches.', 3, 3, 'summer', 6, NULL),
  ('Dune House Stay', 'Outer Banks, USA', 'A bright beach house steps from the dunes.', 3, 2, 'summer', 5, NULL),

  -- Ski Vacation (category_id 4)
  ('Alpine Chalet', 'Whistler, Canada', 'A ski-in/ski-out chalet built for groups and après-ski.', 4, 3, 'winter', 4, NULL),
  ('Snowline Lodge', 'Park City, USA', 'A lodge near slopes with sauna and fireplace lounge.', 4, 3, 'winter', 4, NULL),
  ('Summit Studio', 'Chamonix, France', 'A compact studio with mountain views and lift access.', 4, 2, 'winter', 3, NULL),

  -- Wellness Retreat (category_id 5)
  ('Desert Spa Casita', 'Joshua Tree, USA', 'A calm casita with soaking tub and outdoor meditation deck.', 5, 2, 'spring', 3, NULL),
  ('Forest Bathing Lodge', 'British Columbia, Canada', 'A quiet property designed for nature immersion and rest.', 5, 3, 'summer', 4, NULL),
  ('Hot Springs Hideaway', 'Iceland', 'A restorative stay near geothermal pools and slow mornings.', 5, 3, 'winter', 4, NULL);
