-- CHECKING SCHEMA VIA SQL
-- Result will explain why 400 is happening

SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('markets', 'orders', 'shops', 'products');
