CREATE OR ALTER FUNCTION GetEventsByReceiver(@ReceiverId int) RETURNS TABLE
AS
RETURN (SELECT * FROM events WHERE receiver = @ReceiverId);

CREATE OR ALTER FUNCTION GetEventsByGiver(@GiverId int) RETURNS TABLE
AS
RETURN (SELECT * FROM events WHERE giver = @GiverId);