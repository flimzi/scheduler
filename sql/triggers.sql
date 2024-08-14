CREATE OR ALTER TRIGGER trg_delete_user
ON users
INSTEAD OF DELETE
AS BEGIN
    -- delete orphaned relationships
    DELETE FROM relationships 
    WHERE carer_id IN (SELECT id FROM DELETED)
    OR patient_id IN (SELECT id FROM DELETED);

    -- delete login tokens
    DELETE FROM access_tokens
    WHERE user_id IN (SELECT id FROM DELETED);

    DELETE FROM users 
    WHERE id IN (SELECT id FROM DELETED);
END;

CREATE OR ALTER TRIGGER trg_delete_relationship
ON relationships
INSTEAD OF DELETE
AS BEGIN
    -- delete owned users
    DELETE u FROM users u
    JOIN relationships r ON u.id = r.patient_id
    WHERE r.type = 1 AND r.id IN (SELECT id FROM DELETED);

    DELETE FROM relationships
    WHERE id IN (SELECT id FROM DELETED);
END;