-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create indexed columns for common queries
ALTER DATABASE propintel SET shared_preload_libraries = 'pg_stat_statements';
