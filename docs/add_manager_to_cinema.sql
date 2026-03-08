-- Add manager_id column to cinemas table to track CINEMA_MANAGER assignments
-- This allows system admins to assign a cinema manager to manage a specific cinema

ALTER TABLE cinemas ADD COLUMN manager_id INT;

-- Add foreign key constraint
ALTER TABLE cinemas 
ADD CONSTRAINT fk_cinema_manager 
FOREIGN KEY (manager_id) REFERENCES users(user_id);

-- Create index for better query performance
CREATE INDEX idx_cinema_manager_id ON cinemas(manager_id);

-- Create index for querying by manager and chain
CREATE INDEX idx_cinema_manager_chain ON cinemas(manager_id, chain_id);

-- Optional: Add comments
ALTER TABLE cinemas MODIFY COLUMN manager_id INT COMMENT 'Cinema Manager assigned to manage this cinema';
