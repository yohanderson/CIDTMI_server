CREATE TABLE reserves ( 
    reserve_id SERIAL PRIMARY KEY, 
    user_id INTEGER,
    name VARCHAR(30),
    last_name VARCHAR(30), 
    phone_number VARCHAR(50), 
    equipment_type VARCHAR(50), 
    date_time TIMESTAMP WITH TIME ZONE, 
    created_at TIMESTAMP WITH TIME ZONE, 
    falla_type TEXT,
    state VARCHAR(30),
    FOREIGN KEY (user_id) REFERENCES user_client(user_id));
