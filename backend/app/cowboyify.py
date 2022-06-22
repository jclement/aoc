import random
import math

def cowboyify(inputName):

  def clean_list(l):
      out = []
      for item in l:
          item = item.strip()
          if len(item) > 0:
              out.append(item)
      return out

  prefixes = """Old
  Young
  Buckshot
  Dead-eye
  Eagle-eyed
  One-eyed
  Red
  Silver Dollar
  Rootin-Tootin
  Silver Spurs
  Granite Tooth
  Curly
  Ten Paces
  Screechin'
  Wildcat
  Saddle Sores
  Cactus
  Ditchwater
  Smoky
  Mad
  Huckleberry
  Scrawny
  Rawhide
  Hook Nose
  Ruthless
  Six Shooters
  Rabbit's Foot
  Captain
  Rusty
  Rowdy
  Wily
  Toothless
  Fast Feet
  Twinkle Eyes
  Iron Gut
  Ace of Clubs
  Diamonds
  Quick Draw
  Poker Face
  Five Aces
  Royal Flush
  High Card
  Mad Dog
  Wild
  Buffalo
  Bad
  Ropin'
  Texas
  Bronco
  Ranger
  Buckaroo
  Trick Shot
  Thunderin'
  Steely-Eyed""".split('\n')

  suffixes = """Slim
  The Rustler
  The Hellion
  The Outlaw
  The Rattler
  The Kid
  The Drifter
  The Horse Thief
  Scruggs
  Dolarhyde
  The Coward
  The Creep
  The Robber
  Esquire
  The Liar
  The Blacksmith
  The Duke
  The Drunk
  Three Thumbs
  The Jackal
  The Card Counter
  The Card Shark
  The Cheat
  The Boss
  The Deserter
  The Giant
  The Southpaw
  The Ranger""".split('\n')

  suffixCount = len(suffixes)
  prefixCount = len(prefixes)
  prefix = lambda: prefixes[math.floor(random.random() * prefixCount)].strip()
  suffix = lambda: suffixes[math.floor(random.random() * suffixCount)].strip()
  rand = lambda: random.random()
  quoteChar = '"'

  def jamTitle(firstName, lastName, title):
    if rand() < 0.3:
        return f"{firstName} {lastName} {title}"
    else:
        return f"{firstName} {quoteChar}{title}{quoteChar} {lastName}"

  def splitMiddle(s):
    splits = clean_list(s.replace('\s+', ' ').split(' '))
    if len(splits) > 1:
      return {
        "lastName": splits.pop(),
        "firstName": ' '.join(splits),
      }
    return { "firstName": s.strip(), "lastName": None }

  def middleName(nameSplit):
    if nameSplit["lastName"]:
      return jamTitle(nameSplit["firstName"], nameSplit["lastName"], suffix())
    return nameSplit["firstName"] + ' ' + suffix()

  def cowboyName(name):
    nameSplit = splitMiddle(name)

    if nameSplit["lastName"] and rand() < 0.3:
      return f"{nameSplit['firstName']} {quoteChar}{prefix()}{quoteChar} {nameSplit['lastName']}"

    if rand() < 0.6:
        return prefix() + ' ' + middleName(nameSplit)

    return middleName(nameSplit)

  return cowboyName(inputName)

def cowboyify_email(email):
    return cowboyify(' '.join(map(lambda s: s.capitalize(), email.split('@')[0].split('.'))))
