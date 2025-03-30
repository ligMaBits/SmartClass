const events = {
  overlay:    { count: 0, multiplier: 1.0, weight: 30 },
  focus:      { count: 0, multiplier: 1.0, weight: 15 },
  typing:     { count: 0, multiplier: 1.0, weight: 5 }, 
  lookaround: { count: 0, multiplier: 1.0, weight: 5 }, 
  person:     { count: 0, multiplier: 1.0, weight: 10 },
  lip:        { count: 0, multiplier: 1.0, weight: 1 }  
};

function jutsu(evento) {
  if (events[evento]) {
    events[evento].count += 1;
    events[evento].multiplier += 0.1;
    console.log(`Event "${evento}" occurred. New count and multiplier for that event-> Count: ${events[evento].count}, Multiplier: ${events[evento].multiplier}`);
  } else {
    console.warn(`Event "${evento}" is not defined.`);
  }
}

function tsCalc() {
  const score = 100;

  const penalty = (
    events.overlay.count * events.overlay.weight * events.overlay.multiplier +
    events.focus.count * events.focus.weight * events.focus.multiplier +
    events.typing.count * events.typing.weight * events.typing.multiplier +
    events.lookaround.count * events.lookaround.weight * events.lookaround.multiplier +
    events.person.count * events.person.weight * events.person.multiplier
    events.lip.count * events.lip.weight;
  );
    // lip movement mein multiplier nhi use kr rha agar krna ho toh kr lena
    // aur jutsu function mein multiplier hamesha 0.1 se inc ho rha agar thoda strict krna ho toh 0.2 kr do
    // kyuki 0.1 se utna jyada fark nhi padega
    // ye kr sakte ho ki if evento is lip then multiplier += 0.1 else sabme 0.2 and add multiplier in lip statement too then

  const trustScore = score - penalty;
  return trustScore;
}


// yaha pe implement kr de apne trackers jo event track krenge
// and jaise hi kuch track ho then
// jutsu(evento) // this will activate the jutsu to increase multipl. and count for that evento

const trusto = tsCalc();
console.log(`Trust Score: ${trusto}`);
