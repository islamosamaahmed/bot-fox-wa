const { Octokit } = require('@octokit/rest');
const octokit = new Octokit();

async function githubCommand(sock, chatId, args) {
    if (!args) {
        await sock.sendMessage(chatId, { text: 'Please provide a GitHub username!' });
        return;
    }

    try {
        const { data } = await octokit.users.getByUsername({ username: args });

        let txt = `╭══✦〔 *FOXBOT V2* 〕✦═╮\n│ \n`;
        txt += `│  👤 *Username:* ${data.login}\n`;
        txt += `│  📛 *Name:* ${data.name || 'N/A'}\n`;
        txt += `│  🏢 *Company:* ${data.company || 'N/A'}\n`;
        txt += `│  📝 *Bio:* ${data.bio || 'N/A'}\n`;
        txt += `│  🌍 *Location:* ${data.location || 'N/A'}\n`;
        txt += `│  🔗 *Profile URL:* ${data.html_url}\n`;
        txt += `│  👥 *Followers:* ${data.followers}\n`;
        txt += `│  👤 *Following:* ${data.following}\n`;
        txt += `│  📚 *Public Repos:* ${data.public_repos}\n`;
        txt += `│ \n`;
        txt += `│ 💥 *FOXBOT V2*\n`;
        txt += `╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯`;

        await sock.sendMessage(chatId, { image: { url: data.avatar_url }, caption: txt });

    } catch (error) {
        console.error('Error fetching GitHub user:', error);
        await sock.sendMessage(chatId, { text: 'Could not find the GitHub user.' });
    }
}

module.exports = githubCommand;