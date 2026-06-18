// FitOS — built-in exercise & stretch starter library
// Used by the "Starter library" button on the Exercise Catalog screen.
// Each entry maps to the fitos_catalog schema (see mapCatalog in config.js).
// ─────────────────────────────────────────────────────────────────────────────
import { WARMUP_LIBRARY } from "./warmup.jsx";

export const SEED_LIBRARY = [
  // ── STRENGTH / LOWER ──────────────────────────────────────────────────────
  {name:"Back Squat",category:"Strength",muscles:["Quads","Glutes","Hamstrings","Core"],equipment:"Barbell",difficulty:"Intermediate",purpose:"General",instructions:"Bar on upper back, brace core, sit hips back and down until thighs are parallel, drive through mid-foot to stand."},
  {name:"Front Squat",category:"Strength",muscles:["Quads","Core","Glutes"],equipment:"Barbell",difficulty:"Advanced",purpose:"General",instructions:"Bar racked on front delts with elbows high, squat down keeping torso upright, drive up through heels."},
  {name:"Deadlift",category:"Strength",muscles:["Hamstrings","Glutes","Back","Core"],equipment:"Barbell",difficulty:"Intermediate",purpose:"General",instructions:"Hinge to grip bar, flat back, brace, push the floor away and stand tall locking out hips and knees together."},
  {name:"Romanian Deadlift",category:"Hypertrophy",muscles:["Hamstrings","Glutes","Back"],equipment:"Barbell",difficulty:"Intermediate",purpose:"General",instructions:"Soft knees, push hips back lowering bar along thighs until you feel a hamstring stretch, then drive hips forward."},
  {name:"Sumo Deadlift",category:"Strength",muscles:["Glutes","Hamstrings","Quads","Back"],equipment:"Barbell",difficulty:"Intermediate",purpose:"General",instructions:"Wide stance, toes out, grip inside knees, brace and stand by spreading the floor."},
  {name:"Leg Press",category:"Hypertrophy",muscles:["Quads","Glutes","Hamstrings"],equipment:"Machine",difficulty:"Beginner",purpose:"General",instructions:"Feet shoulder-width on platform, lower under control to ~90°, press without locking knees harshly."},
  {name:"Leg Curl",category:"Hypertrophy",muscles:["Hamstrings"],equipment:"Machine",difficulty:"Beginner",purpose:"General",instructions:"Curl pad toward glutes with a controlled squeeze, slow the eccentric back to start."},
  {name:"Leg Extension",category:"Hypertrophy",muscles:["Quads"],equipment:"Machine",difficulty:"Beginner",purpose:"General",instructions:"Extend knees to straighten legs, pause at the top, lower slowly under control."},
  {name:"Hip Thrust",category:"Hypertrophy",muscles:["Glutes","Hamstrings"],equipment:"Barbell",difficulty:"Intermediate",purpose:"General",instructions:"Upper back on bench, bar over hips, drive hips up to full lockout squeezing glutes, ribs down."},
  {name:"Glute Bridge",category:"Hypertrophy",muscles:["Glutes","Core"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"General",instructions:"Lying on back, feet flat, drive hips up squeezing glutes, hold briefly, lower with control."},
  {name:"Goblet Squat",category:"Strength",muscles:["Quads","Glutes","Core"],equipment:"Dumbbell",difficulty:"Beginner",purpose:"General",instructions:"Hold weight at chest, squat between knees keeping chest tall, drive up through heels."},
  {name:"Split Squat",category:"Hypertrophy",muscles:["Quads","Glutes"],equipment:"Dumbbell",difficulty:"Intermediate",purpose:"General",instructions:"Stagger stance, lower back knee toward floor, keep front shin vertical, drive through front heel."},
  {name:"Lunge",category:"Hypertrophy",muscles:["Quads","Glutes","Hamstrings"],equipment:"Dumbbell",difficulty:"Beginner",purpose:"General",instructions:"Step forward, lower until both knees ~90°, push back to standing, alternate legs."},
  {name:"Step-up",category:"Hypertrophy",muscles:["Quads","Glutes"],equipment:"Dumbbell",difficulty:"Beginner",purpose:"General",instructions:"Drive through the top foot to stand on the box, control the descent, avoid pushing off the bottom leg."},

  // ── STRENGTH / UPPER PUSH ─────────────────────────────────────────────────
  {name:"Bench Press",category:"Strength",muscles:["Chest","Triceps","Shoulders"],equipment:"Barbell",difficulty:"Intermediate",purpose:"General",instructions:"Retract shoulder blades, lower bar to mid-chest, press up and slightly back to lockout."},
  {name:"Incline DB Press",category:"Hypertrophy",muscles:["Chest","Shoulders","Triceps"],equipment:"Dumbbell",difficulty:"Intermediate",purpose:"General",instructions:"Bench at 30-45°, press dumbbells up and together, lower to upper-chest stretch."},
  {name:"Decline Press",category:"Hypertrophy",muscles:["Chest","Triceps"],equipment:"Barbell",difficulty:"Intermediate",purpose:"General",instructions:"On a decline bench, lower bar to lower chest, press to lockout emphasising the lower pec."},
  {name:"Overhead Press",category:"Strength",muscles:["Shoulders","Triceps","Core"],equipment:"Barbell",difficulty:"Intermediate",purpose:"General",instructions:"Bar at front rack, brace glutes and core, press overhead, shrug to lockout with bar over mid-foot."},
  {name:"Push Press",category:"Strength",muscles:["Shoulders","Triceps","Quads"],equipment:"Barbell",difficulty:"Advanced",purpose:"General",instructions:"Short dip with the legs, drive the bar overhead, lock out arms and stabilise."},
  {name:"Dip",category:"Strength",muscles:["Triceps","Chest","Shoulders"],equipment:"Bodyweight",difficulty:"Intermediate",purpose:"General",instructions:"Lower until elbows ~90°, slight forward lean for chest or upright for triceps, press to lockout."},
  {name:"Tricep Pushdown",category:"Hypertrophy",muscles:["Triceps"],equipment:"Cable",difficulty:"Beginner",purpose:"General",instructions:"Elbows pinned at sides, extend down to full lockout, control the return."},
  {name:"Skull Crusher",category:"Hypertrophy",muscles:["Triceps"],equipment:"Barbell",difficulty:"Intermediate",purpose:"General",instructions:"Lying down, lower bar toward forehead keeping elbows still, extend back up."},
  {name:"Lateral Raise",category:"Hypertrophy",muscles:["Shoulders"],equipment:"Dumbbell",difficulty:"Beginner",purpose:"General",instructions:"Slight forward lean, raise dumbbells out to shoulder height leading with the elbows, lower slowly."},
  {name:"Cable Fly",category:"Hypertrophy",muscles:["Chest"],equipment:"Cable",difficulty:"Beginner",purpose:"General",instructions:"Soft elbows, sweep handles together in front of chest, control the stretch on return."},
  {name:"Pec Deck",category:"Hypertrophy",muscles:["Chest"],equipment:"Machine",difficulty:"Beginner",purpose:"General",instructions:"Bring pads together squeezing the chest, slow the eccentric to a comfortable stretch."},

  // ── STRENGTH / UPPER PULL ─────────────────────────────────────────────────
  {name:"Pull-up",category:"Strength",muscles:["Back","Biceps","Forearms"],equipment:"Bodyweight",difficulty:"Advanced",purpose:"General",instructions:"Overhand grip, pull chest to bar driving elbows down, control the descent to full hang."},
  {name:"Chin-up",category:"Strength",muscles:["Back","Biceps"],equipment:"Bodyweight",difficulty:"Intermediate",purpose:"General",instructions:"Underhand grip, pull until chin clears the bar, lower under control."},
  {name:"Barbell Row",category:"Hypertrophy",muscles:["Back","Biceps","Forearms"],equipment:"Barbell",difficulty:"Intermediate",purpose:"General",instructions:"Hinge forward flat back, row bar to lower ribs driving elbows back, lower under control."},
  {name:"Cable Row",category:"Hypertrophy",muscles:["Back","Biceps"],equipment:"Cable",difficulty:"Beginner",purpose:"General",instructions:"Tall chest, pull handle to torso squeezing shoulder blades, control the return."},
  {name:"Lat Pulldown",category:"Hypertrophy",muscles:["Back","Biceps"],equipment:"Cable",difficulty:"Beginner",purpose:"General",instructions:"Pull bar to upper chest driving elbows down and back, control the eccentric."},
  {name:"Face Pull",category:"Hypertrophy",muscles:["Shoulders","Back"],equipment:"Cable",difficulty:"Beginner",purpose:"Injury Prevention",instructions:"Pull rope to face level flaring elbows out, squeeze rear delts, return slowly."},
  {name:"Dumbbell Curl",category:"Hypertrophy",muscles:["Biceps","Forearms"],equipment:"Dumbbell",difficulty:"Beginner",purpose:"General",instructions:"Elbows at sides, curl with supination, squeeze at the top, lower slowly."},
  {name:"Hammer Curl",category:"Hypertrophy",muscles:["Biceps","Forearms"],equipment:"Dumbbell",difficulty:"Beginner",purpose:"General",instructions:"Neutral grip, curl keeping wrists straight, control the descent."},

  // ── POWER / OLYMPIC / CONDITIONING ────────────────────────────────────────
  {name:"Box Jump",category:"Plyometric",muscles:["Quads","Glutes","Calves"],equipment:"Box",difficulty:"Intermediate",purpose:"Sport Specific",instructions:"Hinge and swing arms, explode onto the box landing soft with bent knees, step down."},
  {name:"KB Swing",category:"Cardio",muscles:["Glutes","Hamstrings","Core","Back"],equipment:"Kettlebell",difficulty:"Intermediate",purpose:"General",instructions:"Hinge the hips, snap them forward to float the bell to chest height, hike it back between the legs."},
  {name:"KB Clean",category:"Olympic",muscles:["Full Body"],equipment:"Kettlebell",difficulty:"Advanced",purpose:"Sport Specific",instructions:"Hike the bell, pull tight to the body and rotate the hand around to rack it on the forearm."},
  {name:"KB Snatch",category:"Olympic",muscles:["Full Body"],equipment:"Kettlebell",difficulty:"Advanced",purpose:"Sport Specific",instructions:"Explosive hip drive sends the bell overhead in one motion, punch through to a soft lockout."},
  {name:"Battle Ropes",category:"Cardio",muscles:["Shoulders","Core","Full Body"],equipment:"Other",difficulty:"Intermediate",purpose:"General",instructions:"Athletic stance, drive alternating waves from the shoulders, keep core braced throughout."},
  {name:"Sled Push",category:"Cardio",muscles:["Quads","Glutes","Calves","Full Body"],equipment:"Other",difficulty:"Intermediate",purpose:"Sport Specific",instructions:"Low body angle, arms locked, drive the sled with powerful alternating steps."},
  {name:"Burpee",category:"Plyometric",muscles:["Full Body"],equipment:"Bodyweight",difficulty:"Intermediate",purpose:"General",instructions:"Drop to a plank, optional push-up, jump feet in and explode up with a clap overhead."},
  {name:"Mountain Climber",category:"Cardio",muscles:["Core","Shoulders","Full Body"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"General",instructions:"From a plank, drive knees toward chest alternately at pace, keep hips level."},
  {name:"Jump Squat",category:"Plyometric",muscles:["Quads","Glutes","Calves"],equipment:"Bodyweight",difficulty:"Intermediate",purpose:"General",instructions:"Squat then explode up, land soft into the next rep absorbing through the hips."},
  {name:"High Knees",category:"Cardio",muscles:["Quads","Calves","Core"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Warm Up",instructions:"Run on the spot driving knees to hip height, stay light on the balls of the feet."},
  {name:"Jumping Jack",category:"Cardio",muscles:["Full Body"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Warm Up",instructions:"Jump feet out while raising arms overhead, return together, keep a steady rhythm."},
  {name:"Bike Sprint",category:"Cardio",muscles:["Quads","Calves","Full Body"],equipment:"Machine",difficulty:"Intermediate",purpose:"General",instructions:"Maximal effort intervals against resistance, recover, repeat for the prescribed rounds."},
  {name:"Row Sprint",category:"Cardio",muscles:["Back","Quads","Full Body"],equipment:"Machine",difficulty:"Intermediate",purpose:"General",instructions:"Drive with the legs, then back, then arms; reverse the sequence on the recovery."},
  {name:"Ski Erg",category:"Cardio",muscles:["Back","Core","Full Body"],equipment:"Machine",difficulty:"Intermediate",purpose:"General",instructions:"Hinge and drive the handles down past the hips, return tall, repeat with rhythm."},
  {name:"Assault Bike",category:"Cardio",muscles:["Full Body"],equipment:"Machine",difficulty:"Intermediate",purpose:"General",instructions:"Push and pull the handles while driving the legs for full-body conditioning intervals."},
  {name:"Treadmill Sprint",category:"Cardio",muscles:["Quads","Hamstrings","Calves"],equipment:"Machine",difficulty:"Intermediate",purpose:"General",instructions:"Sprint at the set pace/incline for the work interval, straddle or walk to recover."},

  // ── CORE ──────────────────────────────────────────────────────────────────
  {name:"Plank",category:"Core",muscles:["Core"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"General",instructions:"Forearms under shoulders, straight line head to heels, brace and hold without sagging."},
  {name:"Dead Bug",category:"Core",muscles:["Core"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"General",instructions:"On back, opposite arm and leg extend while the low back stays pressed to the floor."},
  {name:"Pallof Press",category:"Core",muscles:["Core"],equipment:"Cable",difficulty:"Intermediate",purpose:"General",instructions:"Side-on to the cable, press the handle straight out resisting rotation, return slowly."},
  {name:"Ab Wheel",category:"Core",muscles:["Core"],equipment:"Other",difficulty:"Advanced",purpose:"General",instructions:"Roll out as far as you can control with a braced core, pull back without arching the back."},
  {name:"Hanging Leg Raise",category:"Core",muscles:["Core","Forearms"],equipment:"Bodyweight",difficulty:"Intermediate",purpose:"General",instructions:"Hang tall, raise legs to hip height or higher with control, avoid swinging."},

  // ── STRETCHES ─────────────────────────────────────────────────────────────
  {name:"Hip Flexor Stretch",category:"Mobility",muscles:["Quads","Glutes"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Stretch",instructions:"Half-kneeling, tuck the pelvis and shift forward to feel a stretch at the front of the rear hip. Hold 30s/side."},
  {name:"Hamstring Stretch",category:"Mobility",muscles:["Hamstrings"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Stretch",instructions:"Hinge over an extended leg with a flat back until you feel a stretch behind the thigh. Hold 30s/side."},
  {name:"Quad Stretch",category:"Mobility",muscles:["Quads"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Stretch",instructions:"Standing, pull one heel toward the glute keeping knees together and hips forward. Hold 30s/side."},
  {name:"Calf Stretch",category:"Mobility",muscles:["Calves"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Stretch",instructions:"Staggered stance against a wall, back heel down and knee straight, lean in. Hold 30s/side."},
  {name:"Figure-4 Glute Stretch",category:"Mobility",muscles:["Glutes"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Stretch",instructions:"Lying on back, cross ankle over opposite knee and pull the thigh toward you. Hold 30s/side."},
  {name:"Chest Doorway Stretch",category:"Mobility",muscles:["Chest","Shoulders"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Stretch",instructions:"Forearm on a doorframe at 90°, step through gently to open the chest. Hold 30s/side."},
  {name:"Child's Pose",category:"Mobility",muscles:["Back","Shoulders"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Stretch",instructions:"Kneel and sit back onto heels, reach arms forward and relax the spine. Hold 30-60s."},
  {name:"Cobra Stretch",category:"Mobility",muscles:["Core","Back"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Stretch",instructions:"Prone, press the chest up with the hips down to extend the spine. Hold 20-30s."},
  {name:"Pigeon Pose",category:"Mobility",muscles:["Glutes","Quads"],equipment:"Bodyweight",difficulty:"Intermediate",purpose:"Stretch",instructions:"Front shin across, rear leg extended, fold forward over the front hip. Hold 30-45s/side."},
  {name:"Seated Forward Fold",category:"Mobility",muscles:["Hamstrings","Back"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Stretch",instructions:"Sit with legs extended, hinge forward reaching toward the toes with a long spine. Hold 30s."},
  {name:"Butterfly Stretch",category:"Mobility",muscles:["Glutes"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Stretch",instructions:"Soles together, gently press knees toward the floor with a tall chest. Hold 30s."},
  {name:"Triceps Overhead Stretch",category:"Mobility",muscles:["Triceps","Shoulders"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Stretch",instructions:"Reach one hand down the spine, gently press the elbow with the other hand. Hold 30s/side."},
  {name:"Neck Stretch",category:"Mobility",muscles:["Shoulders"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Stretch",instructions:"Gently tilt the ear toward the shoulder, add light hand pressure. Hold 20-30s/side."},
  {name:"Lat Stretch",category:"Mobility",muscles:["Back"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Stretch",instructions:"Hold an anchor and sit the hips back, reaching long through one side. Hold 30s/side."},
  {name:"Couch Stretch",category:"Mobility",muscles:["Quads"],equipment:"Bodyweight",difficulty:"Intermediate",purpose:"Stretch",instructions:"Rear shin up a wall in a lunge, tuck the pelvis and rise tall. Hold 30-45s/side."},

  // ── MOBILITY / WARM-UP DRILLS ─────────────────────────────────────────────
  {name:"Cat-Cow",category:"Mobility",muscles:["Core","Back"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Mobility",instructions:"On all fours, inhale to arch and look up, exhale to round the spine. Flow for 8-10 reps."},
  {name:"World's Greatest Stretch",category:"Mobility",muscles:["Full Body"],equipment:"Bodyweight",difficulty:"Intermediate",purpose:"Mobility",instructions:"Deep lunge, drop the rear knee, rotate the lead arm to the ceiling, then sweep to a hamstring reach."},
  {name:"Hip Circles",category:"Mobility",muscles:["Glutes"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Mobility",instructions:"On all fours or standing, draw large circles with the knee to open the hip. 8-10 each direction."},
  {name:"Arm Circles",category:"Mobility",muscles:["Shoulders"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Warm Up",instructions:"Sweep the arms in controlled circles, small to large, both directions for 20-30s."},
  {name:"Leg Swings",category:"Mobility",muscles:["Hamstrings","Glutes"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Warm Up",instructions:"Hold support and swing one leg front-to-back, then side-to-side. 10-12 each way per side."},
  {name:"Thoracic Rotation",category:"Mobility",muscles:["Back"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Mobility",instructions:"Quadruped, hand behind head, rotate the elbow up toward the ceiling and back down. 8/side."},
  {name:"Ankle Circles",category:"Mobility",muscles:["Calves"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Mobility",instructions:"Lift one foot and rotate the ankle through its full range. 10 each direction per side."},
  {name:"90/90 Hip Switch",category:"Mobility",muscles:["Glutes"],equipment:"Bodyweight",difficulty:"Intermediate",purpose:"Mobility",instructions:"Seated with both knees at 90°, rotate the hips to switch sides under control. 8-10 reps."},
  {name:"Inchworm",category:"Mobility",muscles:["Hamstrings","Core"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Warm Up",instructions:"Fold forward, walk the hands out to a plank, walk the feet back in. 5-8 reps."},
  {name:"Shoulder Dislocates",category:"Mobility",muscles:["Shoulders"],equipment:"Resistance Band",difficulty:"Beginner",purpose:"Mobility",instructions:"Wide grip on a band, sweep it overhead and behind, keeping arms straight. 8-10 reps."},
  {name:"Wrist Circles",category:"Mobility",muscles:["Forearms"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Mobility",instructions:"Interlace the fingers and circle the wrists, then open and flex/extend. 20-30s."},
  {name:"Spiderman Lunge",category:"Mobility",muscles:["Quads","Glutes"],equipment:"Bodyweight",difficulty:"Intermediate",purpose:"Mobility",instructions:"Step into a deep lunge bringing the foot beside the hand, drop the hip, then switch. 6-8/side."},
  {name:"Band Pull-apart",category:"Mobility",muscles:["Shoulders","Back"],equipment:"Resistance Band",difficulty:"Beginner",purpose:"Warm Up",instructions:"Arms straight, pull the band apart to the chest squeezing the shoulder blades, return slow. 15 reps."},

  // ── SPORT-SPECIFIC WARM-UPS ───────────────────────────────────────────────
  {name:"A-Skip",category:"Plyometric",muscles:["Quads","Calves","Core"],equipment:"Bodyweight",difficulty:"Intermediate",purpose:"Sport Specific",instructions:"Skip driving one knee to hip height with a sharp, snappy ground contact directly under the hip, arms swinging in sync. Primes sprint mechanics. 2x20m.",tags:["Warm Up","Running","Sprinting"]},
  {name:"B-Skip",category:"Plyometric",muscles:["Hamstrings","Quads","Calves"],equipment:"Bodyweight",difficulty:"Advanced",purpose:"Sport Specific",instructions:"From the A-skip, extend the raised leg forward then actively paw it back down under the hip. Builds active hamstring sprint action. 2x20m.",tags:["Warm Up","Running","Sprinting"]},
  {name:"Carioca",category:"Cardio",muscles:["Glutes","Core","Calves"],equipment:"Bodyweight",difficulty:"Intermediate",purpose:"Sport Specific",instructions:"Grapevine laterally, alternately crossing the trail leg in front of and behind the lead leg while rotating the hips. 2x20m each way.",tags:["Warm Up","Agility","Field Sports"]},
  {name:"Lateral Shuffle",category:"Cardio",muscles:["Quads","Glutes","Calves"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Sport Specific",instructions:"Low athletic stance, push off the trail leg and shuffle sideways without clicking the feet together. 2x15m each way.",tags:["Warm Up","Basketball","Tennis","Agility"]},
  {name:"Defensive Slide",category:"Cardio",muscles:["Quads","Glutes"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Sport Specific",instructions:"Sink into a low defensive stance, push-slide laterally staying low and square as in basketball defence. 2x15m each way.",tags:["Warm Up","Basketball","Agility"]},
  {name:"Backpedal",category:"Cardio",muscles:["Hamstrings","Glutes","Calves"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Sport Specific",instructions:"Run backwards in an athletic stance, reaching with the legs and staying low over the balls of the feet. 2x20m.",tags:["Warm Up","Field Sports","Agility"]},
  {name:"Sprint Build-ups",category:"Cardio",muscles:["Hamstrings","Quads","Calves"],equipment:"Bodyweight",difficulty:"Intermediate",purpose:"Sport Specific",instructions:"Gradually accelerate from a jog up to ~80% effort over 30-40m, then decelerate. Repeat 3-4x to prime top-end speed.",tags:["Warm Up","Running","Sprinting"]},
  {name:"Pogo Hops",category:"Plyometric",muscles:["Calves"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Sport Specific",instructions:"Rapid stiff-ankle hops in place, minimal knee bend, snapping off the floor to prime the calves and Achilles for jumping. 2x20.",tags:["Warm Up","Jumping","Sprinting"]},
  {name:"Skater Hops",category:"Plyometric",muscles:["Glutes","Quads","Calves"],equipment:"Bodyweight",difficulty:"Intermediate",purpose:"Sport Specific",instructions:"Bound laterally side to side, landing softly and balanced on one leg before pushing off the other. 2x10 each side.",tags:["Warm Up","Hockey","Skiing","Agility"]},
  {name:"Walking Knee Hug",category:"Mobility",muscles:["Glutes","Hamstrings"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Sport Specific",instructions:"Each stride, pull one knee to the chest and rise onto the toes of the standing leg, staying tall. 2x10m.",tags:["Warm Up","Dynamic","Running"]},
  {name:"Frankenstein Walk",category:"Mobility",muscles:["Hamstrings"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Sport Specific",instructions:"Walk with straight-leg kicks, reaching the opposite hand toward the toes each step to open the hamstrings dynamically. 2x10m.",tags:["Warm Up","Dynamic","Running"]},
  {name:"Walking Lunge with Twist",category:"Mobility",muscles:["Quads","Glutes","Core"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Sport Specific",instructions:"Step into a lunge and rotate the torso over the front leg, then step through to the next. 2x8 each side.",tags:["Warm Up","Dynamic","Field Sports"]},
  {name:"Trunk Rotations",category:"Mobility",muscles:["Core","Back"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Sport Specific",instructions:"Feet planted shoulder-width, rotate the torso side to side letting relaxed arms swing to prime the obliques. 20-30s.",tags:["Warm Up","Golf","Tennis","Rotational"]},
  {name:"Arm Swings",category:"Mobility",muscles:["Shoulders","Chest"],equipment:"Bodyweight",difficulty:"Beginner",purpose:"Sport Specific",instructions:"Swing the arms across the body and open wide, then add vertical swings, to warm the shoulders for overhead and throwing actions. 20-30s.",tags:["Warm Up","Swimming","Throwing"]},
  {name:"Med Ball Rotational Throw",category:"Plyometric",muscles:["Core","Shoulders","Full Body"],equipment:"Medicine Ball",difficulty:"Intermediate",purpose:"Sport Specific",instructions:"Side-on to a wall, rotate the hips and explosively throw the ball into the wall, catch and reset. Primes rotational power. 2x6 each side.",tags:["Warm Up","Golf","Tennis","Baseball","Rotational"]},
];

// ── WARM-UP MOVEMENTS ─────────────────────────────────────────────────────────
// Pulled from the shared WarmupPicker library (src/warmup.jsx) so the exact same
// stretching / mobility / foam-rolling / sport movements also live in the catalog,
// each carrying a `purpose` whose color drives the dot on the catalog card.
const WARMUP_GROUPS=[
  {key:"stretching",   category:"Mobility",       purpose:"Stretch",        equipment:"Bodyweight",  instr:"Ease into the stretch and hold 20-30s, breathing steadily — never bounce."},
  {key:"mobility",     category:"Mobility",       purpose:"Mobility",       equipment:"Bodyweight",  instr:"Move smoothly through a full, controlled range of motion for 8-12 reps to prep the joints."},
  {key:"foam-rolling", category:"Rehabilitation", purpose:"Foam Rolling",   equipment:"Foam Roller", instr:"Slowly roll the area, pausing 20-30s on tender spots — keep breathing and avoid rolling directly over joints."},
  {key:"sport",        category:"Plyometric",     purpose:"Sport Specific", equipment:"Bodyweight",  instr:"Dynamic prep drill — start easy and build intensity to prime the body for sport."},
];

export const WARMUP_SEED = WARMUP_GROUPS.flatMap(g=>
  (WARMUP_LIBRARY[g.key]||[]).map(n=>({
    name: g.key==="foam-rolling" ? `${n} Foam Roll` : n,
    category: g.category,
    muscles: [],
    equipment: g.equipment,
    difficulty: "Beginner",
    purpose: g.purpose,
    instructions: g.instr,
  }))
);

// Fold any warm-up movements not already present into the starter library so a
// fresh catalog gets them too (dedupe by name to avoid intra-library duplicates).
const _seedNames=new Set(SEED_LIBRARY.map(e=>e.name.toLowerCase().trim()));
SEED_LIBRARY.push(...WARMUP_SEED.filter(e=>!_seedNames.has(e.name.toLowerCase().trim())));
