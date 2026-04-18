import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.userAchievement.deleteMany();
  await prisma.spacedReview.deleteMany();
  await prisma.dailyChallenge.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.user.deleteMany();

  // ==================== TOPICS ====================
  const topics = await Promise.all([
    prisma.topic.create({
      data: {
        name: 'Arrays & Hashing', slug: 'arrays-hashing',
        description: 'The foundation of everything! Learn how arrays store data and hash maps find things super fast.',
        icon: '📦', color: '#4CAF50', order: 1
      }
    }),
    prisma.topic.create({
      data: {
        name: 'Two Pointers', slug: 'two-pointers',
        description: 'Use two fingers to walk through arrays from different directions. Simple but powerful!',
        icon: '👆', color: '#2196F3', order: 2
      }
    }),
    prisma.topic.create({
      data: {
        name: 'Sliding Window', slug: 'sliding-window',
        description: 'Like looking through a window that slides along the array. Perfect for subarray problems!',
        icon: '🪟', color: '#9C27B0', order: 3
      }
    }),
    prisma.topic.create({
      data: {
        name: 'Stack', slug: 'stack',
        description: 'Last in, first out — like a stack of plates. Great for matching brackets and more!',
        icon: '📚', color: '#FF9800', order: 4
      }
    }),
    prisma.topic.create({
      data: {
        name: 'Binary Search', slug: 'binary-search',
        description: 'Cut the search space in half each time. Like guessing a number and hearing "higher" or "lower"!',
        icon: '🔍', color: '#F44336', order: 5
      }
    }),
    prisma.topic.create({
      data: {
        name: 'Linked List', slug: 'linked-list',
        description: 'A chain of nodes where each one points to the next. Like a treasure hunt with clues!',
        icon: '🔗', color: '#00BCD4', order: 6
      }
    }),
    prisma.topic.create({
      data: {
        name: 'Trees', slug: 'trees',
        description: 'Upside-down trees with a root at top and leaves at bottom. Family trees for data!',
        icon: '🌳', color: '#8BC34A', order: 7
      }
    }),
    prisma.topic.create({
      data: {
        name: 'Tries', slug: 'tries',
        description: 'A special tree for words. Like an autocomplete dictionary!',
        icon: '📖', color: '#E91E63', order: 8
      }
    }),
    prisma.topic.create({
      data: {
        name: 'Heap / Priority Queue', slug: 'heap-priority-queue',
        description: 'Always know the biggest or smallest item instantly. Like a VIP line!',
        icon: '⛰️', color: '#795548', order: 9
      }
    }),
    prisma.topic.create({
      data: {
        name: 'Backtracking', slug: 'backtracking',
        description: 'Try every path and backtrack when stuck. Like solving a maze!',
        icon: '🔄', color: '#607D8B', order: 10
      }
    }),
    prisma.topic.create({
      data: {
        name: 'Graphs', slug: 'graphs',
        description: 'Networks of connected things — like maps, social networks, and the internet!',
        icon: '🕸️', color: '#3F51B5', order: 11
      }
    }),
    prisma.topic.create({
      data: {
        name: 'Advanced Graphs', slug: 'advanced-graphs',
        description: 'Shortest paths, spanning trees, and more graph superpowers!',
        icon: '🗺️', color: '#009688', order: 12
      }
    }),
    prisma.topic.create({
      data: {
        name: '1D Dynamic Programming', slug: '1d-dynamic-programming',
        description: 'Remember past answers to solve new problems faster. No more re-doing work!',
        icon: '📝', color: '#FF5722', order: 13
      }
    }),
    prisma.topic.create({
      data: {
        name: '2D Dynamic Programming', slug: '2d-dynamic-programming',
        description: 'DP with grids and tables. Like filling in a multiplication table!',
        icon: '📊', color: '#673AB7', order: 14
      }
    }),
    prisma.topic.create({
      data: {
        name: 'Greedy', slug: 'greedy',
        description: 'Always pick the best option right now. Sometimes being greedy is smart!',
        icon: '🏃', color: '#CDDC39', order: 15
      }
    }),
    prisma.topic.create({
      data: {
        name: 'Intervals', slug: 'intervals',
        description: 'Time slots, ranges, and overlaps. Like scheduling your day!',
        icon: '📅', color: '#FFC107', order: 16
      }
    }),
    prisma.topic.create({
      data: {
        name: 'Math & Geometry', slug: 'math-geometry',
        description: 'Numbers, patterns, and shapes. The math behind the code!',
        icon: '🔢', color: '#03A9F4', order: 17
      }
    }),
    prisma.topic.create({
      data: {
        name: 'Bit Manipulation', slug: 'bit-manipulation',
        description: 'Talk to the computer in its own language — ones and zeros!',
        icon: '⚡', color: '#FF4081', order: 18
      }
    }),
  ]);

  const arraysHashing = topics[0];

  // ==================== ARRAYS & HASHING PROBLEMS ====================
  await prisma.problem.createMany({
    data: [
      {
        title: 'Contains Duplicate',
        slug: 'contains-duplicate',
        difficulty: 'EASY',
        order: 1,
        topicId: arraysHashing.id,
        story: "Imagine you're a teacher checking if any student brought the same toy to show-and-tell. You have a list of toy names. Instead of comparing every toy with every other toy (super slow!), you write each toy name on the whiteboard. If you're about to write a name that's ALREADY on the whiteboard — duplicate found! That's exactly how a hash set works.",
        visualSteps: JSON.stringify([
          { step: 1, description: "Start with an empty notebook (hash set)", diagram: "nums = [1, 2, 3, 1]  |  notebook = { }" },
          { step: 2, description: "See 1 → not in notebook → write it down", diagram: "nums = [1, 2, 3, 1]  |  notebook = { 1 }" },
          { step: 3, description: "See 2 → not in notebook → write it down", diagram: "nums = [1, 2, 3, 1]  |  notebook = { 1, 2 }" },
          { step: 4, description: "See 3 → not in notebook → write it down", diagram: "nums = [1, 2, 3, 1]  |  notebook = { 1, 2, 3 }" },
          { step: 5, description: "See 1 → ALREADY in notebook! → DUPLICATE FOUND! 🎉", diagram: "nums = [1, 2, 3, 1]  |  notebook = { 1, 2, 3 }  ← 1 already here!" }
        ]),
        pattern: 'Hash Set',
        patternExplanation: "A hash set is like a super-fast notebook. Writing a name and checking if a name exists both take just ONE step (O(1)). Without it, you'd have to re-read the entire notebook every time!",
        solutions: JSON.stringify({
          python: {
            code: "def containsDuplicate(nums):\n    seen = set()\n    for num in nums:\n        if num in seen:\n            return True\n        seen.add(num)\n    return False",
            lineExplanations: [
              "Create an empty notebook (hash set) called 'seen'",
              "Look at each number one by one",
              "Check: is this number already in our notebook?",
              "Yes! We found a duplicate! Tell everyone!",
              "No? Write it in the notebook for later",
              "We checked everything — no duplicates found"
            ]
          },
          java: {
            code: "public boolean containsDuplicate(int[] nums) {\n    Set<Integer> seen = new HashSet<>();\n    for (int num : nums) {\n        if (seen.contains(num)) {\n            return true;\n        }\n        seen.add(num);\n    }\n    return false;\n}",
            lineExplanations: [
              "Our function takes an array of numbers",
              "Create an empty notebook (HashSet)",
              "Look at each number one by one",
              "Check: is this number already in our notebook?",
              "Yes! Duplicate found!",
              "No? Write it down",
              "",
              "No duplicates found"
            ]
          },
          cpp: {
            code: "bool containsDuplicate(vector<int>& nums) {\n    unordered_set<int> seen;\n    for (int num : nums) {\n        if (seen.count(num)) {\n            return true;\n        }\n        seen.insert(num);\n    }\n    return false;\n}",
            lineExplanations: [
              "Our function takes a list of numbers",
              "Create an empty notebook (unordered_set)",
              "Look at each number one by one",
              "Check: is this number already in our notebook?",
              "Yes! Duplicate found!",
              "No? Write it down",
              "",
              "No duplicates found"
            ]
          }
        }),
        complexity: JSON.stringify({
          time: "O(n)",
          space: "O(n)",
          simpleExplanation: "We look at each number once (that's n numbers = O(n)). Our notebook might store all n numbers = O(n) space. Way better than comparing every pair which would be O(n²)!"
        }),
        memoryTrick: "When checking for DUPLICATES, think SET — it's a collection that says 'No copies allowed!' If adding fails, you found your duplicate.",
        quiz: JSON.stringify([
          {
            type: "multiple_choice",
            question: "Why is using a hash set better than using two loops?",
            options: ["It uses less memory", "It's O(n) instead of O(n²) — much faster!", "It's easier to type", "There's no difference"],
            correct: 1,
            explanation: "Two nested loops compare every pair = O(n²). A hash set checks each number in O(1), so total is O(n). For 1 million numbers: 1 million checks vs 1 trillion checks!"
          },
          {
            type: "multiple_choice",
            question: "What does the hash set store?",
            options: ["The indices of duplicates", "Numbers we've already seen", "The count of each number", "Sorted numbers"],
            correct: 1,
            explanation: "The set stores each number as we see it. When we encounter a number that's already in the set, we know it's a duplicate!"
          },
          {
            type: "fill_blank",
            question: "To check for duplicates, we add each number to a ___. If we try to add a number that already exists, we found a duplicate!",
            answer: "set",
            explanation: "A set is a collection that only stores unique values. Trying to add a duplicate is instantly detected!"
          },
          {
            type: "code_order",
            question: "Put these steps in the right order:",
            options: ["Create an empty set", "Loop through each number", "Check if number is in the set", "If yes, return True", "If no, add it to the set", "Return False after the loop"],
            correctOrder: [0, 1, 2, 3, 4, 5],
            explanation: "First create the set, then check each number — if it's already there, duplicate! Otherwise add it and keep going."
          }
        ]),
        hints: JSON.stringify([
          "Think about what data structure lets you check 'have I seen this before?' really fast...",
          "A Set remembers everything you put in it and can tell you instantly if something is already there.",
          "Loop through the array. For each number, check if it's in your set. If yes → duplicate. If no → add it to the set."
        ]),
        commonMistakes: JSON.stringify([
          "Using a list instead of a set (checking a list is O(n), not O(1))",
          "Sorting first — it works but is O(n log n), slower than the O(n) set approach",
          "Forgetting to add the number to the set after checking it"
        ])
      },
      {
        title: 'Valid Anagram',
        slug: 'valid-anagram',
        difficulty: 'EASY',
        order: 2,
        topicId: arraysHashing.id,
        story: "You and your friend are playing a word game. You want to check if one word can be rearranged to spell another word (an anagram). Like 'listen' can be rearranged to spell 'silent'! The trick? Count how many of each letter appears in both words. If the counts match perfectly, it's an anagram!",
        visualSteps: JSON.stringify([
          { step: 1, description: "Compare 'anagram' and 'nagaram'", diagram: "s = 'anagram'  |  t = 'nagaram'" },
          { step: 2, description: "Count letters in 'anagram'", diagram: "a:3, n:1, g:1, r:1, m:1" },
          { step: 3, description: "Count letters in 'nagaram'", diagram: "n:1, a:3, g:1, r:1, m:1" },
          { step: 4, description: "Compare counts — they match! ✅", diagram: "a:3=3 ✅  n:1=1 ✅  g:1=1 ✅  r:1=1 ✅  m:1=1 ✅" }
        ]),
        pattern: 'Hash Map (Frequency Counter)',
        patternExplanation: "Count things using a hash map! Like tallying votes — go through each item and add to its count. Then compare the tallies. This pattern appears whenever you need to compare FREQUENCIES.",
        solutions: JSON.stringify({
          python: {
            code: "def isAnagram(s, t):\n    if len(s) != len(t):\n        return False\n    count = {}\n    for c in s:\n        count[c] = count.get(c, 0) + 1\n    for c in t:\n        count[c] = count.get(c, 0) - 1\n        if count[c] < 0:\n            return False\n    return True",
            lineExplanations: [
              "Our function takes two words",
              "Quick check: different lengths can't be anagrams!",
              "Return False immediately if lengths differ",
              "Create an empty tally sheet (hash map)",
              "Go through each letter in the first word",
              "Add 1 to that letter's count (start at 0 if new)",
              "Now go through each letter in the second word",
              "Subtract 1 from that letter's count",
              "If any count goes negative, second word has extra letters — not an anagram!",
              "Return False",
              "All counts balanced out — it's an anagram!"
            ]
          },
          java: {
            code: "public boolean isAnagram(String s, String t) {\n    if (s.length() != t.length()) return false;\n    int[] count = new int[26];\n    for (char c : s.toCharArray())\n        count[c - 'a']++;\n    for (char c : t.toCharArray()) {\n        count[c - 'a']--;\n        if (count[c - 'a'] < 0) return false;\n    }\n    return true;\n}",
            lineExplanations: [
              "Takes two strings",
              "Quick length check",
              "Array of 26 slots (one per letter)",
              "Count each letter in first string",
              "Increment the count",
              "Subtract for each letter in second string",
              "Decrement the count",
              "If negative, not an anagram",
              "",
              "All balanced — anagram!"
            ]
          },
          cpp: {
            code: "bool isAnagram(string s, string t) {\n    if (s.size() != t.size()) return false;\n    int count[26] = {0};\n    for (char c : s) count[c - 'a']++;\n    for (char c : t) {\n        count[c - 'a']--;\n        if (count[c - 'a'] < 0) return false;\n    }\n    return true;\n}",
            lineExplanations: [
              "Takes two strings",
              "Quick length check",
              "Array of 26 zeros (one per letter)",
              "Count up letters in first string",
              "Count down letters in second string",
              "Decrement",
              "If negative, extra letter found",
              "",
              "All balanced — anagram!"
            ]
          }
        }),
        complexity: JSON.stringify({
          time: "O(n)",
          space: "O(1)",
          simpleExplanation: "We go through each word once = O(n). We only use 26 slots for letters = O(1) constant space. Super efficient!"
        }),
        memoryTrick: "ANAGRAM = COUNT and COMPARE. Whenever you need to check if two things have the same 'ingredients', count the frequency of each ingredient!",
        quiz: JSON.stringify([
          {
            type: "multiple_choice",
            question: "What's the first quick check before counting letters?",
            options: ["Check if both strings are alphabetical", "Check if string lengths are equal", "Check if first letters match", "Sort both strings"],
            correct: 1,
            explanation: "If the strings have different lengths, they can't possibly be anagrams! This quick check saves time."
          },
          {
            type: "multiple_choice",
            question: "Why do we use an array of size 26?",
            options: ["Because 26 is a lucky number", "One slot for each letter of the alphabet", "It's the maximum word length", "We need 26 comparisons"],
            correct: 1,
            explanation: "There are 26 lowercase English letters. Each slot counts how many times that letter appears."
          }
        ]),
        hints: JSON.stringify([
          "If two words have different lengths, can they be anagrams?",
          "What if you counted how many of each letter appears in both words?",
          "Use a hash map or array of 26 to count letters. Add for the first word, subtract for the second. If everything is zero, it's an anagram!"
        ]),
        commonMistakes: JSON.stringify([
          "Forgetting to check lengths first (saves time!)",
          "Sorting both strings works but is O(n log n) — counting is O(n)",
          "Not handling uppercase vs lowercase (the problem specifies lowercase)"
        ])
      },
      {
        title: 'Two Sum',
        slug: 'two-sum',
        difficulty: 'EASY',
        order: 3,
        topicId: arraysHashing.id,
        story: "You're at a candy store with exactly $9 to spend. You need to buy EXACTLY two candies that add up to $9. The prices are [2, 7, 11, 15]. You could check every pair (slow!), or be smart: for each candy, calculate what price you NEED the other candy to be, and check if you've seen that price before. See candy for $2? You need a $7 candy. Write $2 in your notebook. See $7? Check notebook — $7 means you need $2, and YES $2 is in the notebook! Found it!",
        visualSteps: JSON.stringify([
          { step: 1, description: "Target = 9, nums = [2, 7, 11, 15]. Empty notebook.", diagram: "notebook = { }" },
          { step: 2, description: "See 2. Need 9-2=7. Is 7 in notebook? No. Save {2: index 0}", diagram: "notebook = { 2: 0 }" },
          { step: 3, description: "See 7. Need 9-7=2. Is 2 in notebook? YES! At index 0! 🎉", diagram: "notebook = { 2: 0 }  ← Found! Return [0, 1]" }
        ]),
        pattern: 'Hash Map Lookup',
        patternExplanation: "Instead of checking every pair (O(n²)), we remember what we've seen in a hash map. For each number, we calculate what we NEED and check if we've already seen it. One pass through the array = O(n)!",
        solutions: JSON.stringify({
          python: {
            code: "def twoSum(nums, target):\n    seen = {}  # number -> index\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []",
            lineExplanations: [
              "Function takes a list of numbers and a target sum",
              "Create notebook: maps each number to its index",
              "Go through each number with its index",
              "Calculate: what number do I need to reach the target?",
              "Is that number already in our notebook?",
              "Yes! Return both indices",
              "No? Save this number and its index in the notebook",
              "No pair found (shouldn't happen if valid input)"
            ]
          },
          java: {
            code: "public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> seen = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int complement = target - nums[i];\n        if (seen.containsKey(complement)) {\n            return new int[]{seen.get(complement), i};\n        }\n        seen.put(nums[i], i);\n    }\n    return new int[]{};\n}",
            lineExplanations: [
              "Function takes array and target",
              "Create notebook (HashMap): number → index",
              "Loop through each number",
              "What number do I need?",
              "Is it in the notebook?",
              "Yes! Return both indices",
              "",
              "Save current number and index",
              "",
              "No pair found"
            ]
          },
          cpp: {
            code: "vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> seen;\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i];\n        if (seen.count(complement)) {\n            return {seen[complement], i};\n        }\n        seen[nums[i]] = i;\n    }\n    return {};\n}",
            lineExplanations: [
              "Function takes vector and target",
              "Create notebook (unordered_map)",
              "Loop through each number",
              "What's the complement?",
              "Found in notebook?",
              "Return both indices",
              "",
              "Save to notebook",
              "",
              "No pair found"
            ]
          }
        }),
        complexity: JSON.stringify({
          time: "O(n)",
          space: "O(n)",
          simpleExplanation: "One loop through the array = O(n). Hash map lookups are O(1). We might store all n numbers = O(n) space. WAY better than two loops (O(n²))!"
        }),
        memoryTrick: "When you need to find a PAIR that adds up to something, think HASH MAP — it remembers everything you've already seen, so you can instantly check 'have I seen my complement?'",
        quiz: JSON.stringify([
          {
            type: "multiple_choice",
            question: "Why do we use a hash map instead of two loops?",
            options: ["It's more fun", "It's faster — O(n) vs O(n²)", "It uses less memory", "There's no difference"],
            correct: 1,
            explanation: "Two loops check every pair = O(n²). A hash map lets us check 'have I seen the complement?' in O(1), so total is O(n). Much faster!"
          },
          {
            type: "fill_blank",
            question: "For each number, we calculate target - num, which is called the ___.",
            answer: "complement",
            explanation: "The complement is the number we need to find to reach the target. If target is 9 and num is 2, the complement is 7."
          }
        ]),
        hints: JSON.stringify([
          "For each number, what other number would you need to reach the target?",
          "If target is 9 and current number is 2, you need 7. How can you quickly check if you've seen 7 before?",
          "Use a hash map! Store each number as you go. For each new number, check if (target - number) is already in the map."
        ]),
        commonMistakes: JSON.stringify([
          "Using the same element twice (you can't pair a number with itself)",
          "Forgetting to store the INDEX, not just the number",
          "Adding the current number to the map BEFORE checking (would find itself)"
        ])
      },
      {
        title: 'Group Anagrams',
        slug: 'group-anagrams',
        difficulty: 'MEDIUM',
        order: 4,
        topicId: arraysHashing.id,
        story: "Imagine you're organizing a library where books need to be grouped by their genre. But here's the twist — the 'genre' is determined by the LETTERS in the title! Books with the same letters (just rearranged) go on the same shelf. 'eat', 'tea', and 'ate' all have the same letters (a, e, t), so they go together! The trick is finding a 'fingerprint' for each group.",
        visualSteps: JSON.stringify([
          { step: 1, description: "Input: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat']", diagram: "How to group words with same letters?" },
          { step: 2, description: "Sort each word's letters to create a fingerprint", diagram: "'eat' → 'aet'  |  'tea' → 'aet'  |  'tan' → 'ant'" },
          { step: 3, description: "Group by fingerprint using a hash map", diagram: "'aet': ['eat','tea','ate']  |  'ant': ['tan','nat']  |  'abt': ['bat']" },
          { step: 4, description: "Return all groups!", diagram: "[['eat','tea','ate'], ['tan','nat'], ['bat']]" }
        ]),
        pattern: 'Hash Map Grouping',
        patternExplanation: "When you need to GROUP things by some property, use a hash map where the KEY is that property and the VALUE is the list of items. For anagrams, the 'property' is the sorted letters — all anagrams sort to the same string!",
        solutions: JSON.stringify({
          python: {
            code: "def groupAnagrams(strs):\n    groups = {}\n    for s in strs:\n        key = ''.join(sorted(s))\n        if key not in groups:\n            groups[key] = []\n        groups[key].append(s)\n    return list(groups.values())",
            lineExplanations: [
              "Function takes a list of strings",
              "Create empty shelves (hash map): fingerprint → list of words",
              "Look at each word",
              "Create fingerprint by sorting the letters (eat → aet)",
              "If this fingerprint doesn't have a shelf yet, make one",
              "Create empty list for this group",
              "Put the word on its shelf",
              "Return all the shelves (groups)"
            ]
          },
          java: {
            code: "public List<List<String>> groupAnagrams(String[] strs) {\n    Map<String, List<String>> groups = new HashMap<>();\n    for (String s : strs) {\n        char[] chars = s.toCharArray();\n        Arrays.sort(chars);\n        String key = new String(chars);\n        groups.computeIfAbsent(key, k -> new ArrayList<>()).add(s);\n    }\n    return new ArrayList<>(groups.values());\n}",
            lineExplanations: [
              "Returns list of groups",
              "HashMap: sorted string → list of anagrams",
              "Look at each string",
              "Convert to char array",
              "Sort the letters",
              "Create the fingerprint key",
              "Add to the right group (create if needed)",
              "",
              "Return all groups"
            ]
          },
          cpp: {
            code: "vector<vector<string>> groupAnagrams(vector<string>& strs) {\n    unordered_map<string, vector<string>> groups;\n    for (string& s : strs) {\n        string key = s;\n        sort(key.begin(), key.end());\n        groups[key].push_back(s);\n    }\n    vector<vector<string>> result;\n    for (auto& [key, group] : groups)\n        result.push_back(group);\n    return result;\n}",
            lineExplanations: [
              "Returns vector of groups",
              "Map: sorted string → vector of anagrams",
              "Look at each string",
              "Copy string to create key",
              "Sort the key",
              "Add to the matching group",
              "",
              "Convert map values to result vector",
              "",
              "",
              "Return all groups"
            ]
          }
        }),
        complexity: JSON.stringify({
          time: "O(n * k log k)",
          space: "O(n * k)",
          simpleExplanation: "For each of n words, we sort its k letters = O(k log k). Total: O(n * k log k). We store all words in the map = O(n * k) space."
        }),
        memoryTrick: "Need to GROUP things? Create a FINGERPRINT for each group using a hash map. For anagrams, the fingerprint is the sorted letters!",
        quiz: JSON.stringify([
          {
            type: "multiple_choice",
            question: "What's used as the hash map key to group anagrams?",
            options: ["The original word", "The sorted letters of the word", "The word length", "The first letter"],
            correct: 1,
            explanation: "Sorting the letters creates a unique 'fingerprint'. All anagrams of the same word sort to the same string: eat→aet, tea→aet, ate→aet."
          }
        ]),
        hints: JSON.stringify([
          "What do all anagrams have in common?",
          "If you sort the letters of 'eat' and 'tea', what do you get?",
          "Sort each word's letters to create a key. Use a hash map to group words with the same key!"
        ]),
        commonMistakes: JSON.stringify([
          "Comparing every pair of strings — too slow (O(n² * k))",
          "Using the original string as the key instead of the sorted version",
          "Forgetting that empty strings are valid and are anagrams of each other"
        ])
      },
      {
        title: 'Top K Frequent Elements',
        slug: 'top-k-frequent-elements',
        difficulty: 'MEDIUM',
        order: 5,
        topicId: arraysHashing.id,
        story: "You're running a school election. Students write their favorite lunch on a slip of paper. You need to find the TOP 3 most popular lunches. Step 1: Count the votes (hash map). Step 2: Find the top 3. The clever trick? Use 'bucket sort' — create shelves numbered by vote count, put each lunch on its shelf, then read from the highest shelf down!",
        visualSteps: JSON.stringify([
          { step: 1, description: "nums = [1,1,1,2,2,3], k = 2. Count frequencies.", diagram: "count: {1:3, 2:2, 3:1}" },
          { step: 2, description: "Create buckets by frequency (index = count)", diagram: "bucket[1]=[3], bucket[2]=[2], bucket[3]=[1]" },
          { step: 3, description: "Read from highest bucket down, collect k=2 items", diagram: "bucket[3]→[1], bucket[2]→[2] → Answer: [1, 2]" }
        ]),
        pattern: 'Frequency Count + Bucket Sort',
        patternExplanation: "Two-step pattern: First COUNT frequencies with a hash map. Then SORT by frequency using bucket sort (array where index = frequency). This avoids O(n log n) sorting!",
        solutions: JSON.stringify({
          python: {
            code: "def topKFrequent(nums, k):\n    count = {}\n    for num in nums:\n        count[num] = count.get(num, 0) + 1\n    \n    buckets = [[] for _ in range(len(nums) + 1)]\n    for num, freq in count.items():\n        buckets[freq].append(num)\n    \n    result = []\n    for i in range(len(buckets) - 1, 0, -1):\n        for num in buckets[i]:\n            result.append(num)\n            if len(result) == k:\n                return result\n    return result",
            lineExplanations: [
              "Function takes numbers and k",
              "Create voting tally (hash map)",
              "Count each number's votes",
              "Add 1 to count (or start at 1)",
              "",
              "Create shelves (buckets) — shelf number = vote count",
              "Put each number on its correct shelf",
              "Number with freq votes goes on shelf number freq",
              "",
              "Collect results starting from the highest shelf",
              "Go from highest shelf to lowest",
              "Pick up each number from this shelf",
              "Add it to results",
              "Once we have k items, we're done!",
              "Return the results",
              "Return whatever we collected"
            ]
          },
          java: {
            code: "public int[] topKFrequent(int[] nums, int k) {\n    Map<Integer, Integer> count = new HashMap<>();\n    for (int num : nums)\n        count.merge(num, 1, Integer::sum);\n    \n    List<Integer>[] buckets = new List[nums.length + 1];\n    for (int i = 0; i < buckets.length; i++)\n        buckets[i] = new ArrayList<>();\n    for (var entry : count.entrySet())\n        buckets[entry.getValue()].add(entry.getKey());\n    \n    int[] result = new int[k];\n    int idx = 0;\n    for (int i = buckets.length - 1; i > 0 && idx < k; i--)\n        for (int num : buckets[i])\n            if (idx < k) result[idx++] = num;\n    return result;\n}",
            lineExplanations: [
              "Takes array and k",
              "Count frequencies",
              "Increment count for each number",
              "",
              "",
              "Create bucket array",
              "Initialize each bucket",
              "",
              "Place numbers in frequency buckets",
              "",
              "",
              "Collect from highest bucket",
              "Walk backwards through buckets",
              "Grab numbers from each bucket",
              "Add to result",
              "Return top k"
            ]
          },
          cpp: {
            code: "vector<int> topKFrequent(vector<int>& nums, int k) {\n    unordered_map<int, int> count;\n    for (int num : nums) count[num]++;\n    \n    vector<vector<int>> buckets(nums.size() + 1);\n    for (auto& [num, freq] : count)\n        buckets[freq].push_back(num);\n    \n    vector<int> result;\n    for (int i = buckets.size() - 1; i > 0 && result.size() < k; i--)\n        for (int num : buckets[i])\n            if (result.size() < k) result.push_back(num);\n    return result;\n}",
            lineExplanations: [
              "Takes vector and k",
              "Count map",
              "Count each number",
              "",
              "Create frequency buckets",
              "Place each number in its frequency bucket",
              "",
              "",
              "Collect from highest to lowest",
              "Walk backwards",
              "Grab each number",
              "Add to result until we have k",
              "Return result"
            ]
          }
        }),
        complexity: JSON.stringify({
          time: "O(n)",
          space: "O(n)",
          simpleExplanation: "Counting takes O(n). Bucket sort takes O(n) since max frequency is n. No sorting needed! Compare to sorting approach: O(n log n)."
        }),
        memoryTrick: "TOP K FREQUENT = COUNT first (hash map), then BUCKET SORT (array where index = frequency). Read from highest bucket = most frequent!",
        quiz: JSON.stringify([
          {
            type: "multiple_choice",
            question: "Why do we use bucket sort instead of regular sorting?",
            options: ["It's easier to code", "It gives O(n) instead of O(n log n)", "It uses less memory", "Regular sorting doesn't work here"],
            correct: 1,
            explanation: "Regular sorting is O(n log n). Bucket sort uses the frequency as the index, so it's O(n). The bucket array size is at most n+1."
          }
        ]),
        hints: JSON.stringify([
          "First, count how many times each number appears...",
          "Now you need the top k by count. What if you could organize numbers BY their count?",
          "Create an array where index = frequency. Put numbers at their frequency index. Read from the end for the most frequent!"
        ]),
        commonMistakes: JSON.stringify([
          "Using a heap when bucket sort is simpler and faster (O(n) vs O(n log k))",
          "Forgetting that bucket size should be nums.length + 1 (a number could appear n times)",
          "Not stopping after collecting k elements"
        ])
      },
      {
        title: 'Product of Array Except Self',
        slug: 'product-of-array-except-self',
        difficulty: 'MEDIUM',
        order: 6,
        topicId: arraysHashing.id,
        story: "Imagine 4 kids standing in a line, each holding a number card: [1, 2, 3, 4]. For each kid, you need to calculate what you'd get if you multiplied ALL the other kids' numbers together (but NOT their own). The trick: for each kid, the answer = (product of everyone to their LEFT) × (product of everyone to their RIGHT). Two passes — one left-to-right, one right-to-left!",
        visualSteps: JSON.stringify([
          { step: 1, description: "nums = [1, 2, 3, 4]. We need products EXCEPT self.", diagram: "answer[0]=2*3*4=24, answer[1]=1*3*4=12, answer[2]=1*2*4=8, answer[3]=1*2*3=6" },
          { step: 2, description: "Left pass: prefix products (everything to the LEFT)", diagram: "prefix = [1, 1, 2, 6]  (1 means nothing to the left)" },
          { step: 3, description: "Right pass: multiply by suffix (everything to the RIGHT)", diagram: "suffix products: 24, 12, 4, 1 → result = [24, 12, 8, 6]" }
        ]),
        pattern: 'Prefix & Suffix Products',
        patternExplanation: "When you need info about 'everything except the current item', compute prefix (left side) and suffix (right side) separately, then combine. No division needed!",
        solutions: JSON.stringify({
          python: {
            code: "def productExceptSelf(nums):\n    n = len(nums)\n    result = [1] * n\n    \n    prefix = 1\n    for i in range(n):\n        result[i] = prefix\n        prefix *= nums[i]\n    \n    suffix = 1\n    for i in range(n - 1, -1, -1):\n        result[i] *= suffix\n        suffix *= nums[i]\n    \n    return result",
            lineExplanations: [
              "Function takes list of numbers",
              "Get the length",
              "Start with all 1s (multiplication identity)",
              "",
              "Left-to-right pass: build prefix products",
              "Go left to right",
              "Store product of everything to the LEFT",
              "Include current number in prefix for next position",
              "",
              "Right-to-left pass: multiply by suffix products",
              "Go right to left",
              "Multiply by product of everything to the RIGHT",
              "Include current number in suffix for next position",
              "",
              "Each position now has LEFT * RIGHT = everything except self!"
            ]
          },
          java: {
            code: "public int[] productExceptSelf(int[] nums) {\n    int n = nums.length;\n    int[] result = new int[n];\n    Arrays.fill(result, 1);\n    \n    int prefix = 1;\n    for (int i = 0; i < n; i++) {\n        result[i] = prefix;\n        prefix *= nums[i];\n    }\n    \n    int suffix = 1;\n    for (int i = n - 1; i >= 0; i--) {\n        result[i] *= suffix;\n        suffix *= nums[i];\n    }\n    \n    return result;\n}",
            lineExplanations: [
              "Takes int array",
              "Get length",
              "Create result array",
              "Fill with 1s",
              "",
              "Prefix accumulator",
              "Left to right",
              "Store left product",
              "Grow prefix",
              "",
              "",
              "Suffix accumulator",
              "Right to left",
              "Multiply by right product",
              "Grow suffix",
              "",
              "",
              "Return result"
            ]
          },
          cpp: {
            code: "vector<int> productExceptSelf(vector<int>& nums) {\n    int n = nums.size();\n    vector<int> result(n, 1);\n    \n    int prefix = 1;\n    for (int i = 0; i < n; i++) {\n        result[i] = prefix;\n        prefix *= nums[i];\n    }\n    \n    int suffix = 1;\n    for (int i = n - 1; i >= 0; i--) {\n        result[i] *= suffix;\n        suffix *= nums[i];\n    }\n    \n    return result;\n}",
            lineExplanations: [
              "Takes vector of nums",
              "Get size",
              "Result vector initialized to 1",
              "",
              "Prefix accumulator",
              "Left to right pass",
              "Store product of left side",
              "Include current in prefix",
              "",
              "",
              "Suffix accumulator",
              "Right to left pass",
              "Multiply by right side product",
              "Include current in suffix",
              "",
              "",
              "Return result"
            ]
          }
        }),
        complexity: JSON.stringify({
          time: "O(n)",
          space: "O(1)",
          simpleExplanation: "Two passes through the array = O(n). We use the result array (doesn't count as extra space per the problem). No division needed!"
        }),
        memoryTrick: "EXCEPT SELF = LEFT PRODUCT × RIGHT PRODUCT. Two passes: one left→right (prefix), one right→left (suffix). Multiply them together!",
        quiz: JSON.stringify([
          {
            type: "multiple_choice",
            question: "Why can't we just calculate total product and divide by each element?",
            options: ["Division is too slow", "The problem says 'no division allowed'", "It wouldn't work", "It uses too much memory"],
            correct: 1,
            explanation: "The problem explicitly says you can't use division. Plus, division breaks if any element is 0! The prefix/suffix approach handles all cases."
          }
        ]),
        hints: JSON.stringify([
          "For each position, the answer is (product of everything to the left) × (product of everything to the right).",
          "Can you calculate all left-products in one pass and all right-products in another?",
          "First pass left→right: store prefix products. Second pass right→left: multiply by suffix products."
        ]),
        commonMistakes: JSON.stringify([
          "Using division (fails with zeros and is explicitly not allowed)",
          "Using O(n) extra space for separate prefix and suffix arrays (can be done in O(1))",
          "Off-by-one errors in the prefix/suffix calculation"
        ])
      },
      {
        title: 'Valid Sudoku',
        slug: 'valid-sudoku',
        difficulty: 'MEDIUM',
        order: 7,
        topicId: arraysHashing.id,
        story: "You're checking if a Sudoku puzzle is filled in correctly (so far). The rules are simple: no repeated numbers in any row, any column, or any 3×3 box. It's like being a teacher checking homework — use a hash set for each row, each column, and each box to track what numbers you've seen!",
        visualSteps: JSON.stringify([
          { step: 1, description: "For each cell with a number, check 3 things:", diagram: "1. Is it already in this ROW?\n2. Is it already in this COLUMN?\n3. Is it already in this 3×3 BOX?" },
          { step: 2, description: "Use 9 sets for rows, 9 for columns, 9 for boxes", diagram: "row_sets[0..8], col_sets[0..8], box_sets[0..8]" },
          { step: 3, description: "Box index trick: box = (row/3)*3 + (col/3)", diagram: "Cell (4,7) → box = (4/3)*3 + (7/3) = 1*3+2 = 5" }
        ]),
        pattern: 'Hash Set Validation',
        patternExplanation: "Use multiple hash sets to track constraints simultaneously. Each set enforces one rule. If adding to ANY set fails (duplicate), the puzzle is invalid!",
        solutions: JSON.stringify({
          python: {
            code: "def isValidSudoku(board):\n    rows = [set() for _ in range(9)]\n    cols = [set() for _ in range(9)]\n    boxes = [set() for _ in range(9)]\n    \n    for r in range(9):\n        for c in range(9):\n            num = board[r][c]\n            if num == '.':\n                continue\n            box_idx = (r // 3) * 3 + (c // 3)\n            if num in rows[r] or num in cols[c] or num in boxes[box_idx]:\n                return False\n            rows[r].add(num)\n            cols[c].add(num)\n            boxes[box_idx].add(num)\n    \n    return True",
            lineExplanations: [
              "Function takes a 9×9 board",
              "9 sets for rows — track what's in each row",
              "9 sets for columns",
              "9 sets for 3×3 boxes",
              "",
              "Check every cell",
              "",
              "Get the number",
              "Skip empty cells",
              "Skip!",
              "Calculate which 3×3 box this cell belongs to",
              "Check all 3 rules: any duplicates?",
              "Rule violated — invalid!",
              "Remember this number in its row, column, and box",
              "",
              "",
              "",
              "All checks passed — valid!"
            ]
          },
          java: {
            code: "public boolean isValidSudoku(char[][] board) {\n    Set<Character>[] rows = new HashSet[9];\n    Set<Character>[] cols = new HashSet[9];\n    Set<Character>[] boxes = new HashSet[9];\n    for (int i = 0; i < 9; i++) {\n        rows[i] = new HashSet<>();\n        cols[i] = new HashSet<>();\n        boxes[i] = new HashSet<>();\n    }\n    for (int r = 0; r < 9; r++) {\n        for (int c = 0; c < 9; c++) {\n            char num = board[r][c];\n            if (num == '.') continue;\n            int boxIdx = (r / 3) * 3 + (c / 3);\n            if (!rows[r].add(num) || !cols[c].add(num) || !boxes[boxIdx].add(num))\n                return false;\n        }\n    }\n    return true;\n}",
            lineExplanations: ["Takes 9x9 board", "Row sets", "Column sets", "Box sets", "Initialize", "", "", "", "", "Check each cell", "", "Get number", "Skip empty", "Calculate box index", "Try adding to all 3 sets — add() returns false if duplicate", "Invalid!", "", "", "Valid!"]
          },
          cpp: {
            code: "bool isValidSudoku(vector<vector<char>>& board) {\n    unordered_set<char> rows[9], cols[9], boxes[9];\n    for (int r = 0; r < 9; r++) {\n        for (int c = 0; c < 9; c++) {\n            char num = board[r][c];\n            if (num == '.') continue;\n            int boxIdx = (r / 3) * 3 + (c / 3);\n            if (rows[r].count(num) || cols[c].count(num) || boxes[boxIdx].count(num))\n                return false;\n            rows[r].insert(num);\n            cols[c].insert(num);\n            boxes[boxIdx].insert(num);\n        }\n    }\n    return true;\n}",
            lineExplanations: ["Takes board", "9 sets each for rows, cols, boxes", "Check each cell", "", "Get number", "Skip empty", "Calculate box index", "Check for duplicates", "Invalid!", "Add to row set", "Add to col set", "Add to box set", "", "", "Valid!"]
          }
        }),
        complexity: JSON.stringify({
          time: "O(81) = O(1)",
          space: "O(81) = O(1)",
          simpleExplanation: "We always check exactly 81 cells (9×9). Each cell does constant work. Board is always 9×9, so everything is constant!"
        }),
        memoryTrick: "Sudoku has 3 rules → use 3 ARRAYS OF SETS (rows, cols, boxes). Box index formula: (row/3)*3 + (col/3). Check all 3 before adding!",
        quiz: JSON.stringify([
          {
            type: "multiple_choice",
            question: "How do you calculate which 3×3 box a cell belongs to?",
            options: ["row + col", "(row/3)*3 + (col/3)", "row * col / 9", "(row%3) + (col%3)"],
            correct: 1,
            explanation: "Integer division by 3 gives the box row (0,1,2). Multiply by 3 and add box column to get a unique index 0-8."
          }
        ]),
        hints: JSON.stringify([
          "What are the 3 rules of Sudoku? How would you check each one?",
          "Can you use a Set for each row, each column, and each 3×3 box?",
          "For each number, check if it's already in its row-set, col-set, or box-set. If yes → invalid. If no → add it to all three."
        ]),
        commonMistakes: JSON.stringify([
          "Forgetting the box index formula: (row/3)*3 + (col/3)",
          "Not skipping empty cells (dots)",
          "Checking if the puzzle is SOLVABLE instead of just VALID so far"
        ])
      },
      {
        title: 'Encode and Decode Strings',
        slug: 'encode-decode-strings',
        difficulty: 'MEDIUM',
        order: 8,
        topicId: arraysHashing.id,
        story: "You need to pack a list of words into ONE single string (encode), then later unpack that string back into the original list (decode). The challenge? Words can contain ANY characters, including the separator you'd normally use! The trick: put the LENGTH of each word before it, separated by a special marker. Like a shipping label: '5#hello5#world'",
        visualSteps: JSON.stringify([
          { step: 1, description: "Encode ['hello', 'world']", diagram: "5#hello5#world" },
          { step: 2, description: "Decode: read number, then # , then that many characters", diagram: "5# → read 5 chars → 'hello' → 5# → read 5 chars → 'world'" },
          { step: 3, description: "Works even with tricky strings!", diagram: "['2#hi'] → encode: '4#2#hi' → decode: read 4 chars → '2#hi' ✅" }
        ]),
        pattern: 'Length Prefix Encoding',
        patternExplanation: "When you need to combine strings that might contain ANY character (including your delimiter), use LENGTH PREFIX: put the length of each string before it. This way you always know exactly how many characters to read!",
        solutions: JSON.stringify({
          python: {
            code: "def encode(strs):\n    result = ''\n    for s in strs:\n        result += str(len(s)) + '#' + s\n    return result\n\ndef decode(s):\n    result = []\n    i = 0\n    while i < len(s):\n        j = i\n        while s[j] != '#':\n            j += 1\n        length = int(s[i:j])\n        result.append(s[j+1:j+1+length])\n        i = j + 1 + length\n    return result",
            lineExplanations: [
              "Encode: pack list into one string",
              "Start with empty string",
              "For each word",
              "Add: length + '#' + word (e.g., '5#hello')",
              "Return the packed string",
              "",
              "Decode: unpack string back to list",
              "Result list",
              "Start reading from position 0",
              "While there's more to read",
              "Find where the '#' is",
              "Move j forward until we hit '#'",
              "",
              "Read the length number",
              "Extract exactly 'length' characters after the '#'",
              "Move to the next encoded string",
              "Return the unpacked list"
            ]
          },
          java: {
            code: "public String encode(List<String> strs) {\n    StringBuilder sb = new StringBuilder();\n    for (String s : strs)\n        sb.append(s.length()).append('#').append(s);\n    return sb.toString();\n}\n\npublic List<String> decode(String s) {\n    List<String> result = new ArrayList<>();\n    int i = 0;\n    while (i < s.length()) {\n        int j = i;\n        while (s.charAt(j) != '#') j++;\n        int len = Integer.parseInt(s.substring(i, j));\n        result.add(s.substring(j + 1, j + 1 + len));\n        i = j + 1 + len;\n    }\n    return result;\n}",
            lineExplanations: ["Encode function", "StringBuilder for efficiency", "Append length#string for each", "", "Return encoded", "", "Decode function", "Result list", "Position pointer", "While more to read", "Find # delimiter", "", "Parse length", "Extract string", "Move pointer", "", "Return decoded"]
          },
          cpp: {
            code: "string encode(vector<string>& strs) {\n    string result;\n    for (auto& s : strs)\n        result += to_string(s.size()) + '#' + s;\n    return result;\n}\n\nvector<string> decode(string s) {\n    vector<string> result;\n    int i = 0;\n    while (i < s.size()) {\n        int j = i;\n        while (s[j] != '#') j++;\n        int len = stoi(s.substr(i, j - i));\n        result.push_back(s.substr(j + 1, len));\n        i = j + 1 + len;\n    }\n    return result;\n}",
            lineExplanations: ["Encode", "Result string", "Append length#string", "", "Return", "", "Decode", "Result vector", "Position", "While more to read", "Find #", "", "Parse length", "Extract substring", "Advance pointer", "", "Return"]
          }
        }),
        complexity: JSON.stringify({
          time: "O(n)",
          space: "O(1)",
          simpleExplanation: "Encode: visit each character once = O(total characters). Decode: same. No extra space beyond the output."
        }),
        memoryTrick: "To encode strings that might contain ANY character: LENGTH + DELIMITER + STRING. The length tells you exactly how many chars to read, so the delimiter can't cause confusion!",
        quiz: JSON.stringify([
          {
            type: "multiple_choice",
            question: "Why can't we just join strings with a comma?",
            options: ["Commas are too slow", "A string might contain a comma, breaking the decode", "Commas use too much memory", "Python doesn't support commas"],
            correct: 1,
            explanation: "If a string contains the delimiter character, decode breaks. Length-prefix encoding avoids this because we know EXACTLY how many characters to read."
          }
        ]),
        hints: JSON.stringify([
          "What if one of the strings contains your separator character?",
          "Instead of a separator, what if you knew the LENGTH of each string?",
          "Encode as: length + '#' + string. To decode, read the number before '#', then read exactly that many characters."
        ]),
        commonMistakes: JSON.stringify([
          "Using a simple delimiter like ',' that might appear in the strings",
          "Not handling empty strings correctly",
          "Forgetting that the length can be multiple digits (e.g., length 12 = '12#...')"
        ])
      },
      {
        title: 'Longest Consecutive Sequence',
        slug: 'longest-consecutive-sequence',
        difficulty: 'MEDIUM',
        order: 9,
        topicId: arraysHashing.id,
        story: "You dump a bag of numbered marbles on the floor: [100, 4, 200, 1, 3, 2]. What's the longest chain of consecutive numbers? 1,2,3,4 = length 4! The trick: put all numbers in a set. Then for each number, check if it's the START of a sequence (is num-1 missing?). If it is the start, count how far the sequence goes!",
        visualSteps: JSON.stringify([
          { step: 1, description: "nums = [100, 4, 200, 1, 3, 2]. Put in a set.", diagram: "set = {100, 4, 200, 1, 3, 2}" },
          { step: 2, description: "Check 100: is 99 in set? No → 100 is a START. 101 in set? No. Length = 1", diagram: "Sequence: [100] → length 1" },
          { step: 3, description: "Check 4: is 3 in set? Yes → 4 is NOT a start, skip!", diagram: "4 is not a sequence start (3 exists)" },
          { step: 4, description: "Check 1: is 0 in set? No → 1 is a START. Count: 1→2→3→4→stop. Length = 4!", diagram: "Sequence: [1,2,3,4] → length 4 🎉" }
        ]),
        pattern: 'Hash Set + Sequence Start Detection',
        patternExplanation: "Put everything in a set for O(1) lookups. Then only start counting from SEQUENCE BEGINNINGS (where num-1 doesn't exist). This ensures each number is visited at most twice = O(n)!",
        solutions: JSON.stringify({
          python: {
            code: "def longestConsecutive(nums):\n    num_set = set(nums)\n    longest = 0\n    \n    for num in num_set:\n        if num - 1 not in num_set:\n            length = 1\n            while num + length in num_set:\n                length += 1\n            longest = max(longest, length)\n    \n    return longest",
            lineExplanations: [
              "Function takes list of numbers",
              "Put all numbers in a set (for instant lookups)",
              "Track the longest sequence found",
              "",
              "Check each number",
              "Is this the START of a sequence? (num-1 doesn't exist)",
              "Start counting from length 1",
              "Keep going while the next number exists",
              "Grow the sequence",
              "Update longest if this sequence is longer",
              "",
              "Return the longest consecutive sequence length"
            ]
          },
          java: {
            code: "public int longestConsecutive(int[] nums) {\n    Set<Integer> numSet = new HashSet<>();\n    for (int num : nums) numSet.add(num);\n    int longest = 0;\n    \n    for (int num : numSet) {\n        if (!numSet.contains(num - 1)) {\n            int length = 1;\n            while (numSet.contains(num + length))\n                length++;\n            longest = Math.max(longest, length);\n        }\n    }\n    return longest;\n}",
            lineExplanations: ["Takes array", "Create HashSet", "Add all numbers", "Track longest", "", "Check each number", "Is it a sequence start?", "Count from 1", "Extend while next exists", "", "Update longest", "", "", "Return longest"]
          },
          cpp: {
            code: "int longestConsecutive(vector<int>& nums) {\n    unordered_set<int> numSet(nums.begin(), nums.end());\n    int longest = 0;\n    \n    for (int num : numSet) {\n        if (!numSet.count(num - 1)) {\n            int length = 1;\n            while (numSet.count(num + length))\n                length++;\n            longest = max(longest, length);\n        }\n    }\n    return longest;\n}",
            lineExplanations: ["Takes vector", "Create set from nums", "Track longest", "", "Check each number", "Is it a sequence start?", "Count from 1", "Extend while next exists", "", "Update longest", "", "", "Return longest"]
          }
        }),
        complexity: JSON.stringify({
          time: "O(n)",
          space: "O(n)",
          simpleExplanation: "Building the set = O(n). Each number is visited at most twice (once when checking, once when counted in a sequence) = O(n). Total: O(n). Set takes O(n) space."
        }),
        memoryTrick: "CONSECUTIVE SEQUENCE = SET + START DETECTION. Only count from numbers where (num-1) is MISSING — that's the start. Then count forward. Each number visited at most twice!",
        quiz: JSON.stringify([
          {
            type: "multiple_choice",
            question: "Why do we only count sequences starting from numbers where (num-1) is missing?",
            options: ["To save memory", "So we don't count the same sequence multiple times", "Because it's required by the problem", "To handle negative numbers"],
            correct: 1,
            explanation: "If we started counting from every number, we'd count [1,2,3,4] when starting from 1, AND [2,3,4] from 2, AND [3,4] from 3. By only starting from the beginning, each sequence is counted once!"
          }
        ]),
        hints: JSON.stringify([
          "What if you could check 'does number X exist?' in O(1)?",
          "Put all numbers in a set. Now for each number, can you tell if it's the START of a consecutive sequence?",
          "A number is a sequence START if (num-1) is NOT in the set. From each start, count consecutive numbers going up."
        ]),
        commonMistakes: JSON.stringify([
          "Sorting first — works but is O(n log n), not O(n)",
          "Counting from every number (not just starts) — still works but O(n²) in worst case",
          "Not handling duplicate numbers (set automatically removes them)"
        ])
      }
    ]
  });

  // ==================== ACHIEVEMENTS ====================
  await prisma.achievement.createMany({
    data: [
      { name: 'First Blood', description: 'Complete your first problem', icon: '🎯', criteria: { type: 'problems_completed', count: 1 } },
      { name: 'Getting Started', description: 'Complete 5 problems', icon: '🚀', criteria: { type: 'problems_completed', count: 5 } },
      { name: 'Double Digits', description: 'Complete 10 problems', icon: '🔟', criteria: { type: 'problems_completed', count: 10 } },
      { name: 'Quarter Way', description: 'Complete 37 problems', icon: '📊', criteria: { type: 'problems_completed', count: 37 } },
      { name: 'Halfway There', description: 'Complete 75 problems', icon: '⚡', criteria: { type: 'problems_completed', count: 75 } },
      { name: 'NeetCode 150', description: 'Complete all 150 problems', icon: '👑', criteria: { type: 'problems_completed', count: 150 } },
      { name: 'Week Warrior', description: '7-day streak', icon: '🔥', criteria: { type: 'streak_days', count: 7 } },
      { name: 'Streak Lord', description: '30-day streak', icon: '💪', criteria: { type: 'streak_days', count: 30 } },
      { name: 'Century Streak', description: '100-day streak', icon: '💯', criteria: { type: 'streak_days', count: 100 } },
      { name: 'Pattern Hunter', description: 'Complete all problems in a topic', icon: '🏆', criteria: { type: 'topics_completed', count: 1 } },
      { name: 'Topic Master', description: 'Complete 5 topics', icon: '🎓', criteria: { type: 'topics_completed', count: 5 } },
      { name: 'Code Cadet', description: 'Reach level 6', icon: '⭐', criteria: { type: 'level_reached', count: 6 } },
      { name: 'Algorithm Apprentice', description: 'Reach level 16', icon: '🌟', criteria: { type: 'level_reached', count: 16 } },
      { name: 'Data Wizard', description: 'Reach level 26', icon: '🧙', criteria: { type: 'level_reached', count: 26 } },
      { name: 'Interview Ready', description: 'Reach level 36', icon: '💼', criteria: { type: 'level_reached', count: 36 } },
    ]
  });

  console.log('Seeding complete!');
  console.log(`Created ${topics.length} topics`);
  console.log('Created 9 problems for Arrays & Hashing');
  console.log('Created 15 achievements');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
