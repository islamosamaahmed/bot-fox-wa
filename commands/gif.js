const axios = require('axios');
const { giphyApiKey } = require('../settings');

async function gifCommand(sock, chatId, args) {
    if (!args) {
        await sock.sendMessage(chatId, { text: 'Please provide a search term for the GIF!' });
        return;
    }

    try {
        const response = await axios.get(`https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${args}&limit=50`);
        const gifs = response.data.data;
        if (gifs.length === 0) {
            await sock.sendMessage(chatId, { text: 'No GIFs found for your query.' });
            return;
        }

        const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
        const gifUrl = randomGif.images.original.url;

        await sock.sendMessage(chatId, {
            video: { url: gifUrl },
            gifPlayback: true,
            caption: `*${args}*`
        });
    } catch (error) {
        console.error('Error fetching GIF:', error);
        await sock.sendMessage(chatId, { text: 'Failed to fetch GIF.' });
    }
}

module.exports = gifCommand;