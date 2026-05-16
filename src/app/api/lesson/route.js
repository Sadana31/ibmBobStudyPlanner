import { groqChat } from "@/lib/groq";

export async function POST(req) {
  let subject, topic, interest;
  
  try {
    const body = await req.json();
    subject = body.subject;
    topic = body.topic;
    interest = body.interest;

    // Simple, everyday terminology that anyone can understand
    const interestExamples = {
      gaming: `Example: "Vectors are like character movement in games. When your character moves forward at 5 units per second, that's a vector - it has both speed (5) and direction (forward). In Minecraft, when you mine a block, you're using vectors to calculate where you're looking. The crosshair direction is one vector, and the block position is another. When you jump, gravity pulls you down at -9.8 units per second - that's a downward vector!"`,
      
      music: `Example: "Vectors are like volume and pitch in music. When you turn up the volume from 50% to 80%, that's a vector - it has size (30% increase) and direction (up). In your music player, when a song fades out, the volume vector goes from 100% down to 0% over 10 seconds. When you adjust bass and treble, you're changing two vectors at once - bass goes up while treble stays flat."`,
      
      football: `Example: "Vectors are like passing the ball. When you pass from midfield to the striker 20 meters away, that's a vector - it has distance (20m) and direction (forward-right). In a corner kick, the ball travels in an arc - that's a curved vector path. When a player runs at 8 meters per second toward the goal, their speed and direction together make a velocity vector."`,
      
      cooking: `Example: "Vectors are like adding ingredients. When you add 2 cups of flour plus 1 cup of sugar, you're combining vectors - each ingredient has an amount and a type. In baking, when temperature rises from 350°F to 400°F over 5 minutes, that's a temperature vector changing. When you stir clockwise 10 times, that's a rotational vector with direction and count."`,
      
      anime: `Example: "Vectors are like character movement in animation. When a character runs across the screen from left to right at 10 frames, that's a vector - it has speed (10 frames) and direction (right). In action scenes, when a punch moves forward with force, that's a force vector. When a character jumps up 5 meters then falls down, those are opposite vectors."`,
      
      movies: `Example: "Vectors are like camera movement. When the camera pans left to right over 3 seconds, that's a vector - it has speed (3 seconds) and direction (right). In car chase scenes, when a car moves at 60 mph northeast, that's a velocity vector. When you zoom in from wide shot to close-up, that's a zoom vector with direction (in) and amount (2x zoom)."`
    };

    const example = interestExamples[interest] || interestExamples.gaming;

    const systemPrompt = `You are a friendly tutor who explains ${subject} using simple, everyday language. Use basic ${interest} examples that anyone can understand, but ALWAYS include the actual technical terms and information at the end of each explanation. Focus on the MOST BASIC and FUNDAMENTAL concepts only. Keep technical explanations SIMPLE - avoid jargon and complex terminology. Think like you're explaining to a friend who loves ${interest} but is new to ${subject}.`;

    const userMessage = `Create a step-by-step lesson for "${topic}" in ${subject} for someone who loves ${interest}.

FOCUS ON BASICS ONLY - teach the absolute fundamentals and core concepts. Highlight only the most important basic terms.

Use SIMPLE, everyday ${interest} terms that anyone can understand. Follow this example style:
${example}

CRITICAL RULES:
1. Start with the MOST BASIC ${interest} examples (like "character moves forward", "volume goes up", "pass the ball")
2. Explain with simple numbers and directions
3. Use "like" and "imagine" to make comparisons
4. Make it feel like explaining to a friend
5. FOCUS ON BASICS - don't go into advanced concepts
6. IMPORTANT: At the end of EACH step's content, add a SIMPLE technical section with ONE important formula or fact:
   - Use basic notation (like O for oxygen, H₂O for water, (2,1) for vectors)
   - Include ONE simple formula, equation, or important fact
   - Explain it in ONE simple sentence
   - Highlight this as the KEY TAKEAWAY
   - NO complex jargon (avoid terms like "quantization", "dithering", "sample rate")
   - Keep it SHORT - max 2 sentences
   - DO NOT use markdown formatting - just plain text

Example format for content:
"[${interest} analogy explanation in 2 paragraphs - BASIC concepts only]

KEY FORMULA/FACT: In chemistry, atoms are written with letters. Oxygen is O, and two oxygen atoms together are written as O₂. That's the basic notation!"

Create 4-5 steps in JSON format (focus on BASIC fundamentals):
[
  {
    "title": "Step title with simple ${interest} reference",
    "content": "Content with ${interest} examples (2 paragraphs) + EXPLANATION & USAGE section (2 sentences max, super simple)",
    "type": "intro|concept|deepdive|application|summary"
  }
]

Remember: Keep EVERYTHING simple - both analogies AND technical parts. No complex jargon!`;

    const response = await groqChat(
      [{ role: "user", content: userMessage }],
      systemPrompt
    );

    // Try to parse JSON from response
    let steps;
    try {
      console.log("AI Response:", response.substring(0, 200)); // Debug log
      
      // Clean the response to fix JSON issues
      let cleanResponse = response.trim();
      
      // Remove markdown code blocks if present
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      // Try to find JSON array in response
      const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        let jsonStr = jsonMatch[0];
        
        // Fix common JSON issues that break parsing
        // Replace literal newlines in strings with escaped newlines
        jsonStr = jsonStr.replace(/("content":\s*"[^"]*)"(\s+)/g, (match, p1, p2) => {
          // This handles newlines within content strings
          return p1 + '\\n';
        });
        
        // Try to parse - if it fails, we'll use a more aggressive fix
        try {
          steps = JSON.parse(jsonStr);
          console.log("Successfully parsed AI response!");
        } catch (innerError) {
          console.log("First parse failed, trying aggressive cleanup...");
          
          // More aggressive: extract each step manually
          const stepMatches = jsonStr.match(/\{[^}]*"title"[^}]*"content"[^}]*"type"[^}]*\}/g);
          if (stepMatches && stepMatches.length > 0) {
            steps = stepMatches.map(stepStr => {
              // Clean each step individually
              const titleMatch = stepStr.match(/"title":\s*"([^"]*)"/);
              const contentMatch = stepStr.match(/"content":\s*"([^"]*)"/);
              const typeMatch = stepStr.match(/"type":\s*"([^"]*)"/);
              
              return {
                title: titleMatch ? titleMatch[1] : "Step",
                content: contentMatch ? contentMatch[1].replace(/\\n/g, '\n') : "",
                type: typeMatch ? typeMatch[1] : "concept"
              };
            });
            console.log("Successfully parsed with aggressive cleanup!");
          } else {
            throw new Error("Could not extract steps");
          }
        }
      } else {
        console.log("No JSON array found in response, using fallback");
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.log("Parse error:", parseError.message);
      // Use interest-specific fallback
      const fallbackByInterest = {
        gaming: [
          {
            title: `${topic}: Like Moving Your Character`,
            content: `Let's learn ${topic} using gaming! Imagine your character in a game - when they move forward, backward, left, or right, that's what ${topic} is all about.\n\nThink about jumping in a game. You press the jump button, and your character goes up then comes back down. That upward movement and downward fall? That's ${topic} in action! Just like how your character's health bar goes from 100 to 0, or your score increases from 0 to 1000.`,
            type: "intro",
          },
          {
            title: "The Basics",
            content: `${topic} is like tracking your character's position. If you're at point A and move to point B, you've changed position. In games, this happens constantly - your character moves, enemies move, projectiles fly.\n\nThink of it like this: when you shoot an arrow in a game, it travels in a straight line from your bow to the target. That path is ${topic} at work!`,
            type: "concept",
          },
        ],
        music: [
          {
            title: `${topic}: Like Adjusting Volume`,
            content: `Let's learn ${topic} using music! Imagine adjusting your volume slider - when you move it from quiet to loud, that's what ${topic} is all about.\n\nThink about a song fading in. It starts at 0% volume and gradually increases to 100%. That smooth change from quiet to loud? That's ${topic} in action! Just like how bass and treble knobs change the sound.`,
            type: "intro",
          },
          {
            title: "The Basics",
            content: `${topic} is like tracking sound levels. If your music is at 50% and you turn it up to 80%, you've made a change. In music, this happens all the time - volume changes, pitch shifts, tempo speeds up or slows down.\n\nThink of it like this: when a song builds up to the chorus, the energy increases. That build-up is ${topic} at work!`,
            type: "concept",
          },
        ],
        football: [
          {
            title: `${topic}: Like Passing the Ball`,
            content: `Let's learn ${topic} using football! Imagine passing the ball from one player to another - that movement is what ${topic} is all about.\n\nThink about a through ball. The midfielder kicks it forward 20 meters to the striker. That pass has distance (20m) and direction (forward). That's ${topic} in action! Just like how players run toward the goal or defenders move back.`,
            type: "intro",
          },
          {
            title: "The Basics",
            content: `${topic} is like tracking player movement. If a player runs from midfield to the penalty box, they've changed position. In football, this happens constantly - players move, the ball travels, teams shift formation.\n\nThink of it like this: when you take a corner kick, the ball curves through the air to reach a teammate. That curved path is ${topic} at work!`,
            type: "concept",
          },
        ],
        cooking: [
          {
            title: `${topic}: Like Measuring Ingredients`,
            content: `Let's learn ${topic} using cooking! Imagine adding ingredients to a bowl - each addition is what ${topic} is all about.\n\nThink about making a cake. You add 2 cups of flour, then 1 cup of sugar, then 3 eggs. Each ingredient has an amount and a purpose. That's ${topic} in action! Just like how temperature goes from room temp to 350°F in the oven.`,
            type: "intro",
          },
          {
            title: "The Basics",
            content: `${topic} is like tracking what you add. If you start with an empty bowl and add ingredients one by one, you're building something. In cooking, this happens all the time - ingredients combine, heat increases, flavors develop.\n\nThink of it like this: when you stir a pot clockwise 10 times, that circular motion is ${topic} at work!`,
            type: "concept",
          },
        ],
        anime: [
          {
            title: `${topic}: Like Character Movement`,
            content: `Let's learn ${topic} using anime! Imagine a character running across the screen - that movement is what ${topic} is all about.\n\nThink about an action scene. The hero punches forward with force, the villain dodges left. Each movement has direction and speed. That's ${topic} in action! Just like how a character jumps up then falls back down.`,
            type: "intro",
          },
          {
            title: "The Basics",
            content: `${topic} is like tracking character positions. If a character starts on the left side and runs to the right side, they've moved. In anime, this happens constantly - characters move, objects fly, scenes transition.\n\nThink of it like this: when a character powers up and energy radiates outward, that expanding energy is ${topic} at work!`,
            type: "concept",
          },
        ],
        movies: [
          {
            title: `${topic}: Like Camera Movement`,
            content: `Let's learn ${topic} using movies! Imagine the camera panning from left to right - that movement is what ${topic} is all about.\n\nThink about a car chase scene. The camera follows the car as it speeds forward, turns left, then right. Each camera movement has direction and speed. That's ${topic} in action! Just like how you zoom in for a close-up or zoom out for a wide shot.`,
            type: "intro",
          },
          {
            title: "The Basics",
            content: `${topic} is like tracking camera position. If the camera starts far away and moves closer, it's changed position. In movies, this happens constantly - cameras pan, tilt, zoom, and track.\n\nThink of it like this: when the camera circles around a character (360° shot), that circular path is ${topic} at work!`,
            type: "concept",
          },
        ],
      };

      steps = fallbackByInterest[interest] || fallbackByInterest.gaming;
    }

    return Response.json({
      steps,
      success: true,
    });
  } catch (error) {
    console.error("Error generating lesson:", error);

    // Complete 5-step fallback for each interest
    const completeFallback = {
      gaming: [
        {
          title: `${topic}: Your Gaming Inventory`,
          content: `Imagine ${topic} like your game inventory! In games, you collect items - weapons, potions, coins. That's exactly what ${topic} is in ${subject}.\n\nWhen you pick up 5 health potions, 3 swords, and 10 coins, you're building a list. Each item has its place, and you can use them one by one. That's the power of ${topic}!`,
          type: "intro",
        },
        {
          title: "How It Works",
          content: `Think about looting enemies in a game. You defeat 10 enemies, and each drops an item. You go through each enemy (that's looping!) and collect their loot (that's using ${topic}!).\n\nIt's like when you level up - the game checks each skill in your skill tree and adds points. Going through each item one by one? That's what ${topic} does!`,
          type: "concept",
        },
        {
          title: "Real Example",
          content: `Let's say you have a quest: "Collect 5 gems". Your inventory list starts empty: []. You find gem 1, now it's [gem]. Find another, now [gem, gem]. Keep going until [gem, gem, gem, gem, gem].\n\nThe game loops through your list to count: "Do you have 5 gems? Let me check each one... 1, 2, 3, 4, 5. Yes! Quest complete!" That's ${topic} in action!`,
          type: "deepdive",
        },
        {
          title: "Why It Matters",
          content: `Every game uses ${topic}! Your friends list? That's a list. Your quest log? Another list. When the game shows "Loading..." it's looping through all the game assets.\n\nWhen you play multiplayer and see other players, the game loops through the player list and draws each character on screen. Without ${topic}, games couldn't handle multiple items or players!`,
          type: "application",
        },
        {
          title: "You've Got This!",
          content: `Now you understand ${topic}! Just remember: it's like your game inventory (storing items) and checking each item (looping through them).\n\nNext time you play, notice how games use lists everywhere - inventory, quests, leaderboards. You're now thinking like a game programmer! 🎮`,
          type: "summary",
        },
      ],
      music: [
        {
          title: `${topic}: Your Playlist`,
          content: `Imagine ${topic} like your music playlist! When you create a playlist, you add songs one by one. That's exactly what ${topic} is in ${subject}.\n\nYour "Favorites" playlist might have 20 songs. Each song has its spot - song 1, song 2, song 3. You can play them in order, shuffle them, or skip to any song. That's the power of ${topic}!`,
          type: "intro",
        },
        {
          title: "How It Works",
          content: `Think about playing your playlist. The music player starts at song 1, plays it, then moves to song 2, then song 3. It loops through each song until the playlist ends.\n\nIt's like when you hit "repeat all" - the player goes through every song, then starts over from the beginning. Going through each song one by one? That's what ${topic} does!`,
          type: "concept",
        },
        {
          title: "Real Example",
          content: `Let's say you're making a workout playlist. You start with an empty list: []. Add "Song A", now it's ["Song A"]. Add "Song B", now ["Song A", "Song B"]. Keep adding until you have 10 songs.\n\nWhen you hit play, the app loops: "Play song 1, done. Play song 2, done. Play song 3..." It checks each song in your list and plays it. That's ${topic} in action!`,
          type: "deepdive",
        },
        {
          title: "Why It Matters",
          content: `Every music app uses ${topic}! Your playlists? Lists. Your liked songs? A list. When Spotify shows "Top 50", it's looping through songs to find the most played.\n\nWhen you see "Shuffle", the app loops through your playlist in random order. Without ${topic}, music apps couldn't manage multiple songs or create playlists!`,
          type: "application",
        },
        {
          title: "You've Got This!",
          content: `Now you understand ${topic}! Just remember: it's like your playlist (storing songs) and playing each song (looping through them).\n\nNext time you use a music app, notice how it uses lists everywhere - playlists, albums, artists. You're now thinking like a music app developer! 🎵`,
          type: "summary",
        },
      ],
      football: [
        {
          title: `${topic}: Your Team Lineup`,
          content: `Imagine ${topic} like your team's starting 11! When a coach picks players, they create a list - goalkeeper, defenders, midfielders, forwards. That's exactly what ${topic} is in ${subject}.\n\nYour team list has 11 players, each in their position. Player 1 (goalkeeper), Player 2 (right back), and so on. You can substitute players or change formation. That's the power of ${topic}!`,
          type: "intro",
        },
        {
          title: "How It Works",
          content: `Think about passing the ball around. Player 1 passes to Player 2, who passes to Player 3, who passes to Player 4. The ball loops through each player in sequence.\n\nIt's like when the coach calls out names during roll call - going through each player on the team list one by one. Checking each player? That's what ${topic} does!`,
          type: "concept",
        },
        {
          title: "Real Example",
          content: `Let's say you're picking your fantasy team. Start with empty: []. Add "Messi", now ["Messi"]. Add "Ronaldo", now ["Messi", "Ronaldo"]. Keep adding until you have 11 players.\n\nDuring the match, the game loops: "Check Player 1's stats, check Player 2's stats..." It goes through each player in your list and calculates points. That's ${topic} in action!`,
          type: "deepdive",
        },
        {
          title: "Why It Matters",
          content: `Every football app uses ${topic}! Team lineups? Lists. Match schedules? Lists. When you see league tables, the app loops through all teams to sort by points.\n\nWhen watching highlights, the app loops through all goals scored in the match. Without ${topic}, football apps couldn't manage teams or track multiple matches!`,
          type: "application",
        },
        {
          title: "You've Got This!",
          content: `Now you understand ${topic}! Just remember: it's like your team lineup (storing players) and checking each player (looping through them).\n\nNext time you watch football, notice how lists are everywhere - lineups, substitutions, league tables. You're now thinking like a sports app developer! ⚽`,
          type: "summary",
        },
      ],
      cooking: [
        {
          title: `${topic}: Your Recipe Steps`,
          content: `Imagine ${topic} like a recipe! When you cook, you follow steps - chop onions, heat oil, add spices. That's exactly what ${topic} is in ${subject}.\n\nYour recipe has 8 steps, each one important. Step 1 (prep), Step 2 (cook), Step 3 (season). You do them in order, one by one. That's the power of ${topic}!`,
          type: "intro",
        },
        {
          title: "How It Works",
          content: `Think about making a cake. You follow each step: mix flour, add eggs, stir, pour into pan, bake. You loop through each instruction until the cake is done.\n\nIt's like when you meal prep for the week - you cook dish 1, then dish 2, then dish 3. Going through each recipe? That's what ${topic} does!`,
          type: "concept",
        },
        {
          title: "Real Example",
          content: `Let's say you're making a shopping list. Start empty: []. Add "tomatoes", now ["tomatoes"]. Add "onions", now ["tomatoes", "onions"]. Keep adding until you have 10 items.\n\nAt the store, you loop: "Get item 1, check. Get item 2, check. Get item 3..." You go through each item on your list. That's ${topic} in action!`,
          type: "deepdive",
        },
        {
          title: "Why It Matters",
          content: `Every cooking app uses ${topic}! Recipe steps? Lists. Ingredient lists? Lists. When you see "Meal Plan", the app loops through each day's meals.\n\nWhen you use a timer for multiple dishes, the app loops through each timer to check which one's done. Without ${topic}, cooking apps couldn't manage recipes or ingredients!`,
          type: "application",
        },
        {
          title: "You've Got This!",
          content: `Now you understand ${topic}! Just remember: it's like your recipe (storing steps) and following each step (looping through them).\n\nNext time you cook, notice how lists are everywhere - ingredients, steps, meal plans. You're now thinking like a recipe app developer! 🍳`,
          type: "summary",
        },
      ],
      anime: [
        {
          title: `${topic}: Your Watch List`,
          content: `Imagine ${topic} like your anime watch list! When you add shows to watch, you create a list - show 1, show 2, show 3. That's exactly what ${topic} is in ${subject}.\n\nYour "Plan to Watch" list might have 15 anime. Each show has its spot. You watch them one by one, or skip around. That's the power of ${topic}!`,
          type: "intro",
        },
        {
          title: "How It Works",
          content: `Think about binge-watching a series. You watch episode 1, then episode 2, then episode 3. You loop through each episode until you finish the season.\n\nIt's like when you marathon a show - the streaming app automatically plays the next episode. Going through each episode? That's what ${topic} does!`,
          type: "concept",
        },
        {
          title: "Real Example",
          content: `Let's say you're creating a watch list. Start empty: []. Add "Naruto", now ["Naruto"]. Add "One Piece", now ["Naruto", "One Piece"]. Keep adding shows.\n\nWhen you open your list, the app loops: "Show anime 1, show anime 2, show anime 3..." It displays each show in your list. That's ${topic} in action!`,
          type: "deepdive",
        },
        {
          title: "Why It Matters",
          content: `Every anime app uses ${topic}! Watch lists? Lists. Episode lists? Lists. When you see "Continue Watching", the app loops through your shows to find where you stopped.\n\nWhen browsing genres, the app loops through all anime tagged "Action" or "Romance". Without ${topic}, anime apps couldn't manage shows or episodes!`,
          type: "application",
        },
        {
          title: "You've Got This!",
          content: `Now you understand ${topic}! Just remember: it's like your watch list (storing shows) and watching each one (looping through them).\n\nNext time you use an anime app, notice lists everywhere - watch lists, episodes, recommendations. You're now thinking like an anime app developer! 📺`,
          type: "summary",
        },
      ],
      movies: [
        {
          title: `${topic}: Your Movie Queue`,
          content: `Imagine ${topic} like your Netflix queue! When you add movies to watch later, you create a list - movie 1, movie 2, movie 3. That's exactly what ${topic} is in ${subject}.\n\nYour "My List" might have 20 movies. Each movie has its spot. You can watch them in order or pick any one. That's the power of ${topic}!`,
          type: "intro",
        },
        {
          title: "How It Works",
          content: `Think about a movie marathon. You watch movie 1, then movie 2, then movie 3. You loop through each movie until you've watched them all.\n\nIt's like when you watch a trilogy - you go through each film in sequence. The streaming app queues up the next movie. Going through each one? That's what ${topic} does!`,
          type: "concept",
        },
        {
          title: "Real Example",
          content: `Let's say you're building a watchlist. Start empty: []. Add "Inception", now ["Inception"]. Add "Interstellar", now ["Inception", "Interstellar"]. Keep adding movies.\n\nWhen you open your list, the app loops: "Display movie 1, display movie 2, display movie 3..." It shows each movie in your list. That's ${topic} in action!`,
          type: "deepdive",
        },
        {
          title: "Why It Matters",
          content: `Every streaming app uses ${topic}! Movie lists? Lists. "Continue Watching"? A list. When you see "Top 10", the app loops through all movies to find the most watched.\n\nWhen browsing by genre, the app loops through all movies tagged "Action" or "Comedy". Without ${topic}, streaming apps couldn't manage movies or create queues!`,
          type: "application",
        },
        {
          title: "You've Got This!",
          content: `Now you understand ${topic}! Just remember: it's like your movie queue (storing movies) and watching each one (looping through them).\n\nNext time you use a streaming app, notice lists everywhere - watchlists, recommendations, trending. You're now thinking like a streaming app developer! 🎬`,
          type: "summary",
        },
      ],
    };

    const fallbackSteps = completeFallback[interest] || completeFallback.gaming;

    return Response.json({
      steps: fallbackSteps,
      success: false,
      error: "Using simple fallback",
    });
  }
}

// Made with Bob
