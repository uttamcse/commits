const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 3000;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/commits', async (req, res) => {
    const { username, reponame } = req.query;
    if (!username || !reponame) {
        return res.status(400).send('One of them are missing');
    }
    const url = `https://api.github.com/repos/${username}/${reponame}/commits`;

    try {
        console.log('GitHub API URL:', url); 
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'request' }
        });
        const commits = response.data.slice(0, 25).map(commit => ({
            author: commit.commit.author.name,
            message: commit.commit.message,
            hash: commit.sha,
        }));
        res.render('commits', { commits, username, reponame });
    } catch (error) {
        console.error('Error fetching commits:', error.response ? error.response.data : error.message);

        if (error.response && error.response.status === 404) {
            return res.status(404).send('Repository not found. Please check the username and repository name.');
        }
        res.status(500).send('Internal Server Error');
    }
});
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));
