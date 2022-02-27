const Discord = require('discord.js')
const Levels = require('discord-xp')
const client = new Discord.Client()
const token = ''  // Token hier eintragen
const prefix = '!' // Command Prefix
const Mongo_Path = '' // Rank System wird hier abgespeichert

Levels.setURL(Mongo_Path)

// Ready Event
client.on('ready', () => {
    console.log('Moin, bin online')
})

// Message Event
client.on('message', async message => {

    const { guild, author, channel, content, mentions } = message
    const member = guild.members.cache.get(author.id)

    if (!guild) return
    if (author.bot) return

    const randomAmountOfXp = Math.floor(Math.random() * 29) + 1
    const hasLeveledUP = await Levels.appendXp(author.id, guild.id, randomAmountOfXp)

    // If Level Up
    if (hasLeveledUP) {
        const user = await Levels.fetch(author.id, guild.id)

        message.reply(`Glückwunsch du bist jetzt Level **${user.level}**`)
    }
    const args = content.split(' ')
    const text = content.toString()

    // Not Admin Function
    function admin() {
        message.reply('Du hast nicht die nötigen rechte diesen Befehl auszuführen')

    }
    // Args Syntax Fehler Function
    function fArgs(syntax) {
        message.reply(`Bitte verwende folgenedn Syntax für diesen Befehl: ${syntax}`)
    }
    // Is Nan Function
    function notNaN() {
        message.reply('Bitte gib eine echte Zahl an.')
    }
    // Level Function
    function level(target) {
        if (!member.hasPermission('ADMINISTRATOR')) {
            return admin()
        }

        if (args.length <= 1) {
            return fArgs('[@user] <Anzahl>')
        }

        if (target) {
            args.shift('> ')
        }
        if(args.length <= 1) {
            return fArgs('[@user] <Anzahl>')
        }
        if(isNaN(args[1])) {
            return notNaN()
        }

    }
    // AddLevel Command
    if (content.toLowerCase().startsWith(`${prefix}addlevel`)) {
        const target = mentions.users.first()

        level(target)

        const user = target ? target : author

        if (args[1] && !isNaN(args[1])) {
            await Levels.appendLevel(user.id, guild.id, args[1])
            channel.send(`Du hast ${user} ${args[1]} Level hinzugefügt`)
        }
    }
    // AddXp Command
    else if (content.toLowerCase().startsWith(`${prefix}addxp`)) {
        const target = mentions.users.first()

        level(target)

        const user = target ? target : author

        if (args[1] && !isNaN(args[1])) {
            await Levels.appendXp(user.id, guild.id, args[1])
            channel.send(`Du hast ${user} ${args[1]} Xp hinzugefügt.`)
        }
    }
    // RankList Command
    else if (content.toLowerCase().startsWith(`${prefix}rank-list`)) {
        const rawLeaderboard = await Levels.fetchLeaderboard(guild.id, 10)

        if (rawLeaderboard.length < 1) {

            return message.reply('Es wurde noch niemand gerankt.')
        }

        const leaderboard = await Levels.computeLeaderboard(client, rawLeaderboard, true)
        const lb = leaderboard.map(e => `${e.position}. ${e.username}#${e.discriminator}\nLevel: ${e.level}\nXP: ${e.xp.toLocaleString()}`)

        channel.send(`**Rank-List**:\n\n${lb.join(`\n\n`)}`)
    }
    // Rank Command
    else if (content.toLowerCase().startsWith(`${prefix}rank`)) {
        const target = mentions.users.first() || author
        const user = await Levels.fetch(target.id, guild.id)

        if (!user) {
            return channel.send(`${target}, hat noch kein Ranking.`)
        }
        if (target.id === author.id) {
            message.reply(`Du bist aktuell auf Level **${user.level}**.`)
        } else {
            channel.send(`${target}, ist aktuell auf Level **${user.level}**.`)
        }
    }
    // RemoveLevel Command
    else if (content.toLowerCase().startsWith(`${prefix}removelevel`)) {
        const target = mentions.users.first()

        level(target)

        const user = target ? target : author
        const userRank = await Levels.fetch(user.id, guild.id)

        console.log(userRank.level)

        if(userRank.level === 0) {
            return message.reply(`${user}, hat noch kein Level.`)
        }

        if (args[1] && !isNaN(args[1])) {
            await Levels.subtractLevel(user.id, guild.id, args[1])
            channel.send(`Du hast ${user} ${args[1]} Level entfernt.`)
        }

    }
    // RemoveXp Command
    else if (content.toLowerCase().startsWith(`${prefix}removexp`)) {
        const target = mentions.users.first()

        level(target)

        const user = target ? target : author
        const userRank = await Levels.fetch(user.id, guild.id)

        if(userRank.xp === 0) {
            return message.reply(`${user}, hat noch kein Xp.`)
        }

        if (args[1] && !isNaN(args[1])) {
            await Levels.subtractXp(user.id, guild.id, args[1])
            channel.send(`Du hast ${user} ${args[1]} XP entfernt.`)
        }

    }
    // Reset Command
    else if (content.toLowerCase().startsWith(`${prefix}reset`)) {
        if (!member.hasPermission('ADMINISTRATOR')) {
            admin()
        }

        const target = mentions.users.first() || author

        Levels.deleteUser(target.id, guild.id)

        channel.send(`Du hast das Ranking von ${target} zurückgesetzt.`)
    }
    // XpForLevel Command
    else if (content.toLowerCase().startsWith(`${prefix}xpforlevel`)) {
        console.log(args[1])
        if (isNaN(args[1])) {
            return notNaN()
        }


        const xpForLevel = Levels.xpFor(args[1])

        message.reply(`Um Level ${args[1]} zuerreichen werden ${xpForLevel} Xp benötigt.`)
    }
})

// Client Login
client.login(token)