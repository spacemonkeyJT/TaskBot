
# TaskBot

[TaskBot](https://github.com/spacemonkeyJT/TaskBot) is a collaborative Discord bot designed to help users manage their tasks during coworking sessions. With TaskBot, users can easily add, track, and complete tasks in real time, making it ideal for productivity-focused communities, study groups, and remote teams. The bot keeps track of each user's task list and helps everyone stay accountable and organized.

## Features

- Add, start, and complete personal tasks
- View your active and incomplete tasks
- See all users' tasks and completed items
- Moderator controls for managing tasks and bot channel
- Simple, intuitive command set

TaskBot is lightweight, easy to set up, and requires minimal permissions to operate in your Discord server.


## Installation

1. [Invite TaskBot to your Discord server](https://discord.com/oauth2/authorize?client_id=1315235406345928774) using the provided link.
2. Make sure TaskBot has permission to read and send messages in the channels where you want it to operate.
3. (Optional) Use the `!taskchannel` command to restrict TaskBot to a specific channel for task management.


## Commands

Below are the main commands supported by TaskBot:

- `!addtask <task name>` — Add a new task to your personal list.
- `!starttask <task name or number>` — Start an existing task by name or number, or add and activate a new task.
- `!task` — Show your currently active task.
- `!done` — Mark your active task as completed and activate the next one, if available.
- `!cancel [task name or number]` — Cancel your active task, or specify a task by name or number to cancel.
- `!next` — Activate the next incomplete task in your list.
- `!tasks` — List your current incomplete tasks.
- `!alltasks` — List all current incomplete tasks for all users in the server.
- `!completed` — List all completed tasks for all users.
- `!cleartasks` — Clear all tasks for all users (moderator only).
- `!taskchannel [name]` — Set or clear the channel where TaskBot responds (moderator only).

## Troubleshooting

If you encounter issues when adding TaskBot to your server or using its commands, try the following steps:

1. **Bot not responding to commands:**

	- Ensure TaskBot has permission to read and send messages in the channel.
	- Check if the bot is online in your server member list.
	- Make sure you are using the correct command prefix (`!`).
	- If you set a specific task channel with `!taskchannel`, commands will only work in that channel.

2. **Bot missing from server after invite:**

	- Verify you have the "Manage Server" permission to add bots.
	- Check if the invite link was used for the correct server.

3. **Permission errors:**

	- TaskBot needs permission to read messages and send messages in the designated channel.
	- If using moderator commands, ensure you have the appropriate Discord role.

4. **Still having trouble?**

	- Try removing and re-adding the bot to your server.
	- For further help, please [open an issue on GitHub](https://github.com/spacemonkeyJT/TaskBot/issues).
