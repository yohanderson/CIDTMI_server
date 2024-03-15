CREATE TABLE user_client ( 
    user_id SERIAL PRIMARY KEY, 
    email TEXT, 
    password bytea, 
    token TEXT,
    user_name VARCHAR(30),
    sur_name VARCHAR(30),
    name VARCHAR(30),
    code VARCHAR(6),
    create_at timestamp,
    failed_attempts integer,
    verify_email bool,
    secret_key TEXT
    );


CREATE TABLE user_account ( 
   user_id SERIAL PRIMARY KEY, 
    email TEXT, 
    password bytea, 
    token TEXT,
    user_name VARCHAR(30),
    sur_name VARCHAR(30),
    name VARCHAR(30),
    code VARCHAR(6),
    create_at timestamp,
    failed_attempts integer,
    verify_email bool,
    secret_key TEXT
    );