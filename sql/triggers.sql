CREATE TRIGGER trg_delete_user_relationships
ON users
INSTEAD OF DELETE
AS
BEGIN
    DELETE FROM relationships 
    WHERE carer_id IN (SELECT id FROM DELETED)
       OR patient_id IN (SELECT id FROM DELETED);

    DELETE FROM access_tokens
    WHERE user_id IN (SELECT id FROM DELETED);

    DELETE FROM users 
    WHERE id IN (SELECT id FROM DELETED);
END;