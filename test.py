# create a Python program that plays guess my number on the command line
# run by typing in shell$ python guess.py

import random

generated_number = random.randint(0,9) # generate a random integer between 0 and 9
print(generated_number)

while True:
    user_guess = int(input("Enter your guess between 0 and 9: "))
    if user_guess == generated_number:
        print("You win")
        break
    elif user_guess < generated_number:
        print("your guess is too small")
        continue
    else:
        print("your guess is too large")
        continue

# Example command line game play:

#Guess my number between 0 and 9: 20
#your guess is too small
#your guess is too large
#you win!