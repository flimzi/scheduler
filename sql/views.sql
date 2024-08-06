CREATE OR ALTER VIEW users_full AS
SELECT
	u.*, uc.email, uc.password, ud.*
FROM users u
LEFT JOIN user_credentials uc ON u.id = uc.user_id
LEFT JOIN user_details ud ON u.id = ud.user_id;