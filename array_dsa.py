arr = [10, 20, 30, 40, 50]

# Access elements
print(arr[0])  # 10

# Update element
arr[1] = 25

# Append element
arr.append(60)

# Insert at index
arr.insert(2, 15)

# Delete element by value
arr.remove(30)

# Delete element by index
del arr[3]

# Length
print(len(arr))

# Traversal
for num in arr:
    print(num)


arr = [1, 2, 3, 4, 5]
reversed_arr = arr[::-1]
print(reversed_arr)
