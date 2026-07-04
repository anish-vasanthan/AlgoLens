import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// ── 100 Curated Problems ──────────────────────────────────────────────────────

const PROBLEMS = [
  // Arrays (20)
  { title: 'Two Sum', statement: 'Given an array of integers and a target, return indices of the two numbers that add up to target.', tags: ['Arrays', 'Hashing'], difficulty: 'Easy', is_curated: true },
  { title: 'Best Time to Buy and Sell Stock', statement: 'Given prices array, find the maximum profit from one buy and one sell.', tags: ['Arrays'], difficulty: 'Easy', is_curated: true },
  { title: 'Contains Duplicate', statement: 'Given an array, return true if any value appears at least twice.', tags: ['Arrays', 'Hashing'], difficulty: 'Easy', is_curated: true },
  { title: 'Product of Array Except Self', statement: 'Return array where each element is the product of all other elements without using division.', tags: ['Arrays'], difficulty: 'Medium', is_curated: true },
  { title: 'Maximum Subarray', statement: 'Find the contiguous subarray with the largest sum (Kadane\'s algorithm).', tags: ['Arrays', 'DP'], difficulty: 'Medium', is_curated: true },
  { title: 'Maximum Product Subarray', statement: 'Find the contiguous subarray that has the largest product.', tags: ['Arrays', 'DP'], difficulty: 'Medium', is_curated: true },
  { title: 'Find Minimum in Rotated Sorted Array', statement: 'Find the minimum element in a rotated sorted array.', tags: ['Arrays', 'Search'], difficulty: 'Medium', is_curated: true },
  { title: 'Search in Rotated Sorted Array', statement: 'Search for a target in a rotated sorted array. Return its index or -1.', tags: ['Arrays', 'Search'], difficulty: 'Medium', is_curated: true },
  { title: '3Sum', statement: 'Find all unique triplets in the array that sum to zero.', tags: ['Arrays'], difficulty: 'Medium', is_curated: true },
  { title: 'Container With Most Water', statement: 'Find two lines that together with the x-axis form a container that holds the most water.', tags: ['Arrays'], difficulty: 'Medium', is_curated: true },
  { title: 'Merge Intervals', statement: 'Merge all overlapping intervals and return the result.', tags: ['Arrays', 'Sorting'], difficulty: 'Medium', is_curated: true },
  { title: 'Insert Interval', statement: 'Insert a new interval into a sorted list of non-overlapping intervals and merge if necessary.', tags: ['Arrays'], difficulty: 'Medium', is_curated: true },
  { title: 'Non-overlapping Intervals', statement: 'Find the minimum number of intervals to remove to make the rest non-overlapping.', tags: ['Arrays', 'Sorting'], difficulty: 'Medium', is_curated: true },
  { title: 'Sort Colors (Dutch National Flag)', statement: 'Sort an array of 0s, 1s, and 2s in-place without using sort().', tags: ['Arrays'], difficulty: 'Medium', is_curated: true },
  { title: 'Rotate Array', statement: 'Rotate an array to the right by k steps.', tags: ['Arrays'], difficulty: 'Medium', is_curated: true },
  { title: 'Trapping Rain Water', statement: 'Given elevation map, compute how much water it can trap after raining.', tags: ['Arrays'], difficulty: 'Hard', is_curated: true },
  { title: 'Sliding Window Maximum', statement: 'Return the maximum value in each sliding window of size k.', tags: ['Arrays', 'Stack/Queue'], difficulty: 'Hard', is_curated: true },
  { title: 'First Missing Positive', statement: 'Find the smallest missing positive integer in an unsorted array in O(n) time and O(1) space.', tags: ['Arrays'], difficulty: 'Hard', is_curated: true },
  { title: 'Move Zeroes', statement: 'Move all zeroes to the end while maintaining the relative order of non-zero elements.', tags: ['Arrays'], difficulty: 'Easy', is_curated: true },
  { title: 'Subarray Sum Equals K', statement: 'Find the total number of subarrays whose sum equals k.', tags: ['Arrays', 'Hashing'], difficulty: 'Medium', is_curated: true },

  // Strings (15)
  { title: 'Longest Substring Without Repeating Characters', statement: 'Find the length of the longest substring without repeating characters.', tags: ['Strings', 'Sliding Window'], difficulty: 'Medium', is_curated: true },
  { title: 'Longest Repeating Character Replacement', statement: 'Find the longest substring containing the same letter after at most k replacements.', tags: ['Strings', 'Sliding Window'], difficulty: 'Medium', is_curated: true },
  { title: 'Minimum Window Substring', statement: 'Find the minimum window substring of s that contains all characters of t.', tags: ['Strings', 'Sliding Window'], difficulty: 'Hard', is_curated: true },
  { title: 'Valid Anagram', statement: 'Given two strings, return true if one is an anagram of the other.', tags: ['Strings', 'Hashing'], difficulty: 'Easy', is_curated: true },
  { title: 'Group Anagrams', statement: 'Group strings that are anagrams of each other.', tags: ['Strings', 'Hashing'], difficulty: 'Medium', is_curated: true },
  { title: 'Valid Parentheses', statement: 'Determine if an input string of brackets is valid and properly closed.', tags: ['Strings', 'Stack/Queue'], difficulty: 'Easy', is_curated: true },
  { title: 'Palindromic Substrings', statement: 'Count the number of palindromic substrings in a string.', tags: ['Strings'], difficulty: 'Medium', is_curated: true },
  { title: 'Longest Palindromic Substring', statement: 'Find the longest palindromic substring in a string.', tags: ['Strings', 'DP'], difficulty: 'Medium', is_curated: true },
  { title: 'Encode and Decode Strings', statement: 'Design an algorithm to encode a list of strings and decode it back.', tags: ['Strings'], difficulty: 'Medium', is_curated: true },
  { title: 'Reverse Words in a String', statement: 'Reverse the order of words in a given string.', tags: ['Strings'], difficulty: 'Medium', is_curated: true },
  { title: 'String to Integer (atoi)', statement: 'Implement atoi which converts a string to an integer.', tags: ['Strings'], difficulty: 'Medium', is_curated: true },
  { title: 'Longest Common Prefix', statement: 'Find the longest common prefix string among an array of strings.', tags: ['Strings'], difficulty: 'Easy', is_curated: true },
  { title: 'Zigzag Conversion', statement: 'Write a string in a zigzag pattern and read line by line.', tags: ['Strings'], difficulty: 'Medium', is_curated: true },
  { title: 'Count and Say', statement: 'Return the nth term of the count-and-say sequence.', tags: ['Strings'], difficulty: 'Medium', is_curated: true },
  { title: 'Word Pattern', statement: 'Given a pattern and a string, determine if the string follows the pattern.', tags: ['Strings', 'Hashing'], difficulty: 'Easy', is_curated: true },

  // Binary Search (8)
  { title: 'Binary Search', statement: 'Given a sorted array, return the index of the target or -1. Must run in O(log n).', tags: ['Search', 'Arrays'], difficulty: 'Easy', is_curated: true },
  { title: 'Find Peak Element', statement: 'Find a peak element — an element greater than its neighbors — in O(log n).', tags: ['Search', 'Arrays'], difficulty: 'Medium', is_curated: true },
  { title: 'Koko Eating Bananas', statement: 'Find the minimum eating speed so Koko can eat all bananas within h hours.', tags: ['Search'], difficulty: 'Medium', is_curated: true },
  { title: 'Median of Two Sorted Arrays', statement: 'Find the median of two sorted arrays in O(log(m+n)) time.', tags: ['Search', 'Arrays'], difficulty: 'Hard', is_curated: true },
  { title: 'Time Based Key-Value Store', statement: 'Design a time-based key-value data structure that returns the most recent value for a timestamp.', tags: ['Search', 'Hashing'], difficulty: 'Medium', is_curated: true },
  { title: 'Search a 2D Matrix', statement: 'Search for a target in an m x n matrix where rows and columns are sorted.', tags: ['Search', 'Arrays'], difficulty: 'Medium', is_curated: true },
  { title: 'Find First and Last Position in Sorted Array', statement: 'Find the starting and ending position of a target in a sorted array in O(log n).', tags: ['Search', 'Arrays'], difficulty: 'Medium', is_curated: true },
  { title: 'Sqrt(x)', statement: 'Compute and return the square root of x rounded down to the nearest integer.', tags: ['Search'], difficulty: 'Easy', is_curated: true },

  // Trees (15)
  { title: 'Invert Binary Tree', statement: 'Invert a binary tree (mirror it).', tags: ['Trees'], difficulty: 'Easy', is_curated: true },
  { title: 'Maximum Depth of Binary Tree', statement: 'Find the maximum depth of a binary tree.', tags: ['Trees'], difficulty: 'Easy', is_curated: true },
  { title: 'Same Tree', statement: 'Check if two binary trees are structurally identical with the same node values.', tags: ['Trees'], difficulty: 'Easy', is_curated: true },
  { title: 'Subtree of Another Tree', statement: 'Determine if a tree is a subtree of another binary tree.', tags: ['Trees'], difficulty: 'Easy', is_curated: true },
  { title: 'Lowest Common Ancestor of BST', statement: 'Find the lowest common ancestor of two nodes in a BST.', tags: ['Trees'], difficulty: 'Medium', is_curated: true },
  { title: 'Binary Tree Level Order Traversal', statement: 'Return the level order traversal of a binary tree as a list of lists.', tags: ['Trees'], difficulty: 'Medium', is_curated: true },
  { title: 'Validate Binary Search Tree', statement: 'Determine if a binary tree is a valid BST.', tags: ['Trees'], difficulty: 'Medium', is_curated: true },
  { title: 'Kth Smallest Element in BST', statement: 'Find the kth smallest element in a BST.', tags: ['Trees'], difficulty: 'Medium', is_curated: true },
  { title: 'Construct Binary Tree from Preorder and Inorder', statement: 'Build a binary tree from preorder and inorder traversal arrays.', tags: ['Trees'], difficulty: 'Medium', is_curated: true },
  { title: 'Binary Tree Maximum Path Sum', statement: 'Find the maximum path sum in a binary tree (path may start and end at any node).', tags: ['Trees'], difficulty: 'Hard', is_curated: true },
  { title: 'Serialize and Deserialize Binary Tree', statement: 'Design an algorithm to serialize and deserialize a binary tree.', tags: ['Trees'], difficulty: 'Hard', is_curated: true },
  { title: 'Diameter of Binary Tree', statement: 'Find the length of the longest path between any two nodes in a binary tree.', tags: ['Trees'], difficulty: 'Easy', is_curated: true },
  { title: 'Balanced Binary Tree', statement: 'Determine if a binary tree is height-balanced.', tags: ['Trees'], difficulty: 'Easy', is_curated: true },
  { title: 'Path Sum', statement: 'Determine if the tree has a root-to-leaf path such that the sum equals targetSum.', tags: ['Trees'], difficulty: 'Easy', is_curated: true },
  { title: 'Right Side View of Binary Tree', statement: 'Return the values visible when looking from the right side of a binary tree.', tags: ['Trees'], difficulty: 'Medium', is_curated: true },

  // Graphs (10)
  { title: 'Number of Islands', statement: 'Count the number of islands in a 2D grid of 1s (land) and 0s (water).', tags: ['Graphs'], difficulty: 'Medium', is_curated: true },
  { title: 'Clone Graph', statement: 'Return a deep copy of an undirected graph.', tags: ['Graphs'], difficulty: 'Medium', is_curated: true },
  { title: 'Pacific Atlantic Water Flow', statement: 'Find cells that can flow to both the Pacific and Atlantic oceans.', tags: ['Graphs'], difficulty: 'Medium', is_curated: true },
  { title: 'Course Schedule', statement: 'Determine if you can finish all courses given prerequisites (cycle detection).', tags: ['Graphs'], difficulty: 'Medium', is_curated: true },
  { title: 'Course Schedule II', statement: 'Return the order of courses you should take to finish all given prerequisites.', tags: ['Graphs'], difficulty: 'Medium', is_curated: true },
  { title: 'Graph Valid Tree', statement: 'Given n nodes and edges, determine if the edges form a valid tree.', tags: ['Graphs'], difficulty: 'Medium', is_curated: true },
  { title: 'Number of Connected Components', statement: 'Find the number of connected components in an undirected graph.', tags: ['Graphs'], difficulty: 'Medium', is_curated: true },
  { title: 'Word Ladder', statement: 'Find the shortest transformation sequence from beginWord to endWord.', tags: ['Graphs'], difficulty: 'Hard', is_curated: true },
  { title: 'Surrounded Regions', statement: 'Capture all regions surrounded by X by flipping enclosed O cells.', tags: ['Graphs'], difficulty: 'Medium', is_curated: true },
  { title: 'Rotting Oranges', statement: 'Find the minimum time to rot all fresh oranges, or return -1 if impossible.', tags: ['Graphs'], difficulty: 'Medium', is_curated: true },

  // Dynamic Programming (15)
  { title: 'Climbing Stairs', statement: 'Count the number of ways to climb n stairs taking 1 or 2 steps at a time.', tags: ['DP'], difficulty: 'Easy', is_curated: true },
  { title: 'House Robber', statement: 'Find the maximum amount you can rob without robbing two adjacent houses.', tags: ['DP'], difficulty: 'Medium', is_curated: true },
  { title: 'House Robber II', statement: 'Same as House Robber but houses are in a circle.', tags: ['DP'], difficulty: 'Medium', is_curated: true },
  { title: 'Longest Palindromic Substring (DP)', statement: 'Find the longest palindromic substring using dynamic programming.', tags: ['DP', 'Strings'], difficulty: 'Medium', is_curated: true },
  { title: 'Palindromic Substrings (DP)', statement: 'Count the number of palindromic substrings using DP.', tags: ['DP', 'Strings'], difficulty: 'Medium', is_curated: true },
  { title: 'Decode Ways', statement: 'Count the number of ways to decode a string of digits into letters.', tags: ['DP'], difficulty: 'Medium', is_curated: true },
  { title: 'Unique Paths', statement: 'Count unique paths from top-left to bottom-right of an m x n grid.', tags: ['DP'], difficulty: 'Medium', is_curated: true },
  { title: 'Jump Game', statement: 'Determine if you can reach the last index from the first, given jump lengths.', tags: ['DP'], difficulty: 'Medium', is_curated: true },
  { title: 'Jump Game II', statement: 'Find the minimum number of jumps to reach the last index.', tags: ['DP'], difficulty: 'Medium', is_curated: true },
  { title: 'Coin Change', statement: 'Find the fewest coins needed to make up a given amount.', tags: ['DP'], difficulty: 'Medium', is_curated: true },
  { title: 'Longest Increasing Subsequence', statement: 'Find the length of the longest strictly increasing subsequence.', tags: ['DP'], difficulty: 'Medium', is_curated: true },
  { title: 'Word Break', statement: 'Determine if a string can be segmented into words from a dictionary.', tags: ['DP'], difficulty: 'Medium', is_curated: true },
  { title: 'Combination Sum IV', statement: 'Count the number of combinations that sum to a target.', tags: ['DP'], difficulty: 'Medium', is_curated: true },
  { title: 'Partition Equal Subset Sum', statement: 'Determine if an array can be partitioned into two subsets with equal sum.', tags: ['DP'], difficulty: 'Medium', is_curated: true },
  { title: 'Edit Distance', statement: 'Find the minimum number of operations to convert one word to another.', tags: ['DP'], difficulty: 'Hard', is_curated: true },

  // Linked List (8)
  { title: 'Reverse a Linked List', statement: 'Reverse a singly linked list iteratively and recursively.', tags: ['Linked List'], difficulty: 'Easy', is_curated: true },
  { title: 'Detect Cycle in Linked List', statement: 'Determine if a linked list has a cycle using Floyd\'s algorithm.', tags: ['Linked List'], difficulty: 'Easy', is_curated: true },
  { title: 'Merge Two Sorted Lists', statement: 'Merge two sorted linked lists into one sorted list.', tags: ['Linked List'], difficulty: 'Easy', is_curated: true },
  { title: 'Merge K Sorted Lists', statement: 'Merge k sorted linked lists into one sorted linked list.', tags: ['Linked List'], difficulty: 'Hard', is_curated: true },
  { title: 'Remove Nth Node From End', statement: 'Remove the nth node from the end of a linked list.', tags: ['Linked List'], difficulty: 'Medium', is_curated: true },
  { title: 'Reorder List', statement: 'Reorder a linked list: L0→Ln→L1→Ln-1→L2→Ln-2→…', tags: ['Linked List'], difficulty: 'Medium', is_curated: true },
  { title: 'LRU Cache', statement: 'Design a data structure that follows Least Recently Used cache eviction.', tags: ['Linked List', 'Hashing'], difficulty: 'Medium', is_curated: true },
  { title: 'Copy List with Random Pointer', statement: 'Deep copy a linked list where each node has an additional random pointer.', tags: ['Linked List', 'Hashing'], difficulty: 'Medium', is_curated: true },

  // Stack / Queue (7)
  { title: 'Min Stack', statement: 'Design a stack that supports push, pop, top, and retrieving the minimum element in O(1).', tags: ['Stack/Queue'], difficulty: 'Medium', is_curated: true },
  { title: 'Daily Temperatures', statement: 'Given temperatures, find how many days until a warmer temperature.', tags: ['Stack/Queue'], difficulty: 'Medium', is_curated: true },
  { title: 'Car Fleet', statement: 'Find the number of car fleets that arrive at the destination.', tags: ['Stack/Queue'], difficulty: 'Medium', is_curated: true },
  { title: 'Largest Rectangle in Histogram', statement: 'Find the area of the largest rectangle in a histogram.', tags: ['Stack/Queue'], difficulty: 'Hard', is_curated: true },
  { title: 'Implement Queue using Stacks', statement: 'Implement a queue using only two stacks.', tags: ['Stack/Queue'], difficulty: 'Easy', is_curated: true },
  { title: 'Implement Stack using Queues', statement: 'Implement a stack using only two queues.', tags: ['Stack/Queue'], difficulty: 'Easy', is_curated: true },
  { title: 'Evaluate Reverse Polish Notation', statement: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation.', tags: ['Stack/Queue'], difficulty: 'Medium', is_curated: true },

  // Sorting (7)
  { title: 'Merge Sort', statement: 'Implement merge sort and explain the divide-and-conquer strategy.', tags: ['Sorting'], difficulty: 'Medium', is_curated: true },
  { title: 'Quick Sort', statement: 'Implement quick sort with the partition function and analyze pivot choices.', tags: ['Sorting'], difficulty: 'Medium', is_curated: true },
  { title: 'Sort an Array (Multiple Approaches)', statement: 'Sort an array of integers using at least 3 different sorting algorithms.', tags: ['Sorting'], difficulty: 'Medium', is_curated: true },
  { title: 'Kth Largest Element in Array', statement: 'Find the kth largest element in an unsorted array.', tags: ['Sorting'], difficulty: 'Medium', is_curated: true },
  { title: 'Top K Frequent Elements', statement: 'Return the k most frequent elements.', tags: ['Sorting', 'Hashing'], difficulty: 'Medium', is_curated: true },
  { title: 'Sort Characters by Frequency', statement: 'Sort characters by frequency of appearance in decreasing order.', tags: ['Sorting', 'Hashing'], difficulty: 'Medium', is_curated: true },
  { title: 'Wiggle Sort II', statement: 'Reorder array so that nums[0] < nums[1] > nums[2] < nums[3]...', tags: ['Sorting'], difficulty: 'Medium', is_curated: true },
]


// ── Pre-written Two Sum approaches (Python) ───────────────────────────────────

const TWO_SUM_APPROACHES_PYTHON = [
  {
    approach_name: 'Brute Force',
    language: 'Python',
    explanation: 'Check every pair of numbers in the array to see if they sum to the target. Try all combinations using two nested loops.',
    algorithm_steps: [
      'Iterate through each element nums[i] using an outer loop.',
      'For each nums[i], iterate through every element nums[j] where j > i using an inner loop.',
      'Check if nums[i] + nums[j] equals the target.',
      'If yes, return [i, j] immediately.',
      'If no pair found after all iterations, return an empty list.',
    ],
    code: `def two_sum(nums: list[int], target: int) -> list[int]:
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
    dry_run_trace: `Input: nums = [2, 7, 11, 15], target = 9

i=0, j=1: 2 + 7 = 9 == target ✓ → return [0, 1]

Final Result: [0, 1]
(TRACED — not executed)`,
    time_complexity: 'O(n²)',
    time_justification: 'Two nested loops each up to n elements.',
    space_complexity: 'O(1)',
    space_justification: 'Only constant variables, no extra data structures.',
    pros: ['No extra memory', 'Simple to implement'],
    cons: ['Very slow for large inputs', 'Impractical beyond ~10k elements'],
    best_use_case: 'Only when array is tiny and memory is extremely constrained.',
    is_verified: true,
    interview_questions: ['Can you do better than O(n²)?', 'How would you handle duplicates?'],
  },
  {
    approach_name: 'HashMap (One Pass)',
    language: 'Python',
    explanation: 'Use a hash map to store each number and its index. For each element, check if the complement already exists in the map.',
    algorithm_steps: [
      'Create an empty hash map to store {value: index}.',
      'Iterate through nums with index i and value num.',
      'Calculate complement = target - num.',
      'If complement exists in the map, return [map[complement], i].',
      'Otherwise, store num → i in the map and continue.',
    ],
    code: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    dry_run_trace: `Input: nums = [2, 7, 11, 15], target = 9
seen = {}

i=0, num=2: complement=7, 7 not in {} → seen={2:0}
i=1, num=7: complement=2, 2 in {2:0} ✓ → return [0, 1]

Final Result: [0, 1]
(TRACED — not executed)`,
    time_complexity: 'O(n)',
    time_justification: 'Single pass; each hash map operation is O(1) average.',
    space_complexity: 'O(n)',
    space_justification: 'Up to n elements stored in the hash map.',
    pros: ['Optimal time complexity', 'Single pass', 'Works on unsorted arrays'],
    cons: ['Requires O(n) extra space', 'Hash collisions in worst case'],
    best_use_case: 'The go-to interview solution — optimal time with acceptable space.',
    is_verified: true,
    interview_questions: ['Why check complement before inserting?', 'What if duplicates are allowed?'],
  },
  {
    approach_name: 'Two Pointers (Sorted)',
    language: 'Python',
    explanation: 'Sort the array and use two pointers from both ends. Move pointers based on whether the current sum is too big or too small.',
    algorithm_steps: [
      'Pair each value with its original index and sort by value.',
      'Initialize left = 0 and right = len - 1.',
      'While left < right: compute current_sum.',
      'If equal to target, return original indices.',
      'If too small, left++. If too big, right--.',
    ],
    code: `def two_sum(nums: list[int], target: int) -> list[int]:
    indexed = sorted(enumerate(nums), key=lambda x: x[1])
    left, right = 0, len(indexed) - 1
    while left < right:
        s = indexed[left][1] + indexed[right][1]
        if s == target:
            return sorted([indexed[left][0], indexed[right][0]])
        elif s < target:
            left += 1
        else:
            right -= 1
    return []`,
    dry_run_trace: `Input: nums = [2, 7, 11, 15], target = 9
indexed = [(0,2),(1,7),(2,11),(3,15)], left=0, right=3

Step 1: 2+15=17 > 9 → right=2
Step 2: 2+11=13 > 9 → right=1
Step 3: 2+7=9 == target ✓ → return [0, 1]

Final Result: [0, 1]
(TRACED — not executed)`,
    time_complexity: 'O(n log n)',
    time_justification: 'Dominated by sorting; the two-pointer scan itself is O(n).',
    space_complexity: 'O(n)',
    space_justification: 'The indexed array requires O(n) space.',
    pros: ['No hash map needed', 'Demonstrates two-pointer technique'],
    cons: ['Slower than HashMap due to sorting', 'Extra complexity for index tracking'],
    best_use_case: 'When the input is already sorted or interviewer requests two-pointer approach.',
    is_verified: true,
    interview_questions: ['Why is this O(n log n) not O(n)?', 'How does this simplify if the array is pre-sorted?'],
  },
]

// ── Pre-written Binary Search approaches (Python) ─────────────────────────────

const BINARY_SEARCH_APPROACHES_PYTHON = [
  {
    approach_name: 'Linear Search',
    language: 'Python',
    explanation: 'Scan every element from left to right until the target is found or exhausted. Ignores the sorted property.',
    algorithm_steps: [
      'Iterate through the array from index 0 to n-1.',
      'At each index i, check if nums[i] == target.',
      'If match found, return i.',
      'If loop completes without a match, return -1.',
    ],
    code: `def search(nums: list[int], target: int) -> int:
    for i, num in enumerate(nums):
        if num == target:
            return i
    return -1`,
    dry_run_trace: `Input: nums = [-1, 0, 3, 5, 9, 12], target = 9

i=0: -1 ≠ 9
i=1:  0 ≠ 9
i=2:  3 ≠ 9
i=3:  5 ≠ 9
i=4:  9 == 9 ✓ → return 4

Final Result: 4
(TRACED — not executed)`,
    time_complexity: 'O(n)',
    time_justification: 'In the worst case we check all n elements.',
    space_complexity: 'O(1)',
    space_justification: 'Only a loop counter, no extra memory.',
    pros: ['Works on unsorted arrays', 'Trivially simple'],
    cons: ['Ignores sorted property', 'Does not meet O(log n) requirement'],
    best_use_case: 'Only as a baseline — never on sorted data when O(log n) is required.',
    is_verified: true,
    interview_questions: ['Why does linear search fail the O(log n) requirement?'],
  },
  {
    approach_name: 'Binary Search (Iterative)',
    language: 'Python',
    explanation: 'Repeatedly halve the search space by comparing the middle element to the target.',
    algorithm_steps: [
      'Initialize left = 0, right = len(nums) - 1.',
      'While left <= right: compute mid = left + (right - left) // 2.',
      'If nums[mid] == target, return mid.',
      'If nums[mid] < target, set left = mid + 1.',
      'If nums[mid] > target, set right = mid - 1.',
      'Return -1 if not found.',
    ],
    code: `def search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    dry_run_trace: `Input: nums = [-1,0,3,5,9,12], target = 9
left=0, right=5

Iter 1: mid=2, nums[2]=3 < 9 → left=3
Iter 2: mid=4, nums[4]=9 == target ✓ → return 4

Final Result: 4
(TRACED — not executed)`,
    time_complexity: 'O(log n)',
    time_justification: 'Each iteration halves the search space.',
    space_complexity: 'O(1)',
    space_justification: 'Only three pointer variables.',
    pros: ['Optimal for sorted arrays', 'Constant space', 'Widely applicable'],
    cons: ['Only works on sorted data', 'Off-by-one errors are common'],
    best_use_case: 'The canonical solution for searching a sorted array.',
    is_verified: true,
    interview_questions: ['Why use mid = left + (right-left)//2?', 'What changes for leftmost occurrence of a duplicate?'],
  },
  {
    approach_name: 'Binary Search (Recursive)',
    language: 'Python',
    explanation: 'Same binary search logic expressed recursively with a helper function.',
    algorithm_steps: [
      'Define helper(left, right).',
      'Base case: if left > right, return -1.',
      'Compute mid = left + (right - left) // 2.',
      'If nums[mid] == target, return mid.',
      'Recurse left half or right half based on comparison.',
    ],
    code: `def search(nums: list[int], target: int) -> int:
    def helper(left, right):
        if left > right:
            return -1
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            return helper(mid + 1, right)
        else:
            return helper(left, mid - 1)
    return helper(0, len(nums) - 1)`,
    dry_run_trace: `Input: nums = [-1,0,3,5,9,12], target = 9

helper(0,5): mid=2, 3<9 → helper(3,5)
  helper(3,5): mid=4, 9==9 ✓ → return 4

Final Result: 4
(TRACED — not executed)`,
    time_complexity: 'O(log n)',
    time_justification: 'Same halving as iterative; depth bounded by log₂(n).',
    space_complexity: 'O(log n)',
    space_justification: 'Call stack grows to log₂(n) depth.',
    pros: ['Elegant and readable', 'Shows recursive thinking'],
    cons: ['O(log n) stack space', 'Risk of stack overflow on huge inputs'],
    best_use_case: 'When asked for recursive implementation or to demonstrate recursion.',
    is_verified: true,
    interview_questions: ['Space complexity difference vs iterative?', 'Can you convert to iterative?'],
  },
]

// ── Seed function ─────────────────────────────────────────────────────────────

async function seed() {
  console.log('Seeding AlgoLens database with 100 problems...')

  const { data: existing } = await supabase.from('problems').select('title')
  const existingTitles = new Set((existing || []).map(p => p.title))
  const toInsert = PROBLEMS.filter(p => !existingTitles.has(p.title))

  let allProblems = existing || []

  if (toInsert.length > 0) {
    // Insert in batches of 25 to avoid payload limits
    for (let i = 0; i < toInsert.length; i += 25) {
      const batch = toInsert.slice(i, i + 25)
      const { data: inserted, error } = await supabase.from('problems').insert(batch).select()
      if (error) { console.error('Insert error:', error); process.exit(1) }
      allProblems = [...allProblems, ...(inserted || [])]
      console.log(`  Inserted batch ${Math.floor(i/25)+1}: ${batch.length} problems`)
    }
  } else {
    console.log('All problems already exist — skipping insert')
    const { data: all } = await supabase.from('problems').select('*')
    allProblems = all || []
  }

  console.log(`Total problems in DB: ${allProblems.length}`)

  const twoSum = allProblems.find(p => p.title === 'Two Sum')
  const binarySearch = allProblems.find(p => p.title === 'Binary Search')

  if (twoSum) await seedApproaches(twoSum.id, TWO_SUM_APPROACHES_PYTHON, 'Two Sum (Python)')
  if (binarySearch) await seedApproaches(binarySearch.id, BINARY_SEARCH_APPROACHES_PYTHON, 'Binary Search (Python)')

  console.log('Seeding complete!')
}

async function seedApproaches(problemId, approachDefs, label) {
  const { data: existing } = await supabase
    .from('approaches').select('id').eq('problem_id', problemId).eq('language', 'Python').limit(1)
  if (existing && existing.length > 0) {
    console.log(`  ${label} approaches already seeded — skipping`)
    return
  }
  const rows = approachDefs.map(a => ({
    problem_id: problemId,
    language: a.language,
    approach_name: a.approach_name,
    explanation: a.explanation,
    algorithm_steps: a.algorithm_steps,
    code: a.code,
    dry_run_trace: a.dry_run_trace,
    time_complexity: a.time_complexity,
    time_justification: a.time_justification,
    space_complexity: a.space_complexity,
    space_justification: a.space_justification,
    pros: a.pros,
    cons: a.cons,
    best_use_case: a.best_use_case,
    is_verified: true,
    complexity_verified: true,
  }))
  const { data: inserted, error } = await supabase.from('approaches').insert(rows).select()
  if (error) { console.error(`Failed: ${label}`, error); return }

  const questionRows = []
  inserted.forEach((dbA, i) => {
    ;(approachDefs[i]?.interview_questions || []).forEach(q => {
      questionRows.push({ approach_id: dbA.id, question_text: q })
    })
  })
  if (questionRows.length > 0) await supabase.from('interview_questions').insert(questionRows)
  console.log(`  Seeded ${inserted.length} approaches for ${label} + ${questionRows.length} questions`)
}

seed().catch(console.error)
