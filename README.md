# wOpener
A reminder app that sends a notification as well as opening an app or website

## npm commands
- #### 'npm start' -> starts the program
- #### 'npm run startWithOS' -> makes the program start on startup
- #### 'npm run reloadStartWithOS' -> updates the program
- #### 'npm run stopStartWithOS' -> makes the program not start on startup
- #### 'npm run deleteAllpm2Instances' -> deletes all instances of the program

## [app/toOpen.json](https://github.com/TugaLaTurtuga/wOpener/blob/main/app/toOpen.json "app/toOpen.json")
- ##### This is the file where you put your 'tasks', aka reminderes.

- ##### You can have on the time, day, dayOfWeek and month, add more than one variable

##### EX:
```json
"task_name": {
  "time": "6:00pm, 19:00", -> this will send notifications at 6pm and 7pm
  "dayOfWeek": "1, 3, 5" -> this will send notifications on mondays, wednesdays and fridays
}
```

#### All commands accepted from [app/toOpen.json](https://github.com/TugaLaTurtuga/wOpener/blob/main/app/toOpen.json "toOpen.json"):

```json
"title": "[ str ] The notification title (if it doesn't have it, it will be the task name)",
"description": "[ str ]The notification description",
"time": " [ 24-hour format or 12-hour format  (DEFAULT: 6pm) ] Time of the notification",

"day": "[ 1 - 31 ] Day of the notification",
"month": "[ 1 - 12 ] Month of the notification",
"dayOfWeek": "[ 0 - 7 (0 or 7 is Sun, can also be 'weekends' or 'business days') ( DEFAULT: every day ) ] Day of the week of the notification",

"website": "[ website url ] Opens the website",
"app": "[ app name ] Opens the app",

"timer": "[ float (min) ; float:float (min:sec) ( DEFAULT: none ) ] A timer (at the end it sends a notification) ",
"timerDescription": "[ str ] the notification timer description",

"withSound": "[ true ; false ( DEFAULT: true ) ] Plays the default sound when the notification appears"
```

##### © 2025 TugaLaTurtuga, Inc
(jk)
