import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function p(title: string, slug: string, difficulty: 'EASY'|'MEDIUM'|'HARD', order: number, story: string, pattern: string, patternExplanation: string, visualSteps: any[], solutions: any, complexity: any, memoryTrick: string, quiz: any[], hints: string[], commonMistakes: string[]) {
  return { title, slug, difficulty, order, story, visualSteps: JSON.stringify(visualSteps), pattern, patternExplanation, solutions: JSON.stringify(solutions), complexity: JSON.stringify(complexity), memoryTrick, quiz: JSON.stringify(quiz), hints: JSON.stringify(hints), commonMistakes: JSON.stringify(commonMistakes) };
}
function sol(py: string, java: string, cpp: string) {
  return { python: { code: py, lineExplanations: py.split('\n').map(() => '') }, java: { code: java, lineExplanations: java.split('\n').map(() => '') }, cpp: { code: cpp, lineExplanations: cpp.split('\n').map(() => '') } };
}
function mcq(q: string, opts: string[], correct: number, explanation: string) {
  return { type: 'multiple_choice', question: q, options: opts, correct, explanation };
}

async function seedTopic(slug: string, problems: any[]) {
  const topic = await prisma.topic.findUnique({ where: { slug } });
  if (!topic) { console.log(`Topic ${slug} not found`); return; }
  for (const prob of problems) {
    const existing = await prisma.problem.findUnique({ where: { slug: prob.slug } });
    if (existing) { console.log(`  ⏭ ${prob.slug}`); continue; }
    await prisma.problem.create({ data: { ...prob, topicId: topic.id } });
    console.log(`  ✅ ${prob.slug}`);
  }
}

async function main() {
  console.log('🚀 Seeding Batch 2: Binary Search, Linked List, Trees, Tries, Heap...\n');

  // ==================== BINARY SEARCH (7) ====================
  console.log('🔍 Binary Search');
  await seedTopic('binary-search', [
    p('Binary Search', 'binary-search', 'EASY', 1,
      "Guess a number between 1 and 100. Each guess, someone says 'higher' or 'lower'. You'd start at 50, then 25 or 75, etc. That's binary search! Cut the search space in half each time on a sorted array.",
      'Binary Search', 'Compare target with middle element. If target < middle, search left half. If target > middle, search right half. Repeat until found.',
      [{ step: 1, description: "nums = [-1,0,3,5,9,12], target = 9", diagram: "mid=3(idx 2), 9>3 → search right" },
       { step: 2, description: "mid=9(idx 4), 9==9 → found!", diagram: "Return index 4 ✅" }],
      sol("def search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: left = mid + 1\n        else: right = mid - 1\n    return -1",
        "public int search(int[] nums, int target) {\n    int l = 0, r = nums.length - 1;\n    while (l <= r) {\n        int mid = l + (r - l) / 2;\n        if (nums[mid] == target) return mid;\n        else if (nums[mid] < target) l = mid + 1;\n        else r = mid - 1;\n    }\n    return -1;\n}",
        "int search(vector<int>& nums, int target) {\n    int l = 0, r = nums.size() - 1;\n    while (l <= r) {\n        int mid = l + (r - l) / 2;\n        if (nums[mid] == target) return mid;\n        else if (nums[mid] < target) l = mid + 1;\n        else r = mid - 1;\n    }\n    return -1;\n}"),
      { time: 'O(log n)', space: 'O(1)', simpleExplanation: "Cut in half each step. 1 billion items → only 30 steps!" },
      "SORTED ARRAY + FIND = BINARY SEARCH. Always use left + (right-left)/2 to avoid overflow!",
      [mcq("Why is binary search O(log n)?", ["It uses less memory", "It halves the search space each step", "It sorts while searching", "It checks every other element"], 1, "Each comparison eliminates half the remaining elements. n → n/2 → n/4 → ... → 1 = log₂(n) steps.")],
      ["The array is sorted. Do you need to check every element?", "Check the middle. Which half must the target be in?", "Repeat: left=mid+1 or right=mid-1 based on comparison."],
      ["Using (left+right)/2 which can overflow — use left+(right-left)/2", "Off-by-one: left<=right not left<right", "Not handling 'not found' case"]
    ),
    p('Search a 2D Matrix', 'search-a-2d-matrix', 'MEDIUM', 2,
      "A 2D matrix where each row is sorted and the first element of each row is greater than the last of the previous row. Treat it as one long sorted array! Index i maps to matrix[i/cols][i%cols]. Binary search on the flattened index.",
      'Binary Search on Virtual 1D Array', "Treat the 2D matrix as a flattened sorted array. Map index i to row=i/cols, col=i%cols. Apply standard binary search.",
      [{ step: 1, description: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target=3", diagram: "Flattened: [1,3,5,7,10,11,16,20,23,30,34,60]" },
       { step: 2, description: "Binary search on 12 elements, mid=5→11, target<11→left half", diagram: "Found 3 at index 1 → row 0, col 1 ✅" }],
      sol("def searchMatrix(matrix, target):\n    m, n = len(matrix), len(matrix[0])\n    l, r = 0, m * n - 1\n    while l <= r:\n        mid = (l + r) // 2\n        val = matrix[mid // n][mid % n]\n        if val == target: return True\n        elif val < target: l = mid + 1\n        else: r = mid - 1\n    return False",
        "public boolean searchMatrix(int[][] matrix, int target) {\n    int m = matrix.length, n = matrix[0].length;\n    int l = 0, r = m*n-1;\n    while (l <= r) {\n        int mid = l+(r-l)/2;\n        int val = matrix[mid/n][mid%n];\n        if (val == target) return true;\n        else if (val < target) l = mid+1;\n        else r = mid-1;\n    }\n    return false;\n}",
        "bool searchMatrix(vector<vector<int>>& matrix, int target) {\n    int m=matrix.size(), n=matrix[0].size();\n    int l=0, r=m*n-1;\n    while (l<=r) {\n        int mid=l+(r-l)/2;\n        int val=matrix[mid/n][mid%n];\n        if (val==target) return true;\n        else if (val<target) l=mid+1;\n        else r=mid-1;\n    }\n    return false;\n}"),
      { time: 'O(log(m*n))', space: 'O(1)', simpleExplanation: "Binary search on m*n elements = O(log(m*n)). No extra space!" },
      "2D SORTED MATRIX = flatten mentally. row=idx/cols, col=idx%cols. Then standard binary search!",
      [mcq("How to convert flat index to 2D?", ["row=idx*cols, col=idx/cols", "row=idx/cols, col=idx%cols", "row=idx%rows, col=idx/rows", "Can't be done"], 1, "Integer division gives the row, modulo gives the column. idx=7 in a 4-column matrix → row 1, col 3.")],
      ["Can you treat the whole matrix as one sorted list?", "Map flat index to 2D: row=i/cols, col=i%cols.", "Standard binary search on indices 0 to m*n-1."],
      ["Using wrong formula for index mapping", "Forgetting m*n-1 as right boundary"]
    ),
    p('Koko Eating Bananas', 'koko-eating-bananas', 'MEDIUM', 3,
      "Koko eats bananas at speed k per hour. She has h hours to eat all piles. Find the minimum k. Binary search on k! Too slow → increase k. Fast enough → try slower. Binary search on the ANSWER, not the input!",
      'Binary Search on Answer', "When the answer is a number in a range and you can check if a value works, binary search on the answer! Check if speed k finishes in time. Too slow → go higher. Fast enough → try lower.",
      [{ step: 1, description: "piles = [3,6,7,11], h = 8", diagram: "Try k=4: ceil(3/4)+ceil(6/4)+ceil(7/4)+ceil(11/4) = 1+2+2+3 = 8 ≤ 8 ✅" },
       { step: 2, description: "Try k=3: 1+2+3+4 = 10 > 8 ❌. Answer = 4", diagram: "Min speed = 4" }],
      sol("import math\ndef minEatingSpeed(piles, h):\n    left, right = 1, max(piles)\n    while left < right:\n        mid = (left + right) // 2\n        hours = sum(math.ceil(p / mid) for p in piles)\n        if hours <= h: right = mid\n        else: left = mid + 1\n    return left",
        "public int minEatingSpeed(int[] piles, int h) {\n    int l = 1, r = Arrays.stream(piles).max().getAsInt();\n    while (l < r) {\n        int mid = l+(r-l)/2;\n        int hours = 0;\n        for (int p : piles) hours += (p+mid-1)/mid;\n        if (hours <= h) r = mid;\n        else l = mid+1;\n    }\n    return l;\n}",
        "int minEatingSpeed(vector<int>& piles, int h) {\n    int l=1, r=*max_element(piles.begin(),piles.end());\n    while (l<r) {\n        int mid=l+(r-l)/2;\n        long hours=0;\n        for (int p:piles) hours+=(p+mid-1)/mid;\n        if (hours<=h) r=mid;\n        else l=mid+1;\n    }\n    return l;\n}"),
      { time: 'O(n log m)', space: 'O(1)', simpleExplanation: "Binary search on speed 1..max(piles) = O(log m). Check each speed = O(n). Total: O(n log m)." },
      "MINIMIZE/MAXIMIZE a value with a feasibility check → BINARY SEARCH ON THE ANSWER!",
      [mcq("What are we binary searching on?", ["The pile indices", "The number of hours", "The eating speed k", "The pile sizes"], 2, "We binary search on the answer (speed k), not the input array. For each k, we check if it's feasible.")],
      ["The answer (speed) is in a range [1, max(piles)]. Can you binary search it?", "For a given speed, calculate total hours needed.", "If hours ≤ h → speed works, try smaller. Else → need faster."],
      ["Not using ceiling division (each pile takes ceil(pile/k) hours)", "Binary search bounds wrong (left=0 instead of 1)", "Integer overflow on sum of hours"]
    ),
    p('Find Minimum in Rotated Sorted Array', 'find-minimum-in-rotated-sorted-array', 'MEDIUM', 4,
      "A sorted array was rotated: [3,4,5,1,2]. The minimum is at the 'rotation point'. Binary search! If mid > right, the rotation point (min) is in the right half. Otherwise, it's in the left half (including mid).",
      'Modified Binary Search', "Compare mid with right boundary. If nums[mid] > nums[right], min is in right half. Otherwise min is in left half (including mid).",
      [{ step: 1, description: "nums = [3,4,5,1,2]", diagram: "mid=5, right=2, 5>2 → min is right of mid" },
       { step: 2, description: "left=1, right=2, mid=1 → min found!", diagram: "Minimum = 1 ✅" }],
      sol("def findMin(nums):\n    left, right = 0, len(nums) - 1\n    while left < right:\n        mid = (left + right) // 2\n        if nums[mid] > nums[right]: left = mid + 1\n        else: right = mid\n    return nums[left]",
        "public int findMin(int[] nums) {\n    int l=0, r=nums.length-1;\n    while (l<r) {\n        int mid=l+(r-l)/2;\n        if (nums[mid]>nums[r]) l=mid+1;\n        else r=mid;\n    }\n    return nums[l];\n}",
        "int findMin(vector<int>& nums) {\n    int l=0, r=nums.size()-1;\n    while (l<r) {\n        int mid=l+(r-l)/2;\n        if (nums[mid]>nums[r]) l=mid+1;\n        else r=mid;\n    }\n    return nums[l];\n}"),
      { time: 'O(log n)', space: 'O(1)', simpleExplanation: "Binary search halves the space each time = O(log n)." },
      "ROTATED SORTED = compare mid with RIGHT. Mid > right → min is right. Else → min is left (including mid).",
      [mcq("Why compare with right and not left?", ["It's a convention", "The left boundary could be in the unsorted part after rotation", "Comparing with right always tells us which side the min is on", "No difference"], 2, "After rotation, comparing mid with right determines which half is sorted and which contains the rotation point.")],
      ["In a rotated sorted array, one half is always sorted.", "Compare mid with the right boundary.", "nums[mid] > nums[right] → rotation point is in the right half → left = mid + 1."],
      ["Using left<= right instead of left<right", "Setting right=mid-1 instead of right=mid (might skip the min)", "Comparing with left instead of right"]
    ),
    p('Search in Rotated Sorted Array', 'search-in-rotated-sorted-array', 'MEDIUM', 5,
      "Search in a rotated sorted array. One half is always sorted! Check which half is sorted, then check if target is in that sorted half. If yes, search there. If no, search the other half.",
      'Binary Search (Identify Sorted Half)', "One half is always sorted. Check if target falls in the sorted range. If yes, search there. Otherwise search the other half.",
      [{ step: 1, description: "nums = [4,5,6,7,0,1,2], target=0", diagram: "mid=7, left half [4,5,6,7] is sorted, 0 not in [4,7] → go right" },
       { step: 2, description: "Right half: [0,1,2], mid=1, go left → found 0!", diagram: "Return index 4 ✅" }],
      sol("def search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target: return mid\n        if nums[left] <= nums[mid]:\n            if nums[left] <= target < nums[mid]: right = mid - 1\n            else: left = mid + 1\n        else:\n            if nums[mid] < target <= nums[right]: left = mid + 1\n            else: right = mid - 1\n    return -1",
        "public int search(int[] nums, int target) {\n    int l=0, r=nums.length-1;\n    while (l<=r) {\n        int mid=l+(r-l)/2;\n        if (nums[mid]==target) return mid;\n        if (nums[l]<=nums[mid]) {\n            if (nums[l]<=target && target<nums[mid]) r=mid-1;\n            else l=mid+1;\n        } else {\n            if (nums[mid]<target && target<=nums[r]) l=mid+1;\n            else r=mid-1;\n        }\n    }\n    return -1;\n}",
        "int search(vector<int>& nums, int target) {\n    int l=0, r=nums.size()-1;\n    while (l<=r) {\n        int mid=l+(r-l)/2;\n        if (nums[mid]==target) return mid;\n        if (nums[l]<=nums[mid]) {\n            if (nums[l]<=target&&target<nums[mid]) r=mid-1;\n            else l=mid+1;\n        } else {\n            if (nums[mid]<target&&target<=nums[r]) l=mid+1;\n            else r=mid-1;\n        }\n    }\n    return -1;\n}"),
      { time: 'O(log n)', space: 'O(1)', simpleExplanation: "Binary search = O(log n). No extra space." },
      "SEARCH ROTATED = find sorted half, check if target is in it. Binary search with an extra check.",
      [mcq("How do you determine which half is sorted?", ["The shorter half is sorted", "If nums[left] <= nums[mid], left half is sorted", "Check if mid is the pivot", "Both halves are always sorted"], 1, "If nums[left] <= nums[mid], the left half is sorted (no rotation break). Otherwise, the right half is sorted.")],
      ["One half is always properly sorted after rotation.", "Check which half is sorted: nums[left] <= nums[mid] → left is sorted.", "If target is in the sorted half's range, search there. Otherwise search the other half."],
      ["Not handling the case where left==mid", "Wrong boundary checks (using <= vs <)", "Forgetting that the sorted half is contiguous"]
    ),
    p('Time Based Key-Value Store', 'time-based-key-value-store', 'MEDIUM', 6,
      "Store key-value pairs with timestamps. When getting a value, return the one with the largest timestamp ≤ the given timestamp. Use a hash map of lists + binary search! Each key stores sorted timestamps, binary search for the right one.",
      'HashMap + Binary Search', "Store {key: [(timestamp, value), ...]} sorted by timestamp. On get, binary search for largest timestamp ≤ target.",
      [{ step: 1, description: "set('foo','bar',1), set('foo','bar2',4)", diagram: "foo: [(1,'bar'), (4,'bar2')]" },
       { step: 2, description: "get('foo',4)→'bar2', get('foo',3)→'bar'", diagram: "Binary search for timestamp ≤ target" }],
      sol("class TimeMap:\n    def __init__(self):\n        self.store = {}\n    def set(self, key, value, timestamp):\n        if key not in self.store: self.store[key] = []\n        self.store[key].append((timestamp, value))\n    def get(self, key, timestamp):\n        if key not in self.store: return ''\n        arr = self.store[key]\n        left, right = 0, len(arr) - 1\n        result = ''\n        while left <= right:\n            mid = (left + right) // 2\n            if arr[mid][0] <= timestamp:\n                result = arr[mid][1]\n                left = mid + 1\n            else: right = mid - 1\n        return result",
        "class TimeMap {\n    Map<String,List<int[]>> map = new HashMap<>();\n    Map<String,List<String>> vals = new HashMap<>();\n    public void set(String key, String value, int ts) {\n        map.computeIfAbsent(key, k->new ArrayList<>()).add(new int[]{ts});\n        vals.computeIfAbsent(key, k->new ArrayList<>()).add(value);\n    }\n    public String get(String key, int ts) {\n        if (!map.containsKey(key)) return \"\";\n        var times=map.get(key); var values=vals.get(key);\n        int l=0, r=times.size()-1; String res=\"\";\n        while (l<=r) {\n            int mid=l+(r-l)/2;\n            if (times.get(mid)[0]<=ts) { res=values.get(mid); l=mid+1; }\n            else r=mid-1;\n        }\n        return res;\n    }\n}",
        "class TimeMap {\n    unordered_map<string,vector<pair<int,string>>> store;\npublic:\n    void set(string key, string value, int ts) { store[key].push_back({ts,value}); }\n    string get(string key, int ts) {\n        auto& arr=store[key];\n        int l=0, r=arr.size()-1; string res=\"\";\n        while (l<=r) {\n            int mid=l+(r-l)/2;\n            if (arr[mid].first<=ts) { res=arr[mid].second; l=mid+1; }\n            else r=mid-1;\n        }\n        return res;\n    }\n};"),
      { time: 'O(log n) per get', space: 'O(n)', simpleExplanation: "Set is O(1). Get uses binary search = O(log n)." },
      "TIMESTAMP LOOKUP = HashMap + Binary Search. Store sorted timestamps per key, binary search for ≤ target.",
      [mcq("Why binary search instead of linear scan?", ["Timestamps are sorted (set is called in increasing order)", "Binary search is O(log n) vs O(n)", "Both A and B", "Linear scan is fine"], 2, "Since timestamps are inserted in order, the list is sorted. Binary search exploits this for O(log n) lookups.")],
      ["Timestamps come in increasing order, so each key's list is sorted.", "For get, find the largest timestamp ≤ the query.", "Binary search! Track the best result where arr[mid].timestamp ≤ target."],
      ["Not handling the case where no timestamp ≤ target exists", "Off-by-one in binary search bounds"]
    ),
    p('Median of Two Sorted Arrays', 'median-of-two-sorted-arrays', 'HARD', 7,
      "Find the median of two sorted arrays in O(log(min(m,n))). Binary search on the partition of the smaller array. The partition divides both arrays into left/right halves where all left ≤ all right.",
      'Binary Search on Partition', "Binary search on the smaller array to find a partition where maxLeft1 ≤ minRight2 and maxLeft2 ≤ minRight1.",
      [{ step: 1, description: "nums1=[1,3], nums2=[2]", diagram: "Merged: [1,2,3], median=2" },
       { step: 2, description: "Binary search partition on shorter array", diagram: "Find cut where left half ≤ right half" }],
      sol("def findMedianSortedArrays(nums1, nums2):\n    if len(nums1) > len(nums2): nums1, nums2 = nums2, nums1\n    m, n = len(nums1), len(nums2)\n    left, right = 0, m\n    while left <= right:\n        i = (left + right) // 2\n        j = (m + n + 1) // 2 - i\n        l1 = nums1[i-1] if i > 0 else float('-inf')\n        r1 = nums1[i] if i < m else float('inf')\n        l2 = nums2[j-1] if j > 0 else float('-inf')\n        r2 = nums2[j] if j < n else float('inf')\n        if l1 <= r2 and l2 <= r1:\n            if (m + n) % 2: return max(l1, l2)\n            return (max(l1, l2) + min(r1, r2)) / 2\n        elif l1 > r2: right = i - 1\n        else: left = i + 1",
        "public double findMedianSortedArrays(int[] A, int[] B) {\n    if (A.length > B.length) return findMedianSortedArrays(B, A);\n    int m=A.length, n=B.length, l=0, r=m;\n    while (l<=r) {\n        int i=l+(r-l)/2, j=(m+n+1)/2-i;\n        int l1=i>0?A[i-1]:Integer.MIN_VALUE, r1=i<m?A[i]:Integer.MAX_VALUE;\n        int l2=j>0?B[j-1]:Integer.MIN_VALUE, r2=j<n?B[j]:Integer.MAX_VALUE;\n        if (l1<=r2&&l2<=r1) return (m+n)%2==1?Math.max(l1,l2):(Math.max(l1,l2)+Math.min(r1,r2))/2.0;\n        else if (l1>r2) r=i-1;\n        else l=i+1;\n    }\n    return 0;\n}",
        "double findMedianSortedArrays(vector<int>& A, vector<int>& B) {\n    if (A.size()>B.size()) swap(A,B);\n    int m=A.size(), n=B.size(), l=0, r=m;\n    while (l<=r) {\n        int i=l+(r-l)/2, j=(m+n+1)/2-i;\n        int l1=i>0?A[i-1]:INT_MIN, r1=i<m?A[i]:INT_MAX;\n        int l2=j>0?B[j-1]:INT_MIN, r2=j<n?B[j]:INT_MAX;\n        if (l1<=r2&&l2<=r1) return (m+n)%2?max(l1,l2):(max(l1,l2)+min(r1,r2))/2.0;\n        else if (l1>r2) r=i-1;\n        else l=i+1;\n    }\n    return 0;\n}"),
      { time: 'O(log(min(m,n)))', space: 'O(1)', simpleExplanation: "Binary search on the shorter array only!" },
      "MEDIAN OF TWO SORTED = binary search partition on SHORTER array. Ensure maxLeft ≤ minRight on both sides.",
      [mcq("Why search on the shorter array?", ["To minimize time complexity to O(log(min(m,n)))", "The shorter array is easier to handle", "It doesn't matter", "Longer arrays can't be searched"], 0, "Searching the shorter array gives O(log(min(m,n))) which is optimal. The other array's partition is determined.")],
      ["The median splits the combined array in half. Can you find the split point?", "Binary search on partitioning the shorter array. The other partition is determined.", "Valid partition: maxLeft1 ≤ minRight2 AND maxLeft2 ≤ minRight1."],
      ["Not ensuring you search the shorter array", "Edge cases when partition is at 0 or m", "Integer vs float division for even-length result"]
    ),
  ]);

  // ==================== LINKED LIST (11) ====================
  console.log('\n🔗 Linked List');
  await seedTopic('linked-list', [
    p('Reverse Linked List', 'reverse-linked-list', 'EASY', 1,
      "Imagine a chain of people holding hands: A→B→C→D. To reverse, each person lets go of the person ahead and grabs the person behind. Use three pointers: prev, current, next. At each step, point current backward, then move forward.",
      'Three Pointers (Iterative Reverse)', "Keep prev, curr, next. Save next, point curr→prev, advance prev and curr. Repeat until done.",
      [{ step: 1, description: "1→2→3→4→null", diagram: "prev=null, curr=1" },
       { step: 2, description: "Save next=2, point 1→null, prev=1, curr=2", diagram: "null←1  2→3→4" },
       { step: 3, description: "Continue until reversed", diagram: "null←1←2←3←4" }],
      sol("def reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        next_node = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_node\n    return prev",
        "public ListNode reverseList(ListNode head) {\n    ListNode prev=null, curr=head;\n    while (curr!=null) {\n        ListNode next=curr.next;\n        curr.next=prev;\n        prev=curr;\n        curr=next;\n    }\n    return prev;\n}",
        "ListNode* reverseList(ListNode* head) {\n    ListNode *prev=nullptr, *curr=head;\n    while (curr) {\n        ListNode *next=curr->next;\n        curr->next=prev;\n        prev=curr;\n        curr=next;\n    }\n    return prev;\n}"),
      { time: 'O(n)', space: 'O(1)', simpleExplanation: "Visit each node once = O(n). Only 3 pointers = O(1) space!" },
      "REVERSE LIST = prev, curr, next. Save next, point backwards, advance. Prev becomes new head!",
      [mcq("What are the three pointers for?", ["Speed, slow, fast", "prev (already reversed), curr (being processed), next (saved for later)", "head, tail, middle", "start, end, pivot"], 1, "prev tracks the reversed portion, curr is the node being flipped, next saves the rest of the list before we break the link.")],
      ["You need to reverse the direction of each arrow (next pointer).", "If you just change curr.next, you lose the rest of the list. Save it first!", "Three pointers: prev=null, curr=head. Save next, point curr→prev, advance both."],
      ["Losing the reference to the rest of the list (not saving next first)", "Not returning prev (it's the new head, not curr which is null)"]
    ),
    p('Merge Two Sorted Lists', 'merge-two-sorted-lists', 'EASY', 2,
      "Like merging two sorted piles of cards. Compare the top of each pile, take the smaller one. Repeat. Use a dummy head node to simplify the code.",
      'Dummy Head + Compare', "Create a dummy node. Compare heads of both lists, attach the smaller one. Move that list's pointer forward. Attach remaining nodes at the end.",
      [{ step: 1, description: "L1: 1→2→4, L2: 1→3→4", diagram: "Compare 1 and 1, take either" },
       { step: 2, description: "Build: 1→1→2→3→4→4", diagram: "Merged! ✅" }],
      sol("def mergeTwoLists(l1, l2):\n    dummy = ListNode(0)\n    curr = dummy\n    while l1 and l2:\n        if l1.val <= l2.val:\n            curr.next = l1; l1 = l1.next\n        else:\n            curr.next = l2; l2 = l2.next\n        curr = curr.next\n    curr.next = l1 or l2\n    return dummy.next",
        "public ListNode mergeTwoLists(ListNode l1, ListNode l2) {\n    ListNode dummy=new ListNode(0), curr=dummy;\n    while (l1!=null && l2!=null) {\n        if (l1.val<=l2.val) { curr.next=l1; l1=l1.next; }\n        else { curr.next=l2; l2=l2.next; }\n        curr=curr.next;\n    }\n    curr.next=l1!=null?l1:l2;\n    return dummy.next;\n}",
        "ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {\n    ListNode dummy(0), *curr=&dummy;\n    while (l1&&l2) {\n        if (l1->val<=l2->val) { curr->next=l1; l1=l1->next; }\n        else { curr->next=l2; l2=l2->next; }\n        curr=curr->next;\n    }\n    curr->next=l1?l1:l2;\n    return dummy.next;\n}"),
      { time: 'O(n+m)', space: 'O(1)', simpleExplanation: "Visit each node once = O(n+m). Just rewiring pointers = O(1) space!" },
      "MERGE SORTED LISTS = dummy head + compare tops. Attach smaller, advance that pointer. Don't forget remainder!",
      [mcq("Why use a dummy head node?", ["It makes the list longer", "It simplifies edge cases — no special handling for the first node", "It's required", "It makes it faster"], 1, "Without dummy, you need special logic for the first node. Dummy lets you always do curr.next = smaller, then return dummy.next.")],
      ["Compare the heads. Take the smaller one.", "Use a dummy node to avoid edge cases.", "Don't forget to attach the remaining non-empty list at the end!"],
      ["Forgetting to attach the remaining list", "Not using a dummy node (complex edge cases)", "Modifying values instead of rewiring pointers"]
    ),
    p('Linked List Cycle', 'linked-list-cycle', 'EASY', 3,
      "Does the list loop back on itself? Use the tortoise and hare! Slow pointer moves 1 step, fast moves 2. If there's a cycle, they MUST meet. If fast hits null, no cycle. Like two runners on a track — the faster one laps the slower!",
      'Floyd\'s Cycle Detection (Slow/Fast)', "Slow moves 1 step, fast moves 2. If they meet, there's a cycle. If fast reaches null, no cycle.",
      [{ step: 1, description: "1→2→3→4→2 (cycle back to 2)", diagram: "slow=1, fast=1" },
       { step: 2, description: "slow=2, fast=3 → slow=3, fast=2 → slow=4, fast=4 MEET!", diagram: "Cycle detected ✅" }],
      sol("def hasCycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast: return True\n    return False",
        "public boolean hasCycle(ListNode head) {\n    ListNode slow=head, fast=head;\n    while (fast!=null && fast.next!=null) {\n        slow=slow.next;\n        fast=fast.next.next;\n        if (slow==fast) return true;\n    }\n    return false;\n}",
        "bool hasCycle(ListNode *head) {\n    ListNode *slow=head, *fast=head;\n    while (fast && fast->next) {\n        slow=slow->next;\n        fast=fast->next->next;\n        if (slow==fast) return true;\n    }\n    return false;\n}"),
      { time: 'O(n)', space: 'O(1)', simpleExplanation: "Fast pointer traverses at most 2n steps = O(n). Two pointers = O(1) space!" },
      "CYCLE = TORTOISE & HARE. Slow 1 step, fast 2 steps. Meet = cycle. Null = no cycle.",
      [mcq("Why does the fast pointer move 2 steps?", ["To be exactly twice as fast — guarantees they meet in a cycle", "2 is a lucky number", "It doesn't matter how fast", "To reach the end quicker"], 0, "Moving at 2x speed means the gap between fast and slow closes by 1 each step. In a cycle of length k, they must meet within k steps.")],
      ["If there's a cycle, two runners at different speeds must eventually meet.", "Slow moves 1, fast moves 2.", "If fast reaches null → no cycle. If slow==fast → cycle!"],
      ["Not checking fast.next before accessing fast.next.next", "Using a hash set (works but O(n) space vs O(1))", "Checking slow==fast before the first move"]
    ),
    p('Reorder List', 'reorder-list', 'MEDIUM', 4,
      "Reorder L0→L1→...→Ln to L0→Ln→L1→Ln-1→... Three steps: find middle (slow/fast), reverse second half, merge alternating. It's like shuffling a deck: split, reverse one half, interleave!",
      'Find Middle + Reverse + Merge', "1) Find middle with slow/fast pointers. 2) Reverse the second half. 3) Merge the two halves by alternating nodes.",
      [{ step: 1, description: "1→2→3→4→5", diagram: "Split: [1→2→3] and [4→5]" },
       { step: 2, description: "Reverse 2nd: [5→4]. Merge: 1→5→2→4→3", diagram: "Result: 1→5→2→4→3 ✅" }],
      sol("def reorderList(head):\n    slow = fast = head\n    while fast.next and fast.next.next:\n        slow = slow.next; fast = fast.next.next\n    second = slow.next; slow.next = None\n    prev = None\n    while second:\n        tmp = second.next; second.next = prev; prev = second; second = tmp\n    first, second = head, prev\n    while second:\n        tmp1, tmp2 = first.next, second.next\n        first.next = second; second.next = tmp1\n        first, second = tmp1, tmp2",
        "public void reorderList(ListNode head) {\n    ListNode slow=head, fast=head;\n    while (fast.next!=null&&fast.next.next!=null) { slow=slow.next; fast=fast.next.next; }\n    ListNode second=slow.next; slow.next=null;\n    ListNode prev=null;\n    while (second!=null) { ListNode t=second.next; second.next=prev; prev=second; second=t; }\n    ListNode first=head; second=prev;\n    while (second!=null) {\n        ListNode t1=first.next, t2=second.next;\n        first.next=second; second.next=t1;\n        first=t1; second=t2;\n    }\n}",
        "void reorderList(ListNode* head) {\n    ListNode *slow=head, *fast=head;\n    while (fast->next&&fast->next->next) { slow=slow->next; fast=fast->next->next; }\n    ListNode *second=slow->next; slow->next=nullptr;\n    ListNode *prev=nullptr;\n    while (second) { auto t=second->next; second->next=prev; prev=second; second=t; }\n    ListNode *first=head; second=prev;\n    while (second) {\n        auto t1=first->next, t2=second->next;\n        first->next=second; second->next=t1;\n        first=t1; second=t2;\n    }\n}"),
      { time: 'O(n)', space: 'O(1)', simpleExplanation: "Three passes: find middle O(n), reverse O(n), merge O(n) = O(n). O(1) space!" },
      "REORDER = 3 steps: FIND MIDDLE (slow/fast), REVERSE second half, MERGE alternating.",
      [mcq("Why reverse the second half?", ["To make it easier to merge", "So we can interleave from both ends toward the middle", "It's required by the problem", "To sort the list"], 1, "We need to alternate: first from start, then from end. Reversing the back half lets us walk both halves forward while interleaving.")],
      ["Split the list into two halves at the middle.", "Reverse the second half.", "Merge by alternating: take from first, then from (reversed) second."],
      ["Not disconnecting the first half from the second (slow.next = null)", "Losing references during the merge step"]
    ),
    p('Remove Nth Node From End of List', 'remove-nth-node-from-end-of-list', 'MEDIUM', 5,
      "Remove the nth node from the END. Trick: use two pointers n apart. Move both until the fast one hits the end. The slow one is now at the node BEFORE the target. Skip over it!",
      'Two Pointers (N-gap)', "Advance fast pointer n steps ahead. Then move both. When fast reaches end, slow is right before the target node.",
      [{ step: 1, description: "1→2→3→4→5, n=2 (remove 4)", diagram: "fast starts 2 ahead" },
       { step: 2, description: "Both move until fast hits end. slow=3, skip 4", diagram: "1→2→3→5 ✅" }],
      sol("def removeNthFromEnd(head, n):\n    dummy = ListNode(0, head)\n    slow = fast = dummy\n    for _ in range(n): fast = fast.next\n    while fast.next:\n        slow = slow.next; fast = fast.next\n    slow.next = slow.next.next\n    return dummy.next",
        "public ListNode removeNthFromEnd(ListNode head, int n) {\n    ListNode dummy=new ListNode(0,head), slow=dummy, fast=dummy;\n    for (int i=0;i<n;i++) fast=fast.next;\n    while (fast.next!=null) { slow=slow.next; fast=fast.next; }\n    slow.next=slow.next.next;\n    return dummy.next;\n}",
        "ListNode* removeNthFromEnd(ListNode* head, int n) {\n    ListNode dummy(0,head); ListNode *slow=&dummy, *fast=&dummy;\n    for (int i=0;i<n;i++) fast=fast->next;\n    while (fast->next) { slow=slow->next; fast=fast->next; }\n    slow->next=slow->next->next;\n    return dummy.next;\n}"),
      { time: 'O(n)', space: 'O(1)', simpleExplanation: "One pass with two pointers = O(n). Constant space!" },
      "NTH FROM END = two pointers N apart. When fast hits end, slow is at the right spot!",
      [mcq("Why use a dummy node?", ["To handle removing the first node", "To make the list longer", "It's always required", "No reason"], 0, "If we remove the head node, there's no 'previous' node. Dummy gives us a node before head, simplifying the edge case.")],
      ["How to find the nth from end in one pass?", "Start fast n steps ahead. Then move both.", "When fast hits null, slow.next is the node to remove."],
      ["Not using a dummy node (fails when removing head)", "Off-by-one: advancing fast n vs n+1 steps"]
    ),
    p('Copy List with Random Pointer', 'copy-list-with-random-pointer', 'MEDIUM', 6,
      "Deep copy a linked list where each node has a next AND a random pointer. Use a hash map: old node → new node. First pass creates all new nodes. Second pass wires up next and random pointers.",
      'HashMap (Old→New)', "First pass: create a clone of each node, store mapping. Second pass: wire up next and random pointers using the map.",
      [{ step: 1, description: "Node A(random→C) → B(random→A) → C(random→B)", diagram: "Map: {A→A', B→B', C→C'}" },
       { step: 2, description: "Wire: A'.next=B', A'.random=C'", diagram: "Deep copy complete ✅" }],
      sol("def copyRandomList(head):\n    if not head: return None\n    old_to_new = {}\n    curr = head\n    while curr:\n        old_to_new[curr] = Node(curr.val)\n        curr = curr.next\n    curr = head\n    while curr:\n        old_to_new[curr].next = old_to_new.get(curr.next)\n        old_to_new[curr].random = old_to_new.get(curr.random)\n        curr = curr.next\n    return old_to_new[head]",
        "public Node copyRandomList(Node head) {\n    if (head==null) return null;\n    Map<Node,Node> map=new HashMap<>();\n    Node curr=head;\n    while (curr!=null) { map.put(curr,new Node(curr.val)); curr=curr.next; }\n    curr=head;\n    while (curr!=null) {\n        map.get(curr).next=map.get(curr.next);\n        map.get(curr).random=map.get(curr.random);\n        curr=curr.next;\n    }\n    return map.get(head);\n}",
        "Node* copyRandomList(Node* head) {\n    if (!head) return nullptr;\n    unordered_map<Node*,Node*> mp;\n    Node* curr=head;\n    while (curr) { mp[curr]=new Node(curr->val); curr=curr->next; }\n    curr=head;\n    while (curr) { mp[curr]->next=mp[curr->next]; mp[curr]->random=mp[curr->random]; curr=curr->next; }\n    return mp[head];\n}"),
      { time: 'O(n)', space: 'O(n)', simpleExplanation: "Two passes = O(n). Hash map = O(n) space." },
      "DEEP COPY with random pointers = HASH MAP from old→new. Two passes: create clones, then wire pointers.",
      [mcq("Why can't we just copy nodes one by one?", ["We can", "Random pointers might point to nodes not yet created", "Copying is too slow", "The list might have cycles"], 1, "Random could point to a node later in the list that hasn't been cloned yet. Creating all clones first ensures every target exists.")],
      ["Random pointers make this tricky — the target node might not exist yet.", "Create ALL clone nodes first (pass 1), then wire pointers (pass 2).", "Use a hash map: old_node → new_node for instant lookup."],
      ["Not handling null random pointers", "Shallow copy instead of deep copy", "Not mapping null → null"]
    ),
    p('Add Two Numbers', 'add-two-numbers', 'MEDIUM', 7,
      "Two numbers stored as reversed linked lists: 342 = 2→4→3. Add them digit by digit with carry, just like adding on paper! Create a new list node for each digit sum.",
      'Digit-by-Digit Addition with Carry', "Walk both lists simultaneously. Add digits + carry. New digit = sum%10, carry = sum/10. Don't forget final carry!",
      [{ step: 1, description: "L1: 2→4→3 (342), L2: 5→6→4 (465)", diagram: "2+5=7, 4+6=10→0 carry 1, 3+4+1=8" },
       { step: 2, description: "Result: 7→0→8 = 807", diagram: "342 + 465 = 807 ✅" }],
      sol("def addTwoNumbers(l1, l2):\n    dummy = ListNode(0)\n    curr = dummy\n    carry = 0\n    while l1 or l2 or carry:\n        val = carry\n        if l1: val += l1.val; l1 = l1.next\n        if l2: val += l2.val; l2 = l2.next\n        carry = val // 10\n        curr.next = ListNode(val % 10)\n        curr = curr.next\n    return dummy.next",
        "public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n    ListNode dummy=new ListNode(0), curr=dummy;\n    int carry=0;\n    while (l1!=null||l2!=null||carry>0) {\n        int val=carry;\n        if (l1!=null) { val+=l1.val; l1=l1.next; }\n        if (l2!=null) { val+=l2.val; l2=l2.next; }\n        carry=val/10;\n        curr.next=new ListNode(val%10);\n        curr=curr.next;\n    }\n    return dummy.next;\n}",
        "ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n    ListNode dummy(0), *curr=&dummy;\n    int carry=0;\n    while (l1||l2||carry) {\n        int val=carry;\n        if (l1) { val+=l1->val; l1=l1->next; }\n        if (l2) { val+=l2->val; l2=l2->next; }\n        carry=val/10;\n        curr->next=new ListNode(val%10);\n        curr=curr->next;\n    }\n    return dummy.next;\n}"),
      { time: 'O(max(m,n))', space: 'O(max(m,n))', simpleExplanation: "Walk both lists once = O(max(m,n)). New list = O(max(m,n))." },
      "ADD LINKED LISTS = add digit by digit with carry. Don't forget the final carry!",
      [mcq("What's the loop condition?", ["While both lists have nodes", "While either list has nodes OR carry > 0", "While carry > 0", "Fixed number of iterations"], 1, "We must continue while ANY list has digits left OR there's a remaining carry (e.g., 999 + 1 = 1000).")],
      ["Add digits like you would on paper: right to left with carry.", "Use a dummy head. Loop while l1 OR l2 OR carry.", "Sum = l1.val + l2.val + carry. New digit = sum%10, carry = sum/10."],
      ["Forgetting the final carry (5+5=10, need an extra node)", "Not handling different length lists", "Not using a dummy head (complex first-node logic)"]
    ),
    p('Find the Duplicate Number', 'find-the-duplicate-number', 'MEDIUM', 8,
      "Array of n+1 integers in range [1,n] — one number repeats. Can't modify array, O(1) space. Treat it as a linked list! Index → value is like node → next. The duplicate creates a CYCLE. Use Floyd's algorithm to find the cycle start!",
      'Floyd\'s Cycle Detection on Array', "Treat nums[i] as a 'next pointer'. The duplicate creates a cycle. Find the cycle entry point = the duplicate number.",
      [{ step: 1, description: "nums = [1,3,4,2,2]", diagram: "0→1→3→2→4→2→4→2... cycle at 2!" },
       { step: 2, description: "Fast/slow meet in cycle, then find entry", diagram: "Duplicate = 2 ✅" }],
      sol("def findDuplicate(nums):\n    slow = fast = nums[0]\n    while True:\n        slow = nums[slow]; fast = nums[nums[fast]]\n        if slow == fast: break\n    slow = nums[0]\n    while slow != fast:\n        slow = nums[slow]; fast = nums[fast]\n    return slow",
        "public int findDuplicate(int[] nums) {\n    int slow=nums[0], fast=nums[0];\n    do { slow=nums[slow]; fast=nums[nums[fast]]; } while (slow!=fast);\n    slow=nums[0];\n    while (slow!=fast) { slow=nums[slow]; fast=nums[fast]; }\n    return slow;\n}",
        "int findDuplicate(vector<int>& nums) {\n    int slow=nums[0], fast=nums[0];\n    do { slow=nums[slow]; fast=nums[nums[fast]]; } while (slow!=fast);\n    slow=nums[0];\n    while (slow!=fast) { slow=nums[slow]; fast=nums[fast]; }\n    return slow;\n}"),
      { time: 'O(n)', space: 'O(1)', simpleExplanation: "Floyd's algorithm = O(n). No extra space!" },
      "FIND DUPLICATE in [1,n] = treat as linked list (index→value). Cycle entry point = duplicate!",
      [mcq("Why does this work as a linked list cycle problem?", ["Each value points to the next index, and the duplicate means two indices point to the same value, creating a cycle", "Arrays are secretly linked lists", "It doesn't really work", "The values are sorted"], 0, "Value v at index i means i→v. If two indices have value v, they both 'point to' index v, creating a cycle entry point at v.")],
      ["Treat nums[i] as pointing to index nums[i]. What happens with a duplicate?", "Two nodes point to the same place → cycle!", "Floyd's: find meeting point, then find cycle entry."],
      ["Modifying the array", "Using extra space (hash set)", "Not understanding the array-as-linked-list mapping"]
    ),
    p('LRU Cache', 'lru-cache', 'MEDIUM', 9,
      "Design a cache that evicts the Least Recently Used item when full. Use a hash map (O(1) lookup) + doubly linked list (O(1) removal/insertion). Most recently used at the front, least at the back. On access, move to front. On full, remove from back.",
      'HashMap + Doubly Linked List', "HashMap gives O(1) key lookup. Doubly linked list gives O(1) add/remove. Together: O(1) get and put!",
      [{ step: 1, description: "capacity=2, put(1,1), put(2,2)", diagram: "List: [2,1], Map: {1:node1, 2:node2}" },
       { step: 2, description: "get(1)→move to front. put(3,3)→evict LRU(2)", diagram: "List: [3,1], Map: {1:node1, 3:node3}" }],
      sol("class LRUCache:\n    def __init__(self, capacity):\n        self.cap = capacity\n        self.cache = {}\n        self.head = ListNode(0, 0)\n        self.tail = ListNode(0, 0)\n        self.head.next = self.tail\n        self.tail.prev = self.head\n    def _remove(self, node):\n        node.prev.next = node.next\n        node.next.prev = node.prev\n    def _add(self, node):\n        node.next = self.head.next\n        node.prev = self.head\n        self.head.next.prev = node\n        self.head.next = node\n    def get(self, key):\n        if key in self.cache:\n            self._remove(self.cache[key])\n            self._add(self.cache[key])\n            return self.cache[key].val\n        return -1\n    def put(self, key, value):\n        if key in self.cache: self._remove(self.cache[key])\n        node = ListNode(key, value)\n        self.cache[key] = node\n        self._add(node)\n        if len(self.cache) > self.cap:\n            lru = self.tail.prev\n            self._remove(lru)\n            del self.cache[lru.key]",
        "class LRUCache {\n    int cap;\n    LinkedHashMap<Integer,Integer> map;\n    public LRUCache(int capacity) {\n        cap = capacity;\n        map = new LinkedHashMap<>(cap, 0.75f, true) {\n            protected boolean removeEldestEntry(Map.Entry e) { return size() > cap; }\n        };\n    }\n    public int get(int key) { return map.getOrDefault(key, -1); }\n    public void put(int key, int value) { map.put(key, value); }\n}",
        "class LRUCache {\n    int cap;\n    list<pair<int,int>> lst;\n    unordered_map<int,list<pair<int,int>>::iterator> mp;\npublic:\n    LRUCache(int capacity): cap(capacity) {}\n    int get(int key) {\n        if (!mp.count(key)) return -1;\n        lst.splice(lst.begin(), lst, mp[key]);\n        return mp[key]->second;\n    }\n    void put(int key, int value) {\n        if (mp.count(key)) { lst.erase(mp[key]); }\n        lst.push_front({key,value});\n        mp[key]=lst.begin();\n        if ((int)lst.size()>cap) { mp.erase(lst.back().first); lst.pop_back(); }\n    }\n};"),
      { time: 'O(1)', space: 'O(capacity)', simpleExplanation: "Both get and put are O(1). HashMap + doubly linked list!" },
      "LRU CACHE = HASHMAP (O(1) lookup) + DOUBLY LINKED LIST (O(1) add/remove). Most recent at head, evict from tail.",
      [mcq("Why a doubly linked list and not a singly linked list?", ["Doubly linked is faster", "O(1) removal requires knowing the previous node, which doubly linked provides", "Singly linked can't be iterated", "No difference"], 1, "To remove a node in O(1), you need its previous node. Doubly linked lists store prev pointers, so removal is O(1).")],
      ["Need O(1) lookup AND O(1) eviction of least recently used.", "HashMap for lookup, doubly linked list for ordering.", "On access: move to front. On full: remove from tail (LRU)."],
      ["Using a singly linked list (O(n) removal)", "Forgetting to update the map when evicting", "Not handling the case where key already exists on put"]
    ),
    p('Merge K Sorted Lists', 'merge-k-sorted-lists', 'HARD', 10,
      "Merge k sorted linked lists into one. Use a min-heap (priority queue)! Put all list heads in the heap. Pop the smallest, add to result, push its next node. The heap always gives you the global minimum!",
      'Min-Heap / Priority Queue', "Add all list heads to a min-heap. Pop the smallest, add to result, push its next node into the heap. Repeat until heap is empty.",
      [{ step: 1, description: "Lists: [1→4→5], [1→3→4], [2→6]", diagram: "Heap: [1,1,2]" },
       { step: 2, description: "Pop 1, push 4. Pop 1, push 3. Pop 2, push 6...", diagram: "Result: 1→1→2→3→4→4→5→6 ✅" }],
      sol("import heapq\ndef mergeKLists(lists):\n    heap = []\n    for i, l in enumerate(lists):\n        if l: heapq.heappush(heap, (l.val, i, l))\n    dummy = ListNode(0)\n    curr = dummy\n    while heap:\n        val, i, node = heapq.heappop(heap)\n        curr.next = node; curr = curr.next\n        if node.next:\n            heapq.heappush(heap, (node.next.val, i, node.next))\n    return dummy.next",
        "public ListNode mergeKLists(ListNode[] lists) {\n    PriorityQueue<ListNode> pq = new PriorityQueue<>((a,b)->a.val-b.val);\n    for (ListNode l : lists) if (l!=null) pq.add(l);\n    ListNode dummy=new ListNode(0), curr=dummy;\n    while (!pq.isEmpty()) {\n        ListNode node=pq.poll();\n        curr.next=node; curr=curr.next;\n        if (node.next!=null) pq.add(node.next);\n    }\n    return dummy.next;\n}",
        "ListNode* mergeKLists(vector<ListNode*>& lists) {\n    auto cmp=[](ListNode* a, ListNode* b){return a->val>b->val;};\n    priority_queue<ListNode*,vector<ListNode*>,decltype(cmp)> pq(cmp);\n    for (auto l:lists) if (l) pq.push(l);\n    ListNode dummy(0), *curr=&dummy;\n    while (!pq.empty()) {\n        auto node=pq.top(); pq.pop();\n        curr->next=node; curr=curr->next;\n        if (node->next) pq.push(node->next);\n    }\n    return dummy.next;\n}"),
      { time: 'O(N log k)', space: 'O(k)', simpleExplanation: "N total nodes, each heap operation O(log k). Heap holds at most k nodes." },
      "MERGE K SORTED = MIN-HEAP of size k. Pop smallest, push its next. Heap = always the global minimum!",
      [mcq("Why use a heap instead of merging pairs?", ["Heap is O(N log k) which is optimal", "Merging pairs is more complex", "Heap uses less memory", "No difference"], 0, "Heap gives O(N log k). Merging pairs (divide & conquer) also works at same complexity, but heap is more intuitive.")],
      ["You need the smallest element across k lists at each step.", "A min-heap of size k gives you this in O(log k).", "Pop smallest, add to result, push its next node."],
      ["Adding all nodes to heap at once (k instead of N at a time)", "Not handling empty lists", "Comparison issues in heap (use index as tiebreaker in Python)"]
    ),
    p('Reverse Nodes in K-Group', 'reverse-nodes-in-k-group', 'HARD', 11,
      "Reverse every k consecutive nodes. If fewer than k remain, leave them as-is. For each group: check if k nodes exist, reverse them, connect to the previous group.",
      'Iterative K-Group Reverse', "For each group: 1) Check if k nodes exist. 2) Reverse the group. 3) Connect to previous group's tail.",
      [{ step: 1, description: "1→2→3→4→5, k=2", diagram: "Reverse [1,2], reverse [3,4], leave [5]" },
       { step: 2, description: "Result: 2→1→4→3→5", diagram: "✅" }],
      sol("def reverseKGroup(head, k):\n    dummy = ListNode(0, head)\n    prev_group = dummy\n    while True:\n        kth = prev_group\n        for _ in range(k):\n            kth = kth.next\n            if not kth: return dummy.next\n        next_group = kth.next\n        prev, curr = kth.next, prev_group.next\n        for _ in range(k):\n            tmp = curr.next; curr.next = prev; prev = curr; curr = tmp\n        tmp = prev_group.next\n        prev_group.next = kth\n        prev_group = tmp",
        "public ListNode reverseKGroup(ListNode head, int k) {\n    ListNode dummy=new ListNode(0,head), prevG=dummy;\n    while (true) {\n        ListNode kth=prevG;\n        for (int i=0;i<k;i++) { kth=kth.next; if (kth==null) return dummy.next; }\n        ListNode nextG=kth.next, prev=nextG, curr=prevG.next;\n        for (int i=0;i<k;i++) { ListNode t=curr.next; curr.next=prev; prev=curr; curr=t; }\n        ListNode tmp=prevG.next; prevG.next=kth; prevG=tmp;\n    }\n}",
        "ListNode* reverseKGroup(ListNode* head, int k) {\n    ListNode dummy(0,head), *prevG=&dummy;\n    while (true) {\n        ListNode* kth=prevG;\n        for (int i=0;i<k;i++) { kth=kth->next; if (!kth) return dummy.next; }\n        ListNode *nextG=kth->next, *prev=nextG, *curr=prevG->next;\n        for (int i=0;i<k;i++) { auto t=curr->next; curr->next=prev; prev=curr; curr=t; }\n        auto tmp=prevG->next; prevG->next=kth; prevG=tmp;\n    }\n}"),
      { time: 'O(n)', space: 'O(1)', simpleExplanation: "Each node reversed once = O(n). Constant pointers = O(1) space." },
      "K-GROUP REVERSE: check k exist → reverse group → reconnect → move to next group.",
      [mcq("What happens if fewer than k nodes remain?", ["Reverse them anyway", "Leave them as-is", "Remove them", "Error"], 1, "The problem says to leave the remaining nodes as-is if there aren't enough to form a full group of k.")],
      ["For each group of k: check if k nodes exist first.", "Reverse those k nodes, then reconnect to previous group.", "Track prev_group (tail of previous reversed group) for reconnection."],
      ["Not checking if k nodes exist before reversing", "Losing connection between groups after reversal", "Off-by-one in the reversal loop"]
    ),
  ]);

  const total = await prisma.problem.count();
  console.log(`\n🎉 Done! Total problems: ${total}/150`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
