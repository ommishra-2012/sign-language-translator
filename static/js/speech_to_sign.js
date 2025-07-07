function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = function(event) {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        document.getElementById('output-text').innerText = `You said: ${spokenText}`;

        const cleanedText = spokenText.replace(/[.,!?]/g, '');
        const words = cleanedText.split(/\s+/);

        const signDisplay = document.getElementById('sign-display');
        signDisplay.innerHTML = '';

        const knownPhrases = [
            "any questions", "are you angry", "are you busy", "are you hungry", "be careful", "did you finish homework",
            "do you have money", "do you want something to drink", "do you watch TV", "dont worry", "flower is beautiful",
            "good afternoon", "good morning", "good question", "i am a clerk", "i am fine", "i am sorry", "i am thinking",
            "i am tired", "i go to a theatre", "i had to say something but i forgot", "i like pink colour", "i love to shop",
            "lets go for lunch", "nice to meet you", "open the door", "please call me later", "please wait for sometime",
            "police station", "post office", "shall i help you", "shall we go together tomorrow", "sign language interpreter",
            "sit down", "stand up", "take care", "there was a traffic jam", "what are you doing", "what is the problem",
            "what is today's date", "what is your father do", "what is your mobile number", "what is your name", "whats up",
            "where is the bathroom", "where is the police station", "you are wrong"
        ];

        const knownWords = [
            "address", "ahemdabad", "all", "assam", "august", "banana", "banaras", "banglore", "bridge", "cat", "christmas",
            "church", "clinic", "dasara", "december", "grapes", "hello", "hindu", "hyderabad", "job", "july", "june",
            "karnataka", "kerala", "krishna", "mango", "may", "mile", "mumbai", "nagpur", "pakistan", "pune", "punjab",
            "saturday", "shop", "temple", "thursday", "toilet", "tomato", "tuesday", "usa", "village", "wednesday"
        ];

        let i = 0;
        while (i < words.length) {
            let phraseMatched = false;

            for (let phrase of knownPhrases) {
                const phraseWords = phrase.split(' ');
                const slice = words.slice(i, i + phraseWords.length).join(' ');

                if (slice === phrase) {
                    const lineDiv = document.createElement('div');
                    lineDiv.classList.add('word-line');

                    let img = document.createElement('img');
                    img.src = `/static/converter/signs/${phrase}.gif`;
                    img.alt = phrase;
                    img.classList.add('big-sign-img'); // BIG for phrases
                    lineDiv.appendChild(img);

                    signDisplay.appendChild(lineDiv);
                    i += phraseWords.length;
                    phraseMatched = true;
                    break;
                }
            }

            if (!phraseMatched) {
                const word = words[i];
                const lineDiv = document.createElement('div');
                lineDiv.classList.add('word-line');

                if (knownWords.includes(word)) {
                    let img = document.createElement('img');
                    img.src = `/static/converter/signs/${word}.gif`;
                    img.alt = word;
                    img.classList.add('big-sign-img'); // BIG for known words
                    lineDiv.appendChild(img);
                } else {
                    for (let char of word) {
                        if (char.match(/[a-z]/)) {
                            let img = document.createElement('img');
                            img.src = `/static/converter/signs/letters/${char}.gif`;
                            img.alt = char;
                            img.classList.add('small-sign-img'); // SMALL for letters
                            img.style.width = `${Math.floor(100 / word.length)}%`;
                            lineDiv.appendChild(img);
                        }
                    }
                }

                signDisplay.appendChild(lineDiv);
                i++;
            }
        }
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error', event);
    };
}

// ✅ Make sure you have this!
document.getElementById('mic-btn').addEventListener('click', startListening);
