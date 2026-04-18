import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
function p(t:string,s:string,d:'EASY'|'MEDIUM'|'HARD',o:number,story:string,pat:string,patEx:string,vs:any[],sols:any,cx:any,mem:string,quiz:any[],hints:string[],mistakes:string[]){return{title:t,slug:s,difficulty:d,order:o,story,visualSteps:JSON.stringify(vs),pattern:pat,patternExplanation:patEx,solutions:JSON.stringify(sols),complexity:JSON.stringify(cx),memoryTrick:mem,quiz:JSON.stringify(quiz),hints:JSON.stringify(hints),commonMistakes:JSON.stringify(mistakes)};}
function sol(py:string,j:string,c:string){return{python:{code:py,lineExplanations:py.split('\n').map(()=>'')},java:{code:j,lineExplanations:j.split('\n').map(()=>'')},cpp:{code:c,lineExplanations:c.split('\n').map(()=>'')}}}
function mcq(q:string,o:string[],c:number,e:string){return{type:'multiple_choice',question:q,options:o,correct:c,explanation:e}}
async function seed(slug:string,problems:any[]){const topic=await prisma.topic.findUnique({where:{slug}});if(!topic)return;for(const prob of problems){const e=await prisma.problem.findUnique({where:{slug:prob.slug}});if(e)continue;await prisma.problem.create({data:{...prob,topicId:topic.id}});console.log(`  ✅ ${prob.slug}`);}}

async function main(){
console.log('🚀 FINAL BATCH: Completing all 150 problems!\n');

// ==================== 2D DP remaining (6 more) ====================
console.log('📊 2D DP (remaining)');
await seed('2d-dynamic-programming',[
p('Edit Distance','edit-distance','MEDIUM',6,"Min operations (insert/delete/replace) to transform word1→word2. dp[i][j] = edit distance for first i chars of word1 and first j of word2.",'2D DP Edit Distance','dp[i][j] = min ops for word1[0..i-1]→word2[0..j-1]. Match: dp[i-1][j-1]. Else: 1+min(insert,delete,replace).',[{step:1,description:"word1='horse',word2='ros'",diagram:"dp table → answer: 3 (horse→rorse→rose→ros)"}],
sol("def minDistance(w1,w2):\n    m,n=len(w1),len(w2)\n    dp=[[0]*(n+1) for _ in range(m+1)]\n    for i in range(m+1):dp[i][0]=i\n    for j in range(n+1):dp[0][j]=j\n    for i in range(1,m+1):\n        for j in range(1,n+1):\n            if w1[i-1]==w2[j-1]:dp[i][j]=dp[i-1][j-1]\n            else:dp[i][j]=1+min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])\n    return dp[m][n]","public int minDistance(String w1,String w2){int m=w1.length(),n=w2.length();int[][] dp=new int[m+1][n+1];for(int i=0;i<=m;i++)dp[i][0]=i;for(int j=0;j<=n;j++)dp[0][j]=j;for(int i=1;i<=m;i++)for(int j=1;j<=n;j++)dp[i][j]=w1.charAt(i-1)==w2.charAt(j-1)?dp[i-1][j-1]:1+Math.min(dp[i-1][j-1],Math.min(dp[i-1][j],dp[i][j-1]));return dp[m][n];}","int minDistance(string w1,string w2){int m=w1.size(),n=w2.size();vector<vector<int>> dp(m+1,vector<int>(n+1));for(int i=0;i<=m;i++)dp[i][0]=i;for(int j=0;j<=n;j++)dp[0][j]=j;for(int i=1;i<=m;i++)for(int j=1;j<=n;j++)dp[i][j]=w1[i-1]==w2[j-1]?dp[i-1][j-1]:1+min({dp[i-1][j-1],dp[i-1][j],dp[i][j-1]});return dp[m][n];}"),
{time:'O(m*n)',space:'O(m*n)',simpleExplanation:"Fill m×n table."},"EDIT DISTANCE = match→diagonal. Else 1+min(insert=left, delete=up, replace=diagonal).",
[mcq("What do the three operations correspond to in the DP table?",["Insert=dp[i][j-1], Delete=dp[i-1][j], Replace=dp[i-1][j-1]","All use dp[i-1][j-1]","Random","Insert=up, Delete=left"],0,"Insert adds a char to word1 (advance j). Delete removes from word1 (advance i). Replace changes one char (advance both).")],
["Build (m+1)×(n+1) table. Base: dp[i][0]=i, dp[0][j]=j.","Match: dp[i-1][j-1]. Mismatch: 1+min of 3 neighbors.",""],
["Not initializing base cases","Forgetting the +1 for mismatch operations"]
),
p('Burst Balloons','burst-balloons','HARD',7,"Pop balloons to maximize coins. When you pop balloon i, you get nums[left]*nums[i]*nums[right]. Think in reverse: which balloon is popped LAST in subarray? DP on intervals.",'Interval DP','dp[l][r] = max coins from bursting all balloons in (l,r) exclusive. Try each k as the LAST balloon popped in the range.',[{step:1,description:"nums=[3,1,5,8]",diagram:"Optimal order gives 167 coins"}],
sol("def maxCoins(nums):\n    nums=[1]+nums+[1]\n    n=len(nums)\n    dp=[[0]*n for _ in range(n)]\n    for length in range(2,n):\n        for l in range(n-length):\n            r=l+length\n            for k in range(l+1,r):\n                dp[l][r]=max(dp[l][r],dp[l][k]+dp[k][r]+nums[l]*nums[k]*nums[r])\n    return dp[0][n-1]","public int maxCoins(int[] nums){int n=nums.length+2;int[] a=new int[n];a[0]=a[n-1]=1;for(int i=0;i<nums.length;i++)a[i+1]=nums[i];int[][] dp=new int[n][n];for(int len=2;len<n;len++)for(int l=0;l<n-len;l++){int r=l+len;for(int k=l+1;k<r;k++)dp[l][r]=Math.max(dp[l][r],dp[l][k]+dp[k][r]+a[l]*a[k]*a[r]);}return dp[0][n-1];}","int maxCoins(vector<int>& nums){nums.insert(nums.begin(),1);nums.push_back(1);int n=nums.size();vector<vector<int>> dp(n,vector<int>(n));for(int len=2;len<n;len++)for(int l=0;l<n-len;l++){int r=l+len;for(int k=l+1;k<r;k++)dp[l][r]=max(dp[l][r],dp[l][k]+dp[k][r]+nums[l]*nums[k]*nums[r]);}return dp[0][n-1];}"),
{time:'O(n³)',space:'O(n²)',simpleExplanation:"Three nested loops over n elements."},"BURST BALLOONS = interval DP. Think: which balloon pops LAST in each range?",
[mcq("Why think about the LAST balloon?",["If k is last in (l,r), its neighbors are l and r (known!). If first, neighbors change.","It's easier","Convention","No difference"],0,"When k pops last, everything else in (l,r) is already gone. k's neighbors are the boundaries l and r.")],
["Add 1 at both ends. DP on intervals.","dp[l][r] = max over all k in (l,r) of: dp[l][k]+dp[k][r]+nums[l]*nums[k]*nums[r].","k is the LAST balloon popped in range."],
["Thinking about first pop instead of last","Not padding with 1s at boundaries"]
),
p('Regular Expression Matching','regular-expression-matching','HARD',8,"Match string with pattern containing '.' (any char) and '*' (zero or more of preceding). dp[i][j] = does s[0..i-1] match p[0..j-1]?",'2D DP Pattern Matching','dp[i][j] = match for first i of s and first j of p. Handle \'.\' (any) and \'*\' (zero or more).',[{step:1,description:"s='aab',p='c*a*b'",diagram:"c*=empty, a*=aa, b=b → match ✅"}],
sol("def isMatch(s,p):\n    m,n=len(s),len(p)\n    dp=[[False]*(n+1) for _ in range(m+1)]\n    dp[0][0]=True\n    for j in range(1,n+1):\n        if p[j-1]=='*':dp[0][j]=dp[0][j-2]\n    for i in range(1,m+1):\n        for j in range(1,n+1):\n            if p[j-1]=='.' or p[j-1]==s[i-1]:dp[i][j]=dp[i-1][j-1]\n            elif p[j-1]=='*':\n                dp[i][j]=dp[i][j-2]\n                if p[j-2]=='.' or p[j-2]==s[i-1]:dp[i][j]=dp[i][j]or dp[i-1][j]\n    return dp[m][n]","// Java: similar 2D DP approach","// C++: similar 2D DP approach"),
{time:'O(m*n)',space:'O(m*n)',simpleExplanation:"Fill m×n table."},"REGEX DP = handle '.', '*' with state transitions. '*' can match zero (dp[i][j-2]) or more (dp[i-1][j]).",
[mcq("What does '*' mean in this regex?",["Match any character","Match zero or more of the PRECEDING character","Match one or more","Wildcard"],1,"'a*' matches '', 'a', 'aa', 'aaa', etc. It's zero or more of the character BEFORE the *.")],
["dp[0][0]=true. Handle * matching empty strings in first row.","Match/dot: dp[i-1][j-1]. Star: dp[i][j-2] (0 matches) or dp[i-1][j] (1+ matches).",""],
["Not handling * matching zero occurrences","Confusing * (zero or more) with + (one or more)"]
),
p('Distinct Subsequences','distinct-subsequences','HARD',9,"Count distinct subsequences of s that equal t. dp[i][j] = ways to form t[0..j-1] from s[0..i-1]. Match: dp[i-1][j-1]+dp[i-1][j]. No match: dp[i-1][j].",'2D DP Count','dp[i][j] = ways to form first j of t from first i of s. Match: use it + skip it. No match: skip it.',[{step:1,description:"s='rabbbit',t='rabbit'",diagram:"3 ways to choose which 'b' to skip"}],
sol("def numDistinct(s,t):\n    m,n=len(s),len(t)\n    dp=[[0]*(n+1) for _ in range(m+1)]\n    for i in range(m+1):dp[i][0]=1\n    for i in range(1,m+1):\n        for j in range(1,n+1):\n            dp[i][j]=dp[i-1][j]\n            if s[i-1]==t[j-1]:dp[i][j]+=dp[i-1][j-1]\n    return dp[m][n]","// Java: similar 2D DP","// C++: similar 2D DP"),
{time:'O(m*n)',space:'O(m*n)',simpleExplanation:"Fill m×n table."},"DISTINCT SUBSEQ = match: use char (dp[i-1][j-1]) + skip char (dp[i-1][j]). No match: skip only.",
[mcq("If characters match, why do we add both dp[i-1][j-1] and dp[i-1][j]?",["We have two choices: USE this character in the match, or SKIP it and find the match elsewhere","We always take both","To double count","Convention"],0,"Match at (i,j): we can use s[i] to match t[j] (dp[i-1][j-1] ways) OR skip s[i] and match t[j] later (dp[i-1][j] ways). Sum both!")],
["dp[i][0]=1 for all i (empty t always matches).","Match: dp[i-1][j-1] + dp[i-1][j]. No match: dp[i-1][j].",""],
["Not handling base case dp[i][0]=1","Using max instead of sum"]
),
p('Interleaving String','interleaving-string','MEDIUM',10,"Can s3 be formed by interleaving s1 and s2? dp[i][j] = can first i of s1 and first j of s2 form first i+j of s3?",'2D DP Interleave Check','dp[i][j] = true if s1[0..i-1] and s2[0..j-1] can interleave to form s3[0..i+j-1].',[{step:1,description:"s1='aabcc',s2='dbbca',s3='aadbbcbcac'",diagram:"Interleave valid ✅"}],
sol("def isInterleave(s1,s2,s3):\n    m,n=len(s1),len(s2)\n    if m+n!=len(s3):return False\n    dp=[[False]*(n+1) for _ in range(m+1)]\n    dp[0][0]=True\n    for i in range(m+1):\n        for j in range(n+1):\n            if i>0 and s1[i-1]==s3[i+j-1] and dp[i-1][j]:dp[i][j]=True\n            if j>0 and s2[j-1]==s3[i+j-1] and dp[i][j-1]:dp[i][j]=True\n    return dp[m][n]","// Java: similar 2D DP","// C++: similar 2D DP"),
{time:'O(m*n)',space:'O(m*n)',simpleExplanation:"Fill m×n table."},"INTERLEAVE = dp[i][j] = can we form s3[0..i+j-1] from s1[0..i-1] and s2[0..j-1]?",
[mcq("When is interleaving impossible immediately?",["When s1 and s2 have common characters","When len(s1)+len(s2) != len(s3)","When any string is empty","Never"],1,"If lengths don't add up, interleaving is impossible regardless of characters.")],
["Quick check: len(s1)+len(s2)==len(s3).","dp[i][j] = true if s3[i+j-1] matches s1[i-1] (from above) or s2[j-1] (from left).",""],
["Not checking length first","Using greedy instead of DP"]
),
p('Longest Increasing Path in a Matrix','longest-increasing-path-in-a-matrix','HARD',11,"Find longest strictly increasing path in a matrix. DFS from each cell with memoization. dp[r][c] = longest path starting from (r,c).",'DFS + Memoization on Grid','For each cell, DFS to neighbors with larger values. Memoize results. Max of all cells = answer.',[{step:1,description:"matrix=[[9,9,4],[6,6,8],[2,1,1]]",diagram:"Path: 1→2→6→9, length=4"}],
sol("def longestIncreasingPath(matrix):\n    m,n=len(matrix),len(matrix[0])\n    memo={}\n    def dfs(r,c):\n        if (r,c) in memo:return memo[(r,c)]\n        best=1\n        for dr,dc in [(0,1),(0,-1),(1,0),(-1,0)]:\n            nr,nc=r+dr,c+dc\n            if 0<=nr<m and 0<=nc<n and matrix[nr][nc]>matrix[r][c]:\n                best=max(best,1+dfs(nr,nc))\n        memo[(r,c)]=best\n        return best\n    return max(dfs(r,c) for r in range(m) for c in range(n))","// Java: DFS+memo with int[][] cache","// C++: DFS+memo with vector<vector<int>>"),
{time:'O(m*n)',space:'O(m*n)',simpleExplanation:"Each cell computed once due to memoization."},"LONGEST INCREASING PATH = DFS + memo from each cell. Memoize to avoid recomputation!",
[mcq("Why does memoization make this efficient?",["Each cell's result is computed once and cached — no recomputation","Memoization sorts the matrix","It's faster than BFS","Memoization uses less memory"],0,"Without memo: O(4^(mn)) in worst case. With memo: each cell computed once = O(mn).")],
["DFS from each cell, only move to strictly larger neighbors.","Memoize: once computed, don't recompute.","Answer = max over all cells."],
["Not memoizing (exponential time)","Allowing equal values (must be strictly increasing)"]
),
]);

// ==================== GREEDY remaining (6 more) ====================
console.log('\n🏃 Greedy (remaining)');
await seed('greedy',[
p('Jump Game II','jump-game-ii','MEDIUM',3,"Min jumps to reach end. Greedy: track farthest reachable in current jump. When you reach the end of current range, you must jump.",'BFS-like Greedy','Track current range end and farthest. When reaching range end, jump. Count jumps.',[{step:1,description:"nums=[2,3,1,1,4]",diagram:"Jump 1: reach idx 1-2. Jump 2: from idx 1, reach idx 4. Answer: 2"}],
sol("def jump(nums):\n    jumps=end=farthest=0\n    for i in range(len(nums)-1):\n        farthest=max(farthest,i+nums[i])\n        if i==end:jumps+=1;end=farthest\n    return jumps","public int jump(int[] nums){int jumps=0,end=0,far=0;for(int i=0;i<nums.length-1;i++){far=Math.max(far,i+nums[i]);if(i==end){jumps++;end=far;}}return jumps;}","int jump(vector<int>& nums){int jumps=0,end=0,far=0;for(int i=0;i<(int)nums.size()-1;i++){far=max(far,i+nums[i]);if(i==end){jumps++;end=far;}}return jumps;}"),
{time:'O(n)',space:'O(1)',simpleExplanation:"One pass tracking range boundaries."},"JUMP GAME II = track range end. Reaching it = must jump. Count jumps!",
[mcq("When do we increment jumps?",["Every step","When we reach the boundary of the current jump's range","At the last element","When farthest increases"],1,"We expand our reach greedily. When we hit the end of what the current jump covers, we must take a new jump.")],
["Track farthest and current jump boundary.","When i reaches boundary → jump, update boundary to farthest.",""],
["Using BFS (works but more complex)","Jumping immediately instead of greedily"]
),
p('Gas Station','gas-station','MEDIUM',4,"Circular route with gas stations. Can you complete the circuit? If total gas ≥ total cost, solution exists. Start from the station after the point where running tank is lowest.",'Greedy Circular','If total gas ≥ total cost → solution exists. Track running tank. When it goes negative, restart from next station.',[{step:1,description:"gas=[1,2,3,4,5],cost=[3,4,5,1,2]",diagram:"Start at station 3 (gas=4,cost=1) → can complete circuit"}],
sol("def canCompleteCircuit(gas,cost):\n    if sum(gas)<sum(cost):return -1\n    tank=start=0\n    for i in range(len(gas)):\n        tank+=gas[i]-cost[i]\n        if tank<0:start=i+1;tank=0\n    return start","public int canCompleteCircuit(int[] gas,int[] cost){int total=0,tank=0,start=0;for(int i=0;i<gas.length;i++){total+=gas[i]-cost[i];tank+=gas[i]-cost[i];if(tank<0){start=i+1;tank=0;}}return total>=0?start:-1;}","int canCompleteCircuit(vector<int>& gas,vector<int>& cost){int total=0,tank=0,start=0;for(int i=0;i<gas.size();i++){total+=gas[i]-cost[i];tank+=gas[i]-cost[i];if(tank<0){start=i+1;tank=0;}}return total>=0?start:-1;}"),
{time:'O(n)',space:'O(1)',simpleExplanation:"One pass."},"GAS STATION = if total gas ≥ total cost, start after the point of lowest running tank.",
[mcq("If total gas < total cost, what's the answer?",["Start from station 0","Start from the last station","-1 (impossible)","Start from the station with most gas"],2,"If there's less gas than cost overall, no starting point works. Impossible!")],
["Check: sum(gas) ≥ sum(cost)? If not → -1.","Track running tank. When it goes negative → restart from next station.",""],
["Trying every starting point (O(n²))","Not checking total feasibility first"]
),
p('Hand of Straights','hand-of-straights','MEDIUM',5,"Group cards into groups of size W with consecutive values. Sort, greedily form groups starting from smallest available card.",'Greedy Sort + Count','Sort. For each smallest available card, try to form a group of W consecutive. Use frequency map.',[{step:1,description:"hand=[1,2,3,6,2,3,4,7,8],W=3",diagram:"[1,2,3],[2,3,4],[6,7,8] ✅"}],
sol("from collections import Counter\ndef isNStraightHand(hand,W):\n    if len(hand)%W!=0:return False\n    count=Counter(hand)\n    for card in sorted(count):\n        if count[card]>0:\n            freq=count[card]\n            for i in range(card,card+W):\n                if count[i]<freq:return False\n                count[i]-=freq\n    return True","// Java: TreeMap + greedy","// C++: map + greedy"),
{time:'O(n log n)',space:'O(n)',simpleExplanation:"Sort + one pass with frequency map."},"HAND OF STRAIGHTS = sort, greedily form groups from smallest. Frequency map to track counts.",
[mcq("Quick check before solving?",["Check if hand is sorted","Check if len(hand) % W == 0","Check for duplicates","No quick check"],1,"If total cards isn't divisible by group size, impossible to form equal groups!")],
["Quick check: len % W == 0.","Sort. For each smallest card, form a consecutive group of W.","Decrement counts. If any count goes negative → false."],
["Not sorting","Not checking divisibility first"]
),
p('Merge Triplets to Form Target','merge-triplets-to-form-target-triplet','MEDIUM',6,"Given triplets, can you merge (take max of each position) some triplets to form target? Greedy: a triplet is usable if no value exceeds the target. Collect all usable contributions.",'Greedy Filter + Collect','Filter triplets where no value > corresponding target value. From remaining, check if we can reach each target value.',[{step:1,description:"triplets=[[2,5,3],[1,8,4],[1,7,5]],target=[2,7,5]",diagram:"Use [2,5,3] and [1,7,5] → max each pos = [2,7,5] ✅"}],
sol("def mergeTriplets(triplets,target):\n    good=set()\n    for t in triplets:\n        if t[0]<=target[0] and t[1]<=target[1] and t[2]<=target[2]:\n            for i in range(3):\n                if t[i]==target[i]:good.add(i)\n    return len(good)==3","// Java: same filter+collect approach","// C++: same approach"),
{time:'O(n)',space:'O(1)',simpleExplanation:"One pass through triplets."},"MERGE TRIPLETS = filter out triplets with any value > target. From rest, can we match each target position?",
[mcq("Why filter out triplets with values exceeding target?",["They're invalid — taking max would push that position above target","They're too large","Convention","To simplify"],0,"If any value exceeds the target, merging this triplet would make that position too large. Can't use it.")],
["A triplet is usable only if ALL its values ≤ corresponding target.","From usable triplets, check: can each target value be achieved?","Need at least one usable triplet matching target[i] for each i."],
["Including triplets that exceed target in some position","Only checking one position instead of all three"]
),
p('Partition Labels','partition-labels','MEDIUM',7,"Partition string so each letter appears in at most one part. Greedy: for each char, track its last occurrence. Current partition ends where all chars in it have their last occurrence.",'Greedy Last Occurrence','Track last index of each char. Scan: expand current partition end to max(end, lastOccurrence[char]). When i==end → partition boundary.',[{step:1,description:"s='ababcbacadefegdehijhklij'",diagram:"Partitions: 'ababcbaca','defegde','hijhklij' → sizes [9,7,8]"}],
sol("def partitionLabels(s):\n    last={c:i for i,c in enumerate(s)}\n    result=[]\n    start=end=0\n    for i,c in enumerate(s):\n        end=max(end,last[c])\n        if i==end:result.append(end-start+1);start=i+1\n    return result","// Java: similar greedy approach","// C++: similar greedy approach"),
{time:'O(n)',space:'O(1)',simpleExplanation:"Two passes: build last map O(n), scan O(n). 26-char map = O(1)."},"PARTITION LABELS = track last occurrence. Expand partition end to max(end, last[char]). i==end → cut!",
[mcq("When do we make a cut?",["After each character","When current index equals the partition end (all chars in this partition are contained)","Every k characters","At special characters"],1,"When i reaches end, every character in the current partition has its last occurrence within [start, end]. Safe to cut!")],
["Build map: each char → its last index.","Scan left to right: expand end to max(end, last[c]).","When i==end → partition boundary. Record size, start new."],
["Not tracking last occurrence","Cutting too early before all chars are contained"]
),
p('Valid Parenthesis String','valid-parenthesis-string','MEDIUM',8,"Check if string with parens and * is valid. * can be open paren, close paren, or empty. Track min and max possible open count. If max < 0, invalid. If min < 0, reset to 0. End: min == 0.",'Greedy Min/Max Range','Track range [minOpen, maxOpen]. Open → both++. Close → both--. Star → min--, max++. Valid if min can reach 0.',[{step:1,description:"s='(*)'",diagram:"min/max: (0,0)→(1,1)→(0,2)→(-1→0,1). min=0 ✅"}],
sol("def checkValidString(s):\n    lo=hi=0\n    for c in s:\n        if c=='(':lo+=1;hi+=1\n        elif c==')':lo-=1;hi-=1\n        else:lo-=1;hi+=1\n        if hi<0:return False\n        lo=max(lo,0)\n    return lo==0","public boolean checkValidString(String s){int lo=0,hi=0;for(char c:s.toCharArray()){if(c=='('){lo++;hi++;}else if(c==')'){lo--;hi--;}else{lo--;hi++;}if(hi<0)return false;lo=Math.max(lo,0);}return lo==0;}","bool checkValidString(string s){int lo=0,hi=0;for(char c:s){if(c=='('){lo++;hi++;}else if(c==')'){lo--;hi--;}else{lo--;hi++;}if(hi<0)return false;lo=max(lo,0);}return lo==0;}"),
{time:'O(n)',space:'O(1)',simpleExplanation:"One pass, two variables."},"VALID PAREN WITH * = track [lo, hi] range of possible open counts. hi<0→invalid. lo=0 at end→valid.",
[mcq("What does '*' do to the range?",["Nothing","lo-- (treat as ')'), hi++ (treat as '(')","Both increment","Both decrement"],1,"* can be '(' (hi++), ')' (lo--), or empty. So it expands the range in both directions.")],
["Track min/max open parens possible.","'(' → lo++,hi++. ')' → lo--,hi--. '*' → lo--,hi++.","If hi<0 → too many ')'. End: lo==0 → valid."],
["Only tracking one counter instead of a range","Not clamping lo to 0"]
),
]);

// ==================== INTERVALS remaining (5 more) ====================
console.log('\n📅 Intervals (remaining)');
await seed('intervals',[
p('Insert Interval','insert-interval','MEDIUM',2,"Insert a new interval into sorted non-overlapping intervals. Three phases: add all before, merge overlapping, add all after.",'Three-Phase Insert','Phase 1: add intervals ending before new one starts. Phase 2: merge overlapping. Phase 3: add remaining.',[{step:1,description:"intervals=[[1,3],[6,9]], newInterval=[2,5]",diagram:"[1,3] overlaps [2,5] → merge to [1,5]. Result: [[1,5],[6,9]]"}],
sol("def insert(intervals,newInterval):\n    result=[]\n    for i,itv in enumerate(intervals):\n        if itv[1]<newInterval[0]:result.append(itv)\n        elif itv[0]>newInterval[1]:return result+[newInterval]+intervals[i:]\n        else:newInterval=[min(newInterval[0],itv[0]),max(newInterval[1],itv[1])]\n    result.append(newInterval)\n    return result","// Java: similar three-phase approach","// C++: similar approach"),
{time:'O(n)',space:'O(n)',simpleExplanation:"Single pass through intervals."},"INSERT INTERVAL = three phases: before (no overlap) → merge (overlapping) → after (no overlap).",
[mcq("When does an existing interval overlap with the new one?",["Always","When existing.start ≤ new.end AND existing.end ≥ new.start","When they have the same start","Never"],1,"Overlap: neither completely before nor completely after. Their ranges intersect.")],
["Add non-overlapping intervals before new one.","Merge all overlapping intervals with new one.","Add remaining non-overlapping intervals."],
["Not handling the case where new interval goes at the end","Wrong merge logic"]
),
p('Non-Overlapping Intervals','non-overlapping-intervals','MEDIUM',3,"Min removals to make intervals non-overlapping. Sort by end. Greedily keep intervals that end earliest (leave room for more).",'Greedy Sort by End','Sort by end time. Keep intervals that don\'t overlap with the last kept one. Count removals.',[{step:1,description:"intervals=[[1,2],[2,3],[3,4],[1,3]]",diagram:"Remove [1,3]. Keep [1,2],[2,3],[3,4]. Removals=1"}],
sol("def eraseOverlapIntervals(intervals):\n    intervals.sort(key=lambda x:x[1])\n    count=0;end=float('-inf')\n    for s,e in intervals:\n        if s>=end:end=e\n        else:count+=1\n    return count","// Java: sort by end, greedy","// C++: sort by end, greedy"),
{time:'O(n log n)',space:'O(1)',simpleExplanation:"Sort + one pass."},"NON-OVERLAPPING = sort by END. Keep earliest-ending non-overlapping intervals. Count skipped.",
[mcq("Why sort by end time?",["Ending earliest leaves the most room for future intervals","It's alphabetical","Start time is harder","No reason"],0,"Greedy: picking the interval that ends earliest maximizes remaining space for future intervals.")],
["Sort by end time.","If current start ≥ last end → keep it (update end).","Otherwise → must remove it (count++)."],
["Sorting by start time instead of end","Removing the wrong interval on overlap"]
),
p('Meeting Rooms','meeting-rooms','EASY',4,"Can a person attend all meetings? Sort by start. If any meeting starts before the previous ends → conflict!",'Sort + Overlap Check','Sort by start. Check consecutive pairs for overlap.',[{step:1,description:"intervals=[[0,30],[5,10],[15,20]]",diagram:"[0,30] overlaps [5,10] → can't attend all!"}],
sol("def canAttendMeetings(intervals):\n    intervals.sort()\n    for i in range(1,len(intervals)):\n        if intervals[i][0]<intervals[i-1][1]:return False\n    return True","// Java: sort + check","// C++: sort + check"),
{time:'O(n log n)',space:'O(1)',simpleExplanation:"Sort + one pass."},"MEETING ROOMS = sort by start. Any overlap between consecutive → can't attend all.",
[mcq("When do two meetings conflict?",["When they're on the same day","When meeting2.start < meeting1.end","When they have the same duration","Always"],1,"If the next meeting starts before the current one ends, there's an overlap = conflict.")],
["Sort by start time.","Check if any meeting starts before the previous ends.","Any overlap → false."],
["Not sorting first","Using <= instead of < for overlap"]
),
p('Meeting Rooms II','meeting-rooms-ii','MEDIUM',5,"Min meeting rooms needed = max concurrent meetings. Sort starts and ends separately. Sweep: start → room++, end → room--. Track peak.",'Two-Pointer Sweep / Min-Heap','Sort starts and ends. Two pointers sweep through. Start → need room. End → free room. Track max rooms.',[{step:1,description:"intervals=[[0,30],[5,10],[15,20]]",diagram:"At time 5: 2 rooms needed ([0,30] and [5,10]). Peak=2"}],
sol("def minMeetingRooms(intervals):\n    starts=sorted(i[0] for i in intervals)\n    ends=sorted(i[1] for i in intervals)\n    rooms=maxRooms=e=0\n    for s in starts:\n        rooms+=1\n        while ends[e]<=s:rooms-=1;e+=1\n        maxRooms=max(maxRooms,rooms)\n    return maxRooms","// Java: min-heap or two-pointer","// C++: similar approach"),
{time:'O(n log n)',space:'O(n)',simpleExplanation:"Sort + sweep."},"MEETING ROOMS II = sort starts and ends. Sweep line: start→rooms++, end→rooms--. Peak = answer.",
[mcq("What's the key insight?",["Count max simultaneous meetings at any point in time","Count total meetings","Find the longest meeting","Count room switches"],0,"The minimum rooms needed equals the maximum number of overlapping meetings at any instant.")],
["Sort start times and end times separately.","Sweep through starts. For each start, free up rooms whose meetings ended.","Track peak room count."],
["Using one sorted list instead of two","Not freeing rooms when meetings end"]
),
p('Minimum Interval to Include Each Query','minimum-interval-to-include-each-query','HARD',6,"For each query point, find the smallest interval containing it. Sort intervals by size. Process queries sorted. Use sweep or priority queue.",'Sort + Min-Heap','Sort intervals by start. For each query (sorted), add applicable intervals to min-heap by size. Pop expired. Top = answer.',[{step:1,description:"intervals=[[1,4],[2,4],[3,6],[4,4]], queries=[2,3,4,5]",diagram:"q=2→[1,4](size 4), q=3→[2,4](size 3), etc."}],
sol("import heapq\ndef minInterval(intervals,queries):\n    intervals.sort()\n    result={}\n    heap=[]\n    i=0\n    for q in sorted(queries):\n        while i<len(intervals) and intervals[i][0]<=q:\n            l,r=intervals[i]\n            heapq.heappush(heap,(r-l+1,r))\n            i+=1\n        while heap and heap[0][1]<q:\n            heapq.heappop(heap)\n        result[q]=heap[0][0] if heap else -1\n    return [result[q] for q in queries]","// Java: similar sort + min-heap","// C++: similar approach"),
{time:'O((n+q) log n)',space:'O(n+q)',simpleExplanation:"Sort + heap operations."},"MIN INTERVAL = sort intervals + queries. Heap of (size, end). Add applicable, remove expired, top = answer.",
[mcq("Why process queries in sorted order?",["So we can add intervals incrementally (sweep line)","It's required","Faster","No reason"],0,"Sorted queries allow a sweep: we only add intervals once as we move right. No need to re-scan.")],
["Sort intervals by start, queries by value.","For each query: add applicable intervals to heap (by size). Remove expired.","Heap top = smallest containing interval."],
["Processing queries in original order with heap","Not removing expired intervals from heap"]
),
]);

// ==================== MATH remaining (7 more) ====================
console.log('\n🔢 Math & Geometry (remaining)');
await seed('math-geometry',[
p('Spiral Matrix','spiral-matrix','MEDIUM',2,"Traverse matrix in spiral order. Maintain 4 boundaries (top,bottom,left,right). Go right→down→left→up, shrinking boundaries each time.",'Boundary Shrinking','Four pointers: top,bottom,left,right. Traverse: right across top row (top++), down right col (right--), left across bottom (bottom--), up left col (left++).',[{step:1,description:"[[1,2,3],[4,5,6],[7,8,9]]",diagram:"Spiral: 1,2,3,6,9,8,7,4,5"}],
sol("def spiralOrder(matrix):\n    result=[]\n    top,bottom,left,right=0,len(matrix)-1,0,len(matrix[0])-1\n    while top<=bottom and left<=right:\n        for c in range(left,right+1):result.append(matrix[top][c])\n        top+=1\n        for r in range(top,bottom+1):result.append(matrix[r][right])\n        right-=1\n        if top<=bottom:\n            for c in range(right,left-1,-1):result.append(matrix[bottom][c])\n            bottom-=1\n        if left<=right:\n            for r in range(bottom,top-1,-1):result.append(matrix[r][left])\n            left+=1\n    return result","// Java: same boundary approach","// C++: same approach"),
{time:'O(m*n)',space:'O(1)',simpleExplanation:"Visit each element once."},"SPIRAL = 4 boundaries. Go right→down→left→up, shrink after each pass.",
[mcq("Why check top<=bottom before going left?",["After going right and down, the top boundary moved — there might not be a bottom row left to traverse","It's optional","For performance","Convention"],0,"After right+down traversals, top might have passed bottom. Without the check, we'd re-traverse rows.")],
["Maintain top,bottom,left,right boundaries.","Traverse: right(top++), down(right--), left(bottom--), up(left++).","Check boundaries before left and up passes."],
["Not checking boundaries before reverse passes","Off-by-one in boundary updates"]
),
p('Set Matrix Zeroes','set-matrix-zeroes','MEDIUM',3,"If any element is 0, set its entire row and column to 0. Use first row/column as markers to achieve O(1) extra space.",'In-Place Marking','Use first row and column as flags. Scan for zeros → mark first row/col. Then fill zeros. Handle first row/col separately.',[{step:1,description:"[[1,1,1],[1,0,1],[1,1,1]]",diagram:"Zero at (1,1) → row 1 and col 1 become 0"}],
sol("def setZeroes(matrix):\n    m,n=len(matrix),len(matrix[0])\n    firstRow=any(matrix[0][j]==0 for j in range(n))\n    firstCol=any(matrix[i][0]==0 for i in range(m))\n    for i in range(1,m):\n        for j in range(1,n):\n            if matrix[i][j]==0:matrix[i][0]=0;matrix[0][j]=0\n    for i in range(1,m):\n        for j in range(1,n):\n            if matrix[i][0]==0 or matrix[0][j]==0:matrix[i][j]=0\n    if firstRow:\n        for j in range(n):matrix[0][j]=0\n    if firstCol:\n        for i in range(m):matrix[i][0]=0","// Java: same in-place marking","// C++: same approach"),
{time:'O(m*n)',space:'O(1)',simpleExplanation:"Two passes over matrix. O(1) extra space using first row/col as markers."},"SET ZEROES = use first row/col as markers. Two passes: mark, then fill. Handle first row/col separately.",
[mcq("Why handle first row/column separately?",["They're used as markers, so their original zero-status must be saved before marking","They're special","It's optional","For efficiency"],0,"First row/col are our marker arrays. If they originally had zeros, we need to know BEFORE we use them for marking.")],
["Save whether first row/col have zeros.","Use first row/col to mark which rows/cols need zeroing.","Fill based on markers. Then handle first row/col."],
["Not saving first row/col status before marking","Using O(m+n) extra arrays when O(1) is possible"]
),
p('Happy Number','happy-number','EASY',4,"Sum of squares of digits repeatedly. If reaches 1 → happy. If loops forever → not happy. Detect cycle with fast/slow pointers!",'Floyd\'s Cycle Detection','Compute digit square sum repeatedly. Use slow/fast pointers. If slow==fast and ==1 → happy. If loop without reaching 1 → not.',[{step:1,description:"n=19",diagram:"1²+9²=82→8²+2²=68→6²+8²=100→1→happy! ✅"}],
sol("def isHappy(n):\n    def next_num(n):\n        s=0\n        while n:\n            n,d=divmod(n,10)\n            s+=d*d\n        return s\n    slow=fast=n\n    while True:\n        slow=next_num(slow)\n        fast=next_num(next_num(fast))\n        if slow==fast:break\n    return slow==1","// Java: same Floyd's approach","// C++: same approach"),
{time:'O(log n)',space:'O(1)',simpleExplanation:"Digit processing is O(log n). Cycle detection converges quickly."},"HAPPY NUMBER = digit square sum → cycle detection. Reaches 1 = happy!",
[mcq("How to detect if it loops forever?",["Use a hash set of seen numbers","Floyd's slow/fast pointer on the sequence","Count iterations","Check if n > 1000"],0,"Both work! Hash set uses O(n) space. Floyd's uses O(1) space.")],
["Repeatedly compute sum of digit squares.","Detect cycle: hash set or slow/fast pointers.","Cycle landing on 1 = happy. Other cycle = not happy."],
["Not detecting the cycle (infinite loop)","Using only hash set when Floyd's is O(1) space"]
),
p('Plus One','plus-one','EASY',5,"Add 1 to a number represented as array of digits. Start from the end. If digit < 9, increment and done. If 9, set to 0 and carry.",'Simple Addition with Carry','Iterate from last digit. If < 9 → increment, return. If 9 → set to 0, continue (carry). If all 9s → prepend 1.',[{step:1,description:"digits=[1,2,3]",diagram:"[1,2,4] ✅. For [9,9,9] → [1,0,0,0]"}],
sol("def plusOne(digits):\n    for i in range(len(digits)-1,-1,-1):\n        if digits[i]<9:\n            digits[i]+=1\n            return digits\n        digits[i]=0\n    return [1]+digits","// Java: same approach","// C++: same approach"),
{time:'O(n)',space:'O(1)',simpleExplanation:"At most one pass from right to left."},"PLUS ONE = from right: <9 → increment, done. =9 → set 0, carry. All 9s → prepend 1.",
[mcq("What's the special case?",["digits = [0]","All digits are 9 (999→1000, need extra digit)","Single digit","Even length"],1,"999+1=1000 needs an extra digit. Handle by prepending 1 to the all-zeros array.")],
["Start from rightmost digit.","If < 9: increment, return immediately.","If 9: set to 0, move left (carry). All 9s: prepend 1."],
["Forgetting the all-9s case","Converting to integer (overflow for large arrays)"]
),
p('Pow(x, n)','powx-n','MEDIUM',6,"Calculate x^n efficiently. Naive: multiply n times = O(n). Fast: x^n = (x^(n/2))² if even, x*(x^(n/2))² if odd = O(log n)!",'Fast Exponentiation','x^n = (x²)^(n/2) for even n. x*(x²)^(n/2-1) for odd. Halve n each step = O(log n).',[{step:1,description:"x=2, n=10",diagram:"2^10 = (2²)^5 = 4^5 = 4*(4²)^2 = 4*16^2 = 4*256 = 1024"}],
sol("def myPow(x,n):\n    if n<0:x=1/x;n=-n\n    result=1\n    while n:\n        if n%2:result*=x\n        x*=x;n//=2\n    return result","public double myPow(double x,int n){long N=n;if(N<0){x=1/x;N=-N;}double res=1;while(N>0){if(N%2==1)res*=x;x*=x;N/=2;}return res;}","double myPow(double x,int n){long N=n;if(N<0){x=1/x;N=-N;}double res=1;while(N){if(N&1)res*=x;x*=x;N>>=1;}return res;}"),
{time:'O(log n)',space:'O(1)',simpleExplanation:"Halve n each step = log n iterations."},"FAST POW = square x and halve n each step. If n is odd, multiply result by x.",
[mcq("Why is this O(log n)?",["We halve n each iteration, so it takes log₂(n) steps","We skip half the multiplications","It's approximate","Magic"],0,"Dividing n by 2 each step: n → n/2 → n/4 → ... → 1 takes log₂(n) steps.")],
["Handle negative n: x = 1/x, n = -n.","Loop: if n is odd → multiply result by x. Square x, halve n.",""],
["Not handling n < 0","Integer overflow when negating MIN_INT"]
),
p('Multiply Strings','multiply-strings','MEDIUM',7,"Multiply two number strings without converting to int. Grade school multiplication: multiply digit by digit, accumulate in result array at position i+j and i+j+1.",'Grade School Multiplication','Result array of size m+n. For each digit pair: result[i+j+1] += digit1 * digit2. Handle carries.',[{step:1,description:"num1='123',num2='456'",diagram:"Grade school: 123*456 = 56088"}],
sol("def multiply(num1,num2):\n    m,n=len(num1),len(num2)\n    result=[0]*(m+n)\n    for i in range(m-1,-1,-1):\n        for j in range(n-1,-1,-1):\n            mul=int(num1[i])*int(num2[j])\n            p1,p2=i+j,i+j+1\n            total=mul+result[p2]\n            result[p2]=total%10\n            result[p1]+=total//10\n    res=''.join(map(str,result)).lstrip('0')\n    return res or '0'","// Java: same digit-by-digit approach","// C++: same approach"),
{time:'O(m*n)',space:'O(m+n)',simpleExplanation:"Multiply each digit pair = O(m*n). Result array = O(m+n)."},"STRING MULTIPLY = result[i+j+1] += digit_i * digit_j. Handle carry to result[i+j].",
[mcq("Why is the result array size m+n?",["Maximum digits in product of m-digit and n-digit numbers is m+n","It's always m+n digits","For padding","Convention"],0,"99*99=9801. 2 digits × 2 digits = at most 4 digits. m-digit × n-digit ≤ m+n digits.")],
["Create result array of size m+n.","For each pair (i,j): multiply digits, add to result[i+j+1].","Carry: result[i+j] += result[i+j+1]/10. Strip leading zeros."],
["Not handling carries correctly","Forgetting to strip leading zeros","Not handling '0' * anything = '0'"]
),
p('Detect Squares','detect-squares','MEDIUM',8,"Design a data structure that adds points and counts squares. For a query point, find all points with same x or y, then check if the other two corners exist.",'Point Counting + HashSet','Store point counts. For query (qx,qy), find points (qx,py) with same x. Check if (px,qy) and (px,py) exist for a square.',[{step:1,description:"Add (3,10),(11,1),(3,1),(11,10). Count with query (11,1)",diagram:"Square: (3,1),(3,10),(11,10),(11,1) → count 1"}],
sol("from collections import Counter\nclass DetectSquares:\n    def __init__(self):\n        self.points=Counter()\n        self.xmap={}\n    def add(self,point):\n        x,y=point\n        self.points[(x,y)]+=1\n        self.xmap.setdefault(x,[]).append(y)\n    def count(self,point):\n        qx,qy=point\n        result=0\n        for py in self.xmap.get(qx,[]):\n            if py==qy:continue\n            side=abs(py-qy)\n            for px in [qx+side,qx-side]:\n                result+=self.points[(px,qy)]*self.points[(px,py)]\n        return result","// Java: HashMap approach","// C++: unordered_map approach"),
{time:'O(n) per count',space:'O(n)',simpleExplanation:"For each point with same x, check two candidate squares."},"DETECT SQUARES = for query point, iterate points with same x. Check if remaining 2 corners exist.",
[mcq("How many corners do we need to check?",["All 4","2 — we have 2 points (query + same-x point), just check the other 2","1","3"],1,"Given query (qx,qy) and a point (qx,py), the side length is |py-qy|. Check (qx±side, qy) and (qx±side, py).")],
["Store points with counts. Group by x-coordinate.","For query, find points sharing x → determines side length.","Check if remaining two corners exist (count their occurrences)."],
["Only checking axis-aligned squares","Not handling duplicate points (count multiplicity)"]
),
]);

// ==================== BIT MANIPULATION remaining (4 more) ====================
console.log('\n⚡ Bit Manipulation (remaining)');
await seed('bit-manipulation',[
p('Reverse Bits','reverse-bits','EASY',4,"Reverse all 32 bits. Extract rightmost bit, shift result left, add bit. Repeat 32 times.",'Bit-by-Bit Extraction','Loop 32 times: extract last bit of n (n&1), add to result shifted left. Shift n right.',[{step:1,description:"n=43261596 (00000010100101000001111010011100)",diagram:"Reversed: 964176192 (00111001011110000010100101000000)"}],
sol("def reverseBits(n):\n    result=0\n    for _ in range(32):\n        result=(result<<1)|(n&1)\n        n>>=1\n    return result","public int reverseBits(int n){int res=0;for(int i=0;i<32;i++){res=(res<<1)|(n&1);n>>=1;}return res;}","uint32_t reverseBits(uint32_t n){uint32_t res=0;for(int i=0;i<32;i++){res=(res<<1)|(n&1);n>>=1;}return res;}"),
{time:'O(1)',space:'O(1)',simpleExplanation:"Always 32 iterations. Constant time."},"REVERSE BITS = 32 times: shift result left, OR with last bit of n, shift n right.",
[mcq("What does (result << 1) | (n & 1) do?",["Shifts result left to make room, then adds n's last bit","Multiplies by 2","XORs the bits","Swaps two bits"],0,"<< 1 makes room for a new bit. | (n&1) puts n's rightmost bit there.")],
["Loop 32 times.","Extract last bit: n & 1.","Shift result left, OR the bit. Shift n right."],
["Looping wrong number of times","Not handling unsigned correctly"]
),
p('Missing Number','missing-number','EASY',5,"Array of n numbers in [0,n] with one missing. XOR approach: XOR all indices AND all values. Pairs cancel, leaving the missing number!",'XOR or Math Sum','XOR all values and indices 0..n. Or: expected sum - actual sum = missing.',[{step:1,description:"nums=[3,0,1]",diagram:"Expected 0^1^2^3=0. Actual 3^0^1=2. XOR: 0^2=2. Missing=2 ✅"}],
sol("def missingNumber(nums):\n    n=len(nums)\n    return n*(n+1)//2-sum(nums)","public int missingNumber(int[] nums){int n=nums.length,sum=n*(n+1)/2;for(int x:nums)sum-=x;return sum;}","int missingNumber(vector<int>& nums){int n=nums.size(),sum=n*(n+1)/2;for(int x:nums)sum-=x;return sum;}"),
{time:'O(n)',space:'O(1)',simpleExplanation:"One pass. Math formula or XOR."},"MISSING NUMBER = expected_sum - actual_sum. Or XOR all values with indices.",
[mcq("Why does sum formula work?",["Sum of 0..n = n*(n+1)/2. Subtract actual sum = the missing number.","It's approximate","Only works for sorted arrays","Coincidence"],0,"The difference between expected total and actual total must be the missing number.")],
["Method 1: n*(n+1)/2 - sum(nums).","Method 2: XOR all nums with 0..n.","Both are O(n) time, O(1) space."],
["Integer overflow with large n (use XOR instead)","Not including n in the range"]
),
p('Sum of Two Integers','sum-of-two-integers','MEDIUM',6,"Add two integers without + or -. Use bit operations! a XOR b = sum without carry. a AND b << 1 = carry. Repeat until no carry.",'Bit Manipulation Addition','XOR = sum without carry. AND << 1 = carry. Loop until carry = 0.',[{step:1,description:"a=1(01), b=2(10)",diagram:"XOR=11(3), AND<<1=00(0). No carry → answer=3 ✅"}],
sol("def getSum(a,b):\n    mask=0xFFFFFFFF\n    while b&mask:\n        carry=(a&b)<<1\n        a=a^b\n        b=carry\n    return a if b==0 else a&mask","public int getSum(int a,int b){while(b!=0){int carry=(a&b)<<1;a=a^b;b=carry;}return a;}","int getSum(int a,int b){while(b){int carry=(a&b)<<1;a=a^b;b=carry;}return a;}"),
{time:'O(1)',space:'O(1)',simpleExplanation:"At most 32 iterations (one per bit)."},"BIT ADD = XOR (sum without carry) + AND<<1 (carry). Loop until carry=0.",
[mcq("What does XOR compute in this context?",["The sum of each bit position without considering carries","The carry","The product","The difference"],0,"XOR adds bits: 0+0=0, 0+1=1, 1+0=1, 1+1=0 (no carry). It's addition without carries!")],
["a XOR b = sum without carry.","(a AND b) << 1 = carry to next position.","Repeat with new a=sum, b=carry until carry=0."],
["Not handling negative numbers in Python (need mask)","Infinite loop without mask in Python"]
),
p('Reverse Integer','reverse-integer','MEDIUM',7,"Reverse digits of an integer. Pop last digit (x%10), push to result (result*10+digit). Check for 32-bit overflow.",'Modular Arithmetic','Pop digits from x with %10, build result with *10+digit. Check overflow at each step.',[{step:1,description:"x=123",diagram:"Pop 3→result=3. Pop 2→result=32. Pop 1→result=321 ✅"}],
sol("def reverse(x):\n    sign=1 if x>=0 else -1\n    x=abs(x)\n    result=0\n    while x:\n        result=result*10+x%10\n        x//=10\n    result*=sign\n    return result if -2**31<=result<=2**31-1 else 0","public int reverse(int x){int res=0;while(x!=0){int digit=x%10;x/=10;if(res>Integer.MAX_VALUE/10||(res==Integer.MAX_VALUE/10&&digit>7))return 0;if(res<Integer.MIN_VALUE/10||(res==Integer.MIN_VALUE/10&&digit<-8))return 0;res=res*10+digit;}return res;}","int reverse(int x){int res=0;while(x){int d=x%10;x/=10;if(res>INT_MAX/10||res<INT_MIN/10)return 0;res=res*10+d;}return res;}"),
{time:'O(log n)',space:'O(1)',simpleExplanation:"Process each digit = O(log₁₀ n)."},"REVERSE INT = pop digit (x%10), push (result*10+digit). Check overflow before pushing!",
[mcq("When does overflow happen?",["When result has more than 10 digits","When result > MAX_INT/10 before the last multiplication","When x is negative","Never in Python"],1,"Before result = result*10+digit, check if result > MAX_INT/10. If so, the multiplication would overflow.")],
["Pop digit: digit = x%10, x = x/10.","Push: result = result*10 + digit.","Check overflow BEFORE multiplication!"],
["Not checking for overflow","Incorrect overflow check timing"]
),
]);

const total=await prisma.problem.count();
console.log(`\n🎉🎉🎉 COMPLETE! Total problems: ${total}/150`);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
