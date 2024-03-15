CREATE TABLE category ( 
    id_category SERIAL PRIMARY KEY, 
    name VARCHAR(255),    
    id_padre INTEGER REFERENCES category(id_category) 
);

CREATE TABLE brand ( 
    id_brand SERIAL PRIMARY KEY, 
    name VARCHAR(255),
     brand ADD CONSTRAINT unique_name UNIQUE(name);
    );

CREATE TABLE product (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(60),
    description TEXT,
    price_unit REAL,
    price_wholesale REAL,
    price_cost REAL,
    promotion TEXT,
    discount REAL,
    Offer REAL,
    quantity REAL,
    supplier VARCHAR(50),
    brand VARCHAR(60) REFERENCES brand(name),
    id_category_product INTEGER REFERENCES category(id_category),
    time_Acquisition TIMESTAMP WITH TIME ZONE, 
    iva REAL,
    mdcp JSONB,
    route TEXT
);

CREATE TABLE order_table (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER,
  name VARCHAR(30),
  last_name VARCHAR(30),
  Name_enterprise VARCHAR(30),
  country VARCHAR(20),
  region VARCHAR(20),
  address VARCHAR(255),
  address_two VARCHAR(255),
  code_postal VARCHAR(15),
  phone_number INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  products JSONB,
  total INTEGER,
  state VARCHAR(30),
  FOREIGN KEY (user_id) REFERENCES user_client(user_id)
);

{
  "modelos": [
    {
      "color": "",
      "photos": [
        {
          "url": "",
          "type": ""
        }
      ],
      "height": "",
      "width": "",
      "depth": ""
      "weight" "",
    }
  ]
}

product_id, name, description, price_unit, price_wholesale, price_cost, promotion, discount, Offer, quantity, supplier, id_brand, id_category_product, time_acquisition, iva, mdcp, route

