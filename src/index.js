const wa = require('@open-wa/wa-automate');

wa.create({
    sessionId: "SAMPLE_SESSION",
    multiDevice: true,
    authTimeout: 60,
    blockCrashLogs: true,
    disableSpins: true,
    headless: true,
    hostNotificationLang: 'PT_BR',
    logConsole: false,
    qrTimeout: 0,
}).then(client => start(client));

const TEST_USERS = [
    '5511993333333@c.us',
]

function start(client) {
    client.onMessage(async message => {
        if (TEST_USERS.lastIndexOf(message.from) >= 0) {
            console.log({ message });
            var options = {
                '$sticker': async () => {
                    const media = await decryptMedia(message);
                    if (message.type == 'video') {
                        await client.sendMp4AsSticker(message.from, media, message.id);
                    }
                    else {
                        await client.sendImageAsStickerAsReply(message.from, media, message.id);
                    }

                },
            }
            var options_default = {
                '$menu': async () => await client.sendText(message.from, `Opções:\n${Object.keys(options).join('\n')}`)
            }
            const key = String(message.text).toLowerCase();
            var selected = { ...options_default, ...options }[key];

            if (selected == null) selected = async () => await client.sendText(message.from, 'Digite *$menu* para mais opções');

            await selected();
        } else {
            console.log('Ignoring message from:', message.from);

        }
    });
}

async function decryptMedia(message) {
    const mediaData = await wa.decryptMedia(message);
    const base64Str = mediaData.toString('base64');
    const mediaBase64 = `data:${message.mimetype};base64,${base64Str}`;
    return mediaBase64;
}