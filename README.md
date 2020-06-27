# selenium_skribbl_io_bot
This uses [selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver) to fill in the forms and start a game with custom words.

Selenium is a browser automation library. Most often used for testing web-applications but we can also use it to play skribbl.io provided the bot starts a custom game.

# dependancies
1. geckodriver

     This is a seperate application that allows selenium to interact with the firefox browser ( `sudo apt install geckodriver -y` )

2. nodejs

     `sudo apt install node -y`

3. npm

     Most of the time this comes with the node package but if not you will need to install it too ( `sudo apt install npm -y` )

# Setup
`git clone https://github.com/ArtiomSu/selenium_skribbl_io_bot.git && cd selenium_skribbl_io_bot && npm install`

# Play the game
Run `npm start` to start the bot.

Provided everything is setup properly a firefox window should open and start navigating to skribbl.io, creating a custom game and waiting for people to join.

In the terminal you should see an invite link that has been copied to your clipboard, so you can open up another browser and paste.

Once you joined the lobby in the terminal you will see output saying a player has joined.

You will have to press start game or you can edit the bot to start the game as soon as a player joins, I didnt do that since multiple players can join and it will work fine.

When the bot is guessing it will go through the words in `word_list.txt` that match the length of the word to be guessed until it guesses the right one.

When it is the bots turn to draw it will pick the first word that comes up and won't do anything ( so it wont draw anything unfortionately ).

# config
You can create your own wordlist by editing `word_list.txt` just make sure it is in the format like this `word1,word2,word3,word4,wordlast`
