import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to create problem data
function p(
  title: string, slug: string, difficulty: 'EASY' | 'MEDIUM' | 'HARD', order: number,
  story: string, pattern: string, patternExplanation: string,
  visualSteps: any[], solutions: any, complexity: any, memoryTrick: string,
  quiz: any[], hints: string[], commonMistakes: string[]
) {
  return {
    title, slug, difficulty, order, story,
    visualSteps: JSON.stringify(visualSteps),
    pattern, patternExplanation,
    solutions: JSON.stringify(solutions),
    complexity: JSON.stringify(complexity),
    memoryTrick,
    quiz: JSON.stringify(quiz),
    hints: JSON.stringify(hints),
    commonMistakes: JSON.stringify(commonMistakes),
  };
}

// Minimal solution template
function sol(py: string, java: string, cpp: string) {
  return {
    python: { code: py, lineExplanations: py.split('\n').map(() => '') },
    java: { code: java, lineExplanations: java.split('\n').map(() => '') },
    cpp: { code: cpp, lineExplanations: cpp.split('\n').map(() => '') },
  };
}

function mcq(question: string, options: string[], correct: number, explanation: string) {
  return { type: 'multiple_choice', question, options, correct, explanation };
}

async function seedTopic(topicSlug: string, problems: any[]) {
  const topic = await prisma.topic.findUnique({ where: { slug: topicSlug } });
  if (!topic) { console.log(`Topic ${topicSlug} not found, skipping`); return; }

  for (const prob of problems) {
    const existing = await prisma.problem.findUnique({ where: { slug: prob.slug } });
    if (existing) { console.log(`  ⏭ ${prob.slug} already exists`); continue; }

    await prisma.problem.create({ data: { ...prob, topicId: topic.id } });
    console.log(`  ✅ ${prob.slug}`);
  }
}

async function main() {
  console.log('🚀 Seeding ALL NeetCode 150 problems...\n');

  // ==================== TWO POINTERS (5) ====================
  console.log('👆 Two Pointers');
  await seedTopic('two-pointers', [
    p('Valid Palindrome', 'valid-palindrome', 'EASY', 1,
      "Imagine reading a word forwards and backwards — if it's the same, it's a palindrome! Like 'racecar'. Use two fingers: one at the start, one at the end. Move them toward each other. If the letters always match, it's a palindrome!",
      'Two Pointers (Outside-In)', 'Place one pointer at the start and one at the end. Move them toward each other comparing characters. Skip non-alphanumeric characters.',
      [{ step: 1, description: "s = 'A man, a plan, a canal: Panama'", diagram: "Clean: 'amanaplanacanalpanama'" },
       { step: 2, description: "Left pointer at 'a', right pointer at 'a' — match!", diagram: "L→a...a←R  ✅" },
       { step: 3, description: "Keep moving inward, all match → palindrome!", diagram: "amanaplanacanalpanama = palindrome ✅" }],
      sol(
        "def isPalindrome(s):\n    s = ''.join(c.lower() for c in s if c.isalnum())\n    left, right = 0, len(s) - 1\n    while left < right:\n        if s[left] != s[right]:\n            return False\n        left += 1\n        right -= 1\n    return True",
        "public boolean isPalindrome(String s) {\n    int l = 0, r = s.length() - 1;\n    while (l < r) {\n        while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;\n        while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;\n        if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;\n        l++; r--;\n    }\n    return true;\n}",
        "bool isPalindrome(string s) {\n    int l = 0, r = s.size() - 1;\n    while (l < r) {\n        while (l < r && !isalnum(s[l])) l++;\n        while (l < r && !isalnum(s[r])) r--;\n        if (tolower(s[l]) != tolower(s[r])) return false;\n        l++; r--;\n    }\n    return true;\n}"
      ),
      { time: 'O(n)', space: 'O(1)', simpleExplanation: "Two pointers walk toward each other = O(n). No extra space needed!" },
      "PALINDROME = TWO POINTERS from outside in. Left and right walk toward each other comparing characters.",
      [mcq("Why use two pointers instead of reversing the string?", ["It's faster", "O(1) space vs O(n) space", "It's easier to code", "No difference"], 1, "Reversing creates a new string = O(n) space. Two pointers compare in-place = O(1) space!")],
      ["Think about checking from both ends simultaneously...", "Use one pointer at the start, one at the end, move them toward each other.", "Skip non-alphanumeric characters, compare lowercase versions."],
      ["Forgetting to skip non-alphanumeric characters", "Not converting to lowercase before comparing", "Using extra space by creating a reversed copy"]
    ),
    p('Two Sum II - Sorted Array', 'two-sum-ii-input-array-is-sorted', 'MEDIUM', 2,
      "Same as Two Sum, but the array is SORTED! This changes everything. Instead of a hash map, use two pointers: one at start, one at end. Sum too small? Move left pointer right. Sum too big? Move right pointer left. Like a number line squeeze!",
      'Two Pointers (Sorted Array)', "When the array is sorted, two pointers can find pairs efficiently. Left pointer starts at the smallest, right at the largest. Adjust based on whether the sum is too small or too big.",
      [{ step: 1, description: "numbers = [2,7,11,15], target = 9", diagram: "L=2, R=15, sum=17 > 9 → move R left" },
       { step: 2, description: "L=2, R=11, sum=13 > 9 → move R left", diagram: "L=2, R=7, sum=9 = target ✅" }],
      sol(
        "def twoSum(numbers, target):\n    left, right = 0, len(numbers) - 1\n    while left < right:\n        total = numbers[left] + numbers[right]\n        if total == target:\n            return [left + 1, right + 1]\n        elif total < target:\n            left += 1\n        else:\n            right -= 1",
        "public int[] twoSum(int[] numbers, int target) {\n    int l = 0, r = numbers.length - 1;\n    while (l < r) {\n        int sum = numbers[l] + numbers[r];\n        if (sum == target) return new int[]{l+1, r+1};\n        else if (sum < target) l++;\n        else r--;\n    }\n    return new int[]{};\n}",
        "vector<int> twoSum(vector<int>& numbers, int target) {\n    int l = 0, r = numbers.size() - 1;\n    while (l < r) {\n        int sum = numbers[l] + numbers[r];\n        if (sum == target) return {l+1, r+1};\n        else if (sum < target) l++;\n        else r--;\n    }\n    return {};\n}"
      ),
      { time: 'O(n)', space: 'O(1)', simpleExplanation: "Two pointers walk toward each other = O(n). No hash map needed = O(1) space!" },
      "SORTED + PAIR SUM = TWO POINTERS. Too small → move left. Too big → move right. Squeeze to the answer!",
      [mcq("Why can we use two pointers here but needed a hash map for regular Two Sum?", ["Two pointers are always better", "The array is sorted, so we can reason about which direction to move", "Hash maps don't work on sorted arrays", "No reason"], 1, "Sorting gives us information! If sum is too small, moving left pointer right increases it. If too big, moving right pointer left decreases it.")],
      ["The array is sorted — what does that tell you about moving pointers?", "If current sum < target, you need a bigger number. Which pointer should move?", "Left pointer moves right (bigger), right pointer moves left (smaller)."],
      ["Using a hash map — works but wastes O(n) space when O(1) is possible", "Forgetting 1-indexed output", "Not handling the case where left and right pointers meet"]
    ),
    p('3Sum', 'three-sum', 'MEDIUM', 3,
      "Find three numbers that add up to zero. The trick: sort the array, then for each number, use Two Sum II (two pointers) on the rest! Fix one number, then squeeze two pointers to find the other two. Skip duplicates to avoid repeats!",
      'Sort + Fix One + Two Pointers', "Sort first. For each number, fix it and run two pointers on the remaining array to find pairs that sum to its negative. Skip duplicate values to avoid duplicate triplets.",
      [{ step: 1, description: "nums = [-1,0,1,2,-1,-4] → sorted: [-4,-1,-1,0,1,2]", diagram: "Sort first!" },
       { step: 2, description: "Fix -1, find two numbers that sum to 1", diagram: "Fix=-1, L=0, R=2 → 0+2=2>1 → R-- → 0+1=1 ✅ → [-1,0,1]" },
       { step: 3, description: "Skip duplicate -1, fix 0, find sum to 0", diagram: "Fix=0, L=1, R=2 → 1+2=3>0 → no match" }],
      sol(
        "def threeSum(nums):\n    nums.sort()\n    result = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i-1]: continue\n        left, right = i + 1, len(nums) - 1\n        while left < right:\n            total = nums[i] + nums[left] + nums[right]\n            if total == 0:\n                result.append([nums[i], nums[left], nums[right]])\n                while left < right and nums[left] == nums[left+1]: left += 1\n                while left < right and nums[right] == nums[right-1]: right -= 1\n                left += 1; right -= 1\n            elif total < 0: left += 1\n            else: right -= 1\n    return result",
        "public List<List<Integer>> threeSum(int[] nums) {\n    Arrays.sort(nums);\n    List<List<Integer>> result = new ArrayList<>();\n    for (int i = 0; i < nums.length - 2; i++) {\n        if (i > 0 && nums[i] == nums[i-1]) continue;\n        int l = i+1, r = nums.length-1;\n        while (l < r) {\n            int sum = nums[i]+nums[l]+nums[r];\n            if (sum == 0) {\n                result.add(Arrays.asList(nums[i],nums[l],nums[r]));\n                while (l<r && nums[l]==nums[l+1]) l++;\n                while (l<r && nums[r]==nums[r-1]) r--;\n                l++; r--;\n            } else if (sum < 0) l++;\n            else r--;\n        }\n    }\n    return result;\n}",
        "vector<vector<int>> threeSum(vector<int>& nums) {\n    sort(nums.begin(), nums.end());\n    vector<vector<int>> result;\n    for (int i = 0; i < (int)nums.size()-2; i++) {\n        if (i > 0 && nums[i] == nums[i-1]) continue;\n        int l = i+1, r = nums.size()-1;\n        while (l < r) {\n            int sum = nums[i]+nums[l]+nums[r];\n            if (sum == 0) {\n                result.push_back({nums[i],nums[l],nums[r]});\n                while (l<r && nums[l]==nums[l+1]) l++;\n                while (l<r && nums[r]==nums[r-1]) r--;\n                l++; r--;\n            } else if (sum < 0) l++;\n            else r--;\n        }\n    }\n    return result;\n}"
      ),
      { time: 'O(n²)', space: 'O(1)', simpleExplanation: "Sort = O(n log n). For each number O(n), two pointers O(n) = O(n²). No extra space besides output!" },
      "3SUM = SORT + FIX ONE + TWO POINTERS on the rest. Always skip duplicates!",
      [mcq("Why do we sort the array first?", ["To make it look nice", "So we can use two pointers and skip duplicates easily", "Sorting is always required", "To find the minimum"], 1, "Sorting enables two pointers (need ordered data) and makes duplicate skipping trivial (duplicates are adjacent).")],
      ["Can you reduce 3Sum to a series of 2Sum problems?", "Sort the array. Fix one number, then find two numbers that sum to its negative.", "Use two pointers for the inner search. Skip duplicates by checking if current == previous."],
      ["Not skipping duplicates → duplicate triplets in result", "Not sorting first", "Off-by-one: inner loop should start at i+1, not 0"]
    ),
    p('Container With Most Water', 'container-with-most-water', 'MEDIUM', 4,
      "Imagine vertical lines on a graph. You need to find two lines that together with the x-axis form a container holding the most water. Start with the widest container (left and right ends). Then always move the shorter line inward — because moving the taller line can only make things worse!",
      'Two Pointers (Greedy Shrink)', "Start with widest container. The limiting factor is the shorter line. Moving the shorter line inward might find a taller line. Moving the taller line can only reduce or maintain height while width decreases.",
      [{ step: 1, description: "height = [1,8,6,2,5,4,8,3,7]", diagram: "L=1, R=7, width=8, area=1*8=8" },
       { step: 2, description: "Move shorter (L=1), now L=8, R=7", diagram: "L=8, R=7, width=7, area=7*7=49 🎉" }],
      sol(
        "def maxArea(height):\n    left, right = 0, len(height) - 1\n    max_water = 0\n    while left < right:\n        w = right - left\n        h = min(height[left], height[right])\n        max_water = max(max_water, w * h)\n        if height[left] < height[right]:\n            left += 1\n        else:\n            right -= 1\n    return max_water",
        "public int maxArea(int[] height) {\n    int l = 0, r = height.length - 1, max = 0;\n    while (l < r) {\n        max = Math.max(max, (r-l) * Math.min(height[l], height[r]));\n        if (height[l] < height[r]) l++;\n        else r--;\n    }\n    return max;\n}",
        "int maxArea(vector<int>& height) {\n    int l = 0, r = height.size()-1, mx = 0;\n    while (l < r) {\n        mx = max(mx, (r-l) * min(height[l], height[r]));\n        if (height[l] < height[r]) l++;\n        else r--;\n    }\n    return mx;\n}"
      ),
      { time: 'O(n)', space: 'O(1)', simpleExplanation: "Two pointers meet in the middle = O(n). No extra space!" },
      "CONTAINER = move the SHORTER line. The short line is the bottleneck — only way to improve is to find a taller replacement.",
      [mcq("Why move the pointer at the shorter line?", ["Random choice", "The shorter line limits the height — moving it might find a taller one", "The taller line is already optimal", "Both give the same result"], 1, "Water height is limited by the shorter line. Moving the taller line can't increase height but reduces width. Moving the shorter line might find a taller one!")],
      ["Start wide (both ends) — what determines the water height?", "The shorter line is the bottleneck. How can you potentially improve?", "Always move the pointer at the shorter line inward."],
      ["Using brute force O(n²) checking every pair", "Moving the wrong pointer (taller instead of shorter)", "Forgetting that area = width × min(height)"]
    ),
    p('Trapping Rain Water', 'trapping-rain-water', 'HARD', 5,
      "After rain, water gets trapped between buildings. For each position, water level = min(max height to its left, max height to its right) - current height. Use two pointers: track max height from left and right. Process the side with the smaller max — that side's water is determined!",
      'Two Pointers with Running Max', "Track leftMax and rightMax. The side with smaller max determines the water level there. Process that side and move its pointer inward.",
      [{ step: 1, description: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", diagram: "Total trapped water = 6" },
       { step: 2, description: "L=0 (leftMax=0), R=11 (rightMax=1)", diagram: "Process left: water = max(0, leftMax - height) = 0" },
       { step: 3, description: "Continue squeezing, accumulating water", diagram: "Water fills gaps between tall buildings" }],
      sol(
        "def trap(height):\n    left, right = 0, len(height) - 1\n    left_max = right_max = 0\n    water = 0\n    while left < right:\n        if height[left] < height[right]:\n            left_max = max(left_max, height[left])\n            water += left_max - height[left]\n            left += 1\n        else:\n            right_max = max(right_max, height[right])\n            water += right_max - height[right]\n            right -= 1\n    return water",
        "public int trap(int[] height) {\n    int l = 0, r = height.length-1, lMax = 0, rMax = 0, water = 0;\n    while (l < r) {\n        if (height[l] < height[r]) {\n            lMax = Math.max(lMax, height[l]);\n            water += lMax - height[l++];\n        } else {\n            rMax = Math.max(rMax, height[r]);\n            water += rMax - height[r--];\n        }\n    }\n    return water;\n}",
        "int trap(vector<int>& height) {\n    int l = 0, r = height.size()-1, lMax = 0, rMax = 0, water = 0;\n    while (l < r) {\n        if (height[l] < height[r]) {\n            lMax = max(lMax, height[l]);\n            water += lMax - height[l++];\n        } else {\n            rMax = max(rMax, height[r]);\n            water += rMax - height[r--];\n        }\n    }\n    return water;\n}"
      ),
      { time: 'O(n)', space: 'O(1)', simpleExplanation: "Two pointers meet in the middle = O(n). Only 2 extra variables = O(1) space!" },
      "TRAPPED WATER = process the side with SMALLER max. Water at position = max_height - current_height.",
      [mcq("Why process the side with the smaller max height?", ["It's closer to the edge", "That side's water level is fully determined by its max", "It has more water", "Random choice"], 1, "If leftMax < rightMax, we know water at left is bounded by leftMax (regardless of what's further right). So we can safely calculate it!")],
      ["For each bar, water depends on the tallest bars on both sides...", "Track the running maximum from both left and right sides.", "Process the side with the smaller max — its water is determined. Move that pointer inward."],
      ["Using O(n) space for prefix/suffix max arrays (works but two pointers is O(1))", "Not updating the running max before calculating water", "Off-by-one at the boundaries"]
    ),
  ]);

  // ==================== SLIDING WINDOW (6) ====================
  console.log('\n🪟 Sliding Window');
  await seedTopic('sliding-window', [
    p('Best Time to Buy and Sell Stock', 'best-time-to-buy-and-sell-stock', 'EASY', 1,
      "You see stock prices over time: [7,1,5,3,6,4]. You can buy one day and sell later. To maximize profit, track the MINIMUM price seen so far (best buy day), and at each day check: if I sell today, what's my profit?",
      'Sliding Window (Track Min)', "Keep track of the minimum price seen so far. At each new price, check if selling gives a better profit than our current best.",
      [{ step: 1, description: "prices = [7,1,5,3,6,4]", diagram: "min=7, profit=0" },
       { step: 2, description: "See 1 → new min! See 5 → profit=4", diagram: "min=1, best profit=5-1=4" },
       { step: 3, description: "See 6 → profit=5! Best so far", diagram: "min=1, best profit=6-1=5 🎉" }],
      sol(
        "def maxProfit(prices):\n    min_price = float('inf')\n    max_profit = 0\n    for price in prices:\n        min_price = min(min_price, price)\n        max_profit = max(max_profit, price - min_price)\n    return max_profit",
        "public int maxProfit(int[] prices) {\n    int min = Integer.MAX_VALUE, profit = 0;\n    for (int p : prices) {\n        min = Math.min(min, p);\n        profit = Math.max(profit, p - min);\n    }\n    return profit;\n}",
        "int maxProfit(vector<int>& prices) {\n    int mn = INT_MAX, profit = 0;\n    for (int p : prices) {\n        mn = min(mn, p);\n        profit = max(profit, p - mn);\n    }\n    return profit;\n}"
      ),
      { time: 'O(n)', space: 'O(1)', simpleExplanation: "One pass through prices = O(n). Two variables = O(1)!" },
      "STOCK = track the MIN price so far. At each price, check: selling now - min = profit?",
      [mcq("Why track the minimum price instead of just comparing consecutive days?", ["Minimum is easier to calculate", "The best buy could be many days before the best sell", "Consecutive comparison uses less memory", "There's no difference"], 1, "You might buy on day 2 and sell on day 5. The best pair isn't necessarily adjacent!")],
      ["You can only sell AFTER you buy. Track the cheapest buy opportunity so far.", "At each price, what would your profit be if you sold today?", "Track min_price and max_profit as you scan left to right."],
      ["Trying to find both buy and sell in one comparison", "Not handling decreasing prices (answer should be 0)", "Selling before buying"]
    ),
    p('Longest Substring Without Repeating Characters', 'longest-substring-without-repeating-characters', 'MEDIUM', 2,
      "Find the longest part of a string with no repeated letters. Use a sliding window: expand right to add characters. If you see a duplicate, shrink from the left until it's gone. The window always contains unique characters!",
      'Sliding Window + Hash Set', "Maintain a window [left, right] where all characters are unique. Expand right. When a duplicate is found, shrink left until the duplicate is removed.",
      [{ step: 1, description: "s = 'abcabcbb'", diagram: "Window: 'abc' → length 3" },
       { step: 2, description: "See 'a' again → shrink left past first 'a'", diagram: "Window: 'bca' → length 3" },
       { step: 3, description: "Max length found = 3", diagram: "Answer: 3 ('abc')" }],
      sol(
        "def lengthOfLongestSubstring(s):\n    chars = set()\n    left = max_len = 0\n    for right in range(len(s)):\n        while s[right] in chars:\n            chars.remove(s[left])\n            left += 1\n        chars.add(s[right])\n        max_len = max(max_len, right - left + 1)\n    return max_len",
        "public int lengthOfLongestSubstring(String s) {\n    Set<Character> set = new HashSet<>();\n    int l = 0, max = 0;\n    for (int r = 0; r < s.length(); r++) {\n        while (set.contains(s.charAt(r))) set.remove(s.charAt(l++));\n        set.add(s.charAt(r));\n        max = Math.max(max, r - l + 1);\n    }\n    return max;\n}",
        "int lengthOfLongestSubstring(string s) {\n    unordered_set<char> st;\n    int l = 0, mx = 0;\n    for (int r = 0; r < s.size(); r++) {\n        while (st.count(s[r])) st.erase(s[l++]);\n        st.insert(s[r]);\n        mx = max(mx, r - l + 1);\n    }\n    return mx;\n}"
      ),
      { time: 'O(n)', space: 'O(min(n, 26))', simpleExplanation: "Each character is added and removed at most once = O(n). Set stores at most 26 letters." },
      "UNIQUE SUBSTRING = SLIDING WINDOW + SET. Expand right, shrink left when duplicate found.",
      [mcq("Why use a sliding window instead of checking every substring?", ["Sliding window is O(n) vs O(n³) for brute force", "It uses less memory", "It's easier to code", "No difference"], 0, "Brute force checks every pair (O(n²)) and validates uniqueness (O(n)) = O(n³). Sliding window does it in one pass!")],
      ["What happens when you encounter a character that's already in your window?", "Shrink the window from the left until the duplicate is removed.", "Use a set to track characters in the current window. Expand right, shrink left on duplicates."],
      ["Not shrinking the window properly on duplicate", "Using a list instead of set (O(n) lookup vs O(1))", "Off-by-one in window size calculation"]
    ),
    p('Longest Repeating Character Replacement', 'longest-repeating-character-replacement', 'MEDIUM', 3,
      "You can replace at most k characters in a string. Find the longest substring where all characters are the same after replacements. Key insight: window is valid if (window size - count of most frequent char) <= k.",
      'Sliding Window + Frequency Count', "Maintain a window and track character frequencies. The window is valid when (window_size - max_frequency) <= k, meaning we need at most k replacements.",
      [{ step: 1, description: "s = 'AABABBA', k = 1", diagram: "Window grows, track max frequency" },
       { step: 2, description: "Window 'AABA' → maxFreq=3(A), size=4, replacements=1 ≤ k ✅", diagram: "Valid! Length=4" }],
      sol(
        "def characterReplacement(s, k):\n    count = {}\n    left = max_freq = result = 0\n    for right in range(len(s)):\n        count[s[right]] = count.get(s[right], 0) + 1\n        max_freq = max(max_freq, count[s[right]])\n        while (right - left + 1) - max_freq > k:\n            count[s[left]] -= 1\n            left += 1\n        result = max(result, right - left + 1)\n    return result",
        "public int characterReplacement(String s, int k) {\n    int[] count = new int[26];\n    int l = 0, maxF = 0, res = 0;\n    for (int r = 0; r < s.length(); r++) {\n        count[s.charAt(r)-'A']++;\n        maxF = Math.max(maxF, count[s.charAt(r)-'A']);\n        while ((r-l+1) - maxF > k) count[s.charAt(l++)-'A']--;\n        res = Math.max(res, r-l+1);\n    }\n    return res;\n}",
        "int characterReplacement(string s, int k) {\n    int count[26] = {0};\n    int l = 0, maxF = 0, res = 0;\n    for (int r = 0; r < s.size(); r++) {\n        count[s[r]-'A']++;\n        maxF = max(maxF, count[s[r]-'A']);\n        while ((r-l+1) - maxF > k) count[s[l++]-'A']--;\n        res = max(res, r-l+1);\n    }\n    return res;\n}"
      ),
      { time: 'O(n)', space: 'O(1)', simpleExplanation: "One pass = O(n). 26-letter frequency array = O(1)!" },
      "REPLACEMENT WINDOW: valid when (window_size - max_frequency) ≤ k. If not, shrink left!",
      [mcq("What makes the window invalid?", ["Window is too large", "Number of characters to replace exceeds k", "Max frequency is too high", "There are too many unique characters"], 1, "Window is invalid when (size - maxFreq) > k, meaning we'd need more than k replacements.")],
      ["How many replacements does a window need?", "Replacements needed = window_size - count_of_most_common_char", "Expand right. If replacements > k, shrink left. Track max_freq."],
      ["Recalculating max_freq when shrinking (not needed — it only needs to grow)", "Not counting the current character before checking validity"]
    ),
    p('Permutation in String', 'permutation-in-string', 'MEDIUM', 4,
      "Check if any permutation of s1 exists as a substring of s2. A permutation has the same character frequencies! Use a fixed-size sliding window (size = len(s1)) on s2 and compare frequencies.",
      'Fixed-Size Sliding Window + Frequency Match', "Slide a window of size len(s1) over s2. Compare character frequencies. If they match, a permutation exists.",
      [{ step: 1, description: "s1='ab', s2='eidbaooo'", diagram: "Window size = 2, slide over s2" },
       { step: 2, description: "Window 'ba' at index 3-4", diagram: "freq matches s1! → true" }],
      sol(
        "def checkInclusion(s1, s2):\n    if len(s1) > len(s2): return False\n    s1_count = [0]*26\n    s2_count = [0]*26\n    for c in s1: s1_count[ord(c)-ord('a')] += 1\n    for i in range(len(s2)):\n        s2_count[ord(s2[i])-ord('a')] += 1\n        if i >= len(s1):\n            s2_count[ord(s2[i-len(s1)])-ord('a')] -= 1\n        if s1_count == s2_count: return True\n    return False",
        "public boolean checkInclusion(String s1, String s2) {\n    if (s1.length() > s2.length()) return false;\n    int[] c1 = new int[26], c2 = new int[26];\n    for (char c : s1.toCharArray()) c1[c-'a']++;\n    for (int i = 0; i < s2.length(); i++) {\n        c2[s2.charAt(i)-'a']++;\n        if (i >= s1.length()) c2[s2.charAt(i-s1.length())-'a']--;\n        if (Arrays.equals(c1, c2)) return true;\n    }\n    return false;\n}",
        "bool checkInclusion(string s1, string s2) {\n    if (s1.size() > s2.size()) return false;\n    vector<int> c1(26,0), c2(26,0);\n    for (char c : s1) c1[c-'a']++;\n    for (int i = 0; i < s2.size(); i++) {\n        c2[s2[i]-'a']++;\n        if (i >= (int)s1.size()) c2[s2[i-s1.size()]-'a']--;\n        if (c1 == c2) return true;\n    }\n    return false;\n}"
      ),
      { time: 'O(n)', space: 'O(1)', simpleExplanation: "One pass over s2 = O(n). Two 26-element arrays = O(1)!" },
      "PERMUTATION IN STRING = fixed-size sliding window + compare frequency arrays.",
      [mcq("Why use a fixed-size window?", ["Because permutations have the same length as the original", "It's faster", "Variable windows don't work here", "To save memory"], 0, "Any permutation of s1 has exactly len(s1) characters. So we only need to check windows of that exact size!")],
      ["A permutation has the same character counts. How to check this efficiently?", "Slide a window of size len(s1) over s2.", "Compare character frequency arrays at each position."],
      ["Forgetting to remove the leftmost character when sliding", "Using sorting (O(n*k log k)) instead of frequency comparison (O(n))"]
    ),
    p('Minimum Window Substring', 'minimum-window-substring', 'HARD', 5,
      "Find the smallest window in s that contains all characters of t. Expand right to include characters, shrink left to minimize. Use frequency maps to track what's needed vs what's in the window.",
      'Sliding Window + Need/Have Counters', "Expand window right until all characters of t are included. Then shrink left to find minimum. Track 'need' (required frequencies) and 'have' (current window frequencies).",
      [{ step: 1, description: "s='ADOBECODEBANC', t='ABC'", diagram: "Find smallest window containing A, B, C" },
       { step: 2, description: "Window 'ADOBEC' contains all → shrink left", diagram: "Try smaller: 'BANC' = length 4 🎉" }],
      sol(
        "def minWindow(s, t):\n    if not t: return ''\n    need = {}\n    for c in t: need[c] = need.get(c, 0) + 1\n    have, required = 0, len(need)\n    window = {}\n    res, res_len = [-1, -1], float('inf')\n    left = 0\n    for right in range(len(s)):\n        c = s[right]\n        window[c] = window.get(c, 0) + 1\n        if c in need and window[c] == need[c]: have += 1\n        while have == required:\n            if (right - left + 1) < res_len:\n                res, res_len = [left, right], right - left + 1\n            window[s[left]] -= 1\n            if s[left] in need and window[s[left]] < need[s[left]]: have -= 1\n            left += 1\n    return s[res[0]:res[1]+1] if res_len != float('inf') else ''",
        "public String minWindow(String s, String t) {\n    Map<Character,Integer> need = new HashMap<>(), have = new HashMap<>();\n    for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);\n    int matched = 0, l = 0, minLen = Integer.MAX_VALUE, start = 0;\n    for (int r = 0; r < s.length(); r++) {\n        char c = s.charAt(r);\n        have.merge(c, 1, Integer::sum);\n        if (need.containsKey(c) && have.get(c).equals(need.get(c))) matched++;\n        while (matched == need.size()) {\n            if (r-l+1 < minLen) { minLen = r-l+1; start = l; }\n            char lc = s.charAt(l);\n            have.merge(lc, -1, Integer::sum);\n            if (need.containsKey(lc) && have.get(lc) < need.get(lc)) matched--;\n            l++;\n        }\n    }\n    return minLen == Integer.MAX_VALUE ? \"\" : s.substring(start, start+minLen);\n}",
        "string minWindow(string s, string t) {\n    unordered_map<char,int> need, have;\n    for (char c : t) need[c]++;\n    int matched = 0, l = 0, minLen = INT_MAX, start = 0;\n    for (int r = 0; r < s.size(); r++) {\n        have[s[r]]++;\n        if (need.count(s[r]) && have[s[r]] == need[s[r]]) matched++;\n        while (matched == (int)need.size()) {\n            if (r-l+1 < minLen) { minLen = r-l+1; start = l; }\n            have[s[l]]--;\n            if (need.count(s[l]) && have[s[l]] < need[s[l]]) matched--;\n            l++;\n        }\n    }\n    return minLen == INT_MAX ? \"\" : s.substr(start, minLen);\n}"
      ),
      { time: 'O(n)', space: 'O(n)', simpleExplanation: "Each character added/removed at most once = O(n). Hash maps for frequencies = O(n)." },
      "MIN WINDOW = expand right until valid, then SHRINK LEFT to minimize. Track need vs have counts.",
      [mcq("When do we try to shrink the window?", ["Every step", "When the window contains all required characters", "When the window is too large", "Never"], 1, "We shrink only when the window is valid (contains all of t). Shrinking tries to find the smallest valid window.")],
      ["Expand right until all characters of t are in the window.", "Once valid, try shrinking from the left.", "Track how many unique characters are fully satisfied (have >= need)."],
      ["Not handling duplicate characters in t", "Shrinking too much (past the point of validity)", "Not tracking exact frequency matches"]
    ),
    p('Sliding Window Maximum', 'sliding-window-maximum', 'HARD', 6,
      "Find the maximum in every window of size k. Using a max for each window is O(nk). The trick: use a deque (double-ended queue) that keeps indices in decreasing order of values. The front is always the max!",
      'Monotonic Deque', "Maintain a deque of indices where values are in decreasing order. Remove smaller elements from back before adding new one. Remove front if it's outside the window.",
      [{ step: 1, description: "nums = [1,3,-1,-3,5,3,6,7], k=3", diagram: "Deque tracks potential maximums" },
       { step: 2, description: "Window [1,3,-1] → max=3, Window [3,-1,-3] → max=3", diagram: "Output: [3,3,5,5,6,7]" }],
      sol(
        "from collections import deque\ndef maxSlidingWindow(nums, k):\n    dq = deque()\n    result = []\n    for i in range(len(nums)):\n        while dq and nums[dq[-1]] <= nums[i]: dq.pop()\n        dq.append(i)\n        if dq[0] <= i - k: dq.popleft()\n        if i >= k - 1: result.append(nums[dq[0]])\n    return result",
        "public int[] maxSlidingWindow(int[] nums, int k) {\n    Deque<Integer> dq = new ArrayDeque<>();\n    int[] res = new int[nums.length - k + 1];\n    for (int i = 0; i < nums.length; i++) {\n        while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();\n        dq.addLast(i);\n        if (dq.peekFirst() <= i - k) dq.pollFirst();\n        if (i >= k-1) res[i-k+1] = nums[dq.peekFirst()];\n    }\n    return res;\n}",
        "vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n    deque<int> dq;\n    vector<int> res;\n    for (int i = 0; i < nums.size(); i++) {\n        while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();\n        dq.push_back(i);\n        if (dq.front() <= i - k) dq.pop_front();\n        if (i >= k-1) res.push_back(nums[dq.front()]);\n    }\n    return res;\n}"
      ),
      { time: 'O(n)', space: 'O(k)', simpleExplanation: "Each element enters and leaves the deque once = O(n). Deque stores at most k elements." },
      "SLIDING MAX = MONOTONIC DEQUE. Remove smaller from back, remove expired from front. Front is always the max!",
      [mcq("Why use a deque instead of just tracking the max?", ["Deque is faster", "When the max leaves the window, we need the next largest — deque has it ready", "It uses less memory", "No reason"], 1, "When the max exits the window, a simple variable doesn't know the next max. The deque maintains candidates in order!")],
      ["When the window slides, the old max might leave. How to find the new max quickly?", "A deque can maintain elements in decreasing order.", "Remove smaller elements from back. Remove expired indices from front. Front is always the current window max."],
      ["Not removing expired indices from the front", "Using <= instead of < when removing from back (or vice versa)", "Forgetting to store indices instead of values"]
    ),
  ]);

  // ==================== STACK (7) ====================
  console.log('\n📚 Stack');
  await seedTopic('stack', [
    p('Valid Parentheses', 'valid-parentheses', 'EASY', 1,
      "Check if brackets are properly matched: every open bracket has a matching close bracket in the right order. Use a stack! Push open brackets, pop when you see a matching close bracket. If the stack is empty at the end, it's valid!",
      'Stack (Matching Pairs)', "Push opening brackets onto the stack. When you see a closing bracket, check if it matches the top of the stack. If not, invalid. If stack is empty at the end, valid.",
      [{ step: 1, description: "s = '([{}])'", diagram: "Stack: (  [  {" },
       { step: 2, description: "See } → matches { ✅, pop. See ] → matches [ ✅", diagram: "Stack: (" },
       { step: 3, description: "See ) → matches ( ✅, pop. Stack empty → valid!", diagram: "Stack: empty ✅" }],
      sol(
        "def isValid(s):\n    stack = []\n    pairs = {')':'(', ']':'[', '}':'{'}\n    for c in s:\n        if c in pairs:\n            if not stack or stack[-1] != pairs[c]: return False\n            stack.pop()\n        else:\n            stack.append(c)\n    return len(stack) == 0",
        "public boolean isValid(String s) {\n    Stack<Character> stack = new Stack<>();\n    Map<Character,Character> pairs = Map.of(')','(', ']','[', '}','{');\n    for (char c : s.toCharArray()) {\n        if (pairs.containsKey(c)) {\n            if (stack.isEmpty() || stack.peek() != pairs.get(c)) return false;\n            stack.pop();\n        } else stack.push(c);\n    }\n    return stack.isEmpty();\n}",
        "bool isValid(string s) {\n    stack<char> st;\n    for (char c : s) {\n        if (c == '(' || c == '[' || c == '{') st.push(c);\n        else {\n            if (st.empty()) return false;\n            if (c == ')' && st.top() != '(') return false;\n            if (c == ']' && st.top() != '[') return false;\n            if (c == '}' && st.top() != '{') return false;\n            st.pop();\n        }\n    }\n    return st.empty();\n}"
      ),
      { time: 'O(n)', space: 'O(n)', simpleExplanation: "One pass through the string = O(n). Stack might hold all characters = O(n)." },
      "MATCHING BRACKETS = STACK. Push opens, pop on matching close. Empty stack at end = valid!",
      [mcq("Why use a stack and not just count brackets?", ["Counting can't check if types match", "Counting can't check order: '([)]' has equal counts but is invalid", "Stacks are faster", "No difference"], 1, "Counting only tracks quantity, not order or type matching. '([)]' has balanced counts but wrong nesting. A stack catches this!")],
      ["Each closing bracket must match the MOST RECENT opening bracket.", "A stack gives you the most recent item (LIFO).", "Push opens, pop on matching close. Mismatch = invalid."],
      ["Only counting brackets instead of matching types", "Forgetting to check if stack is empty before popping", "Not checking that stack is empty at the end (unclosed brackets)"]
    ),
    p('Min Stack', 'min-stack', 'MEDIUM', 2,
      "Design a stack that supports push, pop, top, AND getMin — all in O(1)! The trick: maintain TWO stacks. One normal stack, and one that tracks the minimum at each level. When you push, also push the current min onto the min stack.",
      'Auxiliary Min Stack', "Keep a second stack that tracks the minimum value at each depth. When pushing, push min(value, current_min) onto the min stack.",
      [{ step: 1, description: "Push -2, push 0, push -3", diagram: "stack: [-2,0,-3]  minStack: [-2,-2,-3]" },
       { step: 2, description: "getMin() → -3 (top of minStack)", diagram: "minStack top = -3" },
       { step: 3, description: "Pop → removes -3. getMin() → -2", diagram: "stack: [-2,0]  minStack: [-2,-2]" }],
      sol(
        "class MinStack:\n    def __init__(self):\n        self.stack = []\n        self.min_stack = []\n    def push(self, val):\n        self.stack.append(val)\n        self.min_stack.append(min(val, self.min_stack[-1] if self.min_stack else val))\n    def pop(self):\n        self.stack.pop()\n        self.min_stack.pop()\n    def top(self):\n        return self.stack[-1]\n    def getMin(self):\n        return self.min_stack[-1]",
        "class MinStack {\n    Stack<Integer> stack = new Stack<>();\n    Stack<Integer> minStack = new Stack<>();\n    public void push(int val) {\n        stack.push(val);\n        minStack.push(minStack.isEmpty() ? val : Math.min(val, minStack.peek()));\n    }\n    public void pop() { stack.pop(); minStack.pop(); }\n    public int top() { return stack.peek(); }\n    public int getMin() { return minStack.peek(); }\n}",
        "class MinStack {\n    stack<int> st, mn;\npublic:\n    void push(int val) { st.push(val); mn.push(mn.empty()?val:min(val,mn.top())); }\n    void pop() { st.pop(); mn.pop(); }\n    int top() { return st.top(); }\n    int getMin() { return mn.top(); }\n};"
      ),
      { time: 'O(1)', space: 'O(n)', simpleExplanation: "Every operation is O(1). Extra stack = O(n) space." },
      "MIN STACK = two stacks in parallel. Min stack top always has the current minimum!",
      [mcq("Why not just scan the stack for the minimum?", ["It would be O(n) instead of O(1)", "You can't iterate a stack", "It would modify the stack", "No reason"], 0, "Scanning takes O(n). The min stack gives O(1) access by tracking the min at every depth.")],
      ["How to know the minimum after a pop?", "Track the minimum at each 'level' of the stack.", "Use a parallel min stack. Push min(val, current_min) alongside each push."],
      ["Only tracking a single min variable (breaks on pop)", "Not pushing to min stack on every push"]
    ),
    p('Evaluate Reverse Polish Notation', 'evaluate-reverse-polish-notation', 'MEDIUM', 3,
      "RPN is how calculators work internally: '2 1 + 3 *' means (2+1)*3=9. Read tokens left to right. Numbers go on the stack. When you see an operator, pop two numbers, apply the operator, push the result back!",
      'Stack Evaluation', "Push numbers onto stack. On operator: pop two operands, compute, push result. Final answer is the last item on stack.",
      [{ step: 1, description: "tokens = ['2','1','+','3','*']", diagram: "Push 2, push 1" },
       { step: 2, description: "See '+' → pop 1,2 → push 3", diagram: "Stack: [3]" },
       { step: 3, description: "Push 3. See '*' → pop 3,3 → push 9", diagram: "Stack: [9] → Answer: 9" }],
      sol(
        "def evalRPN(tokens):\n    stack = []\n    for t in tokens:\n        if t in '+-*/':\n            b, a = stack.pop(), stack.pop()\n            if t == '+': stack.append(a + b)\n            elif t == '-': stack.append(a - b)\n            elif t == '*': stack.append(a * b)\n            else: stack.append(int(a / b))\n        else:\n            stack.append(int(t))\n    return stack[0]",
        "public int evalRPN(String[] tokens) {\n    Stack<Integer> stack = new Stack<>();\n    for (String t : tokens) {\n        if (\"+-*/\".contains(t)) {\n            int b = stack.pop(), a = stack.pop();\n            switch (t) {\n                case \"+\": stack.push(a+b); break;\n                case \"-\": stack.push(a-b); break;\n                case \"*\": stack.push(a*b); break;\n                case \"/\": stack.push(a/b); break;\n            }\n        } else stack.push(Integer.parseInt(t));\n    }\n    return stack.peek();\n}",
        "int evalRPN(vector<string>& tokens) {\n    stack<int> st;\n    for (auto& t : tokens) {\n        if (t==\"+\"||t==\"-\"||t==\"*\"||t==\"/\") {\n            int b=st.top(); st.pop(); int a=st.top(); st.pop();\n            if (t==\"+\") st.push(a+b);\n            else if (t==\"-\") st.push(a-b);\n            else if (t==\"*\") st.push(a*b);\n            else st.push(a/b);\n        } else st.push(stoi(t));\n    }\n    return st.top();\n}"
      ),
      { time: 'O(n)', space: 'O(n)', simpleExplanation: "Process each token once = O(n). Stack holds at most n/2 numbers = O(n)." },
      "RPN = push numbers, pop two on operator, push result. Stack naturally handles order of operations!",
      [mcq("In RPN, why does the stack handle order of operations automatically?", ["Because we process left to right", "Operators immediately consume their operands from the stack", "The stack is sorted", "It doesn't"], 1, "Each operator pops exactly two operands and pushes the result, naturally respecting the intended computation order.")],
      ["Numbers → push. Operators → pop two, compute, push result.", "Be careful about operand order: first popped is the RIGHT operand.", "Division truncates toward zero in this problem."],
      ["Swapping operand order (a-b vs b-a)", "Not handling integer division truncation toward zero", "Treating multi-digit numbers as single digits"]
    ),
    p('Generate Parentheses', 'generate-parentheses', 'MEDIUM', 4,
      "Generate all valid combinations of n pairs of parentheses. Use backtracking with a simple rule: you can add '(' if open count < n, and ')' if close count < open count. This ensures validity!",
      'Backtracking with Constraints', "Build strings character by character. At each step, you can add ( if open < n, or ) if close < open. When length reaches 2n, we have a valid combination.",
      [{ step: 1, description: "n = 3", diagram: "Start: ''" },
       { step: 2, description: "Add ( or ) following rules", diagram: "((()))\n(()())\n(())()\n()(())\n()()()" }],
      sol(
        "def generateParenthesis(n):\n    result = []\n    def backtrack(s, open, close):\n        if len(s) == 2 * n:\n            result.append(s)\n            return\n        if open < n: backtrack(s + '(', open + 1, close)\n        if close < open: backtrack(s + ')', open, close + 1)\n    backtrack('', 0, 0)\n    return result",
        "public List<String> generateParenthesis(int n) {\n    List<String> result = new ArrayList<>();\n    backtrack(result, \"\", 0, 0, n);\n    return result;\n}\nvoid backtrack(List<String> res, String s, int open, int close, int n) {\n    if (s.length() == 2*n) { res.add(s); return; }\n    if (open < n) backtrack(res, s+\"(\", open+1, close, n);\n    if (close < open) backtrack(res, s+\")\", open, close+1, n);\n}",
        "vector<string> generateParenthesis(int n) {\n    vector<string> res;\n    function<void(string,int,int)> bt = [&](string s, int o, int c) {\n        if (s.size() == 2*n) { res.push_back(s); return; }\n        if (o < n) bt(s+\"(\", o+1, c);\n        if (c < o) bt(s+\")\", o, c+1);\n    };\n    bt(\"\", 0, 0);\n    return res;\n}"
      ),
      { time: 'O(4ⁿ/√n)', space: 'O(n)', simpleExplanation: "Catalan number of valid combinations. Recursion depth = 2n." },
      "VALID PARENS = add ( if open < n, add ) if close < open. Two simple rules generate ALL valid combos!",
      [mcq("When can we add a closing parenthesis?", ["Anytime", "Only when close < open", "Only at the end", "When open == n"], 1, "We can only close a parenthesis that was opened. So close count must be less than open count.")],
      ["Two choices at each step: add ( or add ). What constraints ensure validity?", "( allowed when open < n. ) allowed when close < open.", "Base case: string length == 2*n → valid combination found!"],
      ["Allowing close >= open (creates invalid sequences)", "Not using backtracking (generating all and filtering is exponentially slower)"]
    ),
    p('Daily Temperatures', 'daily-temperatures', 'MEDIUM', 5,
      "For each day, how many days until a warmer temperature? Use a stack of indices. When you see a warmer temp, pop all cooler days from the stack and calculate the gap. The stack keeps days waiting for their warmer day!",
      'Monotonic Decreasing Stack', "Maintain a stack of indices with decreasing temperatures. When a warmer temperature comes, pop all cooler ones and record the distance.",
      [{ step: 1, description: "temps = [73,74,75,71,69,72,76,73]", diagram: "Output: [1,1,4,2,1,1,0,0]" },
       { step: 2, description: "73 pushed. 74 is warmer → pop 73 (gap=1)", diagram: "Stack tracks indices of days waiting" }],
      sol(
        "def dailyTemperatures(temperatures):\n    n = len(temperatures)\n    result = [0] * n\n    stack = []\n    for i in range(n):\n        while stack and temperatures[i] > temperatures[stack[-1]]:\n            j = stack.pop()\n            result[j] = i - j\n        stack.append(i)\n    return result",
        "public int[] dailyTemperatures(int[] temp) {\n    int[] res = new int[temp.length];\n    Stack<Integer> stack = new Stack<>();\n    for (int i = 0; i < temp.length; i++) {\n        while (!stack.isEmpty() && temp[i] > temp[stack.peek()])\n            res[stack.peek()] = i - stack.pop();\n        stack.push(i);\n    }\n    return res;\n}",
        "vector<int> dailyTemperatures(vector<int>& temp) {\n    int n = temp.size();\n    vector<int> res(n, 0);\n    stack<int> st;\n    for (int i = 0; i < n; i++) {\n        while (!st.empty() && temp[i] > temp[st.top()]) {\n            res[st.top()] = i - st.top();\n            st.pop();\n        }\n        st.push(i);\n    }\n    return res;\n}"
      ),
      { time: 'O(n)', space: 'O(n)', simpleExplanation: "Each index pushed and popped at most once = O(n). Stack = O(n)." },
      "NEXT GREATER = MONOTONIC STACK. Pop when current > top. Distance = current index - popped index.",
      [mcq("What does the stack contain?", ["Temperatures", "Indices of days still waiting for a warmer day", "The answer array", "Pairs of (temp, index)"], 1, "The stack holds indices of days that haven't found their next warmer day yet. Storing indices lets us calculate the gap.")],
      ["Each day 'waits' for a warmer day. What data structure handles 'waiting' in order?", "A stack! Push today's index. When a warmer day comes, pop all cooler days.", "Pop while current temp > stack top temp. Gap = current index - popped index."],
      ["Storing temperatures instead of indices", "Using >= instead of > (equal temp is not warmer)", "Not handling days that never find a warmer day (they stay 0)"]
    ),
    p('Car Fleet', 'car-fleet', 'MEDIUM', 6,
      "Cars drive toward a target. A faster car behind a slower one forms a 'fleet' (slows down to match). Sort by position descending. If car behind arrives at or before the car ahead, they merge into one fleet. Count unique arrival times!",
      'Stack (Sort + Merge)', "Sort cars by position descending. Calculate time to reach target. If a car behind arrives sooner/equal, it joins the fleet ahead. Use a stack of arrival times.",
      [{ step: 1, description: "target=12, pos=[10,8,0,5,3], speed=[2,4,1,1,3]", diagram: "Sort by position desc: [(10,2),(8,4),(5,1),(3,3),(0,1)]" },
       { step: 2, description: "Times to target: [1.0, 1.0, 7.0, 3.0, 12.0]", diagram: "Car at pos 8 catches car at 10 → same fleet" }],
      sol(
        "def carFleet(target, position, speed):\n    cars = sorted(zip(position, speed), reverse=True)\n    stack = []\n    for pos, spd in cars:\n        time = (target - pos) / spd\n        if not stack or time > stack[-1]:\n            stack.append(time)\n    return len(stack)",
        "public int carFleet(int target, int[] position, int[] speed) {\n    int n = position.length;\n    int[][] cars = new int[n][2];\n    for (int i = 0; i < n; i++) cars[i] = new int[]{position[i], speed[i]};\n    Arrays.sort(cars, (a,b) -> b[0]-a[0]);\n    Stack<Double> stack = new Stack<>();\n    for (int[] car : cars) {\n        double time = (double)(target-car[0])/car[1];\n        if (stack.isEmpty() || time > stack.peek()) stack.push(time);\n    }\n    return stack.size();\n}",
        "int carFleet(int target, vector<int>& position, vector<int>& speed) {\n    vector<pair<int,int>> cars;\n    for (int i = 0; i < position.size(); i++) cars.push_back({position[i], speed[i]});\n    sort(cars.rbegin(), cars.rend());\n    stack<double> st;\n    for (auto& [p,s] : cars) {\n        double t = (double)(target-p)/s;\n        if (st.empty() || t > st.top()) st.push(t);\n    }\n    return st.size();\n}"
      ),
      { time: 'O(n log n)', space: 'O(n)', simpleExplanation: "Sort = O(n log n). One pass = O(n). Stack = O(n)." },
      "CAR FLEET = sort by position desc, compare arrival times. Faster car behind → merges with fleet ahead.",
      [mcq("Why sort by position in descending order?", ["To process cars from closest to target first", "Closest cars determine fleet speed for cars behind them", "It's required by the problem", "To make the code simpler"], 1, "The car closest to target sets the pace. Cars behind can only join this fleet or form new ones.")],
      ["Calculate each car's time to reach target.", "Sort by starting position (closest to target first).", "If car behind arrives sooner, it merges. Only keep unique fleet times on the stack."],
      ["Not sorting by position", "Using integer division instead of float", "Not understanding that faster cars behind MUST slow down"]
    ),
    p('Largest Rectangle in Histogram', 'largest-rectangle-in-histogram', 'HARD', 7,
      "Find the largest rectangle that can fit in a histogram. For each bar, how far can it extend left and right? Use a monotonic increasing stack. When a taller bar is popped, calculate its rectangle width using the current boundaries.",
      'Monotonic Increasing Stack', "Maintain a stack of indices with increasing heights. When a shorter bar comes, pop taller bars and calculate their rectangle area.",
      [{ step: 1, description: "heights = [2,1,5,6,2,3]", diagram: "Largest rectangle = 10 (height 5, width 2)" },
       { step: 2, description: "Stack tracks increasing heights. Pop when shorter bar found.", diagram: "Pop 6: width=1, area=6. Pop 5: width=2, area=10 🎉" }],
      sol(
        "def largestRectangleArea(heights):\n    stack = []\n    max_area = 0\n    for i, h in enumerate(heights + [0]):\n        while stack and heights[stack[-1]] > h:\n            height = heights[stack.pop()]\n            width = i if not stack else i - stack[-1] - 1\n            max_area = max(max_area, height * width)\n        stack.append(i)\n    return max_area",
        "public int largestRectangleArea(int[] heights) {\n    Stack<Integer> stack = new Stack<>();\n    int max = 0;\n    for (int i = 0; i <= heights.length; i++) {\n        int h = (i == heights.length) ? 0 : heights[i];\n        while (!stack.isEmpty() && heights[stack.peek()] > h) {\n            int height = heights[stack.pop()];\n            int width = stack.isEmpty() ? i : i - stack.peek() - 1;\n            max = Math.max(max, height * width);\n        }\n        stack.push(i);\n    }\n    return max;\n}",
        "int largestRectangleArea(vector<int>& heights) {\n    stack<int> st;\n    int mx = 0;\n    heights.push_back(0);\n    for (int i = 0; i < heights.size(); i++) {\n        while (!st.empty() && heights[st.top()] > heights[i]) {\n            int h = heights[st.top()]; st.pop();\n            int w = st.empty() ? i : i - st.top() - 1;\n            mx = max(mx, h * w);\n        }\n        st.push(i);\n    }\n    return mx;\n}"
      ),
      { time: 'O(n)', space: 'O(n)', simpleExplanation: "Each bar pushed and popped once = O(n). Stack = O(n)." },
      "HISTOGRAM RECT = monotonic increasing stack. Pop when shorter bar found. Width = distance between stack boundaries.",
      [mcq("Why append a 0 at the end of heights?", ["To pad the array", "To force all remaining bars to be popped and processed", "It's a sentinel value", "Both B and C"], 3, "The 0 is shorter than everything, so it forces all remaining bars off the stack, ensuring every bar's rectangle is calculated.")],
      ["For each bar, it can extend as far as there are taller/equal bars on both sides.", "A monotonic stack efficiently tracks the boundaries.", "Append 0 at end to flush the stack. Width = i - stack[-1] - 1 (or i if stack empty)."],
      ["Not appending a sentinel 0 (some bars never get processed)", "Wrong width calculation after popping", "Using >= instead of > for popping condition"]
    ),
  ]);

  // Count results
  const totalProblems = await prisma.problem.count();
  console.log(`\n🎉 Done! Total problems in database: ${totalProblems}/150`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
