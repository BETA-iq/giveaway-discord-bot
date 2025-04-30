# Giveaway Discord Bot

## Description
This Discord bot is designed to manage and conduct giveaways in Discord servers. It empowers users to set up giveaways, participate in them, and automatically selects winners at the end of the giveaway period.

## Installation
1. **Clone the Repository**: Clone this repository to your local machine or download the source code.
2. **Install Dependencies**: Run `install.bat` to install the necessary packages.
3. **Configuration**: Create a `config.json` file in the root directory with the following structure:
   ```json
   {
     "token": "YOUR_BOT_TOKEN",
     "clientId": "YOUR_CLIENT_ID",
     "guildId": "YOUR_GUILD_ID",
     "saveCommandRoleId": "YOUR_ROLE_ID"
   }
   ```
   Replace `YOUR_BOT_TOKEN`, `YOUR_CLIENT_ID`, `YOUR_GUILD_ID`, and `YOUR_ROLE_ID` with your Discord bot token, client ID, server (guild) ID, and the role ID that can use setup and save commands.

## Usage
1. **Start the Bot**: Run `node index.js` in cmd/consol.
2. **Bot Commands**:
   - `/setup`: Launches a modal to set up a new giveaway.
   - `/give`: Displays a list of users who joined the giveaway (Requires the specified role permission).
