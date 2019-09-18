# cute_little_bot

<br>

## Installation

Open your **Terminal app**. 

> Its icon looks like this
> <img src="/img/terminal.png" height="40">



**Download this repository**:

```
git clone https://github.com/fabrahaingo/cute_little_bot.git && cd cute_little_bot
```

<br>

### If you don't have Node.js/npm installed
```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"; brew update; brew doctor; brew install node
```
> This may take up to a few minutes

<br>

### For everyone

**Install all dependencies**:

```
npm install
```

**Run the cute little bot** about 5 minutes before tickets are released:
```
node getMeATicket.js
```

<br>


Wait a few seconds...

<br>

**1.** **Select the performance** you're waiting for:
> <img src="/img/choose_performance.png" height="160">


**2.** Input your **username** then confirm.

**3.** Input your **password** then confirm.

> **Note**: you won't see any character appear. Don't worry, it's normal.
<img src="/img/credentials.png" height="65">

<br>

> If the event has already been released, you'll end up with this:

> <img src="/img/specify_event.png" height="110">

<br>

> If the event hasn't been released yet, you'll have to wait until it finds the link. In the meantime, you'll see the number of refreshs appear continuously on your screen like so:

> <img src="/img/refreshing.png" height="160">

<br>

**4.** When you hear a beep, go to the browser:

- Copy the Captcha that's on the page,
	
then
	
- Enter the waiting line.
	
<br>

## That's it !
## Now wait for a new "beep", notifying that the new reservation link has been found !

**Don't forget** that you'll still need to **manually select your tickets** once the link is found !

When you're done with your booking, click on your Terminal window and hit Command + C to kill the program.
The browser will automatically close.
You can now close your Terminal app.

### Features to implement:
- [ ] Auto ticket selector
- [ ] Capcha solver
- [X] If login fails, retries instead of having to restart the program
- [ ] Check user's inputs
- [X] Better way to notify user when a link is found
