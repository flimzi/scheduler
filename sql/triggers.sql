CREATE OR ALTER TRIGGER trg_delete_user
ON users
INSTEAD OF DELETE
AS BEGIN
    BEGIN TRANSACTION

    DECLARE @OwnedUserIds TABLE (id INT)
    INSERT INTO @OwnedUserIds (id)
    SELECT u.id FROM users u
    JOIN relationships r ON u.id = r.secondary_id
    WHERE r.type = 1 AND r.primary_id IN (SELECT id FROM DELETED);

    -- delete orphaned relationships
    DELETE FROM relationships 
    WHERE primary_id IN (SELECT id FROM DELETED)
    OR secondary_id IN (SELECT id FROM DELETED);

    -- delete events
    DELETE FROM events
    WHERE giver_id IN (SELECT id FROM DELETED)
    OR receiver_id IN (SELECT id FROM DELETED);

    -- delete login tokens
    DELETE FROM access_tokens
    WHERE user_id IN (SELECT id FROM DELETED);

    -- delete owners and owned
    DELETE FROM users 
    WHERE id IN (SELECT id FROM DELETED) OR id IN (SELECT id FROM @OwnedUserIds);

    COMMIT TRANSACTION
END;

CREATE OR ALTER PROCEDURE @DeleteUser(@UserId INT)
AS BEGIN
    BEGIN TRANSACTION

    DECLARE @OwnedUserIds TABLE (id INT)
    INSERT INTO @OwnedUserIds (id)
    SELECT u.id FROM users u
    JOIN relationships r ON u.id = r.secondary_id
    WHERE r.type = 1 AND r.primary_id = @UserId;

    -- delete orphaned relationships
    DELETE FROM relationships 
    WHERE primary_id = @UserId
    OR secondary_id = @UserId;

    -- delete events
    DELETE FROM events
    WHERE giver_id = @UserId
    OR receiver_id = @UserId;

    -- delete login tokens
    DELETE FROM access_tokens
    WHERE user_id = @UserId;

    -- delete owners and owned
    DELETE FROM users 
    WHERE id = @UserId 
    OR id IN (SELECT id FROM @OwnedUserIds);

    COMMIT TRANSACTION
END;

CREATE OR ALTER TRIGGER trg_update_event
ON events
AFTER UPDATE
AS BEGIN
    BEGIN TRANSACTION

    UPDATE events SET modified_at = GETDATE()
    FROM events
    JOIN INSERTED i ON events.id = i.id

    COMMIT TRANSACTION
END;