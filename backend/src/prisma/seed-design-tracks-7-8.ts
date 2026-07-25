import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seedTracks7and8() {
  // ── TRACK 7: ARCHITECTURE PATTERNS ──────────────────────────────────────
  const t7 = await prisma.designTrack.upsert({
    where: { slug: 'architecture-patterns' },
    update: {},
    create: {
      name: 'Architecture Patterns', slug: 'architecture-patterns',
      description: 'The design patterns that power modern software: microservices, event-driven systems, CQRS, sagas, service mesh, and domain-driven design.',
      icon: '🏛️', color: '#A855F7', order: 7, level: 'advanced'
    }
  });

  const t7lessons = [
    {
      title: 'Microservices vs Monolith', slug: 'microservices-vs-monolith', order: 1,
      summary: 'A monolith is a single deployable unit containing all functionality. A microservices architecture splits functionality into independently deployable services. Monoliths are simpler to develop, test, and debug. Microservices enable independent scaling, technology diversity, and team autonomy — but add distributed systems complexity. The rule: start with a monolith, extract services when you feel specific pain. Never microservices-first.',
      analogy: 'A monolith is like a Swiss Army knife — everything in one tool, simple to carry, works great for most situations. Microservices are like a professional chef\'s kitchen with specialized tools for each job — better for scale but you need a whole drawer for them and they require more coordination. Most people do not need a professional kitchen.',
      diagram: `
  Monolith:                         Microservices:

  ┌─────────────────────────┐       [UserService]──────────┐
  │         MONOLITH        │       [OrderService]          │
  │  UserModule             │       [PaymentService]        ├─ each deploys
  │  OrderModule            │       [InventoryService]      │  independently
  │  PaymentModule          │       [NotificationService]───┘
  │  InventoryModule        │
  │  NotificationModule     │       ↕ communication via
  │  [Shared DB]            │       HTTP/gRPC/message queues
  └─────────────────────────┘
                                    each has its own DB
  One deploy, one DB                network latency between services
  Fast local calls                  independent scaling possible`,
      diagramSteps: [
        { step: 1, title: 'Monolith advantages', description: 'Simple deployment (one artifact). Simple debugging (one log stream). No network latency between modules. Easier transactions (one database). Great for small teams.', diagram: 'Deploy: git push → one Docker image. Debug: tail one log file. Transaction: BEGIN; user + order + payment; COMMIT.' },
        { step: 2, title: 'When monolith starts hurting', description: 'Team > 50 engineers, different services need different scaling, unrelated modules affect each other\'s deployments, technology diversity needed.', diagram: 'Pain: PaymentModule needs PCI compliance isolation. OrderModule needs 10x CPU for sales. Teams step on each other.' },
        { step: 3, title: 'Microservices advantages', description: 'Independent deployment — PaymentService deploys without affecting UserService. Independent scaling. Technology choice per service. Team ownership.', diagram: 'PaymentService: Java, PCI zone, 2 instances. RecommendationService: Python+ML, GPU, 20 instances.' },
        { step: 4, title: 'Microservices costs', description: 'Network calls (latency). Distributed tracing complexity. Distributed transactions needed. Service discovery. More infrastructure to maintain.', diagram: 'Monolith: user.getOrders() = nanoseconds. Microservices: HTTP call = 5-50ms. 10 services = 50-500ms added latency.' }
      ],
      tradeoffs: [
        { title: 'Monolith vs Microservices', optionA: 'Monolith: simpler dev/debug/deploy, faster local calls, one DB, better for < 20 engineers', optionB: 'Microservices: independent scaling/deploy, team autonomy, technology diversity, distributed complexity', recommendation: 'Start monolith, extract services when you have specific, measurable pain that microservices would solve.', reasoning: '"Microservices first" has killed countless startups. The complexity is real. Earn it by feeling the monolith pain first.' },
        { title: 'Modular Monolith as middle ground', optionA: 'Modular Monolith: monolith with strict module boundaries (no cross-module direct DB access)', optionB: 'Microservices: full separation with network calls between services', recommendation: 'Modular monolith is often the right answer — get team boundaries and independence without distributed system complexity.', reasoning: 'Shopify, Stack Overflow, and GitHub ran successfully as monoliths for years. Module boundaries can be enforced without splitting into services.' }
      ],
      whenToUse: [
        { scenario: 'Monolith: < 20 engineers, early product, unknown requirements', reason: 'Speed of iteration matters most early on. Monolith enables this.' },
        { scenario: 'Microservices: > 50 engineers, specific scaling needs, team ownership requirements', reason: 'At this scale, the coordination cost of microservices is less than the coordination cost of many teams in one codebase.' }
      ],
      whenNotToUse: [
        { scenario: 'Microservices from day one for a startup', reason: 'Distributed system complexity will kill your velocity before you have product-market fit' }
      ],
      keyPoints: ['Start with a monolith; extract services when you feel specific, measurable pain', 'Microservices require distributed tracing, service discovery, and distributed transaction handling', 'Modular monolith: monolith with module boundaries — often the best of both worlds', 'Conway\'s Law: your architecture mirrors your team structure — design both together', 'Monolith → services extraction is easier than services → monolith (never go backwards easily)'],
      quiz: [
        { type: 'multiple_choice', question: 'A 5-person startup is building a new SaaS product. Which architecture is recommended?', options: ['Microservices — it is easier to scale later', 'Serverless functions for each feature', 'Monolith — focus on product, not infrastructure', 'Event-driven architecture from day one'], correct: 2, explanation: 'A 5-person team needs speed and simplicity. Monolith gives both. Premature microservices add distributed system complexity before you even have users.' },
        { type: 'fill_blank', question: 'Conway\'s Law states that your system architecture tends to mirror your organization\'s ________ structure.', answer: 'team', explanation: 'Teams communicate through their software. If teams are siloed, their services will be too. Design your team structure and architecture together.' }
      ]
    },
    {
      title: 'Event-Driven Architecture', slug: 'event-driven-architecture', order: 2,
      summary: 'Event-Driven Architecture (EDA) uses events — records of things that happened — as the primary communication mechanism between services. Producers emit events to a broker (Kafka). Consumers subscribe and react independently. This decouples services in time and space: producers do not know who consumes their events, and consumers process at their own rate. Enables powerful patterns: event sourcing, CQRS, fan-out, and stream processing.',
      analogy: 'A newspaper publisher: the publisher (producer) prints the news without knowing who reads it. Anyone who subscribes (consumer) gets the news and does what they want with it: readers read it, advertisers analyze circulation, recyclers collect old copies. No one waits for anyone else. New subscribers can get the archive of past editions and replay history.',
      diagram: `
  Request-Driven (tight coupling):
  OrderService ──────HTTP────▶ InventoryService
  OrderService ──────HTTP────▶ PaymentService
  OrderService ──────HTTP────▶ ShippingService
  (OrderService must know all consumers, waits for each)

  Event-Driven (loose coupling):
  OrderService ──"order.created"──▶ [Kafka topic]
                                          │
              ┌─────────────────┬─────────┘
              ▼                 ▼
  InventoryService        PaymentService    ShippingService
  (subscribes,             (subscribes,     (subscribes,
   processes               processes        processes
   async)                  async)           async)

  OrderService doesn't know or care who consumes.`,
      diagramSteps: [
        { step: 1, title: 'Events as first-class citizens', description: 'Events are immutable records: "what happened" with all relevant context. Not commands ("do this") but facts ("this happened").', diagram: '{"type":"order.created","orderId":"123","userId":"456","items":[...],"timestamp":"2024-01-15T14:23:01Z"}' },
        { step: 2, title: 'Kafka as the event backbone', description: 'Topics partition events. Producers write to topics. Consumer groups read from topics. Events retained for days — consumers can replay.', diagram: 'Topic: order-events. Partitions: 12 (by user_id). Retention: 7 days. Consumers: Inventory, Payment, Analytics.' },
        { step: 3, title: 'Fan-out: one event, many consumers', description: 'OrderCreated event consumed by InventoryService (reserve stock), PaymentService (charge card), AnalyticsService (record sale), EmailService (confirm email) — all independently.', diagram: 'order.created → [Inventory, Payment, Analytics, Email] all consume independently, process in parallel.' },
        { step: 4, title: 'Eventual consistency trade-off', description: 'Between order created and inventory reserved, there is a window where stock appears available. Must handle race conditions with idempotency and compensation.', diagram: 'T=0: order created. T=500ms: inventory reserved. T=600ms: payment charged. Brief inconsistency windows.' }
      ],
      tradeoffs: [
        { title: 'Event-Driven vs Request-Driven', optionA: 'Event-Driven: decoupled, async, scalable, hard to trace, eventual consistency', optionB: 'Request-Driven (REST/gRPC): immediate response, easy to trace, tight coupling, synchronous wait', recommendation: 'Event-driven for background workflows and fan-out. Request-driven for user-facing operations needing immediate response.', reasoning: 'User clicks "pay" and expects immediate confirmation — use synchronous call. Sending confirmation email after payment — use event.' }
      ],
      whenToUse: [
        { scenario: 'Complex workflows spanning multiple services', reason: 'Each step emits an event; next step reacts — no orchestrator needed, fully decoupled' },
        { scenario: 'Fan-out: one action triggers many reactions', reason: 'Event-driven fan-out is far simpler than calling 5 services synchronously and handling partial failures' }
      ],
      whenNotToUse: [
        { scenario: 'Simple CRUD operations needing immediate response', reason: 'Event-driven adds Kafka, serialization overhead, and eventual consistency for no benefit in simple cases' }
      ],
      keyPoints: ['Events are immutable facts: "this happened" not "do this"', 'Kafka retains events — consumers can replay history and new consumers catch up', 'Decouples producers from consumers in time (async) and space (no direct dependency)', 'Eventual consistency is inherent — design compensation for failure paths', 'Fan-out: one event → N consumers independently — massive scalability advantage'],
      quiz: [
        { type: 'multiple_choice', question: 'Which operation is best handled with event-driven architecture?', options: ['Validating a user\'s login credentials', 'Charging a credit card and waiting for confirmation', 'Sending a confirmation email after order placement', 'Checking product inventory before adding to cart'], correct: 2, explanation: 'Email sending is asynchronous — the user does not need to wait. Event-driven decouples email sending from order creation. Login and payment need synchronous responses.' },
        { type: 'fill_blank', question: 'In EDA, a ________ emits events to a broker, and ________ independently subscribe and react to those events.', answer: 'producer, consumers', explanation: 'Producers and consumers are completely decoupled. The producer does not know which consumers exist or how they process the event.' }
      ]
    },
    {
      title: 'CQRS & Event Sourcing', slug: 'cqrs-event-sourcing', order: 3,
      summary: 'CQRS (Command Query Responsibility Segregation) separates write operations (commands) from read operations (queries) into different models and often different data stores. This allows independent optimization: write model for consistency, read model for performance. Event Sourcing stores all state changes as an append-only log of events rather than current state. The current state is derived by replaying events. Together, CQRS + Event Sourcing enable audit logs, time-travel debugging, and projections.',
      analogy: 'Bank account: traditional DB stores current balance ($500). Event sourcing stores every transaction: deposit $1000, withdraw $200, withdraw $300 — replay = $500. CQRS: account managers (writers) use the secure transaction system. ATMs and apps (readers) use a fast read-only balance cache. Same data, different optimized views.',
      diagram: `
  Traditional:
  [Commands & Queries] → [Single DB] → [Current State]

  CQRS:
  [Commands] → [Write Model] → [Write DB]
                                    ↓ events
  [Queries]  → [Read Model]  ← [Read DB (projections)]
  (optimized separately per use case)

  Event Sourcing:
  Write: append event to log
  [Deposited $1000 at t=1]
  [Withdrew $200 at t=2]
  [Deposited $500 at t=3]
  [Withdrew $300 at t=4]

  Read: replay log → current state = $1000-$200+$500-$300 = $1000
  OR: maintain running projection → balance = $1000 (updated on each event)`,
      diagramSteps: [
        { step: 1, title: 'CQRS write side', description: 'Commands mutate state. Write model enforces invariants (business rules). Emits domain events after successful mutation.', diagram: 'PlaceOrderCommand → OrderAggregate validates → order created → emits OrderPlaced event' },
        { step: 2, title: 'CQRS read side', description: 'Separate query handlers with read-optimized models (denormalized, materialized views). Can use different DB (Elasticsearch for search, Redis for hot data).', diagram: 'GetUserOrdersQuery → OrderReadModel (denormalized, fast) → [Elasticsearch: full-text search of orders]' },
        { step: 3, title: 'Event Sourcing storage', description: 'Append-only event log. Never update or delete past events. Current state = replay of all events. Enables time-travel, audit, replayability.', diagram: 'EventStore: [OrderCreated, ItemAdded, PaymentReceived, OrderShipped] → replay → current order state' },
        { step: 4, title: 'Projections', description: 'Event handler consumes events and maintains a projected read model. OrderCreated → projection updates orders_by_user table. Independent projections for different queries.', diagram: 'OrderPlaced event → projection1: orders_count table. projection2: revenue_by_day table. Both updated asynchronously.' }
      ],
      tradeoffs: [
        { title: 'Event Sourcing vs Traditional State', optionA: 'Event Sourcing: full audit log, time-travel debugging, replay capability, complex, eventual consistency on reads', optionB: 'Traditional: simpler, current state only, no history, no replay', recommendation: 'Event sourcing for domains where audit and history matter (financial, compliance). Traditional for most CRUD.', reasoning: 'Event sourcing adds significant complexity — maintaining projections, handling event schema evolution, storage growth. Justify with business need.' }
      ],
      whenToUse: [
        { scenario: 'Financial systems requiring complete audit trail', reason: 'Every cent must be traceable. Event sourcing stores every transaction permanently.' },
        { scenario: 'Complex domains where history and undo are needed', reason: 'Git is event sourcing. Document editors with undo/redo are event sourcing.' }
      ],
      whenNotToUse: [
        { scenario: 'Simple CRUD applications', reason: 'Event sourcing complexity is not justified when you just need to store and retrieve current state' }
      ],
      keyPoints: ['CQRS: separate read and write models for independent optimization', 'Event sourcing: store events, derive current state by replay', 'Never delete or update past events — append only', 'Projections maintain read-optimized views of event data', 'Together: powerful audit trail, time-travel debugging, and independent read scaling'],
      quiz: [
        { type: 'multiple_choice', question: 'In event sourcing, how is the current state of an entity determined?', options: ['Read the latest row in the database', 'Replay all events for that entity from the event log', 'Query the read model cache', 'Sum all events in a transaction'], correct: 1, explanation: 'Event sourcing stores state as events, not current values. Current state = initial state + applying all events in order. Projections pre-compute this for performance.' },
        { type: 'fill_blank', question: 'In CQRS, ________ mutate state and ________ retrieve data — each optimized independently.', answer: 'commands, queries', explanation: 'Commands go through validation and business logic on the write side. Queries hit denormalized, read-optimized models on the read side.' }
      ]
    },
    {
      title: 'Saga Pattern', slug: 'saga-pattern', order: 4,
      summary: 'Saga manages long-running distributed transactions by breaking them into a sequence of local transactions, each publishing events or commands that trigger the next step. On failure, compensating transactions undo completed steps. Two implementation styles: Choreography (services react to events) and Orchestration (central saga orchestrator coordinates steps). Sagas are the modern answer to distributed transactions without 2PC.',
      analogy: 'Booking a vacation package: Flight booking → Hotel booking → Car rental → Payment confirmation. If car rental fails: refund payment → cancel hotel → cancel flight. Each step has a defined compensating action. A travel agent (orchestrator) coordinates all steps, or each vendor reacts to the previous vendor\'s confirmation email (choreography).',
      diagram: `
  Orchestration Saga (central coordinator):

  SagaOrchestrator
  ├── Step1: PlaceOrder     → OrderService     → order.created
  ├── Step2: ReserveStock   → InventoryService → stock.reserved
  ├── Step3: ChargePayment  → PaymentService   → payment.charged
  ├── Step4: ShipOrder      → ShippingService  → order.shipped
  └── On Failure at Step3:
      Compensate2: ReleaseStock  → InventoryService
      Compensate1: CancelOrder   → OrderService

  Choreography Saga (event-driven, no coordinator):

  OrderService   ──order.created──▶  InventoryService
  InventoryService ──stock.reserved──▶ PaymentService
  PaymentService ──payment.failed──▶  InventoryService(compensate)
                                    ▶ OrderService(compensate)`,
      diagramSteps: [
        { step: 1, title: 'Orchestration — central saga', description: 'Saga orchestrator service sends commands to participants and tracks state. Clear flow visible in one place. Orchestrator is a potential bottleneck.', diagram: 'OrderSaga.start() → OrderService.place() → await order.created → InventoryService.reserve() → ...' },
        { step: 2, title: 'Choreography — event-driven', description: 'Services react to events and emit new events. No central coordinator. Decentralized, hard to visualize entire flow without reading multiple services.', diagram: 'order.created → InventoryService reacts → stock.reserved → PaymentService reacts → payment.charged → ...' },
        { step: 3, title: 'Compensating transactions', description: 'Each step has a corresponding compensating transaction. Compensation must be idempotent (may be called multiple times). Business logic, not rollback — a refund, not an undo.', diagram: 'Payment charged → compensate: issue refund (not undo). ReservedStock → compensate: release reservation.' },
        { step: 4, title: 'Idempotency requirement', description: 'Saga steps may be retried on network failure. Each step must be safe to execute multiple times with the same result. Use idempotency keys.', diagram: 'ReserveStock called twice with same orderId → same reservation, no extra stock reserved. Key: orderId.' }
      ],
      tradeoffs: [
        { title: 'Choreography vs Orchestration', optionA: 'Choreography: decentralized, no bottleneck, hard to trace flow, event-driven complexity', optionB: 'Orchestration: central visibility, easier to debug, orchestrator is a single point of complexity (not failure)', recommendation: 'Orchestration for complex sagas with many steps. Choreography for simple 2-3 step sagas.', reasoning: 'Choreography flows through multiple services — tracing a failure requires reading logs from all services. Orchestration centralizes the saga state in one place.' }
      ],
      whenToUse: [
        { scenario: 'Multi-service operations that must be atomic from a business perspective', reason: 'E-commerce checkout, booking systems, financial transfers spanning multiple services' }
      ],
      whenNotToUse: [
        { scenario: 'Operations contained within a single service', reason: 'A local database transaction is simpler and more reliable than a saga for single-service operations' }
      ],
      keyPoints: ['Saga = sequence of local transactions with compensating transactions for rollback', 'Compensating transactions are business operations (refund), not DB rollbacks', 'Orchestration: one saga coordinator. Choreography: events between services.', 'All saga steps must be idempotent — safe to retry on failure', 'Sagas expose intermediate inconsistent state — design around it'],
      quiz: [
        { type: 'multiple_choice', question: 'In an orchestration saga, payment fails at step 3. Steps 1 (order) and 2 (stock reservation) completed. What happens?', options: ['The entire saga rolls back atomically like a DB transaction', 'Compensating transactions run in reverse: release stock → cancel order', 'The saga retries the payment indefinitely', 'Steps 1 and 2 are left as-is, the order is marked as failed'], correct: 1, explanation: 'Saga runs compensating transactions in reverse order: step 2 compensated (release reservation), step 1 compensated (cancel order). No global rollback — each is a local business operation.' },
        { type: 'fill_blank', question: 'Saga steps must be ________ — executing the same step multiple times with the same inputs produces the same result.', answer: 'idempotent', explanation: 'Retries happen on network failures. If ReserveStock is called twice for the same order, it should reserve stock once — not twice.' }
      ]
    },
    {
      title: 'Service Mesh', slug: 'service-mesh', order: 5,
      summary: 'A service mesh manages service-to-service communication in microservices by injecting a sidecar proxy (Envoy) alongside each service. The mesh handles: mutual TLS (encryption), load balancing, circuit breaking, retries, timeouts, distributed tracing, and traffic routing — without any code changes to services. The control plane (Istio) configures all proxies centrally. Services just call each other; the mesh handles the rest.',
      analogy: 'A service mesh is like a company\'s IT department managing all office networking. Individual employees (services) just plug into the network and make calls. IT (the mesh) handles routing, security (VPN, encryption), monitoring (who called whom, how long), and access control (can Marketing call Finance directly?) — without each employee managing their own networking.',
      diagram: `
  Without Service Mesh:         With Service Mesh (Istio + Envoy):

  ServiceA ────HTTP────▶ ServiceB    ServiceA ──▶ [Envoy proxy]
  (manually handles:                               │ mTLS
   - retries                                       ▼
   - circuit breaking              [Envoy proxy] ──▶ ServiceB
   - timeouts
   - tracing)                  Control Plane (Istio):
                               - configure all proxies centrally
                               - TLS cert management
                               - traffic routing rules
                               - observability data collection`,
      diagramSteps: [
        { step: 1, title: 'Sidecar proxy injection', description: 'Kubernetes injects an Envoy sidecar proxy into each pod automatically. All traffic in/out of the pod flows through Envoy. Service code is unchanged.', diagram: 'Pod: [ServiceA container] + [Envoy sidecar]. All traffic: ServiceA → Envoy → network → Envoy → ServiceB.' },
        { step: 2, title: 'Mutual TLS (mTLS)', description: 'Envoy automatically encrypts all service-to-service traffic and verifies service identity via certificates. Zero-trust: every service call is authenticated.', diagram: 'ServiceA → Envoy(cert:serviceA) ←mTLS→ Envoy(cert:serviceB) → ServiceB. No code changes.' },
        { step: 3, title: 'Traffic management', description: 'Control plane configures: canary (5% to v2), retries (3 retries on 503), timeouts (5s), circuit breaking (50% error rate) — all via config, no code.', diagram: 'Istio VirtualService: route 95% to v1, 5% to v2. Retry: 3x on 5xx. Timeout: 5s. All in YAML config.' },
        { step: 4, title: 'Observability from mesh', description: 'Envoy emits metrics and traces for every service call automatically. Grafana dashboards show service topology, error rates, and latency without any instrumentation code.', diagram: 'Every call: Envoy emits latency, status code, bytes to Prometheus. Jaeger receives traces. Zero code changes.' }
      ],
      tradeoffs: [
        { title: 'Service Mesh vs Library-based (Netflix OSS)', optionA: 'Service Mesh: language-agnostic, no code changes, infrastructure concern, adds sidecar overhead', optionB: 'Library (Hystrix, Resilience4j): code-level control, no sidecar overhead, language-specific', recommendation: 'Service mesh for polyglot microservices or teams with many services. Library for homogeneous language stacks with few services.', reasoning: 'Service mesh shines when you have 50+ services in multiple languages. For 5 Java services, a library is simpler.' }
      ],
      whenToUse: [
        { scenario: 'Polyglot microservices (Go, Python, Java, Node.js)', reason: 'Service mesh handles resilience and observability regardless of language — no per-language library needed' }
      ],
      whenNotToUse: [
        { scenario: 'Simple applications with few services', reason: 'Istio and Envoy add operational complexity (CRDs, control plane, cert management) not justified for 3-5 services' }
      ],
      keyPoints: ['Sidecar proxy (Envoy) handles all networking concerns without code changes', 'mTLS: automatic encryption and authentication between all services', 'Traffic management via config: canary, retries, timeouts, circuit breaking', 'Observability: automatic metrics and traces for all service calls', 'Istio is the most popular control plane; Linkerd is a simpler alternative'],
      quiz: [
        { type: 'multiple_choice', question: 'What is the key advantage of a service mesh over library-based resilience patterns?', options: ['It is faster than libraries', 'It is language-agnostic — works for any service without code changes', 'It eliminates the need for load balancers', 'It uses less memory than libraries'], correct: 1, explanation: 'Libraries (Hystrix, Resilience4j) are language-specific. A service mesh works for any language — the sidecar proxy handles retries, circuit breaking, and tracing without touching service code.' },
        { type: 'fill_blank', question: 'A service mesh injects a ________ proxy alongside each service, intercepting all inbound and outbound traffic.', answer: 'sidecar', explanation: 'Envoy runs as a sidecar container in the same pod as the service. All traffic flows through Envoy, which enforces policies and collects telemetry.' }
      ]
    },
    {
      title: 'Domain-Driven Design', slug: 'domain-driven-design', order: 6,
      summary: 'Domain-Driven Design (DDD) is a software development approach that centers design around the business domain. Key concepts: Ubiquitous Language (shared vocabulary between engineers and domain experts), Bounded Contexts (clear boundaries where a model applies), Aggregates (consistency boundaries), Entities and Value Objects, and Domain Events. DDD maps directly to microservice boundaries — each bounded context becomes a service.',
      analogy: 'A hospital has different departments: Billing, Patient Care, Pharmacy. Each uses the word "patient" differently — Billing means an account with insurance info, Patient Care means a person with medical history, Pharmacy means a medication recipient. DDD says: that\'s fine — each department (bounded context) has its own model of "patient." They share an ID to correlate, not a shared database.',
      diagram: `
  E-commerce DDD Bounded Contexts:

  ┌──────────────────┐    ┌──────────────────┐
  │   ORDER CONTEXT  │    │  CATALOG CONTEXT │
  │                  │    │                  │
  │ Order            │    │ Product          │
  │  - orderId       │    │  - productId     │
  │  - items         │    │  - name          │
  │  - status        │    │  - description   │
  │  - customerId    │    │  - price         │
  │                  │    │  - inventory     │
  │ "Product" here = │    │                  │
  │  productId +     │    │ Full product     │
  │  price snapshot  │    │ model lives here │
  └──────────────────┘    └──────────────────┘

  Integration via: shared IDs + domain events
  NOT via: shared database tables`,
      diagramSteps: [
        { step: 1, title: 'Ubiquitous Language', description: 'Engineers and domain experts use the same terms in code, conversations, and documentation. No translation layer. "Order" in code = "Order" on the whiteboard = "Order" in stakeholder meeting.', diagram: 'Bad: code has "transaction" but business says "order". Good: both say "order" — same word, same concept, no confusion.' },
        { step: 2, title: 'Bounded Contexts', description: 'A Bounded Context is a boundary within which a model is consistent and unambiguous. The same word can mean different things in different contexts — that is OK.', diagram: '"Customer" in Sales: potential buyer with lead score. "Customer" in Billing: account with payment info. Different models, same word, different contexts.' },
        { step: 3, title: 'Aggregates', description: 'An Aggregate is a cluster of objects treated as a unit for data changes. Only modified through the Aggregate Root. Enforces consistency boundary — all invariants checked within one aggregate.', diagram: 'Order aggregate: Order (root) + OrderItems. Add item → through Order.addItem() which validates total < $10000.' },
        { step: 4, title: 'Domain Events', description: 'Domain Events record significant business occurrences: OrderPlaced, PaymentProcessed, ItemShipped. They are the interface between bounded contexts. Published after state change, consumed by other contexts.', diagram: 'Order context: OrderPlaced event. Inventory context subscribes → reserves stock. No direct coupling.' }
      ],
      tradeoffs: [
        { title: 'DDD vs Data-Centric Design', optionA: 'DDD: business-aligned, clear boundaries, requires deep domain knowledge, complex initial modeling', optionB: 'Data-centric (ERD-first): familiar, quick start, leads to anemic domain model and big ball of mud', recommendation: 'DDD for complex business domains. Simple CRUD for simple domains.', reasoning: 'DDD overhead is only worth it when the business domain is complex enough that shared-database spaghetti has real consequences.' }
      ],
      whenToUse: [
        { scenario: 'Complex business domains with multiple teams', reason: 'DDD\'s bounded contexts map naturally to microservice and team boundaries' }
      ],
      whenNotToUse: [
        { scenario: 'Simple CRUD applications', reason: 'DDD for a simple blog is enormous overhead for minimal benefit' }
      ],
      keyPoints: ['Ubiquitous Language: same terms in code, conversations, and docs', 'Bounded Context: boundary where one model is consistent — different contexts may have different models', 'Aggregate: consistency boundary, changes through root only', 'Domain Events: integration between bounded contexts without tight coupling', 'Bounded contexts → microservice boundaries — DDD tells you how to split services'],
      quiz: [
        { type: 'multiple_choice', question: 'Why do different Bounded Contexts have different models of the same concept (e.g., "Customer")?', options: ['Engineering teams do not communicate well', 'Each context has different data needs and invariants for that concept', 'It is a mistake that should be fixed with a shared database', 'Performance optimization'], correct: 1, explanation: 'Billing\'s "Customer" needs tax info and payment methods. Shipping\'s "Customer" needs address and delivery preferences. Forcing one model to satisfy both creates a bloated, compromised design.' },
        { type: 'fill_blank', question: 'In DDD, an ________ is a cluster of domain objects treated as a unit, modified only through the aggregate root.', answer: 'Aggregate', explanation: 'The Aggregate Root enforces all business invariants. Nothing outside can directly modify child entities — all changes go through the root, ensuring consistency.' }
      ]
    },
    {
      title: 'Strangler Fig & Migration Patterns', slug: 'strangler-fig-migration', order: 7,
      summary: 'The Strangler Fig pattern incrementally migrates a legacy monolith to microservices by routing specific features to new services while the old system continues running. Named after the strangler fig tree that grows around and eventually replaces a host tree. The key: never big-bang rewrite (projects almost always fail). Extract one capability at a time, always keep the old system available as fallback.',
      analogy: 'Renovating a house while living in it. You do not demolish the entire house and camp outside for a year. You renovate room by room. Kitchen first: build the new kitchen, test it, move in, then demolish the old kitchen corner. Live in the house throughout. The big-bang rewrite is like demolishing the whole house at once: no shelter during construction, and construction always takes 3x longer than expected.',
      diagram: `
  Phase 1: Monolith serves everything
  [Users] → [Monolith] → [Monolith DB]

  Phase 2: Extract UserService, route via proxy
  [Users] → [API Gateway/Proxy]
             ├─ /api/users ──▶ [UserService (new)] → [User DB]
             └─ everything else ──▶ [Monolith] → [Monolith DB]

  Phase 3: Extract PaymentService
  [Users] → [API Gateway/Proxy]
             ├─ /api/users ──▶ [UserService]
             ├─ /api/payments ──▶ [PaymentService]
             └─ everything else ──▶ [Monolith]

  Phase N: Monolith fully strangled, decommissioned`,
      diagramSteps: [
        { step: 1, title: 'Identify extraction candidates', description: 'Start with the capability that is: most painful in the monolith, has clear boundaries, and has a well-understood domain. UserService or PaymentService, not the core order processing.', diagram: 'Candidate: UserService (authentication and profiles) — clear domain, high change frequency, PCI isolation needed.' },
        { step: 2, title: 'Build new service alongside monolith', description: 'Build the new service with its own database. Do not touch the monolith yet. Test in isolation.', diagram: 'New UserService deployed, tested with stub data. Monolith unchanged. Zero user impact.' },
        { step: 3, title: 'Route traffic via proxy', description: 'Add API Gateway routing rule: /api/users → UserService. Everything else → Monolith. Users notice no change. Fallback: remove routing rule to revert instantly.', diagram: 'API GW rule: path=/api/users → UserService. Other paths → Monolith. Gradual traffic migration with canary.' },
        { step: 4, title: 'Data migration', description: 'Migrate data from monolith DB to UserService DB. Use dual-write: write to both during migration. Verify parity. Switch reads to new DB. Stop writing to old.', diagram: 'Dual write: write user to MonolithDB AND UserDB. Verify counts match. Switch reads. Drain old writes. Done.' }
      ],
      tradeoffs: [
        { title: 'Strangler Fig vs Big-Bang Rewrite', optionA: 'Strangler Fig: low risk, always rollback-able, slow, monolith lives longer', optionB: 'Big-Bang Rewrite: faster end state in theory, very high risk (rewrites almost always fail or take 3x longer)', recommendation: 'Always use Strangler Fig. Big-bang rewrites have an 80%+ failure rate for large systems.', reasoning: '"We will rewrite it in 6 months" almost never happens. Systems are always more complex than they appear. Strangler Fig de-risks the migration.' }
      ],
      whenToUse: [
        { scenario: 'Migrating a legacy monolith to microservices', reason: 'Incremental extraction keeps the business running and provides rollback at every step' }
      ],
      whenNotToUse: [
        { scenario: 'Greenfield projects', reason: 'Strangler Fig is a migration pattern. Start fresh systems with the right architecture from the beginning.' }
      ],
      keyPoints: ['Never big-bang rewrite — the strangler fig pattern de-risks migration', 'Extract one capability at a time — keep the monolith as the fallback', 'Use a proxy/API Gateway to route traffic between old and new without client changes', 'Dual-write during data migration to verify parity before switching', 'The monolith shrinks gradually until it can be decommissioned'],
      quiz: [
        { type: 'multiple_choice', question: 'Why is the big-bang rewrite approach risky?', options: ['It is too expensive', 'Systems are always more complex than anticipated, and the new system must replicate all behavior before going live — which takes far longer than expected', 'Users prefer the old system', 'It requires too many engineers'], correct: 1, explanation: 'Big-bang rewrites require feature parity before launch. Undocumented behaviors, edge cases, and integrations inevitably delay launch by months or years. Strangler Fig avoids this by going live incrementally.' },
        { type: 'fill_blank', question: 'During Strangler Fig data migration, ________ -write to both old and new databases until verified parity, then switch reads to the new database.', answer: 'dual', explanation: 'Dual-write ensures the new database receives all data during the migration period. You can verify row counts and data integrity before switching reads — safe, reversible migration.' }
      ]
    },
    {
      title: 'API Design Principles', slug: 'api-design-principles', order: 8,
      summary: 'Great API design is a force multiplier: a well-designed API is easy to learn, hard to misuse, and rarely needs breaking changes. Principles: use nouns not verbs in URLs, be consistent, version from day one, return meaningful errors, paginate all lists, design for evolvability (additive changes), and document automatically. Bad API design creates permanent technical debt that is almost impossible to fix without breaking clients.',
      analogy: 'API design is like designing a public road system. Once built and in use, you cannot arbitrarily move intersections or change which side of the road people drive on — too many people depend on the current behavior. Design carefully upfront, allow for expansion (new roads), but never break existing paths. Clear signage (documentation) prevents wrong turns.',
      diagram: `
  Bad API Design:                Good API Design:
  POST /createUser               POST /users
  GET /getUser?id=123            GET /users/{id}
  POST /deleteUser               DELETE /users/{id}
  GET /getAllUserOrders           GET /users/{id}/orders?cursor=abc&limit=20

  Bad Error:                     Good Error:
  { "error": true }              HTTP 422
                                 {
                                   "error": "VALIDATION_FAILED",
                                   "message": "Email already exists",
                                   "field": "email",
                                   "code": "EMAIL_DUPLICATE"
                                 }

  Bad Pagination:                Good Pagination:
  GET /orders (returns all!)     GET /orders?cursor=token&limit=20
  Response: [... 100k items]     Response: {
                                   "items": [...20 items],
                                   "nextCursor": "abc123",
                                   "hasMore": true
                                 }`,
      diagramSteps: [
        { step: 1, title: 'Resource naming and HTTP verbs', description: 'URLs are nouns (resources), HTTP verbs are actions. Collections plural (/users), items singular with ID (/users/123). Nested for relationships (/users/123/orders).', diagram: 'GET /articles — list. POST /articles — create. GET /articles/5 — get. PUT /articles/5 — replace. DELETE /articles/5 — delete.' },
        { step: 2, title: 'Pagination', description: 'Never return unbounded lists. Cursor-based pagination for large/live datasets (stable, handles insertions). Offset for simple cases. Always include has_more and next_cursor.', diagram: 'GET /orders?limit=20&cursor=eyJpZCI6MTAwfQ== → {items:[...], nextCursor:"eyJpZCI6MTIwfQ==", hasMore:true}' },
        { step: 3, title: 'Error design', description: 'Errors must be actionable. Include: HTTP status code, machine-readable error code, human-readable message, field if validation error. Never expose stack traces.', diagram: 'HTTP 422: {error:"VALIDATION_FAILED", message:"Email already registered", field:"email", requestId:"abc"}' },
        { step: 4, title: 'Versioning and evolution', description: 'Version from day one (/v1/). Additive changes are non-breaking. Breaking changes need a new version. Deprecate with Sunset header and at least 6 months notice.', diagram: '/api/v1/users (stable). /api/v2/users (new format). Both live simultaneously. v1 Sunset: 2025-06-01 header.' }
      ],
      tradeoffs: [
        { title: 'Strict vs Tolerant REST', optionA: 'Strict: exact HTTP semantics, proper status codes, disciplined — harder to implement initially', optionB: 'Tolerant: everything is POST + 200 — simple to implement, clients cannot use HTTP tooling effectively', recommendation: 'Always strict. The discipline pays for itself in client usability and tooling compatibility.', reasoning: 'Returning 200 for errors breaks HTTP caching, monitoring, and client retry logic. Correctness matters.' }
      ],
      whenToUse: [
        { scenario: 'Designing any API that external developers or teams will consume', reason: 'Bad API design is permanent — you cannot easily fix it without breaking existing clients' }
      ],
      whenNotToUse: [
        { scenario: 'Internal single-consumer APIs with tight coupling acceptable', reason: 'When caller and callee deploy together as one unit, some design shortcuts are acceptable' }
      ],
      keyPoints: ['URLs are nouns, HTTP verbs are actions — never /createUser', 'Paginate all list endpoints — never return unbounded collections', 'Errors must be machine-readable (error code) and human-readable (message)', 'Version from day one — additive changes only without version bump', 'Design for clients to ignore unknown fields (forward compatibility)'],
      quiz: [
        { type: 'multiple_choice', question: 'A client receives a 200 OK response with {"success": false, "error": "not found"}. What is wrong?', options: ['Nothing — 200 is always correct', 'The status code should be 404 Not Found — 200 breaks HTTP caching and monitoring', 'The response body format is incorrect', 'The error message should be in a header'], correct: 1, explanation: 'HTTP status codes have semantic meaning. 404 tells clients, proxies, and monitors that the resource was not found. 200 with error in body breaks all HTTP tooling that relies on status codes.' },
        { type: 'fill_blank', question: 'Cursor-based pagination uses an opaque ________ from the previous response to fetch the next page, avoiding issues with insertions or deletions.', answer: 'cursor', explanation: 'Unlike offset (which shifts when items are inserted), a cursor points to a specific item. Insertions before that item do not change the cursor\'s position.' }
      ]
    }
  ];

  for (const lesson of t7lessons) {
    await prisma.designLesson.upsert({
      where: { slug: lesson.slug },
      update: {},
      create: {
        ...lesson,
        trackId: t7.id,
        diagramSteps: JSON.stringify(lesson.diagramSteps),
        tradeoffs: JSON.stringify(lesson.tradeoffs),
        whenToUse: JSON.stringify(lesson.whenToUse),
        whenNotToUse: JSON.stringify(lesson.whenNotToUse),
        keyPoints: JSON.stringify(lesson.keyPoints),
        quiz: JSON.stringify(lesson.quiz)
      }
    });
  }
  console.log('✅ Track 7: Architecture Patterns seeded');

  // ── TRACK 8: ADVANCED SYSTEM DESIGN & INTERVIEW MASTERY ──────────────────
  const t8 = await prisma.designTrack.upsert({
    where: { slug: 'advanced-interview-mastery' },
    update: {},
    create: {
      name: 'Advanced & Interview Mastery', slug: 'advanced-interview-mastery',
      description: 'Multi-region systems, back-of-envelope estimation, real-world design walkthroughs, and the interview framework that gets you offers at FAANG.',
      icon: '🎯', color: '#F59E0B', order: 8, level: 'advanced'
    }
  });

  const t8lessons = [
    {
      title: 'Multi-Region Architecture', slug: 'multi-region-architecture', order: 1,
      summary: 'Multi-region architecture deploys services across geographically separate cloud regions to: reduce latency for global users (serve from nearest region), survive region outages, and meet data sovereignty requirements. Complexity: cross-region data replication, latency between regions (50-150ms RTT), consistency challenges, and higher cost. Patterns: active-active (all regions serve traffic), active-passive (one primary, others failover only), and follow-the-sun.',
      analogy: 'McDonald\'s does not make all burgers in one factory in Chicago and ship them worldwide. They have restaurants in every city. Each restaurant serves local customers (low latency). If one restaurant burns down (region failure), nearby restaurants handle the extra load. Central corporate (control plane) coordinates menus, pricing, and standards across all locations.',
      diagram: `
  Single Region:
  [All Traffic] → [us-east-1] → [DB]
  Latency: Tokyo users: 200ms+ round trip

  Multi-Region Active-Active:
  [Tokyo users] → [ap-northeast-1] → [DB replica]
                                          ↕ async replication (50-100ms lag)
  [EU users]    → [eu-west-1]     → [DB replica]
                                          ↕
  [US users]    → [us-east-1]     → [DB primary]

  GeoDNS routes each user to nearest region.
  Write: → primary (us-east-1). Read: → local replica.
  Cross-region write: 100-300ms added latency.`,
      diagramSteps: [
        { step: 1, title: 'GeoDNS routing', description: 'DNS returns different IP addresses based on the user\'s geographic location. Tokyo users resolve to ap-northeast-1 IP. EU users resolve to eu-west-1 IP.', diagram: 'user.example.com: Tokyo → 52.68.x.x (ap-northeast-1). London → 52.48.x.x (eu-west-1). NY → 54.x.x.x (us-east-1).' },
        { step: 2, title: 'Data replication strategy', description: 'Async replication keeps regions in sync. Write goes to primary region, propagates to others. Read-after-write in same region: consistent. Cross-region read: may be stale (100ms lag).', diagram: 'Write → us-east-1 primary. Replicate → eu-west-1 (50ms) + ap-northeast-1 (120ms). Reads in EU: stale by 50ms max.' },
        { step: 3, title: 'Region failover', description: 'If us-east-1 (primary) goes down: promote eu-west-1 replica to primary. Update GeoDNS to route US traffic to eu-west-1. Accept higher latency during failover.', diagram: 'us-east-1 down → promote eu-west-1 → GeoDNS update (60 second TTL) → US traffic → eu-west-1 (+80ms latency).' },
        { step: 4, title: 'Data sovereignty and compliance', description: 'GDPR: EU user data must stay in EU. HIPAA: healthcare data in US only. Multi-region allows pinning specific users to specific regions for compliance.', diagram: 'EU users: data written to eu-west-1 only. Never replicated to US. Metadata: user_region=EU. Route EU users always to EU.' }
      ],
      tradeoffs: [
        { title: 'Active-Active vs Active-Passive Multi-Region', optionA: 'Active-Active: low latency for all regions, handles failure automatically, complex consistency (cross-region writes)', optionB: 'Active-Passive: simpler consistency (one writer), failover takes minutes, idle standby cost', recommendation: 'Active-passive for most applications — simpler and handles most failure scenarios. Active-active for global latency-sensitive apps.', reasoning: 'Active-active cross-region writes require distributed transactions or eventual consistency — significant complexity. Active-passive avoids this at the cost of failover time.' }
      ],
      whenToUse: [
        { scenario: 'Global user base with latency requirements', reason: 'Serving Tokyo users from us-east-1 adds 200ms+ round-trip. A local region reduces this to < 20ms.' },
        { scenario: 'Regulatory compliance requiring data residency', reason: 'GDPR, HIPAA, and similar regulations require data to stay in specific geographic regions' }
      ],
      whenNotToUse: [
        { scenario: 'Applications with only one geographic user base', reason: 'Multi-region complexity and cost not justified when all users are in one region' }
      ],
      keyPoints: ['GeoDNS routes users to nearest region based on IP location', 'Async cross-region replication adds 50-150ms lag — reads may be stale', 'Active-active: all regions serve traffic. Active-passive: one primary, others on standby.', 'Cross-region write latency (100-300ms) limits write-heavy workloads', 'Data sovereignty: GDPR requires EU data to stay in EU — multi-region enables compliance'],
      quiz: [
        { type: 'multiple_choice', question: 'A user in Tokyo writes data and immediately reads it back. In an active-active multi-region setup with writes going to us-east-1, what may happen?', options: ['The read always returns the latest data', 'The read may return stale data due to replication lag (50-150ms)', 'The write fails because Tokyo is not the primary', 'The read is redirected to us-east-1'], correct: 1, explanation: 'Async replication means the Tokyo replica may not have received the write yet. The user might read from the Tokyo replica and see stale data. Solution: route the user\'s reads to us-east-1 for that session (read-your-writes consistency).' },
        { type: 'fill_blank', question: '________ routes users to the geographically nearest region by returning different IP addresses based on the user\'s location.', answer: 'GeoDNS', explanation: 'GeoDNS (geographic DNS) is the entry point for multi-region routing. Users resolve to their nearest region\'s IP automatically.' }
      ]
    },
    {
      title: 'Back-of-Envelope Estimation', slug: 'back-of-envelope-estimation', order: 2,
      summary: 'Back-of-envelope (BOE) estimation answers "how big must this system be?" before designing it. Estimate: users, requests per second, data size, storage, bandwidth. Use powers of 2 and latency numbers every engineer should know. BOE is a required skill in system design interviews — it drives architecture decisions (do you need sharding? caching? how many servers?). Precision is not the goal — order of magnitude is.',
      analogy: 'A chef estimating how much food to prepare for a 1000-person event. They do not need to know the exact number — they need to know if it\'s closer to 100 people or 10,000. That difference changes everything: one commercial oven vs 50 ovens. Same with system design: 1K vs 1M vs 1B users requires fundamentally different architectures.',
      diagram: `
  Useful Numbers (memorize these):

  Powers of 2:
  2^10 = 1 KB    2^20 = 1 MB    2^30 = 1 GB    2^40 = 1 TB

  Latency:
  L1 cache:       0.5 ns    Memory:          100 ns
  SSD read:       100 μs    HDD:             10 ms
  Same DC network: 0.5 ms   Cross-continent: 150 ms

  Common Conversions:
  1 day   = 86,400 seconds   ≈ 10^5 seconds
  1 month = 2.5M seconds     ≈ 2.5 × 10^6 seconds
  1 year  = 31.5M seconds    ≈ π × 10^7 seconds

  Example: Twitter
  300M active users × 20 tweets/day = 6B tweets/day
  6B / 86,400 = ~70,000 TPS (tweet reads)
  Each tweet = 280 chars ≈ 300 bytes
  70,000 × 300 bytes = 21 MB/s bandwidth`,
      diagramSteps: [
        { step: 1, title: 'Clarify scale assumptions', description: 'Ask: daily active users (DAU), read/write ratio, geographic distribution, peak-to-average ratio (3x is common). Write these down before calculating anything.', diagram: 'DAU: 100M. Reads per user per day: 50. Writes per user per day: 2. Peak: 3x average. Read:Write = 25:1.' },
        { step: 2, title: 'Calculate QPS', description: 'QPS = DAU × requests_per_day / 86,400. Peak QPS = Average QPS × peak_factor. 100M × 52 / 86,400 = 60,000 QPS average. 180,000 QPS peak.', diagram: 'Read QPS: 100M × 50 / 86,400 = 57,870 ≈ 60,000. Write QPS: 100M × 2 / 86,400 = 2,315 ≈ 2,500. Peak: × 3.' },
        { step: 3, title: 'Calculate storage', description: 'Storage per record × records = total. Growth rate determines when you need more. For Twitter: 70B tweets/year × 300 bytes = 21 TB/year raw tweet data.', diagram: 'Tweet: 300 bytes. Photos: 200 KB avg, 20% of tweets. 70B × 0.2 × 200KB = 2.8 PB/year photos. Total: ~3 PB/year.' },
        { step: 4, title: 'Determine architecture from numbers', description: 'QPS < 1000: single server. QPS 1K-100K: load balancer + multiple servers. QPS > 100K: sharding, caching, CDN needed. Storage > 1TB: sharding or object storage.', diagram: '60K read QPS → 20-30 app servers (2K req/server/s). 21 TB/year storage → object storage + DB sharding. 21 MB/s → CDN + caching.' }
      ],
      tradeoffs: [
        { title: 'Precision vs Speed in Estimation', optionA: 'High precision: spend 20 minutes getting exact numbers, analysis paralysis risk', optionB: 'Order-of-magnitude: spend 2-3 minutes, get within 10x, immediately inform architecture', recommendation: 'Order-of-magnitude is always sufficient. The question is "do I need sharding or not?" — 10x accuracy answers this.', reasoning: 'A system handling 1M RPS and one handling 10M RPS both need sharding. The order of magnitude drives the decision, not the exact number.' }
      ],
      whenToUse: [
        { scenario: 'System design interview — always do BOE before designing', reason: 'Numbers drive architecture. Design without estimates is uninformed guess-work.' },
        { scenario: 'Before any major infrastructure investment', reason: 'Estimate load before buying servers or signing contracts' }
      ],
      whenNotToUse: [
        { scenario: 'Production capacity planning', reason: 'For actual production, use detailed load testing and real metrics, not rough estimates' }
      ],
      keyPoints: ['1 day = 86,400 seconds. 1 month ≈ 2.5M seconds.', 'QPS = DAU × requests_per_user / 86,400. Peak = average × 3.', 'Memory access ~100ns. Same DC network ~0.5ms. Cross-continent ~150ms.', 'Estimate to nearest order of magnitude — precision is not the goal', 'Numbers drive decisions: do you need sharding? caching? how many servers?'],
      quiz: [
        { type: 'multiple_choice', question: 'A system has 10M DAU, each making 100 requests per day. What is the average QPS?', options: ['~1,000 QPS', '~11,600 QPS', '~1M QPS', '~100K QPS'], correct: 1, explanation: '10M users × 100 req/day = 1B requests/day. 1B / 86,400 = ~11,574 QPS ≈ 11,600 QPS. At 3x peak: ~35K QPS.' },
        { type: 'fill_blank', question: 'Peak QPS is typically ________ times the average QPS to account for traffic spikes during peak hours.', answer: '3', explanation: 'Traffic is not uniform throughout the day. A 3x peak factor is a standard assumption for most consumer applications. Some events (Black Friday) may be 10x+.' }
      ]
    },
    {
      title: 'Designing a URL Shortener', slug: 'design-url-shortener', order: 3,
      summary: 'URL shortener (bit.ly, TinyURL) is a classic interview question that covers: hash function design, read-heavy scaling, database choice, caching, and analytics. Core operation: take a long URL → generate a short 7-character code → store mapping → redirect on access. Read:Write ratio is roughly 100:1. Main challenges: unique key generation at scale, avoiding collisions, and low-latency redirects.',
      analogy: 'A URL shortener is like a valet parking ticket system. You give your car (long URL) to the valet, they give you a numbered ticket (short code). When you return the ticket, they fetch your car. The ticket is meaningless without the valet\'s ledger (database) mapping ticket → car. Multiple valets (servers) share the same ledger.',
      diagram: `
  Write flow (shortenURL):
  Client → POST /api/shorten {url: "https://very-long-url.com/..."}
         → Validate URL
         → Generate 7-char code (hash or counter)
         → Check DB for collision
         → Store {code → url, created_at, user_id}
         → Return {shortUrl: "https://sho.rt/abc1234"}

  Read flow (redirect) — 100x more frequent:
  Client → GET /abc1234
         → Cache lookup (Redis): abc1234 → url? HIT → 301 redirect (< 1ms)
         → MISS → DB lookup → cache set(TTL=24h) → 301 redirect
         → Log analytics event (async, Kafka)

  Scale estimates:
  100M URLs shortened → 100M × 500 bytes = 50 GB (fits in one DB)
  1B redirects/day = 11,600 RPS reads (cache-heavy)`,
      diagramSteps: [
        { step: 1, title: 'Short code generation', description: 'Options: MD5 hash (take first 7 chars — collision risk), counter-based (auto-increment, encode to base62), or random (UUID, check collisions). Base62 = [a-z, A-Z, 0-9] → 62^7 = 3.5 trillion unique codes.', diagram: 'Base62 counter: ID=12345 → encode → "dnh" (3 chars). 7 chars → 62^7 = 3.5T URLs. Counter in DB or distributed counter (Snowflake ID).' },
        { step: 2, title: 'Database choice', description: '50GB total data (100M URLs × 500 bytes) fits comfortably in a single PostgreSQL instance. Use read replicas for the 100:1 read ratio. Cache hot redirects in Redis.', diagram: 'DB: PostgreSQL. Table: (code VARCHAR(7) PK, long_url TEXT, created_at, user_id). Index: code. Read replicas: 3.' },
        { step: 3, title: 'Caching for redirects', description: '80% of redirects are to the same 20% of URLs (Pareto). Cache popular short codes in Redis with 24h TTL. Cache hit rate 90%+ → DB sees only 10% of read traffic.', diagram: 'Redis: hash map {abc1234 → https://...}. TTL: 24h. Hit rate: 90%. DB load: 1,160 RPS (not 11,600). Latency: <1ms.' },
        { step: 4, title: 'Analytics', description: 'On each redirect, asynchronously publish to Kafka: {code, timestamp, user_agent, referrer, country}. Analytics service consumes and writes to data warehouse. Does not block the redirect.', diagram: 'GET /abc1234 → redirect (fast) + async Kafka.publish(event). Analytics processes: clicks/hour, top referrers, country map.' }
      ],
      tradeoffs: [
        { title: 'Hash-based vs Counter-based code generation', optionA: 'Hash (MD5/SHA): no coordination needed, collision risk, must check DB before accepting', optionB: 'Counter-based: no collisions, requires distributed counter (Snowflake), deterministic', recommendation: 'Counter-based with Snowflake IDs for production. Hash-based is simpler but has collision overhead.', reasoning: 'Hash-based requires a DB lookup on every write to check for collisions. Counter-based generates unique codes without lookup.' }
      ],
      whenToUse: [{ scenario: 'This is an interview question — practice the walkthrough', reason: 'URL shortener is asked at FAANG. Master the end-to-end walkthrough.' }],
      whenNotToUse: [{ scenario: 'Not applicable — this is a design walkthrough', reason: 'Understand the patterns: read-heavy caching, code generation, analytics separation' }],
      keyPoints: ['Base62 with 7 chars = 3.5 trillion unique codes — sufficient for decades', 'Cache hot redirects in Redis — 90%+ hit rate dramatically reduces DB load', 'Use 301 (permanent) for better caching vs 302 (temporary) for better analytics', 'Analytics decoupled from redirect flow via Kafka — redirect is never slowed by analytics', 'Read:Write = 100:1 — optimize reads first'],
      quiz: [
        { type: 'multiple_choice', question: 'A URL shortener returns a 301 Permanent Redirect. What is the implication?', options: ['The redirect is faster', 'Browsers and CDNs cache the redirect, reducing future requests to the server', 'The short URL can be reused', 'The user sees a warning before redirecting'], correct: 1, explanation: '301 tells browsers to cache the redirect indefinitely. Future clicks go directly to the destination without hitting our servers. Less load, but we lose analytics for cached redirects. 302 Temporary forces every click through our server — better analytics, more load.' },
        { type: 'fill_blank', question: 'Base62 encoding uses characters [a-z, A-Z, 0-9] = 62 characters. A 7-character code supports ________ unique URLs.', answer: '3.5 trillion', explanation: '62^7 = 3,521,614,606,208 ≈ 3.5 trillion. At 100M new URLs/year, this lasts 35,000 years. More than sufficient.' }
      ]
    },
    {
      title: 'Designing a News Feed System', slug: 'design-news-feed', order: 4,
      summary: 'A social news feed (Twitter/Facebook timeline) is one of the most common system design interview questions. Core challenge: fan-out on write vs fan-out on read. Fan-out on write: when a user posts, push to all followers\' feeds (precompute). Fan-out on read: fetch all followed users\' posts and merge at read time. Celebrities (10M followers) make fan-out on write expensive — hybrid approach required.',
      analogy: 'Two newspaper delivery models: Push model (fan-out on write): the printer delivers a copy to every subscriber\'s mailbox when the paper is printed. Fast for readers, but delivering 10M copies for one edition takes hours. Pull model (fan-out on read): subscribers go to the newsstand each morning and pick up the paper. Fast for publishers, but slow for readers (traveling to newsstand). Hybrid: pre-deliver to most subscribers, let VIP subscribers pick up themselves.',
      diagram: `
  Fan-out on Write (push model):
  Alice (10M followers) posts tweet
  → write tweet to tweet DB
  → add tweet_id to 10M followers' feed cache
  → 10M Redis ZADD operations (slow, expensive)
  Reader gets feed: Redis ZRANGE (instant)

  Fan-out on Read (pull model):
  Alice posts: write to tweet DB only
  Reader gets feed:
  → find all followed users (Alice, Bob, Carol: 3 users)
  → fetch latest tweets from each (3 DB queries)
  → merge sort by timestamp
  → slow for users following 1000 people

  Hybrid (Twitter's approach):
  Regular users (< 1M followers): fan-out on write
  Celebrities (> 1M followers): fan-out on read
  Reader: merge pre-built feed (regular) + celebrity tweets (on read)`,
      diagramSteps: [
        { step: 1, title: 'Data model', description: 'Users table, Tweets table, Follows table, Feed table (precomputed). Feed table: (user_id, tweet_id, author_id, timestamp) — sorted for timeline display.', diagram: 'Tweets(id, author_id, content, created_at). Follows(follower_id, followed_id). Feed(user_id, tweet_id, score) in Redis ZADD.' },
        { step: 2, title: 'Write path', description: 'User posts tweet → write to Tweets DB → fan-out service reads followers → for each follower: add tweet_id to their Redis feed (ZADD). Async via Kafka for non-blocking.', diagram: 'Tweet → DB → Kafka "new_tweet" → Fan-out consumer → ZADD feed:{user_id} tweet_id score=timestamp' },
        { step: 3, title: 'Read path', description: 'User opens feed → Redis ZRANGE feed:{user_id} 0 20 → get 20 tweet IDs → batch fetch tweet content from Tweets DB or cache → return to user.', diagram: 'GET feed → Redis: [tweet_id_1, ..., tweet_id_20] → batch GET tweets cache → render feed (< 100ms)' },
        { step: 4, title: 'Handling celebrities', description: 'Celebrities with >1M followers are not fan-out-on-write (too slow). Reader fetches celebrities separately at read time and merges with pre-built feed.', diagram: 'Read: prebuilt feed (Redis) + celebrity tweets (DB, < 10 celebrities followed) → merge sort → feed. < 200ms total.' }
      ],
      tradeoffs: [
        { title: 'Fan-out on Write vs Read', optionA: 'Fan-out on Write (push): instant feed reads, high write amplification, celebrity problem', optionB: 'Fan-out on Read (pull): low write cost, slow reads for users following many people', recommendation: 'Hybrid: fan-out on write for regular users, fan-out on read for celebrities.', reasoning: 'Twitter uses exactly this hybrid. Write amplification for 1 billion regular users is manageable. Write amplification for 150M Katy Perry followers is not.' }
      ],
      whenToUse: [{ scenario: 'Interview question — understand the trade-offs deeply', reason: 'News feed is asked at every major tech company. Master the hybrid approach.' }],
      whenNotToUse: [{ scenario: 'Not applicable', reason: 'This is a canonical design problem' }],
      keyPoints: ['Fan-out on write: precompute feeds at write time. Fast reads, expensive for celebrities.', 'Fan-out on read: compute feed at read time. Slow for users following many people.', 'Hybrid: fan-out on write for regular users, fan-out on read for celebrities (> 1M followers)', 'Feed stored as sorted set in Redis (ZADD with timestamp score)', 'Pagination via cursor (last seen tweet_id), not offset'],
      quiz: [
        { type: 'multiple_choice', question: 'Elon Musk has 150M followers. Why is fan-out on write problematic for his tweets?', options: ['His tweets are too long', 'Writing to 150M followers\' feeds on every tweet creates massive write amplification and latency', 'Fan-out on write does not support many followers', 'Redis cannot handle 150M keys'], correct: 1, explanation: 'Each tweet would trigger 150M Redis writes. Even at 1ms each, that\'s 150,000 seconds of work. Impossible synchronously. Twitter uses fan-out on read for celebrities above a follower threshold.' },
        { type: 'fill_blank', question: 'Twitter\'s news feed uses a ________ approach: fan-out on write for regular users and fan-out on read for celebrities with millions of followers.', answer: 'hybrid', explanation: 'Pure fan-out on write breaks for celebrities. Pure fan-out on read is slow for users following thousands of accounts. The hybrid handles both extremes efficiently.' }
      ]
    },
    {
      title: 'Designing a Chat System', slug: 'design-chat-system', order: 5,
      summary: 'A real-time chat system (WhatsApp, Slack) requires bidirectional messaging, presence detection, message delivery guarantees, message history, and multi-device support. Core decisions: WebSocket for real-time delivery, message delivery receipts (sent/delivered/read), offline message queuing, consistent message ordering, and end-to-end encryption design. Scale challenge: maintaining millions of long-lived WebSocket connections.',
      analogy: 'Chat is like a telephone switchboard. When Alice calls Bob, a switchboard operator (message server) patches them through and maintains the connection. If Bob is unavailable (offline), the operator holds the message and delivers it when Bob reconnects. Multiple operators (servers) handle millions of calls simultaneously, but each call is connected to exactly one operator.',
      diagram: `
  Architecture:

  [Alice's App] ──WebSocket──▶ [Chat Server 1]
                                       │
  [Bob's App]   ──WebSocket──▶ [Chat Server 2]
                                       │
                              [Message Router]
                              (which server is Bob on?)
                                       │
                           ┌──────────┼──────────┐
                        [Redis]  [Message DB]  [Kafka]
                      (presence)  (history)   (delivery)

  Message flow: Alice → WS → Server1 → find Bob's server
  (Redis: user_id → server_id) → Server2 → Bob's WS

  Bob offline: → Message DB + push notification (FCM/APNS)`,
      diagramSteps: [
        { step: 1, title: 'WebSocket connection management', description: 'Each connected client holds a WebSocket to a chat server. Server stores user_id → server_id in Redis. Load balancer uses consistent hashing (same user always same server for sticky sessions).', diagram: 'Alice connects → LB → ChatServer1. Redis: alice → server1. Bob connects → server2. Redis: bob → server2.' },
        { step: 2, title: 'Message routing', description: 'Alice sends message to Bob: ChatServer1 looks up Bob\'s server in Redis → publishes to Redis Pub/Sub channel "server2:bob" → ChatServer2 receives → pushes to Bob\'s WebSocket.', diagram: 'Alice → Server1 → Redis pub(server2:bob, msg) → Server2 subscriber → WebSocket → Bob' },
        { step: 3, title: 'Delivery guarantees and receipts', description: 'Messages get IDs and states: SENT (stored in DB), DELIVERED (Bob received on device), READ (Bob opened message). Client ACKs each state transition.', diagram: 'Message states: ● grey = SENT. ●● grey = DELIVERED. ●● blue = READ. Alice sees two blue ticks = Bob read it.' },
        { step: 4, title: 'Offline messages and push notifications', description: 'Bob offline: store message in DB. Send push notification via FCM/APNS. Bob reconnects: fetch undelivered messages from DB since last seen.', diagram: 'Bob offline → store msg in DB → push notification → Bob opens app → fetch messages since last_seen_id' }
      ],
      tradeoffs: [
        { title: 'WebSocket vs HTTP Long Polling', optionA: 'WebSocket: persistent connection, instant delivery, sticky load balancer required, stateful', optionB: 'HTTP Long Polling: works with any infrastructure, higher overhead per message, slightly higher latency', recommendation: 'WebSocket for chat — instant delivery is core to the user experience.', reasoning: 'Chat without instant delivery feels broken. WebSocket\'s overhead is justified. WhatsApp, Slack, and Messenger all use WebSocket.' }
      ],
      whenToUse: [{ scenario: 'Interview practice', reason: 'Chat system is asked at Slack, Meta, Google, and many others' }],
      whenNotToUse: [{ scenario: 'Not applicable', reason: 'Understand the WebSocket connection management and routing patterns' }],
      keyPoints: ['WebSocket: persistent bidirectional connection — essential for real-time chat', 'Redis stores user → server mapping for message routing across servers', 'Message states: SENT → DELIVERED → READ with client ACKs', 'Offline users: store in DB + push notification (FCM/APNS)', 'Message ordering: use server-assigned monotonic IDs within a conversation'],
      quiz: [
        { type: 'multiple_choice', question: 'Alice (on Server1) sends a message to Bob (on Server2). How does Server1 deliver to Bob?', options: ['Direct TCP connection between servers', 'Redis Pub/Sub: Server1 publishes to Bob\'s channel, Server2 subscribes and pushes to Bob\'s WebSocket', 'Database polling by Server2', 'DNS lookup for Server2\'s address'], correct: 1, explanation: 'Redis Pub/Sub allows Server1 to publish a message that Server2 (subscribed to that channel) receives instantly and forwards to Bob\'s WebSocket. This is the standard pattern for chat server fanout.' },
        { type: 'fill_blank', question: 'When a user is offline, undelivered messages are stored in the database and a ________ notification is sent via FCM or APNS.', answer: 'push', explanation: 'Push notifications (Firebase Cloud Messaging for Android, Apple Push Notification Service for iOS) wake the app or show a notification even when it\'s not connected.' }
      ]
    },
    {
      title: 'Designing a Rate Limiter', slug: 'design-rate-limiter', order: 6,
      summary: 'A distributed rate limiter enforces API quotas across multiple servers. Local rate limiters (per-server) do not work — a user can hit different servers and exceed limits. Distributed rate limiting uses Redis with atomic operations. Algorithms: Token Bucket (allows bursts), Sliding Window Log (accurate, memory-heavy), Sliding Window Counter (approximation, efficient), Fixed Window Counter (simple, burst at boundaries). Rate limiting at the API Gateway is best.',
      analogy: 'A concert venue capacity check with multiple entrances. A local bouncer at each entrance with separate clicker (local rate limiter) allows 100 people per entrance — the whole venue overflows. Shared electronic turnstile system (Redis) counts all entrances centrally — any entrance that would exceed capacity is blocked, regardless of which entrance the person tries.',
      diagram: `
  Token Bucket Algorithm:
  Capacity: 10 tokens. Refill: 1 token/second.

  t=0:  [●●●●●●●●●●] 10 tokens
  t=0:  3 requests  → [●●●●●●●] 7 tokens    ✓
  t=0:  8 requests  → 7 < 8 → REJECT        ✗ (allows burst)
  t=5:  +5 tokens   → [●●●●●●●●●●●●] 12 capped to 10
  t=5:  10 requests → [          ] 0 tokens  ✓

  Sliding Window Counter (Redis):
  Limit: 100 req/min per user.

  Key: rate:{user_id}:{current_minute}
  INCR → count. If count > 100 → 429.
  Previous minute weight: prev_count × (1 - elapsed/60)
  approx = prev_count × weight + current_count ≤ 100`,
      diagramSteps: [
        { step: 1, title: 'Redis atomic rate limiting', description: 'Use INCR + EXPIRE atomically. INCR returns new count. If count == 1, set EXPIRE. If count > limit, reject. Atomic operation prevents race conditions.', diagram: 'INCR rate:{user}:{minute} → count=45. If count==1: EXPIRE key 60. If 45 > 100: allow. If > 100: 429.' },
        { step: 2, title: 'Sliding window counter', description: 'Approximate sliding window using two fixed windows. current_count + previous_count × weight = estimated requests in last 60 seconds.', diagram: 'Prev minute: 80 req. Elapsed in current minute: 30s. Weight: 0.5. Estimate: 80×0.5 + 45 = 85 ≤ 100 → allow' },
        { step: 3, title: 'Multi-tier rate limiting', description: 'Rate limit at multiple levels: per user/API key (primary), per IP (secondary, for unauthenticated), per endpoint (protect expensive endpoints), globally (protect backend).', diagram: 'User: 100 req/min. IP: 1000 req/min (multiple users). /search: 10 req/min (expensive). Global: 1M req/min.' },
        { step: 4, title: 'Response headers', description: 'Return rate limit headers so clients can self-regulate. X-RateLimit-Limit: 100. X-RateLimit-Remaining: 55. X-RateLimit-Reset: 1716239022 (Unix timestamp). 429 response with Retry-After.', diagram: 'HTTP 429 Too Many Requests. Retry-After: 30. X-RateLimit-Limit: 100. X-RateLimit-Reset: 1716239022.' }
      ],
      tradeoffs: [
        { title: 'Token Bucket vs Sliding Window', optionA: 'Token Bucket: allows bursts (good for bursty but fair traffic), simple, memory-efficient', optionB: 'Sliding Window Log: exact, memory-heavy (log per request), accurate for audit', recommendation: 'Token Bucket or Sliding Window Counter for production. Sliding Window Log only when exact audit is needed.', reasoning: 'Storing every request timestamp (sliding window log) uses O(requests) memory. Token Bucket is O(1) per user.' }
      ],
      whenToUse: [{ scenario: 'All public API endpoints', reason: 'Without rate limiting, a single misbehaving client can starve all other clients' }],
      whenNotToUse: [{ scenario: 'Internal trusted service calls', reason: 'Rate limiting adds latency. Internal services with controlled call patterns do not need it.' }],
      keyPoints: ['Distributed rate limiting uses Redis atomic operations — not per-server counters', 'Token Bucket: allows controlled bursts. Sliding Window: more accurate.', 'Rate limit at API Gateway — centralized, not per microservice', 'Return X-RateLimit-* headers so clients can self-regulate', 'HTTP 429 Too Many Requests with Retry-After header on rejection'],
      quiz: [
        { type: 'multiple_choice', question: 'Why does per-server rate limiting fail in a distributed system?', options: ['Servers cannot run fast enough', 'A user can distribute requests across multiple servers, exceeding the per-server limit on each while exceeding the global limit in total', 'Rate limiting requires a single server', 'Servers do not share memory'], correct: 1, explanation: 'With 10 servers each allowing 100 req/min, a client rotating through all 10 can make 1000 req/min. Shared Redis counter enforces the global limit regardless of which server the request hits.' },
        { type: 'fill_blank', question: 'Redis ________ is used for rate limit counters because it atomically increments a value and returns the new count in a single operation.', answer: 'INCR', explanation: 'INCR is atomic — no two clients can increment simultaneously and both read the same count. This prevents race conditions where two requests both think the count is 99 and both get allowed.' }
      ]
    },
    {
      title: 'System Design Interview Framework', slug: 'system-design-interview-framework', order: 7,
      summary: 'System design interviews are 45-60 minutes of collaborative design with a senior engineer. There is no single correct answer — the interviewer evaluates your thought process, how you handle trade-offs, and how you communicate. The RESHADED framework: Requirements → Estimation → Storage Schema → High-Level Design → APIs → Detailed Design → Evaluate. Spend the most time on Detailed Design and handling edge cases.',
      analogy: 'A system design interview is like a planning session with an architect. You would not start drawing blueprints without knowing how many people will live in the building, what the budget is, and what the zoning laws are. Start by asking questions, then estimate scope, then sketch the high-level plan, then dig into the complex parts.',
      diagram: `
  RESHADED Framework (45-minute interview):

  ┌─────────────────────────────────────────────────┐
  │ R — Requirements    (5 min)                     │
  │   Functional: what the system does              │
  │   Non-functional: scale, latency, consistency   │
  ├─────────────────────────────────────────────────┤
  │ E — Estimation      (3 min)                     │
  │   QPS, storage, bandwidth                       │
  ├─────────────────────────────────────────────────┤
  │ S — Schema          (3 min)                     │
  │   Key tables/documents, data model              │
  ├─────────────────────────────────────────────────┤
  │ H — High-Level Design  (10 min)                 │
  │   Main components, request flow                 │
  ├─────────────────────────────────────────────────┤
  │ A — APIs            (3 min)                     │
  │   Key endpoints / gRPC interfaces               │
  ├─────────────────────────────────────────────────┤
  │ D — Detailed Design  (15 min)                   │
  │   Deep dive on 2-3 hard components              │
  ├─────────────────────────────────────────────────┤
  │ E — Evaluate         (5 min)                    │
  │   Bottlenecks, trade-offs, what you would change│
  └─────────────────────────────────────────────────┘`,
      diagramSteps: [
        { step: 1, title: 'Requirements — ask first, design second', description: 'Never start designing until you understand the requirements. Ask about scale, latency needs, consistency requirements, and which features are in scope.', diagram: '"Before I start, can I ask some clarifying questions? How many DAU? What\'s the read/write ratio? Are there geographic requirements? What\'s the most important feature for the MVP scope?"' },
        { step: 2, title: 'High-level design — start simple', description: 'Draw the simplest design that solves the problem. Client → LB → App Servers → DB. Then identify the bottlenecks. Do not start with caches and message queues — earn them.', diagram: 'Naive: [Client] → [Load Balancer] → [App Server] → [PostgreSQL]. Now ask: what breaks at our scale estimates?' },
        { step: 3, title: 'Detailed design — go deep', description: 'Pick 2-3 hard problems. Interviewer often guides. This is where you demonstrate depth: "For the feed service, I\'d use a fan-out on write approach for regular users, but hybrid for celebrities because..."', diagram: '"The main challenge is feed generation at scale. Let me walk through the write path in detail. When a user posts..."' },
        { step: 4, title: 'Communicate trade-offs explicitly', description: 'Never just say what you chose — say what you rejected and why. "I chose eventual consistency here because... The downside is... We could mitigate this by..."', diagram: '"I used Redis for sessions. Trade-off: if Redis goes down, all sessions invalidate. We could mitigate with Redis Cluster or persist sessions to DB as backup."' }
      ],
      tradeoffs: [
        { title: 'Breadth vs Depth', optionA: 'Breadth: cover all components at high level, easy to follow, may seem shallow', optionB: 'Depth: deep dive on 2-3 components, demonstrates expertise, may miss covering other parts', recommendation: 'Breadth first (high-level design), then depth in the 2-3 hardest components. Ask the interviewer which areas they want to explore.', reasoning: 'Interviewers want to see how you handle hard problems. A perfect high-level design with no depth signal is not enough for senior roles.' }
      ],
      whenToUse: [{ scenario: 'Every system design interview', reason: 'Structure prevents forgetting key components and keeps you from diving into implementation before understanding requirements' }],
      whenNotToUse: [{ scenario: 'Real production design', reason: 'For actual systems, spend weeks on requirements and architecture review — not 45 minutes' }],
      keyPoints: ['RESHADED: Requirements → Estimation → Schema → High-Level → APIs → Detailed → Evaluate', 'Always ask clarifying questions before designing — requirements drive everything', 'Start simple, earn complexity (caching, queues, sharding) by identifying bottlenecks', 'Make trade-offs explicit: "I chose X over Y because Z, with the downside of A"', 'Ask what the interviewer wants to dive deep on — collaborate, do not monologue'],
      quiz: [
        { type: 'multiple_choice', question: 'In a 45-minute system design interview, what should you do in the first 5 minutes?', options: ['Draw the complete architecture', 'Start with the database schema', 'Clarify functional and non-functional requirements', 'Discuss technology choices'], correct: 2, explanation: 'Requirements drive all design decisions. Scale of 10K vs 10M users, read vs write heavy, consistency requirements — these change the entire architecture. Design without requirements is guesswork.' },
        { type: 'multiple_choice', question: 'When presenting a design choice, what should you always include?', options: ['The implementation code', 'What you rejected and why, including the trade-offs', 'The exact latency numbers', 'The cost estimates'], correct: 1, explanation: 'Trade-offs are the heart of system design. "I chose X because it gives A and B. The downside is C, which we can mitigate by D." This demonstrates senior engineering judgment.' },
        { type: 'fill_blank', question: 'In system design, start with the ________ design that works, then identify bottlenecks and add complexity to address them.', answer: 'simplest', explanation: 'Starting with distributed caches, message queues, and sharding before identifying why you need them is a red flag. Earn complexity by showing what breaks at your estimated scale.' }
      ]
    },
    {
      title: 'Designing for Scale — Common Patterns', slug: 'designing-for-scale', order: 8,
      summary: 'Scaling a system from 1K to 1M to 1B users requires applying proven patterns in a specific order: cache everything readable, scale reads with replicas before sharding, shard only when reads and replicas are exhausted, use async queues for write-heavy operations, push computation to edge, and decompose by domain. Each step adds complexity — only apply when previous step is the bottleneck.',
      analogy: 'Scaling is like expanding a restaurant. Start with one kitchen and counter (single server). When crowded, add more tables and waiters (scale web tier). Kitchen becomes the bottleneck — add more kitchen stations (read replicas, caching). If orders pile up, add an order queue system (message queues). If one location is not enough, open new locations (multi-region). Each step only when the previous is the bottleneck.',
      diagram: `
  Scaling Ladder:

  Stage 1: 1K users            Stage 4: 1M users
  [App] → [DB]                 [LB] → [Apps×10] → [Cache] → [Primary DB]
  Single server works                                       → [Replicas×3]

  Stage 2: 10K users           Stage 5: 100M users
  [LB] → [Apps×3] → [DB]      Add: [CDN] + [Message Queue]
  Horizontal app scaling       + [Search cluster] + [Analytics DB]

  Stage 3: 100K users          Stage 6: 1B users
  Add: [Cache (Redis)]         Microservices + Multi-region
  + [DB Read Replicas]         + DB Sharding + Global CDN`,
      diagramSteps: [
        { step: 1, title: 'Scale web tier first', description: 'Add more stateless application servers behind a load balancer. Store sessions in Redis (not server memory). This handles 10x-100x load increase with zero code changes.', diagram: '1 app server → 10 app servers. Move sessions: server memory → Redis. LB: round-robin. Cost: linear. Complexity: low.' },
        { step: 2, title: 'Cache aggressively', description: 'Add Redis in front of the database. Cache reads (cache-aside). Set appropriate TTLs. Target 80%+ cache hit rate. This handles 5-10x DB read load reduction.', diagram: 'Read: App → Redis (hit 85%) → serve. Miss 15% → DB → cache → serve. DB sees 15% of original read load.' },
        { step: 3, title: 'Scale reads with replicas', description: 'Add read replicas. Route all reads to replicas, writes to primary. 90% of web traffic is reads. 3 replicas = 3x read capacity. No code changes needed (connection pooling handles routing).', diagram: 'Primary: writes only. Replicas × 3: reads. DB read capacity: 4x. Primary free to handle writes.' },
        { step: 4, title: 'Async heavy writes with queues', description: 'Write-heavy operations (image processing, emails, analytics) go to queues. User gets immediate response. Workers process asynchronously. Decouples write spike from DB.', diagram: 'User uploads image → queue → immediate response. Worker: resize images → store → notify user. No DB write blocking user.' }
      ],
      tradeoffs: [
        { title: 'Premature vs Reactive Scaling', optionA: 'Premature: add caching and sharding before needed — wastes engineering time, adds complexity', optionB: 'Reactive: add scaling components when bottleneck is identified — simpler, right-sized', recommendation: 'Reactive scaling for most systems. Only scale ahead for known, planned growth (product launch, marketing campaign).', reasoning: 'You cannot know where bottlenecks are until you measure. Profile first, then optimize the actual bottleneck.' }
      ],
      whenToUse: [{ scenario: 'When actual metrics show a component is becoming a bottleneck', reason: 'Scale the bottleneck, not everything. Premature optimization creates complexity with no benefit.' }],
      whenNotToUse: [{ scenario: 'Pre-launch products without real traffic data', reason: 'Start simple. Add complexity when you have the data to justify it.' }],
      keyPoints: ['Scale web tier first (stateless + LB) — highest leverage, lowest complexity', 'Cache before adding read replicas — cache is 10-100x cheaper per request', 'Add read replicas before sharding — sharding adds enormous complexity', 'Use queues for write-heavy async work to decouple users from processing load', 'Measure first — optimize the actual bottleneck, not what you guess it is'],
      quiz: [
        { type: 'multiple_choice', question: 'Your database is at 80% CPU under read load. What is the FIRST thing you should try?', options: ['Shard the database', 'Add more application servers', 'Add a Redis cache in front of the database', 'Switch to a NoSQL database'], correct: 2, explanation: 'Cache first — it is the highest-leverage, lowest-complexity solution. A Redis cache can absorb 80-90% of read traffic with a simple configuration change. Sharding is a last resort after all other options are exhausted.' },
        { type: 'fill_blank', question: 'To scale application servers horizontally, all session data must be moved from server memory to a shared store like ________, making servers stateless.', answer: 'Redis', explanation: 'Stateless servers can receive any request from any client. Sessions in server memory would require sticky load balancing — sessions in Redis allows free distribution across all servers.' }
      ]
    }
  ];

  for (const lesson of t8lessons) {
    await prisma.designLesson.upsert({
      where: { slug: lesson.slug },
      update: {},
      create: {
        ...lesson,
        trackId: t8.id,
        diagramSteps: JSON.stringify(lesson.diagramSteps),
        tradeoffs: JSON.stringify(lesson.tradeoffs),
        whenToUse: JSON.stringify(lesson.whenToUse),
        whenNotToUse: JSON.stringify(lesson.whenNotToUse),
        keyPoints: JSON.stringify(lesson.keyPoints),
        quiz: JSON.stringify(lesson.quiz)
      }
    });
  }
  console.log('✅ Track 8: Advanced & Interview Mastery seeded');
}
