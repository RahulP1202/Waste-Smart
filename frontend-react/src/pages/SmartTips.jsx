import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import RecycleLogo from '../components/RecycleLogo'
import './SmartTips.css'

// Full article content for each blog
const BLOG_CONTENT = {
  1: `Bengaluru generates over 5,000 metric tonnes of solid waste every single day â€” enough to fill 2,500 trucks. The Bruhat Bengaluru Mahanagara Palike (BBMP) is responsible for collecting, processing, and disposing of this waste across 198 wards.\n\nThe collection system works in three tiers. At the primary level, BBMP-contracted vehicles do door-to-door collection from households and commercial establishments. At the secondary level, waste is transferred to collection points and then to processing facilities. At the tertiary level, residual waste goes to landfills.\n\nBengaluru has three major processing facilities: the Dry Waste Collection Centres (DWCCs) that handle recyclables, composting units for organic waste, and the controversial landfills at Mandur and Mavallipura.\n\nThe city has made significant progress in source segregation â€” over 60% of households now separate wet and dry waste. But challenges remain: bulk generators like hotels and apartments often bypass the system, the informal waste picker sector is undervalued, and the landfills are overflowing.\n\nThe path forward involves scaling up decentralised composting, strengthening the kabadiwala network, and enforcing Extended Producer Responsibility on packaging companies.`,
  2: `Composting is one of the oldest and most effective waste management technologies known to humanity. At its core, it is controlled decomposition â€” creating the right conditions for microorganisms to break down organic matter into stable, nutrient-rich humus.\n\nThe science involves four key variables. First, the carbon-to-nitrogen ratio: a healthy compost pile needs roughly 25-30 parts carbon (brown materials like dry leaves, cardboard, paper) to 1 part nitrogen (green materials like food scraps, grass clippings). Too much carbon and decomposition slows. Too much nitrogen and the pile smells.\n\nSecond, moisture: the pile should feel like a wrung-out sponge â€” damp but not dripping. Microorganisms need water to survive, but too much water drives out oxygen and creates anaerobic conditions that produce methane and bad odours.\n\nThird, oxygen: aerobic decomposition (with oxygen) is faster and odour-free. Turning your pile every 1-2 weeks introduces fresh oxygen and speeds up the process significantly.\n\nFourth, particle size: smaller pieces decompose faster because they have more surface area for microorganisms to work on. Chop or shred materials before adding them.\n\nWith the right balance, a home compost bin can turn kitchen scraps into rich fertiliser in as little as 6-8 weeks. The finished compost improves soil structure, adds nutrients, and supports beneficial soil life.`,
  3: `The recycling industry has a dirty secret: most plastic is never actually recycled. Of the 9.2 billion tonnes of plastic produced since the 1950s, only 9% has been recycled. 12% has been incinerated. The remaining 79% has accumulated in landfills or the natural environment.\n\nWhy is plastic recycling so difficult? The first problem is material complexity. There are seven main types of plastic, and they cannot be mixed. PET bottles (type 1) and HDPE containers (type 2) are widely recycled. But types 3-7 â€” including PVC, polystyrene, and mixed plastics â€” have limited recycling markets and often end up in landfill even when placed in recycling bins.\n\nThe second problem is contamination. Food residue, labels, and mixed materials contaminate entire batches of recyclables. A single greasy pizza box can ruin a tonne of cardboard. This is why rinsing before recycling matters so much.\n\nThe third problem is economics. Recycled plastic often costs more to produce than virgin plastic made from cheap oil. When oil prices fall, recycling becomes economically unviable and facilities close.\n\nThe fourth problem is the global recycling market. For decades, developed countries shipped their plastic waste to China and Southeast Asia. When China banned plastic waste imports in 2018, the global recycling system collapsed. Much of what was previously "recycled" was actually being landfilled or burned in countries with weaker environmental regulations.\n\nThe solution is not better recycling â€” it is less plastic. Redesigning products to use less packaging, switching to reusable systems, and holding producers responsible for end-of-life costs are the only paths to genuinely solving the plastic crisis.`,
  4: `India generated 3.2 million metric tonnes of e-waste in 2023, making it the third largest e-waste producer in the world after China and the United States. This number is growing at 30% annually as smartphone penetration increases and product lifespans shorten.\n\nE-waste contains valuable materials â€” a tonne of circuit boards contains 40-800 times more gold than a tonne of gold ore. It also contains toxic substances: lead, mercury, cadmium, chromium, and brominated flame retardants that cause cancer, neurological damage, and reproductive harm.\n\nOnly 22% of India's e-waste is formally recycled. The rest is handled by the informal sector â€” an estimated 1.5 million workers who dismantle electronics by hand, often without protective equipment, in conditions that expose them to toxic fumes and heavy metals.\n\nThe formal e-waste recycling sector in India is growing. Companies like Attero, E-Parisaraa, and Eco Recycling have built certified facilities that safely recover valuable materials. But they struggle to compete with informal recyclers who pay more for scrap because they externalise the health and environmental costs.\n\nThe Extended Producer Responsibility (EPR) framework, updated in 2022, requires electronics manufacturers to collect and recycle a percentage of the e-waste equivalent to what they sell. Implementation is improving but enforcement remains inconsistent.\n\nFor consumers, the most impactful actions are: extending product lifespans through repair, donating working devices, and using certified e-waste collection points rather than selling to informal scrap dealers.`,
  5: `The zero waste movement is often misunderstood as being about recycling more. In fact, recycling sits near the bottom of the zero waste hierarchy â€” it is the last resort before disposal, not the first response to waste.\n\nThe hierarchy, from most to least preferred, is: Refuse, Reduce, Reuse, Repair, Rot (compost), Recycle, and as a last resort, Residual management (landfill or incineration).\n\nRefuse is the most powerful action. Every product you decline to buy is a product that was never manufactured, never packaged, never transported, and never disposed of. Refusing a plastic straw, a promotional tote bag you do not need, or a product with excessive packaging eliminates waste before it is created.\n\nReduce means consuming less overall â€” buying fewer but better-quality items, choosing products with minimal packaging, and questioning whether each purchase is truly necessary.\n\nReuse means choosing products designed for multiple uses: refillable water bottles, cloth bags, glass containers, rechargeable batteries. It also means buying second-hand and selling or donating items you no longer need.\n\nRepair extends the life of products and delays their entry into the waste stream. India's vibrant repair culture â€” cobblers, tailors, electronics repair shops â€” is a sustainability asset that the zero waste movement celebrates.\n\nRot means composting organic waste rather than sending it to landfill, where it produces methane.\n\nRecycle is important but imperfect. It requires energy, produces some waste, and is only possible for certain materials in certain conditions.\n\nThe zero waste goal is not perfection â€” it is a direction. Even reducing your waste by 50% has enormous impact when multiplied across millions of households.`,
  6: `The Solid Waste Management Rules 2016 are the primary legal framework governing waste management in India. They replaced the Municipal Solid Wastes Rules 2000 and introduced several important changes.\n\nKey provisions for residents: Source segregation is mandatory. Households must separate waste into at least three categories â€” biodegradable (wet), non-biodegradable (dry), and domestic hazardous waste. Failure to segregate can result in fines.\n\nBulk generators â€” defined as establishments generating more than 100 kg of waste per day, including large apartment complexes, hotels, malls, and institutions â€” must manage their own waste on-site or through registered agencies. They cannot simply hand it over to municipal collection.\n\nFor businesses: Manufacturers and brand owners of products that generate packaging waste must set up systems to collect back that waste. This Extended Producer Responsibility (EPR) principle makes companies financially responsible for the end-of-life of their products.\n\nFor urban local bodies: Municipalities must ensure door-to-door collection, set up processing facilities, and achieve zero waste to landfill for biodegradable waste by processing it into compost or biogas.\n\nKarnataka has its own Solid Waste Management Rules that align with the national framework and add state-specific provisions. BBMP has issued detailed guidelines for Bengaluru that specify collection schedules, bin colours, and penalties.\n\nThe rules are comprehensive on paper. The challenge is enforcement â€” many provisions are routinely violated without consequence. Citizen awareness and civic engagement are essential to making the rules work in practice.`,
  7: `India wastes approximately 68 million tonnes of food every year â€” enough to feed the entire population of the United Kingdom twice over. This waste occurs at every stage of the food system, from farm to fork.\n\nAt the farm level, an estimated 15-20% of produce is lost due to poor storage, inadequate cold chain infrastructure, and cosmetic standards that reject perfectly edible food for being the wrong shape or size.\n\nAt the processing and distribution level, food is lost to spoilage, damage during transport, and over-production.\n\nAt the retail level, supermarkets discard food approaching its best-before date, and restaurants prepare more than they sell.\n\nAt the household level â€” where the most controllable waste occurs â€” food is thrown away because of over-purchasing, poor storage, confusion about date labels, and cultural attitudes that equate abundance with hospitality.\n\nThe environmental cost is staggering. Food waste is responsible for 8-10% of global greenhouse gas emissions. When food rots in landfill, it produces methane â€” a greenhouse gas 80 times more potent than CO2 over 20 years. The water, land, energy, and labour used to produce wasted food are also wasted.\n\nSolutions exist at every level. For households: meal planning, proper storage, using the whole vegetable, and composting what cannot be eaten. For restaurants: portion flexibility, food donation partnerships, and staff training. For retailers: dynamic pricing for near-expiry food and donation programmes. For government: investment in cold chain infrastructure and food bank networks.`,
  8: `Karnataka has become a hub for waste management innovation, with a growing ecosystem of startups and social enterprises turning the waste crisis into economic opportunity.\n\nHasiru Dala, founded in 2013, has organised over 15,000 waste pickers in Bengaluru into a formal cooperative. Members receive identity cards, health insurance, and fair wages. The organisation processes over 100 tonnes of dry recyclables daily and has become a model for integrating the informal sector into formal waste management systems.\n\nSaahas Zero Waste works with bulk generators â€” offices, hotels, and institutions â€” to implement comprehensive waste management systems. They have helped clients achieve zero-waste-to-landfill status and have processed over 100,000 tonnes of waste since their founding.\n\nDailyDump designs and sells home composting products that make composting accessible to urban apartment dwellers. Their terracotta composters have been adopted by thousands of households across India.\n\nAttero Recycling has built one of India's largest e-waste recycling facilities in Roorkee, processing over 100,000 tonnes of e-waste annually and recovering gold, silver, copper, and rare earth metals.\n\nBioUrja converts agricultural and food waste into biogas and organic fertiliser, creating value from materials that would otherwise be burned or landfilled.\n\nThese companies share a common insight: waste is a resource in the wrong place. The circular economy opportunity in India is enormous â€” and Karnataka is leading the way.`,
  9: `The journey of a plastic bag from a Bengaluru street to the Arabian Sea is a story of infrastructure failure, gravity, and the relentless movement of water.\n\nIt begins when a plastic bag escapes the waste collection system â€” blown from an overflowing bin, dropped by a pedestrian, or left at a roadside stall. In Bengaluru, an estimated 20-30% of plastic waste is not collected and enters the environment.\n\nRainwater carries the bag into storm drains. Bengaluru's storm drain network, designed for a city of 2 million people, now serves a city of 13 million. Drains overflow during monsoon, carrying plastic into the city's lakes.\n\nBengaluru's lakes are connected by a network of rajakaluves â€” traditional drainage channels. Plastic that enters one lake can travel through this network to the next. Eventually, it reaches the Arkavathi or Cauvery river systems.\n\nFrom there, the journey continues downstream. The Cauvery flows through Karnataka and Tamil Nadu before reaching the Bay of Bengal. Other rivers carry waste to the Arabian Sea on Karnataka's western coast.\n\nOnce in the ocean, plastic breaks down into microplastics under UV radiation and wave action. These particles enter the marine food chain, accumulating in fish, seabirds, and marine mammals â€” and ultimately in the humans who eat seafood.\n\nThe solution requires action at every point in this journey: better waste collection, improved drain maintenance, lake restoration, and most fundamentally, less plastic entering the system in the first place.`,
  10: `Vermicomposting uses earthworms â€” specifically red wigglers (Eisenia fetida) â€” to convert organic waste into a nutrient-rich material called vermicast or worm castings. It is faster than traditional composting, produces a higher-quality end product, and can be done in a small space.\n\nRed wigglers are surface-dwelling worms that thrive in decomposing organic matter. They can process half their body weight in food waste every day. A bin with 500g of worms can handle 250g of food scraps daily â€” enough for a small household.\n\nSetting up a worm bin is simple. Use a plastic or wooden container with drainage holes. Add bedding â€” shredded newspaper, cardboard, or coconut coir â€” moistened to the consistency of a wrung-out sponge. Add your worms and start feeding them kitchen scraps.\n\nWorms eat almost any organic material: fruit and vegetable scraps, coffee grounds, tea bags, crushed eggshells, and small amounts of cooked food. Avoid meat, dairy, oily foods, and citrus in large quantities.\n\nThe worms produce two valuable outputs: vermicast (solid castings) and worm tea (liquid leachate). Both are exceptional fertilisers â€” vermicast contains 5 times more nitrogen, 7 times more phosphorus, and 11 times more potassium than ordinary soil.\n\nA well-maintained worm bin has no odour and requires minimal attention â€” just feeding every few days and occasional moisture checks. It is the perfect composting solution for apartment dwellers who lack outdoor space.`,
}

// Generate content for remaining blogs
for (let i = 11; i <= 50; i++) {
  if (!BLOG_CONTENT[i]) {
    BLOG_CONTENT[i] = null // will use excerpt as fallback
  }
}

const TIPS = [
  // Composting
  { id:1, cat:'Composting', title:'Start a Home Compost Bin', body:'Use a simple plastic bin or clay pot to compost vegetable peels, fruit scraps, and coffee grounds. In 6â€“8 weeks you get rich fertilizer for your plants â€” completely free.', img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', color:'#10b981' },
  { id:2, cat:'Composting', title:'Eggshells Enrich Your Soil', body:'Crushed eggshells add calcium to compost and garden soil. Rinse them, dry them, crush them, and mix into your compost pile or sprinkle directly around plants.', img:'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=600&q=80', color:'#10b981' },
  { id:3, cat:'Composting', title:'Tea Bags as Compost Gold', body:'Used tea bags (paper ones) and loose tea leaves are excellent compost material. They speed up decomposition and add nitrogen to your pile.', img:'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80', color:'#10b981' },
  { id:4, cat:'Composting', title:'Newspaper as Brown Layer', body:'Shredded newspaper provides the "brown" carbon layer your compost needs. Alternate green (food waste) and brown (paper, dry leaves) layers for faster breakdown.', img:'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80', color:'#10b981' },
  { id:5, cat:'Composting', title:'Banana Peels for Potassium', body:'Banana peels decompose quickly and release potassium, which strengthens plant roots. Bury them directly in soil or add to compost â€” roses especially love them.', img:'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80', color:'#10b981' },

  // Plastic Reduction
  { id:6, cat:'Plastic Reduction', title:'Carry a Reusable Bag Always', body:'Keep a cloth bag folded in your pocket or purse. One reusable bag replaces 500+ plastic bags over its lifetime. In Karnataka, plastic bags under 75 microns are banned â€” be ahead of the law.', img:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80', color:'#3b82f6' },
  { id:7, cat:'Plastic Reduction', title:'Switch to a Steel Water Bottle', body:'A single stainless steel bottle replaces 156 plastic bottles per year. It keeps water cold for 24 hours and hot for 12 â€” and pays for itself in 2 months.', img:'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80', color:'#3b82f6' },
  { id:8, cat:'Plastic Reduction', title:'Refuse Plastic Straws', body:'Ask for no straw when ordering drinks. If you need one, carry a bamboo or steel straw. Plastic straws are too small to recycle and end up in oceans and rivers.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', color:'#3b82f6' },
  { id:9, cat:'Plastic Reduction', title:'Buy in Bulk to Reduce Packaging', body:'Buying larger quantities means less packaging per unit. Bring your own containers to local stores for grains, pulses, and spices â€” many shops in Karnataka welcome this.', img:'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80', color:'#3b82f6' },
  { id:10, cat:'Plastic Reduction', title:'Choose Glass or Metal Containers', body:'Replace plastic food containers with glass jars or steel dabbas. Glass is infinitely recyclable, does not leach chemicals, and lasts decades with proper care.', img:'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80', color:'#3b82f6' },
  { id:11, cat:'Plastic Reduction', title:'Avoid Single-Use Cutlery', body:'Carry a small pouch with a fork, spoon, and cloth napkin. Refuse plastic cutlery at restaurants and food stalls. This simple habit eliminates hundreds of plastic pieces per year.', img:'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80', color:'#3b82f6' },

  // Recycling
  { id:12, cat:'Recycling', title:'Rinse Before You Recycle', body:'Food residue contaminates entire batches of recyclables. A quick rinse of bottles, cans, and containers ensures they can actually be recycled instead of going to landfill.', img:'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80', color:'#6366f1' },
  { id:13, cat:'Recycling', title:'Flatten Cardboard Boxes', body:'Flatten all cardboard before putting it in the dry bin or giving to kabadiwala. Flat boxes take up less space and fetch better prices â€” up to Rs 12/kg in Bengaluru.', img:'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80', color:'#6366f1' },
  { id:14, cat:'Recycling', title:'Know Your Plastic Numbers', body:'Check the triangle number on plastic items. 1 (PET) and 2 (HDPE) are widely recycled. 3, 6, and 7 are harder to recycle. Avoid 6 (styrofoam) entirely â€” it never gets recycled.', img:'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=600&q=80', color:'#6366f1' },
  { id:15, cat:'Recycling', title:'Sell Metal Scrap for Cash', body:'Aluminium cans fetch Rs 80â€“120/kg, copper wire Rs 400â€“500/kg, and steel Rs 20â€“30/kg at your local kabadiwala. Collect and sell monthly for a small but consistent income.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', color:'#6366f1' },
  { id:16, cat:'Recycling', title:'Paper Recycling Saves Trees', body:'Recycling 1 tonne of paper saves 17 trees, 7,000 litres of water, and 4,000 kWh of electricity. Collect newspapers, notebooks, and cardboard separately for the kabadiwala.', img:'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&q=80', color:'#6366f1' },
  { id:17, cat:'Recycling', title:'Glass is 100% Recyclable Forever', body:'Unlike plastic, glass can be recycled endlessly without losing quality. Separate glass bottles and jars from other dry waste. Many glass manufacturers in Karnataka accept clean glass directly.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', color:'#6366f1' },

  // E-Waste
  { id:18, cat:'E-Waste', title:'Never Throw Batteries in Bins', body:'Batteries contain lead, mercury, and cadmium that leach into soil and groundwater. Drop them at designated e-waste collection points â€” most electronics stores and malls in Bengaluru have them.', img:'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', color:'#ef4444' },
  { id:19, cat:'E-Waste', title:'Old Phones Have Value', body:'A used smartphone contains gold, silver, copper, and rare earth metals worth Rs 200â€“2000. Give old phones to certified e-waste recyclers like Attero or E-Parisaraa in Bengaluru rather than throwing them away.', img:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80', color:'#ef4444' },
  { id:20, cat:'E-Waste', title:'Donate Working Electronics', body:'A working laptop or phone that you no longer need can transform a student\'s education. Donate to NGOs like Goonj or local schools before considering disposal.', img:'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=600&q=80', color:'#ef4444' },
  { id:21, cat:'E-Waste', title:'Printer Cartridge Refilling', body:'Refilling ink cartridges instead of buying new ones saves 97% of the plastic and metal that would otherwise become e-waste. Most stationery shops in Karnataka offer refilling for Rs 100â€“200.', img:'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=80', color:'#ef4444' },
  { id:22, cat:'E-Waste', title:'Unplug Chargers When Not in Use', body:'Chargers left plugged in consume phantom power â€” up to 10% of your electricity bill. Unplugging also extends charger life, reducing how often you need to replace and dispose of them.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', color:'#ef4444' },

  // Kitchen & Food
  { id:23, cat:'Kitchen & Food', title:'Plan Meals to Reduce Food Waste', body:'India wastes 68 million tonnes of food annually. Plan your weekly meals, make a shopping list, and buy only what you need. This saves money and prevents organic waste.', img:'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80', color:'#f59e0b' },
  { id:24, cat:'Kitchen & Food', title:'Use Vegetable Peels for Stock', body:'Onion skins, carrot peels, celery tops, and tomato ends make excellent vegetable stock. Collect them in a bag in the freezer and boil for 30 minutes for free, flavourful broth.', img:'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80', color:'#f59e0b' },
  { id:25, cat:'Kitchen & Food', title:'Stale Bread Has Many Uses', body:'Don\'t throw stale bread. Make breadcrumbs, croutons, bread pudding, or French toast. Stale roti can become crispy chips when baked with oil and spices.', img:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80', color:'#f59e0b' },
  { id:26, cat:'Kitchen & Food', title:'Store Food Properly to Last Longer', body:'Herbs stay fresh for 2 weeks when stored upright in a glass of water like flowers. Wrap leafy greens in a damp cloth. Store onions and potatoes separately â€” together they spoil faster.', img:'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80', color:'#f59e0b' },
  { id:27, cat:'Kitchen & Food', title:'Cook with Whole Vegetables', body:'Broccoli stems, cauliflower leaves, watermelon rinds, and pumpkin seeds are all edible and nutritious. Using the whole vegetable reduces waste and stretches your grocery budget.', img:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80', color:'#f59e0b' },
  { id:28, cat:'Kitchen & Food', title:'Freeze Before It Spoils', body:'Overripe bananas, leftover rice, excess curry, and wilting vegetables can all be frozen. Frozen bananas make excellent smoothies. Frozen rice reheats perfectly in 2 minutes.', img:'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80', color:'#f59e0b' },

  // DIY & Upcycling
  { id:29, cat:'DIY & Upcycling', title:'Plastic Bottles as Planters', body:'Cut a 2-litre PET bottle in half, poke drainage holes in the bottom, and you have a free planter. Paint them with acrylic paint for a colourful balcony garden. Great for herbs like mint and coriander.', img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', color:'#8b5cf6' },
  { id:30, cat:'DIY & Upcycling', title:'Tin Cans as Organisers', body:'Clean tin cans from tomatoes or chickpeas make perfect desk organisers, pencil holders, or kitchen utensil holders. Sand the edges, paint them, and wrap with twine for a rustic look.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', color:'#8b5cf6' },
  { id:31, cat:'DIY & Upcycling', title:'Old T-Shirts as Cleaning Rags', body:'Cut worn-out cotton t-shirts into squares for cleaning rags. Cotton is highly absorbent and washable. This replaces paper towels and synthetic cleaning cloths â€” saving money and waste.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', color:'#8b5cf6' },
  { id:32, cat:'DIY & Upcycling', title:'Newspaper Gift Wrapping', body:'Japanese furoshiki-style wrapping with newspaper or old magazines is beautiful and zero-waste. Add a dried flower or leaf for decoration. The recipient gets two gifts â€” the present and the wrapping.', img:'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&q=80', color:'#8b5cf6' },
  { id:33, cat:'DIY & Upcycling', title:'Glass Jars for Everything', body:'Glass jars from pickles, jam, or sauces are perfect for storing spices, grains, homemade sauces, or as drinking glasses. They\'re airtight, microwave-safe, and last indefinitely.', img:'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80', color:'#8b5cf6' },
  { id:34, cat:'DIY & Upcycling', title:'Cardboard as Weed Barrier', body:'Lay flattened cardboard boxes directly on garden beds before adding mulch. It suppresses weeds, retains moisture, and decomposes into the soil within a year â€” completely free mulching.', img:'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=80', color:'#8b5cf6' },
  { id:35, cat:'DIY & Upcycling', title:'Coffee Grounds as Fertiliser', body:'Used coffee grounds are rich in nitrogen and slightly acidic â€” perfect for roses, tomatoes, and blueberries. Sprinkle directly on soil or mix into compost. Also deters slugs and snails.', img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80', color:'#8b5cf6' },

  // Water & Energy
  { id:36, cat:'Water & Energy', title:'Fix Leaking Taps Immediately', body:'A dripping tap wastes 15 litres of water per day â€” 5,500 litres per year. A running toilet wastes 200 litres daily. Fixing leaks is the single highest-impact water conservation action.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', color:'#06b6d4' },
  { id:37, cat:'Water & Energy', title:'Collect Rainwater for Plants', body:'Place buckets or barrels under roof edges during Karnataka\'s monsoon. Collected rainwater is ideal for plants â€” it\'s soft, chemical-free, and at the right temperature. One heavy shower can fill a 200-litre barrel.', img:'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&q=80', color:'#06b6d4' },
  { id:38, cat:'Water & Energy', title:'Reuse Cooking Water', body:'Water used to boil vegetables or pasta is rich in nutrients. Let it cool and use it to water plants. Rice washing water is especially good â€” it contains starch that promotes beneficial soil bacteria.', img:'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80', color:'#06b6d4' },
  { id:39, cat:'Water & Energy', title:'Switch to LED Bulbs', body:'LED bulbs use 75% less energy than incandescent bulbs and last 25 times longer. Replacing 5 bulbs in your home saves approximately Rs 1,500 per year on electricity bills.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', color:'#06b6d4' },
  { id:40, cat:'Water & Energy', title:'Air Dry Clothes When Possible', body:'A clothes dryer uses more electricity than any other home appliance. Air drying on a line or rack is free, gentler on fabrics, and produces zero emissions. In Karnataka\'s climate, clothes dry in 2â€“4 hours.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', color:'#06b6d4' },

  // Hazardous Waste
  { id:41, cat:'Hazardous Waste', title:'Dispose Medicines Safely', body:'Never flush medicines down the toilet or throw in regular bins. Expired medicines contaminate water supplies. Return them to pharmacies â€” many in Karnataka accept unused medicines for safe disposal.', img:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80', color:'#ef4444' },
  { id:42, cat:'Hazardous Waste', title:'Paint Disposal Done Right', body:'Leftover paint should never go in regular bins. Let latex paint dry completely by leaving the lid off, then dispose in dry waste. Oil-based paint must go to hazardous waste collection. Donate usable paint to community projects.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', color:'#ef4444' },
  { id:43, cat:'Hazardous Waste', title:'Sanitary Waste Needs Special Care', body:'Wrap used sanitary products in newspaper or the wrapper they came in before disposing in the red/hazardous bin. Never flush them â€” they block sewage systems and take 500+ years to decompose.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', color:'#ef4444' },
  { id:44, cat:'Hazardous Waste', title:'CFL Bulbs Contain Mercury', body:'Compact fluorescent bulbs contain small amounts of mercury. Never break them or throw in regular bins. Collect burnt CFLs and drop at BBMP e-waste collection points or electronics stores.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', color:'#ef4444' },

  // Community & Habits
  { id:45, cat:'Community & Habits', title:'Segregate at Source â€” Always', body:'BBMP mandates waste segregation in Bengaluru. Wet waste (green bin), dry waste (blue bin), hazardous (red bin). Segregating at home is the single most impactful waste habit you can build.', img:'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80', color:'#10b981' },
  { id:46, cat:'Community & Habits', title:'Teach Children About Waste', body:'Children who learn waste segregation at home carry the habit for life. Make it a game â€” who can correctly sort the most items? Label bins with pictures for young children.', img:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80', color:'#10b981' },
  { id:47, cat:'Community & Habits', title:'Carry a Zero-Waste Kit', body:'A small pouch with a cloth bag, steel straw, bamboo cutlery, and a handkerchief eliminates most single-use plastic from your daily life. Keep one in your bag, one in your car.', img:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80', color:'#10b981' },
  { id:48, cat:'Community & Habits', title:'Buy Second-Hand First', body:'Before buying anything new, check if a second-hand version exists. Platforms like OLX, Facebook Marketplace, and local thrift stores have furniture, electronics, and clothes at 20â€“70% less cost â€” and zero manufacturing waste.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', color:'#10b981' },
  { id:49, cat:'Community & Habits', title:'Repair Before Replacing', body:'India\'s repair culture â€” cobblers, tailors, electronics repair shops â€” is a sustainability superpower. A Rs 200 repair extends a product\'s life by years and prevents it from becoming waste.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', color:'#10b981' },
  { id:50, cat:'Community & Habits', title:'Track Your Waste for One Week', body:'For one week, keep a note of everything you throw away. Most people are shocked by how much packaging they discard. Awareness is the first step â€” once you see it, you start changing it.', img:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', color:'#10b981' },
]

const BLOGS = [
  { id:1, cat:'Waste Management', title:'How Bengaluru Handles 5,000 Tonnes of Waste Daily', date:'Jan 8, 2026', read:'5 min', img:'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80', excerpt:'BBMP collects over 5,000 metric tonnes of solid waste every day from 198 wards. Here is how the system works, where it succeeds, and where it still struggles.' },
  { id:2, cat:'Composting', title:'The Science Behind Home Composting', date:'Jan 6, 2026', read:'4 min', img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', excerpt:'Composting is controlled decomposition. Understanding the carbon-to-nitrogen ratio, moisture levels, and microbial activity helps you make perfect compost every time.' },
  { id:3, cat:'Plastic Crisis', title:'Why Plastic Recycling Is Harder Than You Think', date:'Jan 4, 2026', read:'6 min', img:'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=600&q=80', excerpt:'Only 9% of all plastic ever produced has been recycled. The economics, contamination issues, and material complexity make plastic recycling a deeply flawed system.' },
  { id:4, cat:'E-Waste', title:'India Generates 3.2 Million Tonnes of E-Waste Annually', date:'Jan 2, 2026', read:'5 min', img:'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', excerpt:'India is the third largest e-waste generator in the world. Most of it is handled by the informal sector under dangerous conditions. What needs to change?' },
  { id:5, cat:'Zero Waste', title:'The Zero Waste Hierarchy: Refuse, Reduce, Reuse, Recycle', date:'Dec 30, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80', excerpt:'The zero waste movement goes beyond recycling. The most powerful action is at the top of the hierarchy â€” refusing what you do not need in the first place.' },
  { id:6, cat:'Karnataka', title:'Karnataka\'s Solid Waste Management Rules Explained', date:'Dec 28, 2025', read:'7 min', img:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', excerpt:'The Solid Waste Management Rules 2016 mandate source segregation, bulk generator compliance, and producer responsibility. Here is what residents and businesses must know.' },
  { id:7, cat:'Food Waste', title:'India Wastes 68 Million Tonnes of Food Every Year', date:'Dec 26, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80', excerpt:'While 200 million Indians go hungry, we waste enough food to feed them all. The causes range from poor storage to over-purchasing to cultural attitudes about leftovers.' },
  { id:8, cat:'Innovation', title:'Startups Turning Waste into Wealth in Karnataka', date:'Dec 24, 2025', read:'6 min', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', excerpt:'From Hasiru Dala to Saahas Zero Waste, Karnataka-based startups are building circular economy businesses that create jobs while solving the waste crisis.' },
  { id:9, cat:'Ocean Plastic', title:'How Plastic from Karnataka Reaches the Arabian Sea', date:'Dec 22, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80', excerpt:'Rivers carry plastic waste from inland cities to the coast. Tracing the journey of a plastic bag from a Bengaluru street to the ocean reveals the scale of the problem.' },
  { id:10, cat:'Composting', title:'Vermicomposting: Let Worms Do the Work', date:'Dec 20, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', excerpt:'Red wigglers can process half their body weight in organic waste daily. A small worm bin under your kitchen sink can handle all your food scraps and produce premium fertiliser.' },
  { id:11, cat:'Carbon Footprint', title:'The Carbon Cost of What You Throw Away', date:'Dec 18, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=80', excerpt:'Every item you discard has a carbon footprint â€” from its manufacture to its disposal. Understanding this helps prioritise which waste reduction actions matter most.' },
  { id:12, cat:'Recycling', title:'The Kabadiwala Economy: India\'s Informal Recycling Network', date:'Dec 16, 2025', read:'6 min', img:'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80', excerpt:'India\'s 1.5 million kabadiwalas recover more recyclable material than the formal sector. This informal network is the backbone of urban recycling â€” and it is under threat.' },
  { id:13, cat:'Water', title:'Microplastics Found in Drinking Water Across Karnataka', date:'Dec 14, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&q=80', excerpt:'Studies have detected microplastic particles in tap water, bottled water, and groundwater across Karnataka. What are the health implications and what can be done?' },
  { id:14, cat:'DIY', title:'10 Things You Can Make from Waste at Home', date:'Dec 12, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80', excerpt:'From newspaper seed pots to tin can lanterns to plastic bottle terrariums â€” creative upcycling turns waste into useful, beautiful objects without spending a rupee.' },
  { id:15, cat:'Policy', title:'Extended Producer Responsibility: Making Companies Accountable', date:'Dec 10, 2025', read:'6 min', img:'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80', excerpt:'EPR rules require companies to take back and recycle the packaging they produce. India\'s EPR framework is evolving â€” here is what it means for consumers and businesses.' },
  { id:16, cat:'Food Waste', title:'How Restaurants Can Cut Food Waste by 50%', date:'Dec 8, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80', excerpt:'Menu engineering, portion control, staff training, and food donation partnerships can halve a restaurant\'s food waste. Several Bengaluru restaurants have already done it.' },
  { id:17, cat:'Plastic Crisis', title:'The Truth About Biodegradable Plastics', date:'Dec 6, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', excerpt:'Most "biodegradable" plastics only break down under specific industrial conditions that rarely exist in the real world. Understanding the labels helps you make better choices.' },
  { id:18, cat:'Karnataka', title:'Mysuru: India\'s Cleanest City and What Bengaluru Can Learn', date:'Dec 4, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80', excerpt:'Mysuru has topped Swachh Survekshan rankings multiple times. The city\'s success comes from community participation, consistent collection, and strong civic leadership.' },
  { id:19, cat:'Innovation', title:'AI and Robotics Are Transforming Waste Sorting', date:'Dec 2, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80', excerpt:'Computer vision systems can now sort recyclables faster and more accurately than humans. These technologies are being piloted at waste processing facilities across India.' },
  { id:20, cat:'Health', title:'The Health Risks of Living Near a Landfill', date:'Nov 30, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', excerpt:'Residents near Bengaluru\'s Mandur landfill have reported higher rates of respiratory illness, skin conditions, and contaminated groundwater. The science behind these risks.' },
  { id:21, cat:'Zero Waste', title:'A Month of Zero Waste: One Family\'s Experience', date:'Nov 28, 2025', read:'6 min', img:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80', excerpt:'A Bengaluru family documented their attempt to produce zero landfill waste for 30 days. What they learned changed how they shop, cook, and think about consumption.' },
  { id:22, cat:'Recycling', title:'Why Your Recycling Might Not Actually Be Recycled', date:'Nov 26, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80', excerpt:'Contamination, market prices, and infrastructure gaps mean a significant portion of material placed in recycling bins ends up in landfill anyway. Here is how to actually recycle.' },
  { id:23, cat:'Composting', title:'Community Composting: Turning Apartment Waste into Gardens', date:'Nov 24, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', excerpt:'Several apartment complexes in Bengaluru have set up community composting units that process all organic waste on-site, eliminating it from the municipal waste stream entirely.' },
  { id:24, cat:'Carbon Footprint', title:'How Waste Contributes to Climate Change', date:'Nov 22, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=80', excerpt:'Landfills are the third largest source of methane emissions globally. Methane is 80 times more potent than CO2 over 20 years. Reducing waste is a direct climate action.' },
  { id:25, cat:'E-Waste', title:'What Happens to Your Old Phone After You Sell It', date:'Nov 20, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80', excerpt:'Tracing the journey of a used smartphone through the refurbishment and recycling chain reveals a complex global network â€” and some deeply troubling practices.' },
  { id:26, cat:'Policy', title:'Single-Use Plastic Ban in India: Progress and Gaps', date:'Nov 18, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=600&q=80', excerpt:'India banned 19 categories of single-use plastic in 2022. Two years on, enforcement remains patchy and alternatives are still not widely available. What needs to happen next.' },
  { id:27, cat:'Food Waste', title:'The Circular Economy of Food: From Farm to Fork to Compost', date:'Nov 16, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80', excerpt:'A truly circular food system would see all organic waste return to the soil as compost. Several Karnataka farms are already closing this loop with impressive results.' },
  { id:28, cat:'Innovation', title:'Plastic Roads: Karnataka\'s Experiment with Waste Tarmac', date:'Nov 14, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', excerpt:'Karnataka has laid over 1,000 km of roads using shredded plastic waste mixed with bitumen. The roads are more durable, cheaper, and solve a disposal problem simultaneously.' },
  { id:29, cat:'Water', title:'Greywater Recycling: Reusing Household Wastewater', date:'Nov 12, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&q=80', excerpt:'Water from sinks, showers, and washing machines can be filtered and reused for toilet flushing and garden irrigation. Simple systems cost under Rs 5,000 and save 40% of water use.' },
  { id:30, cat:'Karnataka', title:'Hasiru Dala: Empowering Waste Pickers in Bengaluru', date:'Nov 10, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80', excerpt:'Hasiru Dala has organised over 15,000 waste pickers in Bengaluru, giving them identity cards, health insurance, and fair wages. Their work recovers 100+ tonnes of recyclables daily.' },
  { id:31, cat:'Health', title:'Burning Waste: Why Open Burning Is a Public Health Crisis', date:'Nov 8, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', excerpt:'Open burning of waste releases dioxins, furans, and particulate matter that cause cancer, respiratory disease, and developmental disorders. It is illegal â€” and still widespread.' },
  { id:32, cat:'DIY', title:'Natural Cleaning Products from Kitchen Waste', date:'Nov 6, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80', excerpt:'Citrus peels in vinegar make a powerful all-purpose cleaner. Baking soda and lemon juice scrub sinks. Coffee grounds deodorise fridges. Your kitchen waste is a cleaning cabinet.' },
  { id:33, cat:'Plastic Crisis', title:'The Great Pacific Garbage Patch and What It Means for India', date:'Nov 4, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80', excerpt:'The Great Pacific Garbage Patch is twice the size of Texas. A significant portion of it originates from Asian rivers. India\'s coastal states are both contributors and victims.' },
  { id:34, cat:'Zero Waste', title:'Bulk Shopping: The Zero Waste Grocery Revolution', date:'Nov 2, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80', excerpt:'Bring-your-own-container stores are growing in Bengaluru and Mysuru. Shopping in bulk eliminates packaging waste entirely and often costs less than packaged alternatives.' },
  { id:35, cat:'Innovation', title:'Biogas from Kitchen Waste: Cooking with Your Own Garbage', date:'Oct 30, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', excerpt:'Small-scale biogas digesters can convert a family\'s daily food waste into enough cooking gas for 1â€“2 hours. Several Karnataka households have installed them with government subsidies.' },
  { id:36, cat:'Carbon Footprint', title:'Your Wardrobe\'s Hidden Environmental Cost', date:'Oct 28, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', excerpt:'The fashion industry produces 10% of global carbon emissions and is the second largest consumer of water. Fast fashion creates mountains of textile waste â€” most of it avoidable.' },
  { id:37, cat:'Recycling', title:'How to Set Up a Waste Segregation System at Home', date:'Oct 26, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80', excerpt:'A practical guide to setting up wet, dry, and hazardous bins in your kitchen. The right bin placement, labelling, and family habits make segregation effortless within two weeks.' },
  { id:38, cat:'Karnataka', title:'The Story of Bengaluru\'s Bellandur Lake and Toxic Foam', date:'Oct 24, 2025', read:'6 min', img:'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&q=80', excerpt:'Bellandur Lake periodically catches fire and produces toxic foam that spills onto roads. The causes â€” industrial effluents, sewage, and solid waste â€” and the long road to restoration.' },
  { id:39, cat:'Food Waste', title:'Best Before vs Use By: The Label Confusion Causing Food Waste', date:'Oct 22, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80', excerpt:'Millions of tonnes of perfectly safe food are thrown away because of misunderstood date labels. Best before is about quality, not safety. Use your senses, not just the date.' },
  { id:40, cat:'E-Waste', title:'Solar Panel Waste: The Next E-Waste Crisis', date:'Oct 20, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', excerpt:'India is installing solar panels at record speed. But panels last only 25â€“30 years, and the first generation is already reaching end of life. Are we ready for the solar waste wave?' },
  { id:41, cat:'Policy', title:'Swachh Bharat Mission: What Has Actually Changed', date:'Oct 18, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', excerpt:'A decade after its launch, Swachh Bharat has built millions of toilets and improved open defecation rates. But solid waste management remains the mission\'s unfinished chapter.' },
  { id:42, cat:'Innovation', title:'Waste-to-Energy Plants: Solution or Problem?', date:'Oct 16, 2025', read:'6 min', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', excerpt:'Waste-to-energy incineration is promoted as a clean solution. Critics argue it discourages recycling, produces toxic ash, and locks cities into waste generation. The debate examined.' },
  { id:43, cat:'Zero Waste', title:'The Minimalism-Sustainability Connection', date:'Oct 14, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80', excerpt:'Owning less means producing less waste. The minimalist movement and the zero waste movement share a core insight: the best waste is the waste you never create.' },
  { id:44, cat:'Composting', title:'Bokashi Composting: Ferment Your Food Waste', date:'Oct 12, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', excerpt:'Bokashi uses beneficial microorganisms to ferment food waste â€” including meat and dairy that regular composting cannot handle. The process takes 2 weeks and produces a powerful soil amendment.' },
  { id:45, cat:'Health', title:'Children and Waste: Building Habits That Last a Lifetime', date:'Oct 10, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80', excerpt:'Research shows that environmental habits formed before age 10 persist into adulthood. Schools and parents who teach waste segregation are making a 70-year investment.' },
  { id:46, cat:'Karnataka', title:'Dharwad\'s Model Waste Management System', date:'Oct 8, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80', excerpt:'Dharwad has achieved 95% door-to-door collection and processes all organic waste into compost sold to farmers. The city\'s approach offers a replicable model for smaller Karnataka towns.' },
  { id:47, cat:'Plastic Crisis', title:'Microplastics in Human Blood: What We Know So Far', date:'Oct 6, 2025', read:'5 min', img:'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=600&q=80', excerpt:'Scientists have detected microplastic particles in human blood, lungs, and placentas. The long-term health effects are still being studied, but the findings are deeply concerning.' },
  { id:48, cat:'DIY', title:'Seed Bombs: Turning Waste Paper into Wildflower Gardens', date:'Oct 4, 2025', read:'3 min', img:'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=80', excerpt:'Mix shredded waste paper with clay, compost, and wildflower seeds to make seed bombs. Throw them in empty plots and roadside verges â€” they germinate with the first rain.' },
  { id:49, cat:'Carbon Footprint', title:'The Carbon Footprint of a Plastic Bag vs a Cotton Bag', date:'Oct 2, 2025', read:'4 min', img:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80', excerpt:'A cotton bag must be used 131 times to offset its higher production carbon footprint compared to a plastic bag. The maths of reusable vs single-use is more complex than it seems.' },
  { id:50, cat:'Innovation', title:'The Future of Waste: Circular Economy by 2030', date:'Sep 30, 2025', read:'6 min', img:'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80', excerpt:'A circular economy eliminates waste by design â€” products are made to be repaired, reused, and recycled indefinitely. India\'s National Resource Efficiency Policy charts the path forward.' },
]

const BLOG_CATS = ['All', ...Array.from(new Set(BLOGS.map(b => b.cat)))]

const CATEGORIES = ['All', ...Array.from(new Set(TIPS.map(t => t.cat)))]

export default function SmartTips() {
  const navigate = useNavigate()
  const { lang } = useApp()
  const [activeCat, setActiveCat] = useState('All')
  const [activeBlogCat, setActiveBlogCat] = useState('All')
  const [search, setSearch] = useState('')
  const [blogSearch, setBlogSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [activeBlog, setActiveBlog] = useState(null)

  const filtered = TIPS.filter(tip => {
    const matchCat = activeCat === 'All' || tip.cat === activeCat
    const matchSearch = !search || tip.title.toLowerCase().includes(search.toLowerCase()) || tip.body.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const filteredBlogs = BLOGS.filter(b => {
    const matchCat = activeBlogCat === 'All' || b.cat === activeBlogCat
    const matchSearch = !blogSearch || b.title.toLowerCase().includes(blogSearch.toLowerCase()) || b.excerpt.toLowerCase().includes(blogSearch.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="tips-root">
      {/* Blog Article Modal */}
      {activeBlog && (
        <div className="blog-modal-overlay" onClick={() => setActiveBlog(null)}>
          <div className="blog-modal" onClick={e => e.stopPropagation()}>
            <button className="blog-modal-close" onClick={() => setActiveBlog(null)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className="blog-modal-img-wrap">
              <img src={activeBlog.img} alt={activeBlog.title} className="blog-modal-img"/>
              <div className="blog-modal-img-overlay"/>
              <div className="blog-modal-cat">{activeBlog.cat}</div>
            </div>
            <div className="blog-modal-body">
              <div className="blog-modal-meta">
                <span>{activeBlog.date}</span>
                <span className="blog-dot">Â·</span>
                <span>{activeBlog.read} read</span>
              </div>
              <h2 className="blog-modal-title">{activeBlog.title}</h2>
              <div className="blog-modal-content">
                {(BLOG_CONTENT[activeBlog.id] || activeBlog.excerpt)
                  .split('\n\n')
                  .map((para, i) => <p key={i}>{para}</p>)
                }
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Topbar */}
      <div className="tips-topbar">
        <button className="scan-back" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {lang === 'kn' ? 'à²¹à²¿à²‚à²¦à³†' : 'Back'}
        </button>
        <div className="tips-topbar-brand"><RecycleLogo size={22}/><span>{lang === 'kn' ? 'à²¸à³à²®à²¾à²°à³à²Ÿà³ à²¸à²²à²¹à³†à²—à²³à³' : 'Smart Tips'}</span></div>
        <span className="tips-count">{filtered.length} {lang === 'kn' ? 'à²¸à²²à²¹à³†à²—à²³à³' : 'tips'}</span>
      </div>

      {/* Hero */}
      <div className="tips-hero">
        <h1>{lang === 'kn' ? '50 à²¸à³à²®à²¾à²°à³à²Ÿà³ à²¤à³à²¯à²¾à²œà³à²¯ à²¸à²²à²¹à³†à²—à²³à³' : '50 Smart Waste Tips'}</h1>
        <p>{lang === 'kn' ? 'à²¸à³à²µà²šà³à²› à²•à²°à³à²¨à²¾à²Ÿà²• à²®à²¤à³à²¤à³ à²¹à²¸à²¿à²°à³ à²œà³€à²µà²¨à²•à³à²•à²¾à²—à²¿ à²ªà³à²°à²¾à²¯à³‹à²—à²¿à²• à²¸à²²à²¹à³†à²—à²³à³' : 'Practical, actionable tips for a cleaner Karnataka and a greener life'}</p>
        <div className="tips-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="tips-search"
            placeholder={lang === 'kn' ? 'à²¸à²²à²¹à³†à²—à²³à³ à²¹à³à²¡à³à²•à²¿...' : 'Search tips...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="tips-cats">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`tips-cat-btn ${activeCat === cat ? 'active' : ''}`}
            onClick={() => setActiveCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tips grid */}
      <div className="tips-container">
        {filtered.length === 0 ? (
          <div className="tips-empty">{lang === 'kn' ? `"${search}" à²—à³† à²¯à²¾à²µà³à²¦à³‡ à²¸à²²à²¹à³† à²•à²‚à²¡à³à²¬à²‚à²¦à²¿à²²à³à²²` : `No tips found for "${search}"`}</div>
        ) : (
          <div className="tips-grid">
            {filtered.map(tip => (
              <div
                key={tip.id}
                className={`tip-card ${expanded === tip.id ? 'expanded' : ''}`}
                onClick={() => setExpanded(expanded === tip.id ? null : tip.id)}
              >
                <div className="tip-img-wrap">
                  <img src={tip.img} alt={tip.title} className="tip-img" loading="lazy"/>
                  <div className="tip-img-overlay" style={{ background: `linear-gradient(to bottom, transparent 30%, ${tip.color}dd)` }}/>
                  <div className="tip-cat-badge" style={{ background: tip.color }}>{tip.cat}</div>
                  <div className="tip-num">#{tip.id}</div>
                </div>
                <div className="tip-body">
                  <h3 className="tip-title">{tip.title}</h3>
                  <p className={`tip-text ${expanded === tip.id ? 'show' : ''}`}>{tip.body}</p>
                  <button className="tip-toggle" style={{ color: tip.color }}>
                    {expanded === tip.id ? (lang === 'kn' ? 'à²•à²¡à²¿à²®à³† à²¤à³‹à²°à²¿à²¸à²¿' : 'Show less') : (lang === 'kn' ? 'à²‡à²¨à³à²¨à²·à³à²Ÿà³ à²“à²¦à²¿' : 'Read more')}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ transform: expanded === tip.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* â”€â”€ BLOGS SECTION â”€â”€ */}
      <div className="blogs-section">
        <div className="blogs-section-hero">
          <h2>{lang === 'kn' ? 'à²‡à²¤à³à²¤à³€à²šà²¿à²¨ à²¬à³à²²à²¾à²—à³â€Œà²—à²³à³' : 'Latest Blogs'}</h2>
          <p>{lang === 'kn' ? 'à²¤à³à²¯à²¾à²œà³à²¯ à²¨à²¿à²°à³à²µà²¹à²£à³† à²®à²¤à³à²¤à³ à²ªà²°à²¿à²¸à²°à²¦ à²¬à²—à³à²—à³† à²†à²³à²µà²¾à²¦ à²²à³‡à²–à²¨à²—à²³à³' : 'In-depth articles on waste management, sustainability, and environmental impact'}</p>
          <div className="tips-search-wrap" style={{maxWidth:480,margin:'0 auto'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="tips-search" placeholder={lang === 'kn' ? 'à²¬à³à²²à²¾à²—à³ à²¹à³à²¡à³à²•à²¿...' : 'Search blogs...'} value={blogSearch} onChange={e => setBlogSearch(e.target.value)}/>
          </div>
        </div>

        <div className="tips-cats" style={{paddingTop:20}}>
          {BLOG_CATS.map(cat => (
            <button key={cat} className={`tips-cat-btn ${activeBlogCat === cat ? 'active' : ''}`} onClick={() => setActiveBlogCat(cat)}>{cat}</button>
          ))}
        </div>

        <div className="tips-container">
          {filteredBlogs.length === 0 ? (
            <div className="tips-empty">{lang === 'kn' ? `"${blogSearch}" à²—à³† à²¯à²¾à²µà³à²¦à³‡ à²¬à³à²²à²¾à²—à³ à²•à²‚à²¡à³à²¬à²‚à²¦à²¿à²²à³à²²` : `No blogs found for "${blogSearch}"`}</div>
          ) : (
            <div className="blogs-grid">
              {filteredBlogs.map(blog => (
                <div key={blog.id} className="blog-card">
                  <div className="blog-img-wrap">
                    <img src={blog.img} alt={blog.title} className="tip-img" loading="lazy"/>
                    <div className="blog-img-overlay"/>
                    <div className="blog-cat-badge">{blog.cat}</div>
                  </div>
                  <div className="blog-body">
                    <div className="blog-meta">
                      <span>{blog.date}</span>
                      <span className="blog-dot">Â·</span>
                      <span>{blog.read} read</span>
                    </div>
                    <h3 className="blog-title">{blog.title}</h3>
                    <p className="blog-excerpt">{blog.excerpt}</p>
                    <button className="blog-read-btn" onClick={() => setActiveBlog(blog)}>{lang === 'kn' ? 'à²²à³‡à²–à²¨ à²“à²¦à²¿' : 'Read Article'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="tips-footer">
        <RecycleLogo size={28}/>
        <p>{lang === 'kn' ? 'Tyajyadinda Tejassige â€” à²’à²‚à²¦à³Šà²‚à²¦à³ à²¸à²²à²¹à³†à²¯à²¿à²‚à²¦ à²¹à²¸à²¿à²°à³ à²…à²­à³à²¯à²¾à²¸ à²¬à³†à²³à³†à²¸à²¿' : 'Tyajyadinda Tejassige â€” Building greener habits, one tip at a time'}</p>
      </div>
    </div>
  )
}

// This file has been updated - see component below for lang-aware rendering

