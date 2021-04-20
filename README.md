# example-driver

Example of a minimal "governance driver" that uses the Metagov Prototype

### Testing webhooks locally with ngrok and Loomio

1. Copy `.env.example` to a new file `.env` and set the Loomio API key value.

2. In the `metagov-prototype` project under `metagov`, run:
   `sudo python manage.py runserver 80`

3. In a separate shell, run
   `ngrok http 80`

4. In this project, run
   `METAGOV_SERVER=https://<subdomain>.ngrok.io npm start`

5. Log into Loomio as an admin, and add the ngrok webhook receiver URL that was printed to the console in the previous step.

6. Re-run step 4. Open the poll link and close it early. The vote result should get printed to the console.
