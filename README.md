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

<br>

**2.** Input your **username** then confirm.

<br>

**3.** Input your **password** then confirm.

> **Note**: you won't see any character appear. Don't worry, it's normal.
<img src="/img/credentials.png" height="65">
> If the event is not released, you'll have to wait until it is. In the meantime, you'll see the refresh rate appear on your Terminal window.
> 
**<u>Pro tip</u>**: before running the script, copy-paste thins command in you terminal (using your credentials of course): `export OPERA_USERNAME=yourUsername && export OPERA_PASSWORD=yourPassword`

<br>

**4.** You will hear a beep and be **redirected**:

- Copy the captcha on the page,
<i>then</i>
- Enter the waiting line.
	
<br>

## That's it !

Don't forget that you'll still need to **manually select your tickets** once the link is found !

When you're done with your booking, click on your Terminal window and hit `Command + C` to kill the program.

### Features to implement:
- [X] Auto ticket selector
- [X] If login fails, retries instead of having to restart the program
- [ ] Capcha solver
- [ ] Check user's inputs
- [ ] Better way to notify user when a link is found
