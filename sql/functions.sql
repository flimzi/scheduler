CREATE OR ALTER FUNCTION GetEventsByReceiver(@ReceiverId int) RETURNS TABLE
AS
RETURN (
	SELECT 
		e.*, 
		uf.first_name, uf.last_name, uf.email, uf.role, uf.birth 
	FROM events e 
	LEFT JOIN users_full uf ON e.giver = uf.id
	WHERE receiver = @ReceiverId
);

CREATE OR ALTER FUNCTION GetEventsByGiver(@GiverId int) RETURNS TABLE
AS
RETURN (
	SELECT 
		e.*, 
		uf.first_name, uf.last_name, uf.email, uf.role, uf.birth 
	FROM events e 
	LEFT JOIN users_full uf ON e.receiver = uf.id
	WHERE receiver = @GiverId
);