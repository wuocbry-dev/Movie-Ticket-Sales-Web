-- Sample data for Movie & Cinema APIs
-- Insert sample movie genres
INSERT INTO movie_genres (genre_id, genre_name, genre_name_en, description, is_active) VALUES
(1, 'Khoa học viễn tưởng', 'Science Fiction', 'Phim khoa học viễn tưởng', true),
(2, 'Hành động', 'Action', 'Phim hành động', true),
(3, 'Kinh dị', 'Horror', 'Phim kinh dị', true),
(4, 'Hài', 'Comedy', 'Phim hài', true),
(5, 'Tình cảm', 'Romance', 'Phim tình cảm', true),
(6, 'Phiêu lưu', 'Adventure', 'Phim phiêu lưu', true),
(7, 'Chính kịch', 'Drama', 'Phim chính kịch', true),
(8, 'Hoạt hình', 'Animation', 'Phim hoạt hình', true);

-- Insert sample movies
INSERT INTO movies (movie_id, title, title_en, age_rating, content_warning, synopsis, synopsis_en, duration_minutes, release_date, end_date, country, language, subtitle_language, director, cast, producer, poster_url, backdrop_url, trailer_url, status, is_featured, imdb_rating, imdb_id, created_at, updated_at) VALUES

(1, 'Avatar: The Way of Water', 'Avatar: The Way of Water', 'T13', 'Phim có một số cảnh bạo lực, khán giả cân nhắc trước khi xem', 
'Câu chuyện diễn ra hơn một thập kỷ sau những sự kiện của phần phim đầu tiên. Avatar: The Way of Water kể về gia đình nhà Sully (Jake, Neytiri và các con của họ), những rắc rối theo đuổi họ, những nơi họ phải đi để được an toàn, những trận chiến họ phải chiến đấu để sống sót, và những bi kịch họ phải chịu đựng.', 
'Set more than a decade after the events of the first film, Avatar: The Way of Water begins to tell the story of the Sully family (Jake, Neytiri, and their children), the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.', 
192, '2022-12-16', '2023-03-15', 'Mỹ', 'Tiếng Anh', 'Tiếng Việt', 'James Cameron', 'Sam Worthington, Zoe Saldana, Sigourney Weaver, Stephen Lang', 'James Cameron, Jon Landau', 
'https://cdn.example.com/posters/avatar2.jpg', 'https://cdn.example.com/backdrops/avatar2.jpg', 'https://www.youtube.com/embed/d9MyW72ELq0', 
'NOW_SHOWING', true, 7.8, 'tt1630029', NOW(), NOW()),

(2, 'Black Panther: Wakanda Forever', 'Black Panther: Wakanda Forever', 'T13', 'Phim có cảnh bạo lực và một số tình huống căng thẳng', 
'Queen Ramonda, Shuri, M''Baku, Okoye and the Dora Milaje fight to protect their nation from intervening world powers in the wake of King T''Challa''s death.', 
'Queen Ramonda, Shuri, M''Baku, Okoye and the Dora Milaje fight to protect their nation from intervening world powers in the wake of King T''Challa''s death.', 
161, '2022-11-11', '2023-02-28', 'Mỹ', 'Tiếng Anh', 'Tiếng Việt', 'Ryan Coogler', 'Letitia Wright, Lupita Nyong''o, Danai Gurira, Winston Duke', 'Kevin Feige', 
'https://cdn.example.com/posters/blackpanther2.jpg', 'https://cdn.example.com/backdrops/blackpanther2.jpg', 'https://www.youtube.com/embed/_Z3QKkl1WyM', 
'NOW_SHOWING', true, 6.7, 'tt9114286', NOW(), NOW()),

(3, 'Spider-Man: Across the Spider-Verse', 'Spider-Man: Across the Spider-Verse', 'K', '', 
'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.', 
'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.', 
140, '2023-06-02', NULL, 'Mỹ', 'Tiếng Anh', 'Tiếng Việt', 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson', 'Shameik Moore, Hailee Steinfeld, Brian Tyree Henry', 'Avi Arad, Amy Pascal', 
'https://cdn.example.com/posters/spiderverse2.jpg', 'https://cdn.example.com/backdrops/spiderverse2.jpg', 'https://www.youtube.com/embed/cqGjhVJWtEg', 
'COMING_SOON', true, 8.7, 'tt9362722', NOW(), NOW()),

(4, 'John Wick: Chapter 4', 'John Wick: Chapter 4', 'T18', 'Phim có nhiều cảnh bạo lực và máu me', 
'John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe and forces that turn old friends into foes.', 
'John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe and forces that turn old friends into foes.', 
169, '2023-03-24', NULL, 'Mỹ', 'Tiếng Anh', 'Tiếng Việt', 'Chad Stahelski', 'Keanu Reeves, Donnie Yen, Bill Skarsgård, Laurence Fishburne', 'Basil Iwanyk, Erica Lee', 
'https://cdn.example.com/posters/johnwick4.jpg', 'https://cdn.example.com/backdrops/johnwick4.jpg', 'https://www.youtube.com/embed/qEVUtrk8_B4', 
'NOW_SHOWING', false, 7.8, 'tt10366206', NOW(), NOW()),

(5, 'The Little Mermaid', 'The Little Mermaid', 'K', '', 
'The youngest of King Triton''s daughters, and the most defiant, Ariel longs to find out more about the world beyond the sea, and while visiting the surface, falls for the dashing Prince Eric.', 
'The youngest of King Triton''s daughters, and the most defiant, Ariel longs to find out more about the world beyond the sea, and while visiting the surface, falls for the dashing Prince Eric.', 
135, '2023-05-26', NULL, 'Mỹ', 'Tiếng Anh', 'Tiếng Việt', 'Rob Marshall', 'Halle Bailey, Jonah Hauer-King, Daveed Diggs, Awkwafina', 'Marc Platt, Lin-Manuel Miranda', 
'https://cdn.example.com/posters/littlemermaid.jpg', 'https://cdn.example.com/backdrops/littlemermaid.jpg', 'https://www.youtube.com/embed/kpGo2_d3oYE', 
'COMING_SOON', false, 7.2, 'tt5971474', NOW(), NOW());

-- Insert movie genre mappings
INSERT INTO movie_genre_mapping (movie_id, genre_id) VALUES
(1, 1), (1, 2), (1, 6),  -- Avatar: Sci-Fi, Action, Adventure
(2, 2), (2, 7), (2, 6),  -- Black Panther: Action, Drama, Adventure
(3, 8), (3, 2), (3, 6),  -- Spider-Verse: Animation, Action, Adventure
(4, 2), (4, 3), (4, 7),  -- John Wick: Action, Crime, Drama
(5, 8), (5, 5), (5, 4);  -- Little Mermaid: Animation, Romance, Comedy

-- Insert sample cinemas (if not exists)
INSERT IGNORE INTO cinemas (cinema_id, name, address, phone_number, email, city, district, is_active, created_at, updated_at) VALUES
(1, 'CGV Vincom Center', '72 Lê Thánh Tôn, Quận 1, TP.HCM', '028-3936-3333', 'cgv.vincom@example.com', 'Hồ Chí Minh', 'Quận 1', true, NOW(), NOW()),
(2, 'Lotte Cinema Landmark 81', '720A Điện Biên Phủ, Quận Bình Thạnh, TP.HCM', '028-3512-6789', 'lotte.landmark@example.com', 'Hồ Chí Minh', 'Bình Thạnh', true, NOW(), NOW());

-- Insert sample halls (if not exists)
INSERT IGNORE INTO halls (hall_id, cinema_id, hall_name, hall_type, total_seats, is_active, created_at, updated_at) VALUES
(1, 1, 'Hall 1', 'STANDARD', 120, true, NOW(), NOW()),
(2, 1, 'Hall 2', 'IMAX', 180, true, NOW(), NOW()),
(3, 2, 'Hall A', 'STANDARD', 150, true, NOW(), NOW()),
(4, 2, 'Hall B', '4DX', 100, true, NOW(), NOW());

-- Insert sample showtimes to create format relationships
INSERT IGNORE INTO showtimes (showtime_id, movie_id, hall_id, show_date, show_time, format_type, base_price, status, created_at, updated_at) VALUES
-- Avatar showtimes with different formats
(1, 1, 1, '2024-01-15', '14:00:00', '_2D', 120000.00, 'SCHEDULED', NOW(), NOW()),
(2, 1, 2, '2024-01-15', '16:30:00', 'IMAX', 200000.00, 'SCHEDULED', NOW(), NOW()),
(3, 1, 1, '2024-01-15', '19:00:00', '_3D', 150000.00, 'SCHEDULED', NOW(), NOW()),

-- Black Panther showtimes
(4, 2, 1, '2024-01-15', '15:30:00', '_2D', 120000.00, 'SCHEDULED', NOW(), NOW()),
(5, 2, 3, '2024-01-15', '18:00:00', '_3D', 150000.00, 'SCHEDULED', NOW(), NOW()),

-- John Wick showtimes
(6, 4, 3, '2024-01-15', '20:30:00', '_2D', 120000.00, 'SCHEDULED', NOW(), NOW()),
(7, 4, 4, '2024-01-15', '21:00:00', '_4DX', 250000.00, 'SCHEDULED', NOW(), NOW());