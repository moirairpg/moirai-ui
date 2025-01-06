# ChatRPG: a virtual Dungeon Master for RPG adventures (frontend project)

[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=chatrpg-cs_chatrpg-fe&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=chatrpg-cs_chatrpg-fe) [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=chatrpg-cs_chatrpg-fe&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=chatrpg-cs_chatrpg-fe) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=chatrpg-cs_chatrpg-fe&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=chatrpg-cs_chatrpg-fe) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=chatrpg-cs_chatrpg-fe&metric=coverage)](https://sonarcloud.io/summary/new_code?id=chatrpg-cs_chatrpg-fe) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=chatrpg-cs_chatrpg-fe&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=chatrpg-cs_chatrpg-fe) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=chatrpg-cs_chatrpg-fe&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=chatrpg-cs_chatrpg-fe) [![Node.js CI](https://github.com/thaalesalves/ChatRPG-fe/actions/workflows/automated-cicd.yml/badge.svg)](https://github.com/thaalesalves/ChatRPG-fe/actions/workflows/automated-cicd.yml)

ChatRPG is a Discord bot powered by JDA that is connected to OpenAI's GPT-3 API. It is cabaple of generating text using base or finetuned models, and was made to act primarily as a chatbot and as an RPG dungeon master. Developed by veteran AI Dungeon and NovelAI players and contributors, aimed to make text-based RPGs more flexible and easier to use on Discord. This is the project containing its frontend code, written in TypeScript with Vue 3.

## Technologies used

-   Vue.js 3
-   PrimeVue
-   TypeScript
-   JavaScript
-   Vite
-   [gpt-tokenizer](https://www.npmjs.com/package/gpt-tokenizer) (port of [tiktoken](https://github.com/openai/tiktoken))

## What does it do?

This is the control dashboard for [ChatRPG](https://github.com/thaalesalves/ChatRPG), and includes functionalities to manage the bot. The project is where channel configurations, lorebooks, worlds, personas and such are createde and maintained, and the interface users of the bot will use to manage their own assets. It interacts with ChatRPG through its backend API created on the other project.

## Building from source

To run this project, you can clone it and execute it locally. To do so, you'll need to have Node.js v18+ installed, and have a proper app set up on Discord with the proper permissions - the interface does not have an internal log in mechanic, it uses Discord for authentication so it has direct interaction with the bot and the servers the user is part of.

### Discord app permissions

To have this project work, your Discord app needs to have all the intents properly set up for the backend, as well as OAuth2 settings and a redirect URL set up for the frontend to work. You'll need to create a link on the Discord dashboard that redirects to `yourhostname/auth/discord`. For development or local executions, relying on what's `.env.development` is enough, as it'll use `localhost`. If you aim to host the frontend to users outside of your network, then you'll need to properly set up access to your machine and reflect this in the redirect URL. Set up your URL on `OAuth2 > General` menu at the Discord dashboard.

You'll also need to generate a link for log in, and retrieve your OAuth2 client ID and secret. To do so, navigate to `OAuth2 > URL Generator` at the Discord dashboard and select the following intents: `identify, guilds, email, messages.read`. Copy the link generated either save it in the `VITE_CHATRPG_DISCORD_LOGIN_URL` environment variable or paste it in `.env.development` (note that you don't need to paste the `https://discord.com/api` part, only what comes after this).

To have ChatRPG work, your Discord app needs to have both the `Server Members` and `Message Content` intents allowed in the `Bot` menu of the Discord Developer dashboard. When inviting the bot to your server, make sure to add the `bot` and `applications.commands` scopes added in the `OAuth > URL Generator` menu of the Discord Developer dashboard. The bot also needs to have permission to read, send and delete messages in the channels specified in its personas, because when a comment is problematic, it will try to delete it. Save your client ID and secret in the proper environment variables or in the dvelopment file. To see the env vars required, check `.env.production`.

### Environment variables

This app uses environment variables to store important values such as IDs and secrets. For local executions, you can paste the values directly in the `.env.development` file, or even use the pre-defined values and just tweak what you need. For production runs, it's recommended to use the env vars to store these values, so they're not exposed.

### Building

1. Clone the repo
2. Set up the environment vars in either `.env.production` or `.env.development` depending on how you're going to run the app
    - If you're building the app through an automated CI pipeline, it's advised to use the env vars, and in that case no modification to the production file will be required if you use the same var names. Use the names on the right, as the ones on the left follow Vite's naming pattern and are only used internally.
3. Have the backend run locally at port `8080`.
    - For production runs, just paste the address as the value of the proper env var; the port 8080 part is only required for local runs as there's a reverse proxy on the frontend that will look for the backend at `http://localhost:8080`
4. Install yarn with `npm install --global yarn`
5. Download the projects dependencies with `yarn` (yes, this is the command)
6. Run the project locally with `yarn dev`
    - Or build the project with `yarn build`, in which case the static app will be available in `dist/`, ready to be hosted by an HTTP server.
7. Open the page at `http://localhsot:5173` (or through the address and port you have set up if it's a production run)
