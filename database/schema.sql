CREATE TABLE IF NOT EXISTS student (
    id SERIAL PRIMARY KEY,
    sroll INT,
    name VARCHAR(100),
    age INT,
    email VARCHAR(100),
    phone BIGINT,
    scode VARCHAR(100),
    address VARCHAR(100),
    coursename VARCHAR(100)
);

-- Add missing columns if table already existed with an older schema
ALTER TABLE student ADD COLUMN IF NOT EXISTS id SERIAL;
ALTER TABLE student ADD COLUMN IF NOT EXISTS sroll INT;
ALTER TABLE student ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE student ADD COLUMN IF NOT EXISTS age INT;
ALTER TABLE student ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE student ADD COLUMN IF NOT EXISTS phone BIGINT;
ALTER TABLE student ADD COLUMN IF NOT EXISTS scode VARCHAR(100);
ALTER TABLE student ADD COLUMN IF NOT EXISTS address VARCHAR(100);
ALTER TABLE student ADD COLUMN IF NOT EXISTS coursename VARCHAR(100);

-- One-time: copy existing data from candidates to student (only when student is empty)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'candidates')
     AND NOT EXISTS (SELECT 1 FROM student LIMIT 1) THEN
    INSERT INTO student (sroll, name, age, email, phone, scode, address, coursename)
    SELECT s_roll, name, age, email, phone, s_code, address, course_name FROM candidates;
  END IF;
EXCEPTION WHEN undefined_column THEN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'candidates')
     AND NOT EXISTS (SELECT 1 FROM student LIMIT 1) THEN
    INSERT INTO student (sroll, name, age, email, phone, scode, address, coursename)
    SELECT sroll, name, age, email, phone, scode, address, coursename FROM candidates;
  END IF;
END $$;
