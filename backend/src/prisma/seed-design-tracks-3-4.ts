import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seedTracks3and4() {
  // ─── TRACK 3: Data & Storage ───────────────────────────────────────────────
  const track3 = await prisma.designTrack.upsert({
    where: { slug: 'data-storage' },
    update: {},
    create: {
      name: 'Data & Storage',
      slug: 'data-storage',
      description: 'Master database design, indexing, NoSQL patterns, and how to store data at scale',
      icon: '🗄️',
      color: '#FF9500',
      order: 3,
      level: 'intermediate'
    }
  });

  const t3lessons = [
    {
      title: 'Relational Database Design',
      slug: 'relational-database-design',
      order: 1,
      summary: 'Relational databases store data in structured tables with predefined schemas. Tables are linked via foreign keys, enabling complex queries with JOINs. ACID transactions guarantee Atomicity, Consistency, Isolation, and Durability — critical for financial and transactional systems.',
      analogy: 'A relational database is like a well-organized filing cabinet. Every folder (table) has labeled sections (columns), documents are filed in a consistent format, and index tabs let you cross-reference folders instantly.',
      diagram: `┌─────────────┐       ┌─────────────────┐       ┌──────────────┐
│   USERS     │       │    ORDERS       │       │  PRODUCTS    │
├─────────────┤       ├─────────────────┤       ├──────────────┤
│ id (PK)     │◄──┐   │ id (PK)         │  ┌───►│ id (PK)      │
│ email       │   └───│ user_id (FK)    │  │    │ name         │
│ name        │       │ product_id (FK) │──┘    │ price        │
│ created_at  │       │ quantity        │       │ stock        │
└─────────────┘       │ status          │       └──────────────┘
                      └─────────────────┘`,
      diagramSteps: JSON.stringify([
        { step: 1, title: 'Primary Keys', description: 'Each row has a unique PK (id). Uniquely identifies every record.', diagram: 'USERS: id(PK) | email | name' },
        { step: 2, title: 'Foreign Keys', description: 'ORDERS.user_id references USERS.id — enforces referential integrity.', diagram: 'ORDERS: id | user_id(FK→USERS.id) | ...' },
        { step: 3, title: 'JOINs', description: 'SELECT u.name, o.status FROM users u JOIN orders o ON u.id = o.user_id', diagram: 'Result: user name + their orders combined' },
        { step: 4, title: 'ACID Transactions', description: 'BEGIN; UPDATE accounts SET balance-=100 WHERE id=1; UPDATE accounts SET balance+=100 WHERE id=2; COMMIT;', diagram: 'Both updates succeed or both roll back' }
      ]),
      tradeoffs: JSON.stringify([
        { title: 'Normalization vs Denormalization', optionA: 'Normalize: eliminate redundancy, split into many tables', optionB: 'Denormalize: duplicate data for faster reads', recommendation: 'Normalize first, denormalize hot paths', reasoning: 'Normalization reduces anomalies; denormalization avoids expensive JOINs at read scale' },
        { title: 'PostgreSQL vs MySQL', optionA: 'PostgreSQL: advanced types, better standards compliance, JSONB', optionB: 'MySQL: simpler, wider hosting support, marginally faster writes', recommendation: 'PostgreSQL for new projects', reasoning: 'PostgreSQL has better feature set and community momentum' }
      ]),
      whenToUse: JSON.stringify([
        { scenario: 'Financial transactions (bank transfers, payments)', reason: 'ACID guarantees prevent double-spends and partial updates' },
        { scenario: 'Complex relational data with many joins', reason: 'Declarative SQL makes multi-table queries easy to express' },
        { scenario: 'Systems requiring strong consistency', reason: 'RDBMS enforces constraints at DB level, not app level' }
      ]),
      whenNotToUse: JSON.stringify([
        { scenario: 'Unstructured or frequently changing schema', reason: 'Schema migrations are expensive and require downtime planning' },
        { scenario: 'Extreme horizontal write scale (millions of writes/sec)', reason: 'Single-node RDBMS becomes a bottleneck; sharding is complex' }
      ]),
      keyPoints: JSON.stringify([
        'ACID: Atomicity, Consistency, Isolation, Durability',
        'Primary key uniquely identifies each row; foreign key links tables',
        'Normalization reduces redundancy; denormalization improves read speed',
        'JOINs are powerful but expensive — index join columns',
        'Use transactions for any multi-step operation that must be atomic'
      ]),
      quiz: JSON.stringify([
        { id: 'rdb1', type: 'multiple_choice', question: 'Which ACID property ensures a transaction either fully completes or fully rolls back?', options: ['Consistency', 'Isolation', 'Atomicity', 'Durability'], correctAnswer: 2, explanation: 'Atomicity means all-or-nothing — partial updates never persist.' },
        { id: 'rdb2', type: 'multiple_choice', question: 'What is the main purpose of a foreign key?', options: ['Speed up queries', 'Enforce referential integrity', 'Compress data', 'Partition tables'], correctAnswer: 1, explanation: 'Foreign keys ensure referenced rows actually exist, preventing orphan records.' },
        { id: 'rdb3', type: 'fill_blank', question: 'The process of splitting data into multiple tables to eliminate redundancy is called _____.', correctAnswer: 'normalization', explanation: 'Normalization organizes tables to reduce duplication and dependency.' }
      ])
    },
    {
      title: 'Database Indexing',
      slug: 'database-indexing',
      order: 2,
      summary: 'Indexes are separate data structures (usually B-trees) that store a sorted copy of one or more columns, allowing the database to find rows without scanning the entire table. The trade-off: indexes speed up reads but slow down writes and consume disk space.',
      analogy: "An index in a database is exactly like the index in a textbook. Instead of reading every page to find 'hashing', you jump to the index, find page 234, and go directly there. The index itself takes extra pages but saves enormous time.",
      diagram: `Without Index:           With Index (B-Tree):
┌──────────────────┐    ┌─────────────┐
│ Scan ALL rows    │    │   B-Tree    │
│ Row 1: age=25   │    │  Root: 50   │
│ Row 2: age=31   │    │ /         \ │
│ Row 3: age=50   │    │25          75│
│ Row 4: age=18   │    └──────┬──────┘
│ ...1M rows...   │           │ Points to
│ O(n) scan       │    exact row ptr
└──────────────────┘    O(log n) lookup`,
      diagramSteps: JSON.stringify([
        { step: 1, title: 'Full Table Scan', description: 'SELECT * FROM users WHERE age=25 — without index, DB reads every row. O(n).', diagram: 'Scans 1,000,000 rows to find 100 matches' },
        { step: 2, title: 'B-Tree Index', description: 'B-Tree keeps values sorted in a balanced tree. Each node stores keys + child pointers.', diagram: 'Root → branches → leaf (row pointer) in O(log n)' },
        { step: 3, title: 'Composite Index', description: 'Index on (user_id, created_at) supports WHERE user_id=X AND created_at>Y but NOT WHERE created_at>Y alone.', diagram: 'Leftmost prefix rule: use index columns left-to-right' },
        { step: 4, title: 'Index Cost', description: 'Every INSERT/UPDATE/DELETE must also update the index. More indexes = slower writes.', diagram: 'Write to table + write to each index tree' }
      ]),
      tradeoffs: JSON.stringify([
        { title: 'More Indexes vs Fewer Indexes', optionA: 'Many indexes: fast reads for many query patterns', optionB: 'Few indexes: fast writes, less storage', recommendation: 'Index columns in WHERE, JOIN, ORDER BY clauses only', reasoning: 'Unused indexes only add write overhead — profile before adding' },
        { title: 'B-Tree vs Hash Index', optionA: 'B-Tree: range queries, ORDER BY, inequality operators', optionB: 'Hash: exact equality lookups only, faster for =', recommendation: 'B-Tree for general use; Hash for cache-like equality lookups', reasoning: 'B-Tree is versatile; hash index cannot support BETWEEN or ORDER BY' }
      ]),
      whenToUse: JSON.stringify([
        { scenario: 'Columns frequently used in WHERE clauses', reason: 'Converts O(n) scan to O(log n) lookup' },
        { scenario: 'Foreign key columns', reason: 'JOIN operations are dramatically faster with indexes on join columns' },
        { scenario: 'Columns used in ORDER BY or GROUP BY', reason: 'Indexed sort avoids expensive in-memory sort operations' }
      ]),
      whenNotToUse: JSON.stringify([
        { scenario: 'Small tables (< few thousand rows)', reason: 'Full scan is fast enough; index overhead not worth it' },
        { scenario: 'Columns with very low cardinality (e.g., boolean)', reason: 'Index on a column with only 2 values provides minimal selectivity' }
      ]),
      keyPoints: JSON.stringify([
        'B-Tree indexes support equality, range, and sort operations in O(log n)',
        'Composite indexes follow leftmost prefix rule',
        'Every index adds overhead to INSERT/UPDATE/DELETE',
        'EXPLAIN/EXPLAIN ANALYZE shows whether queries use indexes',
        'Covering index includes all columns a query needs — avoids table lookup entirely'
      ]),
      quiz: JSON.stringify([
        { id: 'idx1', type: 'multiple_choice', question: 'What data structure do most relational databases use for indexes?', options: ['Hash table', 'B-Tree', 'Red-Black Tree', 'Skip List'], correctAnswer: 1, explanation: 'B-Trees provide O(log n) for both point lookups and range scans, making them ideal for database indexes.' },
        { id: 'idx2', type: 'multiple_choice', question: 'A composite index on (a, b, c). Which query CANNOT use this index efficiently?', options: ['WHERE a=1 AND b=2', 'WHERE a=1', 'WHERE b=2 AND c=3', 'WHERE a=1 AND b=2 AND c=3'], correctAnswer: 2, explanation: 'The leftmost prefix rule means skipping column a makes the index unusable.' },
        { id: 'idx3', type: 'fill_blank', question: 'An index that contains all columns needed by a query, avoiding a table lookup, is called a _____ index.', correctAnswer: 'covering', explanation: 'Covering indexes return query results directly from the index without touching the main table.' }
      ])
    },
    {
      title: 'NoSQL Data Modeling',
      slug: 'nosql-data-modeling',
      order: 3,
      summary: 'NoSQL databases (document, key-value, column-family, graph) sacrifice strict schemas and JOINs to gain horizontal scalability and schema flexibility. The key shift: model data around your access patterns (how you read), not around relationships (how data is related).',
      analogy: 'SQL is like a strict office with every document in a labeled folder with a fixed template. NoSQL is like a personal notebook — you can store whatever format you need per page, organize by how you use the notes, and add pages infinitely.',
      diagram: `SQL (normalized):              NoSQL (document — MongoDB):
┌─────────┐  ┌──────────┐      {
│ users   │  │ posts    │        "_id": "u123",
│ id      │  │ id       │        "name": "Alice",
│ name    │  │ user_id  │        "posts": [
└─────────┘  │ content  │          { "title": "Hello",
     ↑       └──────────┘            "content": "..." },
     JOIN          JOIN              { "title": "World",
                                      "content": "..." }
                                  ]
                                }`,
      diagramSteps: JSON.stringify([
        { step: 1, title: 'Identify Access Patterns', description: 'Start with: what queries will this system run? Model to serve those queries, not to minimize redundancy.', diagram: 'Q1: Get user + their posts → embed posts in user doc' },
        { step: 2, title: 'Embedding vs Referencing', description: 'Embed for data read together often (avoids extra query). Reference for data shared across many parents.', diagram: 'User document embeds posts; posts reference author by id' },
        { step: 3, title: 'Denormalization', description: 'Duplicate data is acceptable in NoSQL to avoid cross-document lookups. Storage is cheap; latency is not.', diagram: 'Store author.name inside each post document → no join needed' },
        { step: 4, title: 'Partition Key Choice', description: 'In DynamoDB/Cassandra, the partition key determines which node stores the data. Bad key → hot partition.', diagram: 'user_id as key: even distribution. timestamp as key: all writes to same shard' }
      ]),
      tradeoffs: JSON.stringify([
        { title: 'Embedding vs Referencing', optionA: 'Embed: single document read, no joins, larger docs', optionB: 'Reference: smaller docs, multiple reads for related data', recommendation: 'Embed if data is always read together and bounded in size', reasoning: 'Embedded docs are faster to read; referenced docs are better for unbounded lists' },
        { title: 'MongoDB vs DynamoDB', optionA: 'MongoDB: flexible querying, rich aggregations, self-hosted option', optionB: 'DynamoDB: fully managed, predictable latency, requires access pattern upfront', recommendation: 'DynamoDB for AWS-native apps at scale; MongoDB for flexible query needs', reasoning: 'DynamoDB scales automatically; MongoDB offers more query flexibility' }
      ]),
      whenToUse: JSON.stringify([
        { scenario: 'Rapidly changing or unstructured data schemas', reason: 'Document stores allow schema evolution without migrations' },
        { scenario: 'Extreme horizontal write scale', reason: 'NoSQL partitions across nodes more easily than RDBMS sharding' },
        { scenario: 'Key-value access patterns (get by ID)', reason: 'Simple lookups by key are O(1) in key-value stores' }
      ]),
      whenNotToUse: JSON.stringify([
        { scenario: 'Complex multi-entity transactions', reason: 'Most NoSQL stores have limited or no multi-document ACID' },
        { scenario: 'Ad-hoc analytical queries across all data', reason: 'Without schema, arbitrary queries require full scans or special indexing' }
      ]),
      keyPoints: JSON.stringify([
        'Model around access patterns, not data relationships',
        'Embedding = fewer reads; referencing = less duplication',
        'Denormalization is normal and expected in NoSQL',
        'Partition key choice is critical — avoid hot partitions',
        'NoSQL trades JOINs and transactions for scale and flexibility'
      ]),
      quiz: JSON.stringify([
        { id: 'nosql1', type: 'multiple_choice', question: 'In NoSQL data modeling, what should you model data around?', options: ['Entity relationships', 'Normal forms', 'Access patterns', 'Foreign keys'], correctAnswer: 2, explanation: 'NoSQL models are designed to serve specific query patterns efficiently, not to minimize redundancy.' },
        { id: 'nosql2', type: 'multiple_choice', question: 'When should you EMBED a document rather than reference it?', options: ['When data is shared across many parents', 'When data is always read together and bounded', 'When you need transactions across documents', 'When you need to normalize the schema'], correctAnswer: 1, explanation: 'Embedding makes sense when data is tightly coupled to its parent and has a bounded, manageable size.' },
        { id: 'nosql3', type: 'fill_blank', question: 'In DynamoDB and Cassandra, the _____ key determines which node stores the data.', correctAnswer: 'partition', explanation: 'The partition key (also called shard key) determines data distribution across nodes.' }
      ])
    },
    {
      title: 'Caching Strategies Deep Dive',
      slug: 'caching-strategies-deep-dive',
      order: 4,
      summary: 'Beyond basic caching, three write strategies define how data flows between cache and database: Cache-Aside (app manages cache manually), Write-Through (write to cache and DB simultaneously), and Write-Back (write to cache first, sync to DB later). Each has different consistency and performance trade-offs.',
      analogy: "Cache-aside is like checking your fridge before going to the store. Write-through is like always buying two copies — one for home, one for storage. Write-back is like taking notes on a whiteboard first and only filing them officially at the end of the day.",
      diagram: `Cache-Aside:          Write-Through:       Write-Back:
App → Cache miss?     App → Cache          App → Cache
↓ Yes                 ↓                    ↓
App → DB read         Cache → DB sync      (async)
↓                     ↓                    Cache → DB later
App → Cache write     Return to App        Return to App fast`,
      diagramSteps: JSON.stringify([
        { step: 1, title: 'Cache-Aside (Lazy Loading)', description: 'App checks cache first. On miss: fetch from DB, populate cache, return. App is responsible for cache management.', diagram: 'Read: App→Cache(miss)→DB→Cache(fill)→App' },
        { step: 2, title: 'Write-Through', description: 'Every write goes to cache AND database synchronously. Cache is always consistent with DB.', diagram: 'Write: App→Cache(write)→DB(write)→Confirm' },
        { step: 3, title: 'Write-Back (Write-Behind)', description: 'Write hits cache only; DB update is async/batched. Fastest writes, but risk of data loss on cache crash.', diagram: 'Write: App→Cache(write)→Confirm(fast). Async: Cache→DB' },
        { step: 4, title: 'Cache Eviction Policies', description: 'LRU evicts least recently used items. LFU evicts least frequently used. TTL expires items after time.', diagram: 'LRU: evict oldest accessed. TTL: expire after 60s. LFU: evict coldest' }
      ]),
      tradeoffs: JSON.stringify([
        { title: 'Cache-Aside vs Write-Through', optionA: 'Cache-Aside: only caches data actually read, resilient to cache restart', optionB: 'Write-Through: always consistent, but writes are slower (two writes)', recommendation: 'Cache-Aside for read-heavy, Write-Through for read-after-write consistency', reasoning: 'Cache-aside avoids warming unused data; write-through ensures cache is never stale' },
        { title: 'Write-Through vs Write-Back', optionA: 'Write-Through: consistent, slower writes', optionB: 'Write-Back: fast writes, risk of data loss', recommendation: 'Write-Through for financial data; Write-Back for high-throughput non-critical writes', reasoning: 'Write-back can lose recent writes if cache fails before flushing' }
      ]),
      whenToUse: JSON.stringify([
        { scenario: 'Read-heavy workloads with occasional writes', reason: 'Cache-aside reduces DB load with minimal write overhead' },
        { scenario: 'Systems that must always read their own writes', reason: 'Write-through ensures cache reflects the latest write immediately' },
        { scenario: 'High-throughput write systems like analytics ingestion', reason: 'Write-back batches DB writes, dramatically reducing write IOPS' }
      ]),
      whenNotToUse: JSON.stringify([
        { scenario: 'Write-back for financial transactions', reason: 'Risk of losing acknowledged-but-not-persisted writes if cache crashes' },
        { scenario: 'Cache-aside for write-heavy workloads', reason: 'Constant cache invalidation leads to high miss rates' }
      ]),
      keyPoints: JSON.stringify([
        'Cache-Aside: app manages cache; simple, lazy, resilient to restarts',
        'Write-Through: every write hits both cache and DB; always consistent',
        'Write-Back: write cache first, DB async; fastest writes, data loss risk',
        'LRU, LFU, TTL are the main eviction/expiry policies',
        'Cache stampede: many requests miss at once — use locks or probabilistic refresh'
      ]),
      quiz: JSON.stringify([
        { id: 'cs1', type: 'multiple_choice', question: 'In write-back caching, when is data written to the database?', options: ['Immediately on every write', 'Only on read', 'Asynchronously after the cache write', 'Only when cache is full'], correctAnswer: 2, explanation: 'Write-back acknowledges the write after updating only the cache; DB update happens asynchronously.' },
        { id: 'cs2', type: 'multiple_choice', question: 'Which caching strategy is most resilient to a cache restart?', options: ['Write-through', 'Write-back', 'Cache-aside', 'Read-through'], correctAnswer: 2, explanation: 'Cache-aside only caches data actually requested; after restart, it repopulates lazily from DB.' },
        { id: 'cs3', type: 'fill_blank', question: 'The caching policy that evicts the item that was accessed least recently is called _____.', correctAnswer: 'LRU', explanation: 'LRU (Least Recently Used) evicts the entry with the oldest last-access timestamp.' }
      ])
    },
    {
      title: 'Time-Series Databases',
      slug: 'time-series-databases',
      order: 5,
      summary: 'Time-series databases (TSDB) are optimized for append-only, timestamped data — metrics, events, logs. They compress sequences of similar values efficiently and support time-window queries. Examples: InfluxDB, TimescaleDB, Prometheus. Key concepts: retention policies, downsampling, and aggregations.',
      analogy: 'A time-series database is like a weather station log book — every entry has a timestamp and a reading. The book is always written forward (never edits past entries), and you query it with questions like "what was the average temperature last week at 3pm".',
      diagram: `Traditional DB:              Time-Series DB:
┌──────────────────────┐     ┌──────────────────────────┐
│ id | metric | value  │     │ timestamp  | cpu_host1   │
│ 1  | cpu    | 45.2   │     │ 1700000000 | 45.2        │
│ 2  | cpu    | 46.1   │     │ 1700000060 | 46.1        │
│ ...random updates... │     │ 1700000120 | 44.8 (append)│
└──────────────────────┘     └──────────────────────────┘
Costly: index on every col   Optimized: time as primary axis`,
      diagramSteps: JSON.stringify([
        { step: 1, title: 'Append-Only Model', description: 'TSDBs never update past data. Every new reading is appended. This enables massive compression of sequential values.', diagram: 'Write: append(timestamp, value). Never UPDATE or DELETE historical rows' },
        { step: 2, title: 'Compression', description: 'Sequential timestamps differ by a constant (delta encoding). Values often similar (XOR compression). 10x-100x compression vs row store.', diagram: 'Store deltas: [0, 60, 60, 60] instead of [1700000000, 1700000060, ...]' },
        { step: 3, title: 'Retention & Downsampling', description: 'Raw data kept for 30 days. Automatically downsampled to hourly averages for 1 year. Yearly averages kept forever.', diagram: 'Raw → 1min avg (30d) → 1hr avg (1yr) → 1day avg (∞)' },
        { step: 4, title: 'Time-Window Queries', description: 'SELECT mean(cpu) WHERE time > now()-1h GROUP BY time(5m) — native time aggregation operators.', diagram: '1-hour window, 5-minute buckets → 12 data points returned' }
      ]),
      tradeoffs: JSON.stringify([
        { title: 'InfluxDB vs TimescaleDB', optionA: 'InfluxDB: purpose-built TSDB, custom query language (Flux), excellent compression', optionB: 'TimescaleDB: PostgreSQL extension, use standard SQL, easier migration', recommendation: 'TimescaleDB if already using PostgreSQL; InfluxDB for dedicated metrics pipeline', reasoning: 'TimescaleDB lowers learning curve; InfluxDB provides better native TSDB features' }
      ]),
      whenToUse: JSON.stringify([
        { scenario: 'Application/infrastructure metrics (CPU, memory, latency)', reason: 'High-frequency append-only writes with time-window query patterns' },
        { scenario: 'IoT sensor data', reason: 'Millions of devices emitting timestamped readings continuously' },
        { scenario: 'Financial tick data', reason: 'Every price update is append-only with strict time ordering' }
      ]),
      whenNotToUse: JSON.stringify([
        { scenario: 'Mutable business entities (users, orders)', reason: 'Time-series DBs are append-only — not suitable for frequently updated records' },
        { scenario: 'Relational data requiring joins', reason: 'TSDBs optimize for time-window aggregations, not arbitrary joins' }
      ]),
      keyPoints: JSON.stringify([
        'TSDBs are append-only, optimized for timestamp-ordered data',
        'Delta and XOR encoding compress time-series data 10-100x',
        'Retention policies automatically expire old raw data',
        'Downsampling rolls up high-resolution data to save storage',
        'Prometheus + Grafana is the most common open-source TSDB stack'
      ]),
      quiz: JSON.stringify([
        { id: 'tsdb1', type: 'multiple_choice', question: 'What property makes time-series databases highly compressible?', options: ['Random access patterns', 'Append-only sequential writes', 'Complex joins', 'Schema flexibility'], correctAnswer: 1, explanation: 'Sequential timestamps and similar adjacent values compress dramatically with delta and XOR encoding.' },
        { id: 'tsdb2', type: 'multiple_choice', question: 'What is downsampling in a TSDB context?', options: ['Compressing data at write time', 'Reducing write throughput', 'Rolling up high-resolution data to lower-resolution aggregates', 'Partitioning data by time'], correctAnswer: 2, explanation: 'Downsampling converts 1-second raw data to 1-minute averages to save long-term storage.' },
        { id: 'tsdb3', type: 'fill_blank', question: 'The process of automatically deleting data older than a configured age in a TSDB is handled by a _____ policy.', correctAnswer: 'retention', explanation: 'Retention policies define how long raw and aggregated data is kept.' }
      ])
    },
    {
      title: 'Search Engines (Elasticsearch)',
      slug: 'search-engines-elasticsearch',
      order: 6,
      summary: 'Full-text search engines like Elasticsearch build inverted indexes that map terms to documents. Unlike SQL LIKE queries, they support relevance ranking, fuzzy matching, and analyze text at write time (stemming, stopwords, tokenization). Used for product search, log analysis, and autocomplete.',
      analogy: "An inverted index is like a book's index in reverse. Instead of 'Chapter 5 contains these words', it says 'the word \"distributed\" appears in documents 3, 7, 42'. Finding all documents containing a word is an instant lookup.",
      diagram: `Document Store:              Inverted Index:
┌──────────────────────┐     ┌────────────────────────────┐
│ Doc 1: "fast search" │     │ "fast"   → [Doc1, Doc3]    │
│ Doc 2: "slow query"  │     │ "search" → [Doc1, Doc2]    │
│ Doc 3: "fast index"  │     │ "slow"   → [Doc2]          │
└──────────────────────┘     │ "index"  → [Doc3]          │
                             └────────────────────────────┘
Query "fast search" → intersect → Doc1`,
      diagramSteps: JSON.stringify([
        { step: 1, title: 'Indexing Pipeline', description: 'Text → Tokenize → Lowercase → Remove stopwords → Stem → Store in inverted index', diagram: '"Running quickly" → ["run", "quick"] → indexed' },
        { step: 2, title: 'Inverted Index', description: 'Maps every term to the list of documents containing it, plus position information for phrase matching.', diagram: '"run" → [(doc1, pos:3), (doc5, pos:1)]' },
        { step: 3, title: 'Relevance Scoring (TF-IDF / BM25)', description: 'TF: term appears often in doc → more relevant. IDF: term appears in few docs → more distinctive.', diagram: 'Score = TF × IDF. Common words score low; rare precise matches score high' },
        { step: 4, title: 'Sharding in Elasticsearch', description: 'Index is split into primary shards distributed across nodes. Each shard is a full Lucene index.', diagram: 'Index → 5 primary shards → distributed across 3 nodes' }
      ]),
      tradeoffs: JSON.stringify([
        { title: 'Elasticsearch vs PostgreSQL Full-Text', optionA: 'Elasticsearch: purpose-built, scalable, rich query DSL, relevance ranking', optionB: 'PostgreSQL FTS: simpler stack, good for basic search, no separate service', recommendation: 'PostgreSQL FTS for simple search; Elasticsearch for complex, scaled search', reasoning: 'Elasticsearch adds operational complexity but provides dramatically better search features' }
      ]),
      whenToUse: JSON.stringify([
        { scenario: 'Product catalog search with relevance ranking', reason: 'Inverted index + BM25 scoring returns relevant results, not just matches' },
        { scenario: 'Log aggregation and analysis (ELK stack)', reason: 'Elasticsearch handles high-volume append-only log ingestion with real-time search' },
        { scenario: 'Autocomplete and typo-tolerance', reason: 'Edge N-gram analyzers and fuzzy matching enable instant search-as-you-type' }
      ]),
      whenNotToUse: JSON.stringify([
        { scenario: 'Primary database for transactional data', reason: 'Elasticsearch is eventually consistent and lacks ACID transactions' },
        { scenario: 'Simple exact-match lookups by ID', reason: 'A regular database with an index is simpler and sufficient' }
      ]),
      keyPoints: JSON.stringify([
        'Inverted index maps terms to documents — enables O(1) term lookup',
        'Text analysis pipeline: tokenize → normalize → stem → index',
        'BM25 scoring ranks results by relevance, not just presence',
        'Elasticsearch shards distribute data horizontally across nodes',
        'Always maintain a primary DB + sync to Elasticsearch; never use ES as source of truth'
      ]),
      quiz: JSON.stringify([
        { id: 'es1', type: 'multiple_choice', question: 'What data structure does Elasticsearch use to enable fast full-text search?', options: ['B-Tree index', 'Hash table', 'Inverted index', 'Sorted array'], correctAnswer: 2, explanation: 'An inverted index maps each term to the documents containing it, enabling instant term lookup.' },
        { id: 'es2', type: 'multiple_choice', question: 'What does IDF (Inverse Document Frequency) measure?', options: ['How often a term appears in a document', 'How rare a term is across all documents', 'The number of shards in a cluster', 'The latency of a search query'], correctAnswer: 1, explanation: 'IDF scores rare terms higher — a term appearing in few documents is more distinctive and relevant.' },
        { id: 'es3', type: 'fill_blank', question: 'The process of converting text into tokens during indexing (lowercasing, stemming, etc.) is called text _____.', correctAnswer: 'analysis', explanation: 'Text analysis normalizes text so "Running" and "run" match the same inverted index entries.' }
      ])
    },
    {
      title: 'Object Storage',
      slug: 'object-storage',
      order: 7,
      summary: "Object storage (S3, GCS, Azure Blob) stores files as objects with metadata and a globally unique key. Unlike a file system, there's no hierarchy or editing — objects are immutable, stored flat, and accessed via HTTP. Ideal for media, backups, and static assets at massive scale.",
      analogy: "Object storage is like a giant post office with infinite lockboxes. Each box has a unique address (key). You can put anything inside and retrieve it by address. You can't modify the contents — you replace the whole box. Anyone with the address (and permission) can retrieve it.",
      diagram: `File System:                Object Storage (S3):
/photos/                    Bucket: my-app-photos
  2024/                     ┌─────────────────────────────┐
    january/                │ Key: photos/2024/jan/a.jpg  │
      a.jpg                 │ Key: photos/2024/jan/b.jpg  │
      b.jpg                 │ Key: videos/intro.mp4       │
/videos/                    │ Key: backups/db-2024.sql.gz │
  intro.mp4                 └─────────────────────────────┘
Hierarchy enforced           Flat namespace, HTTP access`,
      diagramSteps: JSON.stringify([
        { step: 1, title: 'Object Model', description: 'Each object = key + data + metadata. Keys look like paths but are just strings. Metadata includes content-type, user tags, ETag.', diagram: 'PUT /bucket/photos/cat.jpg → stores object at key' },
        { step: 2, title: 'Immutability', description: 'Objects cannot be modified — only replaced. This enables simple replication, deduplication, and versioning.', diagram: 'To update: PUT new object at same key. Old version stored if versioning enabled.' },
        { step: 3, title: 'Access Control', description: 'Bucket policies and IAM roles control access. Pre-signed URLs grant temporary access to private objects without credentials.', diagram: 'Presigned URL: GET /bucket/private.jpg?X-Amz-Signature=... (expires in 1hr)' },
        { step: 4, title: 'CDN Integration', description: 'Put CloudFront/CDN in front of S3. CDN caches objects at edge locations — users download from nearby PoP, not origin.', diagram: 'User → CDN edge (cache hit) → response fast. Miss → S3 origin → cache → response' }
      ]),
      tradeoffs: JSON.stringify([
        { title: 'Object Storage vs Block Storage', optionA: 'Object: infinite scale, HTTP access, immutable, cheap, no POSIX', optionB: 'Block: mountable as disk, mutable, low-latency IOPS, expensive', recommendation: 'Object for media/static assets; block for database data and OS volumes', reasoning: 'Object storage scales cheaply for large files; block storage is needed for random writes' }
      ]),
      whenToUse: JSON.stringify([
        { scenario: 'User-uploaded media (images, videos, documents)', reason: 'Object storage handles arbitrary file sizes at petabyte scale for pennies per GB' },
        { scenario: 'Static website assets (JS, CSS, fonts)', reason: 'Combine with CDN for global low-latency static asset delivery' },
        { scenario: 'Database backups and log archives', reason: 'Durable, cheap, versioned storage for compliance and recovery' }
      ]),
      whenNotToUse: JSON.stringify([
        { scenario: 'Frequently updated files (databases, app state)', reason: 'Object storage is immutable — every update is a full replace operation' },
        { scenario: 'High-frequency small file I/O', reason: 'HTTP overhead makes object storage slow for many small reads/writes' }
      ]),
      keyPoints: JSON.stringify([
        'Objects are immutable — no partial updates, only full replacement',
        'Flat namespace: keys look like paths but have no real hierarchy',
        'Pre-signed URLs allow temporary access to private objects',
        'Designed for 11 nines (99.999999999%) durability via multi-AZ replication',
        'Always combine with a CDN to reduce latency and S3 egress costs'
      ]),
      quiz: JSON.stringify([
        { id: 'obj1', type: 'multiple_choice', question: 'Which statement about object storage is correct?', options: ['Objects can be partially updated in-place', 'Objects are organized in a real directory hierarchy', 'Objects are immutable and accessed via HTTP', 'Object storage uses block-level I/O'], correctAnswer: 2, explanation: 'Objects are immutable (replace-only) and accessed via HTTP API, not POSIX file operations.' },
        { id: 'obj2', type: 'multiple_choice', question: 'What is a pre-signed URL in S3?', options: ['A URL that requires IAM login', 'A temporary URL granting access to a private object', 'A CDN-cached URL', 'A versioned URL for an old object'], correctAnswer: 1, explanation: 'Pre-signed URLs embed credentials and an expiry, granting temporary access without requiring the caller to have AWS credentials.' },
        { id: 'obj3', type: 'fill_blank', question: 'Object storage is designed for 11 nines of durability through multi-_____ replication.', correctAnswer: 'AZ', explanation: 'S3 stores objects across multiple Availability Zones, achieving 99.999999999% durability.' }
      ])
    },
    {
      title: 'Data Warehouses & Analytics',
      slug: 'data-warehouses-analytics',
      order: 8,
      summary: 'Data warehouses (Redshift, BigQuery, Snowflake) are columnar stores optimized for OLAP (Online Analytical Processing) — aggregating billions of rows. Unlike OLTP databases optimized for single-row reads/writes, warehouses read entire columns for aggregations, enabling fast analytical queries.',
      analogy: "A data warehouse is like a spreadsheet designed for calculations, not for filling in individual cells. Every column is stored together, so summing a million prices means reading one column — not scanning millions of rows. It's built for analysis, not transactions.",
      diagram: `OLTP (Row Store):             OLAP (Column Store):
┌────┬────────┬───────┐       ┌──────────────────────────┐
│ id │ name   │ price │       │ id col:   [1,2,3,4,5...] │
│ 1  │ Shirt  │ 29.99 │       │ name col: [Shirt,Hat,...] │
│ 2  │ Hat    │ 14.99 │       │ price col:[29.99,14.99,..] │
│ 3  │ Shoes  │ 89.99 │       └──────────────────────────┘
└────┴────────┴───────┘       SUM(price): read 1 column
Read 1 row: read full row     Compress well: similar values`,
      diagramSteps: JSON.stringify([
        { step: 1, title: 'Columnar Storage', description: 'Instead of storing row by row, store column by column. SUM(revenue) reads only the revenue column — not every field of every row.', diagram: 'Row store: read 100 bytes × 1B rows. Column store: read 8 bytes × 1B values (one column)' },
        { step: 2, title: 'Compression', description: 'Column values are often similar (e.g., country codes, product categories). Dictionary encoding and RLE compress 5-10x.', diagram: '"US" repeated 80% → encode once as 0, store [0,0,0,1,0,...] instead' },
        { step: 3, title: 'ETL Pipeline', description: 'Extract from OLTP databases → Transform (clean, join, aggregate) → Load into warehouse. Often nightly batch.', diagram: 'MySQL/Postgres (OLTP) → Spark ETL → Redshift/BigQuery (OLAP)' },
        { step: 4, title: 'Partitioning & Clustering', description: 'Partition by date: queries on last 7 days only scan 7 date partitions. Cluster by user_id: similar users stored together.', diagram: 'WHERE date > 2024-01-01: skips all partitions before that date' }
      ]),
      tradeoffs: JSON.stringify([
        { title: 'BigQuery vs Redshift vs Snowflake', optionA: 'BigQuery: serverless, pay-per-query, Google ecosystem', optionB: 'Snowflake: multi-cloud, compute/storage separation, easy to share data', recommendation: 'BigQuery for Google Cloud; Snowflake for multi-cloud or data sharing needs', reasoning: 'All three are excellent; choose based on existing cloud provider and team familiarity' }
      ]),
      whenToUse: JSON.stringify([
        { scenario: 'Business analytics and dashboards', reason: 'Aggregating millions to billions of rows is what warehouses are built for' },
        { scenario: 'Historical data analysis spanning months/years', reason: 'Partition pruning makes long time-range scans efficient' },
        { scenario: 'Joining data from multiple operational systems', reason: 'ETL consolidates disparate data sources into one queryable store' }
      ]),
      whenNotToUse: JSON.stringify([
        { scenario: 'Real-time transactional workloads (OLTP)', reason: 'Columnar storage is slow for single-row lookups and updates' },
        { scenario: 'Sub-second query latency requirements', reason: 'Warehouse queries often take seconds to minutes for complex aggregations' }
      ]),
      keyPoints: JSON.stringify([
        'Columnar storage reads only needed columns — ideal for aggregate queries',
        'Similar column values compress 5-10x vs row storage',
        'ETL: Extract → Transform → Load data from OLTP into warehouse',
        'Partition by date to enable partition pruning on time-range queries',
        'OLTP for transactions, OLAP for analytics — never mix these concerns'
      ]),
      quiz: JSON.stringify([
        { id: 'dw1', type: 'multiple_choice', question: 'Why is columnar storage faster for analytical queries like SUM(revenue)?', options: ['It uses a faster CPU', 'It reads only the revenue column, skipping all other columns', 'It caches all results in memory', 'It uses more indexes'], correctAnswer: 1, explanation: 'Columnar storage reads only the queried column, dramatically reducing I/O for aggregation queries.' },
        { id: 'dw2', type: 'multiple_choice', question: 'What does ETL stand for?', options: ['Execute, Test, Launch', 'Extract, Transform, Load', 'Encrypt, Transfer, Log', 'Event, Trigger, Loop'], correctAnswer: 1, explanation: 'ETL pipelines Extract data from sources, Transform it (clean/join/aggregate), then Load it into the warehouse.' },
        { id: 'dw3', type: 'fill_blank', question: 'OLTP databases are optimized for transactions; data warehouses are optimized for _____ queries.', correctAnswer: 'analytical', explanation: 'OLAP (Online Analytical Processing) workloads involve complex aggregations over large datasets.' }
      ])
    }
  ];

  for (const l of t3lessons) {
    await prisma.designLesson.upsert({
      where: { slug: l.slug },
      update: {},
      create: { ...l, trackId: track3.id }
    });
  }

  // ─── TRACK 4: Communication & APIs ────────────────────────────────────────
  const track4 = await prisma.designTrack.upsert({
    where: { slug: 'communication-apis' },
    update: {},
    create: {
      name: 'Communication & APIs',
      slug: 'communication-apis',
      description: 'Design robust APIs and master inter-service communication patterns from REST to gRPC',
      icon: '🔌',
      color: '#AF52DE',
      order: 4,
      level: 'intermediate'
    }
  });

  const t4lessons = [
    {
      title: 'RESTful API Design',
      slug: 'restful-api-design',
      order: 1,
      summary: 'REST (Representational State Transfer) is an architectural style for APIs using HTTP verbs (GET, POST, PUT, DELETE, PATCH) on resource URLs. Key principles: stateless, uniform interface, resource-based URLs. Good REST API design is intuitive, versioned, and returns consistent error formats.',
      analogy: "REST is like a library's checkout system. Each book is a resource with an address (URL). You check out (GET), return (DELETE), update details (PUT/PATCH), or add new books (POST). The librarian doesn't remember you between visits (stateless) — you always present your card.",
      diagram: `Resource: /api/v1/users

GET    /users           → list users
POST   /users           → create user
GET    /users/:id       → get user
PUT    /users/:id       → replace user
PATCH  /users/:id       → update fields
DELETE /users/:id       → delete user

GET    /users/:id/posts → nested resource`,
      diagramSteps: JSON.stringify([
        { step: 1, title: 'Resource-Based URLs', description: 'URLs identify resources (nouns), not actions. Bad: /getUser. Good: GET /users/:id', diagram: 'GET /orders/123 → fetch order 123. POST /orders → create order' },
        { step: 2, title: 'HTTP Verbs & Status Codes', description: 'GET=read, POST=create, PUT=replace, PATCH=partial update, DELETE=remove. 200/201/204 success, 400 bad request, 401 unauth, 403 forbidden, 404 not found, 500 server error.', diagram: 'POST /users → 201 Created. DELETE /users/999 → 404 Not Found' },
        { step: 3, title: 'Pagination', description: 'Never return unbounded lists. Use cursor-based pagination (next page token) or offset pagination. Cursor is preferred for large/live datasets.', diagram: 'GET /posts?cursor=abc123&limit=20 → returns 20 posts + next_cursor' },
        { step: 4, title: 'Versioning', description: 'API changes break clients. Version in URL path (/v1/, /v2/) or header. Keep old versions running during client migration.', diagram: '/api/v1/users → legacy. /api/v2/users → new format. Both live simultaneously' }
      ]),
      tradeoffs: JSON.stringify([
        { title: 'URL Versioning vs Header Versioning', optionA: 'URL: /v1/users — visible, cacheable, easy to test in browser', optionB: 'Header: Accept: application/vnd.api.v2+json — cleaner URLs, harder to test', recommendation: 'URL versioning for public APIs; header for internal APIs', reasoning: 'URL versioning is more explicit and developer-friendly for public consumption' }
      ]),
      whenToUse: JSON.stringify([
        { scenario: 'Public-facing APIs consumed by third parties', reason: 'REST is universally understood and works with any HTTP client' },
        { scenario: 'CRUD operations on resources', reason: 'REST maps naturally to create/read/update/delete operations' },
        { scenario: 'Browser-to-server communication', reason: 'REST over HTTPS is the native protocol for web clients' }
      ]),
      whenNotToUse: JSON.stringify([
        { scenario: 'Real-time bidirectional communication', reason: 'HTTP request-response model requires WebSockets or SSE for real-time' },
        { scenario: 'Internal microservice-to-microservice RPCs at scale', reason: 'gRPC provides better performance and type safety for internal services' }
      ]),
      keyPoints: JSON.stringify([
        'Resources are nouns; HTTP verbs define actions on them',
        'Always use consistent error response format: {error, code, message}',
        'Paginate all list endpoints — never return unbounded results',
        'Version your API before making breaking changes',
        'Stateless: each request must contain all context needed to process it'
      ]),
      quiz: JSON.stringify([
        { id: 'rest1', type: 'multiple_choice', question: 'What HTTP method should be used to create a new resource?', options: ['GET', 'PUT', 'POST', 'PATCH'], correctAnswer: 2, explanation: 'POST is the idiomatic HTTP method for creating new resources, returning 201 Created on success.' },
        { id: 'rest2', type: 'multiple_choice', question: 'What is the correct HTTP status code for a successful resource deletion?', options: ['200 OK', '201 Created', '204 No Content', '404 Not Found'], correctAnswer: 2, explanation: '204 No Content is the correct response for DELETE — success with no body to return.' },
        { id: 'rest3', type: 'fill_blank', question: 'REST APIs must be _____, meaning each request contains all information needed without server-side session state.', correctAnswer: 'stateless', explanation: 'Statelessness enables horizontal scaling — any server can handle any request.' }
      ])
    },
    {
      title: 'GraphQL',
      slug: 'graphql',
      order: 2,
      summary: 'GraphQL is a query language for APIs where clients specify exactly what data they need. Instead of multiple REST endpoints, there is one /graphql endpoint. Clients send a query describing the shape of the response, solving over-fetching (too much data) and under-fetching (too many requests).',
      analogy: 'REST is like ordering from a fixed menu — you order dish 3 and get exactly what comes with it. GraphQL is like a custom order — "I want a burger, but no pickles, add bacon, and also a coffee, all in one trip to the kitchen".',
      diagram: `REST (multiple requests):      GraphQL (one request):
GET /users/1                   query {
GET /users/1/posts               user(id: "1") {
GET /users/1/followers             name
                                   posts { title }
3 HTTP requests                    followers { count }
Over-fetch on each               }
                               }
                               1 HTTP request, exact fields`,
      diagramSteps: JSON.stringify([
        { step: 1, title: 'Schema Definition', description: 'GraphQL defines a typed schema: types, queries, mutations, subscriptions. The schema is the contract between client and server.', diagram: 'type User { id: ID!, name: String!, posts: [Post!]! }' },
        { step: 2, title: 'Resolvers', description: 'Each field in the schema has a resolver function that fetches its data. Resolvers compose to build the response tree.', diagram: 'Query.user → resolver fetches from DB. User.posts → resolver queries posts by userId' },
        { step: 3, title: 'N+1 Problem', description: 'Fetching 10 users, each triggering a posts query = 11 DB queries. Solved with DataLoader — batches all posts queries into one.', diagram: 'Without DataLoader: 1+N queries. With DataLoader: 2 queries (batch)' },
        { step: 4, title: 'Mutations & Subscriptions', description: 'Mutations modify data. Subscriptions open a WebSocket connection for real-time updates when data changes.', diagram: 'mutation { createPost(title: "Hi") { id } } → creates post, returns id' }
      ]),
      tradeoffs: JSON.stringify([
        { title: 'GraphQL vs REST', optionA: 'GraphQL: no over/under-fetching, self-documenting schema, one endpoint', optionB: 'REST: simpler caching (GET is cacheable by URL), widely understood, no learning curve', recommendation: 'GraphQL for complex client data needs; REST for simple CRUD and public APIs', reasoning: 'GraphQL adds complexity but eliminates multiple round trips for data-rich UIs' }
      ]),
      whenToUse: JSON.stringify([
        { scenario: 'Mobile apps with bandwidth constraints', reason: 'Request only needed fields — no over-fetching, smaller payloads' },
        { scenario: 'Complex dashboards needing many related entities', reason: 'One request fetches user + posts + comments + reactions' },
        { scenario: 'Multiple client types (mobile, web, TV) with different needs', reason: 'Each client requests exactly the fields it needs from one endpoint' }
      ]),
      whenNotToUse: JSON.stringify([
        { scenario: 'Simple CRUD APIs with few data types', reason: 'GraphQL overhead not worth it for simple 3-endpoint APIs' },
        { scenario: 'Systems heavily reliant on HTTP caching', reason: 'All requests are POST to /graphql — standard HTTP cache by URL does not work' }
      ]),
      keyPoints: JSON.stringify([
        'Client specifies exact response shape — no over or under-fetching',
        'Schema is the type-safe contract between client and server',
        'Resolvers handle each field, composing to build the response',
        'N+1 problem is a common pitfall — solve with DataLoader batching',
        'Subscriptions enable real-time updates over WebSocket'
      ]),
      quiz: JSON.stringify([
        { id: 'gql1', type: 'multiple_choice', question: 'What problem does GraphQL solve that REST struggles with?', options: ['Authentication', 'Over-fetching and under-fetching', 'HTTP caching', 'Rate limiting'], correctAnswer: 1, explanation: 'GraphQL lets clients request exactly the fields they need, eliminating both over-fetching and the need for multiple requests.' },
        { id: 'gql2', type: 'multiple_choice', question: 'What is the N+1 problem in GraphQL?', options: ['Sending N+1 mutations in parallel', 'Fetching N items triggering N additional queries per item', 'Having N+1 resolvers for each type', 'Returning N+1 errors on bad queries'], correctAnswer: 1, explanation: 'For each parent item, a separate child query fires. DataLoader batches these into a single query.' },
        { id: 'gql3', type: 'fill_blank', question: 'GraphQL _____ enable real-time data updates by maintaining a persistent WebSocket connection.', correctAnswer: 'subscriptions', explanation: 'Subscriptions keep a WebSocket open and push updates to clients when data changes.' }
      ])
    },
    {
      title: 'gRPC & Protocol Buffers',
      slug: 'grpc-protocol-buffers',
      order: 3,
      summary: 'gRPC is a high-performance RPC framework using HTTP/2 and Protocol Buffers (binary serialization). It generates client and server code from .proto schema files, enforces type safety, and supports streaming. Primarily used for internal microservice communication.',
      analogy: "gRPC is like a direct phone call between two services that speak a private shorthand language. They agreed on the vocabulary (proto file) in advance. Messages are encoded in a tiny binary format instead of verbose JSON — much faster, like texting abbreviations vs writing essays.",
      diagram: `REST/JSON:                     gRPC/Protobuf:
POST /user/create              service UserService {
Content-Type: application/json   rpc CreateUser(UserRequest)
{                                  returns (UserResponse);
  "name": "Alice",              }
  "age": 30,
  "email": "a@b.com"            Binary wire format:
}                               [field_1=Alice, field_2=30]
~150 bytes JSON                 ~20 bytes proto = 7x smaller`,
      diagramSteps: JSON.stringify([
        { step: 1, title: 'Define .proto Schema', description: 'Write a .proto file defining messages and services. protoc compiler generates client and server stubs in any language.', diagram: 'message User { string name = 1; int32 age = 2; } → generates Go/Java/Python code' },
        { step: 2, title: 'Binary Serialization', description: 'Protobuf encodes fields by number (not name) in binary. 5-10x smaller than JSON, 2-3x faster to encode/decode.', diagram: 'JSON: {"name":"Alice"} = 15 bytes. Protobuf: field#1=Alice = 7 bytes' },
        { step: 3, title: 'HTTP/2 Multiplexing', description: 'HTTP/2 sends multiple requests over one TCP connection simultaneously. No head-of-line blocking. Better for microservice fanout.', diagram: 'HTTP/1.1: 5 services = 5 connections. HTTP/2: 5 services = 1 connection, multiplexed' },
        { step: 4, title: 'Streaming RPCs', description: 'gRPC supports client-streaming, server-streaming, and bidirectional streaming — not possible with REST.', diagram: 'Server stream: rpc GetLogs(Filter) returns (stream Log); → streams log lines as they arrive' }
      ]),
      tradeoffs: JSON.stringify([
        { title: 'gRPC vs REST', optionA: 'gRPC: faster, type-safe, streaming, auto-generated clients', optionB: 'REST: human-readable, browser-compatible, simpler debugging', recommendation: 'gRPC for internal microservice-to-microservice; REST for external/public APIs', reasoning: 'gRPC binary format and HTTP/2 win on performance; REST wins on accessibility and debugging' }
      ]),
      whenToUse: JSON.stringify([
        { scenario: 'Internal microservice communication with high throughput', reason: 'Binary protocol + HTTP/2 multiplexing reduces latency and bandwidth significantly' },
        { scenario: 'Polyglot microservices (Go, Python, Java)', reason: 'Proto files generate type-safe clients in any language automatically' },
        { scenario: 'Streaming data (real-time feeds, large file transfers)', reason: 'gRPC streaming RPCs handle server/client/bidirectional streams natively' }
      ]),
      whenNotToUse: JSON.stringify([
        { scenario: 'Public APIs consumed by browser JavaScript', reason: 'Browsers cannot use gRPC directly without grpc-web proxy layer' },
        { scenario: 'Simple APIs where schema tooling adds overhead', reason: 'REST is faster to prototype and iterate without code generation setup' }
      ]),
      keyPoints: JSON.stringify([
        'Protocol Buffers: binary serialization 5-10x smaller and faster than JSON',
        'HTTP/2 multiplexing: multiple streams over one connection, no head-of-line blocking',
        '.proto file is the schema contract — changes must be backward compatible',
        'Supports unary, server-streaming, client-streaming, and bidirectional streaming',
        'Use gRPC internally, REST/GraphQL externally'
      ]),
      quiz: JSON.stringify([
        { id: 'grpc1', type: 'multiple_choice', question: 'What serialization format does gRPC use instead of JSON?', options: ['XML', 'MessagePack', 'Protocol Buffers', 'CBOR'], correctAnswer: 2, explanation: 'Protocol Buffers (protobuf) is gRPC\'s binary serialization format — smaller and faster than JSON.' },
        { id: 'grpc2', type: 'multiple_choice', question: 'What HTTP version does gRPC use to enable request multiplexing?', options: ['HTTP/1.0', 'HTTP/1.1', 'HTTP/2', 'HTTP/3'], correctAnswer: 2, explanation: 'gRPC uses HTTP/2, which supports multiplexing multiple streams over a single TCP connection.' },
        { id: 'grpc3', type: 'fill_blank', question: 'gRPC generates client and server code from _____ files that define messages and services.', correctAnswer: '.proto', explanation: '.proto schema files define the service interface; protoc compiles them to language-specific code.' }
      ])
    },
    {
      title: 'WebSockets & Real-Time',
      slug: 'websockets-realtime',
      order: 4,
      summary: 'WebSockets provide a persistent, full-duplex connection between client and server. Unlike HTTP, either side can send a message at any time. Used for chat, live dashboards, collaborative editing, and gaming. SSE (Server-Sent Events) is a simpler one-way alternative for push-only scenarios.',
      analogy: "HTTP is like sending a letter and waiting for a response — one request, one reply, connection closed. WebSocket is like a phone call — once connected, both sides can talk freely at any time. SSE is like a radio broadcast — the server talks, clients listen.",
      diagram: `HTTP (polling):              WebSocket:
Client → GET /messages        Client ←→ ws://server/chat
Server → response []          (persistent connection)
Client → GET /messages         ↕ bidirectional
Server → response [new!]       ↕ low latency
...repeat every 1s...          ↕ any time either side
High overhead, latency         Low overhead, instant`,
      diagramSteps: JSON.stringify([
        { step: 1, title: 'WebSocket Handshake', description: 'Starts as HTTP request with Upgrade: websocket header. Server responds 101 Switching Protocols. TCP connection stays open.', diagram: 'GET / HTTP/1.1 Upgrade: websocket → 101 Switching Protocols → full duplex' },
        { step: 2, title: 'Bidirectional Messaging', description: 'Both client and server can send frames at any time. Frames are small (2-byte header for small messages vs full HTTP headers).', diagram: 'Client sends: {type: "chat", msg: "Hello"}. Server pushes: {type: "message", from: "Bob"}' },
        { step: 3, title: 'Scaling WebSockets', description: 'WebSocket connections are sticky — client must reconnect to same server. Use a message broker (Redis Pub/Sub) to fan out messages across servers.', diagram: 'Server1 gets message → publish to Redis → Server2 subscribers → push to their clients' },
        { step: 4, title: 'SSE vs WebSocket', description: 'SSE: HTTP/1.1 compatible, one-way server→client push, auto-reconnect. WebSocket: bidirectional, lower overhead for frequent bidirectional messages.', diagram: 'Use SSE for: live feeds, notifications. Use WS for: chat, games, collaboration' }
      ]),
      tradeoffs: JSON.stringify([
        { title: 'WebSocket vs SSE', optionA: 'WebSocket: bidirectional, lower overhead for high-frequency bidirectional messages', optionB: 'SSE: simpler, HTTP/2 compatible, auto-reconnect, server-push only', recommendation: 'SSE for push-only use cases; WebSocket for bidirectional real-time', reasoning: 'SSE is simpler and sufficient for most notification/feed use cases' },
        { title: 'WebSocket vs Long Polling', optionA: 'WebSocket: persistent connection, low latency, efficient', optionB: 'Long polling: works with standard HTTP infrastructure, no special handling', recommendation: 'WebSocket for true real-time; long polling only when WebSocket is blocked', reasoning: 'WebSocket uses dramatically less bandwidth and provides instant delivery' }
      ]),
      whenToUse: JSON.stringify([
        { scenario: 'Chat applications', reason: 'Messages must be delivered instantly to both parties without polling' },
        { scenario: 'Collaborative editing (Google Docs style)', reason: 'Changes must be broadcast to all connected clients in real-time' },
        { scenario: 'Live sports scores / financial tickers', reason: 'Data changes constantly; push is far more efficient than polling every second' }
      ]),
      whenNotToUse: JSON.stringify([
        { scenario: 'Standard CRUD operations', reason: 'Request-response HTTP is simpler and works fine without persistent connection' },
        { scenario: 'Infrequent updates (< 1 per minute)', reason: 'Polling or SSE is simpler; maintaining idle WebSocket connections wastes resources' }
      ]),
      keyPoints: JSON.stringify([
        'WebSocket: bidirectional, persistent, full-duplex over single TCP connection',
        'SSE: simpler server-to-client push over HTTP — sufficient for most real-time needs',
        'Scale WebSockets horizontally using Redis Pub/Sub to fan out across servers',
        'WebSocket connections are stateful — load balancer must use sticky sessions',
        'Heartbeat/ping-pong frames detect dead connections'
      ]),
      quiz: JSON.stringify([
        { id: 'ws1', type: 'multiple_choice', question: 'What HTTP upgrade mechanism initiates a WebSocket connection?', options: ['Upgrade: keep-alive', 'Upgrade: websocket', 'Transfer-Encoding: chunked', 'Connection: upgrade-ws'], correctAnswer: 1, explanation: 'The client sends an HTTP request with Upgrade: websocket; server responds 101 Switching Protocols.' },
        { id: 'ws2', type: 'multiple_choice', question: 'What is the main challenge in scaling WebSocket servers horizontally?', options: ['WebSockets use too much bandwidth', 'Connections are stateful and sticky to one server', 'WebSockets block threads', 'HTTP/2 does not support WebSockets'], correctAnswer: 1, explanation: 'Each WebSocket connection persists on a specific server, requiring Redis Pub/Sub to fan messages across all servers.' },
        { id: 'ws3', type: 'fill_blank', question: 'SSE (Server-Sent Events) is a simpler alternative to WebSocket for _____ push from server to client.', correctAnswer: 'one-way', explanation: 'SSE only supports server-to-client messages; for bidirectional communication, WebSocket is required.' }
      ])
    },
    {
      title: 'API Gateway',
      slug: 'api-gateway',
      order: 5,
      summary: 'An API Gateway is a reverse proxy that sits in front of your microservices. It handles cross-cutting concerns: authentication, rate limiting, SSL termination, request routing, logging, and protocol translation. Clients talk to one endpoint; the gateway routes to the right service.',
      analogy: "An API gateway is like a hotel concierge. Guests (clients) don't knock on the chef's door or call the housekeeper directly — they talk to the concierge who routes requests to the right department, verifies guest identity, and handles common services (translation, billing) centrally.",
      diagram: `Without Gateway:              With API Gateway:
                              ┌─────────────────────┐
Client → Auth Service         │    API GATEWAY      │
Client → User Service   →     │  Auth | Rate Limit  │
Client → Order Service        │  SSL  | Routing     │
Client → Product Service      └──────────┬──────────┘
(4 endpoints, auth per svc)              │
                                 ┌───────┼───────┐
                              UserSvc  OrderSvc  ProductSvc`,
      diagramSteps: JSON.stringify([
        { step: 1, title: 'Request Routing', description: 'Gateway maps paths to backend services. /api/users → UserService. /api/orders → OrderService. Services can change addresses without clients knowing.', diagram: 'GET /api/users → forward to user-service:8001. POST /api/orders → order-service:8002' },
        { step: 2, title: 'Auth & Rate Limiting', description: 'Validate JWT once at gateway, pass user ID downstream. Rate limit per API key at gateway — services trust gateway-verified requests.', diagram: 'Request → Gateway verifies JWT → strips auth header → adds X-User-Id: 123 → service' },
        { step: 3, title: 'SSL Termination', description: 'HTTPS terminates at gateway; internal services communicate over plain HTTP on private network. Simpler cert management.', diagram: 'Client → HTTPS → Gateway → HTTP → internal services (private network)' },
        { step: 4, title: 'Circuit Breaker at Gateway', description: 'If a backend service fails repeatedly, the gateway opens a circuit breaker and returns a cached/error response instead of hammering the failing service.', diagram: 'UserService → 5 failures → circuit opens → gateway returns 503 for 30s → retry' }
      ]),
      tradeoffs: JSON.stringify([
        { title: 'Managed Gateway (Kong/AWS API GW) vs Custom', optionA: 'Managed: fast to set up, many plugins, operational burden handled', optionB: 'Custom (Nginx/Traefik): full control, lower cost, no vendor lock-in', recommendation: 'Managed for most teams; custom when cost or specific features demand it', reasoning: 'Managed gateways save engineering time; custom is worth it at very large scale' }
      ]),
      whenToUse: JSON.stringify([
        { scenario: 'Microservices architecture with many backend services', reason: 'Single entry point simplifies client code and centralizes cross-cutting concerns' },
        { scenario: 'Multiple client types (mobile, web, third-party)', reason: 'Gateway can translate, aggregate, and tailor responses per client type' },
        { scenario: 'Enforcing rate limits and auth across all services', reason: 'Centralized enforcement prevents each service from reimplementing the same logic' }
      ]),
      whenNotToUse: JSON.stringify([
        { scenario: 'Simple monolithic application', reason: 'A gateway adds a network hop and operational complexity without benefit for a single service' },
        { scenario: 'Internal service-to-service communication', reason: 'Direct gRPC or service mesh is more appropriate between internal services' }
      ]),
      keyPoints: JSON.stringify([
        'Single entry point for all clients — abstracts backend topology',
        'Centralizes: auth, rate limiting, SSL termination, logging, routing',
        'Circuit breakers at gateway protect backend services from overload',
        'API gateways add a network hop — keep latency overhead < 10ms',
        'Examples: Kong, AWS API Gateway, Nginx, Traefik, Envoy'
      ]),
      quiz: JSON.stringify([
        { id: 'gw1', type: 'multiple_choice', question: 'What is SSL termination in the context of an API gateway?', options: ['Disabling SSL for internal traffic', 'HTTPS ends at the gateway; internal traffic uses HTTP', 'Encrypting requests before sending to services', 'Terminating idle SSL connections'], correctAnswer: 1, explanation: 'SSL terminates at the gateway; the gateway forwards plain HTTP to backend services on a private network.' },
        { id: 'gw2', type: 'multiple_choice', question: 'What is the main benefit of centralizing authentication at the API gateway?', options: ['Faster response times', 'Services do not need to implement auth independently', 'Eliminates need for HTTPS', 'Reduces number of microservices'], correctAnswer: 1, explanation: 'Centralized auth ensures every request is validated once, and services trust gateway-verified identities.' },
        { id: 'gw3', type: 'fill_blank', question: 'When a backend service repeatedly fails, the gateway opens a _____ breaker to stop forwarding requests to it temporarily.', correctAnswer: 'circuit', explanation: 'Circuit breakers prevent cascading failures by stopping traffic to unhealthy services during outages.' }
      ])
    },
    {
      title: 'Message Queues Deep Dive',
      slug: 'message-queues-deep-dive',
      order: 6,
      summary: 'Message queues decouple producers from consumers, enabling async processing and buffering traffic spikes. Core concepts: at-least-once vs exactly-once delivery, dead letter queues, consumer groups, and backpressure. Key systems: Kafka (event streaming), RabbitMQ (task queues), SQS (managed simple queues).',
      analogy: "A message queue is like a postal service between services. Service A drops letters in a mailbox (queue) and walks away — it doesn't wait for Service B to read them. Service B processes letters at its own pace. If B is overloaded, letters pile up safely in the mailbox.",
      diagram: `Without Queue (tight coupling):    With Queue:
                                   ┌──────────────────┐
OrderService → PaymentService      │  Message Queue   │
(what if payment is slow/down?)    └────────┬─────────┘
                                           ↑         ↓
                                    OrderService  PaymentService
                                    (produces)    (consumes async)`,
      diagramSteps: JSON.stringify([
        { step: 1, title: 'Producers & Consumers', description: 'Producers publish messages to a queue/topic. Consumers pull and process messages independently. Multiple consumers can process from the same queue (competing consumers).', diagram: 'Producer: publish(order_created). Consumer1,2,3: each processes different orders' },
        { step: 2, title: 'Delivery Guarantees', description: 'At-most-once: fast, may lose messages. At-least-once: may deliver duplicates — consumers must be idempotent. Exactly-once: expensive, requires transactions.', diagram: 'At-least-once: retry on failure → consumer may process same message twice → needs idempotency key' },
        { step: 3, title: 'Dead Letter Queue (DLQ)', description: 'Messages that fail processing N times are moved to DLQ instead of blocking the main queue. Allows investigation without losing messages.', diagram: 'Fail 3 times → move to DLQ. Ops team inspects DLQ, replays fixed messages.' },
        { step: 4, title: 'Kafka vs RabbitMQ', description: 'Kafka: distributed log, messages retained for days, replay, consumer groups. RabbitMQ: traditional queue, message routing, ACK-based deletion, simpler.', diagram: 'Kafka: 10M msg/s, replay, event sourcing. RabbitMQ: task queue, routing, priority queues' }
      ]),
      tradeoffs: JSON.stringify([
        { title: 'Kafka vs RabbitMQ vs SQS', optionA: 'Kafka: high throughput, replay, event sourcing, complex ops', optionB: 'RabbitMQ: flexible routing, lower throughput, simpler; SQS: fully managed, simple, AWS-native', recommendation: 'Kafka for event streaming at scale; SQS/RabbitMQ for task queues', reasoning: 'Kafka replay and consumer group semantics are uniquely powerful; SQS wins for simple managed queues' }
      ]),
      whenToUse: JSON.stringify([
        { scenario: 'Decoupling services that process at different rates', reason: 'Queue absorbs bursts — producer does not block waiting for slow consumer' },
        { scenario: 'Tasks that can be processed asynchronously', reason: 'Email sending, image resizing — user does not need to wait' },
        { scenario: 'Event sourcing and audit log', reason: 'Kafka retains all events, enabling replay, debugging, and multiple consumers reading same events' }
      ]),
      whenNotToUse: JSON.stringify([
        { scenario: 'Operations requiring immediate synchronous response', reason: 'Async queues add latency — use direct RPC if caller needs immediate result' },
        { scenario: 'Simple background jobs with few workers', reason: 'A simple task scheduler (cron + DB) is often simpler than a full queue system' }
      ]),
      keyPoints: JSON.stringify([
        'At-least-once delivery requires idempotent consumers',
        'Dead letter queues prevent failed messages from blocking processing',
        'Kafka retains messages and supports replay — ideal for event sourcing',
        'Consumer groups: each group reads all messages; within a group, each message goes to one consumer',
        'Backpressure: limit how fast producers publish when consumers fall behind'
      ]),
      quiz: JSON.stringify([
        { id: 'mq1', type: 'multiple_choice', question: 'What delivery guarantee means a message may be delivered more than once but never lost?', options: ['At-most-once', 'Exactly-once', 'At-least-once', 'Best-effort'], correctAnswer: 2, explanation: 'At-least-once delivery retries on failure, potentially causing duplicates — consumers must be idempotent.' },
        { id: 'mq2', type: 'multiple_choice', question: 'What is a Dead Letter Queue (DLQ)?', options: ['A queue that has been deleted', 'A queue for high-priority messages', 'A queue that receives messages that repeatedly fail processing', 'A backup queue for DR'], correctAnswer: 2, explanation: 'Messages that fail N times are moved to the DLQ for investigation without blocking the main queue.' },
        { id: 'mq3', type: 'fill_blank', question: 'In Kafka, a _____ group allows multiple consumers to share processing of topic partitions.', correctAnswer: 'consumer', explanation: 'Consumer groups enable parallel processing — each partition is consumed by exactly one member of the group.' }
      ])
    },
    {
      title: 'API Versioning & Deprecation',
      slug: 'api-versioning-deprecation',
      order: 7,
      summary: 'API versioning strategies let you evolve APIs without breaking existing clients. Three approaches: URL path versioning (/v1/, /v2/), header versioning, and additive-only changes (no versioning needed). Deprecation requires communication, sunset headers, migration guides, and runtime monitoring of old version usage.',
      analogy: "API versioning is like software releases. When you ship iPhone OS 2, you don't immediately break iPhone 1 — apps still work. But you communicate that support ends, give developers time to migrate, and eventually sunset the old API.",
      diagram: `URL Versioning:         Header Versioning:       Additive Changes:
/api/v1/users          GET /api/users           /api/users returns:
/api/v2/users          Accept-Version: 2        { id, name }  ← v1
                                                 + email field ← added, non-breaking
Both URLs live          Header selects           Old clients ignore email field
simultaneously          behavior`,
      diagramSteps: JSON.stringify([
        { step: 1, title: 'Additive-Only Changes (Non-Breaking)', description: 'Adding new optional fields, new endpoints, or new optional parameters are non-breaking. Old clients safely ignore unknown fields.', diagram: 'v1 response: {id,name}. v2 adds email field. Old clients ignore email — still works.' },
        { step: 2, title: 'Breaking Changes Require Versioning', description: 'Renaming fields, changing types, removing fields, changing auth — all break clients. Deploy new version in parallel, keep old running.', diagram: 'Rename "name" to "fullName" → all v1 clients break. Deploy /v2/users with new shape.' },
        { step: 3, title: 'Sunset Headers', description: 'HTTP Sunset header: "Sunset: Sat, 01 Jan 2026 00:00:00 GMT". Clients that read this header know when to migrate.', diagram: 'Response headers: Sunset: 2026-01-01, Deprecation: true, Link: <v2 docs>' },
        { step: 4, title: 'Monitor Old Version Usage', description: 'Before removing a version, check API logs for traffic. Never sunset while clients still actively use the version.', diagram: 'Metrics: v1 traffic 1000 req/day → communicate with clients → v1 traffic 0 → safe to remove' }
      ]),
      tradeoffs: JSON.stringify([
        { title: 'URL vs Header Versioning', optionA: 'URL: /v1/ — explicit, cacheable, easy to test, visible in browser', optionB: 'Header: Accept-Version — cleaner URLs, harder to test, less discoverable', recommendation: 'URL versioning for public APIs where discoverability matters', reasoning: 'Developers can spot /v1/ vs /v2/ immediately; header versioning is hidden' }
      ]),
      whenToUse: JSON.stringify([
        { scenario: 'Before any breaking API change', reason: 'Breaking changes must be versioned to avoid disrupting existing clients' },
        { scenario: 'Public or partner APIs with external consumers', reason: 'External clients cannot be force-updated — versioning gives them migration time' }
      ]),
      whenNotToUse: JSON.stringify([
        { scenario: 'Purely additive changes (new optional fields)', reason: 'Additive changes are non-breaking — no version bump required' },
        { scenario: 'Internal APIs within a team that deploys together', reason: 'If consumer and provider deploy as one unit, versioning adds unnecessary overhead' }
      ]),
      keyPoints: JSON.stringify([
        'Additive changes (new fields, new endpoints) are non-breaking — no version needed',
        'Breaking changes (rename/remove fields, change types) require a new version',
        'URL path versioning (/v1/) is most visible and developer-friendly',
        'Use Sunset response headers to communicate deprecation dates',
        'Monitor old version traffic before removing — never remove an active version'
      ]),
      quiz: JSON.stringify([
        { id: 'av1', type: 'multiple_choice', question: 'Which change is NON-breaking and does not require a new API version?', options: ['Renaming a required field', 'Removing an endpoint', 'Adding a new optional response field', 'Changing a string field to an integer'], correctAnswer: 2, explanation: 'Adding optional fields is additive — old clients ignore the new field and continue working.' },
        { id: 'av2', type: 'multiple_choice', question: 'What HTTP header communicates when a deprecated API version will be removed?', options: ['Deprecation-Date', 'X-Api-Retire', 'Sunset', 'Expires'], correctAnswer: 2, explanation: 'The RFC-defined Sunset header informs API clients of the scheduled removal date.' },
        { id: 'av3', type: 'fill_blank', question: 'The safest API evolution strategy is making only _____ changes that do not break existing clients.', correctAnswer: 'additive', explanation: 'Additive changes add new capabilities without modifying existing behavior that clients depend on.' }
      ])
    }
  ];

  for (const l of t4lessons) {
    await prisma.designLesson.upsert({
      where: { slug: l.slug },
      update: {},
      create: { ...l, trackId: track4.id }
    });
  }

  console.log('Tracks 3 (Data & Storage) and 4 (Communication & APIs) seeded.');
}
