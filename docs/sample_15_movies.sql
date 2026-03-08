-- Sample data: 15 movies (no explicit movie_id so DB should assign IDs if movie_id is auto-increment)
-- Run this script against your application's database. Adjust date formats or column names if your schema differs.

INSERT INTO movies (
    title,
    title_en,
    age_rating,
    content_warning,
    synopsis,
    synopsis_en,
    duration_minutes,
    release_date,
    end_date,
    country,
    language,
    subtitle_language,
    director,
    cast,
    producer,
    poster_url,
    backdrop_url,
    trailer_url,
    status,
    is_featured,
    imdb_rating,
    imdb_id,
    created_at,
    updated_at
) VALUES
('The Silent Dawn', 'The Silent Dawn', 'T13', 'Contains mild action scenes', 'A small town must band together as strange phenomena occur at dawn.', 'A small town must band together as strange phenomena occur at dawn.', 105, '2024-02-15', NULL, 'USA', 'English', 'Vietnamese', 'Anna Lee', 'John Doe, Jane Roe', 'Sunrise Films', 'https://cdn.example.com/posters/silent_dawn.jpg', 'https://cdn.example.com/backdrops/silent_dawn.jpg', 'https://www.youtube.com/embed/example1', 'NOW_SHOWING', false, 6.4, 'tt0000001', NOW(), NOW()),

('Neon City', 'Neon City', 'T16', '', 'A neon-lit metropolis where a detective uncovers a corporate conspiracy.', 'A neon-lit metropolis where a detective uncovers a corporate conspiracy.', 118, '2024-03-01', NULL, 'USA', 'English', 'Vietnamese', 'K. Tanaka', 'M. Smith, L. Chen', 'Blade Studio', 'https://cdn.example.com/posters/neon_city.jpg', 'https://cdn.example.com/backdrops/neon_city.jpg', 'https://www.youtube.com/embed/example2', 'NOW_SHOWING', true, 7.1, 'tt0000002', NOW(), NOW()),

('Whispering Pines', 'Whispering Pines', 'P', '', 'A family retreats to the countryside and rediscovers themselves.', 'A family retreats to the countryside and rediscovers themselves.', 95, '2023-11-10', '2024-01-20', 'Canada', 'English', 'Vietnamese', 'S. Green', 'A. Brown, C. White', 'Maple Productions', 'https://cdn.example.com/posters/whispering_pines.jpg', 'https://cdn.example.com/backdrops/whispering_pines.jpg', 'https://www.youtube.com/embed/example3', 'END_SHOWING', false, 6.9, 'tt0000003', NOW(), NOW()),

('Sky Runners', 'Sky Runners', 'T13', 'Contains intense action sequences', 'An aerial racing league pushes pilots to the limit in a fight for freedom.', 'An aerial racing league pushes pilots to the limit in a fight for freedom.', 130, '2024-04-20', NULL, 'UK', 'English', 'Vietnamese', 'D. Rowan', 'P. Park, R. Silva', 'HighFlight Pictures', 'https://cdn.example.com/posters/sky_runners.jpg', 'https://cdn.example.com/backdrops/sky_runners.jpg', 'https://www.youtube.com/embed/example4', 'COMING_SOON', true, 7.5, 'tt0000004', NOW(), NOW()),

('Echoes of Home', 'Echoes of Home', 'K', '', 'Animated tale of a young hero returning to the ocean to save his family.', 'Animated tale of a young hero returning to the ocean to save his family.', 89, '2024-05-05', NULL, 'USA', 'English', 'Vietnamese', 'L. Park', 'Voice Cast: A. Lee, B. Kim', 'Oceanic Animation', 'https://cdn.example.com/posters/echoes_home.jpg', 'https://cdn.example.com/backdrops/echoes_home.jpg', 'https://www.youtube.com/embed/example5', 'COMING_SOON', false, 8.0, 'tt0000005', NOW(), NOW()),

('Midnight Harvest', 'Midnight Harvest', 'T18', 'Strong horror scenes and disturbing imagery', 'A group of friends find an abandoned farm with a sinister secret.', 'A group of friends find an abandoned farm with a sinister secret.', 102, '2023-10-31', '2024-02-10', 'USA', 'English', 'Vietnamese', 'H. Crawford', 'S. Jones, T. Hall', 'Dark Moon Films', 'https://cdn.example.com/posters/midnight_harvest.jpg', 'https://cdn.example.com/backdrops/midnight_harvest.jpg', 'https://www.youtube.com/embed/example6', 'END_SHOWING', false, 5.8, 'tt0000006', NOW(), NOW()),

('Starlight Sonata', 'Starlight Sonata', 'P', '', 'A musical journey across Europe about love and music.', 'A musical journey across Europe about love and music.', 112, '2024-01-20', NULL, 'France', 'French', 'Vietnamese', 'M. Dubois', 'E. Laurent, N. Rossi', 'Melody Films', 'https://cdn.example.com/posters/starlight_sonata.jpg', 'https://cdn.example.com/backdrops/starlight_sonata.jpg', 'https://www.youtube.com/embed/example7', 'NOW_SHOWING', false, 7.0, 'tt0000007', NOW(), NOW()),

('Quantum Thief', 'Quantum Thief', 'T16', 'Some sci-fi violence', 'A thief who can slip through time must steal a device to save the future.', 'A thief who can slip through time must steal a device to save the future.', 140, '2024-06-10', NULL, 'USA', 'English', 'Vietnamese', 'V. Martinez', 'D. Young, K. Patel', 'Temporal Pictures', 'https://cdn.example.com/posters/quantum_thief.jpg', 'https://cdn.example.com/backdrops/quantum_thief.jpg', 'https://www.youtube.com/embed/example8', 'COMING_SOON', true, 7.9, 'tt0000008', NOW(), NOW()),

('Broken Compass', 'Broken Compass', 'T13', '', 'An unlikely team must navigate the arctic after their expedition goes wrong.', 'An unlikely team must navigate the arctic after their expedition goes wrong.', 121, '2023-12-05', '2024-03-01', 'Norway', 'Norwegian', 'Vietnamese', 'O. Hansen', 'K. Strand, E. Berg', 'Polar Films', 'https://cdn.example.com/posters/broken_compass.jpg', 'https://cdn.example.com/backdrops/broken_compass.jpg', 'https://www.youtube.com/embed/example9', 'NOW_SHOWING', false, 6.6, 'tt0000009', NOW(), NOW()),

('Crimson Horizon', 'Crimson Horizon', 'T18', 'Strong violence and mature themes', 'A war drama following the lives of soldiers and civilians in a volatile region.', 'A war drama following the lives of soldiers and civilians in a volatile region.', 150, '2024-02-01', NULL, 'UK', 'English', 'Vietnamese', 'R. Thompson', 'A. Green, S. Long', 'Warfield Pictures', 'https://cdn.example.com/posters/crimson_horizon.jpg', 'https://cdn.example.com/backdrops/crimson_horizon.jpg', 'https://www.youtube.com/embed/example10', 'NOW_SHOWING', true, 7.3, 'tt0000010', NOW(), NOW()),

('Glass Garden', 'Glass Garden', 'T13', '', 'A psychological drama about memory and reconciliation.', 'A psychological drama about memory and reconciliation.', 108, '2023-09-15', '2023-12-20', 'USA', 'English', 'Vietnamese', 'N. Rivers', 'M. Cole, J. Finn', 'IndieWorks', 'https://cdn.example.com/posters/glass_garden.jpg', 'https://cdn.example.com/backdrops/glass_garden.jpg', 'https://www.youtube.com/embed/example11', 'END_SHOWING', false, 6.8, 'tt0000011', NOW(), NOW()),

('Orbiters', 'Orbiters', 'T16', '', 'A small crew aboard a mining vessel fights to survive after a catastrophic failure.', 'A small crew aboard a mining vessel fights to survive after a catastrophic failure.', 125, '2024-07-01', NULL, 'USA', 'English', 'Vietnamese', 'C. Alvarez', 'R. Tan, G. Hill', 'Stellar Studios', 'https://cdn.example.com/posters/orbiters.jpg', 'https://cdn.example.com/backdrops/orbiters.jpg', 'https://www.youtube.com/embed/example12', 'COMING_SOON', false, 7.4, 'tt0000012', NOW(), NOW()),

('Hidden Lantern', 'Hidden Lantern', 'K', '', 'A light-hearted family comedy about a magical lantern that brings neighbors together.', 'A light-hearted family comedy about a magical lantern that brings neighbors together.', 96, '2024-03-10', NULL, 'USA', 'English', 'Vietnamese', 'J. Parker', 'S. Lee, O. Gray', 'BrightDay Entertainment', 'https://cdn.example.com/posters/hidden_lantern.jpg', 'https://cdn.example.com/backdrops/hidden_lantern.jpg', 'https://www.youtube.com/embed/example13', 'NOW_SHOWING', false, 6.5, 'tt0000013', NOW(), NOW()),

('Iron Legacy', 'Iron Legacy', 'T16', 'Action violence', 'A retired soldier must face his past when a new threat emerges.', 'A retired soldier must face his past when a new threat emerges.', 133, '2024-05-18', NULL, 'USA', 'English', 'Vietnamese', 'G. Morales', 'T. King, H. Park', 'Forge Films', 'https://cdn.example.com/posters/iron_legacy.jpg', 'https://cdn.example.com/backdrops/iron_legacy.jpg', 'https://www.youtube.com/embed/example14', 'COMING_SOON', true, 7.2, 'tt0000014', NOW(), NOW()),

('Moonlit Market', 'Moonlit Market', 'P', '', 'A charming rom-com set in a bustling night market.', 'A charming rom-com set in a bustling night market.', 101, '2024-04-01', NULL, 'Vietnam', 'Vietnamese', 'English', 'T. Nguyen', 'L. Tran, H. Vo', 'Saigon Pictures', 'https://cdn.example.com/posters/moonlit_market.jpg', 'https://cdn.example.com/backdrops/moonlit_market.jpg', 'https://www.youtube.com/embed/example15', 'COMING_SOON', false, 7.0, 'tt0000015', NOW(), NOW());

-- End of sample 15 movies
