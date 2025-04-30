const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  Events,
  Collection
} = require('discord.js');
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const ms = require('ms');
const config = require('./config.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel]
});

const rest = new REST({ version: '10' }).setToken(config.token);

const commands = [
  new SlashCommandBuilder().setName('setup').setDescription('Set up a giveaway'),
  new SlashCommandBuilder().setName('give').setDescription('List giveaway participants')
].map(cmd => cmd.toJSON());

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.gid),
      { body: commands }
    );
  } catch (e) {
    console.error(e);
  }
})();

let giveaways = [], challenges = {};
const genCaptcha = () => Array(6).fill().map(() => Math.random() * 10 | 0).join('');

const save = u => {
  const d = JSON.parse(fs.readFileSync('users.json', 'utf8') || '[]');
  d.push(u);
  fs.writeFileSync('users.json', JSON.stringify(d, null, 2));
};

const load = () => {
  try { return JSON.parse(fs.readFileSync('users.json')) } catch { return [] }
};

const upMsg = (g, ended = false) => {
  const r = Math.floor(g.endTime / 1000);
  client.channels.cache.get(g.channel).messages.fetch(g.msg).then(m => {
    m.edit({
      embeds: [new EmbedBuilder()
        .setColor('#00C7FF')
        .setTitle('🎉 Giveaway 🎉')
        .addFields(
          { name: 'Prize', value: `🏆 **${g.prize}**`, inline: true },
          { name: 'Winners', value: `👥 ${g.w}`, inline: true },
          { name: 'Ends In', value: `⏳ ${ended ? 'Ended' : `<t:${r}:R>`}`, inline: true },
          { name: 'Participants', value: `👤 **${g.p.size}**` }
        )
        .setFooter({ text: g.footer })
        .setTimestamp()
        .setThumbnail(g.thumb)]
    });
  });
};

const endGW = g => {
  clearInterval(g.i);
  upMsg(g, true);
  if (!g.p.size) return client.channels.cache.get(g.channel).send('No participants.');
  const arr = [...g.p];
  arr.forEach(u => save(client.users.cache.get(u)?.username));
  const winners = arr.sort(() => 0.5 - Math.random()).slice(0, g.w).map(u => `<@${u}>`);
  client.channels.cache.get(g.channel).send(`🎉Ended! Winners: ${winners.join(', ')} won **${g.prize}**! 🎉`);
};

client.on(Events.InteractionCreate, async i => {
  if (i.isChatInputCommand()) {
    if (!i.member.roles.cache.has(config.saveCommandRoleId)) return i.reply({ content: 'No permission', ephemeral: true });

    if (i.commandName === 'give') {
      return i.reply({
        embeds: [new EmbedBuilder().setColor('#00C7FF').setTitle('Participants').setDescription(load().join('\n') || 'None')],
        ephemeral: true
      });
    }

    if (i.commandName === 'setup') {
      const m = new ModalBuilder()
        .setCustomId('gw')
        .setTitle('Giveaway')
        .addComponents(
          ['time', 'winners', 'prize', 'description'].map(id =>
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId(id)
                .setLabel(id)
                .setStyle(id === 'description' ? TextInputStyle.Paragraph : TextInputStyle.Short)
            )
          )
        );
      return i.showModal(m);
    }
  }

  if (i.isModalSubmit()) {
    if (i.customId === 'gw') {
      await i.deferReply({ ephemeral: true });
      const t = i.fields.getTextInputValue('time'),
        w = +i.fields.getTextInputValue('winners'),
        p = i.fields.getTextInputValue('prize'),
        d = i.fields.getTextInputValue('description');
      const end = Date.now() + ms(t);
      const g = {
        endTime: end,
        w,
        prize: p,
        desc: d,
        p: new Set(),
        channel: i.channelId,
        footer: 'Click 🎉 to join',
        thumb: 'https://media.discordapp.net/attachments/xxx/xxx/image.png',
        msg: null,
        i: null
      };
      giveaways.push(g);
      g.i = setInterval(() => upMsg(g), 60000);
      setTimeout(() => endGW(g), end - Date.now());

      const embed = new EmbedBuilder()
        .setColor('#00C7FF')
        .setTitle('🎉 Giveaway 🎉')
        .setDescription(d)
        .addFields(
          { name: 'Prize', value: `🏆 **${p}**`, inline: true },
          { name: 'Winners', value: `👥 ${w}`, inline: true },
          { name: 'Ends In', value: ms(ms(t)), inline: true }
        )
        .setFooter({ text: g.footer })
        .setTimestamp()
        .setThumbnail(g.thumb);

      const btn = new ButtonBuilder()
        .setCustomId(`join_${end}`)
        .setEmoji('🎉')
        .setLabel('Join')
        .setStyle(ButtonStyle.Primary);

      const msg = await i.channel.send({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(btn)]
      });

      g.msg = msg.id;
      return i.followUp({ content: 'Started', ephemeral: true });
    }

    if (i.customId === 'captcha') {
      const inp = i.fields.getTextInputValue('captcha');
      const uid = i.user.id;
      const ch = challenges[uid];
      if (ch && inp === ch.code) {
        const g = giveaways.find(x => x.msg === ch.msg && x.endTime > Date.now());
        if (g) {
          g.p.add(uid);
          i.reply({ content: 'Joined!', ephemeral: true });
          upMsg(g);
        } else {
          i.reply({ content: 'Ended', ephemeral: true });
        }
      } else {
        i.reply({ content: 'Wrong captcha', ephemeral: true });
      }
      delete challenges[uid];
    }
  }

  if (i.isButton() && i.customId.startsWith('join_')) {
    const uid = i.user.id;
    const msgId = i.message.id;
    const g = giveaways.find(x => x.msg === msgId && x.endTime > Date.now());
    if (!g) return i.reply({ content: 'Ended', ephemeral: true });
    if (g.p.has(uid)) return i.reply({ content: 'Already joined', ephemeral: true });
    const code = genCaptcha();
    challenges[uid] = { code, msg: msgId };

    const modal = new ModalBuilder()
      .setCustomId('captcha')
      .setTitle(code)
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('captcha')
            .setLabel('Enter captcha')
            .setStyle(TextInputStyle.Short)
        )
      );

    return i.showModal(modal);
  }
});

client.login(config.token);
