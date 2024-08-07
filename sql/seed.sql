INSERT INTO [users] (role, email, password, first_name, last_name, gender, birth_date, phone_number, height_cm, weight_kg)
VALUES 
(1, 'user1@example.com', 'password1', 'FirstName1', 'LastName1', 1, '1990-01-01', '1234567890', 170, 70),
(2, 'user2@example.com', 'password2', 'FirstName2', 'LastName2', 2, '1985-02-02', '1234567891', 160, 60),
(1, 'user3@example.com', 'password3', 'FirstName3', 'LastName3', 1, '1995-03-03', '1234567892', 180, 80),
(2, 'user4@example.com', 'password4', 'FirstName4', 'LastName4', 2, '1992-04-04', '1234567893', 165, 65),
(1, 'user5@example.com', 'password5', 'FirstName5', 'LastName5', 1, '1998-05-05', '1234567894', 175, 75),
(2, 'user6@example.com', 'password6', 'FirstName6', 'LastName6', 2, '1980-06-06', '1234567895', 155, 55),
(1, 'user7@example.com', 'password7', 'FirstName7', 'LastName7', 1, '1994-07-07', '1234567896', 185, 85),
(2, 'user8@example.com', 'password8', 'FirstName8', 'LastName8', 2, '1982-08-08', '1234567897', 150, 50),
(1, 'user9@example.com', 'password9', 'FirstName9', 'LastName9', 1, '1991-09-09', '1234567898', 165, 65),
(2, 'user10@example.com', 'password10', 'FirstName10', 'LastName10', 2, '1983-10-10', '1234567899', 160, 60);

INSERT INTO [relationships] (carer_id, patient_id, type)
VALUES
(2, 1, 1),
(4, 3, 1),
(6, 5, 1),
(8, 7, 1),
(10, 9, 1),
(1, 2, 1),
(3, 4, 1),
(5, 6, 1),
(7, 8, 1),
(9, 10, 1);

INSERT INTO [events] (type, status, giver_id, receiver_id, info, start_date, duration_seconds, interval_seconds)
VALUES
(1, 0, 1, 2, 'Event 1 info', '2024-01-01 10:00:00', 3600, 86400),
(2, 1, 3, 4, 'Event 2 info', '2024-01-02 11:00:00', 7200, 86400),
(1, 0, 5, 6, 'Event 3 info', '2024-01-03 12:00:00', 1800, 86400),
(2, 1, 7, 8, 'Event 4 info', '2024-01-04 13:00:00', 3600, 86400),
(1, 0, 9, 10, 'Event 5 info', '2024-01-05 14:00:00', 5400, 86400),
(2, 1, 2, 1, 'Event 6 info', '2024-01-06 15:00:00', 7200, 86400),
(1, 0, 4, 3, 'Event 7 info', '2024-01-07 16:00:00', 3600, 86400),
(2, 1, 6, 5, 'Event 8 info', '2024-01-08 17:00:00', 1800, 86400),
(1, 0, 8, 7, 'Event 9 info', '2024-01-09 18:00:00', 5400, 86400),
(2, 1, 10, 9, 'Event 10 info', '2024-01-10 19:00:00', 7200, 86400);
