INSERT INTO [users] ([role], [email], [password]) VALUES
(1, 'user1@example.com', 'password1'),
(2, 'user2@example.com', 'password2'),
(3, 'user3@example.com', 'password3'),
(4, 'user4@example.com', 'password4'),
(5, 'user5@example.com', 'password5'),
(6, 'user6@example.com', 'password6'),
(7, 'user7@example.com', 'password7'),
(8, 'user8@example.com', 'password8'),
(9, 'user9@example.com', 'password9'),
(10, 'user10@example.com', 'password10');

INSERT INTO [user_details] ([first_name], [last_name], [birth]) VALUES
('John', 'Doe', '1990-01-01'),
('Jane', 'Smith', '1992-02-02'),
('Robert', 'Johnson', '1991-03-03'),
('Emily', 'Williams', '1993-04-04'),
('Michael', 'Brown', '1994-05-05'),
('Jessica', 'Jones', '1995-06-06'),
('Daniel', 'Garcia', '1996-07-07'),
('Sarah', 'Martinez', '1997-08-08'),
('David', 'Hernandez', '1998-09-09'),
('Laura', 'Wilson', '1999-10-10');

INSERT INTO [events] ([type], [status], [giver], [receiver], [info], [start], [duration_seconds], [interval_seconds]) VALUES
(1, 1, 1, 2, 'Info about event 1', '2024-01-01 10:00:00', 3600, 86400),
(2, 2, 2, 3, 'Info about event 2', '2024-01-02 11:00:00', 1800, 7200),
(3, 1, 3, 4, 'Info about event 3', '2024-01-03 12:00:00', 7200, 14400),
(4, 2, 4, 5, 'Info about event 4', '2024-01-04 13:00:00', 3600, 86400),
(5, 1, 5, 6, 'Info about event 5', '2024-01-05 14:00:00', 5400, 28800),
(6, 2, 6, 7, 'Info about event 6', '2024-01-06 15:00:00', 3600, 14400),
(7, 1, 7, 8, 'Info about event 7', '2024-01-07 16:00:00', 1800, 7200),
(8, 2, 8, 9, 'Info about event 8', '2024-01-08 17:00:00', 7200, 28800),
(9, 1, 9, 10, 'Info about event 9', '2024-01-09 18:00:00', 3600, 14400),
(10, 2, 10, 1, 'Info about event 10', '2024-01-10 19:00:00', 5400, 7200);
