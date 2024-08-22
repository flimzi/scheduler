CREATE OR ALTER FUNCTION GetPrimaries(@UserId INT, @RelationshipTypes NVARCHAR(20) = NULL)
RETURNS TABLE 
AS RETURN
(
	SELECT u.* FROM users u
	INNER JOIN relationships r
	ON r.primary_id = u.id
	WHERE r.secondary_id = @UserId
	AND (
		@RelationshipTypes IS NULL
		OR r.type IN (SELECT CAST(Value AS INT) FROM STRING_SPLIT(@RelationshipTypes, ','))
	)
);

CREATE OR ALTER FUNCTION GetSecondaries(@UserId INT, @RelationshipTypes NVARCHAR(20) = NULL)
RETURNS TABLE 
AS RETURN
(
	SELECT u.* FROM users u
	INNER JOIN relationships r
	ON r.secondary_id = u.id
	WHERE r.primary_id = @UserId
	AND (
		@RelationshipTypes IS NULL
		OR r.type IN (SELECT CAST(Value AS INT) FROM STRING_SPLIT(@RelationshipTypes, ','))
	)
);

CREATE OR ALTER FUNCTION GetEvents(
	@GiverIds NVARCHAR(100) = NULL,
	@ReceiverIds NVARCHAR(100) = NULL, 
	@EventTypes NVARCHAR(20) = NULL,
	@Statuses NVARCHAR(20) = NULL,
	@Before DATETIME = NULL,
	@After DATETIME = NULL
)
RETURNS TABLE
AS RETURN
(
	SELECT * FROM [events]
	WHERE (
		@GiverIds IS NULL OR
		[giver_id] IN (SELECT CAST(Value AS INT) FROM STRING_SPLIT(@GiverIds, ','))
	)
	AND (
		@ReceiverIds IS NULL OR
		[receiver_id] IN (SELECT CAST(Value AS INT) FROM STRING_SPLIT(@ReceiverIds, ','))
	)
	AND (
		@EventTypes IS NULL OR
		[type] IN (SELECT CAST(Value AS INT) FROM STRING_SPLIT(@EventTypes, ','))
	)
	AND (
		@Statuses IS NULL OR
		[status] IN (SELECT CAST(Value AS INT) FROM STRING_SPLIT(@Statuses, ','))
	)
	AND (
		@Before IS NULL OR
		[start_date] <= @Before
	)
	AND (
		@After IS NULL OR
		[start_date] >= @After
	)
)