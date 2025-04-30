# Giveaway Bot for Discord djs v14

This is a Discord bot that manages giveaways, allowing users to join giveaways, view participants, and automatically select winners. The bot supports a captcha system for verification before joining a giveaway.

## Features

- **Create Giveaways**: Set up giveaways with a prize, a description, a number of winners, and a duration.
- **Join Giveaways**: Users can join giveaways by clicking a "Join" button and solving a captcha.
- **View Participants**: Users can check the list of participants for any active giveaway.
- **Automatic Winner Selection**: Once a giveaway ends, the bot randomly selects winners and announces them.
- **Captcha Verification**: To join a giveaway, users need to solve a captcha to ensure they are not bots.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or higher)
- A Discord bot token and a registered application (create one at the [Discord Developer Portal](https://discord.com/developers/applications)).

### Steps to Set Up

1. Clone the repository or download the files.

2. Install dependencies.
   ```bash
   npm install
   ```

3. Create a `config.json` file in the root directory and insert your bot's token and client details.

   Example `config.json`:
   ```json
   {
     "token": "YOUR_BOT_TOKEN",
     "clientId": "YOUR_CLIENT_ID",
     "gid": "YOUR_GUILD_ID",
     "saveCommandRoleId": "YOUR_ROLE_ID"
   }
   ```

4. Make sure you have a `users.json` file in the root directory (empty or pre-filled), which is used to save the list of users who win giveaways.

5. Run the bot:
   ```bash
   node index.js
   ```

## Commands

### `/setup`
Sets up a new giveaway. The bot will prompt the user to input the giveaway prize, the number of winners, the description, and the duration of the giveaway.

### `/give`
Lists the participants of the giveaway. It will show a list of users who have entered the current active giveaway.

## How It Works

- **Giveaway Setup**: An administrator with the appropriate role (`saveCommandRoleId`) can set up a giveaway using the `/setup` command. The giveaway will be posted in the channel, and users can join by clicking the "Join" button.
- **Captcha for Joining**: When users click the "Join" button, a modal with a captcha code will be shown. The user must enter the correct code to join the giveaway.
- **Ending a Giveaway**: The giveaway will automatically end when the specified time has passed. The bot will randomly select winners and announce them in the channel.
- **Saving Winners**: When a giveaway ends, the winners are saved in the `users.json` file.

## Notes

- The bot requires permission to manage messages and send messages in the server where it operates.
- Make sure your bot has the necessary intents enabled (such as `GUILDS` and `GUILD_MESSAGES`) to function properly.
- Modify the `users.json` and `config.json` files as needed to fit your requirements.

```
