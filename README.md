# booking_bot

## Installation

You will first need to **download this repository** to your computer.
To do so, open your **Terminal app** and copy paste the following line:
```
git clone https://github.com/fabrahaingo/booking_bot.git && cd booking_bot
```

Once that done, you'll need to **install all dependencies** needed for the bot to work.
Simply run:
```
npm install
```

Then **run the program** by writing:
```
node getMeATicket.js
```

A window should pop up, leading you to the folling page: [Billeterie Opera de Paris](https://billetterie.operadeparis.fr/account/login)

### It's time to follow those simple steps:

1* Return to your Terminal.
2* Input your **username** then confirm.
3* Input your **password** then confirm. 
> **NOTE**: no character will appear on the screen for confidential purpose, just hit <Enter> once you're done writing it.
4* Go back to the opened window and **verify that you're successfully logged in**. 
> DIDN'T WORK ? : hit COMMAND + C and redo all the steps from "node getMeATicket.js".
5* In you Terminal, it's now time to tell your program which event you want to attend:
	- Simply write "**ballet**" or "**opera**" (without the brackets).
	- Then write the **name of the event** you wish to attend. For example "cendrillon". 
> NOTE: if the event name contains spaces, replace them all by "-". For example, "la dame aux camelias" will become "la-dame-aux-camelias".
6* Click one last time on the browser window

## That's it !

You can sit down and relax while your bot is doing all the hard word for you.
**Don't forget to keep an eye on him** and stay ready to input the capcha you'll be asked to solve... ! :)
