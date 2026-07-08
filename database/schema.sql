CREATE DATABASE IF NOT EXISTS ecowatt_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecowatt_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  user_type ENUM('residencial', 'comercial', 'pequeno_empreendedor') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS equipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  default_power_watts INT NOT NULL,
  category VARCHAR(80),
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_equipments_power_positive CHECK (default_power_watts > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS simulations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  equipment_id INT NULL,
  equipment_name VARCHAR(120) NOT NULL,
  power_watts INT NOT NULL,
  hours_per_day DECIMAL(5,2) NOT NULL,
  days_per_month INT NOT NULL,
  tariff DECIMAL(10,4) NOT NULL,
  monthly_kwh DECIMAL(10,2) NOT NULL,
  monthly_cost DECIMAL(10,2) NOT NULL,
  saving_tip TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_simulations_user_id (user_id),
  INDEX idx_simulations_created_at (created_at),
  INDEX idx_simulations_equipment_id (equipment_id),
  CONSTRAINT fk_simulations_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_simulations_equipment
    FOREIGN KEY (equipment_id) REFERENCES equipments(id)
    ON DELETE SET NULL,
  CONSTRAINT chk_simulations_power_positive CHECK (power_watts > 0),
  CONSTRAINT chk_simulations_hours_range CHECK (hours_per_day >= 0 AND hours_per_day <= 24),
  CONSTRAINT chk_simulations_days_range CHECK (days_per_month >= 1 AND days_per_month <= 31),
  CONSTRAINT chk_simulations_tariff_positive CHECK (tariff > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
