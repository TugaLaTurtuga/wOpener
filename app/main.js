const fs = require('fs');
const schedule = require('node-schedule');
const { exec } = require('child_process');
const path = require('path');

// Read tasks and startup setting from toOpen.json
const configPath = './app/toOpen.json';
let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Watch for changes in the config file
fs.watch(configPath, (eventType) => {
    if (eventType === 'change') {
        console.log(`The config file "${configPath}" has been modified.`);
        notifier.notify({
            title: 'wOpener',
            message: 'The changes has been saved',
            sound: true,
        });

        // Reload the tasks from the updated config file
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            startTaskSchedules()
        } catch (error) {
            console.error('Failed to reload configuration:', error);
        }
    }
});

const NotificationCenter = require('node-notifier').NotificationCenter;
var notifier = new NotificationCenter({
    withFallback: false, // Use Growl Fallback if <= 10.8
    customPath: undefined, // Relative/Absolute path to binary if you want to use your own fork of terminal-notifier
});

// Notify when the script starts, inside the callback
notifier.notify({
    title: 'wOpener',
    message: 'The script is running and will execute tasks as scheduled.',
    sound: false,
    timeout: 5, // stays there for 5 seconds
});

console.log('\x1b[38;5;10mScript started.\x1b[37m\n -Type "q" to stop the script\n -Type "s" or "c" to edit the config file\n\n\n');

function startTaskSchedules() {
    // get the time
    const parseTime = (timeStr) => {
        const [time, period] = timeStr.split(/(AM|PM)/i);
        let [hours, minutes] = time.split(':').map(Number);
        if (minutes === undefined) minutes = '0';
    
        if (period === undefined) return { hour: hours, minute: minutes };
        else {
            let hour24 = period.toUpperCase() === 'PM' && hours !== 12 ? hours + 12 : hours;
            if (period.toUpperCase() === 'AM' && hours === 12) hour24 = 0;
            return { hour: hour24, minute: minutes };
        }
    };

    const tasks = config.tasks;

    Object.entries(tasks).forEach(([key, task]) => {
        let { time, website, app, description, title, timer, timerDescription, day, month, dayOfWeek, withSound } = task;
        if (!title) title = key; // Use task name if title isn't provided
        if (!time) time = '6:00pm'; // if it has no time to the notification, send it at 6pm

        if (dayOfWeek) {
            const dayOfWeekNormalized = dayOfWeek.toLowerCase().trim();

            // Business days //
            if ( ["business days", "bussiness_days", "week days", "week_days"].some(kw => dayOfWeekNormalized.includes(kw)) ) {
                if (["!", "non", "no"].some(kw => dayOfWeekNormalized.includes(kw))) dayOfWeek = "0, 6"; 
                else dayOfWeek = "1, 2, 3, 4, 5";
            }
            // Weekends //
            else if ( ["weekends", "week-ends", "week_ends", "week ends"].some(kw => dayOfWeekNormalized.includes(kw)) ) {
                if (["!", "non", "no"].some(kw => dayOfWeekNormalized.includes(kw))) dayOfWeek = "1, 2, 3, 4, 5"; 
                else dayOfWeek = "0, 6";
            }
        }

        // Get the times, days, months, and dayOfWeeks as arrays, handling undefined values
        const times = time.split(',').map(t => t.trim());
        const days = (day || "*").split(',').map(t => t.trim());
        const months = (month || "*").split(',').map(t => t.trim());
        const dayOfWeeks = (dayOfWeek || "*").split(',').map(t => t.trim());

        // Iterate through all combinations
        times.forEach(timeStr => {
            const { hour, minute } = parseTime(timeStr);

            days.forEach(dayVal => {
                months.forEach(monthVal => {
                    dayOfWeeks.forEach(dayOfWeekVal => {
                        const scheduleTime = `${minute} ${hour} ${dayVal || "*"} ${monthVal || "*"} ${dayOfWeekVal || "*"}`;
                        console.log(`Task ${key}: Scheduling ${website || app} at ${scheduleTime} with a notification of ${description || 'Launching ${website || app}'})`);

                        // create the schedule << <minute> <hour> <day-of-month> <month> <day-of-week> >> //
                        schedule.scheduleJob(scheduleTime, () => {
                            notifier.notify({
                                title: title || 'wOpener',
                                message: description || `Launching ${website || app}`,
                                sound: withSound || true,
                            });
                    
                            if (website) {
                                console.log(`Opening website: ${website}`);
                                const openCommand = process.platform === 'win32'
                                    ? `start ${website}`
                                    : process.platform === 'darwin'
                                    ? `open ${website}`
                                    : `xdg-open ${website}`;
                    
                                exec(openCommand, (err) => {
                                    if (err) console.error(`Failed to open website ${website}:`, err);
                                });
                            }
                    
                            if (app) {
                                console.log(`Launching app: ${app}`);
                                const appCommand = process.platform === 'win32'
                                    ? `start ${app}`
                                    : process.platform === 'darwin'
                                    ? `open -a "${app}"`
                                    : app;
                    
                                exec(appCommand, (err) => {
                                    if (err) console.error(`Failed to launch app ${app}:`, err);
                                });
                            }
                    
                            if (timer) {
                                const [minutes, seconds] = timer.split(':').map(Number);
                                let delay = (minutes * 60 + seconds) * 1000;
                    
                                if (seconds !== undefined) console.log(`Starting a ${minutes}min:${seconds}sec timer`);
                                else {
                                    console.log(`Starting a ${minutes}min timer`)
                                    delay = minutes * 60000;
                                }
                    
                                let notTitle = `Timer for ${website || app}`;
                                if (!website && !app)  notTitle = title || 'wOpener',
                                setTimeout(() => {
                                    notifier.notify({
                                        title: notTitle,
                                        message: timerDescription || 'great job!',
                                        sound: true,
                                    });
                                }, delay);
                            }
                        });
                    });
                });
            });
        });
    });

    console.log('\n');
}

startTaskSchedules();

// Listen for user input to terminate the script or change settings
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (input) => {
    const command = input.trim();
    if (command.toLowerCase() === 'q') {
        console.log('Stopping the script...');
        process.exit(); // Exit the Node.js process
    } else if (command.toLowerCase() === 's') {
        console.log('Opening the config file for editing...');
        const configFilePath = path.resolve(__dirname, './app/toOpen.json');
        const openCommand = process.platform === 'win32'
            ? `start "" "${configFilePath}"`
            : process.platform === 'darwin'
            ? `open "${configFilePath}"`
            : `xdg-open "${configFilePath}"`;

        exec(openCommand, (err) => {
            if (err) {
                console.error('Failed to open the config file:', err);
                process.exit(1);
            } else {
                console.log(`Config file opened: ${configFilePath}`);
            }
        });
    } else {
        notifier.notify({
            title: 'wOpener',
            message: 'Stupid.',
            sound: true,
        });
        console.log('\n\n\x1b[38;5;9mUnknown command: ${command}.\x1b[37m\n -Type "q" to stop the script\n -Type "s" or "c" to edit the config file\n\n\n');
    }
});
