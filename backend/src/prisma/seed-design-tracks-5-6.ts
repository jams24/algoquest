import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seedTracks5and6() {
  // ── TRACK 5: DISTRIBUTED SYSTEMS ─────────────────────────────────────────
  const t5 = await prisma.designTrack.upsert({
    where: { slug: 'distributed-systems' },
    update: {},
    create: {
      name: 'Distributed Systems', slug: 'distributed-systems',
      description: 'Master the hard problems: CAP theorem, consensus, consistency, distributed transactions, and the internals that power Google, Amazon, and Netflix.',
      icon: '🌐', color: '#FF6B6B', order: 5, level: 'advanced'
    }
  });

  const t5lessons = [
    {
      title: 'CAP Theorem', slug: 'cap-theorem', order: 1,
      summary: 'CAP theorem states that a distributed system can guarantee at most two of three properties simultaneously: Consistency (every read receives the most recent write), Availability (every request receives a non-error response), and Partition Tolerance (the system continues operating despite network partitions). Since network partitions are unavoidable in distributed systems, the real choice is between CP (consistency over availability) and AP (availability over consistency). Understanding this shapes every database and architecture decision.',
      analogy: 'Imagine two bank branches sharing a ledger over a phone line. If the phone line cuts (partition), you have a choice: Branch A refuses to process transactions until the line is restored (CP — consistent but unavailable), or Branch A keeps processing but risks having different balances than Branch B (AP — available but inconsistent). You cannot have both during the outage.',
      diagram: `
  CAP Triangle:

            Consistency
                 △
                 │
                 │
     CP ─────────────── CA
     (HBase,        (Single node
      MongoDB        RDBMS — not
      strong)        distributed)
                 │
                 │
     AP ─────────────── ?
  (Cassandra,
   DynamoDB,
   CouchDB)

  Network Partition is ALWAYS possible → Real choice: CP or AP

  CP: Returns error/timeout during partition (consistent, not always available)
  AP: Returns possibly stale data during partition (always available, not consistent)`,
      diagramSteps: [
        { step: 1, title: 'Network Partition Happens', description: 'Two datacenters lose connectivity. Each still receives client traffic. Writes on one side are invisible to the other.', diagram: '[DC-West] ✗──────✗ [DC-East]\nClient1 → DC-West    Client2 → DC-East' },
        { step: 2, title: 'CP Choice: Reject Writes', description: 'To stay consistent, the minority partition refuses writes and returns errors. Users in DC-East see failures.', diagram: '[DC-West: active] ✗ [DC-East: returns 503]\nConsistency maintained. Availability sacrificed.' },
        { step: 3, title: 'AP Choice: Accept Stale Reads', description: 'Both sides accept writes. Data diverges. When partition heals, a reconciliation/merge process runs.', diagram: '[DC-West: balance=$100] ✗ [DC-East: balance=$100]\nBoth accept writes → reconcile later (conflict resolution)' },
        { step: 4, title: 'Partition Heals — Reconciliation', description: 'CP: Nothing to reconcile (writes were blocked). AP: Merge conflict resolution runs (last-write-wins, CRDTs, or custom logic).', diagram: 'AP: DC-West=$50, DC-East=$80 → merge → conflict! → resolution strategy needed' }
      ],
      tradeoffs: [
        { title: 'CP vs AP', optionA: 'CP (Consistency + Partition Tolerance) — returns errors during partition. HBase, MongoDB (strong), Zookeeper', optionB: 'AP (Availability + Partition Tolerance) — returns stale data during partition. Cassandra, DynamoDB, CouchDB', recommendation: 'CP for financial data (bank balances, inventory). AP for social data (likes, posts, user presence).', reasoning: 'A bank showing stale balance causes real financial harm. A social feed showing a post 2 seconds late causes no harm.' },
        { title: 'PACELC Extension', optionA: 'During partition (P): choose A or C. Else (E): choose latency (L) or consistency (C).', optionB: 'PACELC captures the everyday trade-off, not just during failures.', recommendation: 'Think in PACELC for real systems — even without partitions, you choose between fast reads (stale) or slow reads (consistent).', reasoning: 'Partitions are rare. The latency-consistency trade-off (replica reads vs primary reads) happens on every request.' }
      ],
      whenToUse: [
        { scenario: 'CP systems: payment processing, banking, inventory', reason: 'Incorrect data causes financial harm — better to show an error than a wrong balance' },
        { scenario: 'AP systems: social media, analytics, user sessions', reason: 'Temporary staleness is acceptable; always being reachable is more important' }
      ],
      whenNotToUse: [
        { scenario: 'Expecting CA (Consistent + Available) without partition tolerance', reason: 'Network partitions happen in any distributed system — you cannot assume the network is perfect' }
      ],
      keyPoints: ['Network partitions always happen — CP vs AP is the real choice', 'CP: data is correct but may be unavailable during failures', 'AP: always available but data may be stale during failures', 'PACELC extends CAP: even without partitions, latency vs consistency trade-off exists', 'Most databases let you tune consistency level per operation (Cassandra quorum, DynamoDB strong reads)'],
      quiz: [
        { type: 'multiple_choice', question: 'Why is CA (Consistent + Available, no partition tolerance) not a realistic option for distributed systems?', options: ['It is too expensive', 'Network partitions are unavoidable in distributed systems', 'CA systems are too slow', 'Databases do not support it'], correct: 1, explanation: 'Network cables fail, routers crash, switches restart. Any distributed system must handle partitions. CA only works for a single-node system, which is not distributed.' },
        { type: 'multiple_choice', question: 'DynamoDB defaults to eventually consistent reads. What does this mean?', options: ['Reads are always wrong', 'A read may return data slightly behind the latest write', 'Only one read can happen at a time', 'Reads are blocked during writes'], correct: 1, explanation: 'DynamoDB replicates writes across nodes. Eventual consistency means a read from a replica may not yet reflect the latest write to the primary.' },
        { type: 'multiple_choice', question: 'A bank\'s transaction system goes down during a network partition. This is because the system chose:', options: ['AP — availability over consistency', 'CP — consistency over availability', 'CA — it has no partition tolerance', 'None of the above'], correct: 1, explanation: 'Banks choose CP. During a partition, they return errors rather than risk showing incorrect balances or allowing double-spends.' },
        { type: 'fill_blank', question: 'CAP theorem says a distributed system can guarantee at most ________ of the three properties.', answer: 'two', explanation: 'Consistency, Availability, and Partition Tolerance cannot all be guaranteed simultaneously. Since partitions are inevitable, you choose CP or AP.' }
      ]
    },
    {
      title: 'Consistency Models', slug: 'consistency-models', order: 2,
      summary: 'Consistency is not binary — it is a spectrum. Strong consistency means every read sees the most recent write. Eventual consistency means all replicas will converge given enough time. In between: causal consistency (respects cause-and-effect order), read-your-writes (you always see your own writes), and monotonic reads (reads never go backwards). Choosing the right consistency level dramatically impacts latency, availability, and system complexity.',
      analogy: 'Think of a group of friends sharing notes over WhatsApp. Strong consistency: everyone must confirm they received a message before another can be sent (slow but everyone is perfectly in sync). Eventual consistency: messages arrive in any order and eventually everyone has all messages (fast but temporarily out of sync). Causal consistency: if Alice replies to Bob\'s message, everyone sees Bob\'s message before Alice\'s reply.',
      diagram: `
  Consistency Spectrum (weak → strong):

  Eventual        Monotonic    Causal      Read-Your-   Strong
  Consistency     Reads        Consistency Writes       Consistency
  ────────────────────────────────────────────────────────────────
  All replicas    Reads never  If A caused You always   Every read
  converge        go backwards B, everyone see your own sees latest
  eventually      (no time     sees A      writes       write
                  travel)      before B    immediately  everywhere

  Fastest ◄─────────────────────────────────────────────► Slowest
  Most Available                                          Least Available`,
      diagramSteps: [
        { step: 1, title: 'Strong Consistency', description: 'All reads go to the primary. Every read reflects the latest write. High latency (cross-datacenter reads). Used by Zookeeper, Google Spanner.', diagram: 'Write "x=5" → Primary. Read "x" → always 5, even from replica. But adds latency.' },
        { step: 2, title: 'Eventual Consistency', description: 'Writes propagate asynchronously. Reads from replicas may be stale. Given no new writes, all replicas converge to same state.', diagram: 'Write "x=5" → Primary. Replica lags 50ms. Read → might get x=4 briefly, then x=5.' },
        { step: 3, title: 'Read-Your-Writes', description: 'You always see your own writes. Other users may still see stale data. Implemented by routing your reads to the node you just wrote to.', diagram: 'Alice writes "status=away" → reads status → always sees "away". Bob may still see "online".' },
        { step: 4, title: 'Causal Consistency', description: 'Operations related by cause-and-effect appear in order to all users. Unrelated operations may appear in any order.', diagram: 'Alice posts "Q?". Bob replies "A!". Causal: everyone sees Q before A. Unrelated posts → any order OK.' }
      ],
      tradeoffs: [
        { title: 'Strong vs Eventual', optionA: 'Strong consistency: simple to reason about, higher latency (wait for all replicas), lower availability', optionB: 'Eventual consistency: lower latency (write to one replica, propagate async), higher availability, complex conflict resolution', recommendation: 'Strong for financial data and user-critical operations. Eventual for content feeds, metrics, and analytics.', reasoning: 'Strong consistency forces synchronous coordination across replicas. Every ms of added latency hurts user experience and throughput.' },
        { title: 'Tunable Consistency (Cassandra)', optionA: 'QUORUM reads/writes: majority of nodes must agree. Strong but slower.', optionB: 'ONE read/write: one node responds. Fast but stale.', recommendation: 'Use QUORUM for critical paths, ONE for analytics and dashboards.', reasoning: 'Cassandra lets you pick per-query. QUORUM (majority) gives you consistency when you need it without sacrificing it everywhere.' }
      ],
      whenToUse: [
        { scenario: 'Strong: financial transactions, inventory counts, user authentication', reason: 'Stale data causes real harm — wrong balance, overselling, unauthorized access' },
        { scenario: 'Eventual: social feeds, view counts, DNS, shopping cart', reason: 'Temporary staleness is acceptable. Speed and availability matter more.' },
        { scenario: 'Causal: collaborative editing, comment threads, message ordering', reason: 'Users expect cause-and-effect order to be preserved' }
      ],
      whenNotToUse: [
        { scenario: 'Strong consistency for high-throughput analytics', reason: 'Synchronous replication kills throughput. Analytics can tolerate minutes-old data.' }
      ],
      keyPoints: ['Consistency is a spectrum, not a binary choice', 'Strong consistency requires synchronous coordination — adds latency', 'Eventual consistency requires conflict resolution (last-write-wins, CRDTs, manual)', 'Read-your-writes and monotonic reads are practical middle grounds', 'Cassandra, DynamoDB let you tune consistency level per operation'],
      quiz: [
        { type: 'multiple_choice', question: 'A user updates their profile picture and immediately sees the old picture when they refresh. Which consistency guarantee was violated?', options: ['Causal consistency', 'Read-your-writes consistency', 'Monotonic reads', 'Eventual consistency'], correct: 1, explanation: 'Read-your-writes guarantees you always see your own recent writes. Seeing the old photo means the read hit a replica that had not yet received the write.' },
        { type: 'multiple_choice', question: 'Alice posts "Problem solved!" and Bob comments "Great!" Everyone should see Alice\'s post before Bob\'s comment. Which model guarantees this?', options: ['Eventual consistency', 'Strong consistency', 'Causal consistency', 'Monotonic reads'], correct: 2, explanation: 'Causal consistency preserves cause-and-effect ordering. Bob\'s comment is causally dependent on Alice\'s post, so Alice\'s post must appear first to all observers.' },
        { type: 'fill_blank', question: 'Cassandra allows you to specify ________ consistency, where a majority of replicas must agree before a read or write succeeds.', answer: 'quorum', explanation: 'QUORUM = majority (n/2 + 1) of replicas must respond. Stronger than ONE, weaker than ALL. Balances consistency and availability.' }
      ]
    },
    {
      title: 'Distributed Transactions', slug: 'distributed-transactions', order: 3,
      summary: 'A distributed transaction spans multiple services or databases and must be atomic — either all succeed or all roll back. Two-Phase Commit (2PC) coordinates this with a coordinator and participants. However, 2PC blocks if the coordinator crashes. Modern systems use the Saga pattern instead: a sequence of local transactions with compensating transactions to undo on failure. Choosing between 2PC and Saga shapes your system\'s complexity and failure behavior.',
      analogy: 'Booking a flight+hotel together: 2PC is like a travel agent who calls both the airline and hotel simultaneously, waits for both to reserve, then tells both to confirm. If the agent crashes after reservations are made but before confirmations, both hold slots forever (blocked). Saga is like booking the flight first, then the hotel, with a cancellation policy — if the hotel fails, cancel the flight. No coordinator lock needed.',
      diagram: `
  Two-Phase Commit (2PC):

  Phase 1 (Prepare):           Phase 2 (Commit):
  Coordinator → "Prepare?"     Coordinator → "Commit!"
  Participant A → "Ready"  OR  Participant A → commits
  Participant B → "Ready"      Participant B → commits

  Problem: Coordinator crashes after Phase 1:
  Participants hold locks INDEFINITELY → blocking

  Saga Pattern (alternative):

  Order  → Payment → Inventory → Shipment
  (local transactions, no locks held across services)

  On failure at Shipment:
  Shipment(fail) → Inventory(compensate) → Payment(refund) → done`,
      diagramSteps: [
        { step: 1, title: '2PC Phase 1 — Prepare', description: 'Coordinator sends "prepare" to all participants. Each participant runs the transaction locally but holds locks and does NOT commit yet.', diagram: 'Coordinator → Prepare? → DB-A (locks row, ready) + DB-B (locks row, ready)' },
        { step: 2, title: '2PC Phase 2 — Commit or Abort', description: 'If all say "ready", coordinator sends "commit". If any says "abort", coordinator sends "rollback" to all.', diagram: 'All ready → Coordinator → Commit → DB-A commits + DB-B commits. Locks released.' },
        { step: 3, title: '2PC Failure Problem', description: 'If coordinator crashes between phase 1 and phase 2, all participants hold locks forever waiting for the commit message. System is blocked.', diagram: 'Coordinator crashes → DB-A and DB-B hold locks → other transactions blocked' },
        { step: 4, title: 'Saga — Compensating Transactions', description: 'Saga executes a series of local transactions. On failure, it runs compensating transactions in reverse order to undo completed steps.', diagram: 'Step3 fails → run compensate2 → run compensate1 → system back to start. No locks held.' }
      ],
      tradeoffs: [
        { title: '2PC vs Saga', optionA: '2PC: strong atomicity, simpler logic, coordinator is single point of failure, blocking on crash', optionB: 'Saga: no blocking, loosely coupled, complex compensation logic, temporarily inconsistent state visible', recommendation: 'Saga for microservices. 2PC only within a single database cluster (e.g., PostgreSQL distributed txn).', reasoning: '2PC across network-separated services is fragile. Saga embraces failures explicitly and recovers gracefully.' },
        { title: 'Choreography vs Orchestration Saga', optionA: 'Choreography: services publish events and react to each other. Decentralized, harder to trace.', optionB: 'Orchestration: central saga orchestrator tells each service what to do. Easier to trace, orchestrator is a bottleneck.', recommendation: 'Orchestration for complex flows with many steps. Choreography for simple flows.', reasoning: 'With choreography, tracing what happened requires reading event logs from many services. Orchestration centralizes the flow.' }
      ],
      whenToUse: [
        { scenario: 'Saga: e-commerce checkout (order + payment + inventory + shipping)', reason: 'Multiple microservices must coordinate. Each can fail independently. Sagas handle partial failures gracefully.' },
        { scenario: '2PC: within a single database cluster for ACID transactions', reason: '2PC is reliable when participants are on the same reliable network (same cluster).' }
      ],
      whenNotToUse: [
        { scenario: '2PC across independent microservices over the network', reason: 'Coordinator failure leaves participants blocked with locks held — cascading failure risk' }
      ],
      keyPoints: ['2PC guarantees atomicity but blocks if coordinator crashes', 'Saga sequences local transactions with compensating transactions for rollback', 'Compensating transactions must be idempotent — they may be called multiple times on retry', 'Sagas expose intermediate states — other services may see partial results temporarily', 'Use Saga for microservices, 2PC only within a single DB cluster'],
      quiz: [
        { type: 'multiple_choice', question: 'What is the main problem with 2PC in a microservices environment?', options: ['It is too slow', 'If the coordinator crashes between phases, participants hold locks indefinitely', 'It requires all services to use the same database', 'It does not support rollback'], correct: 1, explanation: 'The coordinator is a single point of failure. A crash after "prepare" but before "commit" leaves all participants blocking with locks held — the system freezes.' },
        { type: 'multiple_choice', question: 'In a Saga, what happens when step 3 of 5 fails?', options: ['The entire distributed transaction rolls back atomically', 'Steps 1 and 2 are undone via compensating transactions', 'The saga retries step 3 indefinitely', 'All services hold locks until the saga completes'], correct: 1, explanation: 'Saga runs compensating transactions in reverse: step 2 compensate, step 1 compensate. No locks held — compensation is a new local transaction.' },
        { type: 'fill_blank', question: 'A Saga compensating transaction must be ________ — safe to execute multiple times with the same result.', answer: 'idempotent', explanation: 'On retry, compensation may run multiple times. Idempotency ensures a refund is not issued twice for the same failed order.' }
      ]
    },
    {
      title: 'Consensus — Raft & Paxos', slug: 'consensus-raft-paxos', order: 4,
      summary: 'Consensus algorithms enable distributed nodes to agree on a single value even when some nodes fail. Paxos was the theoretical foundation. Raft was designed to be understandable. Both guarantee that only one leader is elected, all committed log entries are durable, and the system makes progress as long as a majority (quorum) of nodes are healthy. Used by etcd, ZooKeeper, CockroachDB, and every distributed database.',
      analogy: 'Consensus is like a committee voting on a decision. Raft: one person is elected chair (leader) by majority vote. The chair proposes all decisions and the committee votes — if a majority agrees, the decision is committed. If the chair goes offline, a new election happens. No two chairs can be elected for the same term.',
      diagram: `
  Raft Consensus (5-node cluster, majority = 3):

  Normal Operation:
  Leader ──AppendEntries──▶ Follower1 (ack)
         ──AppendEntries──▶ Follower2 (ack)   Majority = committed
         ──AppendEntries──▶ Follower3 (ack)
         ──AppendEntries──▶ Follower4 (ack)

  Leader Election (leader crashes):
  Followers wait (election timeout) → Candidate increments term
  Candidate ──RequestVote──▶ others
  Gets majority votes → becomes new Leader

  Split Vote (no majority):
  Randomized timeouts → one candidate starts election first
  → avoids permanent split vote`,
      diagramSteps: [
        { step: 1, title: 'Leader Election', description: 'Each follower waits a random timeout. First to timeout becomes a candidate, increments term, votes for itself, requests votes from others.', diagram: 'Follower → timeout → Candidate(term=2) → RequestVote → gets 3/5 votes → Leader' },
        { step: 2, title: 'Log Replication', description: 'All client writes go to the leader. Leader appends to its log and replicates to followers. Entry is committed once a majority acknowledge.', diagram: 'Client → Leader(log[5]="x=3") → AppendEntries → Followers → majority ack → committed' },
        { step: 3, title: 'Safety — One Leader Per Term', description: 'A leader can only be elected with a majority vote per term. Two leaders cannot exist simultaneously because no two nodes can get majority votes in the same term.', diagram: 'Term 3: Node1 gets 3 votes → Leader. Node2 cannot get 3 votes (same term) → impossible.' },
        { step: 4, title: 'Leader Failure and Recovery', description: 'If leader crashes, followers detect missing heartbeats, start new election. New leader has all committed entries (only nodes with up-to-date log win elections).', diagram: 'Leader crash → no heartbeat → follower timeout → election → new leader with latest log' }
      ],
      tradeoffs: [
        { title: 'Raft vs Paxos', optionA: 'Paxos: theoretically optimal, extremely hard to understand and implement correctly, various variants (Multi-Paxos, etc.)', optionB: 'Raft: designed for understandability, clear leader role, explicit log structure, easier to implement correctly', recommendation: 'Use Raft-based systems (etcd, CockroachDB) in practice. Study Paxos for theoretical understanding.', reasoning: 'Paxos papers leave many details unspecified. Raft was designed to be complete and implementable — that\'s why etcd chose it.' },
        { title: 'Quorum Size', optionA: 'Larger cluster (7 nodes): tolerates 3 failures, more durable', optionB: 'Smaller cluster (3 nodes): tolerates 1 failure, faster (fewer nodes to get majority)', recommendation: '3 nodes for most deployments, 5 for critical systems needing 2-failure tolerance', reasoning: 'More nodes means waiting for more acknowledgments. 3-node cluster already handles AZ failure in most clouds.' }
      ],
      whenToUse: [
        { scenario: 'Distributed coordination: leader election, distributed locks, configuration management', reason: 'etcd/ZooKeeper use Raft/ZAB to provide strongly consistent key-value store for cluster coordination' },
        { scenario: 'Distributed databases needing strong consistency', reason: 'CockroachDB, TiKV use Raft per-shard to replicate data with strong guarantees' }
      ],
      whenNotToUse: [
        { scenario: 'High-throughput data storage (not coordination)', reason: 'Consensus adds latency overhead per write. Use it for coordination (etcd), not bulk data storage.' }
      ],
      keyPoints: ['Consensus requires a majority (quorum) of nodes to be available to make progress', 'Raft: strong leader handles all writes, followers replicate', 'An entry is committed only after a majority of nodes acknowledge it', 'Randomized timeouts prevent split votes in leader elections', 'etcd, ZooKeeper, CockroachDB, TiKV all use Raft or Raft-inspired algorithms'],
      quiz: [
        { type: 'multiple_choice', question: 'In a 5-node Raft cluster, how many nodes must acknowledge a log entry before it is considered committed?', options: ['2 (any minority)', '3 (majority)', '4 (supermajority)', '5 (all nodes)'], correct: 1, explanation: 'Majority = floor(5/2) + 1 = 3. Committed once 3 of 5 nodes acknowledge. The cluster can tolerate 2 node failures.' },
        { type: 'multiple_choice', question: 'Why do Raft candidates use randomized election timeouts?', options: ['To save energy', 'To prevent multiple candidates from starting elections simultaneously (split vote)', 'To ensure the fastest node always wins', 'Required by the Raft protocol specification'], correct: 1, explanation: 'If all nodes had the same timeout, they would all become candidates at once and split votes. Randomization ensures one node starts first and wins.' },
        { type: 'fill_blank', question: 'Raft guarantees progress as long as a ________ of nodes are healthy and can communicate.', answer: 'majority', explanation: 'A majority (quorum) must be reachable for the leader to commit entries. With 3 nodes, 2 must be healthy. With 5 nodes, 3 must be healthy.' }
      ]
    },
    {
      title: 'Vector Clocks & Ordering', slug: 'vector-clocks-ordering', order: 5,
      summary: 'In distributed systems, there is no global clock. Vector clocks provide a logical ordering of events: each node maintains a counter for each node in the system. When an event happens, the node increments its own counter. When a message is sent, the vector is included. The receiver takes the max of each counter. If neither vector dominates the other, events are concurrent and may conflict. Used by DynamoDB, Riak, and distributed version control.',
      analogy: 'Imagine three friends editing a Google Doc offline, each using their own notebook to track changes. Each notebook has three counters (one per friend). When you make a change, you increment your counter. When you sync, you exchange notebooks and take the max of each counter. If your notebook shows Alice edited 3 times and Bob\'s shows Alice edited 5 times — Bob has seen more of Alice\'s changes. If notebooks can\'t be compared, there\'s a conflict.',
      diagram: `
  3-node system: [A, B, C]

  Initial: A=[0,0,0]  B=[0,0,0]  C=[0,0,0]

  A writes x=1:   A=[1,0,0]
  A sends to B:   B receives → B=[1,1,0] (max + increment)
  B writes y=2:   B=[1,2,0]
  B sends to C:   C=[1,2,1]
  A writes x=3:   A=[2,0,0]  ← A didn't see B's changes!

  Compare A=[2,0,0] vs C=[1,2,1]:
  A[0]=2 > C[0]=1, but A[1]=0 < C[1]=2 → CONCURRENT CONFLICT`,
      diagramSteps: [
        { step: 1, title: 'Each node has a vector', description: 'N-node system: each node keeps N counters. Position i = how many events node i has seen.', diagram: 'Node A: [A_count, B_count, C_count] = [0, 0, 0]' },
        { step: 2, title: 'Event increments own counter', description: 'When node A performs an event (write), it increments its own counter.', diagram: 'A writes → A=[1,0,0]. Then A writes again → A=[2,0,0].' },
        { step: 3, title: 'Message propagates vector', description: 'When A sends a message to B, it includes its vector. B takes the max of each position and increments its own counter.', diagram: 'A sends [2,0,0] to B. B had [1,1,0]. B → [max(2,1), max(0,1)+1, max(0,0)] = [2,2,0]' },
        { step: 4, title: 'Detecting causality and conflicts', description: 'V1 causally precedes V2 if every element of V1 ≤ V2. Otherwise concurrent (conflict must be resolved).', diagram: 'V1=[1,2,1] and V2=[2,1,0]: V1[0]<V2[0] but V1[1]>V2[1] → concurrent → conflict!' }
      ],
      tradeoffs: [
        { title: 'Vector Clocks vs Lamport Timestamps', optionA: 'Lamport: single counter per node, total ordering but cannot detect concurrent events', optionB: 'Vector Clocks: N counters, can detect concurrent events and causality, more memory (O(N) per event)', recommendation: 'Vector clocks when detecting concurrency matters (conflict resolution). Lamport when only ordering matters.', reasoning: 'DynamoDB uses vector clocks to detect concurrent updates and present conflicts to the application for resolution.' },
        { title: 'Vector Clocks vs Hybrid Logical Clocks (HLC)', optionA: 'Vector Clocks: exact causality, size grows with cluster size', optionB: 'HLC: combines physical time and logical time, compact, used by CockroachDB', recommendation: 'HLC for large clusters where vector clock size is prohibitive. Vector clocks for small distributed systems.', reasoning: 'CockroachDB uses HLC to provide globally synchronized clocks with true-time uncertainty bounds.' }
      ],
      whenToUse: [
        { scenario: 'Detecting concurrent writes in distributed databases', reason: 'DynamoDB/Riak use vector clocks to know whether two writes conflict or one causally follows the other' },
        { scenario: 'Distributed version control', reason: 'Git uses a DAG (similar concept) to track causality and detect merge conflicts' }
      ],
      whenNotToUse: [
        { scenario: 'Systems with many nodes where vector size becomes large', reason: 'Vector grows O(N) with nodes. For 1000-node systems, use version vectors or HLC instead.' }
      ],
      keyPoints: ['No global clock in distributed systems — logical clocks provide ordering', 'Vector clock: N-element vector, each position = events seen from that node', 'V1 causally precedes V2 if all elements of V1 ≤ V2', 'Concurrent events mean a conflict that must be resolved (last-write-wins, CRDT, manual)', 'DynamoDB and Riak use vector clocks for conflict detection'],
      quiz: [
        { type: 'multiple_choice', question: 'Node A has vector [3,1,0]. Node B has vector [2,2,0]. What is the relationship?', options: ['A causally precedes B', 'B causally precedes A', 'They are concurrent (conflict)', 'They are identical'], correct: 2, explanation: 'A[0]=3 > B[0]=2, but A[1]=1 < B[1]=2. Neither dominates the other → concurrent → conflict must be resolved.' },
        { type: 'fill_blank', question: 'When a node receives a message with a vector clock, it takes the ________ of each position and then increments its own counter.', answer: 'max', explanation: 'Taking the max merges the knowledge of both nodes. Then incrementing its own counter records the receive event.' }
      ]
    },
    {
      title: 'Gossip Protocol', slug: 'gossip-protocol', order: 6,
      summary: 'Gossip protocol (epidemic protocol) disseminates information through a network by having each node periodically share its state with a random set of peers. Information spreads exponentially — like a rumor in a school. It is highly resilient (no single point of failure), eventually consistent, and scales to thousands of nodes. Used by Cassandra (cluster membership), Amazon DynamoDB (node health), and Bitcoin (block propagation).',
      analogy: 'Think of gossip at a school. If one person hears news, they tell 3 friends. Each friend tells 3 more. After a few rounds, the entire school knows. If one person is absent, the news still spreads through others. No teacher needs to announce it to everyone — the information spreads naturally and redundantly.',
      diagram: `
  Round 0: Only node A has new info (★)
  A★ ─── B  ─── C
  |              |
  D  ─── E  ─── F

  Round 1: A gossips to B, D
  A★ ─── B★ ─── C
  |              |
  D★ ─── E  ─── F

  Round 2: B gossips to C, E. D gossips to E.
  A★ ─── B★ ─── C★
  |              |
  D★ ─── E★ ─── F

  Round 3: All nodes informed. Logarithmic convergence.`,
      diagramSteps: [
        { step: 1, title: 'Periodic gossip exchange', description: 'Every node, every T seconds, picks K random peers and sends its state (node list, health, data). Receiver merges with its own state.', diagram: 'NodeA every 1s: pick [NodeC, NodeF] → send state → NodeC/F merge → propagate next round' },
        { step: 2, title: 'Exponential spread', description: 'Each round multiplies informed nodes by K. After log(N/K) rounds, all N nodes know. For 1000 nodes, K=3: ~7 rounds.', diagram: 'Round 0: 1 node. Round 1: 3. Round 2: 9. Round 3: 27. Round 7: ~2187 → all 1000 nodes' },
        { step: 3, title: 'Failure detection', description: 'Nodes include heartbeat timestamps. If a node\'s heartbeat stops updating in others\' gossip, it is marked suspect, then dead after timeout.', diagram: 'NodeB heartbeat: t=100, t=101, t=102... stops → NodeA gossips "B=suspect" → eventually "B=dead"' },
        { step: 4, title: 'Cassandra ring membership', description: 'Each Cassandra node gossips its token range, load, schema, and health. New node gossips to seeds, information spreads to all nodes in seconds.', diagram: 'New Cassandra node → gossip to seed → seed gossips to 3 peers → spreads in log(N) rounds' }
      ],
      tradeoffs: [
        { title: 'Gossip vs Broadcast', optionA: 'Gossip: O(log N) rounds, fault-tolerant, no coordinator, eventually consistent', optionB: 'Broadcast: O(1) rounds, immediate consistency, coordinator bottleneck, not fault-tolerant', recommendation: 'Gossip for cluster membership and health in large clusters. Broadcast for small clusters where immediate consistency matters.', reasoning: 'A broadcast coordinator is a single point of failure. Gossip survives any node failures because information routes around failures.' },
        { title: 'Anti-entropy vs Rumor Mongering', optionA: 'Anti-entropy: always compare entire state with peers. Guaranteed convergence, high bandwidth.', optionB: 'Rumor Mongering: spread new information until N nodes have confirmed they knew it. Stop propagating. Lower bandwidth.', recommendation: 'Use rumor mongering for new updates, anti-entropy for reconciliation during node recovery.', reasoning: 'Rumor mongering reduces redundant traffic. Anti-entropy ensures eventual consistency even for long-partitioned nodes.' }
      ],
      whenToUse: [
        { scenario: 'Cluster membership and failure detection at scale', reason: 'Cassandra, DynamoDB use gossip to maintain ring membership across thousands of nodes with no central coordinator' },
        { scenario: 'Propagating configuration updates across large clusters', reason: 'Gossip reaches all nodes in O(log N) rounds without any node becoming a bottleneck' }
      ],
      whenNotToUse: [
        { scenario: 'Strongly consistent data that must be immediately visible', reason: 'Gossip is eventually consistent — there is a lag before all nodes receive the update' }
      ],
      keyPoints: ['Gossip spreads information in O(log N) rounds by exchanging state with random peers', 'Extremely fault-tolerant — no single point of failure', 'Used for cluster membership, failure detection, and configuration propagation', 'Cassandra uses gossip for ring membership, health, and schema versioning', 'Trade-off: eventual consistency vs zero coordinator bottleneck'],
      quiz: [
        { type: 'multiple_choice', question: 'How many rounds does gossip take to inform all N nodes if each round each node gossips to K peers?', options: ['O(N)', 'O(N²)', 'O(log N / log K)', 'O(1)'], correct: 2, explanation: 'Each round multiplies informed nodes by K. To reach N nodes: K^rounds = N → rounds = log(N)/log(K). Logarithmic convergence.' },
        { type: 'fill_blank', question: 'Gossip protocol is fault-tolerant because there is no single ________ — information routes around failed nodes.', answer: 'coordinator', explanation: 'Unlike broadcast, gossip has no central node. If any node fails, information flows through alternative paths.' }
      ]
    },
    {
      title: 'Distributed Locking', slug: 'distributed-locking', order: 7,
      summary: 'Distributed locking prevents multiple processes across different machines from simultaneously executing critical sections. Unlike single-process mutexes, distributed locks must handle network failures, process crashes, and clock skew. Redis SETNX with TTL is the most common approach. Redlock uses multiple Redis instances for safety. Zookeeper ephemeral nodes are the most correct but complex approach.',
      analogy: 'Distributed locking is like a construction crew sharing one crane at a construction site with multiple buildings. When crew A is using the crane, they hang a flag (set the lock). Other crews see the flag and wait. If crew A goes home sick (crashes), the flag automatically comes down after 10 minutes (TTL) so others are not blocked forever.',
      diagram: `
  Redis-based Distributed Lock:

  Process A:                    Process B (concurrent):
  SETNX lock "A" PX 30000      SETNX lock "B" PX 30000
  → success (lock acquired)    → fail (key already exists)

  Critical section...          Retry with backoff...

  DEL lock                     SETNX lock "B" PX 30000
  (release lock)               → success (lock acquired)

  Problem: Process A crashes before DEL:
  TTL expires (30s) → lock auto-released → B can proceed`,
      diagramSteps: [
        { step: 1, title: 'Acquire lock with TTL', description: 'Use SETNX (set if not exists) with a unique value and TTL. Only one process succeeds. TTL ensures lock is released on crash.', diagram: 'SET lock:resource "uuid-A" NX PX 30000 → OK (A has lock) or nil (lock taken)' },
        { step: 2, title: 'Execute critical section', description: 'Only the lock holder enters the critical section. Others retry with exponential backoff.', diagram: 'Lock holder: execute critical code. Others: sleep 100ms, retry. Or fail-fast with 423 Locked.' },
        { step: 3, title: 'Release lock safely', description: 'Must verify lock value matches your UUID before deleting — prevents accidentally releasing another process\'s lock.', diagram: 'Lua: if GET lock == "uuid-A" then DEL lock end (atomic check-and-delete)' },
        { step: 4, title: 'Redlock for safety', description: 'Acquire lock on majority (3 of 5) independent Redis instances. A lock is valid only if acquired on majority within allowed time. Tolerates Redis node failures.', diagram: 'Acquire on Redis1,2,3,4,5. Got 3 of 5 within 10ms → lock valid. Need majority = 3.' }
      ],
      tradeoffs: [
        { title: 'Redis SETNX vs ZooKeeper', optionA: 'Redis: fast (~1ms), simple, single Redis is not safe (SPOF), Redlock adds complexity', optionB: 'ZooKeeper: ephemeral znodes auto-delete on crash, strongly consistent, higher latency (~5-10ms)', recommendation: 'Redis for performance-critical locks. ZooKeeper for critical coordination where correctness is paramount.', reasoning: 'ZooKeeper is built for coordination and provides stronger guarantees. Redis is faster but requires careful TTL management.' }
      ],
      whenToUse: [
        { scenario: 'Preventing duplicate processing in distributed job queues', reason: 'Only one worker should process a given job, even when multiple workers see it' },
        { scenario: 'Coordinating writes to a shared external resource', reason: 'Multiple microservices updating the same third-party API, rate limit compliance' }
      ],
      whenNotToUse: [
        { scenario: 'High-frequency locks where contention is high', reason: 'Lock contention serializes work — consider sharding the resource instead of using one global lock' }
      ],
      keyPoints: ['Always set a TTL to prevent deadlock when process crashes', 'Use a unique value per lock holder to avoid releasing another\'s lock', 'Redlock acquires locks on majority of N Redis instances for safety', 'ZooKeeper ephemeral nodes auto-release when session ends — strongest guarantee', 'Distributed locks are advisory — all processes must participate to be effective'],
      quiz: [
        { type: 'multiple_choice', question: 'Why must a distributed lock always have a TTL?', options: ['TTL improves performance', 'If the lock holder crashes, the lock is automatically released after TTL', 'TTL is required by Redis', 'To limit how long a critical section runs'], correct: 1, explanation: 'Without TTL, a crashed process holds the lock forever. TTL ensures the lock eventually auto-expires so other processes can proceed.' },
        { type: 'fill_blank', question: 'When releasing a Redis lock, you should use a Lua script to atomically check the lock value equals your ________ before deleting.', answer: 'UUID', explanation: 'Without checking your UUID first, you might accidentally delete another process\'s lock that was acquired after your TTL expired.' }
      ]
    },
    {
      title: 'CRDTs — Conflict-Free Replicated Data Types', slug: 'crdts', order: 8,
      summary: 'CRDTs (Conflict-Free Replicated Data Types) are data structures that can be updated independently on multiple nodes and merged automatically without conflicts. Unlike systems that detect conflicts and require manual resolution, CRDTs guarantee convergence mathematically. Types: G-Counter (grow-only), PN-Counter (positive-negative), G-Set, OR-Set, LWW-Register, and MV-Register. Used by Redis, Riak, Figma, and collaborative editing tools.',
      analogy: 'Imagine two people counting attendees at different entrances to a stadium. Each counts independently (no coordination needed). At the end, you add both counts. The final total is always correct regardless of order. That\'s a G-Counter CRDT — each node\'s count only grows, and merging is just taking the max per node.',
      diagram: `
  G-Counter CRDT (grow-only counter):

  Node A: [A=3, B=2, C=0]   Node B: [A=2, B=4, C=1]
                    ↕ merge (take max per position)
            merged: [A=3, B=4, C=1]
            value:  3+4+1 = 8

  OR-Set CRDT (add-wins set):

  Node A: add("apple", tag1)    Node B: remove("apple", tag1)
  Node A: add("apple", tag2)

  Merge: apple has tag2 which was never removed → apple is in set
  Result: {apple} — add wins for concurrent add+remove`,
      diagramSteps: [
        { step: 1, title: 'G-Counter: grow-only counter', description: 'Each node has a counter per node in the cluster. Increment only adds to your own slot. Value = sum of all slots. Merge = max per slot.', diagram: 'Node A increments → A=[3,2,0]. Node B increments → B=[2,4,1]. Merge → [3,4,1]. Sum=8' },
        { step: 2, title: 'PN-Counter: increment and decrement', description: 'Combine two G-Counters: P for increments, N for decrements. Value = P.sum - N.sum. Merge each G-Counter separately.', diagram: 'P=[3,4,1] N=[1,2,0]. Value = 8 - 3 = 5. No conflicts ever.' },
        { step: 3, title: 'OR-Set: Add-wins set', description: 'Each add gets a unique tag. Remove only removes specific tags. If an element is added concurrently with a remove, add wins (the new tag survives).', diagram: 'Add(x,tag1) | Remove(x,tag1) concurrent + Add(x,tag2) → tag2 not removed → x in set' },
        { step: 4, title: 'LWW-Register: last-write-wins', description: 'Each value has a timestamp. On merge, highest timestamp wins. Requires synchronized clocks. Simple but loses concurrent updates.', diagram: 'A: x=5 at t=100. B: x=7 at t=103. Merge → x=7 (t=103 wins). A\'s write lost.' }
      ],
      tradeoffs: [
        { title: 'CRDTs vs OT (Operational Transformation)', optionA: 'CRDTs: decentralized, mathematically guaranteed convergence, some data types difficult to design', optionB: 'OT: centralized server transforms operations, used by Google Docs, requires central coordinator', recommendation: 'CRDTs for P2P and offline-first apps. OT for centralized collaboration (Google Docs model).', reasoning: 'CRDTs work without a coordinator — ideal for mobile offline apps. OT needs a server to order all operations.' }
      ],
      whenToUse: [
        { scenario: 'Collaborative editing without a central server', reason: 'Figma, Notion use CRDTs so multiple users can edit simultaneously with guaranteed eventual consistency' },
        { scenario: 'Shopping cart in AP distributed databases', reason: 'Amazon Dynamo uses a CRDT-like approach for shopping cart: all adds and removes merge without conflicts' }
      ],
      whenNotToUse: [
        { scenario: 'Financial balances requiring strong consistency', reason: 'CRDTs can allow temporary values that violate business invariants (negative balance possible with PN-Counter)' }
      ],
      keyPoints: ['CRDTs guarantee convergence without coordination — no conflicts by design', 'Types: G-Counter, PN-Counter, G-Set, OR-Set, LWW-Register', 'Merge operations must be commutative, associative, and idempotent', 'Redis, Riak, Figma, and collaborative tools use CRDTs', 'Trade-off: not all data types can be expressed as CRDTs'],
      quiz: [
        { type: 'multiple_choice', question: 'What property makes CRDTs "conflict-free"?', options: ['They use a central server to resolve conflicts', 'Merge operations are mathematically guaranteed to produce the same result regardless of order', 'They prevent concurrent writes from happening', 'They use strong consistency'], correct: 1, explanation: 'CRDT merge operations are commutative, associative, and idempotent. Any order of merging produces the same result — no conflicts by design.' },
        { type: 'fill_blank', question: 'A PN-Counter tracks both ________ and decrement events using two G-Counters, with value = increments - decrements.', answer: 'increment', explanation: 'PN-Counter = Positive G-Counter (increments) + Negative G-Counter (decrements). Value = P.sum - N.sum. No conflicts.' }
      ]
    }
  ];

  for (const lesson of t5lessons) {
    await prisma.designLesson.upsert({
      where: { slug: lesson.slug },
      update: {},
      create: {
        ...lesson,
        trackId: t5.id,
        diagramSteps: JSON.stringify(lesson.diagramSteps),
        tradeoffs: JSON.stringify(lesson.tradeoffs),
        whenToUse: JSON.stringify(lesson.whenToUse),
        whenNotToUse: JSON.stringify(lesson.whenNotToUse),
        keyPoints: JSON.stringify(lesson.keyPoints),
        quiz: JSON.stringify(lesson.quiz)
      }
    });
  }
  console.log('✅ Track 5: Distributed Systems seeded');

  // ── TRACK 6: RELIABILITY & OPERATIONS ────────────────────────────────────
  const t6 = await prisma.designTrack.upsert({
    where: { slug: 'reliability-operations' },
    update: {},
    create: {
      name: 'Reliability & Operations', slug: 'reliability-operations',
      description: 'Build systems that stay up. SLOs, circuit breakers, chaos engineering, observability, and the operational practices that separate 99.9% from 99.99% uptime.',
      icon: '🛡️', color: '#4ECDC4', order: 6, level: 'advanced'
    }
  });

  const t6lessons = [
    {
      title: 'SLA, SLO & SLI', slug: 'sla-slo-sli', order: 1,
      summary: 'SLI (Service Level Indicator) is a metric that measures service behavior (e.g., error rate, latency). SLO (Service Level Objective) is a target value for that metric (e.g., 99.9% of requests < 200ms). SLA (Service Level Agreement) is a contract with a customer including consequences for violating SLOs. Error budgets — the allowed downtime — make abstract reliability concrete and guide decisions about when to ship vs when to stabilize.',
      analogy: 'A pizza delivery company: SLI = actual delivery time. SLO = 95% of deliveries in < 30 minutes. SLA = contract with corporate clients: if we miss the SLO for 3 consecutive weeks, we give a 20% discount. Error budget = the 5% of deliveries that can be late — if used up, no new menu experiments this month.',
      diagram: `
  SLI → SLO → SLA → Error Budget

  SLI (what you measure):
  - Error rate: errors / total_requests = 0.05%
  - Latency: 99th percentile < 200ms
  - Availability: successful_minutes / total_minutes

  SLO (your target):
  - Error rate < 0.1% over 30 days
  - p99 latency < 200ms

  Error Budget:
  - 99.9% availability = 0.1% error budget
  - 30 days × 0.1% = 43.2 minutes of allowed downtime
  - Current month used: 20 minutes → 23 minutes remaining

  SLA:
  - External contract with customers
  - Violation → credit/penalty
  - Always more lenient than internal SLO`,
      diagramSteps: [
        { step: 1, title: 'Define SLIs', description: 'Choose metrics that matter to users. Availability, latency (p99), error rate, throughput. Avoid internal metrics users do not feel directly.', diagram: 'Good SLI: % requests completing < 500ms. Bad SLI: CPU utilization (internal, not user-facing)' },
        { step: 2, title: 'Set SLOs', description: 'Target values for SLIs. Start conservative (99% not 99.999%). Tighten based on actual performance data. SLO must be achievable.', diagram: 'Month 1 SLO: 99% availability. Month 6: 99.5%. Year 1: 99.9%. Never start at 99.99%.' },
        { step: 3, title: 'Calculate Error Budget', description: 'Error budget = 1 - SLO. 99.9% SLO = 0.1% error budget = 43.2 min/month. When budget is depleted, freeze feature releases.', diagram: '99.9% SLO → 8.64 hours/year allowed downtime → budget burned in incident → freeze features' },
        { step: 4, title: 'Error Budget Policy', description: 'If budget is healthy: ship features. If budget < 50%: slow down. If budget exhausted: only reliability work until next period.', diagram: 'Budget 80%: greenlight releases. Budget 10%: require extra review. Budget 0%: feature freeze.' }
      ],
      tradeoffs: [
        { title: 'Tight SLO vs Loose SLO', optionA: '99.99% SLO: almost no downtime allowed, forces operational excellence, very expensive, slows feature velocity', optionB: '99.9% SLO: 43 min/month allowed, realistic for most services, allows feature iteration', recommendation: 'Start at 99.9%, tighten based on customer needs and actual performance.', reasoning: 'Going from 99.9% to 99.99% requires 10x more engineering effort. Justify with business impact.' }
      ],
      whenToUse: [
        { scenario: 'Every production service', reason: 'Without SLOs, reliability is unmeasured and degradation goes unnoticed' },
        { scenario: 'Setting team priorities', reason: 'Error budget depletion objectively forces reliability work over features — removes politics from the decision' }
      ],
      whenNotToUse: [
        { scenario: 'Internal prototypes and staging environments', reason: 'SLOs with consequences are for production user-facing systems' }
      ],
      keyPoints: ['SLI = metric. SLO = target. SLA = contract with consequences.', 'Error budget = 1 - SLO. When depleted, freeze feature releases.', 'p99 latency, error rate, and availability are the most common SLIs', 'SLA should always be looser than SLO — buffer between internal target and external promise', 'Error budgets make the reliability vs velocity trade-off objective and data-driven'],
      quiz: [
        { type: 'multiple_choice', question: 'Your service has a 99.9% availability SLO. How many minutes of downtime are allowed per month?', options: ['4.32 minutes', '43.2 minutes', '432 minutes', '4.32 hours'], correct: 1, explanation: '0.1% of 30 days × 24 hours × 60 min = 43.2 minutes. This is the error budget for the month.' },
        { type: 'multiple_choice', question: 'The error budget for the month is depleted on day 15. What should happen?', options: ['Continue shipping features as planned', 'Freeze feature releases and focus only on reliability improvements', 'Increase the SLO to give more budget', 'Alert users and reduce traffic'], correct: 1, explanation: 'Error budget depletion means reliability has suffered too much. Engineering capacity shifts to reliability work until the budget resets.' },
        { type: 'fill_blank', question: 'An SLA is always more ________ than an internal SLO — giving engineering a buffer before customer penalties trigger.', answer: 'lenient', explanation: 'If your SLO is 99.9%, your SLA might promise 99.5%. This buffer means you can violate the SLO slightly without triggering customer penalties.' }
      ]
    },
    {
      title: 'Fault Tolerance & Redundancy', slug: 'fault-tolerance-redundancy', order: 2,
      summary: 'Fault tolerance is the ability of a system to continue operating correctly despite component failures. Techniques: redundancy (N+1, RAID, multi-AZ), replication, failover, graceful degradation, and bulkheads. The goal is eliminating single points of failure (SPOFs) so any one component can fail without taking down the system. Active-passive vs active-active redundancy determine how failover works.',
      analogy: 'A commercial airplane has 4 engines, 2 pilots, redundant hydraulics, and backup computers. Losing one engine does not crash the plane. A car has one engine, one driver — not fault-tolerant. Modern systems are designed like airplanes, not cars. Each component has a backup, and the system continues operating when something fails.',
      diagram: `
  Single Point of Failure (SPOF):

  Users → [Single Server] → [Single DB]
  One failure = total outage

  Fault-Tolerant Architecture:

  Users → [Load Balancer (active)]
               ↕ heartbeat
          [Load Balancer (passive)]
               ↓
  ┌────────────────────────────────┐
  │ [Server1] [Server2] [Server3]  │ ← N+1 (one can fail)
  └────────────────────────────────┘
               ↓
  [Primary DB] → replication → [Replica DB (failover)]
               ↓
  [Replica DB 2 (geo backup, different region)]`,
      diagramSteps: [
        { step: 1, title: 'Eliminate SPOFs', description: 'Identify every component where failure = outage. Load balancers, databases, message brokers, DNS — all need redundancy.', diagram: 'Audit: LB (single) = SPOF. Fix: active/passive LB pair. DB (single) = SPOF. Fix: primary + replica.' },
        { step: 2, title: 'N+1 Redundancy', description: 'N+1: have one more capacity than needed. 3 servers for 2-server load. One can fail; remaining 2 handle the load.', diagram: 'Needed: 2 servers at peak. Deployed: 3. One fails → 2 remaining handle peak. Fine.' },
        { step: 3, title: 'Active-Active vs Active-Passive', description: 'Active-active: both are serving traffic (better utilization, seamless failover). Active-passive: one serves, one waits (simpler, wasted capacity, failover delay).', diagram: 'Active-active: LB1 handles 50%, LB2 handles 50%. LB1 fails → LB2 takes 100%. No delay.' },
        { step: 4, title: 'Graceful Degradation', description: 'When components fail, serve reduced functionality rather than returning errors. Recommendations fail → show popular items. Search fails → show cached results.', diagram: 'Recommendation service down → show generic featured items. User still can browse and buy.' }
      ],
      tradeoffs: [
        { title: 'Active-Active vs Active-Passive', optionA: 'Active-Active: zero failover delay, better utilization, more complex (state sync)', optionB: 'Active-Passive: simpler, failover takes seconds (health check delay), wasted standby capacity', recommendation: 'Active-active for stateless services (web servers). Active-passive for databases where one primary is simpler.', reasoning: 'Stateful active-active requires consensus on who is the real primary — complexity often not worth it for databases.' }
      ],
      whenToUse: [
        { scenario: 'Any production service with uptime SLOs', reason: 'SPOFs guarantee eventual outages — redundancy converts single failures into non-events' }
      ],
      whenNotToUse: [
        { scenario: 'Development environments and prototypes', reason: 'Redundancy costs money. Save it for production where failures have real impact.' }
      ],
      keyPoints: ['N+1: always have one more than needed', 'Active-active: both serve traffic. Active-passive: one waits on standby.', 'Graceful degradation: serve reduced functionality rather than full errors', 'Bulkheads isolate failures to prevent cascading (one service failing should not take down others)', 'Chaos engineering proactively validates fault tolerance assumptions'],
      quiz: [
        { type: 'multiple_choice', question: 'Your database has a primary and one replica. The primary crashes. What happens in an active-passive setup?', options: ['Both go down since they share state', 'The replica becomes the new primary (failover), causing a brief downtime during promotion', 'The system continues without interruption', 'Clients connect to the replica directly'], correct: 1, explanation: 'Active-passive requires promoting the replica to primary. This takes 30-60 seconds (health check detection + promotion) — a brief but non-zero outage.' },
        { type: 'fill_blank', question: 'Designing a component to serve reduced functionality during dependency failures, rather than complete errors, is called ________ degradation.', answer: 'graceful', explanation: 'Graceful degradation maintains partial service. Amazon shows cached product data when the recommendation engine is down rather than refusing to serve any page.' }
      ]
    },
    {
      title: 'Circuit Breakers & Bulkheads', slug: 'circuit-breakers-bulkheads', order: 3,
      summary: 'Circuit breakers prevent cascading failures by automatically stopping requests to a failing service. When error rate exceeds a threshold, the circuit "opens" — calls fail fast (no waiting for timeout). After a configured time, it "half-opens" to probe recovery. Bulkheads isolate failures: each service or client has its own thread pool/connection pool, so one slow dependency cannot exhaust shared resources and take down the entire system.',
      analogy: 'Circuit breaker: like an electrical circuit breaker — when too much current flows (too many errors), it trips. You don\'t keep trying to force electricity through a broken wire. After a cooldown, you test the circuit. If it holds, power is restored. Bulkhead: like watertight compartments in a ship. One compartment flooding does not sink the ship — the bulkhead contains the damage.',
      diagram: `
  Circuit Breaker States:

  CLOSED ──(error rate > 50%)──▶ OPEN ──(timeout 30s)──▶ HALF-OPEN
    ↑                                                          │
    │                                          test request   │
    └──────────────(success)────────────────────────────────────┘
                   (failure) ──────────────────────────▶ OPEN

  Bulkhead Pattern:

  Without Bulkhead:            With Bulkhead:
  [Thread Pool: 100 threads]   [UserService pool: 30]
                               [PaymentService pool: 30]
  InventoryService slow        [InventoryService pool: 30]
  → hogs 100 threads           InventoryService slow
  → UserService starves        → only 30 threads blocked
  → PaymentService fails       → UserService fine
  → Total outage               → PaymentService fine`,
      diagramSteps: [
        { step: 1, title: 'Circuit Breaker CLOSED (normal)', description: 'Requests flow normally. Error rate is tracked. Below threshold → circuit stays closed.', diagram: 'Client → CB(CLOSED) → ServiceA. Error rate 1% < 50% threshold → circuit stays closed.' },
        { step: 2, title: 'Circuit trips OPEN', description: 'Error rate exceeds threshold (50% in 10s window). Circuit opens. Calls fail immediately without hitting the service (fail-fast).', diagram: 'Error rate 70% → OPEN. Client → CB(OPEN) → instant error "service unavailable" (no timeout wait)' },
        { step: 3, title: 'HALF-OPEN probe', description: 'After timeout, one request is allowed through. If it succeeds → circuit closes. If it fails → stays open for another timeout period.', diagram: 'Timeout 30s → HALF-OPEN → one test request → ServiceA responds 200 → CLOSED → normal operation' },
        { step: 4, title: 'Bulkhead isolation', description: 'Each downstream service has its own thread pool. Slow service exhausts its pool, not the shared pool. Other services continue normally.', diagram: 'PaymentService pool=20: 20 slow calls → pool full → PaymentService requests fail fast. UserService pool=20: still has 20 threads → unaffected.' }
      ],
      tradeoffs: [
        { title: 'Fail-Fast vs Retry', optionA: 'Fail-fast (circuit breaker): immediately return error to caller. Fast, preserves resources, poor UX if overused.', optionB: 'Retry with backoff: retry failed requests. Better success rate, can overwhelm recovering services.', recommendation: 'Circuit breaker + limited retries together. CB prevents hammering failing services; retries handle transient errors.', reasoning: 'Retrying a dead service with 1000 clients causes a retry storm. CB stops the storm. Retry only on half-open probe.' }
      ],
      whenToUse: [
        { scenario: 'Every synchronous inter-service call in microservices', reason: 'Without circuit breakers, one slow service causes thread exhaustion and cascading failure across all callers' }
      ],
      whenNotToUse: [
        { scenario: 'Async operations with message queues', reason: 'Queues inherently decouple producers from consumers — messages buffer. Circuit breakers are for synchronous RPC.' }
      ],
      keyPoints: ['Circuit breaker: CLOSED → OPEN → HALF-OPEN based on error rate', 'Fail-fast in OPEN state — no timeout waiting, instant error to caller', 'Bulkhead: separate thread/connection pools per dependency', 'Combine circuit breakers, bulkheads, timeouts, and retries for resilience', 'Hystrix (Netflix), Resilience4j, Polly are popular circuit breaker libraries'],
      quiz: [
        { type: 'multiple_choice', question: 'A service has a 60% error rate over 10 seconds. The circuit breaker threshold is 50%. What state does it transition to?', options: ['Stays CLOSED (normal)', 'Transitions to OPEN (fail-fast)', 'Transitions to HALF-OPEN (probing)', 'Restarts the downstream service'], correct: 1, explanation: '60% > 50% threshold → circuit trips OPEN. All subsequent calls immediately return error without hitting the failing service.' },
        { type: 'multiple_choice', question: 'What does a bulkhead pattern prevent?', options: ['Network partitions', 'Slow dependencies exhausting shared resources and taking down unrelated services', 'Cache invalidation', 'Database deadlocks'], correct: 1, explanation: 'Without bulkheads, a slow dependency consumes all shared threads. Other unrelated calls cannot execute. Bulkheads isolate each dependency\'s resource pool.' },
        { type: 'fill_blank', question: 'When a circuit breaker is OPEN, calls fail ________ — instantly returning an error without waiting for a timeout.', answer: 'fast', explanation: 'Fail-fast is the key benefit. Instead of each caller waiting 30 seconds for a timeout, they get an immediate error and the system conserves resources.' }
      ]
    },
    {
      title: 'Chaos Engineering', slug: 'chaos-engineering', order: 4,
      summary: 'Chaos engineering proactively injects failures into production (or staging) systems to verify that redundancy, circuit breakers, and failover work as designed. The hypothesis: "We believe our system will survive X failure." Run an experiment to prove it. Netflix pioneered this with Chaos Monkey. Modern tools: Chaos Monkey, Gremlin, LitmusChaos. The alternative — discovering failures during a real outage — is worse.',
      analogy: 'A fire drill. You do not wait for a real fire to discover that the emergency exit is blocked and the sprinklers do not work. You test them deliberately when you have control. Chaos engineering is the fire drill for distributed systems — you find the gaps in your safety net before they find you.',
      diagram: `
  Chaos Engineering Process:

  1. STEADY STATE HYPOTHESIS
     "The system serves 99.9% of requests < 200ms"
     Baseline: error rate 0.05%, p99 latency 150ms

  2. EXPERIMENT
     Inject: kill one of 3 app servers randomly

  3. OBSERVE
     - Did load balancer redirect traffic? ✓
     - Did error rate spike? (< 0.5% acceptable) ✓
     - Did latency increase? (< 200ms p99) ✓

  4. RESULT
     Hypothesis confirmed → resilient to single server failure

  5. LEARNING (if failed)
     Hypothesis rejected → fix the gap → re-experiment`,
      diagramSteps: [
        { step: 1, title: 'Establish steady state', description: 'Measure baseline: error rate, latency, throughput. Define what "normal" looks like before injecting any failure.', diagram: 'Baseline: 1000 RPS, error rate 0.05%, p99 = 150ms → record as steady state' },
        { step: 2, title: 'Hypothesis and experiment', description: 'Form a hypothesis: "System will maintain < 0.5% error rate during loss of one AZ." Design the smallest experiment to test it.', diagram: 'Experiment: block traffic to AZ-1. Expect: AZ-2 and AZ-3 absorb traffic within 30 seconds.' },
        { step: 3, title: 'Inject and observe', description: 'Run the experiment. Monitor all SLIs. Have a kill switch ready. Minimize blast radius — start with one instance, not the entire AZ.', diagram: 'Kill 1 of 10 servers. Watch dashboards. Error rate 0.05% → 0.1% → 0.06% after LB redistribution. ✓' },
        { step: 4, title: 'Learn and automate', description: 'Confirmed? Automate this experiment to run periodically (weekly). Failed? Fix the gap and re-test before the real failure finds it.', diagram: 'Automated weekly: kill random server at 3pm Tuesday. Alert if hypothesis fails. SRE investigates.' }
      ],
      tradeoffs: [
        { title: 'Production vs Staging chaos', optionA: 'Production: real traffic, catches issues staging misses, risk to customers', optionB: 'Staging: no customer impact, may not reflect production behavior', recommendation: 'Start in staging. Graduate to production with small blast radius, kill switch, and off-peak timing.', reasoning: 'Netflix runs chaos in production because staging never fully mirrors production traffic and data. But they have years of practice and robust monitoring.' }
      ],
      whenToUse: [
        { scenario: 'After implementing redundancy to verify it works', reason: 'Redundancy untested is redundancy unverified — chaos engineering proves your assumptions' },
        { scenario: 'Before major traffic events (Black Friday, product launches)', reason: 'Finding that your failover is broken during a launch is catastrophic. Find it before.' }
      ],
      whenNotToUse: [
        { scenario: 'Before basic monitoring and alerting is in place', reason: 'You need to observe the impact of failures before injecting them. Blind chaos engineering is just chaos.' }
      ],
      keyPoints: ['Chaos engineering proves your fault tolerance works — not just that it exists', 'Always have a kill switch to stop the experiment immediately', 'Start with the smallest blast radius: one instance, not an entire AZ', 'Automate passing experiments to run periodically (continuous chaos)', 'Netflix, Amazon, Google run chaos in production — it is industry standard practice'],
      quiz: [
        { type: 'multiple_choice', question: 'What is the primary purpose of chaos engineering?', options: ['To find security vulnerabilities', 'To proactively discover failures before they happen in real incidents', 'To test new features under load', 'To measure system performance'], correct: 1, explanation: 'Chaos engineering validates that your redundancy and failover actually work. The alternative is discovering failures during a real incident at the worst possible time.' },
        { type: 'fill_blank', question: 'Before injecting failures, you must define a ________ state hypothesis: the normal behavior metrics the system should maintain.', answer: 'steady', explanation: 'Without a baseline (steady state), you cannot know if the experiment caused deviation. Define normal first, then inject chaos, then compare.' }
      ]
    },
    {
      title: 'Observability: Logs, Metrics & Traces', slug: 'observability-logs-metrics-traces', order: 5,
      summary: 'Observability is the ability to understand a system\'s internal state from its external outputs. The three pillars: Logs (event records), Metrics (numeric measurements over time), and Traces (request flows across services). Together they enable answering "why is this slow?" without deploying new code. Modern observability stack: ELK/Loki for logs, Prometheus/Grafana for metrics, Jaeger/Zipkin for traces.',
      analogy: 'A hospital patient monitoring system: Logs = nurse\'s notes ("patient complained of chest pain at 2:15pm"). Metrics = vital sign graphs (heart rate, blood pressure over time). Traces = patient journey through the hospital (registration → triage → X-ray → doctor → discharge). Each answers different questions about what is happening.',
      diagram: `
  Three Pillars of Observability:

  LOGS (what happened):
  2024-01-15 14:23:01 ERROR PaymentService: charge failed userId=123 amount=$99.99 error="card declined"
  2024-01-15 14:23:02 INFO  OrderService: order 456 status=FAILED compensation triggered

  METRICS (how the system is behaving):
  payment_success_rate{service="payment"} 0.97
  http_request_duration_p99{endpoint="/checkout"} 0.342s
  queue_depth{queue="orders"} 15234  ← alert if > 10000

  TRACES (where time was spent):
  Request /checkout trace_id=abc123:
  ├── UserService: 5ms (auth check)
  ├── CartService: 12ms (fetch cart)
  ├── PaymentService: 342ms ← BOTTLENECK
  │   ├── Stripe API: 310ms (external call)
  │   └── DB write: 32ms
  └── OrderService: 8ms`,
      diagramSteps: [
        { step: 1, title: 'Structured Logging', description: 'Logs must be structured (JSON) not freeform text. Include trace ID, user ID, service name, severity. Never log sensitive data (PII, tokens).', diagram: '{"time":"2024-01-15T14:23:01Z","level":"error","service":"payment","userId":"123","error":"card_declined","traceId":"abc123"}' },
        { step: 2, title: 'Metrics and Alerting', description: 'Instrument every service with counters, histograms, gauges. Alert on SLIs (error rate > 1%, p99 > 500ms). Grafana dashboards for visibility.', diagram: 'Prometheus: scrape /metrics every 15s. Grafana: dashboard. AlertManager: page oncall when threshold breached.' },
        { step: 3, title: 'Distributed Tracing', description: 'Generate a trace ID at the edge. Propagate via headers (x-trace-id). Each service logs spans with timing. Jaeger/Zipkin collect and visualize the trace.', diagram: 'Request → trace_id=abc123 → UserService(5ms) → PaymentService(342ms) → Stripe(310ms) → visualize in Jaeger' },
        { step: 4, title: 'Using traces to find bottlenecks', description: 'Trace shows exactly where time is spent. PaymentService 342ms breakdown: Stripe 310ms, DB 32ms. Fix: cache Stripe responses or move to async.', diagram: 'Without trace: "checkout is slow". With trace: "Stripe API is 91% of checkout latency → optimize that"' }
      ],
      tradeoffs: [
        { title: 'Logs vs Metrics for alerting', optionA: 'Alert on logs: flexible, catch any error pattern, high cardinality, expensive at scale', optionB: 'Alert on metrics: efficient, pre-aggregated, fixed cardinality, limited by what you instrument', recommendation: 'Alert on metrics (they are cheap and pre-aggregated). Use logs for investigation after an alert fires.', reasoning: 'Querying raw logs in real-time for alerting is expensive. Metrics are aggregated time-series — cheap to store and query.' }
      ],
      whenToUse: [
        { scenario: 'Every production system', reason: 'Without observability, debugging production issues means flying blind' }
      ],
      whenNotToUse: [
        { scenario: 'No specific exceptions — every production system needs all three', reason: 'Skipping any pillar creates blind spots. Traces without metrics miss systemic issues. Metrics without traces miss where exactly time is spent.' }
      ],
      keyPoints: ['Logs: what happened (structured JSON with trace ID)', 'Metrics: how the system is behaving (counters, histograms, gauges)', 'Traces: where time is spent across services (request flow visualization)', 'Always correlate with a trace ID — find the log from the slow trace', 'Stack: Prometheus + Grafana (metrics), ELK/Loki (logs), Jaeger/Zipkin (traces)'],
      quiz: [
        { type: 'multiple_choice', question: 'Users report checkout is slow. Which observability tool tells you exactly which microservice is responsible for the latency?', options: ['Logs — search for slow errors', 'Metrics — check error rate dashboard', 'Distributed traces — visualize the request flow timing', 'CPU metrics — find the hot server'], correct: 2, explanation: 'Distributed traces show a waterfall of each service call with timing. You immediately see "PaymentService: 342ms" is the bottleneck without guessing.' },
        { type: 'fill_blank', question: 'A ________ ID is generated at the entry point and propagated through all services, linking logs, metrics, and traces for a single request.', answer: 'trace', explanation: 'The trace ID is the connective tissue of observability. Given a slow trace ID, you can find all logs, metrics, and spans for that exact request.' }
      ]
    },
    {
      title: 'Disaster Recovery & Backup', slug: 'disaster-recovery-backup', order: 6,
      summary: 'Disaster Recovery (DR) plans for catastrophic events: datacenter fires, region outages, ransomware. Key metrics: RTO (Recovery Time Objective — how long to restore) and RPO (Recovery Point Objective — how much data loss is acceptable). Strategies range from cold backup (cheapest, slowest) to active-active multi-region (fastest, most expensive). Backups must be tested regularly — an untested backup is not a backup.',
      analogy: 'DR is like insurance and escape planning for a building. RTO: how long to evacuate and set up in the backup building. RPO: how much work is lost (documents not yet moved). Cold standby = office in storage unit (cheap but slow to set up). Active-active = two full offices both in use (instant failover, expensive). You must drill the evacuation — otherwise finding a fire evacuation takes 4 hours is too late.',
      diagram: `
  DR Strategies (cost vs recovery time):

  Cold Backup      Warm Standby     Hot Standby      Active-Active
  (cheapest)                                          (most expensive)
  ────────────────────────────────────────────────────────────────
  Backup stored    Standby DB       Standby          Both regions
  in S3/tape       replicated,      running,         serving live
  No standby       servers off      servers idle     traffic
  ────────────────────────────────────────────────────────────────
  RTO: hours       RTO: 30-60 min   RTO: 5-15 min    RTO: < 1 min
  RPO: hours       RPO: minutes     RPO: seconds      RPO: near zero
  ────────────────────────────────────────────────────────────────
  Small apps       Most web apps    Critical SaaS    Banking, infra`,
      diagramSteps: [
        { step: 1, title: 'Define RTO and RPO', description: 'RTO: max downtime. RPO: max data loss. Different services have different requirements. Define with stakeholders, not engineering alone.', diagram: 'User DB: RPO=1min, RTO=15min. Analytics: RPO=1hr, RTO=4hrs. Different solutions for different services.' },
        { step: 2, title: 'Implement backups', description: 'Automated backups to a different region. Test restore regularly (quarterly). Include point-in-time recovery (PITR) for databases.', diagram: 'Nightly full backup → S3 in different region. PITR: replay WAL to any minute in last 7 days.' },
        { step: 3, title: 'Implement replication for lower RPO', description: 'Database replication to DR region with async or sync replication. Async: low RPO but not zero. Sync: zero RPO but adds latency to writes.', diagram: 'Primary (us-east-1) → async replication → Replica (us-west-2). Lag < 1 second normally.' },
        { step: 4, title: 'DR drill — test your plan', description: 'Quarterly: simulate region failure. Run actual failover to DR. Measure actual RTO. Find and fix gaps. Document runbook.', diagram: 'Q1 drill: blocked primary traffic → failed over to DR → actual RTO: 22min (SLO: 15min) → fix alert routing' }
      ],
      tradeoffs: [
        { title: 'Active-Active vs Active-Passive', optionA: 'Active-Active: zero RTO, zero RPO, double cost, complex (data consistency)', optionB: 'Active-Passive: lower cost, RTO in minutes, simpler, hot standby idle', recommendation: 'Active-passive for most SaaS applications. Active-active only when business requires near-zero RTO.', reasoning: 'Active-active requires handling split-brain and data conflicts across regions. Most companies cannot justify the complexity and cost.' }
      ],
      whenToUse: [
        { scenario: 'All production systems', reason: 'Every system will eventually face a failure. DR planning determines whether it is a minor incident or a career-ending event.' }
      ],
      whenNotToUse: [
        { scenario: 'Internal tools with no SLA', reason: 'Prioritize DR investment based on business impact. An internal wiki going down for 4 hours is manageable.' }
      ],
      keyPoints: ['RTO = how long to restore. RPO = how much data loss is acceptable.', 'Test restores quarterly — untested backups are assumed to be broken', 'Cold backup: hours RTO. Active-active: near-zero RTO.', 'PITR (Point-In-Time Recovery) lets you restore to any moment in the backup window', '3-2-1 backup rule: 3 copies, 2 different media types, 1 offsite'],
      quiz: [
        { type: 'multiple_choice', question: 'Your RPO is 5 minutes. Which backup strategy meets this requirement?', options: ['Nightly full backup to tape', 'Hourly snapshots to S3', 'Continuous database replication to a standby (lag < 1 minute)', 'Weekly backup to a cold standby'], correct: 2, explanation: 'RPO of 5 minutes means max 5 minutes of data loss. Only continuous replication with sub-minute lag satisfies this. Hourly snapshots have up to 60 minutes of RPO.' },
        { type: 'fill_blank', question: 'RTO stands for Recovery ________ Objective — the maximum acceptable time for a system to be restored after a disaster.', answer: 'Time', explanation: 'RTO defines how long your business can tolerate an outage. A payment system might have RTO=1min; an internal analytics tool might have RTO=4hr.' }
      ]
    },
    {
      title: 'Deployment Strategies', slug: 'deployment-strategies', order: 7,
      summary: 'Modern systems require deployments without downtime. Rolling deployments gradually replace old instances. Blue-green deployment maintains two environments — traffic switches instantly at the load balancer. Canary releases send a small percentage of traffic to new code to catch issues before full rollout. Feature flags decouple deployment from release, enabling dark launches and instant rollback.',
      analogy: 'Rolling: repaint one room at a time while living in the house. Blue-Green: build an identical new house (green), move all furniture, then direct your address to the new house. If new house has problems, instantly redirect back to old house (blue). Canary: send 1% of the pizza delivery orders to the new kitchen — if complaints increase, stop routing to it.',
      diagram: `
  Rolling Deployment:
  v1 v1 v1 v1 → v2 v1 v1 v1 → v2 v2 v1 v1 → v2 v2 v2 v2
  Gradual, mixed versions serve traffic temporarily

  Blue-Green:
  Blue (v1) active    → test Green (v2) → switch LB → Green active
  [Blue=idle]                                          [Blue=ready for rollback]

  Canary:
  100% → v1
  Start canary: 5% → v2, 95% → v1
  Monitor: error rate, latency OK?
  Expand: 10% → 25% → 50% → 100% → v2 fully deployed

  Feature Flag:
  if (feature_flags.get("new_checkout_ui", user)):
      show_new_ui()
  else:
      show_old_ui()
  → Deploy code to 100%, enable flag to 1% of users`,
      diagramSteps: [
        { step: 1, title: 'Rolling deployment', description: 'Replace instances one at a time or in batches. Load balancer routes to both versions during rollout. No dedicated standby environment needed.', diagram: 'Kubernetes: RollingUpdate maxUnavailable=1 maxSurge=1. One pod down, one new pod up at a time.' },
        { step: 2, title: 'Blue-green deployment', description: 'Two identical environments: Blue (live) and Green (new). Deploy to Green, test, switch LB. Rollback = switch LB back to Blue instantly.', diagram: 'LB → Blue(100%). Deploy to Green. Test Green. LB → Green(100%). Rollback: LB → Blue(100%). < 30 seconds.' },
        { step: 3, title: 'Canary deployment', description: 'Route small % of traffic to new version. Monitor SLIs. If healthy, incrementally increase percentage. If errors spike, route 0% to canary.', diagram: '1% → v2. Error rate 0.05% (normal). 5% → 10% → 25% → 50% → 100%. All monitored automatically.' },
        { step: 4, title: 'Feature flags', description: 'Deploy code with feature behind a flag. Enable flag for 1% of users, internal beta, or specific user IDs. Decouple deployment (when code goes out) from release (when users see it).', diagram: 'Code deployed to 100% servers. Flag off for 99% of users. Flag on for QA team + 1% users. Monitor. Ramp up.' }
      ],
      tradeoffs: [
        { title: 'Blue-Green vs Canary', optionA: 'Blue-Green: instant switch, instant rollback, double infrastructure cost, all-or-nothing', optionB: 'Canary: gradual rollout, catches issues affecting subset, slower, partial rollback complexity', recommendation: 'Canary for large user-facing changes. Blue-green for infrastructure changes or when instant rollback is critical.', reasoning: 'Canary limits blast radius — a bug only affects 1% of users. Blue-green exposes 100% to the new version immediately after switch.' }
      ],
      whenToUse: [
        { scenario: 'All production deployments', reason: 'Zero-downtime deployments are a baseline requirement for any modern service' }
      ],
      whenNotToUse: [
        { scenario: 'Database schema changes — handled separately from code deployments', reason: 'Schema migrations are not deployable with these strategies alone. Use expand-contract pattern for backward-compatible schema changes.' }
      ],
      keyPoints: ['Rolling: gradual, mixed versions exist temporarily', 'Blue-green: instant switch, instant rollback, double infra cost', 'Canary: 1-5% exposure, progressive rollout based on SLI monitoring', 'Feature flags: decouple deploy from release, enable instant kill switch', 'Combine canary with feature flags for maximum safety'],
      quiz: [
        { type: 'multiple_choice', question: 'A critical bug is discovered in production. Which deployment strategy offers the fastest rollback?', options: ['Rolling deployment (roll back gradually)', 'Blue-green (switch LB back to blue instantly)', 'Canary (remove canary traffic)', 'Feature flag (disable flag)'], correct: 1, explanation: 'Blue-green rollback is a single load balancer switch — sub-second. Rolling rollback must replace instances one-by-one. Feature flags are fast too but require the code to be instrumented.' },
        { type: 'fill_blank', question: 'A canary deployment routes a small ________ of traffic to the new version to validate it before full rollout.', answer: 'percentage', explanation: 'Canary (1-5%) limits exposure. If the new version has a bug, only a small percentage of users are affected before the issue is detected and rollback occurs.' }
      ]
    },
    {
      title: 'Incident Management & On-Call', slug: 'incident-management-oncall', order: 8,
      summary: 'Incident management is the process of detecting, responding to, mitigating, and learning from production failures. Key roles: Incident Commander (coordinates response), Communications Lead (updates stakeholders), and Subject Matter Experts (fix the problem). Blameless post-mortems identify systemic causes, not scapegoats. On-call rotations distribute the burden and ensure coverage. Runbooks document responses to known failure modes.',
      analogy: 'A hospital emergency department: the charge nurse (Incident Commander) coordinates the team. The admissions clerk (Communications Lead) updates worried families. Specialists (SMEs) treat the patient. After the patient stabilizes, a case review (post-mortem) identifies what systemic improvements prevent the same issue next time. No one is blamed — the process is fixed.',
      diagram: `
  Incident Lifecycle:

  1. DETECT (< 5 min)
     Alert fires → on-call paged → acknowledges

  2. TRIAGE (5-15 min)
     Assess severity → S1/S2/S3/S4 → escalate if needed
     S1: major outage. S2: degraded. S3: minor. S4: informational

  3. MITIGATE (fastest path to recovery)
     Roll back deployment? Scale up? Enable circuit breaker?
     Goal: restore service FIRST, find root cause SECOND

  4. RESOLVE
     Confirm metrics back to normal → declare incident over

  5. POST-MORTEM (within 48 hours)
     Blameless. Timeline. Root cause. Action items.`,
      diagramSteps: [
        { step: 1, title: 'Alerting and on-call rotation', description: 'Alerts fire when SLIs breach SLOs. PagerDuty/OpsGenie pages on-call. Rotation distributes burden. Escalation policy: primary → secondary → manager.', diagram: 'Alert: error_rate > 5% for 2min → PagerDuty → page primary. No ack in 5min → page secondary.' },
        { step: 2, title: 'Incident command structure', description: 'Incident Commander owns the response. Delegates technical work to SMEs. Communications Lead writes status updates. Prevents chaos and duplicate work.', diagram: 'IC: "Alice, you\'re on DB. Bob, you\'re on API. Carol, write status page update every 15 min. I coordinate."' },
        { step: 3, title: 'Mitigation over root cause', description: 'During active incident: restore service first. Rollback, failover, disable feature flag, scale up — anything that stops user pain. Investigate cause after.', diagram: 'Outage: first rollback (2min) → service restored. Then investigate why the release caused the outage.' },
        { step: 4, title: 'Blameless post-mortem', description: 'Within 48h: document timeline, root cause, contributing factors. Action items with owners and due dates. Focus on system improvements, not individual mistakes.', diagram: 'Root cause: deploy without DB migration. Fix: automated migration check in CI/CD. Owner: DevOps. Due: 2 weeks.' }
      ],
      tradeoffs: [
        { title: 'Alert sensitivity vs fatigue', optionA: 'Many alerts: catch everything, alert fatigue → oncall ignores pages → real incidents missed', optionB: 'Few alerts: reduce noise, may miss slow degradation', recommendation: 'Alert on symptoms (SLIs), not causes. Every alert must be actionable. Review and remove false-positive alerts monthly.', reasoning: 'If oncall gets 50 pages per week for non-issues, they stop taking pages seriously. Alert quality over quantity.' }
      ],
      whenToUse: [
        { scenario: 'Any production outage or degradation', reason: 'Ad-hoc incident response without structure leads to chaos, duplicate work, and slow resolution' }
      ],
      whenNotToUse: [
        { scenario: 'Minor background issues not affecting users', reason: 'Incident process has overhead — use it for customer-impacting events, not every minor log error' }
      ],
      keyPoints: ['Restore service first, find root cause second — mitigation over investigation', 'Blameless post-mortems find systemic causes, not scapegoats', 'Every alert must be actionable — remove false-positive alerts aggressively', 'Runbooks document known failure modes and their resolution steps', 'Severity levels (S1-S4) determine response speed and escalation path'],
      quiz: [
        { type: 'multiple_choice', question: 'During an active incident, what is the first priority?', options: ['Find the root cause', 'Write the post-mortem', 'Restore service to users', 'Alert all stakeholders'], correct: 2, explanation: 'During an incident, mitigating user impact is the first priority. Roll back, failover, disable features — whatever restores service fastest. Investigate root cause after users are back online.' },
        { type: 'fill_blank', question: 'A ________ post-mortem focuses on systemic improvements, not individual blame — creating an environment where people report issues honestly.', answer: 'blameless', explanation: 'If engineers fear blame, they hide incidents and avoid risky but necessary improvements. Blameless culture surfaces problems earlier and fixes systems not people.' }
      ]
    }
  ];

  for (const lesson of t6lessons) {
    await prisma.designLesson.upsert({
      where: { slug: lesson.slug },
      update: {},
      create: {
        ...lesson,
        trackId: t6.id,
        diagramSteps: JSON.stringify(lesson.diagramSteps),
        tradeoffs: JSON.stringify(lesson.tradeoffs),
        whenToUse: JSON.stringify(lesson.whenToUse),
        whenNotToUse: JSON.stringify(lesson.whenNotToUse),
        keyPoints: JSON.stringify(lesson.keyPoints),
        quiz: JSON.stringify(lesson.quiz)
      }
    });
  }
  console.log('✅ Track 6: Reliability & Operations seeded');
}
