CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  campo1 VARCHAR(255) NOT NULL,
  campo2 VARCHAR(255) NOT NULL,
  campo3 VARCHAR(255) NOT NULL,
  campo4 INTEGER NOT NULL,
  campo5 DOUBLE PRECISION NOT NULL,
  campo6 BOOLEAN NOT NULL
);

INSERT INTO jobs (campo1, campo2, campo3, campo4, campo5, campo6) VALUES
  ('Desarrollador Backend', 'TechCorp', 'Ciudad de México', 45000, 4.5, true),
  ('Diseñador UX', 'DesignLab', 'Guadalajara', 35000, 3.8, false),
  ('Analista de Datos', 'DataVision', 'Monterrey', 40000, 4.2, true),
  ('Ingeniero DevOps', 'CloudNet', 'Remoto', 60000, 4.7, true),
  ('QA Tester', 'SoftQA', 'Puebla', 28000, 3.5, false);
