CREATE OR ALTER VIEW users_full AS
SELECT 
	ud.*, u.role, u.email
FROM
	users u
LEFT JOIN user_details ud ON u.id = ud.id;