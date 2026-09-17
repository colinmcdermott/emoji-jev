// Emoji vocabulary for the keystroke demo. Keys are what Jev chooses between;
// the description is the rubric text it reads. Keep under 255 options.

export type Emoji = { key: string; char: string; desc: string };

const raw = `
grinning|😀|happy, cheerful, good news
beaming|😁|delighted, proud, big smile
joy_tears|😂|laughing hard, hilarious, can't stop laughing
rofl|🤣|rolling on the floor laughing, absurdly funny
smiling_eyes|😊|warm, content, pleased
halo|😇|innocent, angelic, being good
heart_eyes|😍|adoration, love at first sight, gorgeous
star_struck|🤩|amazed, starstruck, wow
kiss|😘|affection, blowing a kiss, love you
yum|😋|delicious food, tasty, savouring
tongue_wink|😜|playful, silly, teasing
zany|🤪|chaotic, goofy, unhinged fun
money_mouth|🤑|money, rich, payday, greed
hugging|🤗|hug, comfort, welcome, support
shushing|🤫|secret, quiet, don't tell
thinking|🤔|pondering, unsure, considering
zipper_mouth|🤐|keeping quiet, lips sealed
raised_eyebrow|🤨|suspicious, skeptical, doubtful
neutral|😐|indifferent, meh, blank
expressionless|😑|unimpressed, done, deadpan
smirk|😏|smug, flirty, knowing
unamused|😒|annoyed, unimpressed, bored
eye_roll|🙄|exasperated, ugh, eye roll
grimace|😬|awkward, cringe, yikes
lying|🤥|lying, dishonest, fib
relieved|😌|relieved, calm, peaceful
pensive|😔|sad, wistful, disappointed
sleepy|😪|sleepy, exhausted, tired
drooling|🤤|craving, drooling, want it
sleeping|😴|asleep, bedtime, snoring
mask|😷|sick, ill, flu, contagious
thermometer|🤒|fever, unwell
head_bandage|🤕|injured, hurt, accident
nauseated|🤢|disgusted, gross, nauseous
vomiting|🤮|revolted, sick to stomach
sneezing|🤧|cold, sneeze, allergies
hot|🥵|too hot, heatwave, sweating
cold|🥶|freezing, cold, shivering
woozy|🥴|drunk, dizzy, tipsy
dizzy_face|😵|dizzy, overwhelmed, knocked out
exploding_head|🤯|mind blown, shocking revelation
cowboy|🤠|yeehaw, western, adventurous
partying|🥳|party, birthday, celebration
sunglasses|😎|cool, confident, effortless
nerd|🤓|nerdy, studying, technical detail
monocle|🧐|inspecting, scrutinising, hmm
confused|😕|confused, unsure what happened
worried|😟|worried, concerned, anxious
frowning|🙁|slightly sad, let down
open_mouth|😮|surprised, oh, whoa
astonished|😲|astonished, shocked, gasp
flushed|😳|embarrassed, blushing, caught out
pleading|🥺|please, begging, puppy eyes, touching
fearful|😨|scared, frightened, fear
anxious_sweat|😰|nervous, stressed, cold sweat
crying|😢|crying, sad, tearful
loudly_crying|😭|sobbing, devastated, ugly crying
screaming|😱|screaming in fear or shock, horror
persevering|😣|straining, enduring, effort
disappointed|😞|disappointed, let down, dejected
weary|😩|weary, fed up, exhausted, ugh
tired_face|😫|tired, over it, can't anymore
yawning|🥱|bored, yawning, dull
triumph|😤|frustrated determination, huffing, fed up
angry|😠|angry, mad, irritated
rage|😡|furious, enraged, livid
cursing|🤬|swearing, extremely angry
smiling_imp|😈|mischievous, devilish, up to no good
skull|💀|dead, dying of laughter, or literally dead
poop|💩|crap, nonsense, bad situation
clown|🤡|clown, foolish, embarrassing behaviour
ghost|👻|spooky, ghosted, halloween
alien|👽|alien, strange, out of this world
robot|🤖|robot, AI, automation
heart|❤️|love, deep affection
broken_heart|💔|heartbreak, breakup, grief
fire|🔥|fire, amazing, lit, hot take, literal fire
sparkles|✨|magic, sparkle, special, new and shiny
hundred|💯|100 percent, agree completely, perfect score
boom|💥|explosion, crash, collision, impact
sweat_drops|💦|sweat, water splash, effort
zzz|💤|sleep, boring, tired
eyes|👀|watching, looking, suspicious interest, gossip
thumbs_up|👍|approval, ok, good job
thumbs_down|👎|disapproval, bad, no
clap|👏|applause, congratulations, well done
raised_hands|🙌|hooray, praise, celebration
pray|🙏|please, thank you, hoping, grateful
handshake|🤝|deal, agreement, partnership
muscle|💪|strength, effort, gym, you can do it
wave|👋|hello, goodbye, waving
facepalm|🤦|facepalm, disbelief at stupidity
shrug|🤷|don't know, whatever, shrug
salute|🫡|respect, yes sir, acknowledged
crossed_fingers|🤞|hoping, good luck, fingers crossed
ok_hand|👌|perfect, okay, chef's kiss
peace|✌️|peace, victory, bye
pinched|🤌|italian gesture, what do you want, chef's kiss
brain|🧠|brain, smart, intelligence, thinking
birthday_cake|🎂|birthday, cake
party_popper|🎉|celebration, congratulations, success
confetti|🎊|confetti, festive
balloon|🎈|balloon, party, kids
gift|🎁|present, gift, surprise
trophy|🏆|winner, champion, achievement
medal|🥇|first place, gold medal
rocket|🚀|launch, growth, to the moon, shipping
chart_up|📈|growth, stocks up, metrics rising
chart_down|📉|decline, losses, metrics falling
money_bag|💰|money, wealth, cash
money_wings|💸|money flying away, expensive, spending
credit_card|💳|payment, card, purchase
briefcase|💼|work, business, job
laptop|💻|computer, coding, work on laptop
bug|🐛|software bug, insect
wrench|🔧|fixing, repair, tools
gear|⚙️|settings, machinery, engineering
hourglass|⏳|waiting, time running out, patience
alarm_clock|⏰|alarm, wake up, deadline
calendar|📅|date, schedule, appointment
memo|📝|note, writing, to-do
books|📚|studying, reading, school, exams
graduation|🎓|graduation, degree, exam passed
airplane|✈️|flight, travel, airport
car|🚗|car, driving, road
train|🚆|train, commute, rail
bike|🚲|cycling, bike
house|🏠|home, house, moving in
hospital|🏥|hospital, medical, emergency
beach|🏖️|beach, holiday, vacation
mountain|🏔️|mountain, hiking, snow
sun|☀️|sunny, warm weather
rain_cloud|🌧️|rain, wet weather, gloomy
snowflake|❄️|snow, winter, cold
rainbow|🌈|rainbow, hope, pride
lightning|⚡|electricity, fast, energy, power outage
tornado|🌪️|storm, chaos, disaster
pizza|🍕|pizza, takeaway, food
burger|🍔|burger, fast food
coffee|☕|coffee, morning, caffeine
beer|🍺|beer, pub, drinks
wine|🍷|wine, dinner, classy drink
cake_slice|🍰|dessert, sweet treat
salad|🥗|healthy eating, diet
dog|🐶|dog, puppy, pet
cat|🐱|cat, kitten, pet
baby|👶|baby, newborn, pregnancy
family|👨‍👩‍👧|family, parents, kids
couple_heart|💑|couple, romance, relationship
ring|💍|engagement, wedding, proposal
soccer|⚽|football, soccer, match
basketball|🏀|basketball
running|🏃|running, exercise, hurry
weightlifting|🏋️|gym, weights, workout
music|🎵|music, song, singing
guitar|🎸|guitar, rock, band
game_controller|🎮|video games, gaming
movie|🎬|film, cinema, movie
tv|📺|television, streaming, show
phone|📱|phone, text message, mobile
email|📧|email, inbox
package|📦|delivery, parcel, shipping
shopping|🛍️|shopping, retail, bought stuff
lock|🔒|security, locked, private
key|🔑|key, access, solution
police|🚔|police, law enforcement
warning|⚠️|warning, caution, danger
check_mark|✅|done, complete, confirmed
cross_mark|❌|wrong, failed, no
question|❓|question, confused, what
exclamation|❗|important, attention, emphasis
red_flag|🚩|red flag, warning sign in a relationship
white_flag|🏳️|surrender, giving up
earth|🌍|world, global, planet, environment
moon|🌙|night, moon, late
star|⭐|star, favourite, rating
crown|👑|royalty, king or queen, boss
gem|💎|valuable, gem, diamond hands
eggplant|🍆|suggestive, eggplant, innuendo
sweat_smile|😅|nervous laugh, phew, awkward relief
upside_down|🙃|wry, ironic, this is fine, quietly losing it
smiling_tear|🥲|bittersweet, happy but sad, touched
melting|🫠|melting, overwhelmed, embarrassed, dying inside
holding_back_tears|🥹|moved, grateful, about to cry from emotion
heart_hands|🫶|love and gratitude, appreciation
hugging_people|🫂|comfort, support, condolences
see_no_evil|🙈|embarrassed, can't look, cheeky
two_hearts|💕|affection, cute love
sparkling_heart|💖|adoration, glowing love
blue_heart|💙|loyalty, calm love, team colours
black_heart|🖤|dark humour, edgy, grief
white_heart|🤍|pure, gentle, in memory
growing_heart|💗|feelings growing, warmth
clinking_beers|🍻|cheers, celebrating with drinks, pub night
champagne_glasses|🥂|toast, celebration, congratulations
champagne|🍾|popping champagne, big win
musical_notes|🎶|music playing, humming, vibes
four_leaf_clover|🍀|luck, good luck wish
cherry_blossom|🌸|spring, pretty, delicate
sunflower|🌻|sunny mood, warmth, garden
wave_water|🌊|ocean, surfing, big wave of things
bell|🔔|notification, reminder, alert
pill|💊|medication, pharmacy, health
yoga|🧘|meditation, calm, mindfulness
bed|🛌|going to bed, sleeping in, sick day
siren|🚨|emergency, alert, urgent warning
bullseye|🎯|on target, goal achieved, precisely right
megaphone|📣|announcement, shout out, promotion
receipt|🧾|receipt, bill, expenses
bank|🏦|bank, savings, loan
dollar_bills|💵|cash, dollars, paid
coin|🪙|coin, crypto, small change
slot_machine|🎰|gambling, jackpot, risky bet
bar_chart|📊|statistics, report, data
technologist|🧑‍💻|coding, developer, working on computer
hammer_wrench|🛠️|building, tools, under construction, DIY
construction|🚧|work in progress, roadworks, not ready yet
checkered_flag|🏁|finished, race over, done
christmas_tree|🎄|christmas, holidays, december
jack_o_lantern|🎃|halloween, spooky season
snake|🐍|snake, python programming, sneaky
butterfly|🦋|transformation, butterflies in stomach, beauty
bee|🐝|bee, busy, honey
chicken|🐔|chicken, coward, poultry
pig|🐷|pig, greedy, farm
lion|🦁|lion, brave, leo
unicorn|🦄|unicorn, magical, rare startup
turtle|🐢|slow, patient, turtle
apple|🍎|apple, healthy snack, teacher
noodles|🍜|noodles, ramen, comfort food
sushi|🍣|sushi, japanese food
doughnut|🍩|doughnut, treat, snack
avocado|🥑|avocado, brunch, millennial
chocolate|🍫|chocolate, craving, comfort
cupcake|🧁|cupcake, baking, sweet
ice_cream|🍦|ice cream, summer treat
taxi|🚕|taxi, ride, getting a cab
bus|🚌|bus, public transport, school bus
shopping_cart|🛒|shopping cart, groceries, checkout
headphones|🎧|listening, podcast, music, focus
microphone|🎤|singing, karaoke, speaking, mic drop
camera|📷|photo, photography, say cheese
battery|🔋|battery, charged, energy level
signal|📶|wifi, signal, connection
broom|🧹|cleaning, tidying, sweeping
bathtub|🛁|bath, relaxing, self care
luggage|🧳|packing, trip, travel
tennis|🎾|tennis, match
football_american|🏈|american football, NFL
cycling|🚴|cycling, bike ride
swimming|🏊|swimming, pool, swim
climbing|🧗|climbing, bouldering, challenge
golf|⛳|golf, golfing
skiing|🎿|skiing, ski trip, snow sports
`.trim();

export const EMOJIS: Emoji[] = raw
  .split('\n')
  .map((line) => line.split('|'))
  .filter((p) => p.length === 3)
  .map(([key, char, desc]) => ({ key: key.trim(), char: char.trim(), desc: desc.trim() }));

export const EMOJI_BY_KEY = Object.fromEntries(EMOJIS.map((e) => [e.key, e]));

export const MOOD_LEVELS = ['devastated', 'down', 'neutral', 'upbeat', 'ecstatic'] as const;
export const URGENCY_LEVELS = ['no rush', 'soon', 'right now'] as const;

// The most common emojis, used for the smallest set. The medium set adds the
// next most useful ones in list order; the full set is everything.
const CORE_KEYS = [
  'grinning', 'joy_tears', 'rofl', 'smiling_eyes', 'heart_eyes', 'star_struck', 'kiss', 'yum', 'tongue_wink', 'hugging',
  'thinking', 'raised_eyebrow', 'neutral', 'smirk', 'unamused', 'eye_roll', 'grimace', 'relieved', 'pensive', 'sleeping',
  'mask', 'exploding_head', 'partying', 'sunglasses', 'nerd', 'confused', 'worried', 'flushed', 'pleading', 'fearful',
  'anxious_sweat', 'crying', 'loudly_crying', 'screaming', 'disappointed', 'weary', 'tired_face', 'yawning', 'angry', 'rage',
  'cursing', 'smiling_imp', 'skull', 'clown', 'sweat_smile', 'upside_down', 'smiling_tear', 'melting', 'holding_back_tears', 'heart',
  'broken_heart', 'fire', 'sparkles', 'hundred', 'eyes', 'thumbs_up', 'clap', 'raised_hands', 'pray', 'facepalm',
  'shrug', 'muscle', 'party_popper', 'rocket',
];

export const SIZES = { small: 64, medium: 128, full: EMOJIS.length } as const;
export type Size = keyof typeof SIZES;

export function emojiSet(size: Size): Emoji[] {
  if (size === 'full') return EMOJIS;
  const core = new Set(CORE_KEYS);
  const picked = EMOJIS.filter((e) => core.has(e.key));
  if (size === 'small') return picked;
  for (const e of EMOJIS) {
    if (picked.length >= SIZES.medium) break;
    if (!core.has(e.key)) picked.push(e);
  }
  return picked;
}

export function buildQuestions(size: Size = 'full') {
  return {
    emoji: {
      type: 'choice' as const,
      instructions: 'Pick the single emoji a person would most naturally add to this message.',
      criteria: Object.fromEntries(emojiSet(size).map((e) => [e.key, `${e.char} ${e.desc}`])),
    },
    mood: {
      type: 'score' as const,
      instructions: 'How does the writer feel?',
      criteria: [...MOOD_LEVELS],
    },
    urgency: {
      type: 'score' as const,
      instructions: 'How urgently does the writer need something to happen?',
      criteria: [...URGENCY_LEVELS],
    },
    sarcasm: {
      type: 'boolean' as const,
      instructions: 'Is the writer being sarcastic or ironic?',
    },
    joke: {
      type: 'boolean' as const,
      instructions: 'Is the writer trying to be funny?',
    },
  };
}

export type ReactResponse = {
  via: 'typesafe' | 'gateway';
  modelId?: string;
  emoji: { choice: string; probabilities: Record<string, number>; confidence?: number };
  mood: { score: number; probabilities: Record<string, number> };
  urgency: { score: number; probabilities: Record<string, number> };
  sarcasm: number;
  joke: number;
  options: number;
  usage: { inputTokens: number; outputTokens: number };
  costUsd: number;
  timing: { serverMs: number; providerMs?: number; modelMs?: number };
};

export const PROMPTS = [
  'just got promoted!!',
  'flight cancelled. again. third time this month',
  "oh great, another meeting that could've been an email",
  'the cat knocked the plant over at 3am',
  "we're having a baby",
  'shipped the feature and prod is on fire',
  'ran my first 10k this morning',
  'my landlord just raised the rent by 20%',
  'can someone PLEASE fix the login page, customers are locked out',
  'brunch was avocado toast and three mimosas',
  'packing for the ski trip and I cannot find my passport',
  'finally paid off the car',
  'the wifi has been down all day and I have a deadline',
  'she said yes!!!',
  'dog ate my AirPods',
  'wow, love being cc’d on 40 emails about the office fridge',
  'first day at the new job tomorrow, bit nervous',
  'three hours of sleep and a 9am pitch',
  'my sourdough finally rose',
  'tell me why the tax return took six hours',
  "grandad's 90th birthday this weekend",
  'lost my wallet on the train',
  'the kids are asleep and the house is silent',
  'won the pub quiz by one point',
  'snowed in, no work, hot chocolate',
  'my code passed all the tests on the first try',
  'someone parked across my driveway again',
  'listening to the new album on repeat',
  'nailed the interview, waiting to hear back',
  'the pizza place got my order wrong for the third time',
  "it's 30 degrees and the office aircon is broken",
  'just booked two weeks in Portugal',
  'sure, I would LOVE to work this weekend',
  'my team lost in the last minute',
  'the doctor says it is just a cold',
  'found twenty quid in an old coat',
  'car failed its MOT, again',
  'planted tomatoes, hoping for the best',
  'no notes. perfect gig.',
  'is it too early for a glass of wine',
];

export const PROMPTS_SHOWN = 8;

/** A random subset of the prompt pool, in random order. */
export function pickPrompts(n = PROMPTS_SHOWN): string[] {
  const pool = [...PROMPTS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    ;[pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}
