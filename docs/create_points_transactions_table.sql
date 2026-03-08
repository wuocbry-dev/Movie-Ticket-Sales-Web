-- Create points_transactions table for tracking all loyalty points activities
CREATE TABLE IF NOT EXISTS points_transactions (
    transaction_id SERIAL PRIMARY KEY,
    membership_id INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    points INTEGER NOT NULL,
    description TEXT,
    related_booking_id INTEGER,
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    balance_after INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_points_membership 
        FOREIGN KEY (membership_id) 
        REFERENCES memberships(membership_id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_points_booking 
        FOREIGN KEY (related_booking_id) 
        REFERENCES bookings(booking_id) 
        ON DELETE SET NULL
);

-- Create index for faster queries
CREATE INDEX idx_points_transactions_membership ON points_transactions(membership_id);
CREATE INDEX idx_points_transactions_date ON points_transactions(transaction_date DESC);
CREATE INDEX idx_points_transactions_type ON points_transactions(transaction_type);

-- Add comments
COMMENT ON TABLE points_transactions IS 'Lịch sử giao dịch điểm thưởng của thành viên';
COMMENT ON COLUMN points_transactions.transaction_type IS 'Loại giao dịch: EARNED, REDEEMED, EXPIRED, ADJUSTED, BONUS';
COMMENT ON COLUMN points_transactions.points IS 'Số điểm (âm nếu là trừ điểm, dương nếu là cộng điểm)';
COMMENT ON COLUMN points_transactions.balance_after IS 'Số dư điểm sau giao dịch';
