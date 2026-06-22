
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE products (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

INSERT INTO products (
    id,
    name,
    category,
    price,
    updated_at,
    created_at
)

SELECT 
    gen_random_uuid(), --Generates UUID to fill in column id
    ('Product' || floor(random()*1000+1)::int), --name is filled as Product*** where we generate a 3 digit number using random() and concacted it with "Product" to generate 1000 unique Products.
    (ARRAY[
        'Electronics',
        'Clothing',
        'Furniture',
        'Sports',
        'Beauty',
        'Decor',
        'Home'
    ])[floor(random()*7+1)::int], --To fill the category column we created an array of categories and used random() to generate indexes in the range 1 to 10.
    round((random()*10000)::numeric,2),--to Generate a random price for the products we converted the type to numeric with 2 digits.
    NOW() - (random() * interval '365 days'), --Random timestamps with an interval of 365 days before today
    NOW() - (random() * interval '365 days')
FROM generate_series(1,200000); 

CREATE INDEX idx_products_feed
ON products(created_at DESC, id DESC);

CREATE INDEX idx_products_category_feed
ON products(category, created_at DESC, id DESC);
