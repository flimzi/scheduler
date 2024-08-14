CREATE TABLE [users] (
	[id] int IDENTITY(1,1) NOT NULL UNIQUE,
	[role] int NOT NULL,
	[created_at] datetime NOT NULL DEFAULT GETDATE(),
	[email] nvarchar(450),
	[password] nvarchar(450),
	[first_name] nvarchar(30),
	[last_name] nvarchar(30),
	[gender] int,
	[birth_date] datetime,
	[phone_number] nvarchar(20),
	[height_cm] int,
	[weight_kg] int,
	[verification_token] nvarchar(450),
	[verified] bit NOT NULL DEFAULT 0,
	[postal_code] nvarchar(20),
	[street_address] nvarchar(100)
	PRIMARY KEY ([id])
);

CREATE TABLE [relationships] (
	[id] int IDENTITY(1,1) NOT NULL UNIQUE,
	[owner_id] int NOT NULL,
	[owned_id] int NOT NULL,
	[type] int NOT NULL,
	PRIMARY KEY ([id])
);

CREATE TABLE [events] (
	[id] int IDENTITY(1,1) NOT NULL UNIQUE,
	[type] int NOT NULL,
	[status] int NOT NULL,
	[giver_id] int NOT NULL,
	[receiver_id] int NOT NULL,
	[info] nvarchar(4000),
	[modified_at] datetime NOT NULL DEFAULT GETDATE(),
	[start_date] datetime NOT NULL,
	[duration_seconds] int,
	[interval_seconds] int,
	PRIMARY KEY ([id])
);

CREATE TABLE [access_tokens] (
	[user_id] int NOT NULL,
	[hash] nvarchar(450) NOT NULL,
	PRIMARY KEY ([user_id])
)

ALTER TABLE [relationships] ADD CONSTRAINT [relationships_fk1] FOREIGN KEY ([owner_id]) REFERENCES [users]([id]);
ALTER TABLE [relationships] ADD CONSTRAINT [relationships_fk2] FOREIGN KEY ([owned_id]) REFERENCES [users]([id]);

ALTER TABLE [events] ADD CONSTRAINT [events_fk3] FOREIGN KEY ([giver_id]) REFERENCES [users]([id]);
ALTER TABLE [events] ADD CONSTRAINT [events_fk4] FOREIGN KEY ([receiver_id]) REFERENCES [users]([id]);

ALTER TABLE [access_tokens] ADD CONSTRAINT [access_tokens_fk5] FOREIGN KEY ([user_id]) REFERENCES [users]([id])

CREATE INDEX [idx_users_role] ON [users] ([role])
CREATE INDEX [idx_users_email] ON [users] ([email])
CREATE INDEX [idx_users_verification_token] ON [users] ([verification_token])

CREATE INDEX [idx_events_giver_id] ON [events] ([giver_id], [start_date])
CREATE INDEX [idx_events_receiver_id] ON [events] ([receiver_id], [start_date])

CREATE INDEX [idx_relationships_owner_id] ON [relationships] ([owner_id])
CREATE INDEX [idx_relationships_owned_id] ON [relationships] ([owned_id])

CREATE INDEX [idx_access_tokens_user_id_hash] ON [access_tokens] ([user_id], [hash])