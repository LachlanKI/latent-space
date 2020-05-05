let loadingElements = document.getElementsByClassName('loading');

let globalStatisticsLoaded = false;
let questionStatisticsLoaded = false;
let conversationsLoaded = false;

let loadingAnimationCounter = 0;
let loadingAnimationArray = [
    '┌( °益°)┘',
    'ε=┌( °益°)┘',
    'ε=ε=┌( °益°)┘',
    'ε=ε=ε=┌( °益°)┘',
    'ε=ε=ε=ε=┌( °益°)┘',
    'ε=ε=ε=ε=ε=┌( °益°)┘',
    'ε=ε=ε=ε=ε=ε=┌( °益°)┘',
];

function loadingElementsAnimation() {
    for (let loadingElement of loadingElements) {
        if (loadingElement.classList.contains('global') && globalStatisticsLoaded || loadingElement.classList.contains('questions') && questionStatisticsLoaded || loadingElement.classList.contains('conversations') && conversationsLoaded) {
            loadingElement.innerText = loadingElement.classList.contains('global') ? globalStatisticsLoaded
                                      :loadingElement.classList.contains('questions') ? questionStatisticsLoaded
                                      :loadingElement.classList.contains('conversations') ? conversationsLoaded
                                      : '¿?'
        } else {
            loadingElement.innerText = loadingAnimationArray[loadingAnimationCounter];
        };
    };

    loadingAnimationCounter++;
    loadingAnimationCounter = loadingAnimationCounter === loadingAnimationArray.length ? 0 : loadingAnimationCounter;

    if (globalStatisticsLoaded && questionStatisticsLoaded && conversationsLoaded) {
        window.clearInterval(loadingElementsAnimationSetInterval);
    };
};

let loadingElementsAnimationSetInterval = setInterval(loadingElementsAnimation, 200);

function returnStatElement(name, value) {
    let p = document.createElement('p');
    p.innerHTML = `${name}: <span>${value}</span>`;
    return p;
};

function returnBreak() {
    return document.createElement('br');
}

axios.get('/data-global-stats').then(result => {
    const { success, data } = result.data.result;
    if (!success) {
        globalStatisticsLoaded = 'request failed';
    } else {
        globalStatisticsLoaded = '(๑˃ᴗ˂)ﻭ';
        let globalStatisticsElement = document.getElementById('global-statistics');
        globalStatisticsElement.appendChild(returnStatElement('number of questions answered', data.no_questions_answered));
        globalStatisticsElement.appendChild(returnBreak());
        globalStatisticsElement.appendChild(returnStatElement('positive responses', data.positive_label_count));
        globalStatisticsElement.appendChild(returnStatElement('positive score', data.positive_total_score));
        globalStatisticsElement.appendChild(returnBreak());
        globalStatisticsElement.appendChild(returnStatElement('neutral responses', data.neutral_label_count));
        globalStatisticsElement.appendChild(returnStatElement('neutral score', data.neutral_total_score));
        globalStatisticsElement.appendChild(returnBreak());
        globalStatisticsElement.appendChild(returnStatElement('negative responses', data.negative_label_count));
        globalStatisticsElement.appendChild(returnStatElement('negative score', data.negative_total_score));
    };
});