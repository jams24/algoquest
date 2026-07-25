import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seedTracks1and2() {
  // ── TRACK 1: FOUNDATIONS ──────────────────────────────────────────────────
  const t1 = await prisma.designTrack.upsert({
    where: { slug: 'foundations' },
    update: {},
    create: {
      name: 'Foundations', slug: 'foundations',
      description: 'How the internet and modern software systems actually work — the essential building blocks every engineer must know.',
      icon: '🏗️', color: '#58CC02', order: 1, level: 'beginner'
    }
  });

  const foundationLessons = [
    {
      title: 'What is System Design?', slug: 'what-is-system-design', order: 1,
      summary: 'System design is the process of defining the architecture, components, data flows, and interfaces of a system to meet specified requirements. It bridges the gap between a problem statement and a working, scalable product. In interviews, you are expected to make architectural decisions under constraints — scale, latency, cost, and reliability.',
      analogy: 'Think of designing a city. Roads are your network, buildings are your servers, water pipes are your data flows, and zoning laws are your architecture decisions. A good city planner thinks about traffic, emergencies, and future growth — just like a system designer thinks about load, failures, and scale.',
      diagram: `
  ┌─────────┐    HTTP     ┌─────────────┐    Query    ┌──────────┐
  │  Client │ ──────────▶ │  Web Server │ ──────────▶ │ Database │
  │ Browser │ ◀────────── │  (API)      │ ◀────────── │          │
  └─────────┘   Response  └─────────────┘    Result   └──────────┘`,
      diagramSteps: [
        { step: 1, title: 'Client sends request', description: 'User opens a URL or taps a button. Browser/app sends an HTTP request.', diagram: '[ Client ] ──GET /feed──▶ [ ? ]' },
        { step: 2, title: 'Server receives and processes', description: 'Web server handles the request, runs business logic, decides what data to fetch.', diagram: '[ Client ] ──▶ [ Web Server ] ──▶ [ ? ]' },
        { step: 3, title: 'Database returns data', description: 'Server queries the database, gets results, formats a response.', diagram: '[ Client ] ──▶ [ Web Server ] ──▶ [ Database ]' },
        { step: 4, title: 'Response sent back', description: 'Server sends JSON/HTML back to client. Client renders it.', diagram: '[ Client ] ◀──JSON── [ Web Server ] ◀── [ Database ]' }
      ],
      tradeoffs: [
        { title: 'Simplicity vs Scalability', optionA: 'Monolith — one codebase, easy to build', optionB: 'Microservices — separate services, hard to coordinate', recommendation: 'Start monolith, extract services when you hit real bottlenecks', reasoning: 'Premature microservices add complexity before you know your bottlenecks' },
        { title: 'Speed vs Correctness', optionA: 'Eventual consistency — fast, available', optionB: 'Strong consistency — correct but slower', recommendation: 'Use eventual consistency for feeds/likes, strong for payments', reasoning: 'Match consistency level to business requirement, not personal preference' }
      ],
      whenToUse: [
        { scenario: 'Starting a new product', reason: 'Design upfront to avoid costly rewrites later' },
        { scenario: 'Hitting performance limits', reason: 'Identify bottlenecks before throwing hardware at the problem' }
      ],
      whenNotToUse: [
        { scenario: 'Building a prototype with 10 users', reason: 'Over-engineering early wastes time and money' }
      ],
      keyPoints: ['System design is about trade-offs, not right answers', 'Always clarify requirements and scale before diving in', 'Start simple, scale when you have real data', 'Every decision has a cost — make it explicit'],
      quiz: [
        { type: 'multiple_choice', question: 'What should you do FIRST in a system design interview?', options: ['Start drawing the architecture', 'Clarify requirements and scale', 'Choose the database', 'Design the API'], correct: 1, explanation: 'Requirements define everything else. Scale of 1K vs 1B users leads to completely different designs.' },
        { type: 'multiple_choice', question: 'Which approach is recommended when starting a new product?', options: ['Microservices from day one', 'Serverless only', 'Monolith first, extract services later', 'Always use distributed systems'], correct: 2, explanation: 'Start simple. Extract services only when you hit real bottlenecks you can measure.' },
        { type: 'multiple_choice', question: 'System design trade-offs are between:', options: ['Only speed and memory', 'Simplicity, scalability, consistency, cost, and reliability', 'Only SQL and NoSQL', 'Only front-end and back-end'], correct: 1, explanation: 'Every decision involves multiple dimensions. A good designer makes trade-offs explicit.' },
        { type: 'fill_blank', question: 'System design is about making ________, not finding perfect answers.', answer: 'trade-offs', explanation: 'There is no universally correct architecture. Context and constraints determine the right choice.' }
      ]
    },
    {
      title: 'Client-Server Model', slug: 'client-server-model', order: 2,
      summary: 'The client-server model is the foundational pattern of the internet. A client requests resources or services, and a server provides them. Every web app, mobile app, and API is built on this model. Understanding how requests travel, what protocols are used, and how servers handle concurrency is essential.',
      analogy: 'A restaurant: you (client) order food, the waiter (network) carries the order to the kitchen (server), and brings back your meal (response). The kitchen does not know who you are — it just fulfills orders. Multiple customers can order simultaneously because the kitchen has multiple chefs (threads/workers).',
      diagram: `
  ┌──────────────────────────────────────────────────────┐
  │                    CLIENTS                           │
  │  [Browser]  [Mobile App]  [CLI tool]  [Another API] │
  └──────────────────┬───────────────────────────────────┘
                     │  HTTP / WebSocket / gRPC
  ┌──────────────────▼───────────────────────────────────┐
  │                   SERVER                             │
  │   [Load Balancer] → [App Server 1] [App Server 2]   │
  │                         ↓                           │
  │              [Database] [Cache] [Queue]              │
  └──────────────────────────────────────────────────────┘`,
      diagramSteps: [
        { step: 1, title: 'Client initiates', description: 'Client opens a TCP connection to the server IP on port 80 (HTTP) or 443 (HTTPS).', diagram: '[Browser] ──TCP SYN──▶ [Server :443]' },
        { step: 2, title: 'TLS handshake (HTTPS)', description: 'Client and server negotiate encryption keys. All data from now on is encrypted.', diagram: '[Browser] ◀──TLS Hello──▶ [Server] → Encrypted tunnel' },
        { step: 3, title: 'HTTP request sent', description: 'Client sends GET/POST/PUT/DELETE with headers and optional body.', diagram: 'GET /api/posts HTTP/1.1\nHost: api.example.com\nAuthorization: Bearer token' },
        { step: 4, title: 'Server responds', description: 'Server processes request, queries DB if needed, returns status code + body.', diagram: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"posts": [...]}' }
      ],
      tradeoffs: [
        { title: 'Stateful vs Stateless servers', optionA: 'Stateful — server remembers client session', optionB: 'Stateless — server treats each request independently (JWT/tokens)', recommendation: 'Stateless is almost always better for scalability', reasoning: 'Stateless servers can be load-balanced freely. Stateful servers bind clients to specific instances.' },
        { title: 'Long polling vs WebSockets', optionA: 'HTTP long polling — client polls repeatedly, simpler', optionB: 'WebSockets — persistent bi-directional connection', recommendation: 'WebSockets for real-time (chat, live updates), polling for infrequent updates', reasoning: 'WebSockets have connection overhead. Only worth it when you need true real-time.' }
      ],
      whenToUse: [{ scenario: 'Any networked application', reason: 'Client-server is the default model for web and mobile apps' }],
      whenNotToUse: [{ scenario: 'Peer-to-peer file sharing', reason: 'P2P eliminates the server bottleneck for data transfer' }],
      keyPoints: ['HTTP is stateless — each request is independent', 'HTTPS encrypts all data in transit', 'Stateless servers scale horizontally; stateful servers do not', 'One server can handle many clients via async I/O or threads'],
      quiz: [
        { type: 'multiple_choice', question: 'Why are stateless servers preferred for scalability?', options: ['They use less memory', 'They can be load-balanced freely without session affinity', 'They are faster per request', 'They require no database'], correct: 1, explanation: 'Stateless servers treat every request independently, so any server can handle any request. Load balancers can distribute freely.' },
        { type: 'multiple_choice', question: 'Which protocol is best for a real-time chat application?', options: ['HTTP polling every 5 seconds', 'WebSockets', 'FTP', 'SMTP'], correct: 1, explanation: 'WebSockets maintain a persistent connection, enabling the server to push messages instantly without the client polling.' },
        { type: 'multiple_choice', question: 'What does HTTPS add over HTTP?', options: ['Faster speeds', 'Encryption of data in transit via TLS', 'Server-side caching', 'Compression only'], correct: 1, explanation: 'HTTPS = HTTP + TLS. All data is encrypted between client and server, preventing eavesdropping.' },
        { type: 'fill_blank', question: 'HTTP is a ________ protocol — each request is treated independently.', answer: 'stateless', explanation: 'The server has no memory of previous requests. Session state must be stored in tokens or server-side stores.' }
      ]
    },
    {
      title: 'Databases — SQL vs NoSQL', slug: 'sql-vs-nosql', order: 3,
      summary: 'Choosing the right database is one of the most critical system design decisions. SQL databases store data in structured tables with relationships and ACID transactions. NoSQL databases trade some of these guarantees for flexibility, scale, and speed. Neither is universally better — the choice depends on your data model and access patterns.',
      analogy: 'SQL is like a well-organized filing cabinet with labeled folders, dividers, and cross-references. Everything is indexed and findable. NoSQL is like a warehouse of labeled boxes — you can store anything in any box, and retrieval is fast if you know the box label, but complex cross-referencing is harder.',
      diagram: `
  SQL (Relational)                    NoSQL (Document)
  ┌────────────────────┐             ┌────────────────────────┐
  │  Users Table       │             │  users collection      │
  │  id │ name │ email │             │  {                     │
  │  1  │ Alice │ a@b  │             │    id: "u1",           │
  │  2  │  Bob  │ b@c  │             │    name: "Alice",      │
  └────────────────────┘             │    orders: [...],      │
  │  Orders Table      │             │    address: {...}      │
  │  id │userId│ item  │             │  }                     │
  │  1  │  1   │ Shoes │             └────────────────────────┘
  └────────────────────┘`,
      diagramSteps: [
        { step: 1, title: 'SQL stores normalized data', description: 'Data is split into tables. A user table and orders table are separate, linked by foreign key.', diagram: 'Users(id,name) → Orders(id, userId, item)' },
        { step: 2, title: 'SQL JOIN fetches related data', description: 'To get user + orders, you JOIN the tables at query time.', diagram: 'SELECT * FROM users JOIN orders ON users.id = orders.userId' },
        { step: 3, title: 'NoSQL denormalizes data', description: 'User and their orders live in one document. No joins needed — fetch is a single lookup.', diagram: '{ id, name, orders: [{item}, {item}] }' },
        { step: 4, title: 'Access pattern drives choice', description: 'If you always fetch user + orders together → NoSQL wins. If you need complex queries across many dimensions → SQL wins.', diagram: 'Access Pattern → DB Choice' }
      ],
      tradeoffs: [
        { title: 'SQL vs NoSQL', optionA: 'SQL — ACID, joins, complex queries, rigid schema', optionB: 'NoSQL — flexible schema, horizontal scale, fast lookups by key', recommendation: 'SQL for financial/relational data, NoSQL for user content/feeds/logs', reasoning: 'Match the data model to the query pattern. Most apps need both.' },
        { title: 'Consistency vs Availability', optionA: 'SQL — strong consistency, may sacrifice availability under partition', optionB: 'NoSQL (many) — eventual consistency, high availability', recommendation: 'Strong consistency for payments; eventual for social feeds', reasoning: 'CAP theorem: you cannot have all three simultaneously.' }
      ],
      whenToUse: [
        { scenario: 'SQL: financial transactions, user accounts, inventory', reason: 'ACID transactions prevent double-spending and data corruption' },
        { scenario: 'NoSQL: user posts, logs, product catalogs, real-time data', reason: 'Flexible schema handles varying structures, scales horizontally' }
      ],
      whenNotToUse: [
        { scenario: 'NoSQL for highly relational data with many joins', reason: 'Joins across collections are expensive in most NoSQL DBs' },
        { scenario: 'SQL for petabyte-scale analytics', reason: 'Row-based SQL struggles at massive scale; use columnar stores' }
      ],
      keyPoints: ['SQL = structured, ACID, relational. NoSQL = flexible, scalable, varied', 'Choose based on access patterns, not hype', 'Most production systems use both SQL and NoSQL for different data', 'Schema design is more important than DB choice'],
      quiz: [
        { type: 'multiple_choice', question: 'You are designing a payment system. Which database property is most critical?', options: ['Horizontal scalability', 'ACID transactions', 'Flexible schema', 'Low latency reads'], correct: 1, explanation: 'Payments require atomicity and consistency. ACID transactions ensure money is never created or lost.' },
        { type: 'multiple_choice', question: 'What drives the SQL vs NoSQL decision?', options: ['Company preference', 'Access patterns and data model', 'Programming language', 'Team size'], correct: 1, explanation: 'The shape of your data and how you query it determines the right store. No database is universally best.' },
        { type: 'multiple_choice', question: 'Which NoSQL type is best for storing a social media user profile with nested data?', options: ['Key-value store', 'Document store (MongoDB)', 'Graph database', 'Time-series database'], correct: 1, explanation: 'Document stores embed nested data naturally. A user profile with posts, friends, settings fits a document model.' },
        { type: 'fill_blank', question: 'SQL databases guarantee ________ — Atomicity, Consistency, Isolation, Durability.', answer: 'ACID', explanation: 'ACID properties ensure database transactions are processed reliably, critical for financial and medical systems.' }
      ]
    },
    {
      title: 'Caching', slug: 'caching-basics', order: 4,
      summary: 'Caching stores frequently accessed data in a fast-access layer (usually memory) so future requests can be served without hitting the database or recomputing results. It is one of the highest-impact performance optimizations in system design — reducing latency from hundreds of milliseconds to under a millisecond.',
      analogy: 'Your brain caches frequently used information. You do not look up your phone number every time — you remember it. Similarly, a cache remembers recent database results so the system does not recompute them each time.',
      diagram: `
  Without cache:          With cache:
  [Client]                [Client]
     ↓                       ↓
  [Server]               [Server]
     ↓ every time            ↓ cache miss only
  [Database]             [Cache (Redis)]
  ~100ms latency             ↓ cache hit
                         < 1ms latency
                         [Database] (only on miss)`,
      diagramSteps: [
        { step: 1, title: 'Cache miss — first request', description: 'Data is not in cache. Server fetches from DB, stores result in cache, returns to client.', diagram: 'Client → Server → DB → Cache.set(key, value) → Client' },
        { step: 2, title: 'Cache hit — subsequent requests', description: 'Data is in cache. Server returns instantly without touching DB.', diagram: 'Client → Server → Cache.get(key) → Client (< 1ms)' },
        { step: 3, title: 'Cache invalidation', description: 'When data changes in DB, cache must be updated or deleted to prevent stale reads.', diagram: 'DB updated → Cache.delete(key) or Cache.set(key, newValue)' }
      ],
      tradeoffs: [
        { title: 'Write-through vs Cache-aside', optionA: 'Write-through — write to cache and DB simultaneously. Always consistent.', optionB: 'Cache-aside (lazy) — read from cache, fetch from DB on miss. Cache populated on demand.', recommendation: 'Cache-aside for read-heavy workloads, write-through when consistency matters', reasoning: 'Write-through adds latency to every write. Cache-aside wastes first request but is simpler.' },
        { title: 'TTL (expiry) vs explicit invalidation', optionA: 'TTL — cache entry expires after N seconds. Simple.', optionB: 'Explicit invalidation — delete cache entry when data changes. Always fresh.', recommendation: 'TTL for data that can be slightly stale (feeds), explicit for critical data (user balance)', reasoning: 'TTL is simpler but stale windows exist. Explicit invalidation is complex but precise.' }
      ],
      whenToUse: [
        { scenario: 'Frequently read, rarely written data', reason: 'High cache hit rate means DB gets few requests' },
        { scenario: 'Expensive computations (recommendations, aggregations)', reason: 'Cache the result, not the raw data' }
      ],
      whenNotToUse: [
        { scenario: 'Highly unique queries that never repeat', reason: 'Cache hit rate is zero — cache adds overhead with no benefit' },
        { scenario: 'Data that must always be current (stock prices, seat availability)', reason: 'Stale cache data causes real business problems' }
      ],
      keyPoints: ['Cache hit rate > 90% is the target for effective caching', 'Cache invalidation is one of the hardest problems in CS', 'Redis and Memcached are the two dominant in-memory caches', 'Cache at multiple layers: CDN, server memory, shared cache'],
      quiz: [
        { type: 'multiple_choice', question: 'A cache miss occurs when:', options: ['The cache server crashes', 'Requested data is not in the cache', 'The database is slow', 'Too many users request data simultaneously'], correct: 1, explanation: 'A cache miss means the data was not found in cache. The system falls back to the database and populates the cache.' },
        { type: 'multiple_choice', question: 'Which cache strategy is best for a social media feed that can tolerate 30-second stale data?', options: ['Write-through with immediate invalidation', 'Cache-aside with a 30-second TTL', 'No cache — always hit DB', 'Write-back only'], correct: 1, explanation: 'TTL of 30s matches the acceptable staleness. Cache-aside populates on demand, reducing DB load.' },
        { type: 'multiple_choice', question: 'Why is cache invalidation considered hard?', options: ['Caches are slow to update', 'Knowing WHEN data has changed and updating all cache copies consistently is complex', 'Redis is difficult to configure', 'Invalidation requires downtime'], correct: 1, explanation: 'Distributed systems have multiple cache nodes. Knowing what changed, when, and ensuring all copies are updated is fundamentally hard.' },
        { type: 'fill_blank', question: 'Redis stores data in ________ for sub-millisecond access.', answer: 'memory', explanation: 'In-memory storage eliminates disk I/O. This is why Redis reads are 100-1000x faster than database reads.' }
      ]
    },
    {
      title: 'CDN & DNS', slug: 'cdn-and-dns', order: 5,
      summary: 'DNS (Domain Name System) translates human-readable domain names into IP addresses. CDN (Content Delivery Network) distributes static content to servers worldwide so users get it from the nearest location. Together, DNS and CDNs reduce latency for billions of users globally.',
      analogy: 'DNS is like a phone book — you look up "google.com" and get the phone number (IP address) to call. CDN is like having a McDonald\'s in every city — instead of flying to headquarters for your burger, you get it from the nearest location.',
      diagram: `
  User in Tokyo requests google.com

  1. DNS Lookup:
     Tokyo User → DNS Resolver → Root DNS → .com DNS → google.com DNS
     ← ← ← ← ← ← ← ← ← IP: 142.250.x.x (Tokyo edge node)

  2. CDN Delivery:
     Tokyo User → CDN Edge (Tokyo) → [Cache Hit] → File served
                                    → [Cache Miss] → Origin Server → CDN Edge → User`,
      diagramSteps: [
        { step: 1, title: 'DNS resolution', description: 'Browser checks local cache, then OS cache, then queries DNS resolver chain until it gets an IP.', diagram: 'Browser → OS Cache → ISP Resolver → Root → .com → google.com NS' },
        { step: 2, title: 'CDN routing', description: 'DNS returns the IP of the nearest CDN edge node, not the origin server.', diagram: 'DNS returns IP of Tokyo CDN edge, not US origin' },
        { step: 3, title: 'Edge cache hit', description: 'CDN edge has the asset cached from a previous request. Served instantly.', diagram: 'Tokyo Edge: logo.png cached → User (5ms latency)' },
        { step: 4, title: 'Cache miss + origin fetch', description: 'Asset not cached at edge. Edge fetches from origin, caches it, serves user.', diagram: 'Tokyo Edge → Origin (US) → file → Edge caches → User' }
      ],
      tradeoffs: [
        { title: 'CDN vs No CDN', optionA: 'CDN — global distribution, low latency, higher cost', optionB: 'No CDN — single origin, simple, higher latency for distant users', recommendation: 'Use CDN for any public-facing app with global users', reasoning: 'Without CDN, a Tokyo user hitting a US server adds 150ms+ RTT. CDN cuts this to < 10ms.' }
      ],
      whenToUse: [
        { scenario: 'Static assets — images, JS, CSS, videos', reason: 'These never change per-user, perfect for caching at edge' },
        { scenario: 'Global user base', reason: 'CDN nodes worldwide reduce geographic latency' }
      ],
      whenNotToUse: [
        { scenario: 'Highly personalized dynamic content', reason: 'Each response is unique per user — cache hit rate is near zero' }
      ],
      keyPoints: ['DNS TTL controls how long clients cache DNS results', 'CDNs cache static assets at globally distributed edge nodes', 'CDNs also provide DDoS protection and SSL termination', 'Dynamic content can use CDN edge computing (Cloudflare Workers)'],
      quiz: [
        { type: 'multiple_choice', question: 'What does DNS resolve?', options: ['IP addresses to domain names', 'Domain names to IP addresses', 'URLs to HTML pages', 'Ports to services'], correct: 1, explanation: 'DNS is a lookup system. You provide a domain name (google.com) and get back an IP address (142.250.x.x).' },
        { type: 'multiple_choice', question: 'Why do CDNs dramatically reduce latency?', options: ['They compress files better', 'They serve content from a server geographically close to the user', 'They use faster programming languages', 'They bypass DNS'], correct: 1, explanation: 'Physics limits data travel speed. A CDN edge 10km away serves content 100x faster than a server 10,000km away.' },
        { type: 'fill_blank', question: 'CDN stands for Content ________ Network.', answer: 'Delivery', explanation: 'A CDN delivers content (images, videos, JS) from distributed edge servers to minimize latency for global users.' }
      ]
    },
    {
      title: 'APIs — REST, GraphQL & gRPC', slug: 'apis-rest-graphql-grpc', order: 6,
      summary: 'APIs (Application Programming Interfaces) define how services communicate. REST uses HTTP verbs and resources. GraphQL lets clients request exactly the data they need. gRPC uses Protocol Buffers for efficient binary communication between services. Choosing the right API style depends on your use case.',
      analogy: 'REST is like a restaurant menu — fixed dishes, you order what exists. GraphQL is like a buffet — you pick exactly what you want from available ingredients. gRPC is like a direct line to the chef — efficient, fast, and uses a specific language only both parties understand.',
      diagram: `
  REST:                    GraphQL:                 gRPC:
  GET /users/1             query {                  service UserService {
  GET /users/1/posts         user(id: 1) {            rpc GetUser(UserReq)
  GET /users/1/friends         name                     returns (User);
  → 3 round trips              posts { title }        }
                               friends { name }       → Binary, typed,
                           }                            1 round trip
                           → 1 round trip`,
      diagramSteps: [
        { step: 1, title: 'REST — resource-based', description: 'Each URL represents a resource. HTTP verbs (GET/POST/PUT/DELETE) define the operation.', diagram: 'GET /posts/123 → { id, title, body }\nDELETE /posts/123 → 204 No Content' },
        { step: 2, title: 'GraphQL — query-based', description: 'Client sends a query describing exactly what data it needs. Server returns exactly that.', diagram: 'query { post(id: 123) { title author { name } } }' },
        { step: 3, title: 'gRPC — contract-based', description: 'Both sides agree on a .proto schema. Messages are serialized to binary. Much faster than JSON.', diagram: 'message GetPostRequest { string id = 1; }\nrpc GetPost(GetPostRequest) returns (Post);' }
      ],
      tradeoffs: [
        { title: 'REST vs GraphQL', optionA: 'REST — simple, cacheable, widely understood, over-fetches data', optionB: 'GraphQL — flexible, no over-fetching, harder to cache, complex', recommendation: 'REST for public APIs, GraphQL for complex client-driven frontends', reasoning: 'GraphQL shines when multiple clients (web/mobile) need different data shapes.' },
        { title: 'REST vs gRPC', optionA: 'REST — human-readable JSON, easy to debug, slower', optionB: 'gRPC — binary, typed, 5-10x faster, harder to debug', recommendation: 'gRPC for internal microservice communication, REST for public APIs', reasoning: 'gRPC efficiency matters internally at scale. Public APIs need human readability.' }
      ],
      whenToUse: [
        { scenario: 'REST: public APIs, simple CRUD operations', reason: 'Universal support, easy to document, cacheable' },
        { scenario: 'GraphQL: mobile apps, dashboards needing flexible data', reason: 'Reduces over-fetching, single endpoint, self-documenting' },
        { scenario: 'gRPC: internal microservice RPC calls', reason: '5-10x faster than REST with binary Protocol Buffers' }
      ],
      whenNotToUse: [
        { scenario: 'gRPC for browser-to-server communication', reason: 'Browsers do not natively support HTTP/2 gRPC without a proxy' }
      ],
      keyPoints: ['REST is stateless — each request carries all needed context', 'GraphQL solves over-fetching and under-fetching problems', 'gRPC uses HTTP/2 and binary serialization for speed', 'API design is a contract — versioning and backwards compatibility matter'],
      quiz: [
        { type: 'multiple_choice', question: 'A mobile app and web app need different fields from the same endpoint. Which API style handles this best?', options: ['REST with multiple endpoints', 'GraphQL', 'gRPC', 'WebSockets'], correct: 1, explanation: 'GraphQL lets each client request exactly the fields it needs from a single endpoint, eliminating over and under-fetching.' },
        { type: 'multiple_choice', question: 'Why is gRPC preferred for internal microservice communication?', options: ['It uses JSON which is faster', 'Binary Protocol Buffers are 5-10x more efficient than JSON', 'It has better error messages', 'It works in browsers natively'], correct: 1, explanation: 'Protocol Buffers serialize to binary, which is much smaller and faster to parse than text-based JSON.' },
        { type: 'fill_blank', question: 'REST APIs use HTTP ________ like GET, POST, PUT, DELETE to indicate operations.', answer: 'verbs', explanation: 'REST maps CRUD operations to HTTP verbs: Create=POST, Read=GET, Update=PUT/PATCH, Delete=DELETE.' }
      ]
    },
    {
      title: 'Latency & Throughput', slug: 'latency-and-throughput', order: 7,
      summary: 'Latency is the time from request to response. Throughput is how many requests a system can handle per unit of time. Understanding these metrics — and the numbers that matter — is essential for making informed system design decisions and back-of-envelope estimations.',
      analogy: 'Latency is how long it takes one car to travel from city A to city B. Throughput is how many cars can travel that route per hour. A wide highway (high throughput) does not necessarily mean fast travel (low latency) if there are traffic jams.',
      diagram: `
  Latency Numbers Every Engineer Should Know:
  ┌────────────────────────────────────────────┐
  │ L1 cache reference          ~0.5 ns        │
  │ L2 cache reference          ~7 ns           │
  │ RAM reference               ~100 ns         │
  │ SSD read                    ~100 μs         │
  │ HDD read                    ~10 ms          │
  │ Network: same datacenter    ~0.5 ms         │
  │ Network: cross-continent    ~150 ms         │
  │ Network: around the world   ~300 ms         │
  └────────────────────────────────────────────┘`,
      diagramSteps: [
        { step: 1, title: 'Latency tiers', description: 'Memory is 1000x faster than SSD. SSD is 100x faster than HDD. Network adds unpredictable delay.', diagram: 'RAM (ns) → SSD (μs) → HDD (ms) → Network (ms-s)' },
        { step: 2, title: 'Throughput measurement', description: 'Measured in RPS (requests per second) or QPS (queries per second). Throughput × latency = in-flight requests (Little\'s Law).', diagram: '1000 RPS × 100ms latency = 100 concurrent requests in-flight' },
        { step: 3, title: 'Bottleneck identification', description: 'The slowest component determines system throughput. Fix the bottleneck, not the fast parts.', diagram: '[Fast API] → [Slow DB 50 QPS] ← bottleneck\nSolution: cache, read replicas, index' }
      ],
      tradeoffs: [
        { title: 'Latency vs Throughput', optionA: 'Optimize for latency — process one request as fast as possible', optionB: 'Optimize for throughput — process as many requests as possible', recommendation: 'User-facing requests need low latency. Batch jobs need high throughput.', reasoning: 'A user waiting 2 seconds churns. A nightly batch job can take hours as long as it finishes by morning.' }
      ],
      whenToUse: [
        { scenario: 'Latency optimization: user-facing APIs, gaming, trading', reason: 'Users perceive > 100ms as slow' },
        { scenario: 'Throughput optimization: data pipelines, batch jobs, analytics', reason: 'Total work done per hour matters more than any single request' }
      ],
      whenNotToUse: [{ scenario: 'Optimizing before measuring', reason: 'Profile first. Optimize the actual bottleneck, not what you guess it is.' }],
      keyPoints: ['p99 latency matters — the 99th percentile, not average', 'Memory access is ~1,000,000x faster than disk', 'Network round-trip same datacenter ~0.5ms, cross-continent ~150ms', 'Amdahl\'s Law: overall speedup limited by the sequential portion'],
      quiz: [
        { type: 'multiple_choice', question: 'A database query takes 100ms on average but 2000ms at p99. What does p99 mean?', options: ['99% of queries fail', '99% of queries complete in 2000ms or less', '1% of queries complete faster than 2000ms', 'Average across 99 samples'], correct: 1, explanation: 'p99 = 99th percentile. 99% of requests complete within that time. The remaining 1% are slower. p99 matters for user experience.' },
        { type: 'multiple_choice', question: 'Which is fastest?', options: ['Reading from HDD', 'Reading from SSD', 'Reading from RAM', 'Reading from network cache'], correct: 2, explanation: 'RAM access is ~100ns. SSD is ~100μs (1000x slower). HDD is ~10ms (100,000x slower than RAM).' },
        { type: 'fill_blank', question: 'The slowest component in a chain determines the system\'s overall ________.', answer: 'throughput', explanation: 'This is the bottleneck principle. A 10-lane highway feeding into a 1-lane bridge is still limited to 1 lane.' }
      ]
    },
    {
      title: 'Security Basics', slug: 'security-basics', order: 8,
      summary: 'Every system must be designed with security from the start. Key concepts: authentication (who are you?), authorization (what can you do?), encryption (protecting data), and rate limiting (preventing abuse). Security is not an add-on — it is a core system design requirement.',
      analogy: 'A secure building has a reception desk (authentication), keycards for different floors (authorization), sealed envelopes for sensitive documents (encryption), and a limit on how many visitors can enter per hour (rate limiting).',
      diagram: `
  Request Flow with Security Layers:

  [Client]
     ↓ HTTPS (encrypted)
  [CDN/WAF] ← blocks DDoS, SQL injection
     ↓
  [API Gateway] ← rate limiting (100 req/min per user)
     ↓
  [Auth Middleware] ← validates JWT token
     ↓
  [Authorization] ← checks user has permission for this resource
     ↓
  [Business Logic] ← sanitizes inputs
     ↓
  [Database] ← encrypted at rest`,
      diagramSteps: [
        { step: 1, title: 'Authentication — verify identity', description: 'User proves who they are via password, OAuth token, or biometric. Server issues a JWT or session token.', diagram: 'POST /login { email, password } → JWT token (valid 7 days)' },
        { step: 2, title: 'Authorization — verify permission', description: 'Token is valid, but can this user access THIS resource? Role-based or attribute-based checks.', diagram: 'User role: "viewer" → can GET /posts, cannot DELETE /posts' },
        { step: 3, title: 'Encryption — protect data', description: 'Data encrypted in transit (TLS) and at rest (AES-256). Passwords hashed with bcrypt, never stored plain.', diagram: 'Password → bcrypt(password, salt) → hash stored in DB' },
        { step: 4, title: 'Rate limiting — prevent abuse', description: 'Limit requests per user/IP to prevent brute force and DDoS.', diagram: '> 100 req/min → HTTP 429 Too Many Requests' }
      ],
      tradeoffs: [
        { title: 'JWT vs Sessions', optionA: 'JWT — stateless, scalable, hard to revoke before expiry', optionB: 'Server sessions — easy to revoke, requires shared session store', recommendation: 'JWT for stateless APIs, sessions for web apps needing instant logout', reasoning: 'JWT scales well but a compromised token is valid until expiry. Sessions can be deleted server-side.' }
      ],
      whenToUse: [
        { scenario: 'Every production system', reason: 'Security is not optional' }
      ],
      whenNotToUse: [{ scenario: 'Over-engineering security for internal tools', reason: 'Match security to threat model. Internal-only tools need less than public APIs.' }],
      keyPoints: ['Never store passwords in plain text — always hash with bcrypt/argon2', 'HTTPS everywhere — no exceptions', 'Principle of least privilege — grant minimum permissions needed', 'Rate limit all public endpoints to prevent abuse'],
      quiz: [
        { type: 'multiple_choice', question: 'What is the difference between authentication and authorization?', options: ['They are the same thing', 'Authentication = who you are; Authorization = what you can do', 'Authentication = what you can do; Authorization = who you are', 'Authorization comes before authentication'], correct: 1, explanation: 'AuthN verifies identity (login). AuthZ checks permissions (can this user delete this post?).' },
        { type: 'multiple_choice', question: 'A user logs out. With JWT, what happens to their token?', options: ['It is immediately invalidated', 'It remains valid until it expires', 'It is moved to a blocklist automatically', 'The server deletes it'], correct: 1, explanation: 'JWTs are stateless. The server has no record of issued tokens. The token is valid until TTL expires — unless you implement a token blocklist.' },
        { type: 'fill_blank', question: 'Passwords should always be stored as a ________, never in plain text.', answer: 'hash', explanation: 'Bcrypt/argon2 create a one-way hash. Even if the database is breached, attackers cannot reverse the hash to get passwords.' }
      ]
    },
    {
      title: 'How a Request Travels the Internet', slug: 'request-internet-journey', order: 9,
      summary: 'Tracing exactly what happens when you type a URL and press Enter is one of the most common and revealing system design and interview questions. It covers DNS, TCP, TLS, HTTP, load balancing, application servers, databases, and the response journey back — all in one mental model.',
      analogy: 'Sending a request is like mailing a certified letter internationally. Your post office (ISP) routes it to the right country, customs (firewall/CDN) checks it, the recipient\'s building reception (load balancer) directs it to the right office (app server), which looks up your file (database) and mails a response back.',
      diagram: `
  You type: https://twitter.com/home

  1. DNS: twitter.com → 104.244.42.1 (nearest CDN/server)
  2. TCP: 3-way handshake with that IP
  3. TLS: negotiate encryption keys
  4. HTTP GET /home with Authorization header
  5. CDN edge: serves static assets (JS, CSS, images)
  6. Origin: Load balancer → App server
  7. App server: Auth check → DB queries → Cache reads
  8. Response: JSON assembled → compressed → sent back
  9. Browser: parses HTML/JSON, renders page`,
      diagramSteps: [
        { step: 1, title: 'DNS resolution (~1-50ms)', description: 'OS checks hosts file, browser cache, OS cache, then queries DNS resolver recursively.', diagram: 'twitter.com → 104.244.42.1' },
        { step: 2, title: 'TCP handshake (~1 RTT)', description: 'SYN → SYN-ACK → ACK. Connection established. With HTTP/2 this is reused.', diagram: 'Client SYN → Server SYN-ACK → Client ACK → Connected' },
        { step: 3, title: 'TLS handshake (~1-2 RTT)', description: 'Negotiate cipher suite, exchange certificates, agree on session key.', diagram: 'ClientHello → ServerHello + Cert → KeyExchange → Finished' },
        { step: 4, title: 'HTTP request & response', description: 'GET /home sent. Server processes, queries DB/cache, returns JSON in < 200ms.', diagram: 'GET /home → [LB] → [App] → [Cache/DB] → 200 OK + JSON' }
      ],
      tradeoffs: [
        { title: 'HTTP/1.1 vs HTTP/2 vs HTTP/3', optionA: 'HTTP/1.1 — one request per connection, head-of-line blocking', optionB: 'HTTP/2 — multiplexed streams, header compression, server push', recommendation: 'HTTP/2 for all modern web traffic; HTTP/3 (QUIC) for mobile/lossy networks', reasoning: 'HTTP/2 eliminates head-of-line blocking. HTTP/3 eliminates TCP retransmission delays on poor connections.' }
      ],
      whenToUse: [{ scenario: 'Understanding this flow is useful for', reason: 'Every system design interview — it touches DNS, CDN, LB, caching, DB, APIs' }],
      whenNotToUse: [{ scenario: 'This is foundational knowledge', reason: 'Always relevant — you cannot design systems without understanding request flow' }],
      keyPoints: ['DNS + TCP + TLS adds 100-300ms before any application logic', 'HTTP/2 multiplexing drastically reduces connection overhead', 'CDN edge handles static assets before reaching origin servers', 'Load balancers distribute traffic and provide failover'],
      quiz: [
        { type: 'multiple_choice', question: 'What happens immediately after DNS resolution?', options: ['HTTP request is sent', 'TCP handshake is established', 'TLS certificate is checked', 'The CDN is queried'], correct: 1, explanation: 'DNS gives you the IP. Then TCP establishes the reliable connection (SYN/SYN-ACK/ACK) before any HTTP data flows.' },
        { type: 'multiple_choice', question: 'What is the advantage of HTTP/2 over HTTP/1.1?', options: ['Uses less bandwidth', 'Supports multiplexing — multiple requests on one connection', 'Is more secure', 'Requires no DNS'], correct: 1, explanation: 'HTTP/2 streams multiple requests/responses simultaneously on a single TCP connection, eliminating head-of-line blocking.' },
        { type: 'fill_blank', question: 'Before HTTP data flows, a ________ handshake establishes an encrypted connection.', answer: 'TLS', explanation: 'TLS (Transport Layer Security) negotiates encryption between client and server. Without it, all data would be visible in plaintext.' }
      ]
    }
  ];

  for (const lesson of foundationLessons) {
    await prisma.designLesson.upsert({
      where: { slug: lesson.slug },
      update: {},
      create: {
        ...lesson,
        trackId: t1.id,
        diagramSteps: JSON.stringify(lesson.diagramSteps),
        tradeoffs: JSON.stringify(lesson.tradeoffs),
        whenToUse: JSON.stringify(lesson.whenToUse),
        whenNotToUse: JSON.stringify(lesson.whenNotToUse),
        keyPoints: JSON.stringify(lesson.keyPoints),
        quiz: JSON.stringify(lesson.quiz)
      }
    });
  }
  console.log('✅ Track 1: Foundations seeded');

  // ── TRACK 2: SCALABILITY & PERFORMANCE ───────────────────────────────────
  const t2 = await prisma.designTrack.upsert({
    where: { slug: 'scalability-performance' },
    update: {},
    create: {
      name: 'Scalability & Performance', slug: 'scalability-performance',
      description: 'How to design systems that handle millions of users — load balancing, caching strategies, database scaling, and rate limiting.',
      icon: '📈', color: '#1CB0F6', order: 2, level: 'intermediate'
    }
  });

  const scalabilityLessons = [
    {
      title: 'Horizontal vs Vertical Scaling', slug: 'horizontal-vs-vertical-scaling', order: 1,
      summary: 'When a system needs to handle more traffic, you have two options: vertical scaling (bigger machine) or horizontal scaling (more machines). Vertical scaling is simple but has a ceiling. Horizontal scaling is complex but virtually unlimited. Modern systems almost always use horizontal scaling for stateless layers.',
      analogy: 'Vertical scaling is like buying a bigger truck to carry more cargo. Horizontal scaling is like hiring more truck drivers with normal trucks. One truck can only get so big — but you can hire thousands of drivers.',
      diagram: `
  Vertical Scaling:           Horizontal Scaling:

  [Server 8 CPU]              [Server 2CPU] [Server 2CPU]
       ↓                      [Server 2CPU] [Server 2CPU]
  [Server 32 CPU]                    ↕
       ↓ (limit)              [Load Balancer]
  [Server 128 CPU] ← ceiling         ↕
                              [add more servers freely]`,
      diagramSteps: [
        { step: 1, title: 'Vertical — upgrade the machine', description: 'Add more CPU, RAM, faster SSD to existing server. Works until you hit hardware limits or cost is too high.', diagram: '4 CPU → 8 CPU → 32 CPU → $$$$ ceiling' },
        { step: 2, title: 'Horizontal — add more machines', description: 'Add identical servers behind a load balancer. Each handles a slice of traffic.', diagram: '[LB] → [Server1] [Server2] [Server3] ... [ServerN]' },
        { step: 3, title: 'Stateless requirement', description: 'Horizontal scaling requires stateless servers. Session data must be in a shared store (Redis), not local memory.', diagram: '[Server1] [Server2] both read/write to [Redis sessions]' }
      ],
      tradeoffs: [
        { title: 'Vertical vs Horizontal', optionA: 'Vertical — simple, no code changes, expensive, hard ceiling', optionB: 'Horizontal — complex (distributed), cheap commodity hardware, unlimited scale', recommendation: 'Vertical first to avoid premature complexity, horizontal when you hit limits', reasoning: 'Horizontal scaling requires stateless design, service discovery, and distributed systems knowledge. Only add this complexity when needed.' }
      ],
      whenToUse: [
        { scenario: 'Vertical: databases, stateful services, quick wins', reason: 'Databases are hard to scale horizontally — vertical is simpler' },
        { scenario: 'Horizontal: web servers, API servers, stateless workers', reason: 'Stateless services scale horizontally with zero coordination' }
      ],
      whenNotToUse: [{ scenario: 'Horizontal scaling for stateful services without shared state store', reason: 'Users will get inconsistent data if session is on one server and they hit another' }],
      keyPoints: ['Stateless servers are a prerequisite for horizontal scaling', 'Databases scale vertically first, then use read replicas or sharding', 'Cloud auto-scaling groups handle horizontal scaling automatically', 'Design for horizontal from day one by keeping servers stateless'],
      quiz: [
        { type: 'multiple_choice', question: 'Why do stateless servers scale horizontally better than stateful ones?', options: ['They use less memory', 'Any server can handle any request — no session affinity needed', 'They are faster per request', 'They require no load balancer'], correct: 1, explanation: 'Stateless servers store no user state locally. Any server in the pool handles any request identically.' },
        { type: 'multiple_choice', question: 'What is the ceiling problem with vertical scaling?', options: ['Vertical scaling is always more expensive', 'Hardware has physical limits — you cannot add infinite CPU/RAM to one machine', 'Vertical scaling causes more downtime', 'Vertical scaling requires code changes'], correct: 1, explanation: 'The largest server AWS offers has 448 vCPUs and 24TB RAM. Beyond that, you must scale out horizontally.' },
        { type: 'fill_blank', question: 'Horizontal scaling requires servers to be ________ — storing no local user state.', answer: 'stateless', explanation: 'If Server A holds your session and the load balancer sends your next request to Server B, Server B would not know who you are without a shared session store.' }
      ]
    },
    {
      title: 'Load Balancing', slug: 'load-balancing', order: 2,
      summary: 'A load balancer distributes incoming traffic across multiple servers to prevent any single server from being overwhelmed. It is the gateway to horizontal scaling — without it, you cannot distribute work. Load balancers also provide health checking, failover, and SSL termination.',
      analogy: 'A load balancer is like a traffic cop at a busy intersection directing cars to different lanes. If one lane is jammed or blocked, the traffic cop redirects to open lanes. This keeps traffic flowing even when individual lanes have problems.',
      diagram: `
  Internet Traffic
       ↓
  [Load Balancer]
   ↙    ↓    ↘
  [S1] [S2] [S3]   ← healthy servers
        ↓
  [S2 dies] → LB detects via health check
   ↙         ↘
  [S1]       [S3]   ← traffic redistributed`,
      diagramSteps: [
        { step: 1, title: 'Traffic distribution', description: 'LB receives requests and distributes to backend servers using a configured algorithm.', diagram: 'Request 1 → S1, Request 2 → S2, Request 3 → S3, Request 4 → S1...' },
        { step: 2, title: 'Health checking', description: 'LB pings servers every few seconds. If a server fails 3 checks, it is removed from the pool.', diagram: 'LB: GET /health → S1 200 OK ✓, S2 timeout ✗ → remove S2' },
        { step: 3, title: 'SSL termination', description: 'LB decrypts HTTPS traffic. Backend servers communicate in plain HTTP internally, reducing CPU load on app servers.', diagram: 'HTTPS → [LB decrypts] → HTTP → [S1] [S2] [S3]' }
      ],
      tradeoffs: [
        { title: 'Round Robin vs Least Connections', optionA: 'Round Robin — simple, even distribution, ignores server load', optionB: 'Least Connections — sends to least busy server, better for variable request times', recommendation: 'Round Robin for uniform requests, Least Connections for variable workloads', reasoning: 'If all requests take the same time, Round Robin is perfect. If some take 10ms and others 10s, Least Connections prevents hot spots.' },
        { title: 'L4 vs L7 Load Balancing', optionA: 'L4 (TCP) — routes by IP/port, fast, no content inspection', optionB: 'L7 (HTTP) — routes by URL/headers/cookies, flexible, slight overhead', recommendation: 'L7 for web apps (path-based routing), L4 for raw TCP performance', reasoning: 'L7 enables routing /api to API servers and /static to CDN origin — critical for modern microservices.' }
      ],
      whenToUse: [{ scenario: 'Any horizontally scaled service', reason: 'You cannot distribute traffic without a load balancer' }],
      whenNotToUse: [{ scenario: 'Single-server setups', reason: 'A LB in front of one server adds latency with no benefit' }],
      keyPoints: ['Load balancers provide health checking and automatic failover', 'Consistent hashing minimizes cache misses when servers are added/removed', 'LBs can be hardware (F5), software (Nginx, HAProxy), or cloud-managed (AWS ALB)', 'SSL termination at LB reduces CPU burden on app servers'],
      quiz: [
        { type: 'multiple_choice', question: 'What happens when a load balancer detects a server is unhealthy?', options: ['It crashes the server', 'It removes the server from the pool and stops sending traffic to it', 'It scales up the server', 'It logs a warning but continues sending traffic'], correct: 1, explanation: 'Health checks detect failures. The LB removes unhealthy servers automatically and redistributes traffic to healthy ones.' },
        { type: 'multiple_choice', question: 'What is SSL termination at the load balancer?', options: ['The LB blocks encrypted traffic', 'The LB decrypts HTTPS, forwards plain HTTP to backend servers', 'Backend servers handle all SSL', 'SSL is removed from the system'], correct: 1, explanation: 'SSL/TLS decryption is CPU-intensive. Centralizing it at the LB means app servers handle plain HTTP and spend CPU on business logic.' },
        { type: 'fill_blank', question: 'Load balancers use ________ algorithms like round-robin and least-connections to distribute traffic.', answer: 'routing', explanation: 'Different routing algorithms suit different workloads. Round-robin is simple; least-connections handles variable request durations better.' }
      ]
    },
    {
      title: 'Database Replication', slug: 'database-replication', order: 3,
      summary: 'Database replication maintains copies of data across multiple servers. The primary (leader) handles writes, and replicas (followers) serve reads. This improves read throughput, provides redundancy, and enables geographic distribution. Most large-scale systems use replication to handle read-heavy workloads.',
      analogy: 'The primary database is the original book. Read replicas are photocopies. Anyone can read a photocopy, but only the original gets updated. Changes to the original are periodically copied to all photocopies.',
      diagram: `
  Writes (10%)              Reads (90%)
      ↓                    ↙    ↓    ↘
  [Primary DB] ──replication──▶ [Replica1] [Replica2] [Replica3]
  (all writes)              (read traffic distributed)

  Replication lag: changes on Primary reach Replicas in ~1-100ms`,
      diagramSteps: [
        { step: 1, title: 'Write to primary', description: 'All writes (INSERT, UPDATE, DELETE) go to the primary. Primary is the source of truth.', diagram: 'App → INSERT INTO posts → [Primary]' },
        { step: 2, title: 'Replication to replicas', description: 'Primary streams changes (WAL/binlog) to replicas asynchronously. Replicas apply changes in order.', diagram: '[Primary] → binlog → [Replica1] [Replica2] [Replica3]' },
        { step: 3, title: 'Read from replicas', description: 'Read queries distributed across replicas. Primary is free to serve writes and strong-consistency reads.', diagram: 'App → SELECT * FROM posts → [Replica1] or [Replica2] or [Replica3]' }
      ],
      tradeoffs: [
        { title: 'Async vs Sync replication', optionA: 'Async — primary does not wait for replicas. Fast writes, risk of data loss on crash.', optionB: 'Sync — primary waits for at least one replica to confirm. Slow writes, no data loss.', recommendation: 'Semi-sync: primary waits for one replica, others async. Balance of safety and speed.', reasoning: 'Pure sync doubles write latency. Pure async risks losing committed data if primary crashes before replica receives it.' }
      ],
      whenToUse: [
        { scenario: 'Read-heavy workloads (typical web apps are 80-90% reads)', reason: 'Distribute read load across replicas, free primary for writes' },
        { scenario: 'High availability requirements', reason: 'Replica becomes new primary in seconds if primary fails (failover)' }
      ],
      whenNotToUse: [{ scenario: 'Write-heavy workloads that need immediate read-after-write consistency', reason: 'Replication lag means a replica may return stale data immediately after a write' }],
      keyPoints: ['Replication lag is typically 1-100ms — reads from replicas may be slightly stale', 'Replication handles read scale but not write scale — for that, use sharding', 'Primary failure triggers automatic failover to a replica (becomes new primary)', 'Read replicas can be geographically distributed (read from nearest DC)'],
      quiz: [
        { type: 'multiple_choice', question: 'Your app has 95% reads and 5% writes. What does database replication solve?', options: ['Write throughput', 'Read throughput — multiple replicas serve the 95% read load', 'Storage capacity', 'Query speed on individual queries'], correct: 1, explanation: 'Replication scales reads by distributing them across replicas. Writes still go to a single primary.' },
        { type: 'multiple_choice', question: 'What is replication lag?', options: ['The time to set up replication', 'The delay between a write on the primary and it appearing on replicas', 'The difference in storage between primary and replica', 'How long a replica is behind in queries'], correct: 1, explanation: 'Writes travel from primary to replica over the network. This typically takes 1-100ms. Reads from replicas may return data that is slightly behind.' },
        { type: 'fill_blank', question: 'Database replication scales ________ operations, but sharding is needed to scale writes.', answer: 'read', explanation: 'All writes must go to the primary. Read replicas handle the read load. To scale writes, you need sharding (splitting data across multiple primaries).' }
      ]
    },
    {
      title: 'Database Sharding', slug: 'database-sharding', order: 4,
      summary: 'Sharding splits a database horizontally — each shard holds a subset of the data. A shard key determines which shard stores each record. Sharding scales writes and storage beyond what a single machine can handle, but introduces significant complexity: cross-shard queries, rebalancing, and hotspots.',
      analogy: 'Sharding is like splitting a library into sections: A-G in building 1, H-N in building 2, O-Z in building 3. Each building handles its own section. Looking up one book is fast — you go to the right building. Finding all books by an author who spans two buildings requires visiting both.',
      diagram: `
  [App] → shard_key = user_id % 3

  user_id=1 → 1%3=1 → [Shard 1: users 1,4,7,10...]
  user_id=2 → 2%3=2 → [Shard 2: users 2,5,8,11...]
  user_id=3 → 3%3=0 → [Shard 0: users 3,6,9,12...]

  Cross-shard query (count all users):
  → Query all 3 shards → aggregate results → slow!`,
      diagramSteps: [
        { step: 1, title: 'Choose shard key', description: 'Shard key determines data distribution. Good key = even distribution. Bad key = hot shard.', diagram: 'user_id → even. created_at → hot shard for new data' },
        { step: 2, title: 'Route request to shard', description: 'App or shard router computes which shard holds the data for this key.', diagram: 'shard = hash(user_id) % num_shards → route to DB' },
        { step: 3, title: 'Cross-shard query problem', description: 'Queries spanning multiple shards require scatter-gather: query all shards, merge results.', diagram: '"SELECT COUNT(*)" → [Shard0] [Shard1] [Shard2] → app merges → slow' }
      ],
      tradeoffs: [
        { title: 'Range-based vs Hash-based sharding', optionA: 'Range-based — shard by value range (A-G, H-N). Simple but creates hot shards for recent data.', optionB: 'Hash-based — shard by hash of key. Even distribution but range queries span all shards.', recommendation: 'Hash-based for user data, range-based only when range queries are dominant', reasoning: 'Range sharding on timestamps creates a hot shard for all new writes. Hash sharding distributes evenly.' }
      ],
      whenToUse: [
        { scenario: 'Dataset too large for one machine', reason: 'Petabyte-scale datasets cannot fit on any single server' },
        { scenario: 'Write throughput exceeds single-primary capacity', reason: 'Multiple primaries (one per shard) multiply write capacity' }
      ],
      whenNotToUse: [
        { scenario: 'Before exhausting vertical scaling and read replicas', reason: 'Sharding adds enormous complexity — try simpler solutions first' },
        { scenario: 'Workloads requiring frequent cross-shard queries', reason: 'Cross-shard scatter-gather is slow and expensive' }
      ],
      keyPoints: ['Choose shard key carefully — it is very hard to change later', 'Hot shards occur when shard key causes uneven distribution', 'Cross-shard joins/aggregations require scatter-gather — avoid if possible', 'Consistent hashing minimizes data movement when adding/removing shards'],
      quiz: [
        { type: 'multiple_choice', question: 'What is a hot shard?', options: ['A shard with more storage', 'A shard receiving disproportionately more traffic than others', 'A recently created shard', 'A shard with replication enabled'], correct: 1, explanation: 'If your shard key causes most traffic to hit one shard (e.g., sharding by country with 80% US users), that shard is overwhelmed — a hot shard.' },
        { type: 'multiple_choice', question: 'Why is sharding considered a last resort?', options: ['It is too expensive', 'It adds massive complexity: routing, cross-shard queries, rebalancing', 'It does not scale writes', 'It requires new hardware'], correct: 1, explanation: 'Sharding breaks the simplicity of a single database. Cross-shard queries, transactions, and rebalancing are all hard engineering problems.' },
        { type: 'fill_blank', question: 'In hash-based sharding, the shard is determined by shard = ________(key) % num_shards.', answer: 'hash', explanation: 'Hashing the key distributes data evenly across shards regardless of the key\'s actual value or range.' }
      ]
    },
    {
      title: 'Rate Limiting', slug: 'rate-limiting', order: 5,
      summary: 'Rate limiting controls how many requests a client can make in a time window. It protects your system from abuse, prevents DDoS attacks, enforces API quotas, and ensures fair resource distribution. Every public API must implement rate limiting.',
      analogy: 'Rate limiting is like a nightclub bouncer with a clicker. Once 100 people are inside, the bouncer stops letting more in until some leave. It does not matter if you are a VIP — the room has a capacity.',
      diagram: `
  Token Bucket Algorithm:

  Bucket capacity: 10 tokens
  Refill rate: 1 token/second

  t=0: [●●●●●●●●●●] 10 tokens
  t=0: Request → consume 1 → [●●●●●●●●●] 9 tokens  ✓
  t=0: 5 requests → [●●●●] 4 tokens  ✓
  t=0: 5 more → bucket empty → HTTP 429  ✗
  t=5: refilled to [●●●●●] → requests allowed again  ✓`,
      diagramSteps: [
        { step: 1, title: 'Token Bucket', description: 'Bucket fills with tokens at fixed rate. Each request consumes one token. If empty, request is rejected.', diagram: 'Bucket[capacity=10, rate=1/s] → consume on request → 429 when empty' },
        { step: 2, title: 'Sliding Window Counter', description: 'Count requests in a rolling time window. More accurate than fixed windows but requires more memory.', diagram: '100 req/min limit: count requests in last 60 seconds exactly' },
        { step: 3, title: 'Distributed rate limiting', description: 'Multiple servers must share rate limit state. Use Redis as central counter with atomic increment + TTL.', diagram: 'Server1 + Server2 → Redis INCR user:123:count → reject if > limit' }
      ],
      tradeoffs: [
        { title: 'Fixed Window vs Sliding Window', optionA: 'Fixed Window — simple, allows 2x burst at window boundary', optionB: 'Sliding Window — accurate, no burst, requires more computation', recommendation: 'Sliding window for strict limits, fixed window for simple quota enforcement', reasoning: 'Fixed window: 100 req allowed 11:59-12:00 AND 100 req allowed 12:00-12:01 = 200 in 2 seconds. Sliding window prevents this.' }
      ],
      whenToUse: [
        { scenario: 'All public API endpoints', reason: 'Prevent abuse, brute-force attacks, and accidental runaway clients' },
        { scenario: 'Login endpoints specifically', reason: 'Prevent credential stuffing and brute force password attacks' }
      ],
      whenNotToUse: [{ scenario: 'Internal service-to-service calls with trusted clients', reason: 'Rate limiting adds latency. Internal services have controlled call patterns.' }],
      keyPoints: ['Rate limit by user ID, API key, and IP address (in order of preference)', 'Return HTTP 429 with Retry-After header when limit is exceeded', 'Redis is the standard distributed rate limit counter', 'Implement rate limiting at the API Gateway, not each microservice'],
      quiz: [
        { type: 'multiple_choice', question: 'What HTTP status code should be returned when a rate limit is exceeded?', options: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '429 Too Many Requests'], correct: 3, explanation: 'HTTP 429 "Too Many Requests" is the standard code for rate limit exceeded. Include a Retry-After header telling the client when to retry.' },
        { type: 'multiple_choice', question: 'Why use Redis for distributed rate limiting?', options: ['Redis is faster than all alternatives', 'Redis provides atomic operations (INCR) that work correctly across multiple app servers', 'Redis is free', 'Redis has built-in rate limiting'], correct: 1, explanation: 'Multiple app servers need to share a rate limit counter. Redis INCR is atomic — concurrent increments from different servers are counted correctly.' },
        { type: 'fill_blank', question: 'The Token Bucket algorithm allows a ________ of requests before enforcing the rate limit.', answer: 'burst', explanation: 'Token Bucket starts full. A client can consume all tokens immediately (burst), then must wait for refills. This is more user-friendly than strict per-second limits.' }
      ]
    },
    {
      title: 'Caching Strategies', slug: 'caching-strategies', order: 6,
      summary: 'There are multiple caching patterns, each with different consistency and performance trade-offs. Cache-aside (lazy loading) is the most common. Write-through ensures consistency. Write-back maximizes write performance. Read-through delegates cache population to the cache layer itself.',
      analogy: 'Cache-aside: you check your notes before asking a teacher. Write-through: after the teacher explains, you immediately write it in your notes. Write-back: you write in scratch paper, then copy to notes later. Read-through: you have a smart assistant who fetches answers and puts them in your notes automatically.',
      diagram: `
  Cache-Aside (Lazy):    Write-Through:         Write-Back:

  Read:                  Write:                 Write:
  App→Cache miss         App→DB write           App→Cache write
  App→DB read            App→Cache write        ↓ async later
  App→Cache set          (both always updated)  Cache→DB write

  Write:
  App→DB write           Consistent reads        Fast writes
  App→Cache invalidate   Slower writes           Risk of data loss`,
      diagramSteps: [
        { step: 1, title: 'Cache-aside (Lazy Loading)', description: 'Application manages cache explicitly. On read miss, fetch from DB and populate cache.', diagram: 'get(key) → miss → DB.get(key) → cache.set(key,val,TTL) → return val' },
        { step: 2, title: 'Write-through', description: 'Every write updates both cache and DB synchronously. Cache always has current data.', diagram: 'write(key,val) → cache.set(key,val) AND DB.write(key,val) → ack' },
        { step: 3, title: 'Write-back (Write-behind)', description: 'Write to cache only. Async worker flushes cache to DB in batches. Fast writes, risk of loss.', diagram: 'write(key,val) → cache.set(key,val) → [async] DB.write(batch) → ack' }
      ],
      tradeoffs: [
        { title: 'Cache-aside vs Write-through', optionA: 'Cache-aside — simple, only caches what is read, cold start problem', optionB: 'Write-through — always consistent, caches everything even if never read', recommendation: 'Cache-aside is the default choice. Write-through for critical data where reads must be fast.', reasoning: 'Write-through wastes cache space by caching data that may never be read. Cache-aside is efficient but the first read after invalidation hits the DB.' }
      ],
      whenToUse: [
        { scenario: 'Cache-aside: read-heavy, unpredictable access patterns', reason: 'Only caches what is actually requested — efficient use of cache space' },
        { scenario: 'Write-through: data that is immediately read after write', reason: 'Guarantees cache is populated before the next read' },
        { scenario: 'Write-back: write-heavy workloads where DB is the bottleneck', reason: 'Buffers writes in memory, flushes in batches — massive write throughput gain' }
      ],
      whenNotToUse: [{ scenario: 'Write-back for financial transactions', reason: 'Data in cache but not yet in DB can be lost on crash' }],
      keyPoints: ['Cache-aside is the most widely used pattern', 'Write-back is dangerous — only use when you can tolerate data loss on crash', 'Cache invalidation strategy is as important as cache population strategy', 'Always set a TTL — unbounded caches fill memory and cause OOM crashes'],
      quiz: [
        { type: 'multiple_choice', question: 'In cache-aside, what happens on a cache miss?', options: ['Return empty response', 'Application fetches from DB, stores in cache, returns data', 'Cache automatically fetches from DB', 'Request is queued'], correct: 1, explanation: 'With cache-aside, the application is responsible for checking the cache, fetching from DB on miss, and populating the cache.' },
        { type: 'multiple_choice', question: 'Which caching strategy risks data loss on cache server crash?', options: ['Cache-aside', 'Write-through', 'Write-back', 'Read-through'], correct: 2, explanation: 'Write-back stores writes in cache first, DB later (async). If cache crashes before the flush, those writes are lost.' },
        { type: 'fill_blank', question: 'Every cache entry should have a ________ to prevent stale data from living forever.', answer: 'TTL', explanation: 'Time-to-Live (TTL) sets an expiration on cache entries. Without it, stale data remains in cache indefinitely and the cache fills memory.' }
      ]
    },
    {
      title: 'Message Queues', slug: 'message-queues', order: 7,
      summary: 'Message queues decouple services by allowing asynchronous communication. A producer sends messages to a queue; consumers process them at their own pace. This enables load leveling, service isolation, retry logic, and fan-out patterns. Kafka and RabbitMQ are the dominant implementations.',
      analogy: 'A message queue is like an email inbox. The sender (producer) fires off an email whenever they want. The recipient (consumer) processes emails at their own pace. The email server (queue) holds messages until they are read. The sender does not wait for the recipient to read the email.',
      diagram: `
  Synchronous (tight coupling):     Asynchronous (queue):

  [OrderService] ────────────▶      [OrderService]
    waits for response...                 ↓
  [EmailService] responds              [Queue: orders]
    (what if email is slow?)             ↓
                                    [EmailService] (processes when ready)
                                    [SMSService]   (fan-out to multiple consumers)
                                    [AnalyticsService]`,
      diagramSteps: [
        { step: 1, title: 'Producer publishes message', description: 'Service writes a message to the queue and continues without waiting.', diagram: 'OrderService → Queue.publish({ orderId, userId, items })  → returns immediately' },
        { step: 2, title: 'Queue persists message', description: 'Message is durably stored until a consumer picks it up.', diagram: 'Queue: [msg1, msg2, msg3] → persisted to disk' },
        { step: 3, title: 'Consumer processes', description: 'Consumer pulls from queue, processes, acknowledges. On failure, message is requeued.', diagram: 'EmailService → Queue.consume() → send email → ack → message deleted' }
      ],
      tradeoffs: [
        { title: 'Kafka vs RabbitMQ', optionA: 'Kafka — log-based, retains messages, replay, high throughput, partitioned', optionB: 'RabbitMQ — traditional queue, message deleted on ack, flexible routing', recommendation: 'Kafka for event streaming and audit logs. RabbitMQ for task queues.', reasoning: 'Kafka\'s log retention enables replaying events (great for analytics). RabbitMQ\'s routing is better for complex workflow queuing.' }
      ],
      whenToUse: [
        { scenario: 'Decoupling services that have different throughput characteristics', reason: 'Queue absorbs bursts — consumers process at steady rate' },
        { scenario: 'Operations that can be done asynchronously (email, notifications, thumbnails)', reason: 'User does not need to wait for email to be sent before getting order confirmation' }
      ],
      whenNotToUse: [{ scenario: 'Operations requiring immediate response (auth, payments)', reason: 'Queue adds latency. Use sync call when you need the response in the same request.' }],
      keyPoints: ['Queues decouple producers from consumers in time and scale', 'At-least-once delivery: messages may be delivered twice — consumers must be idempotent', 'Dead letter queues store messages that failed processing after N retries', 'Kafka retains messages for days/weeks — consumers can replay from any point'],
      quiz: [
        { type: 'multiple_choice', question: 'A user places an order. Which tasks should be done asynchronously via queue?', options: ['Charging the credit card', 'Checking inventory', 'Sending confirmation email and updating analytics', 'Creating the order record'], correct: 2, explanation: 'Charging and order creation need immediate confirmation. Email and analytics can happen asynchronously without delaying the user.' },
        { type: 'multiple_choice', question: 'What is "at-least-once delivery" in message queues?', options: ['Messages arrive exactly once guaranteed', 'Messages might be delivered more than once — consumers must handle duplicates', 'Messages arrive in order', 'Messages are deleted on failure'], correct: 1, explanation: 'Queues retry on failure. If the consumer crashes after processing but before acknowledging, the message is redelivered. Consumers must be idempotent.' },
        { type: 'fill_blank', question: 'Messages that fail processing after N retries are moved to a ________ queue.', answer: 'dead letter', explanation: 'Dead letter queues (DLQ) capture failed messages for later inspection and reprocessing, preventing poison messages from blocking the main queue.' }
      ]
    },
    {
      title: 'Consistent Hashing', slug: 'consistent-hashing', order: 8,
      summary: 'Consistent hashing minimizes data movement when nodes are added or removed from a distributed system. In regular modulo hashing (key % N), changing N remaps almost all keys. Consistent hashing maps keys and nodes to a ring — only 1/N of keys need to move when a node changes.',
      analogy: 'Regular hashing is like assigned classroom seats — if one classroom is added, everyone reshuffles. Consistent hashing is like a circular bus route — add a new bus stop and only the passengers between the new stop and the next existing stop switch buses. Everyone else stays on the same bus.',
      diagram: `
  Hash Ring (0 to 2^32):

         A (0°)
        /      \\
  D(270°)      B(90°)
        \\      /
         C(180°)

  key "user:1" hashes to 45° → assigned to B (next clockwise)
  key "post:5" hashes to 200° → assigned to C

  Node B removed: its keys move to C only.
  1/4 of keys remapped (not all of them).`,
      diagramSteps: [
        { step: 1, title: 'Map nodes to ring', description: 'Each server node is hashed to a position on a 0-2^32 ring.', diagram: 'hash(ServerA) = 100, hash(ServerB) = 300, hash(ServerC) = 700' },
        { step: 2, title: 'Map keys to ring', description: 'Each key is hashed to a position. It is assigned to the next node clockwise.', diagram: 'hash(user:1) = 150 → goes to ServerB (next clockwise at 300)' },
        { step: 3, title: 'Node change — minimal remapping', description: 'When ServerB is removed, only keys between A and B need to move to C. All other keys are unaffected.', diagram: 'Remove B(300): keys 100-300 move to C(700). A and C unaffected.' }
      ],
      tradeoffs: [
        { title: 'Consistent Hashing vs Modulo Hashing', optionA: 'Modulo — simple, all keys remapped when N changes (cache storm)', optionB: 'Consistent — only 1/N keys remapped, virtual nodes for even distribution', recommendation: 'Always use consistent hashing for distributed caches and sharded DBs', reasoning: 'Changing from N=5 to N=6 servers with modulo hashing invalidates 83% of cache entries at once — catastrophic during scaling.' }
      ],
      whenToUse: [
        { scenario: 'Distributed caches (Redis Cluster, Memcached)', reason: 'Server add/remove causes minimal cache invalidation' },
        { scenario: 'Sharded databases with dynamic node count', reason: 'Rebalancing data when adding shards affects minimum data' }
      ],
      whenNotToUse: [{ scenario: 'Small static clusters where nodes never change', reason: 'Simple modulo hashing is fine if server count is fixed' }],
      keyPoints: ['Only 1/N keys remapped when a node is added/removed (vs ~100% with modulo)', 'Virtual nodes improve distribution — each physical node maps to multiple ring positions', 'Used by Cassandra, DynamoDB, Redis Cluster, Memcached clients', 'The ring approach makes horizontal scaling nearly transparent'],
      quiz: [
        { type: 'multiple_choice', question: 'With 10 servers using modulo hashing, what fraction of keys are remapped when you add an 11th server?', options: ['1/11 (only the new server\'s share)', 'About 90% of all keys', 'None — modulo handles it automatically', '1/10'], correct: 1, explanation: 'With modulo hashing (key % 10 vs key % 11), the assignment changes for nearly every key. Consistent hashing reduces this to ~1/11 remapped.' },
        { type: 'multiple_choice', question: 'What problem do virtual nodes solve in consistent hashing?', options: ['Network latency', 'Uneven distribution when few nodes are on the ring', 'Cross-node queries', 'Data replication'], correct: 1, explanation: 'With few physical nodes, natural hash positions may cluster unevenly. Virtual nodes (each physical node maps to multiple ring positions) ensure even distribution.' },
        { type: 'fill_blank', question: 'Consistent hashing only remaps ________ of keys when a node is added or removed.', answer: '1/N', explanation: 'Only the keys that were assigned to the changed node need to move. All other keys remain on their current nodes — critical for zero-disruption scaling.' }
      ]
    }
  ];

  for (const lesson of scalabilityLessons) {
    await prisma.designLesson.upsert({
      where: { slug: lesson.slug },
      update: {},
      create: {
        ...lesson,
        trackId: t2.id,
        diagramSteps: JSON.stringify(lesson.diagramSteps),
        tradeoffs: JSON.stringify(lesson.tradeoffs),
        whenToUse: JSON.stringify(lesson.whenToUse),
        whenNotToUse: JSON.stringify(lesson.whenNotToUse),
        keyPoints: JSON.stringify(lesson.keyPoints),
        quiz: JSON.stringify(lesson.quiz)
      }
    });
  }
  console.log('✅ Track 2: Scalability & Performance seeded');
}
