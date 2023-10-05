var TwinklGame = TwinklGame || {};

(function(twinkl) {
    
    var createArithmagic = function (manifest) {

        var summoning = false;
        // TODO - while charging, spell orb appears in front, every new question adds more particles (number in middle?)
        var curOp = '+';
        var canAnswer = true;   // maybe combine
        var canPress = true;

        var testing = false;

        // particle variables
        var particleSystem, particleColours;
        var partTimer, bossPartCounter = 150;

        // audio

        var sounds = {};

        var MUSIC_VOLUME = 1.0;

        var initiallyLoadedSoundNames = [
            'intro_music',
            'end_music',
            'defeat_music',
            'thud',
            'shatter',
            'explos',
            'boss_explos',
            'deathbell',
            'zawarudo',
            'timeMovesOnceMore',
            'spell_fire',
            'spell_ice',
            'spell_lightning',
            'spell_wind',
            'spell_heal',
            'spell_cast',
            'swoosh',
            'click',
            'transition',
            'transform',
            'pop'
        ];

        for(var item in manifest) {
            // start with dummy Howler API then load the full object only when needed
            if(manifest[item].src.includes('.mp3')) sounds[item] = {play: function() {}, volume: function() {}, rate: function() {}, playing: function() {return true}, seek: function() {}, loop: function () {}, pause: function() {}, fade: function() {}};
        }

        initiallyLoadedSoundNames.forEach(function (name) {
            var isMusic = name.includes('_music');
            sounds[name] = new Howl({src: [manifest[name].src], volume: isMusic ? MUSIC_VOLUME : 1.0, loop: isMusic})
        });

        var critterSoundMap = {
            1: 'critter4',
            2: 'critter4',
            3: 'critter4',
            4: 'critter1',
            5: 'critter4',
            6: 'critter3',
            7: 'critter1',
            8: 'critter2',
            9: 'critter3',
            10: 'critter3',
            11: 'critter2',
            12: 'critter1',
            13: 'critter2',
            14: 'critter4'
        };

        // data

        var enemies = [
            {animation: ''},
            {animation: 'BabaYagaAnimations', enterSound: 'baba_enter', attackSound: 'baba_attack', defendSound: 'baba_defend', animal:8, maxHealth: 60, minAtk: 3, maxAtk: 4, weakness: 'fire', resistance: 'wind', enemyName: 'Baba Yaga'},
            {animation: 'BatAnimations', enterSound: 'bat_enter', attackSound: 'bat_attack', defendSound: 'bat_defend', animal:1, maxHealth: 40, minAtk: 2, maxAtk: 4, weakness: 'wind', resistance: 'lightning', enemyName: 'Vampire Bat'},
            {animation: 'KingofCloudsAnimations', enterSound: 'cloud_enter', attackSound: 'cloud_attack', defendSound: 'cloud_defend', animal:2, maxHealth: 100, minAtk: 4, maxAtk: 8, weakness: 'wind', resistance: 'fire', enemyName: 'King of Clouds'},
            {animation: 'CyclopsAnimations', enterSound: 'cyclops_enter', attackSound: 'cyclops_attack', defendSound: 'cyclops_defend', animal:13, maxHealth: 65, minAtk: 2, maxAtk: 8, weakness: 'lightning', resistance: 'ice', enemyName: 'The Cyclops'},
            {animation: 'SludgeCreeperAnimations', enterSound: 'sludge_enter', attackSound: 'sludge_attack', defendSound: 'sludge_defend', animal:11, maxHealth: 55, minAtk: 3, maxAtk: 6, weakness: 'fire', resistance: 'ice', enemyName: 'Sludge Creeper'}, //5
            {animation: 'LystrosaurusAnimations', enterSound: 'lystro_enter', attackSound: 'lystro_attack', defendSound: 'lystro_defend', animal:9, maxHealth: 65, minAtk: 2, maxAtk: 9, weakness: 'ice', resistance: 'wind', enemyName: 'Lystrosaurus'},
            {animation: 'GreenDragonAnimations', enterSound: 'green_enter', attackSound: 'green_attack', defendSound: 'green_defend', animal:9, maxHealth: 95, minAtk: 4, maxAtk: 8, weakness: 'ice', resistance: 'fire', enemyName: 'Green Dragon'},
            {animation: 'GiantDragonlordAnimations', enterSound: 'dragonlord_enter', attackSound: 'dragonlord_attack', defendSound: 'dragonlord_defend', animal:4, maxHealth: 120, minAtk: 5, maxAtk: 8, weakness: 'wind', resistance: 'fire', enemyName: 'Giant Dragonlord'},
            {animation: 'EvilWispAnimations', enterSound: 'wisp_enter', attackSound: 'wisp_attack', defendSound: 'wisp_defend', animal:6, maxHealth: 35, minAtk: 3, maxAtk: 5, weakness: 'lightning', resistance: 'ice', enemyName: 'Evil Wisp'},
            {animation: 'FrankMonsterAnimations', enterSound: 'frank_enter', attackSound: 'frank_attack', defendSound: 'frank_defend', animal:10, maxHealth: 50, minAtk: 3, maxAtk: 5, weakness: 'fire', resistance: 'ice', enemyName: 'Frank Monster'}, //10
            {animation: 'WoolieAnimations', enterSound: 'woolie_enter', attackSound: 'woolie_attack', defendSound: 'woolie_defend', animal:10, maxHealth: 35, minAtk: 1, maxAtk: 3, weakness: 'fire', resistance: 'wind', enemyName: 'Woolie'},
            {animation: 'SpookyGhostAnimations', enterSound: 'ghost_enter', attackSound: 'ghost_attack', defendSound: 'ghost_defend', animal:7, maxHealth: 50, minAtk: 1, maxAtk: 5, weakness: 'wind', resistance: 'fire', enemyName: 'Spooky Ghost'},
            {animation: 'ShyGoblinAnimations', enterSound: 'goblin_enter', attackSound: 'goblin_attack', defendSound: 'goblin_defend', animal:10, maxHealth: 40, minAtk: 1, maxAtk: 3, weakness: 'lightning', resistance: 'fire', enemyName: 'Shy Goblin'},
            {animation: 'GrumpAnimations', enterSound: 'grump_enter', attackSound: 'grump_attack', defendSound: 'grump_defend', animal:12, maxHealth: 40, minAtk: 2, maxAtk: 6, weakness: 'ice', resistance: 'wind', enemyName: 'Grump'},
            {animation: 'KickerAnimations', enterSound: 'kicker_enter', attackSound: 'kicker_attack', defendSound: 'kicker_defend', animal:13, maxHealth: 30, minAtk: 1, maxAtk: 4, weakness: 'wind', resistance: 'ice', enemyName: 'Kicker'}, //15
            {animation: 'KomodoAnimations', enterSound: 'komodo_enter', attackSound: 'komodo_attack', defendSound: 'komodo_defend', animal:14, maxHealth: 40, minAtk: 2, maxAtk: 5, weakness: 'ice', resistance: 'lightning', enemyName: 'Komodo'},
            {animation: 'LongLegAnimations', enterSound: 'longleg_enter', attackSound: 'longleg_attack', defendSound: 'longleg_defend', animal:6, maxHealth: 35, minAtk: 2, maxAtk: 4, weakness: 'lightning', resistance: 'wind', enemyName: 'Longleg'},
            {animation: 'BlunicornAnimations', enterSound: 'blunicorn_enter', attackSound: 'blunicorn_attack', defendSound: 'blunicorn_defend', animal:3, maxHealth: 45, minAtk: 3, maxAtk: 7, weakness: 'fire', resistance: 'ice', enemyName: 'Blunicorn'},
            {animation: 'AncientMummyAnimations', enterSound: 'mummy_enter', attackSound: 'mummy_attack', defendSound: 'mummy_defend', animal:6, maxHealth: 40, minAtk: 4, maxAtk: 7, weakness: 'fire', resistance: 'ice', enemyName: 'Ancient Mummy'},
            {animation: 'SabretoothAnimations', enterSound: 'sabretooth_enter', attackSound: 'sabretooth_attack', defendSound: 'sabretooth_defend', animal:14, maxHealth: 45, minAtk: 4, maxAtk: 8, weakness: 'ice', resistance: 'fire', enemyName: 'Sabretooth'}, //20
            {animation: 'OrcAnimations', enterSound: 'orc_enter', attackSound: 'orc_attack', defendSound: 'orc_defend', animal:3, maxHealth: 50, minAtk: 5, maxAtk: 10, weakness: 'fire', resistance: 'lightning', enemyName: 'Orc'},
            {animation: 'BeardoAnimations', enterSound: 'beardo_enter', attackSound: 'beardo_attack', defendSound: 'beardo_defend', animal:6, maxHealth: 35, minAtk: 1, maxAtk: 4, weakness: 'ice', resistance: 'wind', enemyName: 'Beardo'},
            {animation: 'PurpluffAnimations', enterSound: 'purpluff_enter', attackSound: 'purpluff_attack', defendSound: 'purpluff_defend', animal:7, maxHealth: 40, minAtk: 2, maxAtk: 5, weakness: 'wind', resistance: 'ice', enemyName: 'Purpluff'},
            {animation: 'goblot', enterSound: 'goblot_enter', attackSound: 'goblot_attack', defendSound: 'goblot_defend', animal:10, maxHealth: 55, minAtk: 1, maxAtk: 5, weakness: 'lightning', resistance: 'wind', enemyName: 'Goblot'},
            {animation: 'EnchantedScarecrowAnimations', enterSound: 'scarecrow_enter', attackSound: 'scarecrow_attack', defendSound: 'scarecrow_defend', animal:13, maxHealth: 35, minAtk: 1, maxAtk: 3, weakness: 'fire', resistance: 'wind', enemyName: 'Enchanted Scarecrow'}, //25
            {animation: 'CursedSkullAnimations', enterSound: 'skull_enter', attackSound: 'skull_attack', defendSound: 'skull_defend', animal:6, maxHealth: 120, minAtk: 1, maxAtk: 8, weakness: 'lightning', resistance: 'fire', enemyName: 'Cursed Skull'},
            {animation: 'RudeSmokerAnimations', enterSound: 'smoker_enter', attackSound: 'smoker_attack', defendSound: 'smoker_defend', animal:1, maxHealth: 60, minAtk: 3, maxAtk: 6, weakness: 'wind', resistance: 'lightning', enemyName: 'Rude Smoker'},
            {animation: 'GiantWaspAnimations', enterSound: 'wasp_enter', attackSound: 'wasp_attack', defendSound: 'wasp_defend', animal:5, maxHealth: 90, minAtk: 5, maxAtk: 8, weakness: 'wind', resistance: 'lightning', enemyName: 'Giant Wasp'},
            {animation: 'WinglessAnimations', enterSound: 'wingless_enter', attackSound: 'wingless_attack', defendSound: 'wingless_defend', animal:10, maxHealth: 45, minAtk: 4, maxAtk: 5, weakness: 'lightning', resistance: 'fire', enemyName: 'Wingless'},
            {animation: 'TyranmonstrousRexAnimations', enterSound: 'trex_enter', attackSound: 'trex_attack', defendSound: 'trex_defend', animal:9, maxHealth: 110, minAtk: 5, maxAtk: 10, weakness: 'ice', resistance: 'lightning', enemyName: 'Tyrannomonstus Rex'}, //30
            {animation: 'TrollAnimations', enterSound: 'troll_enter', attackSound: 'troll_attack', defendSound: 'troll_defend', animal:2, maxHealth: 85, minAtk: 3, maxAtk: 5, weakness: 'wind', resistance: 'lightning', enemyName: 'Bridge Troll'},
            {animation: 'VampireLordAnimations', enterSound: 'vampire_enter', attackSound: 'vampire_attack', defendSound: 'vampire_defend', animal:1, maxHealth: 100, minAtk: 3, maxAtk: 6, weakness: 'lightning', resistance: 'fire', enemyName: 'Vampire Lord'},
            {animation: 'EvilWitchAnimations', enterSound: 'witch_enter', attackSound: 'witch_attack', defendSound: 'witch_defend', animal:3, maxHealth: 60, minAtk: 2, maxAtk: 5, weakness: 'ice', resistance: 'lightning', enemyName: 'Evil Witch'},
            {animation: 'JohnWolfmanAnimations', enterSound: 'wolfman_enter', attackSound: 'wolfman_attack', defendSound: 'wolfman_defend', animal:13, maxHealth: 65, minAtk: 5, maxAtk: 8, weakness: 'fire', resistance: 'wind', enemyName: 'John Wolfman'},
            {animation: 'GrinnerAnimations', enterSound: 'grinner_enter', attackSound: 'grinner_attack', defendSound: 'grinner_defend', animal:5, maxHealth: 50, minAtk: 3, maxAtk: 5, weakness: 'lightning', resistance: 'ice', enemyName: 'Grinner'}, //35
            {animation: 'SkeletonAnimations', enterSound: 'skeleton_enter', attackSound: 'skeleton_attack', defendSound: 'skeleton_defend', animal:8, maxHealth: 50, minAtk: 1, maxAtk: 3, weakness: 'ice', resistance: 'lightning', enemyName: 'Skellington'},
        ];

        var characters = {
            warlock: {key: 'warlock', animation: 'VahnDawnreaperAnimations', selectAnimation: 'VahnUIAnimations', src: manifest.profile_warlock.src, spellX: 27, spellY: 50, maxHealth: 60, spellStr: 3, name: 'Warlock', fluff: "Vahn Dawnreaper", questionAbility: null, lore: '<b>Special Power: Purify</b> </br> The strongest <em>Arithmagic</em> user in the land. His dark magic allows him to instantly transform a weakened enemy. When an enemy\'s strength is below 10%, click on the lightning icon to transform them immediately.'},
            princess: {key: 'princess', animation: 'LyraAnimationsLatest', selectAnimation: 'LyraUIAnimations', src: manifest.profile_princess.src, spellX: 27, spellY: 45, maxHealth: 140, spellStr: 2, name: 'Princess',  fluff: "Lyra Steelwind", questionAbility: 'power_princess', lore: '<b>Special Power: Time Stop</b> </br> This brave Princess was born with the power to stop time itself. This is perfect for the art of <em>Arithmagic</em>, allowing her to answer even the most difficult questions at her own pace. Use the space bar, or hit the clock icon to use this ability.'},
            elf: {key: 'elf', animation: 'KreekRatRiderAnimationsLatest', selectAnimation: 'KreekUIAnimations', src: manifest.profile_elf.src, spellX: 26, spellY: 40, maxHealth: 70, spellStr: 1, name: 'Elf',  fluff: "Kreek Ratrider", questionAbility: null, lore: '<b>Special Power: Double Strike</b> </br> This trickster makes their own rules. They use powerful elven magic to take two turns in a row. This ability happens automatically.'},
            jim: {key: 'jim', animation: 'JimAnimations', selectAnimation: 'JimUIAnimations', src: manifest.profile_jim.src, spellX: 27, spellY: 48, maxHealth: 120, spellStr: 2, name: 'Math Magician',  fluff: "Jim", questionAbility: 'power_jim', lore: '<b>Special Power: Hat Trick</b> </br> A conjurer of cheap tricks, Jim The Math-Magician strives to prove himself in a world full of real magic. His strength lies in his ability to make a difficult question disappear! Press space, or hit the hat icon to use this ability.'},
            wizard: {key: 'wizard', animation: 'IxsiusAnimations', selectAnimation: 'IxsiusUIAnimations', src: manifest.profile_wizard.src, spellX: 30, spellY: 52, maxHealth: 110, spellStr: 2, name: 'Wizard',  fluff: "Isxius Titanspire", questionAbility: null, lore: "<b>Special Power: True Sight</b> </br> Nearly 200 years old, this Arch-Mage has studied every beast in the land. Her passive ability allows her to see an enemy's strengths and weaknesses. Make sure to check the icons displayed next to the enemy!"}
        };

        var levels = {
            'castle': {
                key: 'castle',
                src: manifest.castle.src,
                fore_src: manifest.castle_fore.src,
                name: "The Vampire's Castle",
                boss: 32,
                miniboss: 1,
                enemy_arr: [2,10,12,18,19,27,29,36],
                lore: "Lord Malum, a fearsome vampire has been building his strength in his remote castle. He cannot be allowed to ruin the lives of any more townfolk or woodland creatures.",
                startDialogue: "Oh? You're approaching me? [laughs] I'll be waiting...",
                victoryDialogue: "[laughs] A worthy attempt, but I will always win in the end!",
                defeatDialogue: "Impossible! I should be ruler of this land!",
                minibossDialogue: "Hmmm, maybe you are stronger than I thought...",
                startDialogueSound: "boss_vampire_intro",
                victoryDialogueSound: "boss_vampire_victory",
                defeatDialogueSound: "boss_vampire_defeat",
                minibossDialogueSound: "boss_vampire_halfway",
                },
            'forest_dark': {
                key: 'forest_dark',
                src: manifest.forest_dark.src,
                fore_src: manifest.forest_dark_fore.src,
                name: "The Lost Woods",
                boss: 26,
                miniboss: 34,
                enemy_arr: [1,2,5,12,16,17,24,27,29],
                lore: "Deep in the darkest part of the Forest of Shadows, a cult has been performing a ritual to bring life to inanimate objects. They've gone too far, and an ancient stone skull is now running amok.",
                startDialogue: "I have been given life! Now, I shall take yours!",
                victoryDialogue: "Today, I rule the forest. Tomorrow, the whole kingdom!",
                defeatDialogue: "Yaaaaargh! How did I lose? I'm the greatest!",
                minibossDialogue: "Very good so far, but I'll destroy you soon enough!",
                startDialogueSound: "boss_skull_intro",
                victoryDialogueSound: "boss_skull_victory",
                defeatDialogueSound: "boss_skull_defeat",
                minibossDialogueSound: "boss_skull_halfway",
            },
            'bridge': {
                key: 'bridge',
                src: manifest.bridge.src,
                fore_src: manifest.bridge_fore.src,
                name: "M6 Troll Road",
                boss: 31,
                miniboss: 21,
                enemy_arr: [1,11,13,14,17,18,22,23,25],
                lore: "This bridge is one of the main routes between Saradonn and Ma'Xtohk, and a devious troll has set up camp here. Extorting passers-by for gold, he then threatens them if they refuse to pay. His crimes cannot go unpunished.",
                startDialogue: "Puny weakling fight me? Me crush you!",
                victoryDialogue: "Me go sleep now. Leave me alone!",
                defeatDialogue: "Me lose? Not fair...",
                minibossDialogue: "Leave now puny, or else me be real mad...",
                startDialogueSound: "boss_troll_intro",
                victoryDialogueSound: "boss_troll_victory",
                defeatDialogueSound: "boss_troll_defeat",
                minibossDialogueSound: "boss_troll_halfway",
            },
            'desert': {
                key: 'desert',
                src: manifest.desert.src,
                fore_src: manifest.desert_fore.src,
                name: "The Forgotten Island",
                boss: 30,
                miniboss: 6,
                enemy_arr: [5,11,14,15,16,19,20,29,35],
                lore: "A cruel experiment has transformed animals into their prehistoric forms. It's up to you to turn them back before they can escape the island and cause problems!",
                startDialogue: "[Angry roaring]",
                victoryDialogue: "[Triumphant roaring]",
                defeatDialogue: "[Sad roaring]",
                minibossDialogue: "[Concerned roaring]",
                startDialogueSound: "boss_trex_intro",
                victoryDialogueSound: "boss_trex_victory",
                defeatDialogueSound: "boss_trex_defeat",
                minibossDialogueSound: "boss_trex_halfway",
            },
            'flowers': {
                key: 'flowers',
                src: manifest.flowers.src,
                fore_src: manifest.flowers_fore.src,
                name: "Queen of Wasps",
                boss: 28,
                miniboss: 9,
                enemy_arr: [11,13,14,15,22,23,24,25,16,18],
                lore: "This Queen Wasp has been feeding on magic honey from an evil wizard's larder and has grown to a troublesome size. Help her and also all the other animals that have snacked on the honey.",
                startDialogue: "Buzzzzz off pesssst, or you'll be getting sssstung!",
                victoryDialogue: "Nizzzzze try, honey. Better luck nexzzzzzt time!",
                defeatDialogue: "Nooooo! I've been zzzzzzquished!",
                minibossDialogue: "I'm impreszzzzzed. Maybe I'll zzzzzquash you persszzzzonally...",
                startDialogueSound: "boss_wasp_intro",
                victoryDialogueSound: "boss_wasp_victory",
                defeatDialogueSound: "boss_wasp_defeat",
                minibossDialogueSound: "boss_wasp_halfway",
            },
            'cave': {
                key: 'cave',
                src: manifest.cave.src,
                fore_src: manifest.cave_fore.src,
                name: "Cave of the Dragonlord",
                boss: 8,
                miniboss: 4,
                enemy_arr: [2,5,12,15,23,27,29,35,11,34],
                lore: "One of the Dragonlords, usually proud and stoic, has gone rogue. She is assembling a terrible army and plans on taking over the realm! This will be tough, but you need to stop her!",
                startDialogue: "You DARE go against the might of the Dragonlords?!",
                victoryDialogue: "Now I am free to rule over the whole realm! [laugh]",
                defeatDialogue: "I have failed! I am unworthy of the Dragonlords!",
                minibossDialogue: "My army is letting me down. Soon, you face the wrath of a true Dragonlord!",
                startDialogueSound: "boss_dragonlord_intro",
                victoryDialogueSound: "boss_dragonlord_victory",
                defeatDialogueSound: "boss_dragonlord_defeat",
                minibossDialogueSound: "boss_dragonlord_halfway",
            },
            'forest_light': {
                key: 'forest_light',
                src: manifest.forest_light.src,
                fore_src: manifest.forest_light_fore.src,
                name: "Forest of Fear",
                boss: 7,
                miniboss: 33,
                enemy_arr: [2,9,11,15,13,14,20,22,25,10],
                lore: "A young green dragon has been causing forest fires in the nearby woods and is jealously hoarding stolen gold. The animals of the forest are too scared to go back to their homes! You need to help them!",
                startDialogue: "You can't stop me. No one can stop me! I'll show you all!",
                victoryDialogue: "See! No one can stop me. Now will everyone stop bothering me?",
                defeatDialogue: "Fine. Whatever... I was getting bored anyway...",
                minibossDialogue: "Why are you still here? Do I really have to come all the way down there myself? *sigh*",
                startDialogueSound: "boss_dragon_intro",
                victoryDialogueSound: "boss_dragon_victory",
                defeatDialogueSound: "boss_dragon_defeat",
                minibossDialogueSound: "boss_dragon_halfway",
            },
            'clouds': {
                key: 'clouds',
                src: manifest.clouds.src,
                fore_src: manifest.clouds_fore.src,
                name: "Battle in the Skies",
                boss: 3,
                miniboss: 27,
                enemy_arr: [2,12,22,24,33,35,17],
                lore: "The cloud king, bitter and full of hate towards life, has refused to rain, causing drought and dangerously high temperatures. Now he's using lies and threats to convince other clouds not to rain. This needs to stop, as soon as possible!",
                startDialogue: "Welcome to my humble realm peasant, feel free to bask in my glory!",
                victoryDialogue: "This is why I choose to spend my time with more worthy subjects. Leave now, and don't come back!",
                defeatDialogue: "Beaten by a mere commoner? How has this happened?!",
                minibossDialogue: "Hmm, I grow tired of you. Maybe I should deal with you personally...",
                startDialogueSound: "boss_cloud_intro",
                victoryDialogueSound: "boss_cloud_victory",
                defeatDialogueSound: "boss_cloud_defeat",
                minibossDialogueSound: "boss_cloud_halfway",
            }
        };

        var helpContent = {
            'instructions': {
                title: "How to Play:",
                text: "Choose a character, choose where to battle, then test your maths skills against a wide variety of enemies in this turn based battle game. You can answer using your keyboard or the on-screen number pad. Watch out for enemies weaknesses and strengths, choose the right spell types and try and defeat the area boss!"
            },
            'choose-character': {
                title: "Choose a Character",
                text: "Choose a one of five powerful spell-casters, and take them on a quest to dispel evil! Each character has a special ability. Tap or click on a character to learn about them, then again to select them."
            },
            'map': {
                title: "Choose a Battleground",
                text: "This is the map screen. There are eight different levels, each with their own enemies, mini-boss and end boss. Tap or click a location to learn about it, then again to travel there."
            },
            'main': {
                title: "How to Play:",
                text: "The coloured shields represent spell types: Addition, Subtraction, Multiplication, Division and Healing (involving all maths). <br><br> Each enemy is weak to a certain type of spell, as well as being resistant to another type, so experiment with different types! <br><br> After selecting a spell, choose the difficulty of the questions you will answer. More difficult questions will result in a higher powered spell."
            },
            'happiness': {
                title: "You did it!",
                text: "This area has been cleared, thanks to your amazing maths skills. Go back to the map screen to fight another day!"
            }
        };

        var contentDescriptions = {
            fire: {
                easy: 'Within 100',
                medium: 'Within 1000',
                hard: '1000 and beyond'
            },
            ice: {
                easy: 'Within 100',
                medium: 'Within 1000',
                hard: '1000 and beyond'
            },
            lightning: {
                easy: '2, 5 and 10 times tables',
                medium: '3, 4 and 8 times tables',
                hard: 'up to 12 × 12'
            },
            wind: {
                easy: '2, 5 and 10 division facts',
                medium: '3, 4 and 8 division facts',
                hard: 'up to 12 division facts'
            },
            heal: {
                easy: 'Lower heal (mixed maths)',
                medium: 'Medium heal (mixed maths)',
                hard: 'Upper heal (mixed maths)'
            },
        };

        var upToTenThousand = twinkl.Utils.filledArray(10000).map(function (x){return x+1});

        var operatorMap = {
            'fire': '+',
            'ice': '-',
            'lightning': '*',
            'wind': '/',
            'heal': '+,-,/,*'
        };

        var spellLevels = {
            'fire': {
                'easy': [
                    {
                        min: 10,
                        max: 99,
                        terms: [1,2,3,4,5,6,7,8,9],
                        slice: upToTenThousand.slice(11, 100),
                        answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice) }

                    },
                    {
                        min: 10,
                        max: 100,
                        terms: [10,20,30,40,50,60,70,80,90],
                        slice: upToTenThousand.slice(20, 100),
                        answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice) }

                    },
                    {
                        min: 0,
                        max: 100,
                        slice: upToTenThousand.slice(0, 100),
                        answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice) }
                    },
                ],
                'medium': [
                    {
                        min: 0,
                        max: 1000,
                        slice: upToTenThousand.slice(1, 1000),
                        answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice)},
                        terms: [1,2,3,4,5,6,7,8,9]
                    },
                    {
                        min: 0,
                        max: 1000,
                        slice: upToTenThousand.slice(10, 1000),
                        answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice)},
                        terms: [10,20,30,40,50,60,70,80,90]
                    },
                    {
                        min: 0,
                        max: 1000,
                        slice: upToTenThousand.slice(100, 1000),
                        answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice)},
                        terms: [100,200,300,400,500,600,700,800,900]
                    },
                    {
                        min: 0,
                        max: 99,
                        slice: upToTenThousand.slice(20, 198),
                        answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice)}
                    }
                ],
                'hard': [
                    {
                        min: 0,
                        max: 10000,
                        answersFunc: function() { return twinkl.Utils.randomFromArray(upToTenThousand)},
                        terms: [1,2,3,4,5,6,7,8,9]
                    },
                    {
                        min: 0,
                        max: 10000,
                        answersFunc: function() { return twinkl.Utils.randomFromArray(upToTenThousand)},
                        terms: [10,20,30,40,50,60,70,80,90]
                    },
                    {
                        min: 0,
                        max: 10000,
                        answersFunc: function() { return twinkl.Utils.randomFromArray(upToTenThousand)},
                        terms: [100,200,300,400,500,600,700,800,900]
                    },
                    {
                        min: 100,
                        max: 999,
                        canCrossTens: false,
                        slice: upToTenThousand.slice(200, 998),
                        answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice)}
                    }
                ]
            },
            'ice': {
                'easy': [
                    {
                        min: 10,
                        max: 99,
                        terms: [1,2,3,4,5,6,7,8,9],
                        slice: upToTenThousand.slice(0,98),
                        answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice)}
                    },
                    {
                        min: 10,
                        max: 99,
                        terms: [10,20,30,40,50,60,70,80,90],
                        slice: upToTenThousand.slice(0,89),
                        answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice)}
                    },
                    {
                        min: 10,
                        max: 99,
                        slice: upToTenThousand.slice(0,89),
                        answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice)}
                    },
                ],
                'medium': [
                    {
                        min: 100,
                        max: 999,
                        terms: [1,2,3,4,5,6,7,8,9],
                        slice: upToTenThousand.slice(92,998),
                        answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice)}
                    },
                    {
                        min: 100,
                        max: 999,
                        terms: [10,20,30,40,50,60,70,80,90],
                        slice: upToTenThousand.slice(10,989),
                        answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice)}
                    },
                    {
                        min: 100,
                        max: 999,
                        terms: [100,200,300,400,500,600,700,800,900],
                        slice: upToTenThousand.slice(0,899),
                        answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice)}
                    },
                    {
                        min: 10,
                        max: 99,
                        slice: upToTenThousand.slice(0,89),
                        answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice)}
                    },
                ],
                'hard': [
                    {
                        min: 0,
                        max: 10000,
                        terms: [0,1,2,3,4,5,6,7,8,9],
                        answersFunc: function() { return twinkl.Utils.randomFromArray(upToTenThousand)}
                    },
                    {
                        min: 0,
                        max: 10000,
                        terms: [10,20,30,40,50,60,70,80,90],
                        answersFunc: function() { return twinkl.Utils.randomFromArray(upToTenThousand)}
                    },
                    {
                        min: 0,
                        max: 10000,
                        terms: [0,100,200,300,400,500,600,700,800,900],
                        answersFunc: function() { return twinkl.Utils.randomFromArray(upToTenThousand)}
                    },
                    // {
                    //     min: 100,
                    //     max: 999,
                    //     slice: upToTenThousand.slice(0,899),
                    //     answersFunc: function(slice) { return twinkl.Utils.randomFromArray(slice)}
                    // },
                ]
            },
            'lightning': {
                'easy': [
                    {
                        min: 1,
                        max: 12,
                        answersFunc: function() { return twinkl.Utils.randomFromArray([2,5,10]) * twinkl.Utils.randomInt(1, 12)},
                        terms: [2, 5, 10]
                    }
                ],
                'medium': [
                    {
                        min: 1,
                        max: 12,
                        answersFunc: function() { return twinkl.Utils.randomFromArray([3,4,8]) * twinkl.Utils.randomInt(1, 12)},
                        terms: [3, 4, 8]
                    }
                ],
                'hard': [
                    {
                        min: 1,
                        max: 12,
                        answersFunc: function() { return twinkl.Utils.randomInt(2, 12) * twinkl.Utils.randomInt(1, 12)},
                        terms: [2,3,4,5,6,7,8,9,10,11,12]
                    }
                ]
            },
            'wind': {
                'easy': [
                    {
                        min: 0,
                        max: 144,
                        answersFunc: function() { return twinkl.Utils.randomInt(1, 13) },
                        terms: [1, 2, 5, 10]
                    }
                ],
                'medium': [
                    {
                        min: 0,
                        max: 144,
                        answersFunc: function() { return twinkl.Utils.randomInt(1, 13) },
                        terms: [3, 4, 8]
                    }
                ],
                'hard': [
                    {
                        min: 2,
                        max: 144,
                        answersFunc: function() { return Math.ceil( Math.random()*12 ) },
                        terms: [2,3,4,5,6,7,8,9,10,11,12]
                    }
                ]
            }
        };

        var nullQuestion = {
            question: ' ',
            answer: 0,
            aim: undefined
        };

        var parallax = {},
            stage = {},
            animationsLib = {},
            characterSelectStage = {},
            characterSelectAnimation = {},
            victoryStage = {},
            victoryAnimation = {},
            trophyAnimation = {},
            characterAnimation = {},
            enemyAnimation = {},
            transformAnimation = {},
            flashFilter = new createjs.ColorFilter(1, 1, 1, 1, 155, 155, 155),
            renderCanvases = twinkl.Utils.noOp;

        return new Vue({
            el: '#container',
            mixins: [twinkl.mixins.goFontResize],
            data: {
                // meta
                manifest: manifest,
                preloaded: false,

                // data content
                helpContent: helpContent,
                levels: levels,
                characters: characters,
                animations: {},
                operatorMap: operatorMap,
                leaves: [{id: 'leaf1', top: 27}, {id: 'leaf3', top: 7}, {id: 'leaf2', top: 15}, {id: 'leaf1', top: 20}, {id: 'leaf1', top: 37}, {id: 'leaf3', top: 11}, {id: 'leaf3', top: 31}],

                // state
                selectedLevel: null,
                selectedCharacter: null,
                currentLevel: null,
                currentCharacter: null,
                currentEnemy: null,
                currentSpellType: 'fire',
                currentDifficulty: 'easy',
                castingTime: 100,
                spellTimer: null,
                playerStats: {
                    castle: {
                        victories: 0,
                        questionsCorrect: 0,
                        questionsIncorrect: 0,
                        spellsCast: 0,
                        mostPowerfulSpell: 0,
                        superEffectiveSpells: 0,
                        currentEnemy: null,
                        conqueredBy: ''
                    },
                    forest_dark: {
                        victories: 0,
                        questionsCorrect: 0,
                        questionsIncorrect: 0,
                        spellsCast: 0,
                        mostPowerfulSpell: 0,
                        superEffectiveSpells: 0,
                        currentEnemy: null,
                        conqueredBy: ''
                    },
                    bridge: {
                        victories: 0,
                        questionsCorrect: 0,
                        questionsIncorrect: 0,
                        spellsCast: 0,
                        mostPowerfulSpell: 0,
                        superEffectiveSpells: 0,
                        currentEnemy: null,
                        conqueredBy: ''
                    },
                    desert: {
                        victories: 0,
                        questionsCorrect: 0,
                        questionsIncorrect: 0,
                        spellsCast: 0,
                        mostPowerfulSpell: 0,
                        superEffectiveSpells: 0,
                        currentEnemy: null,
                        conqueredBy: ''
                    },
                    flowers: {
                        victories: 0,
                        questionsCorrect: 0,
                        questionsIncorrect: 0,
                        spellsCast: 0,
                        mostPowerfulSpell: 0,
                        superEffectiveSpells: 0,
                        currentEnemy: null,
                        conqueredBy: ''
                    },
                    cave: {
                        victories: 0,
                        questionsCorrect: 0,
                        questionsIncorrect: 0,
                        spellsCast: 0,
                        mostPowerfulSpell: 0,
                        superEffectiveSpells: 0,
                        currentEnemy: null,
                        conqueredBy: ''
                    },
                    forest_light: {
                        victories: 0,
                        questionsCorrect: 0,
                        questionsIncorrect: 0,
                        spellsCast: 0,
                        mostPowerfulSpell: 0,
                        superEffectiveSpells: 0,
                        currentEnemy: null,
                        conqueredBy: ''
                    },
                    clouds: {
                        victories: 0,
                        questionsCorrect: 0,
                        questionsIncorrect: 0,
                        spellsCast: 0,
                        mostPowerfulSpell: 0,
                        superEffectiveSpells: 0,
                        currentEnemy: null,
                        conqueredBy: ''
                    },

                    hp: 100,
                    hpMax: 100,
                    spellPower: 0,
                    weaknessDiscovered: false,
                    resistanceDiscovered: false,
                    answeredThisCharge: []
                },
                enemyStats: {
                    hp: 100,
                    hpMax: 100
                },
                userInput: '',
                question: ' ',
                currentBackground: 'semi_corrupt',
                victoryText: 'Victory!',
                stage: 'title',
                helping: false,
                casting: false,
                abilityUsed: false,
                timePaused: false,
                zoomed: false,
                mapDimmed: false,
                dialogueOpen: false,
                spellPickerExpanded: false,
                levelPickerExpanded: false,
                mathsBoxShaking: false,
                trumpetsSounding: false,
                spaceDown: false
            },
            methods: {

                // Let's go!

                setup: function () {

                    var scope = this;

                    this.initialiseParticleSketch();

                    stage = new createjs.Stage(document.getElementById('character-canvas'));
                    characterSelectStage = new createjs.Stage(document.getElementById('char-select-canvas'));
                    // var titleStageBG = new createjs.Stage(document.getElementById('title-stage-bg'));
                    var titleStageMG = new createjs.Stage(document.getElementById('title-stage-mg'));
                    var titleStageFG = new createjs.Stage(document.getElementById('title-stage-fg'));
                    victoryStage = new createjs.Stage(document.getElementById('victory-canvas'));

                    animationsLib = twinkl.Utils.loadAnimateLibrary();

                    // console.log(animationsLib)

                    renderCanvases = function () {
                        if(scope.stage === 'title') {
                            // titleStageBG.update();
                            titleStageMG.update();
                            titleStageFG.update();
                        } else if(scope.stage === 'choose-character') {
                            characterSelectStage.update();
                        } else if(scope.stage === 'main') {
                            stage.update();
                        } else if(scope.stage === 'happiness' || (scope.stage === 'stats' && scope.allLevelsComplete)) {
                            victoryStage.update();
                        }
                    };

                    createjs.Ticker.framerate = 25;
                    createjs.Ticker.addEventListener('tick', renderCanvases);

                    var mg = new animationsLib['Midground'](), fg = new animationsLib['ForegroundEdit2']();
                    mg.scaleX = 1.5;
                    mg.scaleY = 1.5;
                    fg.scaleX = 1.5;
                    fg.scaleY = 1.5;
                    titleStageMG.addChild(mg);
                    titleStageFG.addChild(fg);

                    transformAnimation = new animationsLib['Transform']();
                    transformAnimation.scaleX = 1;
                    transformAnimation.scaleY = 1;
                    transformAnimation.x = 1250;
                    transformAnimation.y = 300;
                    stage.addChild(transformAnimation);
                    // for whatever reason, .children[] is empty at this point, so control playback on first tick
                    transformAnimation.on('tick', function () {
                        transformAnimation.children[0].stop();
                        transformAnimation.children[0].loop = false;
                    }, null, true);

                    this.playMusic('intro_music');

                    sounds['transition'].volume(0.5);
                    sounds['shatter'].volume(0.6);

                    var input = $('.dungeon-maths-input');

                    input.keydown(function (event) {
                        if (event.keyCode === 13 && canPress) {
                            scope.checkAnswer();
                            return false;
                        } else if(event.keyCode === 32 && !scope.spaceDown) {
                            scope.spaceDown = true;
                            if(scope.currentCharacter.name === 'Princess' || scope.currentCharacter.name === 'Math Magician') {
                                scope.useAbility();
                            }
                        }
                    });

                    input.keyup(function (event) {
                        if(event.keyCode === 32) {
                            scope.spaceDown = false;
                        }
                    });

                },

                reset: function () {

                    // reset victories ?
                    this.setStat('hp', 100);
                    this.setStat('hpMax', 100);
                    this.setStat('weaknessDiscovered', false);
                    this.setStat('resistanceDiscovered', false);
                    this.setStat('answeredThisCharge', []);

                    this.helping = false;
                    this.casting = false;
                    this.userInput = '';
                    this.mapDimmed = false;
                    this.dialogueOpen = false;

                    // currentLevel ?
                    // currentCharacter ?

                    characterAnimation.gotoAndStop('Idle');
                    enemyAnimation.gotoAndStop('Idle');

                },

                letsgo: function () {

                    Vue.nextTick(function () {

                        this.toggleHelp();

                    }.bind(this));

                    this.stage = 'instructions';
                },

                toggleHelp: function () {

                    this.helping = !this.helping;
                    if(this.helping) sounds.swoosh.play();

                },

                contextualClose: function () {
                    switch(this.stage) {
                        case 'main':
                        case 'stats':
                        case 'happiness':
                            if(this.timePaused) createjs.Ticker.addEventListener('tick', renderCanvases);
                            this.timePaused = false;
                            canAnswer = true;
                            this.abilityUsed = false;
                            $('#dungeon-ability').fadeOut('fast');
                            this.zoomed = false;
                            this.casting = false;
                            this.selectedLevel = null;
                            clearInterval(this.spellTimer);
                            this.castingTime = 100;
                            stage.removeChild(characterAnimation);
                            stage.removeChild(enemyAnimation);
                            stage.update();
                            Vue.nextTick(function () {
                                this.stage = 'map';
                            }.bind(this));
                            break;
                        case 'map':
                            this.stage = 'choose-character';
                            this.selectedCharacter = null;
                            characterSelectStage.removeAllChildren();
                            break;
                        default:
                            this.stage = 'title';
                            if(parallax && typeof parallax.enable === 'function') parallax.enable();
                            break;
                    }
                    this.helping = false;
                    this.mapDimmed = false;
                    this.dialogueOpen = false;
                    switch (this.getCurrentVictories()) {
                        case 3:
                            this.fadeMusicDown('miniboss_music', 1000);
                            break;
                        case 7:
                            this.fadeMusicDown('boss_music', 1000);
                            break;
                        case 8:
                            this.fadeMusicDown('end_music', 800);
                            break;
                        default:
                            this.fadeMusicDown(this.currentLevel.key + '_music', 1000);
                            break;
                    }
                    this.fadeMusicUp('intro_music', 1000);
                    this.fadeMusicDown('defeat_music', 800);
                },

                keypadPress: function (num) {
                    sounds.click.play();
                    this.userInput += num;
                    if(twinkl.Utils.canAutofocus()) document.getElementById('theText').focus();
                },

                keypadBackspace: function () {
                    sounds.click.play();
                    this.userInput = this.userInput.slice(0, this.userInput.length - 1)
                },

                selectCharacter: function (character) {

                    sounds.click.play();

                    this.selectedCharacter = character;

                    if(characterSelectAnimation instanceof createjs.MovieClip) {
                        characterSelectStage.removeChild(characterSelectAnimation);
                        characterSelectAnimation = undefined;
                    }
                    characterSelectAnimation = new animationsLib[character.selectAnimation]();
                    characterSelectAnimation.scaleX = 1.5;
                    characterSelectAnimation.scaleY = 1.5;
                    characterSelectStage.addChild(characterSelectAnimation);

                    characterSelectAnimation.gotoAndStop('Idle');

                },

                chooseCharacter: function (character) {

                    sounds.click.play();

                    this.currentCharacter = character;

                    characterSelectAnimation.gotoAndStop('Victory');

                    setTimeout(function () {

                        this.stage = 'map';

                        var characterName = character.fluff;

                        twinkl.Utils.track(twinkl.Utils.eventNames.characterSelected, characterName);

                    }.bind(this), 2500);

                },

                showChars: function () {

                    sounds.click.play();

                    this.stage = 'choose-character';

                    this.helping = false;

                    if(parallax && typeof parallax.disable === 'function') parallax.disable();
                },

                selectLevel: function (level) {

                    this.selectedLevel = level;

                    sounds.swoosh.play();

                },

                chooseLevel: function (levelName, replay) {

                    if(replay) {
                        this.setLocationStat('victories', 0);
                        this.setLocationStat('conqueredBy', '');
                        this.setLocationStat('currentEnemy', null);
                    }

                    sounds.click.play();

                    this.currentLevel = this.levels[levelName];

                    this.selectedLevel = null;

                    this.fadeMusicDown('intro_music', 300);

                    if(this.getCurrentVictories() === 8) {

                        this.loadClearedZone();

                    } else {

                        sounds['transition'].play();
                        // this.fadeMusicUp('transition', 50);

                        this.mapDimmed = true;

                        setTimeout(this.startGame, replay ? 5 : 2500);

                    }

                    var selectedLevel = this.currentLevel.name;

                    twinkl.Utils.track(twinkl.Utils.eventNames.levelSelected, selectedLevel);

                },

                startGame: function () {

                    this.stage = 'main';

                    this.generatePlayer();
                    this.generateEnemy();

                    setTimeout(function () {

                        this.loadSoundThenPlay(this.currentLevel.key + '_music');

                        if (this.getCurrentVictories() === 0) {
                            this.dialogueOpen = true;
                            this.loadSoundThenPlay(this.currentLevel.startDialogueSound);
                        }
                        else if (this.getCurrentVictories() === 4) {
                            this.dialogueOpen = true;
                            this.loadSoundThenPlay(this.currentLevel.minibossDialogueSound);
                        }

                    }.bind(this), 1500);

                    // todo - start fired on lets go + track roundStart here
                    // also for MTC resources + other tracked (phonics galaxy, SPaG, etc)
                    twinkl.Utils.track(twinkl.Utils.eventNames.startGame);

                },

                loadClearedZone: function () {

                    this.stage = 'happiness';

                    // this.generatePlayer();

                    victoryAnimation = undefined;
                    victoryAnimation = new animationsLib[characters[this.getLocationStat('conqueredBy')].animation]();

                    victoryAnimation.scaleX = 1.5;
                    victoryAnimation.scaleY = 1.5;
                    victoryAnimation.x = 0;

                    victoryStage.removeAllChildren();

                    victoryStage.addChild(victoryAnimation);

                    victoryAnimation.gotoAndStop('Victory');

                    this.playMusic('end_music');

                },

                generatePlayer: function () {

                    if(characterAnimation instanceof createjs.MovieClip) {
                        stage.removeChild(characterAnimation);
                        characterAnimation = undefined;
                    }

                    characterAnimation = new animationsLib[this.currentCharacter.animation]();
                    characterAnimation.scaleX = 1.5;
                    characterAnimation.scaleY = 1.5;
                    characterAnimation.x = 0;
                    stage.addChild(characterAnimation);

                    characterAnimation.gotoAndStop('Idle');

                    this.setStat('spellPower', this.currentCharacter.spellStr);
                    this.setStat('hp', this.currentCharacter.maxHealth);
                    this.setStat('hpMax', this.currentCharacter.maxHealth);

                },

                generateEnemy: function () {

                    // reset enemy side of stage

                    if(enemyAnimation instanceof createjs.MovieClip) {
                        enemyAnimation.alpha = 1;

                        enemyAnimation.gotoAndStop('Idle');

                        stage.removeChild(enemyAnimation);

                        enemyAnimation = undefined;
                    }

                    // set enter time for tweening in and get a new enemy if needed

                    var enterTime;

                    if(this.getCurrentVictories() === 3) {

                        // miniboss time

                        this.currentEnemy = enemies[ this.currentLevel.miniboss ];
                        enterTime = 3000;

                    } else if(this.getCurrentVictories() === 7) {

                        // boss fight time

                        this.currentEnemy = enemies[ this.currentLevel.boss ];
                        enterTime = 5000;

                    } else {

                        // regular time

                        if(this.getLocationStat('currentEnemy') === null) {
                            // zone has just been entered OR a monster has died
                            var curEnemyNum = Math.floor(Math.random() * this.currentLevel.enemy_arr.length);
                            this.currentEnemy = enemies[ this.currentLevel.enemy_arr[curEnemyNum] ];
                            this.setLocationStat('currentEnemy', this.currentLevel.enemy_arr.splice(curEnemyNum, 1));
                        }
                        else {
                            // returning to zone, don't splice !
                            this.currentEnemy = enemies[ this.getLocationStat('currentEnemy') ];
                        }

                        enterTime = 1000;
                    }

                    if(!this.currentEnemy) {
                        // fallback to skellington just in case something fails
                        this.currentEnemy = enemies[36];
                    }

                    // dynamically load the monster sounds

                    this.loadSound(this.currentEnemy.enterSound);
                    this.loadSound(this.currentEnemy.attackSound);
                    this.loadSound(this.currentEnemy.defendSound);

                    // initialise enemy animation

                    enemyAnimation = new animationsLib[this.currentEnemy.animation.length > 0 ? this.currentEnemy.animation : 'SkeletonAnimations']();
                    enemyAnimation.scaleX = 1.5;
                    enemyAnimation.scaleY = 1.5;
                    enemyAnimation.gotoAndStop('Idle');
                    enemyAnimation.x = 1000;

                    stage.addChild(enemyAnimation);

                    setTimeout(function() {

                        sounds[this.currentEnemy.enterSound].play();

                    }.bind(this), enterTime * 0.75);

                     var afterSlide = function () {

                         this.enemyStats.hp = this.currentEnemy.maxHealth;
                         this.enemyStats.hpMax = this.currentEnemy.maxHealth;

                         if(this.currentCharacter.name === 'Wizard') {

                             this.setStat('weaknessDiscovered', true);
                             this.setStat('resistanceDiscovered', true);

                         } else {

                             this.setStat('weaknessDiscovered', false);
                             this.setStat('resistanceDiscovered', false);

                         }

                         $('.enemy-HP').fadeIn(250);
                         $('.dungeon-player-health.enemy').fadeIn(250);
                         $('.enemy-name-text').fadeIn(250);

                         this.playerTurn();

                     }.bind(this);

                    createjs.Tween.get(enemyAnimation)
                        .to({x: 0}, enterTime, createjs.Ease.circOut)
                        .call(afterSlide);
                },

                checkAnswer: function () {

                    var userInputParsed = parseInt(this.userInput);

                    if(this.timePaused) {

                        sounds.timeMovesOnceMore.play();

                        this.timePaused = false;

                        createjs.Ticker.addEventListener('tick', renderCanvases);
                    }

                    // var userInput = this.userInput;
                    // twinkl.Utils.track(twinkl.Utils.eventNames.questionAttempt, userInput);

                    this.getStat('answeredThisCharge').push({
                        question: this.question.question,
                        answer: userInputParsed,
                        aim: this.question.aim,
                        correct: userInputParsed === this.question.answer ? 1 : 0
                    });

                    if (userInputParsed === this.question.answer) {

                        // question correct

                        this.modifyStat('questionsCorrect', 1);

                        switch (this.currentDifficulty) {
                            case 'easy' :
                                // TODO - scale to answer speed as well as difficulty
                                this.setStat('spellPower', this.getStat('spellPower') + (this.currentCharacter.spellStr * 1.25));
                                break;
                            case 'medium' :
                                this.setStat('spellPower', this.getStat('spellPower') + (this.currentCharacter.spellStr * 1.5));
                                break;
                            case 'hard' :
                                this.setStat('spellPower', this.getStat('spellPower') + (this.currentCharacter.spellStr * 1.75));
                                break;
                        }

                        this.userInput = '';

                        // twinkl.Utils.track(twinkl.Utils.eventNames.questionCorrect, question);

                        this.getQuestion();

                    } else {

                        // question incorrect

                        this.modifyStat('questionsIncorrect', 1);

                        // twinkl.Utils.track(twinkl.Utils.eventNames.questionIncorrect, question);

                        canPress = false;
                        this.userInput = '';

                        this.mathsBoxShaking = true;

                        setTimeout(function() {

                            canPress = true;
                            this.mathsBoxShaking = false;

                            // if(!canAnswer) $(".dungeon-all-maths").hide();

                        }.bind(this), 700);
                    }
                },

                chooseSpell: function () {

                    if (!summoning) {

                        summoning = true;

                        this.spellPickerExpanded = true;

                    }
                },

                backToSpells: function () {

                    sounds.click.play();

                    this.levelPickerExpanded = false;

                    setTimeout(function () {

                        summoning = false;
                        this.chooseSpell();

                    }.bind(this), 350);
                },

                spellSelected: function (spellType) {

                    sounds.click.play();

                    this.currentSpellType = spellType;
                    curOp = this.operatorMap[spellType];

                    switch(this.currentSpellType) {
                        case 'fire':        particleColours = ['#BF0A2A', '#D82233', '#E52721', '#E94E14', '#F9B000'];  break;
                        case 'ice':         particleColours = ['#00A7E7', '#003F7D', '#0076B0', '#C1DFC4', '#91C8E5'];  break;
                        case 'lightning':   particleColours = ['#F9B000', '#FFE000', '#FFEDAA', '#F9BD95', '#F0821A'];  break;
                        case 'wind':        particleColours = ['#009640', '#6FBC85', '#699329', '#003F16', '#31B7BC'];  break;
                        case 'heal':        particleColours = ['#CA075B', '#EA516B', '#F39CA2', '#A873AF', '#FDD183'];  break;
                    }

                    this.spellPickerExpanded = false;

                    setTimeout(function() {

                        this.levelPickerExpanded = true;

                    }.bind(this), 100);

                    // twinkl.Utils.track(twinkl.Utils.eventNames.operationSelected, curOp);
                },

                channelSpell: function (difficulty) {

                    sounds.click.play();

                    this.currentDifficulty = difficulty;

                    this.levelPickerExpanded = false;

                    setTimeout(function () {

                        summoning = false;
                        this.chargeSpell();

                    }.bind(this), 100);

                    // twinkl.Utils.track(twinkl.Utils.eventNames.difficultySelected, difficulty);
                },

                chargeSpell: function () {

                    canAnswer = true;

                    this.question = nullQuestion;
                    this.userInput = '';
                    this.setStat('answeredThisCharge', []);

                    if((this.currentCharacter.name === 'Princess') || (this.currentCharacter.name === 'Math Magician')) {

                        // $('.dungeon-question-ability').fadeIn(500).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);

                    } else if(this.currentCharacter.name === "Elf" || this.currentCharacter.name === "Warlock") {

                        $('#dungeon-ability').fadeOut("fast");

                    }

                    this.zoomed = true;

                    setTimeout(function () {

                        this.casting = true;

                        characterAnimation.gotoAndStop('Charge');

                        if(testing) {
                            this.spellTimer = setInterval(this.castTimer, 10000);
                        }
                        else if((this.currentSpellType === 'fire' || this.currentSpellType === 'ice') && this.currentDifficulty === 'hard') {
                            this.spellTimer = setInterval(this.castTimer, 350);
                        }
                        else {
                            this.spellTimer = setInterval(this.castTimer, 200);
                        }

                        this.getQuestion();

                    }.bind(this), 500);
                },

                getQuestion: function () {

                    var questionConfig, elementIdx, elements = ['fire', 'ice', 'lightning', 'wind'], theOperations = ['+', '-', '*', '/'],
                        boxChar = '☐';
                        // boxChar = '☐&#xFE0E;';   // this forces browser to render as text not emojis, but also appears in tracking data ...

                    if(this.currentSpellType === 'heal') {
                        elementIdx = (Math.random() * elements.length)|0;

                        questionConfig = twinkl.Utils.randomFromArray(spellLevels[elements[elementIdx]][this.currentDifficulty]);

                        curOp = theOperations[elementIdx];
                    }
                    else {
                        // questionConfig = spellLevels[this.currentSpellType][this.currentDifficulty];
                        questionConfig = twinkl.Utils.randomFromArray(spellLevels[this.currentSpellType][this.currentDifficulty]);

                    }

                    // dynamically add the 'answers' prop by running the answer generating function
                    questionConfig.answers = typeof questionConfig.slice === 'undefined' ? [questionConfig.answersFunc()] : [questionConfig.answersFunc(questionConfig.slice)];

                    this.question.answer = questionConfig.answers[0];
                    questionConfig.operations = [curOp];

                    try {
                        this.question = twinkl.mathsGenerators.generateCalculationQuestion(questionConfig);
                    } catch(e) {
                        switch(this.currentSpellType) {
                            case 'fire':
                                this.question = {
                                    question: '10 + 90 = ' + boxChar,
                                    answer: 100,
                                    // aim: ?
                                };
                                break;
                            case 'ice':
                                this.question = {
                                    question: '110 - 10 = ' + boxChar,
                                    answer: 100,
                                    // aim: ?
                                };
                                break;
                            case 'lightning':
                                this.question = {
                                    question: '10 × 10 = ' + boxChar,
                                    answer: 100,
                                    aim: '10_times_table'
                                };
                                break;
                            case 'wind':
                                this.question = {
                                    question: '100 ÷ 10 = ' + boxChar,
                                    answer: 10,
                                    aim: '10_times_table'
                                };
                                break;
                        }
                    }

                    var regularQuestion = function (question) {
                        return Math.random() > 0.3 ? question + ' = ' + boxChar : boxChar + ' = ' + question; // TODO - all box char appear as ballot box https://stackoverflow.com/questions/32915485/how-to-prevent-unicode-characters-from-rendering-as-emoji-in-html-from-javascrip
                    };

                    if(this.getCurrentVictories() === 3 || this.getCurrentVictories() === 7) {

                        // special rules for boss and miniboss

                        var bossRoll = Math.random();
                        if(bossRoll < 0.2) {
                            // (mini)boss, swizzle the box
                            var questionBits = this.question.question.split(' '),
                                boxIndex = twinkl.Utils.randomFromArray([0, 2]),
                                originalAnswer = this.question.answer;

                            this.question.answer = parseInt(questionBits.splice(boxIndex, 1)); // splice returns array, yet this seems to work anyway :S
                            questionBits.splice(boxIndex, 0, boxChar);
                            this.question.question = questionBits.join(' ') + ' = ' + originalAnswer;
                        }
                        else if (bossRoll > 0.2 && bossRoll < 0.3 && (this.currentSpellType === 'lightning' || this.currentSpellType === 'wind')) {
                            // (mini)boss, associativity - only for multiplication and division, mid and upper levels
                            var questionBits = this.question.question.split(' ');
                            var randomFactor = twinkl.Utils.randomInt(2, 4);
                            if(this.currentSpellType === 'lightning') {
                                if(parseInt(questionBits[0]) * randomFactor <= 20 && this.question.answer * randomFactor <= 240) {
                                    questionBits[0] = parseInt(questionBits[0]) * randomFactor;
                                    this.question.answer = parseInt(this.question.answer) * randomFactor;
                                    this.question.question = questionBits.join(' ') + ' = ' + boxChar;
                                } else {
                                    this.question.question = regularQuestion(this.question.question);
                                }
                            } else {
                                // must be wind / division
                                if(parseInt(questionBits[0]) * randomFactor <= 240 && this.question.answer * randomFactor <= 20) {
                                    questionBits[0] = parseInt(questionBits[0]) * randomFactor;
                                    this.question.answer = parseInt(this.question.answer) * randomFactor;
                                    this.question.question = questionBits.join(' ') + ' = ' + boxChar;
                                } else {
                                    this.question.question = regularQuestion(this.question.question);
                                }
                            }
                        }
                        else {
                            this.question.question = regularQuestion(this.question.question);
                        }

                    } else {

                        // regular question

                        this.question.question = regularQuestion(this.question.question);

                    }

                    if(twinkl.Utils.canAutofocus()) document.getElementById("theText").focus();
                },

                castTimer: function () {

                    if(!this.timePaused) {

                        this.castingTime--;

                        if (this.castingTime <= 0) {

                            if(this.currentCharacter.name !== 'Elf') this.abilityUsed = true;

                            clearInterval(this.spellTimer);

                            this.trackEndOfRound();

                            if (this.currentSpellType === this.currentEnemy.weakness) {
                                this.setStat('spellPower', this.getStat('spellPower') * 1.5);
                                this.setStat('weaknessDiscovered', true);
                            } else if (this.currentSpellType === this.currentEnemy.resistance) {
                                this.setStat('spellPower', this.getStat('spellPower') / 1.5);
                                this.setStat('resistanceDiscovered', true);
                            }

                            this.launchSpell();
                        }
                    }
                },

                launchSpell: function () {

                    this.casting = false;
                    canAnswer = false;
                    if(testing) this.setStat('spellPower', 2);

                    var spellPower = this.getStat('spellPower');
                    this.modifyStat('spellsCast', 1);
                    if(spellPower > this.getLocationStat('mostPowerfulSpell'))
                        this.setLocationStat('mostPowerfulSpell', spellPower);

                    if(this.currentSpellType === this.currentEnemy.weakness) this.modifyStat('superEffectiveSpells', 1);

                    this.userInput = '';

                    characterAnimation.gotoAndStop('Attack');

                    this.zoomed = false;

                    sounds.spell_cast.play();

                    setTimeout(function () {

                        sounds['spell_' + this.currentSpellType].play();

                        var spellPosition = {
                            x: this.currentCharacter.spellX,
                            y: this.currentCharacter.spellY
                        };

                        var spellCanvas = document.querySelector('#dungeon-particle-holder canvas');

                        if(this.currentSpellType !== 'heal') {

                            createjs.Tween.get(spellPosition)
                                .to({x: 87, y: 50}, 1500, createjs.Ease.quintIn)
                                .call(this.dealDamage);

                        } else {
                            // Then it's a heal spell, don't animate anything
                            setTimeout(this.dealDamage, 1500);
                        }

                        partTimer = setInterval(function() {

                            // console.log(spellPosition.x * spellCanvas.width, spellPosition.y * spellCanvas.height)
                            this.spellParts(spellPosition.x * spellCanvas.width / 100, spellPosition.y * spellCanvas.height / 100);

                        }.bind(this), 10);

                    }.bind(this), 500);
                },

                spellParts: function (x, y) {
                    var randomness = particleColours[0] === '#FFFFFF' ? bossPartCounter : 1;
                    this.spawnParticles(x + twinkl.Utils.randomInt(-randomness, randomness), y + twinkl.Utils.randomInt(-randomness, randomness));
                    if(bossPartCounter > 1) bossPartCounter -= 1.5;
                },

                dealDamage: function () {

                    clearInterval(partTimer);

                    setTimeout(function() {

                        characterAnimation.gotoAndStop('Idle');

                    },500);

                    var canvasEl = $('#character-canvas');

                    var spellPower = this.getStat('spellPower');

                    if(this.currentSpellType !== 'heal') {

                        // regular attack

                        var mod = '';

                        var impact = 'explos';

                        // enemy flash

                        flashFilter.redOffset = 155;
                        flashFilter.greenOffset = 155;
                        flashFilter.blueOffset = 155;
                        enemyAnimation.filters = [
                            flashFilter
                        ];
                        enemyAnimation.cache(0, 0, 1280, 720);

                        setTimeout(function () {
                            enemyAnimation.filters = [];
                            enemyAnimation.updateCache();
                            enemyAnimation.uncache();
                        }, 100);

                        if (this.currentSpellType === this.currentEnemy.weakness) {

                            $('#dungeon-spell-impact').css({
                                'background-image': 'url(' + this.manifest.weakness.src + ')',
                            }).fadeIn(250).fadeOut(1750);

                            mod = '!';
                            impact = 'shatter';

                        } else if (this.currentSpellType === this.currentEnemy.resistance) {

                            $('#dungeon-spell-impact').css({
                                'background-image': 'url(' + this.manifest.resistance.src + ')',
                            }).fadeIn(250).fadeOut(1750);

                            mod = '...';
                            impact = 'thud';

                        }

                        $("#dungeon-spell-body").css({
                            top: '50%',
                            left: '25%'
                        });

                        sounds[impact].play();
                        sounds[this.currentEnemy.defendSound].play();

                        this.enemyStats.hp = Math.max(this.enemyStats.hp - spellPower, 0);

                        //this.spawnParticles(canvasEl.width() * 0.85, canvasEl.height() / 2);

                        $('#dungeon-spell-damage').css({
                            'top'  : '25%',
                            'right': '11%',
                            'left': 'auto'
                        }).text(Math.ceil(spellPower) + mod).show().animate({top: '10%'}, 1500, function () {
                            $('#dungeon-spell-damage').fadeOut('250');
                        });

                    } else {

                        // heal spell

                        this.setStat('hp', Math.min(this.getStat('hpMax'), this.getStat('hp') + spellPower));

                        this.spawnParticles(canvasEl.width() * 0.2, canvasEl.height() / 2);

                        $('#dungeon-spell-damage').css({
                            'top'  : '25%',
                            'right': '79%',
                            'left': 'auto'
                        }).text(Math.ceil(spellPower)).show().animate({top: '10%'}, 1500, function () {
                            $('#dungeon-spell-damage').fadeOut('250');
                        });
                    }

                    setTimeout(function () {
                        enemyAnimation.gotoAndStop('Attack');
                    }, 150);

                    if (this.enemyStats.hp <= 0) {

                        setTimeout(this.killEnemy, 2000);

                    } else {

                        if (this.currentCharacter.name === 'Elf' && !this.abilityUsed) {

                            this.abilityUsed = true;

                            $('#dungeon-ability').css({

                                'top'             : '20%',
                                'left'            : '23%',
                                'background-image': 'url(' + this.manifest.power_elf.src + ')'

                            }).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(1000);

                            this.setStat('spellPower', this.currentCharacter.spellStr);
                            this.castingTime = 100;

                            setTimeout(this.playerTurn, 1500);  // also cancels enemy animation

                        } else {

                            setTimeout(this.enemyTurn, 1500);
                        }
                    }
                },

                enemyTurn: function () {

                    var scope = this;

                    characterAnimation.gotoAndStop('Defend');

                    var spellEl = $('#dungeon-spell-damage'),
                        stressEl = $('#dungeon-stress');

                    // the zoom

                    this.zoomed = true;

                    // enemy attack slide

                    var damageDealt;

                    createjs.Tween.get(enemyAnimation).to({
                        x: -1200,
                        y: 300,
                        rotation: -9
                    }, 400, createjs.Ease.elasticInOut).call(function () {

                        // enemy.shake()

                        damageDealt = Math.ceil( this.currentEnemy.minAtk + (Math.random()*this.currentEnemy.maxAtk) );

                        // player.shake()

                        sounds[this.currentEnemy.attackSound].rate(1);
                        sounds[this.currentEnemy.attackSound].play();

                    }.bind(scope)).wait(600).to({
                        x: 0,
                        y: 0,
                        rotation: 0
                    }, 300, createjs.Ease.cubicOut).call(function () {

                        enemyAnimation.gotoAndStop('Idle');

                        scope.zoomed = false;

                        setTimeout(function() {

                            this.setStat('hp', (this.getStat('hp') - damageDealt));

                            spellEl.css({'top': '28%', 'right': 'auto', 'left': '19.5%'}).text(damageDealt).show().animate({top: '19%'}, 1500, function() {
                                spellEl.fadeOut('250');
                            });

                            stressEl.css({'top':'18%'}).show().animate({top: '5%'}, 1500, function() {
                                stressEl.fadeOut('250');
                            });

                            setTimeout(this.cleanup, 500);

                        }.bind(scope), 300);

                    });

                },

                useAbility: function () {
                    switch(this.currentCharacter.name) {
                        case 'Princess':
                            if(!this.abilityUsed) {

                                this.timePaused = true;
                                this.abilityUsed = true;
                                sounds.zawarudo.play();
                                if(twinkl.Utils.canAutofocus()) document.getElementById("theText").focus();
                                $('#dungeon-ability').fadeOut('fast');
                                createjs.Ticker.removeEventListener('tick', renderCanvases);
                                // var pausedQuestion = this.question;
                                // twinkl.Utils.track(twinkl.Utils.eventNames.questionPaused, pausedQuestion);

                            }
                            break;
                        case 'Warlock':

                            sounds.deathbell.play();

                            $('#dungeon-gameHolder').addClass('allgrey');
                            this.enemyStats.hp = 0;
                            summoning = false;
                            $('#dungeon-ability').fadeOut('fast');

                            setTimeout(this.killEnemy, 2500);

                            this.spellPickerExpanded = false;

                            break;
                        case 'Math Magician':
                            // var skippedQuestion = this.question;
                            // twinkl.Utils.track(twinkl.Utils.eventNames.questionSkipped, skippedQuestion);
                            this.getQuestion();
                            break;
                    }
                },

                cleanup: function (newEnemy) {

                    newEnemy = newEnemy || false;

                    this.setStat('spellPower', this.currentCharacter.spellStr);
                    this.castingTime = 100;
                    this.abilityUsed = false;

                    if(newEnemy) {
                        this.generateEnemy();
                    }
                    else if(this.getStat('hp') <= 0) {
                        this.dialogueOpen = true;
                        this.loadSoundThenPlay(this.currentLevel.victoryDialogueSound);
                        this.fadeMusicDown(this.currentLevel.key + '_music', 800);
                        this.fadeMusicDown('boss_music', 800);
                        this.fadeMusicDown('miniboss_music', 800);
                        setTimeout(function () {
                            this.victory(false);
                            this.playMusic('defeat_music');
                        }.bind(this), 3000);
                    }
                    else {
                        setTimeout(this.playerTurn, 200);
                    }

                    characterAnimation.gotoAndStop('Idle');

                    $('.dungeon-friend').removeClass('exiting');

                },

                playerTurn: function () {

                    // bossAttack = false;

                    enemyAnimation.gotoAndStop('Idle');

                    setTimeout(this.chooseSpell, 100);

                    if(this.enemyStats.hp > 0 && this.enemyStats.hp <= (this.enemyStats.hpMax * 0.1) && this.currentCharacter.name === 'Warlock') {
                        $('#dungeon-ability').show().css({
                            'height': '14%',
                            'width': '7%',
                            'top': '20%',
                            'left': '81%',
                            'background-image': 'url('+ this.manifest.power_warlock.src +')'
                        });
                    }

                },

                killEnemy: function () {

                    twinkl.Utils.track(twinkl.Utils.eventNames.roundWon);

                    var scope = this;

                    this.setLocationStat('victories', (this.getLocationStat('victories') + 1));

                    this.setStat('weaknessDiscovered', false);
                    this.setStat('resistanceDiscovered', false);

                    sounds[this.currentEnemy.attackSound].rate(0.75);
                    sounds[this.currentEnemy.attackSound].play();

                    this.setLocationStat('currentEnemy', null);

                    $('.enemy-HP').fadeOut(100);
                    $('.dungeon-player-health.enemy').fadeOut(100);
                    $('.enemy-name-text').fadeOut(100);

                    $('#dungeon-gameHolder').removeClass('allgrey');

                    sounds.transform.play();

                    if(this.getCurrentVictories() < 8) {

                        // change music based on victories stage

                        if(this.getCurrentVictories() === 3) {

                            this.fadeMusicDown(this.currentLevel.key+'_music', 3000);

                            setTimeout(function () {

                                this.loadSoundThenPlay('miniboss_music');

                            }.bind(this), 2500);

                        } else if(this.getCurrentVictories() === 7) {

                            this.fadeMusicDown(this.currentLevel.key+'_music', 3000);

                            setTimeout(function () {

                                this.loadSoundThenPlay('boss_music');

                            }.bind(this), 2500);

                        } else if(this.getCurrentVictories() === 4) {

                            this.fadeMusicDown('miniboss_music', 3000);

                            this.dialogueOpen = true;

                            setTimeout(function () {

                                this.loadSoundThenPlay(this.currentLevel.minibossDialogueSound);

                            }.bind(this), 500);

                            setTimeout(function () {

                                this.loadSoundThenPlay(this.currentLevel.key+'_music');

                            }.bind(this), 3000);
                        }

                        // standard death sequence

                        transformAnimation.children[0].gotoAndPlay(0);

                        createjs.Tween.get(enemyAnimation).to({alpha: 0}, 300);

                        setTimeout(function () {

                            var friend = $('#best-friend');

                            friend.css('background-image', 'url(' + manifest['friend_' + scope.currentEnemy.animal].src + ')');

                            friend.addClass('exiting');

                            sounds.pop.play();

                            scope.loadSoundThenPlay(critterSoundMap[scope.currentEnemy.animal]);

                            setTimeout(function() {

                                scope.cleanup(true);    // cleanup and give us new enemy

                            }, 2000);

                        }, 3100);

                    } else {

                        // boss death sequence

                        this.dialogueOpen = true;

                        this.setLocationStat('conqueredBy', this.currentCharacter.key);

                        this.fadeMusicDown('boss_music', 2000);

                        // transformAnimation.children[0].gotoAndPlay(0);

                        particleColours = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'];
                        var canvasEl = document.querySelector('#dungeon-particle-holder canvas');
                        bossPartCounter = 150;

                        partTimer = setInterval(function() {

                            this.spellParts(canvasEl.width * 0.85, canvasEl.height / 2);

                        }.bind(this), 10);

                        setTimeout(function () {

                            this.loadSoundThenPlay(this.currentLevel.defeatDialogueSound);

                        }.bind(this), 1000);

                        setTimeout(function() {

                            // fade out enemy

                            clearInterval(partTimer);
                            scope.spawnParticles(canvasEl.width * 0.85, canvasEl.height / 2);
                            sounds.boss_explos.play();
                            stage.removeChild(enemyAnimation);

                            setTimeout(function() {

                                scope.playMusic('end_music');

                                characterAnimation.gotoAndStop('Victory');

                                setTimeout(function() {

                                    scope.victory(true);    // winner winner

                                    scope.dialogueOpen = false;

                                },4000);

                            },2000);

                        }, 2000);

                    }

                },

                victory: function (winnerWinner) {

                    //if(winnerWinner) chickenDinner = true;

                    if(winnerWinner) {
                        this.victoryText = 'Victory!';
                        this.currentBackground = 'uncorrupted';
                        var completedLevel = this.currentLevel.name;
                        twinkl.Utils.track(twinkl.Utils.eventNames.levelComplete, completedLevel);
                        this.playTrumpets();
                    } else {
                        this.victoryText = 'Defeat!';
                        this.currentBackground = 'corrupt';
                        twinkl.Utils.track(twinkl.Utils.eventNames.roundLost);
                        twinkl.Utils.track(twinkl.Utils.eventNames.gameOver);
                    }

                    this.stage = 'stats';

                    if(parallax && typeof parallax.enable === 'function') parallax.enable();

                    var score = Math.round(this.getLocationStat('questionsCorrect') + this.getLocationStat('spellsCast') + this.getLocationStat('mostPowerfulSpell') + this.getLocationStat('superEffectiveSpells'));

                    twinkl.Utils.track(twinkl.Utils.eventNames.score, score);

                    if(this.allLevelsComplete) {

                        // special case - prep for the final victory screen

                        // currentLevel is used to show the stats per zone in the hall of legends
                        this.currentLevel = null;

                        // victoryStage from zone revisit is reused, add the current char's victory anim and the trophy
                        victoryStage.removeAllChildren();
                        trophyAnimation = undefined;
                        trophyAnimation = new animationsLib['Trophy']();
                        trophyAnimation.scaleX = 1.5;
                        trophyAnimation.scaleY = 1.5;
                        victoryStage.addChild(trophyAnimation);
                        victoryStage.addChild(characterAnimation);
                        characterAnimation.x = 250;
                        characterAnimation.gotoAndStop('Victory');
                    }

                },

                playAgain: function () {

                    if(this.allLevelsComplete) {

                        // replay the level !

                        this.chooseLevel(this.currentLevel.key, true);
                        this.fadeMusicDown('end_music', 800);

                    } else {

                        // ... or back to map via global close
                        this.contextualClose();

                    }

                },

                playTrumpets: function () {

                    this.loadSoundThenPlay('trumpets');

                    this.trumpetsSounding = true;

                    setTimeout(function () {

                        this.trumpetsSounding = false;

                    }.bind(this), 10000);

                },

                trackEndOfRound: function () {
                    // todo - TURN TRACKING BACK ON !
                    // twinkl.Utils.track('complex', JSON.stringify({
                    //     questions: this.getStat('answeredThisCharge'),
                    //     level: this.currentLevel.name,
                    //     round: (this.getLocationStat('victories') + 1),
                    //     character: this.currentCharacter.fluff
                    // }));
                },

                modifyStat: function (name, amount) {
                    this.playerStats[this.currentLevel.key][name] += amount;
                },

                setStat: function (name, value) {
                    this.playerStats[name] = value;
                },

                setLocationStat: function (name, value) {
                    this.playerStats[this.currentLevel.key][name] = value;
                },

                getStat: function (name) {
                    return this.playerStats[name];
                },

                getLocationStat: function (name) {
                    return this.playerStats[this.currentLevel.key][name];
                },

                getCurrentVictories: function () {
                    return this.currentLevel === null ? 0 : this.playerStats[this.currentLevel.key].victories;
                },

                getContentDescription: function(difficulty) {
                    return contentDescriptions[this.currentSpellType][difficulty];
                },

                hideDialogueBanner: function () {
                    this.dialogueOpen = false;
                },

                initialiseParticleSketch: function () {

                    // ----------------------------------------
                    // Particle
                    // ----------------------------------------

                    function Particle( x, y, radius ) {
                        this.init( x, y, radius );
                    }

                    Particle.prototype = {

                        init: function( x, y, radius ) {

                            this.alive = true;

                            this.radius = radius || 10;
                            this.wander = 0.15;
                            this.theta = random( TWO_PI );
                            this.drag = 0.92;
                            this.color = '#fff';

                            this.x = x || 0.0;
                            this.y = y || 0.0;

                            this.vx = 0.0;
                            this.vy = 0.0;
                        },

                        move: function() {

                            this.x += this.vx;
                            this.y += this.vy;

                            this.vx *= this.drag;
                            this.vy *= this.drag;

                            this.theta += random( -0.5, 0.5 ) * this.wander;
                            this.vx += sin( this.theta ) * 0.1;
                            this.vy += cos( this.theta ) * 0.1;

                            // this.radius *= 0.96;
                            this.radius *= 0.94;
                            this.alive = this.radius > 0.5;
                        },

                        draw: function( ctx ) {

                            ctx.beginPath();
                            ctx.arc( this.x, this.y, this.radius, 0, TWO_PI );
                            ctx.fillStyle = this.color;
                            ctx.fill();
                        }
                    };

                    // ----------------------------------------
                    // Particle effect
                    // ----------------------------------------

                    var MAX_PARTICLES = 280;

                    var particles = [];
                    var pool = [];

                    particleColours = [];

                    particleSystem = Sketch.create({
                        container: document.getElementById( 'dungeon-particle-holder' ),
                        retina: 'auto'
                    });

                    particleSystem.spawn = function( x, y ) {

                        var particle, theta, force;

                        if ( particles.length >= MAX_PARTICLES )
                            pool.push( particles.shift() );

                        particle = pool.length ? pool.pop() : new Particle();
                        particle.init( x, y, random( 5, 40 ) );

                        particle.wander = random( 0.5, 2.0 );
                        particle.color = random( particleColours );
                        particle.drag = random( 0.9, 0.99 );

                        theta = random( TWO_PI );
                        force = random( 2, 8 );

                        particle.vx = sin( theta ) * force;
                        particle.vy = cos( theta ) * force;

                        particles.push( particle );
                    };

                    particleSystem.update = function() {

                        var i, particle;

                        for ( i = particles.length - 1; i >= 0; i-- ) {

                            particle = particles[i];

                            if ( particle.alive ) particle.move();
                            else pool.push( particles.splice( i, 1 )[0] );
                        }
                    };

                    particleSystem.draw = function() {

                        particleSystem.clearRect(0, 0, particleSystem.canvas.width * 2, particleSystem.canvas.height * 2);

                        particleSystem.globalCompositeOperation  = 'lighter';

                        for ( var i = particles.length - 1; i >= 0; i-- ) {
                            particles[i].draw( particleSystem );
                        }
                    };
                },
                spawnParticles: function(x, y, colours) {
                    for (var i = 0; i < 200; i++) particleSystem.spawn( x, y );
                },
                loadSound: function (key, callback) {
                    if(!(sounds[key] instanceof Howl)) {
                        var isMusic = key.includes('_music');
                        sounds[key] = new Howl({src: [manifest[key].src], volume: isMusic ? MUSIC_VOLUME : 1.0, loop: isMusic});
                        if(typeof callback === 'function') sounds[key].once('load', function() {
                            callback(sounds[key]);
                        });
                    }
                },
                loadSoundThenPlay: function (key) {
                    var isMusic = key.includes('_music');
                    if(!(sounds[key] instanceof Howl)) {
                        this.loadSound(key, function() {
                            if(isMusic) this.playMusic(key);
                            else sounds[key].play();
                        }.bind(this));
                    } else {
                        if(isMusic) this.playMusic(key);
                        else sounds[key].play();
                    }
                },
                playMusic: function (key) {
                    sounds[key].volume(MUSIC_VOLUME);
                    if(sounds[key].playing()) sounds[key].seek(0);
                    else sounds[key].play();
                },
                fadeMusicDown: function (key, duration) {
                    sounds[key].fade(MUSIC_VOLUME, 0, duration);
                },
                fadeMusicUp: function (key, duration) {
                    sounds[key].fade(0, MUSIC_VOLUME, duration);
                }
            },
            computed: {
                isQuestionAbility: function () {
                    return (this.currentCharacter !== null && this.currentCharacter.questionAbility !== null);
                },
                allLevelsComplete: function () {
                    var scope = this;
                    var levelNames = Object.keys(this.levels);
                    return levelNames.every(function (levelName) {
                        return scope.playerStats[levelName].conqueredBy.length > 0;
                    });
                },
                bossDialogue: function () {
                    var dialogue = '[Muted grumbling]';
                    if(this.currentLevel === null) return dialogue;
                    var victories = this.playerStats[this.currentLevel.key].victories;
                    if(this.playerStats.hp <= 0) dialogue = this.currentLevel.victoryDialogue;
                    else if(victories === 0) dialogue = this.currentLevel.startDialogue;
                    else if(victories === 4) dialogue = this.currentLevel.minibossDialogue;
                    else if(victories === 8) dialogue = this.currentLevel.defeatDialogue;
                    return dialogue;
                }
            },
            mounted: function () {

                this.setup();

                if(twinkl.Utils.isDesktopDevice() || twinkl.Utils.siteInDev()) {
                    parallax = new Parallax(document.getElementById('parallax-group'));
                    parallax.friction(0.05, 0.05);
                }

                Vue.nextTick(function () {

                    this.preloaded = true;
                    twinkl.Utils.removeClass(document.getElementById('preload-div'), 'loading');

                }.bind(this));

            }
        });
        
    };

    twinkl.createArithmagic = createArithmagic;

})(TwinklGame);