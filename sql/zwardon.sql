CREATE TABLE [users] (
	[id] int IDENTITY(1,1) NOT NULL UNIQUE,
	[role] int NOT NULL,
	[created_at] datetime NOT NULL DEFAULT GETDATE(),
	PRIMARY KEY ([id])
);

CREATE TABLE [user_details] (
	[user_id] int NOT NULL UNIQUE,
	[first_name] nvarchar(max),
	[last_name] nvarchar(max),
	[birth_date] datetime,
	[phone_number] nvarchar(max),
	[height_cm] int,
	[height_kg] int,
	PRIMARY KEY ([user_id])
);

CREATE TABLE [user_credentials] (
	[email] nvarchar(450) NOT NULL UNIQUE,
	[user_id] int NOT NULL UNIQUE,
	[password] nvarchar(max) NOT NULL,
	PRIMARY KEY ([email])
);

-- CREATE TABLE [user_tokens] (
-- 	[token] nvarchar(450) NOT NULL UNIQUE,
-- 	[user_id] int NOT NULL UNIQUE,
-- 	[created_at] datetime NOT NULL DEFAULT GETDATE(),
-- 	PRIMARY KEY ([token])
-- );

CREATE TABLE [relationships] (
	[id] int IDENTITY(1,1) NOT NULL UNIQUE,
	[carer_id] int NOT NULL,
	[patient_id] int NOT NULL,
	[is_owner] bit NOT NULL,
	PRIMARY KEY ([id])
);

CREATE TABLE [events] (
	[id] int IDENTITY(1,1) NOT NULL UNIQUE,
	[type] int NOT NULL,
	[status] int NOT NULL,
	[giver_id] int NOT NULL,
	[receiver_id] int NOT NULL,
	[info] nvarchar(max),
	[modified_at] datetime NOT NULL DEFAULT GETDATE(),
	[start_date] datetime NOT NULL,
	[duration_seconds] int,
	[interval_seconds] int,
	PRIMARY KEY ([id])
);

ALTER TABLE [user_details] ADD CONSTRAINT [user_details_fk0] FOREIGN KEY ([user_id]) REFERENCES [users]([id]);
ALTER TABLE [user_credentials] ADD CONSTRAINT [user_credentials_fk1] FOREIGN KEY ([user_id]) REFERENCES [users]([id]);
-- ALTER TABLE [user_tokens] ADD CONSTRAINT [user_tokens_fk1] FOREIGN KEY ([user_id]) REFERENCES [users]([id]);
ALTER TABLE [relationships] ADD CONSTRAINT [relationships_fk1] FOREIGN KEY ([carer_id]) REFERENCES [users]([id]);

ALTER TABLE [relationships] ADD CONSTRAINT [relationships_fk2] FOREIGN KEY ([patient_id]) REFERENCES [users]([id]);
ALTER TABLE [events] ADD CONSTRAINT [events_fk3] FOREIGN KEY ([giver_id]) REFERENCES [users]([id]);

ALTER TABLE [events] ADD CONSTRAINT [events_fk4] FOREIGN KEY ([receiver_id]) REFERENCES [users]([id]);

CREATE INDEX [idx_events_giver_id] ON [events] ([giver_id], [start_date])
CREATE INDEX [idx_events_receiver_id] ON [events] ([receiver_id], [start_date])

CREATE INDEX [idx_relationships_carer_id] ON [relationships] ([carer_id])
CREATE INDEX [idx_relationships_patient_id] ON [relationships] ([patient_id])