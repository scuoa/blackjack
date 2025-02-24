let streak = 0;
let playerHand, dealerCard;

// Statistics tracking
let totalAttempts = 0;
let totalCorrect = 0;
const categorizedStats = {};

// Initialize categorized stats
for (const handType in basicStrategy) {
    categorizedStats[handType] = { correct: 0, total: 0 };
}

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

function getRandomCard() {
    const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
    return cards[Math.floor(Math.random() * cards.length)];
}

function getRandomSuit() {
    return suits[Math.floor(Math.random() * suits.length)];
}

function getCardImageUrl(card, suit) {
    const cardMap = {
        'J': 'jack',
        'Q': 'queen',
        'K': 'king',
        'A': 'ace',
        '10': '10',
        '9': '9',
        '8': '8',
        '7': '7',
        '6': '6',
        '5': '5',
        '4': '4',
        '3': '3',
        '2': '2'
    };
    const cardName = cardMap[card];
    return `https://www.tekeye.uk/playing_cards/images/svg_playing_cards/fronts/${suit}_${cardName}.svg`;
}

function categorizeHand(card1, card2) {
    // Convert J, Q, K to 10
    const getCardValue = (card) => {
        if (card === 'J' || card === 'Q' || card === 'K') return 10;
        if (card === 'A') return 11;
        return card; // Numeric cards (2-10)
    };

    // Check for Blackjack (A + 10-value card)
    const isBlackjack = (card1 === 'A' && getCardValue(card2) === 10) || 
                        (card2 === 'A' && getCardValue(card1) === 10);

    // If Blackjack, return null to indicate regeneration is needed
    if (isBlackjack) {
        return null;
    }

    // Check for pairs
    if (card1 === card2) return `pair_${card1}`;

    // Calculate total value
    const value1 = getCardValue(card1);
    const value2 = getCardValue(card2);
    const total = value1 + value2;

    // Determine hand type
    if ((card1 === 'A' || card2 === 'A')) {
        return `soft_${total}`;
    } else {
        return `hard_${total}`;
    }
}

function categorizeDealerHand(dealerCard) {
    if (dealerCard === 'J' || dealerCard === 'Q' || dealerCard === 'K') return 10;
    else return dealerCard;
}

function generateHand() {
    let card1, card2, dealerCard;
    let playerHand;

    do {
        card1 = getRandomCard();
        card2 = getRandomCard();
        dealerCard = getRandomCard();
        playerHand = categorizeHand(card1, card2);
    } while (playerHand === null); 

    console.log(`Generated Hand: ${playerHand}, Dealer: ${dealerCard}`); // Debugging Log

    const suit1 = getRandomSuit();
    const suit2 = getRandomSuit();
    const dealerSuit = getRandomSuit();

    window.playerHand = playerHand;
    window.dealerHand = categorizeDealerHand(dealerCard);

    const dealerCardImage = document.getElementById('dealer-card-image');
    const playerCard1Image = document.getElementById('player-card1-image');
    const playerCard2Image = document.getElementById('player-card2-image');

    if (!dealerCardImage || !playerCard1Image || !playerCard2Image) {
        console.error("One or more image elements not found!");
        return;
    }

    const timestamp = new Date().getTime();
    dealerCardImage.src = `${getCardImageUrl(dealerCard, dealerSuit)}?t=${timestamp}`;
    playerCard1Image.src = `${getCardImageUrl(card1, suit1)}?t=${timestamp}`;
    playerCard2Image.src = `${getCardImageUrl(card2, suit2)}?t=${timestamp}`;

    //document.getElementById('hand-type').innerText = `Hand Type: ${playerHand}`;
    document.getElementById('split-button').disabled = !playerHand.startsWith('pair_');
}


function makeDecision(choice) {
    if (!window.playerHand || !window.dealerHand) {
        console.error("playerHand or dealerHand is not defined!");
        return;
    }

    const correctAnswer = basicStrategy[window.playerHand][window.dealerHand];
    totalAttempts++;
    categorizedStats[window.playerHand].total++;

    if (correctAnswer === choice) {
        document.getElementById('result').innerHTML = '<span class="correct">✔ Correct!</span>';
        streak++;
        totalCorrect++;
        categorizedStats[window.playerHand].correct++;
    } else {
        document.getElementById('result').innerHTML = `<span class="fail">✘ Fail (Correct: ${correctAnswer})</span>`;
        streak = 0;
    }

    document.getElementById('streak').innerText = streak;
    document.getElementById('total-played').innerText = totalAttempts;
    updateStatistics();

    setTimeout(() => {
        console.log("Regenerating hand...");
        generateHand();
    }, 100); // Slight delay to ensure updates
}


function updateStatistics() {
    const overallCorrectPercentage = ((totalCorrect / totalAttempts) * 100).toFixed(2);
    document.getElementById('overall-correct').innerText = `${overallCorrectPercentage}%`;

    const tableBody = document.querySelector('#stats-table tbody');
    if (!tableBody) {
        console.error("Stats table body not found!");
        return;
    }

    tableBody.innerHTML = ''; 
    for (const handType in categorizedStats) {
        const { correct, total } = categorizedStats[handType];
        const accuracy = total === 0 ? '0.00%' : `${((correct / total) * 100).toFixed(2)}%`;
        tableBody.innerHTML += `
            <tr>
                <td>${handType}</td>
                <td>${correct}</td>
                <td>${total}</td>
                <td>${accuracy}</td>
            </tr>
        `;
    }
    console.log("Updated statistics successfully");
}


function toggleDetailedStats() {
    const detailedStats = document.getElementById('detailed-stats');
    const isMobile = window.innerWidth <= 768;

    // If mobile, move detailed stats below game
    if (isMobile) {
        document.body.appendChild(detailedStats);
    } else {
        document.querySelector('.left-panel').appendChild(detailedStats);
    }

    // Toggle visibility
    if (detailedStats.style.display === 'none' || detailedStats.style.display === '') {
        detailedStats.style.display = 'block';
        if (isMobile) {
            window.scrollTo({ top: detailedStats.offsetTop, behavior: 'smooth' });
        }
    } else {
        detailedStats.style.display = 'none';
    }
}


document.getElementById('strategy-button').addEventListener('click', () => {
    const chart = document.getElementById('strategy-chart');
    const overlay = document.getElementById('overlay');

    if (chart.style.display === 'none' || chart.style.display === '') {
        chart.style.display = 'block';
        overlay.style.display = 'block';
    } else {
        chart.style.display = 'none';
        overlay.style.display = 'none';
    }
});

// Close when clicking outside
document.getElementById('overlay').addEventListener('click', () => {
    document.getElementById('strategy-chart').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
});


generateHand();