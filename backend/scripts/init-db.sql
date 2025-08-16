-- Create cosine distance functions for semantic search

CREATE OR REPLACE FUNCTION array_dot(a float8[], b float8[])
RETURNS double precision LANGUAGE SQL IMMUTABLE AS $$
SELECT COALESCE(SUM(x * y), 0)
FROM unnest(a) WITH ORDINALITY AS ua(x,i)
JOIN unnest(b) WITH ORDINALITY AS ub(y,j) ON i = j;
$$;

CREATE OR REPLACE FUNCTION array_norm(a float8[])
RETURNS double precision LANGUAGE SQL IMMUTABLE AS $$
SELECT sqrt(COALESCE(SUM(x*x), 0)) FROM unnest(a) AS t(x);
$$;

CREATE OR REPLACE FUNCTION cosine_distance(a float8[], b float8[])
RETURNS double precision LANGUAGE SQL IMMUTABLE AS $$
SELECT
CASE
WHEN array_length(a,1) IS NULL OR array_length(b,1) IS NULL THEN 1
WHEN array_length(a,1) <> array_length(b,1) THEN 1
ELSE
1 - (
array_dot(a,b)
/ NULLIF(array_norm(a) * array_norm(b), 0)
)
END;
$$;