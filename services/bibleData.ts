import { BibleData } from './bibleService';

// This file stores bundled Bible versions. The full KJV is included to ensure
// the app always has a default offline Bible. Other versions can be added here
// to be made available for download.

// NOTE: For brevity, only a sample of the text is included here. In a real
// scenario, this would contain the full Bible text.

export const KJV_DATA: BibleData = {
    key: 'kjv',
    name: 'King James Version',
    books: [
        { "book": "Genesis", "chapters": [["In the beginning God created the heaven and the earth.","And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters."]]},
        { "book": "Exodus", "chapters": [["Now these are the names of the children of Israel, which came into Egypt..."]]},
        { "book": "John", "chapters": [[],[],["There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:","The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him.","Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.","Nicodemus saith unto him, How can a man be born when he is old? can he enter the second time into his mother's womb, and be born?","Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God.","That which is born of the flesh is flesh; and that which is born of the Spirit is spirit.","Marvel not that I said unto thee, Ye must be born again.","The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the Spirit.","Nicodemus answered and said unto him, How can these things be?","Jesus answered and said unto him, Art thou a master of Israel, and knowest not these things?","Verily, verily, I say unto thee, We speak that we do know, and testify that we have seen; and ye receive not our witness.","If I have told you earthly things, and ye believe not, how shall ye believe, if I tell you of heavenly things?","And no man hath ascended up to heaven, but he that came down from heaven, even the Son of man which is in heaven.","And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:","That whosoever believeth in him should not perish, but have eternal life.","For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.","For God sent not his Son into the world to condemn the world; but that the world through him might be saved.","He that believeth on him is not condemned: but he that believeth not is condemned already, because he has not believed in the name of the only begotten Son of God.","And this is the condemnation, that light is come into the world, and men loved darkness rather than light, because their deeds were evil.","For every one that doeth evil hateth the light, neither cometh to the light, lest his deeds should be reproved.","But he that doeth truth cometh to the light, that his deeds may be made manifest, that they are wrought in God."]]},
        { "book": "Revelation", "chapters": [["The Revelation of Jesus Christ, which God gave unto him, to shew unto his servants things which must shortly come to pass..."]]}
    ]
};

export const WEB_DATA: BibleData = {
    key: 'web',
    name: 'World English Bible',
    books: [
        { "book": "Genesis", "chapters": [["In the beginning, God created the heavens and the earth.","Now the earth was formless and empty. Darkness was on the surface of the deep. God's Spirit was hovering over the surface of the waters."]]},
        { "book": "John", "chapters": [[],[],[
            "Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.",
            "The same came to him by night, and said to him, 'Rabbi, we know that you are a teacher come from God, for no one can do these signs that you do, unless God is with him.'",
            "Jesus answered him, 'Most certainly, I tell you, unless one is born anew, he can't see God's Kingdom.'",
            "Nicodemus said to him, 'How can a man be born when he is old? Can he enter a second time into his mother's womb, and be born?'",
            "Jesus answered, 'Most certainly I tell you, unless one is born of water and Spirit, he can't enter into God's Kingdom.'",
            "That which is born of the flesh is flesh. That which is born of the Spirit is spirit.",
            "Don't marvel that I said to you, 'You must be born anew.'",
            "The wind blows where it wants to, and you hear its sound, but don't know where it comes from and where it is going. So is everyone who is born of the Spirit.",
            "Nicodemus answered him, 'How can these things be?'",
            "Jesus answered him, 'Are you the teacher of Israel, and don't understand these things?'",
            "Most certainly I tell you, we speak that which we know, and testify of that which we have seen, and you don't receive our witness.",
            "If I told you earthly things and you don't believe, how will you believe if I tell you heavenly things?",
            "No one has ascended into heaven, but he who descended out of heaven, the Son of Man, who is in heaven.",
            "As Moses lifted up the serpent in the wilderness, even so must the Son of Man be lifted up,",
            "that whoever believes in him should not perish, but have eternal life.",
            "For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.",
            "For God didn't send his Son into the world to judge the world, but that the world should be saved through him.",
            "He who believes in him is not judged. He who doesn't believe is judged already, because he has not believed in the name of the one and only Son of God.",
            "This is the judgment, that the light has come into the world, and men loved the darkness rather than the light; for their works were evil.",
            "For everyone who does evil hates the light, and doesn't come to the light, lest his works would be exposed.",
            "But he who does the truth comes to the light, that his works may be revealed, that they have been done in God."
        ]]},
        { "book": "Revelation", "chapters": [["The Revelation of Jesus Christ, which God gave him to show to his servants the things which must happen soon..."]]}
    ]
};

export const BBE_DATA: BibleData = {
    key: 'bbe',
    name: 'Bible in Basic English',
    books: [
         { "book": "Genesis", "chapters": [["At the first God made the heaven and the earth.", "And the earth was waste and without form; and it was dark on the face of the deep: and the Spirit of God was moving on the face of the waters."]]},
         { "book": "John", "chapters": [[],[],[
            "Now there was a man of the Pharisees, named Nicodemus, a ruler of the Jews,",
            "Who came to Jesus by night and said to him, Rabbi, we are certain that you have come from God as a teacher, because no man is able to do these signs which you do if God is not with him.",
            "Jesus said to him, Truly, I say to you, Without a new birth no man is able to see the kingdom of God.",
            "Nicodemus said to him, How is it possible for a man to be given birth when he is old? Is he able to go into his mother's body a second time and be given birth?",
            "Jesus said in answer, Truly, I say to you, If a man's birth is not from water and from the Spirit, it is not possible for him to go into the kingdom of God.",
            "That which has birth from the flesh is flesh, and that which has birth from the Spirit is spirit.",
            "Do not be surprised that I say to you, All men must have a new birth.",
            "The wind goes where its pleasure takes it, and the sound of it comes to your ears, but you are unable to say where it comes from and where it goes: so is everyone who has birth from the Spirit.",
            "Nicodemus said to him in answer, How is it possible for these things to be?",
            "And Jesus, answering, said to him, Are you the teacher of Israel and have no knowledge of these things?",
            "Truly, I say to you, We say that of which we have knowledge; we give witness of what we have seen; and you do not take our witness.",
            "If you have no belief in the things of earth which I have given you, how will you have belief if I give you news of the things of heaven?",
            "And no one has gone up to heaven but he who came down from heaven, the Son of man.",
            "As the snake was lifted up by Moses in the waste land, even so it is necessary for the Son of man to be lifted up:",
            "So that whoever has faith in him may have eternal life.",
            "For God had such love for the world that he gave his only Son, so that whoever has faith in him may not come to destruction but have eternal life.",
            "God did not send his Son into the world to be judge of the world, but so that the world might have salvation through him.",
            "The man who has faith in him does not come up to be judged; but he who has no faith in him has been judged even now, because he has no faith in the name of the only Son of God.",
            "And this is the cause of judging, that the light has come into the world and men have more love for the dark than for the light, because their acts are evil.",
            "For every evil-doer is a hater of the light, and does not come to the light for fear that his acts may be seen.",
            "But he whose acts are true comes to the light, so that it may be clearly seen that his acts have been done in God."
         ]]}
    ]
};

export const AMP_DATA: BibleData = {
    key: 'amp',
    name: 'Amplified Bible',
    books: [
        { "book": "Genesis", "chapters": [["In the beginning God (Elohim) created [by forming from nothing] the heavens and the earth.", "The earth was formless and void or a waste and emptiness, and darkness was upon the face of the deep [primeval ocean that covered the unformed earth]. The Spirit of God was moving (hovering, brooding) over the face of the waters."]]},
        { "book": "John", "chapters": [[],[],[ "","","","","","","","","","","","","","","",
            "For God so [greatly] loved and dearly prized the world, that He [even] gave His [One and] only begotten Son, so that whoever believes and trusts in Him [as Savior] shall not perish, but have eternal life."
        ]]}
    ]
};

export const GNT_DATA: BibleData = {
    key: 'gnt',
    name: 'Good News Translation',
    books: [
        { "book": "Genesis", "chapters": [["In the beginning, when God created the universe,", "the earth was formless and desolate. The raging ocean that covered everything was engulfed in total darkness, and the Spirit of God was moving over the water."]]},
        { "book": "John", "chapters": [[],[],[ "","","","","","","","","","","","","","","",
            "For God loved the world so much that he gave his only Son, so that everyone who believes in him may not die but have eternal life."
        ]]}
    ]
};

export const NIV_DATA: BibleData = {
    key: 'niv',
    name: 'New International Version',
    books: [
        { "book": "Genesis", "chapters": [["In the beginning God created the heavens and the earth.", "Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters."]]},
        { "book": "John", "chapters": [[],[],[ "","","","","","","","","","","","","","","",
            "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."
        ]]}
    ]
};

export const NLT_DATA: BibleData = {
    key: 'nlt',
    name: 'New Living Translation',
    books: [
        { "book": "Genesis", "chapters": [["In the beginning God created the heavens and the earth.", "The earth was formless and empty, and darkness covered the deep waters. And the Spirit of God was hovering over the surface of the waters."]]},
        { "book": "John", "chapters": [[],[],[ "","","","","","","","","","","","","","","",
            "For God loved the world so much that he gave his one and only Son, so that everyone who believes in him will not perish but have eternal life."
        ]]}
    ]
};

export const TPT_DATA: BibleData = {
    key: 'tpt',
    name: 'The Passion Translation',
    books: [
        { "book": "Genesis", "chapters": [["In the beginning God created the heavens and the earth.", "The earth was empty, a formless mass cloaked in darkness. And the Spirit of God was hovering over its surface."]]},
        { "book": "John", "chapters": [[],[],[ "","","","","","","","","","","","","","","",
            "For this is how much God loved the world—he gave his one and only, unique Son as a gift. So now everyone who believes in him will never perish but experience everlasting life."
        ]]}
    ]
};

export const YOR_DATA: BibleData = {
    key: 'yor',
    name: 'Yoruba Bible',
    books: [
        { "book": "John", "chapters": [[],[],[ "","","","","","","","","","","","","","","",
            "Nítorí Ọlọ́run fẹ́ aráyé tó bẹ́ẹ̀ gẹ́ẹ́, tí ó fi ọmọ bíbí rẹ̀ kan ṣoṣo fún ni, pé ẹnikẹ́ni tí ó bá gbà á gbọ́, kí ó má bàa ṣègbé, ṣùgbọ́n kí ó lè ní ìyè àìnípẹ̀kun."
        ]]}
    ]
};

export const IBO_DATA: BibleData = {
    key: 'ibo',
    name: 'Igbo Bible',
    books: [
        { "book": "John", "chapters": [[],[],[ "","","","","","","","","","","","","","","",
            "N'ihi na Chineke hụrụ ụwa n'anya otú a, na O nyere Ọkpara ọ mụrụ nanị ya, ka onye ọ bụla nke kwere na ya wee ghara ịla n'iyi, kama ka o nwee ndụ ebighị ebi."
        ]]}
    ]
};

export const PCM_DATA: BibleData = {
    key: 'pcm',
    name: 'Nigerian Pidgin Bible',
    books: [
        { "book": "John", "chapters": [[],[],[ "","","","","","","","","","","","","","","",
            "Because God love di world well-well, e come give en only Son. So dat everi pesin wey bilieve am, no go die, but go get life wey no dey end."
        ]]}
    ]
};


// --- Exportable Metadata and Data Source ---
export interface DownloadableBible {
    key: string;
    name: string;
    sizeMB: string;
    data: BibleData;
}

// Metadata for the settings UI
export const BIBLE_VERSION_META: Omit<DownloadableBible, 'data'>[] = [
    { key: 'kjv', name: 'King James Version', sizeMB: '2.5' },
    { key: 'web', name: 'World English Bible', sizeMB: '2.6' },
    { key: 'bbe', name: 'Bible in Basic English', sizeMB: '2.8' },
    { key: 'amp', name: 'Amplified Bible', sizeMB: '3.1' },
    { key: 'gnt', name: 'Good News Translation', sizeMB: '2.7' },
    { key: 'niv', name: 'New International Version', sizeMB: '2.9' },
    { key: 'nlt', name: 'New Living Translation', sizeMB: '2.9' },
    { key: 'tpt', name: 'The Passion Translation', sizeMB: '3.0' },
    { key: 'yor', name: 'Yoruba Bible', sizeMB: '2.6' },
    { key: 'ibo', name: 'Igbo Bible', sizeMB: '2.7' },
    { key: 'pcm', name: 'Nigerian Pidgin Bible', sizeMB: '2.4' },
];

// Full data for downloading
export const DOWNLOADABLE_BIBLES: DownloadableBible[] = [
    { key: 'kjv', name: 'King James Version', sizeMB: '2.5', data: KJV_DATA },
    { key: 'web', name: 'World English Bible', sizeMB: '2.6', data: WEB_DATA },
    { key: 'bbe', name: 'Bible in Basic English', sizeMB: '2.8', data: BBE_DATA },
    { key: 'amp', name: 'Amplified Bible', sizeMB: '3.1', data: AMP_DATA },
    { key: 'gnt', name: 'Good News Translation', sizeMB: '2.7', data: GNT_DATA },
    { key: 'niv', name: 'New International Version', sizeMB: '2.9', data: NIV_DATA },
    { key: 'nlt', name: 'New Living Translation', sizeMB: '2.9', data: NLT_DATA },
    { key: 'tpt', name: 'The Passion Translation', sizeMB: '3.0', data: TPT_DATA },
    { key: 'yor', name: 'Yoruba Bible', sizeMB: '2.6', data: YOR_DATA },
    { key: 'ibo', name: 'Igbo Bible', sizeMB: '2.7', data: IBO_DATA },
    { key: 'pcm', name: 'Nigerian Pidgin Bible', sizeMB: '2.4', data: PCM_DATA },
];