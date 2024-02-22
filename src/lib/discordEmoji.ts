import { DISCORD_REGEX } from "./parseMarkdown";

export const discordEmoji = [
  "<:a_cat_on_meower:1021912187163394138>",
  "<:aaaaaaaaaaa:1149352246572761120>",
  "<:blank:1018231234553446411>",
  "<:bred:959422100458844160>",
  "<:catlick:1180505322851414206>",
  "<a:caught_in_4k:1102387987838402574>",
  "<:chainbrokerestartingnow:1149502765542953021>",
  "<:darkstar:957320841044045905>",
  "<:downvote:1010035793819091068>",
  "<:drinkmilk:1151681105615929435>",
  "<:drunkmeow:1026159952038985829>",
  "<a:duckspinningcube:1152410546893770783>",
  "<:ducky:1001974772051234950>",
  "<a:ducky_speen:995024774348668968>",
  "<:finalboss:954783074586095636>",
  "<:flipper:1011498926819520572>",
  "<:gun:1015228426778578966>",
  "<:halfstar:957320841241169991>",
  "<:happymeow:954779471330816040>",
  "<:mike_is_getting_sick_of_you:1143348848085962855>",
  "<:soon:932400780072349726>",
  "<:madmeow:954780476067946638>",
  "<:mainispain:939326396977795113>",
  "<:meowspin:1017901487810170940>",
  "<a:meowy_planet:1008194232282009640>",
  "<a:meowy_planets:1008194354197831800>",
  "<a:meowy_spin:1008194132067483678>",
  "<:meowybutton:950192902708019200>",
  "<:meowytroll:1111415513462079628>",
  "<:pixelmeowy:1125502216090951840>",
  "<:teh_duck:1055226916409458808>",
  "<:plankton_pog:995896283833323520>",
  "<:thehorror:1158484835090833508>",
  "<:quacker:959421966148857906>",
  "<:this:1068710522561773719>",
  "<:trol:1010322254065848361>",
  "<:ratestar:957320841538982018>",
  "<:rehehehehehehe:1123971249442406521>",
  "<:upvote:1010035340851023892>",
  "<:robotop:1148967341409976411>",
  "<:whar:1143938761919570000>",
  "<:wiwwy:953882510167773184>",
  "<:sadmeow:954781179704393769>",
  "<:wow:952755842095132752>",
  "<:shakespeare:982709311702716457>",
  "<:sus:1199167654972375090>",
  "<:stretchcat:1210253516417798194>",
  "<:zed:1208625071766114364>",
].map((emoji) => {
  const match = emoji.match(DISCORD_REGEX);
  if (!match) {
    throw new Error(`${emoji} isn't discord emoji`);
  }
  return { emoji, name: match[1], id: match[2], isGif: emoji.startsWith("<a") };
});

export type Emoji = (typeof discordEmoji)[number];
