-- ============================================
-- Hungry Brunch Café & Restaurant Database
-- ============================================

CREATE DATABASE IF NOT EXISTS hungry_brunch;
USE hungry_brunch;

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url VARCHAR(500),
  available BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(200) NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  avatar_url VARCHAR(500),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(300),
  category ENUM('food', 'interior', 'events') DEFAULT 'food',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Opening hours table
CREATE TABLE IF NOT EXISTS opening_hours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  day_name VARCHAR(20) NOT NULL,
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE
);

-- ============================================
-- SEED DATA
-- ============================================

-- Seed categories
INSERT INTO categories (name, display_order) VALUES
('Breakfast', 1),
('Brunch', 2),
('Lunch', 3),
('Dinner', 4),
('Coffee', 5),
('Desserts', 6),
('Mocktails', 7),
('Special Items', 8)
ON DUPLICATE KEY UPDATE display_order = VALUES(display_order);

-- Seed admin (password: admin123)
INSERT INTO admins (username, password_hash) VALUES
('admin', '$2a$10$3kchD9GQgZEpZ0xbj8xZeeMaGsTO0uVupRBdPJO5LkhV9KIUJU5Be')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

-- Seed menu items
INSERT INTO menu_items (name, description, price, category, image_url, available, featured) VALUES
('Eggs Benedict', 'Poached eggs on toasted English muffin with Canadian bacon, topped with hollandaise sauce', 1850.00, 'Breakfast', 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400', TRUE, TRUE),
('Avocado Toast', 'Freshly smashed avocado on sourdough with cherry tomatoes, feta, and micro herbs', 1650.00, 'Breakfast', 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400', TRUE, TRUE),
('French Toast Stack', 'Thick brioche slices with maple syrup, fresh berries, and whipped cream', 1550.00, 'Breakfast', 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400', TRUE, FALSE),
('Full English Breakfast', 'Eggs, bacon, sausages, baked beans, mushrooms, grilled tomato and toast', 2200.00, 'Breakfast', 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400', TRUE, FALSE),
('Pancake Tower', 'Fluffy buttermilk pancakes stacked high with seasonal fruit and honey butter', 1450.00, 'Breakfast', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', TRUE, TRUE),

('Brunch Platter', 'A generous sharing board with smoked salmon, bagels, cream cheese, capers and pickles', 3200.00, 'Brunch', 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400', TRUE, TRUE),
('Shakshuka', 'Poached eggs in spiced tomato sauce with peppers, topped with crumbled feta', 1750.00, 'Brunch', 'https://images.unsplash.com/photo-1590585030990-b6b8b45f0e64?w=400', TRUE, FALSE),
('Smashed Potato Bowl', 'Crispy smashed potatoes with scrambled eggs, bacon bits, and sriracha aioli', 1900.00, 'Brunch', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', TRUE, FALSE),
('Acai Bowl', 'Blended açaí with banana base, topped with granola, fresh fruits, coconut flakes', 1600.00, 'Brunch', 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400', TRUE, TRUE),

('Grilled Chicken Wrap', 'Juicy grilled chicken with avocado, lettuce, tomato in a toasted whole-wheat wrap', 1850.00, 'Lunch', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400', TRUE, FALSE),
('Gourmet Burger', 'Wagyu beef patty with aged cheddar, caramelized onions, truffle mayo on brioche bun', 2600.00, 'Lunch', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', TRUE, TRUE),
('Caesar Salad', 'Romaine lettuce, house-made caesar dressing, parmesan shavings and sourdough croutons', 1500.00, 'Lunch', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', TRUE, FALSE),
('Pasta Carbonara', 'Al dente spaghetti with crispy pancetta, egg yolk sauce, black pepper and parmesan', 2100.00, 'Lunch', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400', TRUE, FALSE),

('Grilled Salmon', 'Atlantic salmon with lemon butter sauce, roasted vegetables and garlic mashed potato', 3800.00, 'Dinner', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', TRUE, TRUE),
('Lamb Rack', 'Herb-crusted rack of lamb with rosemary jus, fondant potato and seasonal greens', 4500.00, 'Dinner', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', TRUE, FALSE),
('Beef Tenderloin', 'Pan-seared beef tenderloin with mushroom duxelles, truffle sauce and potato gratin', 4800.00, 'Dinner', 'https://images.unsplash.com/photo-1558030006-450675393462?w=400', TRUE, TRUE),
('Prawn Linguine', 'Tiger prawns with cherry tomatoes, garlic, white wine and fresh basil over linguine', 3200.00, 'Dinner', 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400', TRUE, FALSE),

('Single Origin Espresso', 'A perfectly pulled shot of our house-blend Ethiopian single origin beans', 450.00, 'Coffee', 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400', TRUE, FALSE),
('Flat White', 'Silky microfoam milk over double ristretto, our signature coffee done right', 650.00, 'Coffee', 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400', TRUE, TRUE),
('Cold Brew', '24-hour cold steeped coffee, smooth and naturally sweet served over ice', 750.00, 'Coffee', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', TRUE, FALSE),
('Dalgona Whip Coffee', 'Whipped frothy coffee over iced milk, the viral sensation done properly', 850.00, 'Coffee', 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400', TRUE, FALSE),
('Matcha Latte', 'Ceremonial grade matcha whisked with steamed oat milk and a touch of vanilla', 850.00, 'Coffee', 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=400', TRUE, TRUE),

('Tiramisu', 'Classic Italian dessert with mascarpone, espresso-soaked ladyfingers and cocoa dusting', 1200.00, 'Desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', TRUE, TRUE),
('Crème Brûlée', 'Silky vanilla custard with a perfectly caramelized sugar crust, served warm', 1100.00, 'Desserts', 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400', TRUE, FALSE),
('Chocolate Lava Cake', 'Warm dark chocolate fondant with a molten center, served with vanilla ice cream', 1350.00, 'Desserts', 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400', TRUE, TRUE),
('Mango Cheesecake', 'No-bake New York cheesecake with fresh Alphonso mango coulis and graham crust', 1200.00, 'Desserts', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', TRUE, FALSE),

('Tropical Sunrise', 'Fresh mango, passionfruit, pineapple and orange juice with a grenadine sunrise', 750.00, 'Mocktails', 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', TRUE, TRUE),
('Virgin Mojito', 'Muddled mint, lime juice, sugar syrup and soda water over crushed ice', 680.00, 'Mocktails', 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400', TRUE, FALSE),
('Berry Blast Cooler', 'Mixed berry purée, lemonade and sparkling water with fresh berries garnish', 720.00, 'Mocktails', 'https://images.unsplash.com/photo-1505075106905-fb052892c116?w=400', TRUE, FALSE),
('Ceylon Iced Tea', 'Premium Ceylon black tea, honey, lemon and mint over ice — a local classic elevated', 580.00, 'Mocktails', 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400', TRUE, TRUE),

('Chef''s Tasting Board', 'A curated selection of today''s finest bites — ask your server for today''s selection', 4200.00, 'Special Items', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', TRUE, TRUE),
('Weekend Brunch Box', 'Family-style feast for two: eggs, pastries, sides and two drinks of your choice', 5500.00, 'Special Items', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', TRUE, FALSE),
('Sunset Set Menu', '3-course dinner with starter, main and dessert — changes seasonally', 6800.00, 'Special Items', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', TRUE, TRUE);

-- Seed reviews
INSERT INTO reviews (customer_name, rating, comment, is_featured) VALUES
('Amal Perera', 5, 'Absolutely the best brunch spot in Kandy! The Eggs Benedict was perfect and the coffee is out of this world. The atmosphere is so cozy and elegant. Will definitely be back!', TRUE),
('Priya Wickramasinghe', 5, 'Came here for my birthday and the staff made it so special. The Chef''s Tasting Board was a highlight. Stunning presentation and flavors to match. Kandy''s hidden gem!', TRUE),
('Rohan Fernando', 5, 'Finally a restaurant in Sri Lanka that matches international standards. The Gourmet Burger is incredible and the Cold Brew is the best I''ve ever had. Prices are very reasonable too.', TRUE),
('Dilani Jayawardena', 4, 'Beautiful interior, lovely ambiance. The pancake stack was divine. Service was attentive and friendly. Only minor wait on weekends but worth it!', TRUE),
('Kasun Silva', 5, 'The Beef Tenderloin for dinner was absolutely stunning. Perfectly cooked, beautiful plating. This restaurant deserves every star. A must-visit in Kandy.', TRUE),
('Nadeesha Rathnayake', 5, 'Brought my family here and everyone loved it. The kids enjoyed the French Toast and we adults were blown away by the Sunset Set Menu. Impeccable service!', TRUE),
('Thilina Bandara', 4, 'Great coffee, great food, great vibes. The Matcha Latte was silky smooth. The Tiramisu was the best I''ve had outside of Italy. Highly recommend!', TRUE),
('Chamari De Silva', 5, 'This place is magical. The attention to detail in every dish is remarkable. The Ceylon Iced Tea is a perfect twist on a local classic. 10/10!', TRUE);

-- Seed opening hours
INSERT INTO opening_hours (day_name, open_time, close_time, is_closed) VALUES
('Monday', '08:00:00', '22:00:00', FALSE),
('Tuesday', '08:00:00', '22:00:00', FALSE),
('Wednesday', '08:00:00', '22:00:00', FALSE),
('Thursday', '08:00:00', '22:00:00', FALSE),
('Friday', '08:00:00', '23:00:00', FALSE),
('Saturday', '07:30:00', '23:00:00', FALSE),
('Sunday', '07:30:00', '22:00:00', FALSE);

-- ============================================
-- RESERVATIONS TABLE (added)
-- ============================================
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(50),
  date DATE,
  time TIME,
  guests INT DEFAULT 2,
  message TEXT,
  status ENUM('new', 'confirmed', 'cancelled') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
