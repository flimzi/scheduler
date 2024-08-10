CREATE TABLE [users] (
	[id] int IDENTITY(1,1) NOT NULL UNIQUE,
	[role] int NOT NULL,
	[created_at] datetime NOT NULL DEFAULT GETDATE(),
	[email] nvarchar(450) UNIQUE,
	[password] nvarchar(max),
	[first_name] nvarchar(max),
	[last_name] nvarchar(max),
	[gender] int NOT NULL DEFAULT 0,
	[birth_date] datetime,
	[phone_number] nvarchar(max),
	[height_cm] int,
	[weight_kg] int,
	[access_token] nvarchar(max),
	[verification_token] nvarchar(450),
	[verified] bit NOT NULL DEFAULT 0,
	PRIMARY KEY ([id])
);

CREATE TABLE [relationships] (
	[id] int IDENTITY(1,1) NOT NULL UNIQUE,
	[carer_id] int NOT NULL,
	[patient_id] int NOT NULL,
	[type] int NOT NULL,
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

ALTER TABLE [relationships] ADD CONSTRAINT [relationships_fk1] FOREIGN KEY ([carer_id]) REFERENCES [users]([id]);

ALTER TABLE [relationships] ADD CONSTRAINT [relationships_fk2] FOREIGN KEY ([patient_id]) REFERENCES [users]([id]);
ALTER TABLE [events] ADD CONSTRAINT [events_fk3] FOREIGN KEY ([giver_id]) REFERENCES [users]([id]);

ALTER TABLE [events] ADD CONSTRAINT [events_fk4] FOREIGN KEY ([receiver_id]) REFERENCES [users]([id]);

CREATE INDEX [idx_users_role] ON [users] ([role])
CREATE INDEX [idx_users_email] ON [users] ([email])
CREATE INDEX [idx_users_verification_token] ON [users] ([verification_token])

CREATE INDEX [idx_events_giver_id] ON [events] ([giver_id], [start_date])
CREATE INDEX [idx_events_receiver_id] ON [events] ([receiver_id], [start_date])

CREATE INDEX [idx_relationships_carer_id] ON [relationships] ([carer_id])
CREATE INDEX [idx_relationships_patient_id] ON [relationships] ([patient_id])