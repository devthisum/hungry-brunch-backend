// setup.js - Run this once on Railway console: node setup.js
const mysql = require('mysql2/promise');

async function setup() {
  // Try every possible Railway variable combination
  const host     = process.env.DB_HOST     || process.env.MYSQLHOST     || process.env.RAILWAY_TCP_PROXY_DOMAIN || 'localhost';
  const port     = parseInt(process.env.DB_PORT || process.env.MYSQLPORT || process.env.RAILWAY_TCP_PROXY_PORT || '3306');
  const user     = process.env.DB_USER     || process.env.MYSQLUSER     || 'root';
  const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || '';
  const database = process.env.DB_NAME     || process.env.MYSQLDATABASE || 'railway';

  console.log(`Connecting to: ${user}@${host}:${port}/${database}`);

  const conn = await mysql.createConnection({
    host, port, user, password, database,
    multipleStatements: true,
    connectTimeout: 30000,
  });

  console.log('✅ Connected!');

  // Create all tables
  await conn.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      image_url VARCHAR(500),
      available BOOLEAN DEFAULT TRUE,
      featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(200) NOT NULL,
      rating INT NOT NULL,
      comment TEXT,
      avatar_url VARCHAR(500),
      is_featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id INT AUTO_INCREMENT PRIMARY KEY,
      image_url VARCHAR(500) NOT NULL,
      caption VARCHAR(300),
      category ENUM('food','interior','events') DEFAULT 'food',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS opening_hours (
      id INT AUTO_INCREMENT PRIMARY KEY,
      day_name VARCHAR(20) NOT NULL,
      open_time TIME,
      close_time TIME,
      is_closed BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(200) NOT NULL,
      phone VARCHAR(50),
      date DATE,
      time TIME,
      guests INT DEFAULT 2,
      message TEXT,
      status ENUM('new','confirmed','cancelled') DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ All tables created');

  // Seed admin with correct password hash for admin123
  await conn.query(`
    INSERT INTO admins (username, password_hash) VALUES
    ('admin', '$2a$10$3kchD9GQgZEpZ0xbj8xZeeMaGsTO0uVupRBdPJO5LkhV9KIUJU5Be')
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);
  `);
  console.log('✅ Admin created (user: admin / pass: admin123)');

  // Seed categories
  await conn.query(`
    INSERT IGNORE INTO categories (name, display_order) VALUES
    ('Breakfast',1),('Brunch',2),('Lunch',3),('Dinner',4),
    ('Coffee',5),('Desserts',6),('Mocktails',7),('Special Items',8);
  `);
  console.log('✅ Categories seeded');

  // Seed menu items
  await conn.query(`
    INSERT IGNORE INTO menu_items (name, description, price, category, image_url, available, featured) VALUES
    ('Eggs Benedict','Poached eggs on toasted English muffin with Canadian bacon and hollandaise sauce',1850,'Breakfast','https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400',1,1),
    ('Avocado Toast','Freshly smashed avocado on sourdough with cherry tomatoes and feta',1650,'Breakfast','https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400',1,1),
    ('Pancake Tower','Fluffy buttermilk pancakes with seasonal fruit and honey butter',1450,'Breakfast','https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',1,1),
    ('Brunch Platter','Sharing board with smoked salmon, bagels, cream cheese and capers',3200,'Brunch','https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400',1,1),
    ('Acai Bowl','Blended acai with granola, fresh fruits and coconut flakes',1600,'Brunch','https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400',1,1),
    ('Gourmet Burger','Wagyu beef patty with aged cheddar and truffle mayo on brioche bun',2600,'Lunch','https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',1,1),
    ('Grilled Salmon','Atlantic salmon with lemon butter sauce and garlic mashed potato',3800,'Dinner','https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',1,1),
    ('Beef Tenderloin','Pan-seared beef tenderloin with mushroom duxelles and truffle sauce',4800,'Dinner','https://images.unsplash.com/photo-1558030006-450675393462?w=400',1,1),
    ('Flat White','Silky microfoam milk over double ristretto',650,'Coffee','https://images.unsplash.com/photo-1585515320310-259814833e62?w=400',1,1),
    ('Matcha Latte','Ceremonial grade matcha with steamed oat milk and vanilla',850,'Coffee','https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=400',1,1),
    ('Tiramisu','Classic Italian dessert with mascarpone and espresso-soaked ladyfingers',1200,'Desserts','https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',1,1),
    ('Chocolate Lava Cake','Warm dark chocolate fondant with vanilla ice cream',1350,'Desserts','https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',1,1),
    ('Tropical Sunrise','Fresh mango, passionfruit, pineapple and orange juice',750,'Mocktails','https://images.unsplash.com/photo-1546173159-315724a31696?w=400',1,1),
    ('Ceylon Iced Tea','Premium Ceylon black tea with honey and lemon over ice',580,'Mocktails','https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400',1,1),
    ('Chef Tasting Board','Curated selection of today finest bites',4200,'Special Items','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',1,1);
  `);
  console.log('✅ Menu items seeded');

  // Seed reviews
  await conn.query(`
    INSERT IGNORE INTO reviews (customer_name, rating, comment, is_featured) VALUES
    ('Amal Perera',5,'Absolutely the best brunch spot in Kandy! The Eggs Benedict was perfect.',1),
    ('Priya Wickramasinghe',5,'Stunning presentation and flavors to match. Kandys hidden gem!',1),
    ('Rohan Fernando',5,'Finally a restaurant in Sri Lanka that matches international standards.',1),
    ('Dilani Jayawardena',4,'Beautiful interior, lovely ambiance. The pancake stack was divine.',1),
    ('Kasun Silva',5,'The Beef Tenderloin for dinner was absolutely stunning.',1),
    ('Chamari De Silva',5,'This place is magical. The attention to detail in every dish is remarkable.',1);
  `);
  console.log('✅ Reviews seeded');

  // Seed opening hours
  await conn.query(`
    INSERT IGNORE INTO opening_hours (day_name, open_time, close_time, is_closed) VALUES
    ('Monday','08:00:00','22:00:00',0),
    ('Tuesday','08:00:00','22:00:00',0),
    ('Wednesday','08:00:00','22:00:00',0),
    ('Thursday','08:00:00','22:00:00',0),
    ('Friday','08:00:00','23:00:00',0),
    ('Saturday','07:30:00','23:00:00',0),
    ('Sunday','07:30:00','22:00:00',0);
  `);
  console.log('✅ Opening hours seeded');

  const [tables] = await conn.query('SHOW TABLES');
  console.log('\n📋 Tables in database:', tables.map(t => Object.values(t)[0]).join(', '));
  console.log('\n🎉 Setup complete! Your database is ready.');
  console.log('👤 Admin login: admin / admin123');

  await conn.end();
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
