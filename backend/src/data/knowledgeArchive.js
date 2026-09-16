/**
 * Tvarita Cultural Knowledge Archive
 * Authoritative, grounded repository of Indian traditional art forms, master artists,
 * regional traditions, Tvarita workshops, performances, and cultural programs.
 */

export const KNOWLEDGE_ARCHIVE = [
  // ── Art Forms ─────────────────────────────────────────────────────────────
  {
    id: 'kf-kalamkari',
    title: 'Kalamkari Painting & Textile Art',
    type: 'art-form',
    artForm: 'Kalamkari',
    region: 'Andhra Pradesh',
    tags: ['kalamkari', 'andhra pradesh', 'textile', 'bamboo pen', 'natural dyes', 'srikalahasti', 'machilipatnam', 'ramayana'],
    content: `Kalamkari is a venerable Indian textile art form originating in Andhra Pradesh, whose name derives from the Persian words 'kalam' (pen) and 'kari' (craftsmanship)—literally meaning 'drawing with a pen'. 

There are two primary traditional styles of Kalamkari practiced in Andhra Pradesh:
1. Srikalahasti Style: Characterized by freehand drawing using a sharp bamboo reed ('kalam') dipped in natural inks. Flourishing around temple towns on the banks of the Swarnamukhi river in Tirupati district, this style focuses primarily on religious narratives, divine iconography, and epic scrolls illustrating the Ramayana, Mahabharata, and Puranas.
2. Machilipatnam (Pedana) Style: Evolving under the patronage of Golconda rulers and Mughal trade, this style utilizes hand-carved teak woodblocks to print intricate floral arabesques, tree-of-life motifs, and decorative borders on unbleached cotton fabric.

The Kalamkari process is completely organic, requiring up to 17 labor-intensive stages:
- The organic cotton cloth is treated with a solution of water, buffalo milk, and myrobalan (Karakkaya nut), which acts as a natural mordant and prevents dye bleeding.
- Contours are outlined with black ink made from fermented rusted iron jaggery syrup ('kasimi').
- Colors are derived purely from botanical and mineral sources: red from madder roots and Indian alum, yellow from pomegranate rinds and turmeric, blue from fermented indigo leaves, and green from mixing yellow with indigo.
- After each color application, the fabric is thoroughly washed in running river water to remove surplus pigments and fix the natural dyes.`,
    metadata: {
      origin: 'Andhra Pradesh',
      primaryLocations: ['Srikalahasti', 'Machilipatnam / Pedana'],
      materials: ['Handmade cotton', 'Bamboo quill (kalam)', 'Myrobalan nut', 'Vegetable and mineral dyes'],
      giTag: true
    }
  },
  {
    id: 'kf-kuchipudi',
    title: 'Kuchipudi Classical Dance-Drama',
    type: 'art-form',
    artForm: 'Kuchipudi',
    region: 'Andhra Pradesh',
    tags: ['kuchipudi', 'andhra pradesh', 'classical dance', 'dance drama', 'tarangam', 'natya', 'krishna district', 'bhagavatulu'],
    content: `Kuchipudi is one of the eight major classical dance forms of India, originating in the village of Kuchipudi in the Krishna district of Andhra Pradesh. It is unique among Indian classical dances for its seamless synthesis of pure dance (nritta), expressive mime (nritya), and theatrical dialogue-driven drama (natya).

Historical Lineage & Tradition:
- Established around the 15th-17th centuries by the revered Vaishnava saint and scholar Siddhendra Yogi, Kuchipudi was originally performed exclusively by male Brahmin troupes known as 'Kuchipudi Bhagavatulu' as sacred devotional offerings to Lord Krishna.
- Over centuries, luminaries such as Guru Vempati Chinna Satyam modernized and expanded the repertory, welcoming female dancers and structuring solo concert formats while rigorously maintaining the energetic footwork and lyrical grace.

Signature Characteristics:
- Tarangam: The famous climax wherein the dancer balances on the raised edges of a brass plate ('thali') while executing intricate rhythmic footwork, often balancing a brass pot of water on their head to symbolize equilibrium between mortal devotion and the cosmic divine.
- Bhama Kalapam: The quintessential dramatic centerpiece depicting Satyabhama's proud yet longing devotion for Lord Krishna, renowned for its nuanced portrayal of Sringara (romantic devotion) and complex psychological states.
- Accompaniment: Sung in Telugu, accompanied by traditional Carnatic music including the mridangam, cymbals (manjira), violin, flute, and the nattuvanar (conductor-rhythmist) chanting rhythmic bols (sollukattu).`,
    metadata: {
      origin: 'Krishna District, Andhra Pradesh',
      classicalStatus: 'Sangeet Natak Akademi Classical Dance',
      signaturePiece: 'Tarangam & Bhama Kalapam',
      language: 'Telugu / Sanskrit'
    }
  },
  {
    id: 'kf-madhubani',
    title: 'Madhubani (Mithila) Painting',
    type: 'art-form',
    artForm: 'Madhubani Painting',
    region: 'Bihar',
    tags: ['madhubani', 'mithila', 'bihar', 'jitwarpur', 'ramesh kumar jha', 'kohbar', 'natural pigments', 'kacchni', 'bharni'],
    content: `Madhubani painting, traditionally known as Mithila painting, is an ancient folk art tradition originating in the Mithila region of northern Bihar and southeastern Nepal. Legend traces its genesis to King Janaka of Mithila, who commissioned local artists to paint wedding motifs during the marriage of his daughter Sita to Rama.

Styles & Techniques:
- Kacchni Style: Intricate, monochrome or delicate dual-tone geometric cross-hatching and fine linework executed with bamboo nibs and twigs.
- Bharni Style: Rich, bold vibrant color fills illustrating deities, celestial bodies, and cosmic lore.
- Godna & Tantric Styles: Symbolic ritual tattoos and sacred diagrams capturing protective cosmic energies.
- Kohbar: The sacred nuptial chamber painting featuring the lotus, bamboo stalk (symbol of lineage fertility), fish, turtles, and the sun and moon to bestow divine blessings and prosperity.

Traditional Materials:
- Rendered on mud-plastered hut walls or handmade paper treated with cow dung and rice paste.
- Organic colors extracted from nature: black from soot/lampblack mixed with cow dung, yellow from turmeric and pollen, blue from indigo, green from wood-apple leaves, and white from ground rice paste. Double-line outlines filled with delicate parallel hatchings ensure no empty space remains.`,
    metadata: {
      origin: 'Mithila / Madhubani, Bihar',
      masterPractitioner: 'Ramesh Kumar Jha',
      giTag: true
    }
  },
  {
    id: 'kf-warli',
    title: 'Warli Tribal Art',
    type: 'art-form',
    artForm: 'Warli Art',
    region: 'Maharashtra',
    tags: ['warli', 'maharashtra', 'tribal art', 'sunita devi', 'tarpa', 'rice paste', 'jivya soma mashe', 'geometric'],
    content: `Warli art is one of the oldest living tribal painting traditions of India, created by the indigenous Warli community inhabiting the North Sahyadri mountain range in Maharashtra (districts of Palghar, Thane, and Nashik). Dating back through oral tradition to 2500–3000 BCE, Warli art is an unadorned, poetic celebration of ecological harmony, agrarian life, and communal interdependence.

Visual Vocabulary:
- The paintings rely on a minimalist geometric syntax composed of three primary shapes:
  * Circle: Representing the sun, moon, and nature's perpetual life cycle.
  * Triangle: Derived from mountains, pointed trees, and sacred topography. Two inverted triangles touching at their apex represent human and animal torsos—symbolizing the cosmic union of masculine and feminine energy.
  * Square: Representing the sacred sanctum or cultivated hearth ('Chowk'), reserved for the fertility goddess Palghat.

Traditional Execution:
- The base surface is traditionally a wall composed of mud, red ochre ('geru'), and cow dung.
- Paint is crafted entirely from white rice paste ('pithad') mixed with water and edible gum, applied using chewed bamboo twigs or thin wooden brushes.
- Central motif: The Tarpa dance, where community members interlock arms and swirl in concentric spirals around the Tarpa player, echoing the motion of the cosmos without beginning or end.`,
    metadata: {
      origin: 'Palghar / Thane, Maharashtra',
      indigenousCommunity: 'Warli Tribe',
      giTag: true
    }
  },
  {
    id: 'kf-baul',
    title: 'Baul Music & Mystic Philosophy',
    type: 'art-form',
    artForm: 'Baul Music & Philosophy',
    region: 'West Bengal',
    tags: ['baul', 'west bengal', 'music', 'sadhan das baul', 'ektara', 'unesco', 'birbhum', 'kenduli', 'lalon fakir'],
    content: `The Baul tradition of Bengal is a mystical, musical, and philosophical movement recognized on UNESCO's Representative List of the Intangible Cultural Heritage of Humanity. Bauls are itinerant minstrels who wander across rural West Bengal and Bangladesh, spreading a doctrine of universal humanism, emotional purity, and divine love.

Philosophy:
- Baul belief centers on the 'Moner Manush' (the inner person of the heart)—the conviction that divinity does not reside in temples, mosques, dogmas, or caste hierarchies, but rather within the human body itself.
- Influenced by Sahajiya Buddhism, Sufi mysticism, and Bhakti Vaishnavism, Baul poets like Lalon Fakir and Chandidas composed oral songs that celebrate liberty, simplicity, and love.

Acoustic Instruments:
- Ektara: A single-stringed plucked drone carved from hollow pumpkin or wood with a split bamboo neck.
- Dotara: A multi-stringed plucked lute producing resonant melodic accompaniment.
- Dubki & Khamak: Percussion instruments providing dynamic, driving rhythmic pulses.
- Ghungroo: Ankle bells worn by the singer that chime synchronously with ecstatic, swirling dance steps.`,
    metadata: {
      origin: 'Birbhum, West Bengal',
      unescoHeritage: 'Intangible Cultural Heritage of Humanity',
      masterPractitioner: 'Sadhan Das Baul',
      keyConcept: 'Moner Manush (The Divine Soul Within)'
    }
  },
  {
    id: 'kf-gond',
    title: 'Gond Indigenous Tribal Painting',
    type: 'art-form',
    artForm: 'Gond Painting',
    region: 'Madhya Pradesh',
    tags: ['gond', 'madhya pradesh', 'tribal art', 'tree of life', 'lines and dots', 'pardhan gond', 'nature'],
    content: `Gond painting is a vibrant sacred art tradition practiced by the Pardhan Gond tribal community of central India, predominantly in the dense forest regions of Madhya Pradesh, Chhattisgarh, and Maharashtra.

Core Philosophy:
- In Gond cosmology, every element of nature—from the grand Mahua tree to the smallest insect—houses a protective sacred spirit ('Bada Dev'). The Gonds believe that viewing and creating sacred depictions of nature brings auspicious fortune and safeguards the village from misfortune.

Stylistic Anatomy:
- Each Gond master develops a signature decorative fill-pattern known as a 'Dhoti'—distinguished by rhythmic arrangements of fine parallel dots, dashes, crescents, fish scales, or geometric cross-hatchings.
- Outlines are drawn with bold, fluid continuous lines before being filled with these intricate patterns.
- Predominant motifs include the sacred Tree of Life, flying deer, peacocks, river serpents, village shrines, and mythological forest spirits.
- Organic pigments are traditionally derived from yellow chuna stone, ramraj soil, charcoal, geru ochre, and crushed leaves.`,
    metadata: {
      origin: 'Mandla / Dindori, Madhya Pradesh',
      community: 'Pardhan Gond',
      giTag: true
    }
  },
  {
    id: 'kf-kathakali',
    title: 'Kathakali Classical Dance-Theater',
    type: 'art-form',
    artForm: 'Kathakali Classical Theater',
    region: 'Kerala',
    tags: ['kathakali', 'kerala', 'classical dance', 'theater', 'mudras', 'navarasas', 'makeup', 'temple'],
    content: `Kathakali is the legendary classical dance-theater tradition of Kerala, distinguished by its monumental visual majesty, elaborate face makeup (vesham), hand gesture language (hasthalakshana deepika / mudras), and dramatic facial kinetic control.

Key Elements:
- Vesham (Makeup Archetypes):
  * Paccha (Green): Represents noble, virtuous heroes, gods, and kings (e.g., Rama, Krishna, Arjuna).
  * Kathi (Knife): Characters of nobility flawed by hubris or villainy (e.g., Ravana, Duryodhana), featuring green makeup with red mustache-like markings and white chutti paste bulbs.
  * Thadi (Beard): White for divine ape guardians (Hanuman), red for malevolent demonic tyrants (Dushasana), and black for forest hunters.
  * Minukku: Radiant, warm natural tones for gentle women, sages, and spiritual masters.
- Codified Mudras & Eye Movements: Performers communicate complex psychological dialogue purely through 24 basic root hand mudras and extraordinary ocular dexterity portraying the Navarasas (love, humor, sorrow, anger, valor, fear, disgust, wonder, and peace).
- Orchestration: Driven by the thunderous roar of the Chenda drum, Maddalam, Chengila gong, and Elathalam cymbals.`,
    metadata: {
      origin: 'Kerala',
      classicalStatus: 'Sangeet Natak Akademi Classical Theater',
      language: 'Manipravalam (Sanskritized Malayalam)'
    }
  },
  {
    id: 'kf-pattachitra',
    title: 'Odisha Pattachitra Scroll & Palm-Leaf Art',
    type: 'art-form',
    artForm: 'Odisha Pattachitra',
    region: 'Odisha',
    tags: ['pattachitra', 'odisha', 'raghurajpur', 'palm leaf', 'talapatra', 'jagannath', 'mineral pigments'],
    content: `Odisha Pattachitra is an ancient, Sanskrit-rooted scroll painting tradition from Odisha, originating in the heritage crafts village of Raghurajpur near Puri. The term stems from 'patta' (cloth canvas) and 'chitra' (painting).

Traditions & Mediums:
- Canvas Preparation: Old cotton sari cloth is bonded in multiple layers using tamarind seed gum ('niryas') and dusted with soft white soapstone powder, then polished with sea cowrie shells until smooth as ivory.
- Talapatra Chitra: Palm-leaf engraving where dried palm leaves are etched using an iron stylus ('lekhani') and rubbed with black lamp soot mixed with bean juice to reveal hairline engravings.
- Iconography: Centered around Lord Jagannath, Subhadra, and Balabhadra, alongside episodes of the Gita Govinda, Krishnalila, and Dasavatara.
- Border Architecture: Every Pattachitra must be framed within an unbroken hand-painted ornamental border of creeping vines and floral tendrils. All paints are 100% natural, using white conch shell powder, lampblack, hingula red mineral, and haritala stone yellow.`,
    metadata: {
      origin: 'Raghurajpur / Puri, Odisha',
      giTag: true
    }
  },

  // ── Regional Art Practices ──────────────────────────────────────────────────
  {
    id: 'kf-region-andhra',
    title: 'Traditional Art Practices of Andhra Pradesh',
    type: 'region',
    region: 'Andhra Pradesh',
    tags: ['andhra pradesh', 'kalamkari', 'kuchipudi', 'kondapalli', 'tholu bommalata', 'budithi brass'],
    content: `Andhra Pradesh boasts an extraordinary spectrum of living cultural heritage traditions:
1. Kalamkari: Hand-painted textile scrolls in Srikalahasti (temple epics) and block-printed natural dye textiles in Machilipatnam.
2. Kuchipudi: World-renowned classical dance-drama originating in Krishna district, renowned for the Tarangam brass plate dance and Bhama Kalapam.
3. Tholu Bommalata: Shadow leather puppetry practiced by nomadic artisans in Anantapur and Nellore, dramatizing epic battles of the Ramayana with translucent goatskin puppets illuminated by fire and lamps.
4. Kondapalli Toys: Hand-carved softwood toys ('Tella Poniki') coated with tamarind paste and painted with vegetable dyes, renowned for depictions of rural occupations, mythological figures, and village bullock carts.
5. Budithi Brassware: Indigenous metalcraft from Srikakulam featuring graceful alloy utensils and decorative vessels finished with organic black patina.`,
    metadata: {
      state: 'Andhra Pradesh',
      majorArtForms: ['Kalamkari', 'Kuchipudi', 'Tholu Bommalata', 'Kondapalli Toys', 'Budithi Brassware']
    }
  },
  {
    id: 'kf-region-bihar',
    title: 'Traditional Art Practices of Bihar',
    type: 'region',
    region: 'Bihar',
    tags: ['bihar', 'madhubani', 'mithila', 'sujini', 'tikuli', 'sikki grass'],
    content: `Bihar's indigenous cultural traditions represent centuries of folk resilience and ritual creativity:
1. Madhubani / Mithila Painting: Wall and paper murals celebrating nature, nuptial fertility (Kohbar), and divine epics across Kacchni, Bharni, and Godna styles in Jitwarpur and Ranti.
2. Sujini Embroidery: Narrative quilting using recycled cotton fabrics and colorful thread running stitches, historically crafted by mothers to document rural women's social triumphs, folk tales, and domestic dreams.
3. Tikuli Craft: An endangered 800-year-old Patna craft involving hand-painted gold leaf and enamel miniature designs rendered on glass and wooden disks.
4. Sikki Grass Craft: Golden-tinted swamp grass hand-woven by women into decorative baskets, storage containers, and ceremonial toys.`,
    metadata: {
      state: 'Bihar',
      majorArtForms: ['Madhubani', 'Sujini Embroidery', 'Tikuli Craft', 'Sikki Craft']
    }
  },
  {
    id: 'kf-region-kerala',
    title: 'Traditional Art Practices of Kerala',
    type: 'region',
    region: 'Kerala',
    tags: ['kerala', 'kathakali', 'theyyam', 'mohiniyattam', 'mural painting', 'kalaripayattu'],
    content: `Kerala's cultural arts reflect a profound synthesis of temple ritual, martial mastery, and dance-theater:
1. Kathakali: Elaborate dance-theater featuring dramatic Paccha, Kathi, and Thadi facial makeup, eye kinetics, and 24 classical root mudras.
2. Theyyam: A sacred shamanic ritual dance of North Malabar where performers channel living deities through monumental headgear ('mudi') and body paint.
3. Mohiniyattam: The 'Dance of the Enchantress', characterized by swaying circular movements, white-and-gold kasavu attire, and lyrical Lasya elegance.
4. Kerala Temple Mural Painting: Panchavarna (five sacred natural colors) paintings adorning temple sanctums, depicting celestial lore through stylized botanical borders.
5. Kalaripayattu: One of the oldest martial arts in the world, incorporating animal stances, agility, and wooden and metal weaponry.`,
    metadata: {
      state: 'Kerala',
      majorArtForms: ['Kathakali', 'Theyyam', 'Mohiniyattam', 'Temple Murals', 'Kalaripayattu']
    }
  },
  {
    id: 'kf-region-maharashtra',
    title: 'Traditional Art Practices of Maharashtra',
    type: 'region',
    region: 'Maharashtra',
    tags: ['maharashtra', 'warli', 'lavani', 'paithani', 'kolhapuri'],
    content: `Maharashtra presents a rich heritage of tribal, rural, and courtly arts:
1. Warli Tribal Painting: Neolithic-rooted geometric white rice-paste murals depicting Tarpa dances, harvest cycles, and communal unity in the Sahyadri mountains.
2. Lavani Music & Dance: Vibrant rhythmic folk performance driven by the beat of the Dholki drum, known for rapid tempo and expressive poetic storytelling.
3. Paithani Silk Weaving: Handwoven silk sarees from Paithan featuring pure gold and silver zari pallus adorned with peacock and lotus motifs.
4. Kolhapuri Crafts: Renowned vegetable-tanned leather footwear and hand-forged silver jewelry with intricate grain work.`,
    metadata: {
      state: 'Maharashtra',
      majorArtForms: ['Warli Painting', 'Lavani', 'Paithani Weaving', 'Kolhapuri Craft']
    }
  },

  // ── Master Artists ─────────────────────────────────────────────────────────
  {
    id: 'kf-artist-ramesh-jha',
    title: 'Master Artist Ramesh Kumar Jha',
    type: 'artist',
    artForm: 'Madhubani Painting',
    region: 'Bihar',
    tags: ['ramesh kumar jha', 'madhubani', 'artist', 'shilp guru', 'jitwarpur', 'bihar'],
    content: `Ramesh Kumar Jha is a celebrated master practitioner and Shilp Guru awardee in Madhubani (Mithila) painting from Jitwarpur village in Bihar. Carrying four generations of artistic lineage, he has represented India's living cultural traditions at premier global cultural institutions including the Smithsonian Institution and the British Museum. 

Ramesh specializes in the traditional Kacchni (fine line) and Bharni (natural color fill) styles. Dedicated to community empowerment, he leads a village artisan cooperative of 60 women artists, channeling proceeds from exhibitions and Tvarita corporate workshops directly into community preservation and educational funds.`,
    metadata: {
      name: 'Ramesh Kumar Jha',
      accolades: ['Shilp Guru Awardee', 'National Award Winner'],
      village: 'Jitwarpur, Bihar',
      role: 'Master Mentor & Workshop Leader'
    }
  },
  {
    id: 'kf-artist-sadhan-baul',
    title: 'Master Baul Singer Sadhan Das Baul',
    type: 'artist',
    artForm: 'Baul Music & Philosophy',
    region: 'West Bengal',
    tags: ['sadhan das baul', 'baul', 'west bengal', 'kenduli', 'birbhum', 'artist', 'ektara'],
    content: `Sadhan Das Baul is a seventh-generation Baul Sadhak and mystic minstrel from Kenduli in Birbhum district, West Bengal. Trained from early childhood in the oral poetry of Lalon Fakir, he sings with the resonant acoustics of the Ektara, Dotara, and Khamak. 

Sadhan Das leads international dialogues on mystic humanism, presenting Baul music not merely as a performance art, but as a living spiritual meditation on compassion, natural equality, and universal unity. In collaboration with Tvarita, he conducts intimate musical gatherings and educational workshops across corporate and educational platforms.`,
    metadata: {
      name: 'Sadhan Das Baul',
      lineage: '7th-Generation Baul Sadhak',
      residence: 'Kenduli, Birbhum, West Bengal',
      role: 'Vocalist & Ensemble Director'
    }
  },
  {
    id: 'kf-artist-sunita-devi',
    title: 'Master Painter Sunita Devi',
    type: 'artist',
    artForm: 'Warli Art',
    region: 'Maharashtra',
    tags: ['sunita devi', 'warli', 'artist', 'palghar', 'maharashtra', 'tarpa'],
    content: `Sunita Devi is a master Warli artist from the tribal heartland of Palghar in Maharashtra. Learning the sacred Chowk and Tarpa compositions from elder women in her community, Sunita has pioneered the transition of Warli art from ephemeral mud walls to permanent archival textiles and gallery canvases.

Sunita is an advocate for tribal ecological preservation. Her workshops guide participants in preparing organic rice paste and understanding the symbolic balance between the circle of the cosmos, the triangle of the trees, and the square of sacred community life.`,
    metadata: {
      name: 'Sunita Devi',
      region: 'Palghar, Maharashtra',
      specialty: 'Sacred Chowk & Tarpa Murals',
      role: 'Master Artisan Mentor'
    }
  },

  // ── Workshops & Experiences ─────────────────────────────────────────────────
  {
    id: 'kf-workshop-experience',
    title: 'Traditional Art Workshop Architecture & Process',
    type: 'workshop',
    tags: ['workshop', 'process', 'experience', 'hands-on', 'pigments', 'honorarium', 'what happens in a traditional art workshop'],
    content: `A traditional Tvarita art workshop is an immersive, structured cultural learning journey guided directly by a recognized master practitioner. Rather than a passive lecture, it offers an authentic tactile connection to India's living heritage.

What happens in a traditional Tvarita art workshop:
1. Cultural Orientation & Lineage Blessing: The master artist begins with an oral narrative introducing the ancestral origin, ritual purpose, and mythological symbolism of the art form.
2. Exploration of Natural Materials: Participants explore raw botanical and mineral pigments—such as indigo stone, crushed madder root, turmeric, lamp soot, and myrobalan nut. The artist demonstrates traditional paste mixing and tool preparation (such as hand-carved bamboo quills, nibs, or fine brushes).
3. Master Demonstration: The artisan demonstrates foundational linework, sacred geometry (such as Warli triangles or Madhubani cross-hatching), and color harmonies in front of the group.
4. Guided Hands-On Creation: Under personalized one-on-one guidance from the master artisan, each participant creates an original authentic artwork on handmade archival paper or treated fabric.
5. Archival Preservation & Framing: Every participant receives an archival framing kit and a signed Certificate of Cultural Participation bearing the master artist's seal.
6. Direct Artisan Honorarium: 100% of the workshop honorarium is deposited directly into the master artisan's community guild account, sustaining rural artisanal livelihoods and documentation of endangered lineages.`,
    metadata: {
      duration: '3 to 4 Hours',
      audience: 'Organizations, Schools, Cultural Enthusiasts',
      materialsProvided: '100% organic handmade materials, bamboo tools, archival frame'
    }
  },
  {
    id: 'kf-tvarita-programs',
    title: 'Available Tvarita Cultural Experiences & Programs',
    type: 'experience',
    tags: ['experiences', 'programs', 'corporate', 'workshops', 'performances', 'available', 'tvarita experiences'],
    content: `Tvarita Arts Collective curates an extensive portfolio of authentic Indian cultural experiences, workshops, and performances for organizations, educational institutions, and public audiences:

Available Experiences:
1. Mithila / Madhubani Masterclass & Team Immersion:
   - Led by Shilp Guru awardee Ramesh Kumar Jha. Focuses on Kacchni and Bharni styles, bamboo quill drawing, and handmade paper treated with rice wash.
2. Soul of Bengal: Mystical Baul Music & Acoustic Performance:
   - Performed by 7th-generation minstrel Sadhan Das Baul and ensemble. Features the Ektara, Dotara, and Khamak, accompanied by an interactive fireside dialogue on mystic philosophy.
3. Warli Tribal Immersion & Tarpa Dance:
   - Guided by Sunita Devi. Explores minimalist geometric philosophy, white rice-paste painting, and communal Tarpa dance rituals.
4. Gond Indigenous Tree of Life Masterclass:
   - Guided by Pardhan Gond artisans. Participants learn signature dot-and-line patterns celebrating nature spirits and sacred trees.
5. Kathakali Mudra & Storytelling Masterclass:
   - Led by Kerala Kalamandalam-trained masters. An exploration of the 24 codified mudras, eye kinetics, Navarasas, and dramatic facial transformation.
6. Odisha Pattachitra & Palm-Leaf Scroll Engraving:
   - Led by Raghurajpur heritage artisans. Covers natural mineral pigment extraction and delicate palm-leaf stylus etching.

All Tvarita experiences can be booked on-site at client campuses or at Tvarita heritage pavilions, with direct financial honorariums channeled to the artisan communities.`,
    metadata: {
      categories: ['Traditional Workshops', 'Folk Performances', 'Corporate Cultural Showcases', 'Educational Masterclasses']
    }
  }
];
