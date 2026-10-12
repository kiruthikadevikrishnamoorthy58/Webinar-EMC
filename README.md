# 0 to Shipped Resume Parser

## Local development

1. Install Docker Desktop and start it.
2. In `backend`, start the persistent MongoDB container:

   ```powershell
   npm run db:up
   ```

   MongoDB listens only on `127.0.0.1:27017`; its data persists in the
   `resume-parser-mongodb` Docker volume.
3. Set `MONGODB_URI=mongodb://127.0.0.1:27017/resume-parser` in
   `backend/.env`. Add the AI provider key there if AI evaluation is needed.
4. In `backend`, run `npm run dev`. In a second terminal, run `npm run dev`
   from `frontend`.
5. Check database availability at `http://localhost:5000/api/health`.

Stop the MongoDB container with `npm run db:down` from `backend`. This stops
the container without deleting the persistent database volume.

## Vercel deployment

Vercel does not run a persistent MongoDB server for this project. Create a
managed MongoDB database (for example, MongoDB Atlas), allow the deployed
backend to connect to it, and set `MONGODB_URI` as a secret environment
variable for the Vercel project. Also configure `OPENAI_API_KEY` if AI scoring
is enabled. Do not put database credentials or AI keys in frontend variables
or commit them to Git.
