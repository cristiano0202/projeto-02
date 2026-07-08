USE ecowatt_db;

INSERT IGNORE INTO equipments (name, default_power_watts, category, is_default) VALUES
('Chuveiro Elétrico', 5500, 'Aquecimento', TRUE),
('Ar-Condicionado', 1500, 'Climatização', TRUE),
('Geladeira Duplex', 250, 'Refrigeração', TRUE),
('Micro-ondas', 1200, 'Cozinha', TRUE),
('Máquina de Lavar', 500, 'Lavanderia', TRUE),
('Televisor LED', 100, 'Eletrônicos', TRUE),
('Cooktop/Fogão Elétrico', 6000, 'Cozinha', TRUE);
