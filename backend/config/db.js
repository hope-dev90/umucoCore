import pg from "pg";
import config from "./env.js";

const { Pool } = pg;

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased to 10 seconds for cloud databases
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const ensureAuthSchema = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255),
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      is_verified BOOLEAN DEFAULT false,
      otp VARCHAR(6),
      otp_expires TIMESTAMPTZ,
      google_id VARCHAR(255),
      bio TEXT,
      interests TEXT[] DEFAULT '{}',
      language VARCHAR(100) DEFAULT 'English (UK)',
      avatar VARCHAR(255),
      notifications JSONB DEFAULT '{"archiveUpdates": true, "newsletter": true, "eventReminders": true}'::jsonb,
      accessibility JSONB DEFAULT '{"fontSize": "medium", "highContrast": false, "reduceMotion": false}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'user';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(6);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMPTZ;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(100) DEFAULT 'English (UK)';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '{"archiveUpdates": true, "newsletter": true, "eventReminders": true}'::jsonb;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS accessibility JSONB DEFAULT '{"fontSize": "medium", "highContrast": false, "reduceMotion": false}'::jsonb;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    -- New columns for gamification and explorer type
    ALTER TABLE users ADD COLUMN IF NOT EXISTS explorer_type VARCHAR(50);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS total_days INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_date DATE;

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
  `);
};

const ensureGamificationSchema = async (client) => {
  await client.query(`
    -- Levels configuration
    CREATE TABLE IF NOT EXISTS levels (
      id SERIAL PRIMARY KEY,
      level INTEGER UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      required_xp INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Badges
    CREATE TABLE IF NOT EXISTS badges (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      icon VARCHAR(255),
      rarity VARCHAR(50) DEFAULT 'common',
      xp_reward INTEGER DEFAULT 0,
      trigger_type VARCHAR(50),
      trigger_value INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE badges ADD COLUMN IF NOT EXISTS trigger_type VARCHAR(50);
    ALTER TABLE badges ADD COLUMN IF NOT EXISTS trigger_value INTEGER;

    -- User badges
    CREATE TABLE IF NOT EXISTS user_badges (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
      unlocked_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, badge_id)
    );

    -- Achievements
    CREATE TABLE IF NOT EXISTS achievements (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      type VARCHAR(50) DEFAULT 'progress',
      target_value INTEGER,
      xp_reward INTEGER DEFAULT 0,
      is_hidden BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- User achievements
    CREATE TABLE IF NOT EXISTS user_achievements (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
      current_progress INTEGER DEFAULT 0,
      unlocked_at TIMESTAMPTZ,
      UNIQUE(user_id, achievement_id)
    );

    -- Collectibles
    CREATE TABLE IF NOT EXISTS collectibles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      icon VARCHAR(255),
      rarity VARCHAR(50) DEFAULT 'common',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- User collectibles
    CREATE TABLE IF NOT EXISTS user_collectibles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      collectible_id INTEGER REFERENCES collectibles(id) ON DELETE CASCADE,
      obtained_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, collectible_id)
    );

    -- XP Logs
    CREATE TABLE IF NOT EXISTS xp_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      reason VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Daily Streaks
    CREATE TABLE IF NOT EXISTS daily_streaks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      login_date DATE NOT NULL,
      UNIQUE(user_id, login_date)
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Reward history
    CREATE TABLE IF NOT EXISTS reward_history (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      reward_type VARCHAR(50) NOT NULL,
      reward_data JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Bookmarks
    CREATE TABLE IF NOT EXISTS bookmarks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      item_type VARCHAR(50) NOT NULL,
      item_id INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, item_type, item_id)
    );

    -- Reading history
    CREATE TABLE IF NOT EXISTS reading_history (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      item_type VARCHAR(50) NOT NULL,
      item_id INTEGER NOT NULL,
      xp_earned INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Activity tracking for real usage, XP, and badge triggers
    CREATE TABLE IF NOT EXISTS user_activity_log (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      activity_type VARCHAR(50) NOT NULL,
      item_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, activity_type, item_id)
    );

    CREATE TABLE IF NOT EXISTS user_activity_counts (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      activity_type VARCHAR(50) NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY(user_id, activity_type)
    );

    CREATE INDEX IF NOT EXISTS idx_user_activity_log_user ON user_activity_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_activity_log_type ON user_activity_log(activity_type);
    CREATE INDEX IF NOT EXISTS idx_user_activity_log_created ON user_activity_log(created_at);

    -- Insert default levels
    INSERT INTO levels (level, name, required_xp) VALUES 
      (1, 'Village Child', 0),
      (2, 'Story Seeker', 500),
      (3, 'Tradition Keeper', 1500),
      (4, 'Culture Guardian', 3500),
      (5, 'Master Griot', 7000),
      (6, 'Legend of Rwanda', 15000)
    ON CONFLICT (level) DO NOTHING;

    -- Insert default badges
    INSERT INTO badges (name, description, icon, rarity, xp_reward) VALUES
      ('First Story', 'Read your first story', '📖', 'common', 50),
      ('7 Day Streak', 'Log in 7 days in a row', '🔥', 'rare', 100),
      ('Royal Reader', 'Reach level 4', '👑', 'epic', 200),
      ('Wildlife Expert', 'Collect 5 nature-related collectibles', '🦍', 'rare', 150),
      ('Culture Legend', 'Reach level 6', '🏆', 'legendary', 500)
    ON CONFLICT DO NOTHING;

    -- Insert default collectibles
    INSERT INTO collectibles (name, description, icon, rarity) VALUES
      ('Inanga Harp', 'The traditional Rwandan harp', '🎵', 'common'),
      ('Agaseke Peace Basket', 'Symbol of peace and prosperity', '🧺', 'common'),
      ('Royal Crown', 'Worn by Rwandan kings', '👑', 'rare'),
      ('Drum', 'Traditional Rwandan drum', '🥁', 'common'),
      ('Cow Bell', 'Used in traditional ceremonies', '🔔', 'common'),
      ('Clay Pot', 'Traditional pottery', '🏺', 'uncommon'),
      ('Spear', 'Symbol of warrior heritage', '⚔️', 'rare')
    ON CONFLICT DO NOTHING;
  `);
};

const ensureHeritageSchema = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS heritage_items (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      location VARCHAR(255),
      lat NUMERIC(10,6),
      lng NUMERIC(10,6),
      description TEXT,
      image_url VARCHAR(255),
      era VARCHAR(100),
      region VARCHAR(100),
      created_by INTEGER REFERENCES users(id),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      event_date DATE NOT NULL,
      event_type VARCHAR(100) NOT NULL,
      location VARCHAR(255),
      is_featured BOOLEAN DEFAULT false,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS collections (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      image_url VARCHAR(255),
      curated_by VARCHAR(255),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS kwibuka_content (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      content TEXT,
      media_url VARCHAR(255),
      date DATE,
      is_featured BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audio_content (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      audio_url VARCHAR(255) NOT NULL,
      thumbnail_url VARCHAR(255),
      duration INTEGER,
      category VARCHAR(100),
      is_featured BOOLEAN DEFAULT false,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS video_content (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      video_url VARCHAR(255) NOT NULL,
      thumbnail_url VARCHAR(255),
      duration INTEGER,
      category VARCHAR(100),
      is_featured BOOLEAN DEFAULT false,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS news_posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      summary TEXT,
      body TEXT,
      image_url VARCHAR(255),
      category VARCHAR(100),
      status VARCHAR(30) DEFAULT 'draft',
      is_featured BOOLEAN DEFAULT false,
      created_by INTEGER REFERENCES users(id),
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_heritage_category ON heritage_items(category);
    CREATE INDEX IF NOT EXISTS idx_heritage_location ON heritage_items(location);
    CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar_events(event_date);
    CREATE INDEX IF NOT EXISTS idx_collections_category ON collections(category);
    CREATE INDEX IF NOT EXISTS idx_audio_category ON audio_content(category);
    CREATE INDEX IF NOT EXISTS idx_video_category ON video_content(category);
    CREATE INDEX IF NOT EXISTS idx_news_status ON news_posts(status);
    CREATE INDEX IF NOT EXISTS idx_news_category ON news_posts(category);

    CREATE TABLE IF NOT EXISTS saved_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      item_type VARCHAR(50) NOT NULL,
      item_id INTEGER NOT NULL,
      item_title VARCHAR(255),
      item_subtitle VARCHAR(255),
      item_image VARCHAR(255),
      item_meta JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, item_type, item_id)
    );

    CREATE TABLE IF NOT EXISTS proverbs (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      translation TEXT,
      language VARCHAR(50) DEFAULT 'Kinyarwanda',
      category VARCHAR(100),
      source VARCHAR(255),
      is_featured BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_proverbs_language ON proverbs(language);
    CREATE INDEX IF NOT EXISTS idx_proverbs_category ON proverbs(category);

    CREATE TABLE IF NOT EXISTS exercises (
      id SERIAL PRIMARY KEY,
      item_type VARCHAR(50) NOT NULL,
      item_id INTEGER,
      title VARCHAR(255) NOT NULL,
      prompt TEXT NOT NULL,
      choices JSONB DEFAULT '[]'::jsonb,
      answer TEXT,
      explanation TEXT,
      translations JSONB DEFAULT '{}'::jsonb,
      difficulty VARCHAR(50) DEFAULT 'Beginner',
      is_active BOOLEAN DEFAULT true,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE exercises ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

    CREATE INDEX IF NOT EXISTS idx_exercises_item ON exercises(item_type, item_id);
    CREATE INDEX IF NOT EXISTS idx_exercises_active ON exercises(is_active);

    INSERT INTO exercises (item_type, item_id, title, prompt, choices, answer, explanation, difficulty, is_active)
    SELECT 'story', NULL, 'Gihanga Origin Check',
           'What does the name Gihanga mean in Rwandan oral tradition?',
           '["Founder or creator","Rain maker","Keeper of cattle","Royal drummer"]'::jsonb,
           'Founder or creator',
           'Gihanga is remembered as a founding figure connected with creation, crafts, and early kingdom memory.',
           'Beginner',
           true
    WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE title = 'Gihanga Origin Check');

    INSERT INTO exercises (item_type, item_id, title, prompt, choices, answer, explanation, difficulty, is_active)
    SELECT 'story', NULL, 'Ruganzu Return Question',
           'What lesson is strongest in the story of Ruganzu II Ndoli?',
           '["Courage and wise leadership","Avoiding community work","Forgetting oral history","Rejecting tradition"]'::jsonb,
           'Courage and wise leadership',
           'The story highlights resilience, strategy, and a leader returning to restore his people.',
           'Beginner',
           true
    WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE title = 'Ruganzu Return Question');

    INSERT INTO exercises (item_type, item_id, title, prompt, choices, answer, explanation, difficulty, is_active)
    SELECT 'proverb', NULL, 'Imigani Meaning Practice',
           'Why are imigani important in Rwandan culture?',
           '["They teach values through short sayings","They replace all songs","They are only used in markets","They are modern passwords"]'::jsonb,
           'They teach values through short sayings',
           'Imigani preserve wisdom, social values, humor, and memory in short memorable lines.',
           'Beginner',
           true
    WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE title = 'Imigani Meaning Practice');

    INSERT INTO exercises (item_type, item_id, title, prompt, choices, answer, explanation, difficulty, is_active)
    SELECT 'audio', NULL, 'Inanga Listening Check',
           'Which instrument is closely connected with poetic storytelling in Rwanda?',
           '["Inanga","Electric guitar","Saxophone","Trumpet"]'::jsonb,
           'Inanga',
           'The inanga is a traditional string instrument often associated with sung poetry and storytelling.',
           'Beginner',
           true
    WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE title = 'Inanga Listening Check');

    INSERT INTO exercises (item_type, item_id, title, prompt, choices, answer, explanation, difficulty, is_active)
    SELECT 'heritage', NULL, 'Royal Palace Heritage Check',
           'What does the Nyanza royal palace help visitors understand?',
           '["Royal life, ceremonies, and architecture","Only modern banking","Ocean trade routes","Computer programming"]'::jsonb,
           'Royal life, ceremonies, and architecture',
           'The palace is a heritage site connected to Rwanda''s monarchy, court culture, and traditional architecture.',
           'Intermediate',
           true
    WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE title = 'Royal Palace Heritage Check');

    UPDATE exercises
    SET translations = '{
      "en": {
        "title": "Gihanga Origin Check",
        "prompt": "What does the name Gihanga mean in Rwandan oral tradition?",
        "choices": ["Founder or creator", "Rain maker", "Keeper of cattle", "Royal drummer"],
        "answer": "Founder or creator",
        "explanation": "Gihanga is remembered as a founding figure connected with creation, crafts, and early kingdom memory."
      },
      "rw": {
        "title": "Ikibazo ku nkomoko ya Gihanga",
        "prompt": "Izina Gihanga risobanura iki mu muco wo mu Rwanda?",
        "choices": ["Uwashinze cyangwa uwaremye", "Utera imvura", "Umutunzi w inka", "Umwiru w ingoma"],
        "answer": "Uwashinze cyangwa uwaremye",
        "explanation": "Gihanga yibukwa nk umuntu w inkomoko ufitanye isano no guhanga, ubukorikori n amateka ya mbere y ubwami."
      },
      "fr": {
        "title": "Question sur l origine de Gihanga",
        "prompt": "Que signifie le nom Gihanga dans la tradition orale rwandaise ?",
        "choices": ["Fondateur ou createur", "Faiseur de pluie", "Gardien du betail", "Tambourinaire royal"],
        "answer": "Fondateur ou createur",
        "explanation": "Gihanga est garde en memoire comme une figure fondatrice liee a la creation, aux metiers et aux premieres memoires du royaume."
      }
    }'::jsonb
    WHERE title = 'Gihanga Origin Check';

    UPDATE exercises
    SET translations = '{
      "en": {
        "title": "Ruganzu Return Question",
        "prompt": "What lesson is strongest in the story of Ruganzu II Ndoli?",
        "choices": ["Courage and wise leadership", "Avoiding community work", "Forgetting oral history", "Rejecting tradition"],
        "answer": "Courage and wise leadership",
        "explanation": "The story highlights resilience, strategy, and a leader returning to restore his people."
      },
      "rw": {
        "title": "Ikibazo ku kugaruka kwa Ruganzu",
        "prompt": "Ni irihe somo rikomeye mu nkuru ya Ruganzu II Ndoli?",
        "choices": ["Ubutwari n ubuyobozi bwiza", "Kwirinda umuganda", "Kwibagirwa amateka yo mu mvugo", "Kwanga umuco"],
        "answer": "Ubutwari n ubuyobozi bwiza",
        "explanation": "Inkuru igaragaza kudacika intege, ubwenge n umuyobozi ugaruka kugarura abantu be."
      },
      "fr": {
        "title": "Question sur le retour de Ruganzu",
        "prompt": "Quelle lecon domine dans l histoire de Ruganzu II Ndoli ?",
        "choices": ["Courage et leadership sage", "Eviter le travail communautaire", "Oublier l histoire orale", "Rejeter la tradition"],
        "answer": "Courage et leadership sage",
        "explanation": "Le recit met en avant la resilience, la strategie et le retour d un dirigeant pour restaurer son peuple."
      }
    }'::jsonb
    WHERE title = 'Ruganzu Return Question';

    UPDATE exercises
    SET translations = '{
      "en": {
        "title": "Imigani Meaning Practice",
        "prompt": "Why are imigani important in Rwandan culture?",
        "choices": ["They teach values through short sayings", "They replace all songs", "They are only used in markets", "They are modern passwords"],
        "answer": "They teach values through short sayings",
        "explanation": "Imigani preserve wisdom, social values, humor, and memory in short memorable lines."
      },
      "rw": {
        "title": "Umwitozo ku gisobanuro cy imigani",
        "prompt": "Kuki imigani ari ingenzi mu muco nyarwanda?",
        "choices": ["Yigisha indangagaciro mu magambo magufi", "Isimbura indirimbo zose", "Ikoreshwa mu masoko gusa", "Ni amagambo banga ya none"],
        "answer": "Yigisha indangagaciro mu magambo magufi",
        "explanation": "Imigani ibika ubwenge, indangagaciro, urwenya n ubwibuke mu magambo magufi yibukwa."
      },
      "fr": {
        "title": "Exercice sur le sens des imigani",
        "prompt": "Pourquoi les imigani sont-ils importants dans la culture rwandaise ?",
        "choices": ["Ils enseignent des valeurs par de courts dictons", "Ils remplacent toutes les chansons", "Ils servent seulement aux marches", "Ce sont des mots de passe modernes"],
        "answer": "Ils enseignent des valeurs par de courts dictons",
        "explanation": "Les imigani conservent sagesse, valeurs sociales, humour et memoire dans des phrases courtes."
      }
    }'::jsonb
    WHERE title = 'Imigani Meaning Practice';

    UPDATE exercises
    SET translations = '{
      "en": {
        "title": "Inanga Listening Check",
        "prompt": "Which instrument is closely connected with poetic storytelling in Rwanda?",
        "choices": ["Inanga", "Electric guitar", "Saxophone", "Trumpet"],
        "answer": "Inanga",
        "explanation": "The inanga is a traditional string instrument often associated with sung poetry and storytelling."
      },
      "rw": {
        "title": "Ikibazo cyo kumva inanga",
        "prompt": "Ni ikihe gikoresho gifitanye isano n ubusizi n inkuru mu Rwanda?",
        "choices": ["Inanga", "Gitari y amashanyarazi", "Sakizofoni", "Tarumbeta"],
        "answer": "Inanga",
        "explanation": "Inanga ni igikoresho gakondo cy imirya gikunze guherekeza ibisigo n inkuru ziririmbwa."
      },
      "fr": {
        "title": "Question d ecoute sur l inanga",
        "prompt": "Quel instrument est fortement lie au recit poetique au Rwanda ?",
        "choices": ["Inanga", "Guitare electrique", "Saxophone", "Trompette"],
        "answer": "Inanga",
        "explanation": "L inanga est un instrument traditionnel a cordes souvent associe a la poesie chantee et au recit."
      }
    }'::jsonb
    WHERE title = 'Inanga Listening Check';

    UPDATE exercises
    SET translations = '{
      "en": {
        "title": "Royal Palace Heritage Check",
        "prompt": "What does the Nyanza royal palace help visitors understand?",
        "choices": ["Royal life, ceremonies, and architecture", "Only modern banking", "Ocean trade routes", "Computer programming"],
        "answer": "Royal life, ceremonies, and architecture",
        "explanation": "The palace is a heritage site connected to Rwanda s monarchy, court culture, and traditional architecture."
      },
      "rw": {
        "title": "Ikibazo ku ngoro y ubwami",
        "prompt": "Ingoro y Ubwami ya Nyanza ifasha abashyitsi kumva iki?",
        "choices": ["Ubuzima bw ibwami, imihango n ubwubatsi", "Banki zo muri iki gihe gusa", "Ubucuruzi bwo mu nyanja", "Porogaramu za mudasobwa"],
        "answer": "Ubuzima bw ibwami, imihango n ubwubatsi",
        "explanation": "Iyo ngoro ni ahantu h umurage hafitanye isano n ubwami bw u Rwanda, umuco w ibwami n ubwubatsi gakondo."
      },
      "fr": {
        "title": "Question sur le palais royal",
        "prompt": "Que permet de comprendre le palais royal de Nyanza ?",
        "choices": ["La vie royale, les ceremonies et l architecture", "Seulement la banque moderne", "Les routes commerciales maritimes", "La programmation informatique"],
        "answer": "La vie royale, les ceremonies et l architecture",
        "explanation": "Le palais est un site patrimonial lie a la monarchie rwandaise, a la culture de cour et a l architecture traditionnelle."
      }
    }'::jsonb
    WHERE title = 'Royal Palace Heritage Check';

    CREATE TABLE IF NOT EXISTS contributions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      contributor_name VARCHAR(255) NOT NULL,
      contributor_email VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255),
      item_type VARCHAR(50),
      item_id INTEGER,
      file_url VARCHAR(255),
      file_name VARCHAR(255),
      file_size INTEGER,
      mime_type VARCHAR(100),
      description TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE contributions ADD COLUMN IF NOT EXISTS item_type VARCHAR(50);
    ALTER TABLE contributions ADD COLUMN IF NOT EXISTS item_id INTEGER;

    CREATE INDEX IF NOT EXISTS idx_contributions_type ON contributions(type);
    CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
    CREATE INDEX IF NOT EXISTS idx_contributions_user ON contributions(user_id);
  `);
};

export const connectDB = async () => {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to connect to database... (attempt ${attempt}/${maxRetries})`);
      console.log('Database config:', {
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        user: config.db.user,
        password: config.db.password ? '***' : 'undefined'
      });
      
      const client = await pool.connect();
      console.log(`✓ Connected to PostgreSQL database: ${config.db.database}`);
      // Run schema setups in parallel — they touch different tables
      await ensureAuthSchema(client);
      await ensureHeritageSchema(client);
      await ensureGamificationSchema(client);
      client.release();
      return; // Success, exit the function
    } catch (error) {
      console.error(`✗ Attempt ${attempt}/${maxRetries} failed:`);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error("✗ Failed to connect to database after all retries:");
        console.error("Full error:", error);
        console.error("\nPossible solutions:");
        console.error("1. Check if your Neon database is active (not paused)");
        console.error("2. Verify the DATABASE_URL in .env is correct");
        console.error("3. Check your network connection");
        console.error("4. Try connecting via psql to verify credentials");
        process.exit(1);
      }
    }
  }
};

export default pool;
