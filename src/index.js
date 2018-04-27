import app from './app';
//select default port 8080 for dev or look at .env file.
const { PORT = 8080 } = process.env;


//start the actual server
app.listen(PORT, () => console.log(`Listening on port ${PORT}`)); // eslint-disable-line no-console
