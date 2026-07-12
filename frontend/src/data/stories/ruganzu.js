// data/stories/ruganzu.js
//
// Full story content for "King Ruganzu II Ndoli" — used by:
//   - components/Discover.jsx        (landing page teaser, first paragraphs only)
//   - components/Gamification/StoryReadModal.jsx (full unlocked reading experience)
//
// Framed throughout as oral tradition ("the elders say", "as it is told") rather than
// settled historical fact, since this story has been passed down through generations
// of storytelling rather than written record — keep that framing if you expand this.

import RuganzuImg from '../../assets/listen/ruganzu.png';

export const ruganzuStory = {
  id: 'ruganzu-ii-ndoli',
  title: 'King Ruganzu II Ndoli',
  category: 'Royal history',
  location: 'Nyabarongo River',
  image: RuganzuImg,
  xpReward: 50,
  desc: 'The exiled prince who crossed the Nyabarongo and returned to reclaim a kingdom that had almost forgotten him.',
  content: [
    `Long before the hills of Rwanda carried roads and wires, they carried names — and few names are told around the fire as often as Ruganzu II Ndoli. As the elders tell it, he was still a boy when his household fell out of favor at court and he was sent away, far from the kingdom that should one day have been his. He grew up among strangers, in a home that was not his own, raised less on comfort than on a single promise repeated to him quietly, year after year: that the hills he had been carried away from were still waiting for their rightful heir.`,

    `The stories say that exile does two things to a prince — it either erases him, or it forges him. For Ruganzu, it did the second. Away from the court, he learned to listen before he spoke, to earn loyalty rather than assume it, and to read the temperament of people who owed him nothing. By the time word reached him that the throne of his fathers sat unsteady, he was no longer the frightened child who had left it. He was a young man who had spent a lifetime waiting for exactly this moment, and who had nothing left to lose in seizing it.`,

    `His return, as it is told, was never going to be simple. Between Ruganzu and the court that had once been his stood the Nyabarongo — a river that Rwandans have long treated as more than water, a boundary between what a person was and what they were about to become. The elders who kept this story say the river was high and unwelcoming the day he reached its banks, as though the land itself needed convincing that this exiled son deserved to come home. Some who traveled with him hesitated at the water's edge. Ruganzu did not.`,

    `He crossed. What exactly carried him across — courage, conviction, or the simple refusal to turn back after so many years of waiting — depends on who in the village is telling the story. But every version agrees on what came after: he did not arrive quietly. Word of a prince who had crossed the Nyabarongo without flinching moved through the hills faster than he did, reaching the court before he ever set foot in it. By the time he arrived, he was no longer just a name people vaguely remembered. He was already becoming a story.`,

    `Not everyone at court welcomed him. Rivals who had grown comfortable in his absence had little interest in a returning heir reminding them what loyalty was supposed to look like. The elders describe long seasons of testing — whispered doubts about whether the boy who had been gone so long could really lead, quiet challenges meant to see whether his resolve at the river had been a single act of bravery or something he could sustain. Ruganzu answered each test the same way he had answered the river: not with declarations, but with presence. He stayed. He listened. He did not flinch twice.`,

    `In time, the doubts gave way to something else — the recognition that the kingdom he had returned to needed exactly the kind of steadiness he had shown at its edge. Under his rule, as the oral histories describe it, Rwanda's reach and its confidence both grew. Ruganzu is remembered less for a single victory than for a temperament: a king who had already survived being erased once, and who ruled afterward like a man who understood, more than most, what it cost a people to lose their place and what it took to reclaim it.`,

    `What has carried his name through so many generations of storytelling isn't only the crossing itself, but what it came to represent. Every child in Rwanda who has heard this story around a fire, a radio, or — now — a screen, has heard it as more than a tale about one prince and one river. It is told as a lesson about return: that the home you were taken from can still be reached, that doubt is not the same as defeat, and that sometimes the most important thing a person can do is simply refuse to turn back at the water's edge.`,

    `The story of Ruganzu II Ndoli belongs to no single version — griots, grandparents, and now digital archives like this one all carry it a little differently, each shaped by the voice that passed it on. That is, in its own way, the truest thing about it: a story this old survives not by staying exactly the same, but by being told again, and again, by whoever needs to hear it next.`,
  ].join('\n\n'),
};

export default ruganzuStory;