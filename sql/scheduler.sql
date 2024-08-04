CREATE TABLE [events] (
	[id] int IDENTITY(1,1) NOT NULL UNIQUE,
	[type] int NOT NULL,
	[status] int NOT NULL,
	[giver] int NOT NULL,
	[receiver] int NOT NULL,
	[info] nvarchar(max),
	[modified] datetime NOT NULL DEFAULT GETDATE(),
	[start] datetime NOT NULL,
	[duration_seconds] int,
	[interval_seconds] int,
	PRIMARY KEY ([id])
);

CREATE TABLE [users] (
	[id] int IDENTITY(1,1) NOT NULL UNIQUE,
	[role] int NOT NULL,
	[email] nvarchar(450) NOT NULL UNIQUE,
	[password] nvarchar(max) NOT NULL,
	PRIMARY KEY ([id])
);

CREATE TABLE [user_details] (
	[id] int IDENTITY(1,1) NOT NULL UNIQUE,
	[first_name] nvarchar(max),
	[last_name] nvarchar(max),
	[birth] datetime,
	PRIMARY KEY ([id])
);

ALTER TABLE [events] ADD CONSTRAINT [events_fk3] FOREIGN KEY ([giver]) REFERENCES [users]([id]);

ALTER TABLE [events] ADD CONSTRAINT [events_fk4] FOREIGN KEY ([receiver]) REFERENCES [users]([id]);

ALTER TABLE [user_details] ADD CONSTRAINT [user_details_fk0] FOREIGN KEY ([id]) REFERENCES [users]([id]);

CREATE INDEX idx_events_giver ON events (giver)
CREATE INDEX idx_events_receiver ON events (receiver)

CREATE INDEX idx_users_email ON users (email)